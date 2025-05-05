export const JIRA_AUTHENTICATION = ["basic", "oauth2", "pat"] as const;
export type JiraAuthentication = (typeof JIRA_AUTHENTICATION)[number];

export const XRAY_AUTHENTICATION = ["basic", "client-credentials", "pat"] as const;
export type XrayAuthentication = (typeof XRAY_AUTHENTICATION)[number];

export const JIRA_API_VERSION = ["version-2", "version-3"] as const;
export type JiraApiVersion = (typeof JIRA_API_VERSION)[number];
