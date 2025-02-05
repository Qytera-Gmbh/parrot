import type { TestResults } from "../models/test-results-model.js";

/**
 * A source represents a service or tool from which test information can be pulled, such as an Xray
 * test execution, an Azure DevOps test run or a simple Excel sheet.
 */
export abstract class Source<ConfigurationType, SourceDetails> {
  /**
   * The source configuration. It is used during serialization and deserialization of the source.
   */
  protected readonly configuration: ConfigurationType;

  /**
   * Constructs a new source based on the configuration provided.
   *
   * @param configuration the source configuration
   */
  constructor(configuration: ConfigurationType) {
    this.configuration = configuration;
  }

  /**
   * Returns the configuration of the source instance.
   *
   * @returns the configuration
   */
  public getConfiguration(): ConfigurationType {
    return this.configuration;
  }

  /**
   * Retrieves test results from the source, containing one or more tests and their results.
   *
   * @param source the source to retrieve results from
   * @returns the test results
   */
  public abstract getTestResults(source: SourceDetails): Promise<TestResults> | TestResults;
}
