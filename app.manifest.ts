import pluginJson from "./plugin.json";
import type { AppManifest, PluginMetadata } from "./src/core/app-types";

export const mkservePluginMetadata = pluginJson as PluginMetadata;

export const appManifest: AppManifest = {
  appKey: mkservePluginMetadata.key,
  title: mkservePluginMetadata.title,
  description: mkservePluginMetadata.description,
  version: mkservePluginMetadata.version,
  defaultPort: mkservePluginMetadata.defaultPort,
  environments: mkservePluginMetadata.supports,
  docs: {
    readmePath: "README.md"
  }
};
