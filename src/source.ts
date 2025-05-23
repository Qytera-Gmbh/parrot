import type { TestResult } from "./models/test-model.js";

/**
 * A source represents a service or tool from which test information can be pulled, such as an Xray
 * test execution, an Azure DevOps test run or a simple Excel sheet.
 */
export abstract class Source<Configuration, Inlet extends object> {
  /**
   * The source configuration. It is used during serialization and deserialization of the source.
   */
  protected readonly configuration: Configuration;

  /**
   * Constructs a new source based on the configuration provided.
   *
   * @param configuration the source configuration
   */
  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }

  /**
   * Returns the configuration of the source instance.
   *
   * @returns the configuration
   */
  public getConfiguration(): Readonly<Configuration> {
    return this.configuration;
  }

  /**
   * Retrieves test results from the source, containing one or more tests and their results.
   *
   * @param inlet the inlet to retrieve results from
   * @returns the test results
   */
  public abstract getTestResults(inlet: Inlet): Promise<TestResult[]> | TestResult[];
}
