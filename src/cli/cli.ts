#!/usr/bin/env node

import { confirm, input, select } from "@inquirer/prompts";
import { Command } from "commander";
import { defaultLoaders } from "cosmiconfig";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import {
  DEFAULT_PLUGIN_CONFIG_FILES,
  getRegisteredDrains,
  getRegisteredSources,
  type LookupTable,
} from "./cli-config.js";
import { DrainHandler, type AnyDrainHandler } from "./cli-drain-handler.js";
import type { AnySourceHandler } from "./cli-source-handler.js";
import { SourceHandler } from "./cli-source-handler.js";

import "dotenv/config";

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
  const program = new Command()
    .option("-p, --plugin-files <plugin-file...>", "the parrot plugin files to use")
    .option(
      "-c, --config-file <config-file>",
      "the saved source and drain configuration to use",
      (file) => {
        if (!existsSync(file)) {
          throw new Error(`Configuration file not found: ${file}`);
        }
        return file;
      }
    );
  program.parse();
  const options = program.opts<ProgramOptions>();
  await loadPluginFiles(options.pluginFiles);
  const source = await getSource(options);
  console.log("Source is now ready to use:", source);
  const drain = await getDrain(options);
  console.log("Drain is now ready to use:", drain);
  const testResults = await source.source.getTestResults(source.parameters);
  await drain.drain.writeTestResults(testResults, drain.parameters);
}

async function loadPluginFiles(pluginFiles: ProgramOptions["pluginFiles"]) {
  // Make sure to always load the plugin files that come shipped with parrot.
  const files = [...DEFAULT_PLUGIN_CONFIG_FILES, ...(pluginFiles ?? [])];
  let loader;
  for (const pluginFile of files) {
    if (!existsSync(pluginFile)) {
      throw new Error(`Plugin file not found: ${pluginFile}`);
    }
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

async function getSource(options: ProgramOptions) {
  if (!options.configFile) {
    const result = await descendIntoTable(getRegisteredSources(), {
      message: "Please select your source:",
    });
    const source = await result.handler.buildSource();
    const parameters = await result.handler.buildSourceParameters();
    const confirmation = await confirm({
      message: "Would you like to save your configuration for later use?",
    });
    if (confirmation) {
      const path = await input({
        default: "source-config.json",
        message: "Please specify the file to write the configuration to:",
      });
      const serializedSource: SerializedSource = {
        parameters: await result.handler.serializeSourceParameters(parameters),
        selections: result.selections,
        source: await result.handler.serializeSource(source),
      };
      await writeFile(path, JSON.stringify(serializedSource, null, 2));
    }
    return { parameters, source };
  } else {
    const serializedSource = JSON.parse(
      await readFile(options.configFile, "utf-8")
    ) as SerializedSource;
    const handler = retrieveFromTable(getRegisteredSources(), serializedSource.selections);
    const source = await handler.deserializeSource(serializedSource.source);
    const parameters = await handler.deserializeSourceParameters(serializedSource.parameters);
    return { parameters, source };
  }
}

async function getDrain(options: ProgramOptions) {
  if (!options.configFile) {
    const result = await descendIntoTable(getRegisteredDrains(), {
      message: "Please select your drain:",
    });
    const drain = await result.handler.buildDrain();
    const parameters = await result.handler.buildDrainParameters();
    const confirmation = await confirm({
      message: "Would you like to save your configuration for later use?",
    });
    if (confirmation) {
      const path = await input({
        default: "drain-config.json",
        message: "Please specify the file to write the configuration to:",
      });
      const serializedDrain: SerializedDrain = {
        drain: await result.handler.serializeDrain(drain),
        parameters: await result.handler.serializeDrainParameters(parameters),
        selections: result.selections,
      };
      await writeFile(path, JSON.stringify(serializedDrain, null, 2));
    }
    return { drain, parameters };
  } else {
    const serializedDrain = JSON.parse(
      await readFile(options.configFile, "utf-8")
    ) as SerializedDrain;
    const handler = retrieveFromTable(getRegisteredDrains(), serializedDrain.selections);
    const drain = await handler.deserializeDrain(serializedDrain.drain);
    const parameters = await handler.deserializeDrainParameters(serializedDrain.parameters);
    return { drain, parameters };
  }
}

async function descendIntoTable<HandlerType extends AnyDrainHandler | AnySourceHandler>(
  table: LookupTable<HandlerType>,
  config: { message: string }
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
    message: config.message,
  });
  const value = table[choice];
  if (value instanceof SourceHandler || value instanceof DrainHandler) {
    return { handler: value, selections: [choice] };
  } else {
    const result = await descendIntoTable(value, { message: "Please refine your selection:" });
    return { handler: result.handler, selections: [choice, ...result.selections] };
  }
}

function retrieveFromTable<HandlerType extends AnyDrainHandler | AnySourceHandler>(
  table: LookupTable<HandlerType>,
  selections: string[]
): HandlerType {
  let currentTable = table;
  for (let i = 0; i < selections.length; i++) {
    const selection = selections[i];
    if (!(selection in currentTable)) {
      break;
    }
    const value = currentTable[selection];
    if (value instanceof SourceHandler || value instanceof DrainHandler) {
      if (i === selections.length - 1) {
        return value;
      } else {
        break;
      }
    } else {
      currentTable = value;
    }
  }
  throw new Error(`failed to find a handler registered for selection: ${selections.join(" -> ")}`);
}

interface ProgramOptions {
  configFile?: string;
  pluginFiles?: string[];
}

interface SerializedSource {
  parameters: unknown;
  selections: string[];
  source: unknown;
}

interface SerializedDrain {
  drain: unknown;
  parameters: unknown;
  selections: string[];
}
