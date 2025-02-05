import { readFileSync } from "fs";
import path from "path";
import type { Drain } from "../drains/drain.js";
import type { Source } from "../sources/source.js";
import { TestPlanSourceHandler } from "../sources/xray/xray-test-plan-source-handler.js";
import type { TestPlanSourceOptions } from "../sources/xray/xray-test-plan-source.js";
import { TestPlanSource } from "../sources/xray/xray-test-plan-source.js";

export type Provider<T, C> = (
  config?: C
) => { config: C; provider: T } | Promise<{ config: C; provider: T }>;

export interface LookupTable<T> {
  [key: string]: LookupTable<T> | T;
}

export interface ParrotConfiguration {
  drains: LookupTable<Provider<Drain<unknown>, unknown>>;
  sources: LookupTable<Provider<Source<unknown>, unknown>>;
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
  drains: {},
  sources: {
    ["xray"]: {
      ["test plan"]: async (config?: string) => {
        if (path) {
          return new TestPlanSource(
            JSON.parse(readFileSync(path, "utf-8")) as TestPlanSourceOptions
          );
        }
        return new TestPlanSource(await new TestPlanSourceHandler().parse());
      },
    },
  },
};
