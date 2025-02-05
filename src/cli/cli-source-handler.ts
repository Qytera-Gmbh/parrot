import type { Source } from "../sources/source.js";

/**
 * A source handler is responsible for building a source from scratch and for restoring sources from
 * partial configurations. It is also responsible for restoring method parameters, such that a
 * source may be built and immediately used in a programmatic fashion.
 */
export interface SourceHandler<S extends Source<unknown>, C, P = Parameters<S["getTestResults"]>> {
  /**
   * Builds the source from scratch.
   *
   * @returns the source
   */
  buildSource: () => Promise<S>;
  /**
   * Restores a source from a saved configuration. The configuration may be incomplete and may
   * require additional input, which is up to the handler implementation.
   *
   * @param savedConfiguration the saved configuration
   * @returns the source
   */
  restoreSource: (savedConfiguration: C) => Promise<S> | S;
  /**
   * Restores a source test results call from a (subset of) saved parameters.
   *
   * @param savedParameters the saved parameters
   * @returns the complete parameters to use for a test results retrieval
   */
  restoreSourceParameters: (
    savedParameters: P
  ) => Parameters<S["getTestResults"]> | Promise<Parameters<S["getTestResults"]>>;
}
