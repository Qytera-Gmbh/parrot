import { XrayClientCloud } from "@qytera/xray-client";
import { Version3Client } from "jira.js";
import { getEnv } from "./util.js";

export const XRAY_CLIENT_CLOUD = new XrayClientCloud({
  credentials: {
    clientId: getEnv("xray-client-id"),
    clientSecret: getEnv("xray-client-secret"),
    path: "/api/v2/authenticate",
  },
  url: "https://xray.cloud.getxray.app",
});

export const JIRA_CLIENT_CLOUD = new Version3Client({
  authentication: {
    basic: { apiToken: getEnv("jira-token"), email: getEnv("jira-email") },
  },
  host: getEnv("jira-url"),
});
