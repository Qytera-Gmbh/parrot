import { join } from "node:path";
import type { AnyDrainHandler } from "./cli-drain-handler.js";
import type { AnySourceHandler } from "./cli-source-handler.js";

export interface LookupTable<T> {
  [key: string]: LookupTable<T> | T;
}

export interface ParrotConfiguration {
  drains: LookupTable<AnyDrainHandler>;
  sources: LookupTable<AnySourceHandler>;
}

/**
 * Returns the lookup table of source handlers currently registered with Parrot.
 *
 * @returns the lookup table of source handlers
 */
export function getRegisteredSources(): LookupTable<AnySourceHandler> {
  return PARROT_CONFIGURATION.sources;
}

/**
 * Returns the lookup table of drain handlers currently registered with Parrot.
 *
 * @returns the lookup table of drain handlers
 */
export function getRegisteredDrains(): LookupTable<AnyDrainHandler> {
  return PARROT_CONFIGURATION.drains;
}

/**
 * Modifies Parrot's configuration through a callback whose result will be added to the current
 * configuration. The callback's only parameter is the current configuration.
 *
 * @example
 *
 * ```ts
 * await configureParrot((config) => {
 *   return {
 *     sources: {
 *       ["my new top level source"]: new MyNewTopLevelSourceHandler(),
 *       ["some other service"]: {
 *         ["nested source"]: new MyNewNestedSourceHandler()
 *       }
 *     }
 *   };
 * });
 * ```
 *
 * @param callback the callback which returns the new configuration
 */
export async function configureParrot(
  callback: (
    config: ParrotConfiguration
  ) => Partial<ParrotConfiguration> | Promise<Partial<ParrotConfiguration>>
) {
  const newConfiguration = await callback(PARROT_CONFIGURATION);
  PARROT_CONFIGURATION.drains = { ...PARROT_CONFIGURATION.drains, ...newConfiguration.drains };
  PARROT_CONFIGURATION.sources = { ...PARROT_CONFIGURATION.sources, ...newConfiguration.sources };
}

const PARROT_CONFIGURATION: ParrotConfiguration = {
  drains: {},
  sources: {},
};

/**
 * The default plugin config files that come shipped with parrot.
 *
 * Note: we need to use the `.js` extension because the shipped package will contain `.js` files.
 */
export const DEFAULT_PLUGIN_CONFIG_FILES = [
  join(import.meta.dirname, "plugins", "xray", "xray-plugin.js"),
  join(import.meta.dirname, "plugins", "microsoft", "teams", "microsoft-teams-plugin.js"),
  join(import.meta.dirname, "plugins", "stdout", "stdout-plugin.js"),
];
