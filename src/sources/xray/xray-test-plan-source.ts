import type { XrayClientCloud } from "@qytera/xray-client";
import { XrayClientServer } from "@qytera/xray-client";
import type { Version3Client } from "jira.js";
import { Version2Client } from "jira.js";
import type { ProjectDetails } from "jira.js/out/version3/models/index.js";
import type { SearchForIssuesUsingJqlPost } from "jira.js/out/version3/parameters/index.js";
import type { Test } from "../../models/test-model.js";
import type { TestResults } from "../../models/test-results-model.js";
import type { Source } from "../source.js";
import { convertStatus } from "./xray-status.js";

/**
 * The Xray test plan source is responsible for fetching test report data from
 * [Xray](https://www.getxray.app/) test plans.
 */
export class XraySource implements Source<string> {
  private readonly config: XraySourceOptions;

  /**
   * Constructs a new Xray source based on the provided options.
   *
   * @param config the source configuration
   */
  constructor(config: XraySourceOptions) {
    this.config = config;
  }

  /**
   * Retrieves a test plan from the Xray API.
   *
   * @param testPlanKey the test plan to retrieve
   */
  public async getTestResults(testPlanKey: string): Promise<TestResults> {
    if (this.config.xray.client instanceof XrayClientServer) {
      return XraySource.getTestPlanServer({
        jiraClient: this.config.jira.client,
        testPlanKey: testPlanKey,
        url: this.config.jira.url,
        xrayClient: this.config.xray.client,
      });
    } else {
      return XraySource.getTestPlanCloud({
        jiraClient: this.config.jira.client,
        testPlanKey: testPlanKey,
        url: this.config.jira.url,
        xrayClient: this.config.xray.client,
      });
    }
  }

  private static async getTestPlanCloud(args: {
    jiraClient: Version2Client | Version3Client;
    testPlanKey: string;
    url: string;
    xrayClient: XrayClientCloud;
  }): Promise<TestResults> {
    const parsedTestPlan: TestResults = {
      id: args.testPlanKey,
      name: "unknown",
      results: [],
      url: `${args.url}/browse/${args.testPlanKey}`,
    };
    let startAt = 0;
    let hasMoreTests = true;
    while (hasMoreTests) {
      const response = await args.xrayClient.graphql.getTestPlans(
        { jql: `issue in (${args.testPlanKey})`, limit: 1 },
        (testPlanResults) => [
          testPlanResults.results((testPlan) => [
            testPlan.jira({ fields: ["summary", "project"] }),
            testPlan.tests({ limit: 100, start: startAt }, (testResults) => [
              testResults.results((test) => [
                test.jira({ fields: ["key", "summary"] }),
                test.testRuns({ limit: 1 }, (testRunResults) => [
                  testRunResults.results((testRun) => [
                    testRun.status((status) => [status.name]),
                    testRun.testExecution((testExecution) => [
                      testExecution.jira({ fields: ["key"] }),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]
      );
      const result = response.results?.at(0);
      if (!result) {
        throw new Error(`failed to find test plan ${args.testPlanKey}`);
      }
      const testPlanProject = result.jira?.project as ProjectDetails | undefined;
      const projectKey = testPlanProject?.key;
      if (!projectKey) {
        throw new Error(`failed to retrieve project of test plan ${args.testPlanKey}`);
      }
      parsedTestPlan.name = result.jira?.summary as string;
      const returnedTests = result.tests?.results;
      if (!returnedTests || returnedTests.length === 0) {
        hasMoreTests = false;
      } else {
        for (const testIssue of returnedTests) {
          if (!testIssue?.jira) {
            continue;
          }
          const test: Test = {
            id: testIssue.jira.key as string,
            name: testIssue.jira.summary as string,
            url: `${args.url}/browse/${testIssue.jira.key as string}`,
          };
          const testExecutionKey = testIssue.testRuns?.results?.at(0)?.testExecution?.jira?.key as
            | string
            | undefined;
          if (!testExecutionKey) {
            parsedTestPlan.results.push({
              result: {
                status: "pending",
                url: `${args.url}/browser/${args.testPlanKey}`,
              },
              test: test,
            });
          } else {
            const testRun = testIssue.testRuns?.results?.at(0);
            if (!testRun?.status?.name) {
              parsedTestPlan.results.push({
                result: {
                  status: "pending",
                  url: `${args.url}/browser/${testExecutionKey}`,
                },
                test: test,
              });
            } else {
              parsedTestPlan.results.push({
                result: {
                  status: convertStatus(testRun.status.name),
                  url: `${args.url}/projects/${projectKey}?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=${testExecutionKey}&ac.testKey=${testIssue.jira.key as string}`,
                },
                test: test,
              });
            }
          }
        }
        startAt = startAt + returnedTests.length;
      }
    }
    return parsedTestPlan;
  }

  private static async getTestPlanServer(args: {
    jiraClient: Version2Client | Version3Client;
    testPlanKey: string;
    url: string;
    xrayClient: XrayClientServer;
  }): Promise<TestResults> {
    let result;
    let query: SearchForIssuesUsingJqlPost = {
      fields: ["summary"],
      jql: `issue in (${args.testPlanKey})`,
    };
    // TypeScript won't let us search in the union of version 2 and 3 (jira.js problem).
    if (args.jiraClient instanceof Version2Client) {
      result = await args.jiraClient.issueSearch.searchForIssuesUsingJqlPost(query);
    } else {
      result = await args.jiraClient.issueSearch.searchForIssuesUsingJqlPost(query);
    }
    const testPlan: TestResults = {
      id: args.testPlanKey,
      name: result.issues?.at(0)?.fields.summary ?? "unknown",
      results: [],
      url: `${args.url}/browse/${args.testPlanKey}`,
    };
    const tests = await args.xrayClient.testPlan.getTests(args.testPlanKey);
    const testsByKey = new Map<
      string,
      {
        id: number;
        latestStatus: string;
      }
    >();
    for (const test of tests) {
      testsByKey.set(test.key, { id: test.id, latestStatus: test.latestStatus });
    }
    let startAt = 0;
    let hasMoreTests = true;
    while (hasMoreTests) {
      query = {
        fields: ["summary", "key", "id"],
        jql: `issue in (${[...testsByKey.keys()].join(",")})`,
        startAt: startAt,
      };
      // TypeScript won't let us search in the union of version 2 and 3 (jira.js problem).
      if (args.jiraClient instanceof Version2Client) {
        result = await args.jiraClient.issueSearch.searchForIssuesUsingJqlPost(query);
      } else {
        result = await args.jiraClient.issueSearch.searchForIssuesUsingJqlPost(query);
      }
      if (!result.issues || result.issues.length === 0) {
        hasMoreTests = false;
      } else {
        for (const issue of result.issues) {
          const xrayTest = testsByKey.get(issue.key);
          if (!xrayTest) {
            throw new Error(`Unexpected error occurred: ${issue.key} was not returned by Xray`);
          }
          testPlan.results.push({
            result: {
              status: convertStatus(xrayTest.latestStatus),
              url: `${args.url}/browse/${issue.key}`,
            },
            test: {
              id: issue.fields.key as string,
              name: issue.fields.summary,
              url: `${args.url}/browse/${issue.key}`,
            },
          });
        }
        startAt = startAt + result.issues.length;
      }
    }
    return testPlan;
  }
}

export interface XraySourceOptions {
  jira: {
    client: Version2Client | Version3Client;
    url: string;
  };
  xray: { client: XrayClientCloud | XrayClientServer };
}
