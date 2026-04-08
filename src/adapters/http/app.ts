import { stat } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { appManifest } from "../../../app.manifest";
import { type StructuredError } from "../../core/app-types";
import { buildMarkdownCatalog, readMarkdownDocument } from "../../runtime/files";
import { appPaths, createAppRuntime, type AppRuntime } from "../../runtime/services";

export interface MkserveHttpHandlerOptions {
  runtime?: AppRuntime;
}

export function createMkserveHttpHandler(
  options: MkserveHttpHandlerOptions = {},
) {
  const runtime = options.runtime ?? createAppRuntime();

  return async function handleMkserveRequest(request: Request) {
    try {
      return await routeMkserveRequest(request, runtime);
    } catch (error) {
      return jsonResponse(
        {
          error: toStructuredError(error),
        },
        statusForError(error),
      );
    }
  };
}

async function routeMkserveRequest(request: Request, runtime: AppRuntime) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (request.method === "GET" && pathname === "/") {
    return fileResponse(join(appPaths.httpAssetsDir, "index.html"), "text/html; charset=utf-8");
  }

  if (request.method === "GET" && pathname === "/assets/app.css") {
    return fileResponse(join(appPaths.httpAssetsDir, "app.css"), "text/css; charset=utf-8");
  }

  if (request.method === "GET" && pathname === "/assets/app.js") {
    return fileResponse(join(appPaths.httpAssetsDir, "app.js"), "text/javascript; charset=utf-8");
  }

  if (request.method === "GET" && pathname === "/assets/icon.svg") {
    return fileResponse(join(appPaths.httpAssetsDir, "icon.svg"), "image/svg+xml");
  }

  if (request.method === "GET" && pathname === "/favicon.ico") {
    return fileResponse(join(appPaths.httpAssetsDir, "icon.svg"), "image/svg+xml");
  }

  if (request.method === "GET" && pathname === "/api/health") {
    return jsonResponse({
      status: "ok",
      appKey: appManifest.appKey,
      version: runtime.buildInfo.version,
      rootDir: runtime.rootDir,
    });
  }

  if (request.method === "GET" && pathname === "/api/app") {
    return jsonResponse({
      app: {
        appKey: appManifest.appKey,
        title: appManifest.title,
        description: appManifest.description,
        version: appManifest.version,
        defaultPort: appManifest.defaultPort,
      },
      runtime: {
        rootDir: runtime.rootDir,
        rootName: runtime.rootName,
        host: runtime.host,
        requestedPort: runtime.requestedPort,
      },
    });
  }

  if (request.method === "GET" && pathname === "/api/tree") {
    const catalog = await buildMarkdownCatalog(runtime.rootDir);
    return jsonResponse(catalog);
  }

  if (request.method === "GET" && pathname === "/api/document") {
    const relativePath = url.searchParams.get("path") ?? "";
    const document = await readMarkdownDocument(runtime.rootDir, relativePath);
    return jsonResponse(document);
  }

  if (request.method === "GET" && pathname.startsWith("/content/")) {
    const relativePath = decodeURIComponent(pathname.slice("/content/".length));
    return rootFileResponse(runtime.rootDir, relativePath);
  }

  return jsonResponse(
    {
      error: {
        code: "NOT_FOUND",
        message: "The requested route does not exist.",
      },
    },
    404,
  );
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function fileResponse(filePath: string, contentType: string) {
  return new Response(Bun.file(filePath), {
    headers: {
      "content-type": contentType,
    },
  });
}

async function rootFileResponse(rootDir: string, relativePath: string) {
  const normalizedPath = normalizeRootRelativePath(relativePath);
  const absolutePath = resolve(rootDir, normalizedPath);

  if (absolutePath !== rootDir && !absolutePath.startsWith(rootDir + sep)) {
    throw {
      code: "DOCUMENT_OUTSIDE_ROOT",
      message: "The requested file is outside the served root.",
      details: { path: relativePath },
    } satisfies StructuredError;
  }

  const fileStats = await stat(absolutePath).catch(() => {
    throw {
      code: "DOCUMENT_NOT_FOUND",
      message: "The requested file does not exist.",
      details: { path: relativePath },
    } satisfies StructuredError;
  });

  if (!fileStats.isFile()) {
    throw {
      code: "DOCUMENT_NOT_FILE",
      message: "The requested path is not a file.",
      details: { path: relativePath },
    } satisfies StructuredError;
  }

  return new Response(Bun.file(absolutePath), {
    headers: {
      "cache-control": "no-store",
    },
  });
}

function normalizeRootRelativePath(relativePath: string) {
  const normalized = (relativePath || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized === ".") {
    throw {
      code: "DOCUMENT_PATH_REQUIRED",
      message: "A file path is required.",
    } satisfies StructuredError;
  }

  const segments = normalized.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    throw {
      code: "INVALID_DOCUMENT_PATH",
      message: "The requested file path is invalid.",
      details: { path: relativePath },
    } satisfies StructuredError;
  }

  return normalized;
}

function statusForError(error: unknown) {
  const structured = isStructuredError(error) ? error : null;
  switch (structured?.code) {
    case "ROOT_NOT_FOUND":
    case "DOCUMENT_NOT_FOUND":
    case "NOT_FOUND":
      return 404;
    case "ROOT_NOT_DIRECTORY":
    case "DOCUMENT_NOT_MARKDOWN":
    case "DOCUMENT_NOT_FILE":
    case "DOCUMENT_PATH_REQUIRED":
    case "INVALID_DOCUMENT_PATH":
    case "DOCUMENT_OUTSIDE_ROOT":
      return 400;
    default:
      return 500;
  }
}

function isStructuredError(error: unknown): error is StructuredError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

function toStructuredError(error: unknown): StructuredError {
  if (isStructuredError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      code: "INTERNAL_ERROR",
      message: error.message,
    };
  }

  return {
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred.",
  };
}
