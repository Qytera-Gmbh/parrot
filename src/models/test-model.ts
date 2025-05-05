import type { HasId, HasName, HasUrl } from "./common-model.js";

export interface TestResult extends HasId, HasName, HasUrl {
  /**
   * Metadata related to the execution of this test result.
   */
  executionMetadata: TestExecutionMetadata;
  /**
   * The execution status.
   */
  status: "fail" | "pass" | "pending" | "skipped";
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TestExecutionMetadata extends HasUrl {
  //
}
