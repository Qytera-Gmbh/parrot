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
 * Returns an environment variable value for a specified environment variable.
 *
 * @param kind the environment variable
 * @returns the value
 *
 * @throws if the variable is not defined
 */
export function getEnv(kind: EnvironmentVariable): string;

/**
 * Returns an environment variable value for a specified environment variable.
 *
 * @param kind the environment variable
 * @param throwIfUndefined whether to throw an error if the environment variable is undefined
 * @returns the value
 */
export function getEnv(kind: EnvironmentVariable, throwIfUndefined: boolean): string | undefined;
export function getEnv(kind: EnvironmentVariable, throwIfUndefined?: boolean): string | undefined {
  const name = getEnvName(kind);
  const value = process.env[name];
  if (!value && throwIfUndefined !== false) {
    throw new Error(
      [
        `Environment variable is undefined: ${name}`,
        "",
        "Please perform one of the following steps to configure the testing project:",
        `- add environment variable ${name} to your system's environemnt variables`,
        `- create a .env file, append ${name}=<value> to it and pass it to Parrot using --env-file`,
      ].join("\n")
    );
  }
  return value;
}

/**
 * Returns the name of the specified environment variable.
 *
 * @param kind the environment variable
 * @returns its name
 */
function getEnvName(kind: EnvironmentVariable): string {
  switch (kind) {
    case "jira-email":
      return "JIRA_EMAIL";
    case "jira-password":
      return "JIRA_PASSWORD";
    case "jira-token":
      return "JIRA_TOKEN";
    case "jira-url":
      return "JIRA_URL";
    case "jira-username":
      return "JIRA_USERNAME";
    case "microsoft-teams-webhook-url":
      return "MICROSOFT_TEAMS_WEBHOOK_URL";
    case "xray-client-id":
      return "XRAY_CLIENT_ID";
    case "xray-client-secret":
      return "XRAY_CLIENT_SECRET";
    case "xray-url":
      return "XRAY_URL";
  }
}
