export const JIRA_AUTHENTICATION = ["basic", "oauth2", "pat"] as const;
export type JiraAuthentication = (typeof JIRA_AUTHENTICATION)[number];

export const XRAY_AUTHENTICATION = ["basic", "client-credentials", "pat"] as const;
export type XrayAuthentication = (typeof XRAY_AUTHENTICATION)[number];
