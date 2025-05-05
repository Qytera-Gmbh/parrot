import type { Drain } from "../drains/drain.js";

/**
 * A drain handler is responsible for building a drain from scratch and for restoring drains from
 * partial configurations. It is also responsible for restoring method parameters, such that a
 * drain may be built and immediately used in a programmatic fashion.
 */
export abstract class DrainHandler<
  D extends Drain<unknown, object, unknown>,
  SerializedDrainConfiguration,
  SerializedParameters = Parameters<D["writeTestResults"]>[1],
> {
  /**
   * Creates and returns a fully initialised drain instance. The drain can be generated from
   * environment variables or interactively created using packages such as
   * [`@inquirer/prompts`](https://www.npmjs.com/package/@inquirer/prompts).
   *
   * @returns the drain instance
   */
  public abstract buildDrain(): D | Promise<D>;

  /**
   * Serializes the given drain instance into a format suitable for storage. The result must be
   * JSON serializable and need not include all drain details. Sensitive values should be omitted
   * or replaced with reconstructible placeholders (e.g., authentication details may be encoded as
   * `{ authentication: "basic" }` instead of storing the credentials in cleartext).
   *
   * The actual serialization format is up to the implementation. Anything goes, as long as the
   * corresponding deserialization method is able to accurately reconstruct the drain.
   *
   * @param drain the drain instance to serialize
   * @returns the JSON-serializable serialized drain
   */
  public abstract serializeDrain(
    drain: D
  ): Promise<SerializedDrainConfiguration> | SerializedDrainConfiguration;

  /**
   * Restores a drain instance from a previously serialized configuration. The returned
   * configuration may be incomplete and require additional input during deserialization.
   *
   * The implementation must be able to restore what has been produced by `serializeDrain`. Any
   * missing or omitted details must be filled in from external drain (e.g. environment variables
   * or user input).
   *
   * @param serializedDrain the serialized drain
   * @returns the restored drain
   */
  public abstract deserializeDrain(serializedDrain: SerializedDrainConfiguration): D | Promise<D>;

  /**
   * Constructs and returns the parameters required for writing test results. Parameters can be
   * generated from environment variables or interactively created using packages such as
   * [`@inquirer/prompts`](https://www.npmjs.com/package/@inquirer/prompts).
   *
   * @returns the parameters
   */
  public abstract buildDrainParameters():
    | Parameters<D["writeTestResults"]>[1]
    | Promise<Parameters<D["writeTestResults"]>[1]>;

  /**
   * Serializes the given drain writing parameters into a format suitable for storage. The result
   * must be JSON serializable and need not include all drain details. Sensitive values should be
   * omitted or replaced with reconstructible placeholders (e.g., authentication details may be
   * encoded as `{ authentication: "basic" }` instead of storing the credentials in cleartext).
   *
   * The actual serialization format is up to the implementation. Anything goes, as long as the
   * corresponding deserialization method is able to accurately reconstruct the parameters.
   *
   * @param parameters the complete parameters
   * @returns the JSON-serializable parameters
   */
  public abstract serializeDrainParameters(
    parameters: Parameters<D["writeTestResults"]>[1]
  ): Promise<SerializedParameters> | SerializedParameters;

  /**
   * Restores test result writing parameters from a previously serialized configuration. The
   * returned parameters may be incomplete and require additional input during deserialization.
   *
   * The implementation must be able to restore what was produced by `serializeDrainParameters`.
   * Any missing or omitted details must be filled in from external sources (e.g. environment
   * variables or user input).
   *
   * @param serializedParameters the serialized parameters
   * @returns the restored parameters
   */
  public abstract deserializeDrainParameters(
    serializedParameters: SerializedParameters
  ): Parameters<D["writeTestResults"]>[1] | Promise<Parameters<D["writeTestResults"]>[1]>;
}

// We use any here because I have no idea how to type/infer all the different drain types.
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyDrainHandler = DrainHandler<Drain<any, any, any>, any>;
/* eslint-enable @typescript-eslint/no-explicit-any */
