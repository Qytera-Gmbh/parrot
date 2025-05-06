#!/usr/bin/env node

import { confirm, input, select } from "@inquirer/prompts";
import { Command } from "commander";
import { defaultLoaders } from "cosmiconfig";
import { config } from "dotenv";
import { readFile, writeFile } from "node:fs/promises";
import type { Drain } from "../drain.js";
import type { TestResult } from "../models/test-model.js";
import type { Source } from "../source.js";
import {
  DEFAULT_PLUGIN_CONFIG_FILES,
  getRegisteredDrains,
  getRegisteredSources,
  type LookupTable,
} from "./cli-config.js";
import { DrainHandler, type AnyDrainHandler } from "./cli-drain-handler.js";
import type { AnySourceHandler } from "./cli-source-handler.js";
import { SourceHandler } from "./cli-source-handler.js";

console.log("┌──────────────────────────────────────┐");
console.log("│                                      │");
console.log("│              Parrot CLI              │");
console.log("│                                      │");
console.log("└──────────────────────────────────────┘");

await main();

// ============================================================================================== //
// We're dealing with parsed configurations of unknown sources/drains. There's no way around any.
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================================== //

async function main() {
  const options = {
    ["-c, --config-file <config-file>"]: "path to a saved Parrot configuration file",
    ["-e, --env-file <env-file...>"]: "one or more .env files to load environment variables from",
    ["-p, --plugin-file <plugin-file...>"]: "one or more Parrot plugin files to load",
  };
  const program = new Command("parrot");
  for (const [option, description] of Object.entries(options)) {
    program.option(option, description);
  }
  program.parse();
  const { configFile, envFile, pluginFile } = program.opts<ProgramOptions>();
  loadEnvFiles(envFile);
  await loadPluginFiles(pluginFile);
  if (configFile) {
    await runSerializedConfiguration(configFile);
  } else {
    await runNewConfiguration();
  }
}

function loadEnvFiles(envFiles: ProgramOptions["envFile"]) {
  if (envFiles) {
    for (const envFile of envFiles) {
      config({ path: envFile });
    }
  }
}

async function loadPluginFiles(pluginFiles: ProgramOptions["pluginFile"]) {
  const files = [...DEFAULT_PLUGIN_CONFIG_FILES];
  if (pluginFiles) {
    files.push(...pluginFiles);
  }
  for (const pluginFile of files) {
    let loader;
    if (pluginFile.endsWith(".js") || pluginFile.endsWith(".mjs")) {
      loader = defaultLoaders[".js"];
    } else if (pluginFile.endsWith(".ts")) {
      loader = defaultLoaders[".ts"];
    } else {
      throw new Error(`Unsupported plugin file extension: ${pluginFile}`);
    }
    await loader(pluginFile, await readFile(pluginFile, "utf-8"));
  }
}

async function runNewConfiguration() {
  const newSources: NewSource[] = [];
  do {
    const newSource = await getNewSource();
    newSources.push(newSource);
  } while (
    await confirm({
      message: "Would you like to add another source?",
    })
  );
  const newDrains: NewDrain[] = [];
  do {
    const newDrain = await getNewDrain();
    newDrains.push(newDrain);
  } while (
    await confirm({
      message: "Would you like to add another drain?",
    })
  );
  const confirmation = await confirm({
    message: "Would you like to save your configuration?",
  });
  if (confirmation) {
    await serializeConfiguration(newSources, newDrains);
  }
  const testResults: TestResult[] = [];
  for (const newSource of newSources) {
    for (const inlet of newSource.inlets) {
      const inletResults = await newSource.source.getTestResults(inlet);
      testResults.push(...inletResults);
    }
  }
  for (const newDrain of newDrains) {
    for (const outlet of newDrain.outlets) {
      await newDrain.drain.writeTestResults(testResults, outlet);
    }
  }
}

async function runSerializedConfiguration(configFile: string) {
  const serializedConfig = JSON.parse(
    await readFile(configFile, "utf-8")
  ) as SerializedConfiguration;
  const deserializedSources = [];
  for (const serializedSource of serializedConfig.sources) {
    deserializedSources.push(await deserializeSource(serializedSource));
  }
  const testResults: TestResult[] = [];
  for (const { inlets, source } of deserializedSources) {
    for (const inlet of inlets) {
      testResults.push(...(await source.getTestResults(inlet)));
    }
  }
  const deserializedDrains = [];
  for (const serializedDrain of serializedConfig.drains) {
    deserializedDrains.push(await deserializeDrain(serializedDrain));
  }
  for (const { drain, outlets } of deserializedDrains) {
    for (const outlet of outlets) {
      await drain.writeTestResults(testResults, outlet);
    }
  }
}

async function getNewSource(): Promise<NewSource> {
  const { handler, selections } = await descendIntoTable(getRegisteredSources(), {
    message: "Please select a source:",
  });
  const source = await handler.buildSource();
  const inlets = [];
  do {
    inlets.push(await handler.buildInlet());
  } while (
    await confirm({
      message: "Would you like to add another inlet?",
    })
  );
  return { handler, inlets, selections, source };
}

async function getNewDrain(): Promise<NewDrain> {
  const { handler, selections } = await descendIntoTable(getRegisteredDrains(), {
    message: "Please select a drain:",
  });
  const drain = await handler.buildDrain();
  const outlets = [];
  do {
    outlets.push(await handler.buildOutlet());
  } while (
    await confirm({
      message: "Would you like to add another outlet?",
    })
  );
  return { drain, handler, outlets, selections };
}

async function deserializeSource(serializedSource: SerializedSource) {
  const handler = retrieveFromTable(getRegisteredSources(), serializedSource.selections);
  const source = await handler.deserializeSource(serializedSource.configuration);
  const inlets = [];
  for (const inlet of serializedSource.inlets) {
    inlets.push(await handler.deserializeInlet(inlet));
  }
  return { inlets, source };
}

async function deserializeDrain(serializedDrain: SerializedDrain) {
  const handler = retrieveFromTable(getRegisteredDrains(), serializedDrain.selections);
  const drain = await handler.deserializeDrain(serializedDrain.configuration);
  const outlets = [];
  for (const inlet of serializedDrain.outlets) {
    outlets.push(await handler.deserializeOutlet(inlet));
  }
  return { drain, outlets };
}

async function serializeConfiguration(sources: NewSource[], drains: NewDrain[]) {
  const path = await input({
    default: "config.json",
    message: "Please specify the file to write the configuration to:",
  });
  const serializedConfig: SerializedConfiguration = {
    drains: [],
    sources: [],
  };
  for (const choice of sources) {
    const serializedInlets = [];
    for (const inlet of choice.inlets) {
      serializedInlets.push(await choice.handler.serializeInlet(inlet));
    }
    serializedConfig.sources.push({
      configuration: await choice.handler.serializeSource(choice.source),
      inlets: serializedInlets,
      selections: choice.selections,
    });
  }
  for (const choice of drains) {
    const serializedOutlets = [];
    for (const outlet of choice.outlets) {
      serializedOutlets.push(await choice.handler.serializeOutlet(outlet));
    }
    serializedConfig.drains.push({
      configuration: await choice.handler.serializeDrain(choice.drain),
      outlets: serializedOutlets,
      selections: choice.selections,
    });
  }
  await writeFile(path, JSON.stringify(serializedConfig, null, 2));
}

/**
 * Recursively traverses a nested lookup table, prompting the user to make selections until a
 * concrete handler instance is reached.
 *
 * @param table a lookup table containing either handlers or further nested tables
 * @param options configuration for the selection prompts
 *
 * @throws if the specified table has no selectable keys
 */
async function descendIntoTable<HandlerType extends AnyDrainHandler | AnySourceHandler>(
  table: LookupTable<HandlerType>,
  options: { message: string }
): Promise<{
  handler: HandlerType;
  selections: string[];
}> {
  const keys = Object.keys(table);
  if (keys.length === 0) {
    throw new Error("At least one option must be provided");
  }
  const choice = await select<string>({
    choices: keys,
    message: options.message,
  });
  const value = table[choice];
  if (value instanceof SourceHandler || value instanceof DrainHandler) {
    return { handler: value, selections: [choice] };
  } else {
    const result = await descendIntoTable(value, { message: "Please refine your selection:" });
    return { handler: result.handler, selections: [choice, ...result.selections] };
  }
}

/**
 * Retrieves a value from a (nested) lookup table based on a specified chain of keys.
 *
 * @example
 *
 * ```ts
 * const table = {
 *   a: {
 *     b: {
 *       c: new MyCustomHandler()
 *     }
 *   }
 * }
 * const handler = retrieveFromTable(table, ["a", "b", "c"]);
 * // MyCustomHandler
 * ```
 *
 * @param table the lookup table
 * @param keys the keys
 * @returns the (nested) value
 */
function retrieveFromTable<HandlerType extends AnyDrainHandler | AnySourceHandler>(
  table: LookupTable<HandlerType>,
  keys: string[]
): HandlerType {
  let currentTable = table;
  for (let i = 0; i < keys.length; i++) {
    const selection = keys[i];
    if (!(selection in currentTable)) {
      break;
    }
    const value = currentTable[selection];
    if (value instanceof SourceHandler || value instanceof DrainHandler) {
      if (i === keys.length - 1) {
        return value;
      } else {
        break;
      }
    } else {
      currentTable = value;
    }
  }
  throw new Error(`Failed to find a handler registered for selection: ${keys.join(" -> ")}`);
}

interface ProgramOptions {
  configFile?: string;
  envFile?: string[];
  pluginFile?: string[];
}

interface NewSource {
  handler: AnySourceHandler;
  inlets: any[];
  selections: string[];
  source: Source<any, any>;
}

interface NewDrain {
  drain: Drain<any, any, any>;
  handler: AnyDrainHandler;
  outlets: any[];
  selections: string[];
}

interface SerializedConfiguration {
  drains: SerializedDrain[];
  sources: SerializedSource[];
}

interface SerializedSource {
  configuration: unknown;
  inlets: unknown[];
  selections: string[];
}

interface SerializedDrain {
  configuration: unknown;
  outlets: unknown[];
  selections: string[];
}
