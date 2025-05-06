#!/usr/bin/env node

import { confirm, input, select } from "@inquirer/prompts";
import { Command } from "commander";
import { defaultLoaders } from "cosmiconfig";
import { config } from "dotenv";
import { readFile, writeFile } from "node:fs/promises";
import type { TestResult } from "../models/test-model.js";
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
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// ============================================================================================== //

async function main() {
  const options = {
    ["-d, --drain-file <drain-file>"]: "path to a saved drain configuration file",
    ["-e, --env-file <env-file...>"]: "one or more .env files to load environment variables from",
    ["-p, --plugin-file <plugin-file...>"]: "one or more Parrot plugin files to load",
    ["-s, --source-file <source-file>"]: "path to a saved source configuration file",
  };
  const program = new Command("parrot");
  for (const [option, description] of Object.entries(options)) {
    program.option(option, description);
  }
  program.parse();
  const { drainFile, envFile, pluginFile, sourceFile } = program.opts<ProgramOptions>();
  loadEnvFiles(envFile);
  await loadPluginFiles(pluginFile);
  const { inlets, source } = await getSource(sourceFile);
  const { drain, outlets } = await getDrain(drainFile);
  const testResults: TestResult[] = [];
  for (const inlet of inlets) {
    testResults.push(...(await source.getTestResults(inlet)));
  }
  for (const outlet of outlets) {
    await drain.writeTestResults(testResults, outlet);
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

async function getSource(sourceFile?: string) {
  if (sourceFile) {
    const serializedSource = JSON.parse(await readFile(sourceFile, "utf-8")) as SerializedSource;
    const handler = retrieveFromTable(getRegisteredSources(), serializedSource.selections);
    const source = await handler.deserializeSource(serializedSource.configuration);
    const inlets = [];
    for (const inlet of serializedSource.inlets) {
      inlets.push(await handler.deserializeInlet(inlet));
    }
    return { inlets, source };
  } else {
    const result = await descendIntoTable(getRegisteredSources(), {
      message: "Please select your source:",
    });
    const source = await result.handler.buildSource();
    const inlets = [];
    for (
      let hasMoreInlets = true;
      hasMoreInlets;
      hasMoreInlets = await confirm({
        message: "Would you like to add another inlet?",
      })
    ) {
      const inlet = await result.handler.buildInlet();
      inlets.push(inlet);
    }
    const confirmation = await confirm({
      message: "Would you like to save your source configuration?",
    });
    if (confirmation) {
      const path = await input({
        default: "source-config.json",
        message: "Please specify the file to write the configuration to:",
      });
      const serializedInlets = [];
      for (const inlet of inlets) {
        serializedInlets.push(await result.handler.serializeInlet(inlet));
      }
      const serializedSource: SerializedSource = {
        configuration: await result.handler.serializeSource(source),
        inlets: serializedInlets,
        selections: result.selections,
      };
      await writeFile(path, JSON.stringify(serializedSource, null, 2));
    }
    return { inlets, source };
  }
}

async function getDrain(drainFile?: string) {
  if (drainFile) {
    const serializedDrain = JSON.parse(await readFile(drainFile, "utf-8")) as SerializedDrain;
    const handler = retrieveFromTable(getRegisteredDrains(), serializedDrain.selections);
    const drain = await handler.deserializeDrain(serializedDrain.configuration);
    const outlets = [];
    for (const inlet of serializedDrain.outlets) {
      outlets.push(await handler.deserializeOutlet(inlet));
    }
    return { drain, outlets };
  } else {
    const result = await descendIntoTable(getRegisteredDrains(), {
      message: "Please select your drain:",
    });
    const drain = await result.handler.buildDrain();
    const outlets = [];
    for (
      let hasMoreOutlets = true;
      hasMoreOutlets;
      hasMoreOutlets = await confirm({
        message: "Would you like to add another outlet?",
      })
    ) {
      const outlet = await result.handler.buildOutlet();
      outlets.push(outlet);
    }
    const confirmation = await confirm({
      message: "Would you like to save your drain configuration?",
    });
    if (confirmation) {
      const path = await input({
        default: "drain-config.json",
        message: "Please specify the file to write the configuration to:",
      });
      const serializedOutlets = [];
      for (const outlet of outlets) {
        serializedOutlets.push(await result.handler.serializeOutlet(outlet));
      }
      const serializedDrain: SerializedDrain = {
        configuration: await result.handler.serializeDrain(drain),
        outlets: serializedOutlets,
        selections: result.selections,
      };
      await writeFile(path, JSON.stringify(serializedDrain, null, 2));
    }
    return { drain, outlets };
  }
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
  drainFile?: string;
  envFile?: string[];
  pluginFile?: string[];
  sourceFile?: string;
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
