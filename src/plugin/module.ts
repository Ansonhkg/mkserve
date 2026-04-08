import { appManifest, mkservePluginMetadata } from "../../app.manifest";
import type { PluginRuntimeModule } from "../core/app-types";

export const mkservePluginModule: PluginRuntimeModule = {
  metadata: mkservePluginMetadata,
  appManifest,
  adapters: {
    cli: {
      entryFile: "src/adapters/cli/main.ts",
    },
    http: {
      kind: "mountable-handler",
    },
  },
};

export default mkservePluginModule;
