import type { TestResult } from "./models/test-model.js";

/**
 * A drain represents a service or tool to which test information can be pushed, such as Slack,
 * Microsoft Teams or simply the standard output.
 */
export abstract class Drain<Configuration, Outlet extends object, DrainResult = void> {
  /**
   * The drain configuration. It is used during serialization and deserialization of the drain.
   */
  protected readonly configuration: Configuration;

  /**
   * Constructs a new drain based on the configuration provided.
   *
   * @param configuration the drain configuration
   */
  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  /**
   * Returns the configuration of the drain instance.
   *
   * @returns the configuration
   */
  public getConfiguration(): Readonly<Configuration> {
    return this.configuration;
  }

  /**
   * Writes test results, containing one or more tests and their results.
   *
   * @param results the results to write
   * @param outlet the outlet to drain to
   * @returns the drained result
   */
  public abstract writeTestResults(
    results: TestResult[],
    outlet: Outlet
  ): DrainResult | Promise<DrainResult>;
}
