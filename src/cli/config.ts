import type { Source } from "../sources/source.js";
import { TestPlanSourceHandler } from "../sources/xray/xray-test-plan-source-handler.js";
import type { SourceHandler } from "./cli-source-handler.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnySourceHandler = SourceHandler<Source<any, any>, any, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface LookupTable<T> {
  [key: string]: LookupTable<T> | T;
}

export interface ParrotConfiguration {
  sources: LookupTable<AnySourceHandler>;
}

export function getConfiguration(): ParrotConfiguration {
  return parrotConfiguration;
}

export async function configureParrot(
  callback: (config: ParrotConfiguration) => ParrotConfiguration | Promise<ParrotConfiguration>
) {
  parrotConfiguration = await callback(parrotConfiguration);
}

let parrotConfiguration: ParrotConfiguration = {
  sources: {
    ["xray"]: {
      ["test plan"]: new TestPlanSourceHandler(),
    },
  },
};
