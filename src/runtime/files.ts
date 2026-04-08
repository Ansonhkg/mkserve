import { readdir, readFile, stat } from "node:fs/promises";
import { basename, extname, posix, relative, resolve, sep } from "node:path";
import {
  structuredError,
  type MarkdownCatalog,
  type MarkdownDocument,
  type MarkdownTreeDirectory,
  type MarkdownTreeFile,
  type MarkdownTreeNode,
} from "../core/app-types";

const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown"]);
const IGNORED_DIRECTORY_NAMES = new Set([
  ".git",
  ".idea",
  ".vscode",
  "node_modules",
  "dist",
  "build",
]);

export async function buildMarkdownCatalog(rootDir: string): Promise<MarkdownCatalog> {
  const nodes = await listMarkdownNodes(rootDir, rootDir);
  const files = flattenMarkdownFiles(nodes);

  return {
    rootDir,
    fileCount: files.length,
    defaultDocumentPath: pickDefaultDocumentPath(files),
    nodes,
  };
}

export async function readMarkdownDocument(
  rootDir: string,
  relativePath: string,
): Promise<MarkdownDocument> {
  const safePath = normalizeDocumentPath(relativePath);
  const absolutePath = resolveWithinRoot(rootDir, safePath);

  if (!isMarkdownFilePath(absolutePath)) {
    throw structuredError("DOCUMENT_NOT_MARKDOWN", "The requested file is not a markdown document.", {
      path: relativePath,
    });
  }

  const fileStats = await stat(absolutePath).catch(() => {
    throw structuredError("DOCUMENT_NOT_FOUND", "The requested markdown document does not exist.", {
      path: safePath,
    });
  });

  if (!fileStats.isFile()) {
    throw structuredError("DOCUMENT_NOT_FILE", "The requested markdown path is not a file.", {
      path: safePath,
    });
  }

  const content = await readFile(absolutePath, "utf8");

  return {
    path: safePath,
    name: basename(safePath),
    absolutePath,
    content,
    updatedAt: fileStats.mtime.toISOString(),
  };
}

async function listMarkdownNodes(
  rootDir: string,
  currentDir: string,
): Promise<MarkdownTreeNode[]> {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const directories: MarkdownTreeDirectory[] = [];
  const files: MarkdownTreeFile[] = [];

  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      continue;
    }

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORY_NAMES.has(entry.name)) {
        continue;
      }

      const absolutePath = resolve(currentDir, entry.name);
      const children = await listMarkdownNodes(rootDir, absolutePath);
      if (children.length === 0) {
        continue;
      }

      directories.push({
        kind: "directory",
        name: entry.name,
        path: toRelativePath(rootDir, absolutePath),
        children,
      });
      continue;
    }

    if (!entry.isFile() || !isMarkdownFilePath(entry.name)) {
      continue;
    }

    const absolutePath = resolve(currentDir, entry.name);
    files.push({
      kind: "file",
      name: entry.name,
      path: toRelativePath(rootDir, absolutePath),
    });
  }

  directories.sort(compareDirectories);
  files.sort(compareFiles);
  return [...directories, ...files];
}

function flattenMarkdownFiles(nodes: MarkdownTreeNode[]): MarkdownTreeFile[] {
  const files: MarkdownTreeFile[] = [];
  for (const node of nodes) {
    if (node.kind === "file") {
      files.push(node);
      continue;
    }

    files.push(...flattenMarkdownFiles(node.children));
  }

  return files;
}

function pickDefaultDocumentPath(files: MarkdownTreeFile[]): string | null {
  if (files.length === 0) {
    return null;
  }

  const readme = files.find((file) => /^readme\.(md|markdown)$/i.test(file.name));
  return readme?.path ?? files[0]?.path ?? null;
}

function compareDirectories(a: MarkdownTreeDirectory, b: MarkdownTreeDirectory) {
  return a.name.localeCompare(b.name);
}

function compareFiles(a: MarkdownTreeFile, b: MarkdownTreeFile) {
  const aIsReadme = /^readme\.(md|markdown)$/i.test(a.name);
  const bIsReadme = /^readme\.(md|markdown)$/i.test(b.name);
  if (aIsReadme && !bIsReadme) {
    return -1;
  }
  if (!aIsReadme && bIsReadme) {
    return 1;
  }
  return a.name.localeCompare(b.name);
}

function isMarkdownFilePath(filePath: string) {
  return MARKDOWN_EXTENSIONS.has(extname(filePath).toLowerCase());
}

function normalizeDocumentPath(relativePath: string) {
  const trimmed = (relativePath || "").trim();
  if (!trimmed) {
    throw structuredError("DOCUMENT_PATH_REQUIRED", "A markdown document path is required.");
  }

  const normalized = posix.normalize(trimmed.replace(/\\/g, "/")).replace(/^\/+/, "");
  if (!normalized || normalized === "." || normalized.startsWith("../") || normalized.includes("/../")) {
    throw structuredError("INVALID_DOCUMENT_PATH", "The requested markdown path is invalid.", {
      path: relativePath,
    });
  }

  return normalized;
}

function resolveWithinRoot(rootDir: string, relativePath: string) {
  const absolutePath = resolve(rootDir, relativePath);
  if (absolutePath === rootDir || absolutePath.startsWith(rootDir + sep)) {
    return absolutePath;
  }

  throw structuredError("DOCUMENT_OUTSIDE_ROOT", "The requested markdown path is outside the served root.", {
    path: relativePath,
  });
}

function toRelativePath(rootDir: string, absolutePath: string) {
  return relative(rootDir, absolutePath).split(sep).join("/");
}
