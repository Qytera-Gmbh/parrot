import type { XrayClientServer } from "@qytera/xray-client";
import ansiColors from "ansi-colors";
import type { Version3Client } from "jira.js";
import { Version2Client } from "jira.js";
import type { SearchForIssuesUsingJqlPost } from "jira.js/out/version3/parameters/index.js";
import type { TestResult } from "../../../../models/test-model.js";
import { Source } from "../../../../source.js";
import type { JiraAuthentication, XrayAuthentication } from "../util/constants.js";
import { convertStatus } from "../util/xray-status.js";

/**
 * The Xray test plan source is responsible for fetching test report data from
 * [Xray server](https://www.getxray.app/) test plans.
 */
export class XrayTestPlanServerSource extends Source<
  XrayTestPlanServerSourceConfiguration,
  XrayTestPlanServerInlet
> {
  /**
   * Retrieves a test plan from the Xray API.
   *
   * @param inlet the test plan inlet parameters
   * @returns the test results of the test plan
   */
  public async getTestResults(inlet: XrayTestPlanServerInlet): Promise<TestResult[]> {
    console.log(`Fetching test results from ${ansiColors.cyan(inlet.testPlanKey)} ...`);
    let result;
    let query: SearchForIssuesUsingJqlPost = {
      fields: ["summary"],
      jql: `issue in (${inlet.testPlanKey})`,
    };
    // TypeScript won't let us search in the union of version 2 and 3 (jira.js problem).
    if (this.configuration.jira.client instanceof Version2Client) {
      result = await this.configuration.jira.client.issueSearch.searchForIssuesUsingJqlPost(query);
    } else {
      result = await this.configuration.jira.client.issueSearch.searchForIssuesUsingJqlPost(query);
    }
    const results: TestResult[] = [];
    const tests = await this.configuration.xray.client.testPlan.getTests(inlet.testPlanKey);
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
      if (this.configuration.jira.client instanceof Version2Client) {
        result =
          await this.configuration.jira.client.issueSearch.searchForIssuesUsingJqlPost(query);
      } else {
        result =
          await this.configuration.jira.client.issueSearch.searchForIssuesUsingJqlPost(query);
      }
      if (!result.issues || result.issues.length === 0) {
        hasMoreTests = false;
      } else {
        for (const issue of result.issues) {
          const xrayTest = testsByKey.get(issue.key);
          if (!xrayTest) {
            throw new Error(`Unexpected error occurred: ${issue.key} was not returned by Xray`);
          }
          results.push({
            executionMetadata: {
              url: `${this.configuration.jira.url}/browse/${inlet.testPlanKey}`,
            },
            id: issue.fields.key as string,
            name: issue.fields.summary,
            status: convertStatus(xrayTest.latestStatus),
            url: `${this.configuration.jira.url}/browse/${issue.key}`,
          });
        }
        startAt = startAt + result.issues.length;
      }
    }
    return results;
  }
}

export interface XrayTestPlanServerSourceConfiguration {
  jira: {
    authentication: JiraAuthentication;
    client: Version2Client | Version3Client;
    url: string;
  };
  xray: {
    authentication: XrayAuthentication;
    client: XrayClientServer;
    url: string;
  };
}

export interface XrayTestPlanServerInlet {
  testPlanKey: string;
}
