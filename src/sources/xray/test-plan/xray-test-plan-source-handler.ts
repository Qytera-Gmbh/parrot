import { input, password, select } from "@inquirer/prompts";
import { XrayClientCloud, XrayClientServer } from "@qytera/xray-client";
import { Version2Client, Version3Client } from "jira.js";
import { SourceHandler } from "../../../cli/cli-source-handler.js";
import { getEnv } from "../../../util/env.js";
import type { XrayTestPlanCloudSourceParameters } from "./xray-test-plan-cloud-source.js";
import { XrayTestPlanCloudSource } from "./xray-test-plan-cloud-source.js";
import type { XrayTestPlanServerSourceParameters } from "./xray-test-plan-server-source.js";
import { XrayTestPlanServerSource } from "./xray-test-plan-server-source.js";
import type { JiraAuthentication, XrayAuthentication } from "./xray-test-plan-source.js";
import { JIRA_AUTHENTICATION, XRAY_AUTHENTICATION } from "./xray-test-plan-source.js";

export class XrayTestPlanSourceHandler extends SourceHandler<
  XrayTestPlanCloudSource | XrayTestPlanServerSource,
  SerializedConfiguration,
  SerializedParameters
> {
  public async buildSource(): Promise<XrayTestPlanCloudSource | XrayTestPlanServerSource> {
    const isServer = await this.isJiraServerSource();
    const jiraUrl = await this.getJiraUrl(isServer);
    const xrayUrl = isServer ? jiraUrl : await this.getXrayCloudUrl();
    const jiraVersionChoice = await select<JiraApiVersion>({
      choices: JIRA_API_VERSION,
      default: JIRA_API_VERSION[1],
      message: "Which version of the Jira API do you want to use?",
    });
    const jiraAuthenticationChoice = await select<JiraAuthentication>({
      choices: JIRA_AUTHENTICATION,
      message: "How do you want to authenticate to the Jira API?",
    });
    const jiraCredentials = await this.getJiraCredentials(isServer, jiraAuthenticationChoice);
    const xrayAuthenticationChoice = await select<XrayAuthentication>({
      choices: XRAY_AUTHENTICATION,
      message: "How do you want to authenticate to the Xray API?",
    });
    const xrayCredentials = await this.getXrayCredentials(xrayAuthenticationChoice);
    if (isServer) {
      return new XrayTestPlanServerSource({
        jira: {
          authentication: jiraAuthenticationChoice,
          client:
            jiraVersionChoice === "version-2"
              ? new Version2Client({ authentication: jiraCredentials, host: jiraUrl })
              : new Version3Client({ authentication: jiraCredentials, host: jiraUrl }),
          url: jiraUrl,
        },
        xray: {
          authentication: xrayAuthenticationChoice,
          client: new XrayClientServer({ credentials: xrayCredentials, url: xrayUrl }),
          url: xrayUrl,
        },
      });
    } else {
      return new XrayTestPlanCloudSource({
        jira: {
          authentication: jiraAuthenticationChoice,
          client:
            jiraVersionChoice === "version-2"
              ? new Version2Client({ authentication: jiraCredentials, host: jiraUrl })
              : new Version3Client({ authentication: jiraCredentials, host: jiraUrl }),
          url: jiraUrl,
        },
        xray: {
          authentication: xrayAuthenticationChoice,
          client: new XrayClientCloud({ credentials: xrayCredentials, url: xrayUrl }),
          url: xrayUrl,
        },
      });
    }
  }

  public serializeSource(
    source: XrayTestPlanCloudSource | XrayTestPlanServerSource
  ): SerializedConfiguration {
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

  public async deserializeSource(
    serializedSource: SerializedConfiguration
  ): Promise<XrayTestPlanCloudSource | XrayTestPlanServerSource> {
    const isServer = serializedSource.xray.kind === "server";
    const jiraCredentials = await this.getJiraCredentials(
      isServer,
      serializedSource.jira.authentication
    );
    const xrayCredentials = await this.getXrayCredentials(serializedSource.xray.authentication);
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

  public async buildInlet(): Promise<
    XrayTestPlanCloudSourceParameters | XrayTestPlanServerSourceParameters
  > {
    const testPlanKey = await input({
      message:
        "Please enter the issue key of the test plan you want to use as the source (e.g. ABC-123):",
    });
    return { testPlanKey };
  }

  public serializeInlet(
    parameters: XrayTestPlanCloudSourceParameters | XrayTestPlanServerSourceParameters
  ): SerializedParameters {
    return { testPlanKey: parameters.testPlanKey };
  }

  public deserializeInlet(
    serializedParameters: SerializedParameters
  ): XrayTestPlanCloudSourceParameters | XrayTestPlanServerSourceParameters {
    return { testPlanKey: serializedParameters.testPlanKey };
  }

  private async isJiraServerSource(): Promise<boolean> {
    const serverOrCloud = await select<"cloud" | "server">({
      choices: ["server", "cloud"],
      message: "Are you using Jira/Xray Server/DC or Cloud?",
    });
    return serverOrCloud === "server";
  }

  private async getJiraUrl(isServer: boolean): Promise<string> {
    return (
      getEnv("jira-url", false) ??
      (await input({
        message: `What is the base URL of your Jira instance (e.g. ${isServer ? "https://example-jira.com" : "https://example.atlassian.net"})?`,
      }))
    );
  }

  private async getXrayCloudUrl(): Promise<string> {
    return await select<string>({
      choices: [
        "https://xray.cloud.getxray.app/",
        "https://us.xray.cloud.getxray.app/",
        "https://eu.xray.cloud.getxray.app/",
        "https://au.xray.cloud.getxray.app/",
      ],
      default: "https://xray.cloud.getxray.app",
      message: "Which Xray Cloud URL do you want to use?",
    });
  }

  private async getJiraCredentials(isServer: boolean, authenticationChoice: JiraAuthentication) {
    switch (authenticationChoice) {
      case "basic":
        if (isServer) {
          const username =
            getEnv("jira-username", false) ??
            (await input({
              message: "Please enter your Jira username:",
            }));
          const jiraPassword =
            getEnv("jira-password", false) ??
            (await password({
              message: "Please enter your Jira password:",
            }));
          return {
            basic: {
              password: jiraPassword,
              username: username,
            },
          };
        } else {
          const email =
            getEnv("jira-email", false) ??
            (await input({
              message: "Please enter your Jira email address:",
            }));
          const token =
            getEnv("jira-token", false) ??
            (await password({
              message: "Please enter your Jira personal access token:",
            }));
          return {
            basic: {
              apiToken: token,
              email: email,
            },
          };
        }
      case "oauth2":
        return {
          oauth2: {
            accessToken:
              getEnv("jira-token", false) ??
              (await password({
                message: "Please enter your Jira personal access token:",
              })),
          },
        };
      case "pat":
        return {
          personalAccessToken:
            getEnv("jira-token", false) ??
            (await password({
              message: "Please enter your Jira personal access token:",
            })),
        };
    }
  }

  private async getXrayCredentials(authenticationChoice: XrayAuthentication) {
    switch (authenticationChoice) {
      case "basic": {
        const username =
          getEnv("jira-username", false) ??
          (await input({
            message: "Please enter your Jira username:",
          }));
        const jiraPassword =
          getEnv("jira-password", false) ??
          (await password({
            message: "Please enter your Jira password:",
          }));
        return {
          password: jiraPassword,
          username: username,
        };
      }
      case "client-credentials": {
        const clientId =
          getEnv("xray-client-id", false) ??
          (await input({
            message: "Please enter your Xray client ID:",
          }));
        const clientSecret =
          getEnv("xray-client-secret", false) ??
          (await password({
            message: "Please enter your Xray client secret:",
          }));
        return {
          clientId: clientId,
          clientSecret: clientSecret,
          path: "/api/v2/authenticate" as const,
        };
      }
      case "pat": {
        const username =
          getEnv("jira-username", false) ??
          (await input({
            message: "Please enter your Jira username:",
          }));
        const token =
          getEnv("jira-token", false) ??
          (await password({
            message: "Please enter your Jira personal access token:",
          }));
        return {
          token: token,
          username: username,
        };
      }
    }
  }
}

const JIRA_API_VERSION = ["version-2", "version-3"] as const;
type JiraApiVersion = (typeof JIRA_API_VERSION)[number];

interface SerializedConfiguration {
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

interface SerializedParameters {
  testPlanKey: string;
}
