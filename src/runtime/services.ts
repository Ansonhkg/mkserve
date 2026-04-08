import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, resolve } from "node:path";
import { appManifest } from "../../app.manifest";
import { structuredError, type BuildInfo } from "../core/app-types";

export const appPaths = {
  appRoot: fileURLToPath(new URL("../../", import.meta.url)),
  httpAssetsDir: fileURLToPath(new URL("../adapters/http/assets/", import.meta.url)),
};

export interface AppRuntime {
  buildInfo: BuildInfo;
  rootDir: string;
  rootName: string;
  requestedPort: number;
  host: string;
  now(): string;
}

export interface CreateAppRuntimeOptions {
  rootDir?: string;
  requestedPort?: number;
  host?: string;
  now?: () => string;
  buildInfo?: Partial<BuildInfo>;
}

export function createAppRuntime(
  options: CreateAppRuntimeOptions = {},
): AppRuntime {
  const rootDir = resolve(options.rootDir ?? process.cwd());
  validateRootDir(rootDir);

  return {
    buildInfo: {
      appKey: options.buildInfo?.appKey ?? appManifest.appKey,
      version: options.buildInfo?.version ?? appManifest.version,
      buildTimestampUtc:
        options.buildInfo?.buildTimestampUtc ?? new Date().toISOString(),
    },
    rootDir,
    rootName: basename(rootDir) || rootDir,
    requestedPort: options.requestedPort ?? appManifest.defaultPort,
    host: options.host ?? "127.0.0.1",
    now: options.now ?? (() => new Date().toISOString()),
  };
}

function validateRootDir(rootDir: string) {
  if (!existsSync(rootDir)) {
    throw structuredError("ROOT_NOT_FOUND", "The requested root directory does not exist.", {
      rootDir,
    });
  }

  if (!statSync(rootDir).isDirectory()) {
    throw structuredError("ROOT_NOT_DIRECTORY", "The requested root path is not a directory.", {
      rootDir,
    });
  }
}
