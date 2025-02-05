import { readdirSync } from "node:fs";
import { join } from "node:path";

import "dotenv/config";

/**
 * Recursively returns all files in the given directory that match the provided filename filter.
 *
 * @param dir - the entry directory
 * @param filter - the filename filter
 * @returns all matching files
 */
export function findFiles(dir: string, filter: (filename: string) => boolean): string[] {
  const files = readdirSync(dir, { withFileTypes: true });
  let testFiles: string[] = [];
  for (const file of files) {
    const fullPath = join(dir, file.name);
    if (file.isDirectory()) {
      testFiles = testFiles.concat(findFiles(fullPath, filter));
    } else if (file.isFile() && filter(file.name)) {
      testFiles.push(fullPath);
    }
  }
  return testFiles;
}

/**
 * Returns an environment variable value for a specified environment variable.
 *
 * @param kind the environment variable
 * @returns the value
 */
export function getEnv(
  kind:
    | "jira-email"
    | "jira-password"
    | "jira-token"
    | "jira-url"
    | "jira-username"
    | "microsoft-teams-webhook-url"
    | "xray-client-id"
    | "xray-client-secret"
    | "xray-url"
): string {
  let value: string | undefined;
  switch (kind) {
    case "jira-email":
      value = process.env.JIRA_EMAIL;
      break;
    case "jira-password":
      value = process.env.JIRA_PASSWORD;
      break;
    case "jira-token":
      value = process.env.JIRA_TOKEN;
      break;
    case "jira-url":
      value = process.env.JIRA_URL;
      break;
    case "jira-username":
      value = process.env.JIRA_USERNAME;
      break;
    case "microsoft-teams-webhook-url":
      value = process.env.MICROSOFT_TEAMS_WEBHOOK_URL;
      break;
    case "xray-client-id":
      value = process.env.XRAY_CLIENT_ID;
      break;
    case "xray-client-secret":
      value = process.env.XRAY_CLIENT_SECRET;
      break;
    case "xray-url":
      value = process.env.XRAY_URL;
      break;
  }
  if (!value) {
    throw new Error(`Environment variable is undefined: ${kind}`);
  }
  return value;
}
