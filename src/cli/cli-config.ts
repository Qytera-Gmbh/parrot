import { join } from "node:path";
import type { AnySourceHandler } from "./cli-source-handler.js";

export interface LookupTable<T> {
  [key: string]: LookupTable<T> | T;
}

export interface ParrotConfiguration {
  sources: LookupTable<AnySourceHandler>;
}

/**
 * Returns the lookup table of source handlers currently registered with Pass Parrot.
 *
 * @returns the lookup table of source handlers
 */
export function getRegisteredSources(): LookupTable<AnySourceHandler> {
  return parrotConfiguration.sources;
}

/**
 * Modifies Pass Parrot's configuration through a callback whose result will replace the current
 * configuration. The callback's only parameter is the current configuration.
 *
 * @example
 *
 * ```ts
 * await configureParrot((config) => {
 *   return {
 *     sources: {
 *       ...config.sources,
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
  callback: (config: ParrotConfiguration) => ParrotConfiguration | Promise<ParrotConfiguration>
) {
  parrotConfiguration = await callback(parrotConfiguration);
}

let parrotConfiguration: ParrotConfiguration = {
  sources: {},
};

/**
 * The default plugin config files that come shipped with parrot.
 *
 * Note: we need to use the `.js` extension because the shipped package will contain `.js` files.
 */
export const DEFAULT_PLUGIN_CONFIG_FILES = [join(import.meta.dirname, "plugins", "xray-plugin.js")];
