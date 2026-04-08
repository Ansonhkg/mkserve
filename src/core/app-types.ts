export interface StructuredError {
  code: string;
  message: string;
  details?: unknown;
}

export function structuredError(
  code: string,
  message: string,
  details?: unknown,
): StructuredError {
  return { code, message, details };
}

export interface BuildInfo {
  appKey: string;
  version: string;
  buildTimestampUtc: string;
}

export type PluginSupport = "cli" | "http" | "web" | "desktop";

export interface PluginMetadata {
  key: string;
  title: string;
  description: string;
  version: string;
  defaultPort: number;
  supports: PluginSupport[];
}

export interface AppManifest {
  appKey: string;
  title: string;
  description: string;
  version: string;
  defaultPort: number;
  environments: PluginSupport[];
  docs: {
    readmePath: string;
  };
}

export interface MarkdownTreeFile {
  kind: "file";
  name: string;
  path: string;
}

export interface MarkdownTreeDirectory {
  kind: "directory";
  name: string;
  path: string;
  children: MarkdownTreeNode[];
}

export type MarkdownTreeNode = MarkdownTreeFile | MarkdownTreeDirectory;

export interface MarkdownCatalog {
  rootDir: string;
  fileCount: number;
  defaultDocumentPath: string | null;
  nodes: MarkdownTreeNode[];
}

export interface MarkdownDocument {
  path: string;
  name: string;
  absolutePath: string;
  content: string;
  updatedAt: string;
}

export interface PluginRuntimeModule {
  metadata: PluginMetadata;
  appManifest: AppManifest;
  adapters: {
    cli: {
      entryFile: string;
    };
    http: {
      kind: "mountable-handler";
    };
  };
}
