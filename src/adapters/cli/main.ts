#!/usr/bin/env bun

import { resolve } from "node:path";
import { appManifest } from "../../../app.manifest";
import { createAppRuntime } from "../../runtime/services";
import { startMkserveServer } from "../http/server";

try {
  await main(Bun.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error.";
  console.error(`mkserve failed: ${message}`);
  process.exitCode = 1;
}

async function main(args: string[]) {
  const parsed = parseArgs(args);

  if (parsed.help) {
    printUsage();
    return;
  }

  const runtime = createAppRuntime({
    rootDir: resolve(process.cwd(), parsed.rootDir ?? "."),
    requestedPort: parsed.port,
    host: parsed.host,
  });

  const server = startMkserveServer({
    runtime,
    port: runtime.requestedPort,
    host: runtime.host,
    allowPortFallback: parsed.port === undefined,
  });

  if (runtime.requestedPort === 0) {
    console.log(`mkserve listening on http://${runtime.host}:${server.port}`);
  } else if (server.port !== runtime.requestedPort) {
    console.warn(
      `Port ${runtime.requestedPort} was unavailable. mkserve is using http://${runtime.host}:${server.port} instead.`,
    );
  } else {
    console.log(`mkserve listening on http://${runtime.host}:${server.port}`);
  }

  console.log(`Serving markdown from ${runtime.rootDir}`);
}

function parseArgs(args: string[]) {
  let rootDir: string | undefined;
  let port: number | undefined;
  let host: string | undefined;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];

    if (value === "--help" || value === "help" || value === "-h") {
      help = true;
      continue;
    }

    if (value === "--port") {
      const rawPort = args[index + 1];
      if (!rawPort) {
        throw new Error("Missing value after --port.");
      }
      const parsedPort = Number(rawPort);
      if (!Number.isInteger(parsedPort) || parsedPort < 0 || parsedPort > 65535) {
        throw new Error(`Invalid port \"${rawPort}\".`);
      }
      port = parsedPort;
      index += 1;
      continue;
    }

    if (value === "--host") {
      const rawHost = args[index + 1];
      if (!rawHost) {
        throw new Error("Missing value after --host.");
      }
      host = rawHost;
      index += 1;
      continue;
    }

    if (value.startsWith("--")) {
      throw new Error(`Unknown flag \"${value}\".`);
    }

    if (rootDir) {
      throw new Error("Only one root directory argument is supported.");
    }

    rootDir = value;
  }

  return { help, rootDir, port, host };
}

function printUsage() {
  console.log(
    [
      `${appManifest.title} ${appManifest.version}`,
      "",
      "Usage:",
      "  mkserve [directory] [--port <number>] [--host <hostname>]",
      "",
      "Examples:",
      "  mkserve ./",
      "  mkserve ../docs --port 4000",
      "",
      "Flags:",
      "  --help, -h   Show this help output",
      "  --port       Override the HTTP port",
      "  --host       Override the host binding (default: 127.0.0.1)",
    ].join("\n"),
  );
}
