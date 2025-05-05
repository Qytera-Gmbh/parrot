import { XrayTestPlanSourceHandler } from "../sources/xray/test-plan/xray-test-plan-source-handler.js";
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
 * @param callback the callback which returns the new configuration
 */
export async function configureParrot(
  callback: (config: ParrotConfiguration) => ParrotConfiguration | Promise<ParrotConfiguration>
) {
  parrotConfiguration = await callback(parrotConfiguration);
}

let parrotConfiguration: ParrotConfiguration = {
  sources: {
    ["xray"]: {
      ["test plan"]: new XrayTestPlanSourceHandler(),
    },
  },
};
