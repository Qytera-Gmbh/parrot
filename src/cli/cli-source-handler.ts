import type { Source } from "../sources/source.js";

export interface SourceHandler<S extends Source<unknown>, C, P = Parameters<S["getTestResults"]>> {
  buildSource: () => Promise<S>;
  restoreSource: (savedConfiguration: C) => Promise<S> | S;
  restoreSourceParameters: (
    savedParameters: P
  ) => Parameters<S["getTestResults"]> | Promise<Parameters<S["getTestResults"]>>;
}
