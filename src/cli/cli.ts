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

console.log("┌──────────────────────────────────────────────────────────────────┐");
console.log("│                                                                  │");
console.log("│                            Parrot CLI                            │");
console.log("│                                                                  │");
console.log("└──────────────────────────────────────────────────────────────────┘");

await main();

// ============================================================================================== //
// We're dealing with parsed configurations of unknown sources/drains. There's no way around any.
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
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
    for (const { configuration } of newSource.inlets) {
      const inletResults = await newSource.source.getTestResults(configuration);
      testResults.push(...inletResults);
    }
  }
  for (const newDrain of newDrains) {
    for (const { configuration } of newDrain.outlets) {
      await newDrain.drain.writeTestResults(testResults, configuration);
    }
  }
}

async function runSerializedConfiguration(configFile: string) {
  const serializedConfig = JSON.parse(
    await readFile(configFile, "utf-8")
  ) as SerializedConfiguration;
  const deserializedSources: DeserializedSource[] = [];
  for (const serializedSource of serializedConfig.sources) {
    deserializedSources.push(await deserializeSource(serializedSource));
  }
  const testResults: TestResult[] = [];
  for (const { inlets, source } of deserializedSources) {
    for (const { configuration } of inlets) {
      testResults.push(...(await source.getTestResults(configuration)));
    }
  }
  const deserializedDrains: DeserializedDrain[] = [];
  for (const serializedDrain of serializedConfig.drains) {
    deserializedDrains.push(await deserializeDrain(serializedDrain));
  }
  for (const { drain, outlets } of deserializedDrains) {
    for (const { configuration } of outlets) {
      await drain.writeTestResults(testResults, configuration);
    }
  }
}

async function getNewSource(): Promise<NewSource> {
  const { handler, selections } = await descendIntoTable(getRegisteredSources(), {
    message: "Please select a source:",
  });
  const source = await handler.buildSource();
  const name = await input({
    message: "Enter a name for the source (e.g. 'my source'):",
  });
  const inlets: NewSource["inlets"] = [];
  do {
    const inletConfiguration = await handler.buildInlet();
    const inletName = await input({
      message: "Enter a name for the inlet (e.g. 'my inlet'):",
    });
    inlets.push({ configuration: inletConfiguration, name: inletName });
  } while (
    await confirm({
      message: "Would you like to add another inlet?",
    })
  );
  return { handler, inlets, name, selections, source };
}

async function getNewDrain(): Promise<NewDrain> {
  const { handler, selections } = await descendIntoTable(getRegisteredDrains(), {
    message: "Please select a drain:",
  });
  const drain = await handler.buildDrain();
  const name = await input({
    message: "Enter a name for the drain (e.g. 'my drain'):",
  });
  const outlets: NewDrain["outlets"] = [];
  do {
    const outletConfiguration = await handler.buildOutlet();
    const outletName = await input({
      message: "Enter a name for the outlet (e.g. 'my outlet'):",
    });
    outlets.push({ configuration: outletConfiguration, name: outletName });
  } while (
    await confirm({
      message: "Would you like to add another outlet?",
    })
  );
  return { drain, handler, name, outlets, selections };
}

async function deserializeSource(serializedSource: SerializedSource): Promise<DeserializedSource> {
  const handler = retrieveFromTable(getRegisteredSources(), serializedSource.selections);
  console.log(`Deserializing source: ${serializedSource.name}`);
  const source = await handler.deserializeSource(serializedSource.configuration);
  const inlets: DeserializedSource["inlets"] = [];
  for (const { configuration, name } of serializedSource.inlets) {
    console.log(`  Deserializing inlet: ${name}`);
    inlets.push({ configuration: await handler.deserializeInlet(configuration), name: name });
  }
  return { inlets, source };
}

async function deserializeDrain(serializedDrain: SerializedDrain): Promise<DeserializedDrain> {
  const handler = retrieveFromTable(getRegisteredDrains(), serializedDrain.selections);
  console.log(`Deserializing drain: ${serializedDrain.name}`);
  const drain = await handler.deserializeDrain(serializedDrain.configuration);
  const outlets: DeserializedDrain["outlets"] = [];
  for (const { configuration, name } of serializedDrain.outlets) {
    console.log(`  Deserializing outlet: ${name}`);
    outlets.push({ configuration: await handler.deserializeOutlet(configuration), name: name });
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
    const serializedInlets: SerializedSource["inlets"] = [];
    for (const { configuration, name } of choice.inlets) {
      serializedInlets.push({
        configuration: await choice.handler.serializeInlet(configuration),
        name: name,
      });
    }
    serializedConfig.sources.push({
      configuration: await choice.handler.serializeSource(choice.source),
      inlets: serializedInlets,
      name: choice.name,
      selections: choice.selections,
    });
  }
  for (const choice of drains) {
    const serializedOutlets: SerializedDrain["outlets"] = [];
    for (const { configuration, name } of choice.outlets) {
      serializedOutlets.push({
        configuration: await choice.handler.serializeOutlet(configuration),
        name: name,
      });
    }
    serializedConfig.drains.push({
      configuration: await choice.handler.serializeDrain(choice.drain),
      name: choice.name,
      outlets: serializedOutlets,
      selections: choice.selections,
    });
  }
  await writeFile(path, JSON.stringify(serializedConfig));
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
  inlets: { configuration: any; name: string }[];
  name: string;
  selections: string[];
  source: Source<any, any>;
}

interface NewDrain {
  drain: Drain<any, any, any>;
  handler: AnyDrainHandler;
  name: string;
  outlets: { configuration: any; name: string }[];
  selections: string[];
}

interface SerializedConfiguration {
  drains: SerializedDrain[];
  sources: SerializedSource[];
}

interface SerializedSource {
  configuration: unknown;
  inlets: { configuration: unknown; name: string }[];
  name: string;
  selections: string[];
}

interface SerializedDrain {
  configuration: unknown;
  name: string;
  outlets: { configuration: unknown; name: string }[];
  selections: string[];
}

type DeserializedSource = Pick<NewSource, "inlets" | "source">;

type DeserializedDrain = Pick<NewDrain, "drain" | "outlets">;
