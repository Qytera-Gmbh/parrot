import type { Source } from "../sources/source.js";

/**
 * A source handler is responsible for building a source from scratch and for restoring sources from
 * partial configurations. It is also responsible for restoring method parameters, such that a
 * source may be built and immediately used in a programmatic fashion.
 */
export abstract class SourceHandler<
  S extends Source<unknown, object>,
  SerializedSourceConfiguration = SourceConfiguration<S>,
  SerializedInletConfiguration = InletConfiguration<S>,
> {
  /**
   * Creates and returns a fully initialised source instance. The source can be generated from
   * environment variables or interactively created using packages such as
   * [`@inquirer/prompts`](https://www.npmjs.com/package/@inquirer/prompts).
   *
   * @returns the source instance
   */
  public abstract buildSource(): Promise<S> | S;

  /**
   * Serializes the given source instance into a format suitable for storage. The result must be
   * JSON serializable and need not include all source details. Sensitive values should be omitted
   * or replaced with reconstructible placeholders (e.g., authentication details may be encoded as
   * `{ authentication: "basic" }` instead of storing the credentials in cleartext).
   *
   * The actual serialization format is up to the implementation. Anything goes, as long as the
   * corresponding deserialization method is able to accurately reconstruct the source.
   *
   * @param source the source instance to serialize
   * @returns the JSON-serializable serialized source
   */
  public abstract serializeSource(
    source: S
  ): Promise<SerializedSourceConfiguration> | SerializedSourceConfiguration;

  /**
   * Restores a source instance from a previously serialized configuration. The returned
   * configuration may be incomplete and require additional input during deserialization.
   *
   * The implementation must be able to restore what has been produced by `serializeSource`. Any
   * missing or omitted details must be filled in from external sources (e.g. environment variables
   * or user input).
   *
   * @param serializedSource the serialized source
   * @returns the restored source
   */
  public abstract deserializeSource(
    serializedSource: SerializedSourceConfiguration
  ): Promise<S> | S;

  /**
   * Constructs and returns the parameters required for retrieving test results. Parameters can be
   * generated from environment variables or interactively created using packages such as
   * [`@inquirer/prompts`](https://www.npmjs.com/package/@inquirer/prompts).
   *
   * @returns the inlet configuration
   */
  public abstract buildInlet(): InletConfiguration<S> | Promise<InletConfiguration<S>>;

  /**
   * Serializes the given source retrieval parameters into a format suitable for storage. The result
   * must be JSON serializable and need not include all source details. Sensitive values should be
   * omitted or replaced with reconstructible placeholders (e.g., authentication details may be
   * encoded as `{ authentication: "basic" }` instead of storing the credentials in cleartext).
   *
   * The actual serialization format is up to the implementation. Anything goes, as long as the
   * corresponding deserialization method is able to accurately reconstruct the parameters.
   *
   * @param inlet the inlet configuration
   * @returns the JSON-serializable parameters
   */
  public abstract serializeInlet(
    inlet: InletConfiguration<S>
  ): Promise<SerializedInletConfiguration> | SerializedInletConfiguration;

  /**
   * Restores test result inlet parameters from a previously serialized configuration. The returned
   * parameters may be incomplete and require additional input during deserialization.
   *
   * The implementation must be able to restore what was produced by `serializeSourceParameters`.
   * Any missing or omitted details must be filled in from external sources (e.g. environment
   * variables or user input).
   *
   * @param serializedInlet the serialized inlet
   * @returns the restored inlet parameters
   */
  public abstract deserializeInlet(
    serializedInlet: SerializedInletConfiguration
  ): InletConfiguration<S> | Promise<InletConfiguration<S>>;
}

type SourceConfiguration<S> = S extends Source<infer SC, object> ? SC : never;
type InletConfiguration<S> = S extends Source<unknown, infer IC> ? IC : never;

// We use any here because I have no idea how to type/infer all the different source types.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnySourceHandler = SourceHandler<Source<any, any>, any, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */
