import type { TestResults } from "../models/test-results-model.js";

/**
 * A drain represents a service or tool to which test information can be pushed, such as Slack,
 * Microsoft Teams or simply the standard output.
 */
export abstract class Drain<ConfigurationType, DrainOutput> {
  /**
   * The drain configuration. It is used during serialization and deserialization of the drain.
   */
  protected readonly configuration: ConfigurationType;

  /**
   * Constructs a new drain based on the configuration provided.
   *
   * @param configuration the drain configuration
   */
  constructor(configuration: ConfigurationType) {
    this.configuration = configuration;
  }
  /**
   * Writes test results, containing one or more tests and their results.
   *
   * @param results the results to write
   * @returns the drained result
   */
  public abstract writeTestResults(results: TestResults): Promise<DrainOutput>;
}
