import { confirm, input, select } from "@inquirer/prompts";
import { Command } from "commander";
import { defaultLoaders } from "cosmiconfig";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { getRegisteredSources, type LookupTable } from "./cli-config.js";
import type { AnySourceHandler } from "./cli-source-handler.js";
import { SourceHandler } from "./cli-source-handler.js";

import "dotenv/config";

interface ProgramOptions {
  configFile?: string;
  pluginFile?: string;
}

interface SerializedSource {
  parameters: unknown;
  selections: string[];
  source: unknown;
}

const PROGRAM = new Command()
  .option("-p, --plugin-file <plugin-file>", "the parrot plugin file to use", (file) => {
    if (!existsSync(file)) {
      throw new Error(`Plugin file not found: ${file}`);
    }
    return file;
  })
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

PROGRAM.parse();

const OPTIONS = PROGRAM.opts<ProgramOptions>();

if (OPTIONS.pluginFile) {
  let loader;
  if (OPTIONS.pluginFile.endsWith(".js") || OPTIONS.pluginFile.endsWith(".mjs")) {
    loader = defaultLoaders[".js"];
  } else if (OPTIONS.pluginFile.endsWith(".ts")) {
    loader = defaultLoaders[".ts"];
  } else {
    throw new Error(`Unsupported plugin file extension: ${OPTIONS.pluginFile}`);
  }
  await loader(OPTIONS.pluginFile, await readFile(OPTIONS.pluginFile, "utf-8"));
}

const SOURCE = await getSource(OPTIONS);
console.log("Source is now ready to use:", SOURCE);

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
        default: "config.json",
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

async function descendIntoTable(
  table: LookupTable<AnySourceHandler>,
  config: { message: string }
): Promise<{
  handler: AnySourceHandler;
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
  if (value instanceof SourceHandler) {
    return { handler: value, selections: [choice] };
  } else {
    const result = await descendIntoTable(value, { message: "Please refine your selection:" });
    return { handler: result.handler, selections: [choice, ...result.selections] };
  }
}

function retrieveFromTable(
  table: LookupTable<AnySourceHandler>,
  selections: string[]
): AnySourceHandler {
  let currentTable = table;
  for (let i = 0; i < selections.length; i++) {
    const selection = selections[i];
    if (!(selection in currentTable)) {
      break;
    }
    const value = currentTable[selection];
    if (value instanceof SourceHandler) {
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
