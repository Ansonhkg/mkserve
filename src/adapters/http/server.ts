import { createMkserveHttpHandler } from "./app";
import { createAppRuntime, type AppRuntime } from "../../runtime/services";

export interface StartMkserveServerOptions {
  runtime?: AppRuntime;
  port?: number;
  host?: string;
  allowPortFallback?: boolean;
}

export function startMkserveServer(
  options: StartMkserveServerOptions = {},
) {
  const runtime =
    options.runtime ??
    createAppRuntime({
      rootDir: process.cwd(),
      requestedPort: options.port,
      host: options.host,
    });

  const requestedPort = options.port ?? runtime.requestedPort;
  const hostname = options.host ?? runtime.host;
  const fetch = createMkserveHttpHandler({ runtime });

  try {
    return Bun.serve({
      port: requestedPort,
      hostname,
      fetch,
    });
  } catch (error) {
    if (!options.allowPortFallback || !isAddressInUse(error)) {
      throw error;
    }

    return Bun.serve({
      port: 0,
      hostname,
      fetch,
    });
  }
}

function isAddressInUse(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "EADDRINUSE"
  );
}

if (import.meta.main) {
  const runtime = createAppRuntime({ rootDir: process.cwd() });
  const server = startMkserveServer({
    runtime,
    port: runtime.requestedPort,
    host: runtime.host,
    allowPortFallback: true,
  });

  console.log(`mkserve listening on http://${runtime.host}:${server.port}`);
  console.log(`Serving markdown from ${runtime.rootDir}`);
}
