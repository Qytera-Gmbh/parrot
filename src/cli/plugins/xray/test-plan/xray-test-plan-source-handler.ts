import { input, password, select } from "@inquirer/prompts";
import { XrayClientCloud, XrayClientServer } from "@qytera/xray-client";
import { Version2Client, Version3Client } from "jira.js";
import { getEnv } from "../../../../util/env.js";
import { SourceHandler } from "../../../cli-source-handler.js";
import type { JiraAuthentication, XrayAuthentication } from "../util/constants.js";
import { JIRA_AUTHENTICATION } from "../util/constants.js";
import type { XrayTestPlanCloudInlet } from "./xray-test-plan-cloud-source.js";
import { XrayTestPlanCloudSource } from "./xray-test-plan-cloud-source.js";
import type { XrayTestPlanServerInlet } from "./xray-test-plan-server-source.js";
import { XrayTestPlanServerSource } from "./xray-test-plan-server-source.js";

export class XrayTestPlanSourceHandler extends SourceHandler<
  XrayTestPlanCloudSource | XrayTestPlanServerSource,
  SerializedConfigurationCloud | SerializedConfigurationServer,
  SerializedInlet
> {
  public async buildSource(): Promise<XrayTestPlanCloudSource | XrayTestPlanServerSource> {
    const isServer = await this.isJiraServerSource();
    const jiraUrl = await this.getJiraUrl(isServer);
    const xrayUrl = isServer ? jiraUrl : await this.getXrayCloudUrl();
    if (isServer) {
      const jiraVersionChoice = await select<JiraApiVersion>({
        choices: JIRA_API_VERSION,
        default: JIRA_API_VERSION[1],
        message: "Which version of the Jira API do you want to use?",
      });
      const jiraAuthenticationChoice = await select<JiraAuthentication>({
        choices: JIRA_AUTHENTICATION,
        message: "How do you want to authenticate to the Jira API?",
      });
      const jiraCredentials = await this.getJiraServerCredentials(jiraAuthenticationChoice);
      let xrayAuthentication: XrayAuthentication;
      let xrayCredentials;
      if (jiraCredentials.personalAccessToken) {
        xrayAuthentication = "pat";
        xrayCredentials = { token: jiraCredentials.personalAccessToken };
      } else {
        xrayAuthentication = "basic";
        xrayCredentials = await this.getXrayCredentials("basic");
      }
      return new XrayTestPlanServerSource({
        jira: {
          authentication: jiraAuthenticationChoice,
          client:
            jiraVersionChoice === "v2"
              ? new Version2Client({ authentication: jiraCredentials, host: jiraUrl })
              : new Version3Client({ authentication: jiraCredentials, host: jiraUrl }),
          url: jiraUrl,
        },
        xray: {
          authentication: xrayAuthentication,
          client: new XrayClientServer({ credentials: xrayCredentials, url: xrayUrl }),
          url: xrayUrl,
        },
      });
    }
    const xrayCredentials = await this.getXrayCredentials("client-credentials");
    return new XrayTestPlanCloudSource({
      jira: {
        url: jiraUrl,
      },
      xray: {
        authentication: "client-credentials",
        client: new XrayClientCloud({ credentials: xrayCredentials, url: xrayUrl }),
        url: xrayUrl,
      },
    });
  }

  public serializeSource(
    source: XrayTestPlanCloudSource | XrayTestPlanServerSource
  ): SerializedConfigurationCloud | SerializedConfigurationServer {
    const config = source.getConfiguration();
    if ("client" in config.jira) {
      return {
        jira: {
          authentication: config.jira.authentication,
          url: config.jira.url,
          version: config.jira.client instanceof Version2Client ? "v2" : "v3",
        },
        kind: "server",
        xray: {
          authentication: config.xray.authentication,
          url: config.xray.url,
        },
      };
    }
    return {
      jira: {
        url: config.jira.url,
      },
      kind: "cloud",
      xray: {
        authentication: config.xray.authentication,
        url: config.xray.url,
      },
    };
  }

  public async deserializeSource(
    serializedSource: SerializedConfigurationCloud | SerializedConfigurationServer
  ): Promise<XrayTestPlanCloudSource | XrayTestPlanServerSource> {
    if (serializedSource.kind === "server") {
      const jiraCredentials = await this.getJiraServerCredentials(
        serializedSource.jira.authentication
      );
      let jiraClient;
      switch (serializedSource.jira.version) {
        case "v2":
          jiraClient = new Version2Client({
            authentication: jiraCredentials,
            host: serializedSource.jira.url,
          });
          break;
        case "v3":
          jiraClient = new Version3Client({
            authentication: jiraCredentials,
            host: serializedSource.jira.url,
          });
          break;
      }
      let xrayCredentials;
      if (jiraCredentials.personalAccessToken) {
        xrayCredentials = { token: jiraCredentials.personalAccessToken };
      } else {
        xrayCredentials = await this.getXrayCredentials("basic");
      }
      return new XrayTestPlanServerSource({
        jira: {
          authentication: serializedSource.jira.authentication,
          client: jiraClient,
          url: serializedSource.jira.url,
        },
        xray: {
          authentication: serializedSource.xray.authentication,
          client: new XrayClientServer({
            credentials: xrayCredentials,
            url: serializedSource.xray.url,
          }),
          url: serializedSource.xray.url,
        },
      });
    }
    const xrayCredentials = await this.getXrayCredentials("client-credentials");
    return new XrayTestPlanCloudSource({
      jira: {
        url: serializedSource.jira.url,
      },
      xray: {
        authentication: serializedSource.xray.authentication,
        client: new XrayClientCloud({
          credentials: xrayCredentials,
          url: serializedSource.xray.url,
        }),
        url: serializedSource.xray.url,
      },
    });
  }

  public async buildInlet(): Promise<XrayTestPlanCloudInlet | XrayTestPlanServerInlet> {
    const testPlanKey = await input({
      message:
        "Please enter the issue key of the test plan you want to use as an inlet (e.g. ABC-123):",
    });
    return { testPlanKey };
  }

  public serializeInlet(inlet: XrayTestPlanCloudInlet | XrayTestPlanServerInlet): SerializedInlet {
    return { testPlanKey: inlet.testPlanKey };
  }

  public deserializeInlet(
    serializedInlet: SerializedInlet
  ): XrayTestPlanCloudInlet | XrayTestPlanServerInlet {
    return { testPlanKey: serializedInlet.testPlanKey };
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

  private async getJiraServerCredentials(authenticationChoice: JiraAuthentication) {
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
          basic: {
            password: jiraPassword,
            username: username,
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

  /**
   * @see https://docs.getxray.app/display/XRAY/REST+API
   * @see https://docs.getxray.app/display/XRAYCLOUD/Authentication+-+REST+v2
   */
  private async getXrayCredentials(authenticationChoice: "basic" | "client-credentials") {
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
    }
  }
}

interface SerializedConfigurationServer {
  jira: {
    authentication: JiraAuthentication;
    url: string;
    version: JiraApiVersion;
  };
  kind: "server";
  xray: {
    authentication: XrayAuthentication;
    url: string;
  };
}

interface SerializedConfigurationCloud {
  jira: {
    url: string;
  };
  kind: "cloud";
  xray: {
    authentication: XrayAuthentication;
    url: string;
  };
}

interface SerializedInlet {
  testPlanKey: string;
}

const JIRA_API_VERSION = ["v2", "v3"] as const;
type JiraApiVersion = (typeof JIRA_API_VERSION)[number];
