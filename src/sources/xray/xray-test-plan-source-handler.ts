import { input, select } from "@inquirer/prompts";
import { XrayClientCloud, XrayClientServer } from "@qytera/xray-client";
import { Version2Client, Version3Client } from "jira.js";
import { getEnv } from "../../../test/util.js";
import { SourceHandler } from "../../cli/cli-source-handler.js";
import { TestPlanSource } from "./xray-test-plan-source.js";

interface StoredConfiguration {
  jira: {
    authentication: "basic" | "oauth2" | "pat";
    kind: "version-2" | "version-3";
    url: string;
  };
  xray: {
    authentication: "basic" | "oauth2" | "pat";
    kind: "cloud" | "server";
    url: string;
  };
}

export class TestPlanSourceHandler extends SourceHandler<
  TestPlanSource,
  StoredConfiguration,
  string
> {
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

  public serializeSource(source: TestPlanSource): StoredConfiguration {
    const config = source.getConfiguration();
    return {
      jira: {
        authentication: config.jira.authentication,
        kind: config.jira.client instanceof Version2Client ? "version-2" : "version-3",
        url: config.jira.url,
      },
      xray: {
        authentication: config.xray.authentication,
        kind: config.xray.client instanceof XrayClientCloud ? "cloud" : "server",
        url: config.xray.url,
      },
    };
  }

  public deserializeSource(serializedSource: StoredConfiguration): TestPlanSource {
    let jiraCredentials;
    switch (serializedSource.jira.authentication) {
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
    switch (serializedSource.xray.authentication) {
      case "basic":
        xrayCredentials = {
          password: getEnv("jira-password"),
          username: getEnv("jira-username"),
        };
        break;
      case "oauth2":
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
    let jiraClient;
    switch (serializedSource.jira.kind) {
      case "version-2":
        jiraClient = new Version2Client({
          authentication: jiraCredentials,
          host: serializedSource.jira.url,
        });
        break;
      case "version-3":
        jiraClient = new Version3Client({
          authentication: jiraCredentials,
          host: serializedSource.jira.url,
        });
        break;
    }
    let xrayClient;
    switch (serializedSource.xray.kind) {
      case "cloud":
        xrayClient = new XrayClientCloud({
          credentials: xrayCredentials,
          url: serializedSource.xray.url,
        });
        break;
      case "server":
        xrayClient = new XrayClientServer({
          credentials: xrayCredentials,
          url: serializedSource.xray.url,
        });
        break;
    }
    return new TestPlanSource({
      jira: {
        authentication: serializedSource.jira.authentication,
        client: jiraClient,
        url: serializedSource.jira.url,
      },
      xray: {
        authentication: serializedSource.xray.authentication,
        client: xrayClient,
        url: serializedSource.xray.url,
      },
    });
  }

  public async buildSourceParameters(): Promise<[testPlanKey: string]> {
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

  public serializeSourceParameters(testPlanKey: string): string {
    return testPlanKey;
  }

  public deserializeSourceParameters(serializedParameters: string): [testPlanKey: string] {
    return [serializedParameters];
  }
}
