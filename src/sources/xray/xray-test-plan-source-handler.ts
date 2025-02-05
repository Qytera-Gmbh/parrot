import { input, select } from "@inquirer/prompts";
import { XrayClientCloud, XrayClientServer } from "@qytera/xray-client";
import { Version3Client } from "jira.js";
import { getEnv } from "../../../test/util.js";
import type { SourceHandler } from "../../cli/cli-source-handler.js";
import { TestPlanSource } from "./xray-test-plan-source.js";

export interface StoredConfiguration {
  jira: {
    authentication: "basic" | "oauth2" | "pat";
    url: string;
  };
  testPlanKey: string;
  xray: {
    authentication: "basic" | "client-credentials" | "pat";
    kind: "cloud" | "server";
    url: string;
  };
}

export class TestPlanSourceHandler
  implements SourceHandler<TestPlanSource, StoredConfiguration, string>
{
  public async buildSource(): Promise<TestPlanSource> {
    console.log("Welcome to the Node.js CLI tool!");

    const name = await input({
      message: "What is your name?",
    });

    const choice = await select<string>({
      choices: ["Option 1", "Option 2", "Option 3"],
      message: "Choose an option:",
    });

    console.log(`Hello, ${name}! You selected: ${choice}`);
    return await Promise.reject(new Error("Method not implemented."));
  }

  public restoreSource(savedConfiguration: StoredConfiguration): TestPlanSource {
    let jiraCredentials;
    switch (savedConfiguration.jira.authentication) {
      case "basic":
        jiraCredentials = {
          basic: { apiToken: getEnv("jira-token"), email: getEnv("jira-email") },
        };
        break;
      case "oauth2":
        jiraCredentials = { oauth2: { accessToken: getEnv("jira-token") } };
        break;
      case "pat":
        jiraCredentials = { personalAccessToken: getEnv("jira-token") };
        break;
    }
    let xrayCredentials;
    switch (savedConfiguration.xray.authentication) {
      case "basic":
        xrayCredentials = {
          password: getEnv("jira-password"),
          username: getEnv("jira-username"),
        };
        break;
      case "client-credentials":
        xrayCredentials = {
          clientId: getEnv("xray-client-id"),
          clientSecret: getEnv("xray-client-secret"),
        };
        break;
      case "pat":
        xrayCredentials = {
          token: getEnv("jira-token"),
        };
        break;
    }
    let xrayClient;
    switch (savedConfiguration.xray.kind) {
      case "cloud":
        xrayClient = new XrayClientCloud({
          credentials: xrayCredentials,
          url: savedConfiguration.xray.url,
        });
        break;
      case "server":
        xrayClient = new XrayClientServer({
          credentials: xrayCredentials,
          url: savedConfiguration.xray.url,
        });
        break;
    }
    return new TestPlanSource({
      jira: {
        client: new Version3Client({
          authentication: jiraCredentials,
          host: savedConfiguration.jira.url,
        }),
        url: savedConfiguration.jira.url,
      },
      xray: { client: xrayClient },
    });
  }

  public restoreSourceParameters(savedParameters: string): [testPlanKey: string] {
    return [savedParameters];
  }
}
