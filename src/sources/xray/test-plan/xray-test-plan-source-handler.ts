import { input, password, select } from "@inquirer/prompts";
import { XrayClientCloud, XrayClientServer } from "@qytera/xray-client";
import { Version2Client, Version3Client } from "jira.js";
import { SourceHandler } from "../../../cli/cli-source-handler.js";
import { getEnv } from "../../../util/env.js";
import { XrayTestPlanCloudSource } from "./xray-test-plan-cloud-source.js";
import { XrayTestPlanServerSource } from "./xray-test-plan-server-source.js";
import type { JiraAuthentication, XrayAuthentication } from "./xray-test-plan-source.js";
import { JIRA_AUTHENTICATION, XRAY_AUTHENTICATION } from "./xray-test-plan-source.js";

const JIRA_API_VERSION = ["version-2", "version-3"] as const;
type JiraApiVersion = (typeof JIRA_API_VERSION)[number];

interface StoredConfiguration {
  jira: {
    authentication: JiraAuthentication;
    kind: JiraApiVersion;
    url: string;
  };
  xray: {
    authentication: XrayAuthentication;
    kind: "cloud" | "server";
    url: string;
  };
}

export class XrayTestPlanSourceHandler extends SourceHandler<
  XrayTestPlanCloudSource | XrayTestPlanServerSource,
  StoredConfiguration,
  string
> {
  public async buildSource(): Promise<XrayTestPlanCloudSource | XrayTestPlanServerSource> {
    const serverOrCloud = await select<"cloud" | "server">({
      choices: ["server", "cloud"],
      message: "Are you using Jira/Xray Server/DC or Cloud?",
    });
    const isServer = serverOrCloud === "server";
    const jiraUrl =
      getEnv("jira-url", false) ??
      (await input({
        message: `What is the base URL of your Jira instance (e.g. ${isServer ? "https://example-jira.com" : "https://example.atlassian.net"})?`,
      }));
    const xrayUrl = isServer
      ? jiraUrl
      : await select<string>({
          choices: [
            "https://xray.cloud.getxray.app/",
            "https://us.xray.cloud.getxray.app/",
            "https://eu.xray.cloud.getxray.app/",
            "https://au.xray.cloud.getxray.app/",
          ],
          default: "https://xray.cloud.getxray.app",
          message: "Which Xray Cloud URL do you want to use?",
        });
    const jiraVersionChoice = await select<JiraApiVersion>({
      choices: JIRA_API_VERSION,
      default: JIRA_API_VERSION[1],
      message: "Which version of the Jira API do you want to use?",
    });
    const jiraAuthenticationChoice = await select<JiraAuthentication>({
      choices: JIRA_AUTHENTICATION,
      message: "How do you want to authenticate to the Jira API?",
    });
    let jiraAuthentication;
    switch (jiraAuthenticationChoice) {
      case "basic":
        if (isServer) {
          jiraAuthentication = {
            basic: {
              password:
                getEnv("jira-password", false) ??
                (await password({
                  message: "Please enter your Jira password:",
                })),
              username:
                getEnv("jira-username", false) ??
                (await input({
                  message: "Please enter your Jira username:",
                })),
            },
          };
        } else {
          jiraAuthentication = {
            basic: {
              apiToken:
                getEnv("jira-token", false) ??
                (await password({
                  message: "Please enter your Jira personal access token:",
                })),
              email:
                getEnv("jira-email", false) ??
                (await input({
                  message: "Please enter your Jira email address:",
                })),
            },
          };
        }
        break;
      case "oauth2":
        jiraAuthentication = {
          oauth2: {
            accessToken:
              getEnv("jira-token", false) ??
              (await password({
                message: "Please enter your Jira personal access token:",
              })),
          },
        };
        break;
      case "pat":
        jiraAuthentication = {
          personalAccessToken:
            getEnv("jira-token", false) ??
            (await password({
              message: "Please enter your Jira personal access token:",
            })),
        };
        break;
    }
    const xrayAuthenticationChoice = await select<XrayAuthentication>({
      choices: XRAY_AUTHENTICATION,
      message: "How do you want to authenticate to the Xray API?",
    });
    let xrayAuthentication;
    switch (xrayAuthenticationChoice) {
      case "basic":
        xrayAuthentication = {
          password:
            getEnv("jira-password", false) ??
            (await password({
              message: "Please enter your Jira password:",
            })),
          username:
            getEnv("jira-username", false) ??
            (await input({
              message: "Please enter your Jira username:",
            })),
        };
        break;
      case "client-credentials":
        xrayAuthentication = {
          clientId:
            getEnv("xray-client-id", false) ??
            (await input({
              message: "Please enter your Xray client ID:",
            })),
          clientSecret:
            getEnv("xray-client-secret", false) ??
            (await password({
              message: "Please enter your Xray client secret:",
            })),
          path: "/api/v2/authenticate" as const,
        };
        break;
      case "pat":
        xrayAuthentication = {
          token:
            getEnv("jira-token", false) ??
            (await password({
              message: "Please enter your Jira personal access token:",
            })),
          username:
            getEnv("jira-username", false) ??
            (await input({
              message: "Please enter your Jira username:",
            })),
        };
        break;
    }
    if (isServer) {
      return new XrayTestPlanServerSource({
        jira: {
          authentication: jiraAuthenticationChoice,
          client:
            jiraVersionChoice === "version-2"
              ? new Version2Client({ authentication: jiraAuthentication, host: jiraUrl })
              : new Version3Client({ authentication: jiraAuthentication, host: jiraUrl }),
          url: jiraUrl,
        },
        xray: {
          authentication: xrayAuthenticationChoice,
          client: new XrayClientServer({ credentials: xrayAuthentication, url: jiraUrl }),
          url: xrayUrl,
        },
      });
    } else {
      return new XrayTestPlanCloudSource({
        jira: {
          authentication: jiraAuthenticationChoice,
          client:
            jiraVersionChoice === "version-2"
              ? new Version2Client({ authentication: jiraAuthentication, host: jiraUrl })
              : new Version3Client({ authentication: jiraAuthentication, host: jiraUrl }),
          url: jiraUrl,
        },
        xray: {
          authentication: xrayAuthenticationChoice,
          client: new XrayClientCloud({ credentials: xrayAuthentication, url: jiraUrl }),
          url: xrayUrl,
        },
      });
    }
  }

  public serializeSource(
    source: XrayTestPlanCloudSource | XrayTestPlanServerSource
  ): StoredConfiguration {
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

  public deserializeSource(
    serializedSource: StoredConfiguration
  ): XrayTestPlanCloudSource | XrayTestPlanServerSource {
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
      case "client-credentials":
        xrayCredentials = {
          clientId: getEnv("xray-client-id"),
          clientSecret: getEnv("xray-client-secret"),
          path: "/api/v2/authenticate" as const,
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
    if (xrayClient instanceof XrayClientCloud) {
      return new XrayTestPlanCloudSource({
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
    } else {
      return new XrayTestPlanServerSource({
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
  }

  public async buildSourceParameters(): Promise<[testPlanKey: string]> {
    const testPlanKey = await input({
      message:
        "Please enter the issue key of the test plan you want to use as the source (e.g. ABC-123):",
    });
    return [testPlanKey];
  }

  public serializeSourceParameters(testPlanKey: string): string {
    return testPlanKey;
  }

  public deserializeSourceParameters(serializedParameters: string): [testPlanKey: string] {
    return [serializedParameters];
  }
}
