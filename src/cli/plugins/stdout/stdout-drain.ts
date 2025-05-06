import ansiColors from "ansi-colors";
import { Drain } from "../../../drain.js";
import type { TestResult } from "../../../models/test-model.js";

export class StdOutDrain extends Drain<unknown, StdOutOutlet, string> {
  /**
   * The indentation of nested lines.
   */
  private static readonly INDENT = " ".repeat(2);

  /**
   * The unicode characters to use when unicode support is enabled.
   */
  private static readonly UNICODE_CHARACTERS = {
    fail: "✖",
    pass: "✔",
    pending: "▸",
    skipped: "/",
  };

  /**
   * The color functions to use when color support is enabled.
   */
  private static readonly COLOR_FUNCTIONS = {
    /**
     * A function for general information surrounding the tests (e.g. pass percentages).
     */
    chatter: Object.assign((msg: string) => ansiColors.bold(ansiColors.white(msg)), {
      /**
       * For highlighting stuff inside a 'chatter message'.
       */
      highlight: ansiColors.cyan,
    }),
    fail: ansiColors.red,
    pass: ansiColors.green,
    pending: ansiColors.gray,
    skipped: ansiColors.yellow,
  };

  public writeTestResults(results: TestResult[], outlet: StdOutOutlet): string {
    const sections = [
      "",
      this.getHeaderMessage(results, outlet),
      this.getPassingTestsMessage(results, outlet),
      this.getPendingTestsMessage(results, outlet),
      this.getSkippedTestsMessage(results, outlet),
      this.getFailedTestsMessage(results, outlet),
    ];
    const finalString = sections.join("\n".repeat(2));
    console.log(finalString);
    return finalString;
  }

  private getHeaderMessage(testResults: TestResult[], outlet: StdOutOutlet): string {
    const lines: string[] = [];
    const percentagePassing =
      (100 * testResults.filter((test) => test.status === "pass").length) / testResults.length;
    if (outlet.useColor) {
      lines.push(
        StdOutDrain.COLOR_FUNCTIONS.chatter(
          `A total of ${StdOutDrain.COLOR_FUNCTIONS.chatter.highlight(testResults.length.toString())} tests were run with a passing percentage of ${StdOutDrain.COLOR_FUNCTIONS.chatter.highlight(percentagePassing.toFixed(2))} %`
        )
      );
    } else {
      lines.push(
        `A total of ${testResults.length.toString()} tests were run with a passing percentage of ${percentagePassing.toFixed(2)} %`
      );
    }
    return lines.join("\n");
  }

  private getPassingTestsMessage(testResults: TestResult[], outlet: StdOutOutlet): string {
    const passedTests = testResults.filter((test) => test.status === "pass");
    const lines: string[] = [];
    if (outlet.useColor) {
      lines.push(
        StdOutDrain.COLOR_FUNCTIONS.chatter(`Passing tests (${passedTests.length.toString()}):`)
      );
      for (const passedTest of passedTests) {
        lines.push(
          StdOutDrain.COLOR_FUNCTIONS.pass(
            `${StdOutDrain.INDENT}${outlet.useUnicode ? StdOutDrain.UNICODE_CHARACTERS.pass : "-"} ${passedTest.name} (${passedTest.executionMetadata.url})`
          )
        );
      }
    } else {
      lines.push(`Passing tests (${passedTests.length.toString()}):`);
      for (const passedTest of passedTests) {
        lines.push(
          `${StdOutDrain.INDENT}${outlet.useUnicode ? StdOutDrain.UNICODE_CHARACTERS.pass : "-"} ${passedTest.name} (${passedTest.executionMetadata.url})`
        );
      }
    }
    return lines.join("\n");
  }

  private getPendingTestsMessage(testResults: TestResult[], outlet: StdOutOutlet): string {
    const pendingTests = testResults.filter((test) => test.status === "pending");
    const lines: string[] = [];
    if (outlet.useColor) {
      lines.push(
        StdOutDrain.COLOR_FUNCTIONS.chatter(`Pending tests (${pendingTests.length.toString()}):`)
      );
      for (const pendingTest of pendingTests) {
        lines.push(
          StdOutDrain.COLOR_FUNCTIONS.pending(
            `${StdOutDrain.INDENT}${outlet.useUnicode ? StdOutDrain.UNICODE_CHARACTERS.pending : "-"} ${pendingTest.name} (${pendingTest.executionMetadata.url})`
          )
        );
      }
    } else {
      lines.push(`Pending tests (${pendingTests.length.toString()}):`);
      for (const pendingTest of pendingTests) {
        lines.push(
          `${StdOutDrain.INDENT}${outlet.useUnicode ? StdOutDrain.UNICODE_CHARACTERS.pending : "-"} ${pendingTest.name} (${pendingTest.executionMetadata.url})`
        );
      }
    }
    return lines.join("\n");
  }

  private getSkippedTestsMessage(testResults: TestResult[], outlet: StdOutOutlet): string {
    const skippedTests = testResults.filter((test) => test.status === "skipped");
    const lines: string[] = [];
    if (outlet.useColor) {
      lines.push(
        StdOutDrain.COLOR_FUNCTIONS.chatter(`Skipped tests (${skippedTests.length.toString()}):`)
      );
      for (const skippedTest of skippedTests) {
        lines.push(
          StdOutDrain.COLOR_FUNCTIONS.skipped(
            `${StdOutDrain.INDENT}${outlet.useUnicode ? StdOutDrain.UNICODE_CHARACTERS.skipped : "-"} ${skippedTest.name} (${skippedTest.executionMetadata.url})`
          )
        );
      }
    } else {
      lines.push(`Skipped tests (${skippedTests.length.toString()}):`);
      for (const skippedTest of skippedTests) {
        lines.push(
          `${StdOutDrain.INDENT}${outlet.useUnicode ? StdOutDrain.UNICODE_CHARACTERS.skipped : "-"} ${skippedTest.name} (${skippedTest.executionMetadata.url})`
        );
      }
    }
    return lines.join("\n");
  }

  private getFailedTestsMessage(testResults: TestResult[], outlet: StdOutOutlet): string {
    const failedTests = testResults.filter((test) => test.status === "fail");
    const lines: string[] = [];
    if (outlet.useColor) {
      lines.push(
        StdOutDrain.COLOR_FUNCTIONS.chatter(`Failed tests (${failedTests.length.toString()}):`)
      );
      for (const failedTest of failedTests) {
        lines.push(
          StdOutDrain.COLOR_FUNCTIONS.fail(
            `${StdOutDrain.INDENT}${outlet.useUnicode ? StdOutDrain.UNICODE_CHARACTERS.fail : "-"} ${failedTest.name} (${failedTest.executionMetadata.url})`
          )
        );
      }
    } else {
      lines.push(`Failed tests (${failedTests.length.toString()}):`);
      for (const failedTest of failedTests) {
        lines.push(
          `${StdOutDrain.INDENT}${outlet.useUnicode ? StdOutDrain.UNICODE_CHARACTERS.fail : "-"} ${failedTest.name} (${failedTest.executionMetadata.url})`
        );
      }
    }
    return lines.join("\n");
  }
}

/**
 * The details of a StdOut outlet where test results can be written to.
 */
export interface StdOutOutlet {
  useColor: boolean;
  useUnicode: boolean;
}
