import { confirm, input, select } from "@inquirer/prompts";
import { Command } from "commander";
import { defaultLoaders } from "cosmiconfig";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { getConfiguration, type LookupTable, type Provider } from "./config.js";

import "dotenv/config";

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

const OPTIONS = PROGRAM.opts<{ configFile?: string; pluginFile?: string }>();

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

const SOURCE_PROVIDER = await descendIntoTable(getConfiguration().sources, {
  message: "Please select your source:",
});
const SOURCE = await SOURCE_PROVIDER.provider(OPTIONS.configFile);

const DRAIN_PROVIDER = await descendIntoTable(getConfiguration().drains, {
  message: "Please select your drain:",
});
const DRAIN = await DRAIN_PROVIDER.provider(OPTIONS.configFile);

if (!OPTIONS.configFile) {
  const confirmation = await confirm({
    message: "Would you like to save your configuration for later use?",
  });
  if (confirmation) {
    const path = await input({
      default: "config.json",
      message: "Please specify the file to write the configuration to:",
    });
    await writeFile(path, JSON.stringify([]));
  }
}

console.log("source", SOURCE);
console.log("drain", DRAIN);

async function descendIntoTable(
  table: LookupTable<Provider<unknown>>,
  config: { message: string }
): Promise<{ provider: Provider<unknown>; selections: string[] }> {
  const keys = Object.keys(table);
  if (keys.length === 0) {
    throw new Error("At least one option must be provided");
  }
  const choice = await select<string>({
    choices: keys,
    message: config.message,
  });
  const value = table[choice];
  if (typeof value === "function") {
    return { provider: value, selections: [choice] };
  } else {
    const result = await descendIntoTable(value, { message: "Please refine your selection:" });
    return { provider: result.provider, selections: [choice, ...result.selections] };
  }
}
