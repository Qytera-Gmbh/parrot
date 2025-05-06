import type { XrayClientCloud } from "@qytera/xray-client";
import ansiColors from "ansi-colors";
import type { ProjectDetails } from "jira.js/out/version3/models/index.js";
import type { TestResult } from "../../../../models/test-model.js";
import { Source } from "../../../../source.js";
import type { XrayAuthentication } from "../util/constants.js";
import { convertStatus } from "../util/xray-status.js";

/**
 * The Xray test plan source is responsible for fetching test report data from
 * [Xray cloud](https://www.getxray.app/) test plans.
 */
export class XrayTestPlanCloudSource extends Source<
  XrayTestPlanCloudSourceConfiguration,
  XrayTestPlanCloudInlet
> {
  /**
   * Retrieves a test plan from the Xray API.
   *
   * @param inlet the test plan inlet parameters
   * @returns the test results of the test plan
   */
  public async getTestResults(inlet: XrayTestPlanCloudInlet): Promise<TestResult[]> {
    console.log(`Fetching test results from ${ansiColors.cyan(inlet.testPlanKey)} ...`);
    const results: TestResult[] = [];
    let startAt = 0;
    let hasMoreTests = true;
    while (hasMoreTests) {
      const response = await this.configuration.xray.client.graphql.getTestPlans(
        { jql: `issue in (${inlet.testPlanKey})`, limit: 1 },
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
        throw new Error(`failed to find test plan ${inlet.testPlanKey}`);
      }
      const testPlanProject = result.jira?.project as ProjectDetails | undefined;
      const projectKey = testPlanProject?.key;
      if (!projectKey) {
        throw new Error(`failed to retrieve project of test plan ${inlet.testPlanKey}`);
      }
      const returnedTests = result.tests?.results;
      if (!returnedTests || returnedTests.length === 0) {
        hasMoreTests = false;
      } else {
        for (const testIssue of returnedTests) {
          if (!testIssue?.jira) {
            continue;
          }
          // Casts are valid because the GraphQL query above includes all these fields.
          const testId = testIssue.jira.key as string;
          const testName = testIssue.jira.summary as string;
          const testUrl = `${this.configuration.jira.url}/browse/${testIssue.jira.key as string}`;
          const testExecutionKey = testIssue.testRuns?.results?.at(0)?.testExecution?.jira?.key as
            | string
            | undefined;
          if (!testExecutionKey) {
            results.push({
              executionMetadata: {
                url: `${this.configuration.jira.url}/browse/${inlet.testPlanKey}`,
              },
              id: testId,
              name: testName,
              status: "pending",
              url: testUrl,
            });
          } else {
            const testRun = testIssue.testRuns?.results?.at(0);
            if (!testRun?.status?.name) {
              results.push({
                executionMetadata: {
                  url: `${this.configuration.jira.url}/browser/${testExecutionKey}`,
                },
                id: testId,
                name: testName,
                status: "pending",
                url: testUrl,
              });
            } else {
              results.push({
                executionMetadata: {
                  url: `${this.configuration.jira.url}/projects/${projectKey}?selectedItem=com.atlassian.plugins.atlassian-connect-plugin%3Acom.xpandit.plugins.xray__testing-board&ac.testExecutionKey=${testExecutionKey}&ac.testKey=${testIssue.jira.key as string}`,
                },
                id: testId,
                name: testName,
                status: convertStatus(testRun.status.name),
                url: testUrl,
              });
            }
          }
        }
        startAt = startAt + returnedTests.length;
      }
    }
    return results;
  }
}

export interface XrayTestPlanCloudSourceConfiguration {
  jira: {
    url: string;
  };
  xray: {
    authentication: XrayAuthentication;
    client: XrayClientCloud;
    url: string;
  };
}

export interface XrayTestPlanCloudInlet {
  testPlanKey: string;
}
