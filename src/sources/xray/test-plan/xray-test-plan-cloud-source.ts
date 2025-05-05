import type { XrayClientCloud } from "@qytera/xray-client";
import type { Version2Client, Version3Client } from "jira.js";
import type { ProjectDetails } from "jira.js/out/version3/models/index.js";
import type { Test } from "../../../models/test-model.js";
import type { TestResults } from "../../../models/test-results-model.js";
import { Source } from "../../source.js";
import { convertStatus } from "../xray-status.js";
import type { JiraAuthentication, XrayAuthentication } from "./xray-test-plan-source.js";

/**
 * The Xray test plan source is responsible for fetching test report data from
 * [Xray cloud](https://www.getxray.app/) test plans.
 */
export class XrayTestPlanCloudSource extends Source<TestPlanCloudSourceOptions, string> {
  /**
   * Retrieves a test plan from the Xray API.
   *
   * @param testPlanKey the test plan to retrieve
   * @returns the test results of the test plan
   */
  public async getTestResults(testPlanKey: string): Promise<TestResults> {
    const parsedTestPlan: TestResults = {
      id: testPlanKey,
      name: "unknown",
      results: [],
      url: `${this.configuration.jira.url}/browse/${testPlanKey}`,
    };
    let startAt = 0;
    let hasMoreTests = true;
    while (hasMoreTests) {
      const response = await this.configuration.xray.client.graphql.getTestPlans(
        { jql: `issue in (${testPlanKey})`, limit: 1 },
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
        throw new Error(`failed to find test plan ${testPlanKey}`);
      }
      const testPlanProject = result.jira?.project as ProjectDetails | undefined;
      const projectKey = testPlanProject?.key;
      if (!projectKey) {
        throw new Error(`failed to retrieve project of test plan ${testPlanKey}`);
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
            url: `${this.configuration.jira.url}/browse/${testIssue.jira.key as string}`,
          };
          const testExecutionKey = testIssue.testRuns?.results?.at(0)?.testExecution?.jira?.key as
            | string
            | undefined;
          if (!testExecutionKey) {
            parsedTestPlan.results.push({
              result: {
                status: "pending",
                url: `${this.configuration.jira.url}/browser/${testPlanKey}`,
              },
              test: test,
            });
          } else {
            const testRun = testIssue.testRuns?.results?.at(0);
            if (!testRun?.status?.name) {
              parsedTestPlan.results.push({
                result: {
                  status: "pending",
                  url: `${this.configuration.jira.url}/browser/${testExecutionKey}`,
                },
                test: test,
              });
            } else {
              parsedTestPlan.results.push({
                result: {
                  status: convertStatus(testRun.status.name),
                  url: `${this.configuration.jira.url}/projects/${projectKey}?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=${testExecutionKey}&ac.testKey=${testIssue.jira.key as string}`,
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
}

export interface TestPlanCloudSourceOptions {
  jira: {
    authentication: JiraAuthentication;
    client: Version2Client | Version3Client;
    url: string;
  };
  xray: {
    authentication: XrayAuthentication;
    client: XrayClientCloud;
    url: string;
  };
}
