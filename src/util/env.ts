type EnvironmentVariable =
  | "jira-email"
  | "jira-password"
  | "jira-token"
  | "jira-url"
  | "jira-username"
  | "microsoft-teams-webhook-url"
  | "xray-client-id"
  | "xray-client-secret"
  | "xray-url";

/**
 * Returns an environment variable value for a specified environment variable. Throws an error if
 * the variable has not been set.
 *
 * @param kind the environment variable
 * @returns the value
 */
export function getEnv(kind: EnvironmentVariable): string;

/**
 * Returns an environment variable value for a specified environment variable.
 *
 * @param kind the environment variable
 * @returns the value or `undefined` if it has not been set
 */
export function getEnv(kind: EnvironmentVariable, throwIfMissing: false): string | undefined;
export function getEnv(kind: EnvironmentVariable, throwIfMissing?: false): string | undefined {
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
  if (throwIfMissing !== false && !value) {
    throw new Error(`Environment variable is undefined: ${kind}`);
  }
  return value;
}
