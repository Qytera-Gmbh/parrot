import { confirm } from "@inquirer/prompts";
import { DrainHandler } from "../../cli-drain-handler.js";
import type { StdOutOutlet } from "./stdout-drain.js";
import { StdOutDrain } from "./stdout-drain.js";

export class StdOutDrainHandler extends DrainHandler<StdOutDrain> {
  public buildDrain(): StdOutDrain {
    return new StdOutDrain({});
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public serializeDrain(drain: StdOutDrain): object {
    return {};
  }

  public deserializeDrain(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serializedDrain: object
  ): StdOutDrain {
    return new StdOutDrain({});
  }

  public async buildOutlet(): Promise<StdOutOutlet> {
    return {
      useColor: await this.getColorSupport(),
      useUnicode: await this.getUnicodeSupport(),
    };
  }

  public serializeOutlet(outlet: StdOutOutlet): StdOutOutlet {
    // No secret data to omit, just use all outlet configuration values.
    return outlet;
  }

  public deserializeOutlet(serializedOutlet: StdOutOutlet): StdOutOutlet {
    // No secret data to omit, just use all outlet configuration values.
    return serializedOutlet;
  }

  private async getColorSupport() {
    return await confirm({
      message: "Enable colored output?",
    });
  }

  private async getUnicodeSupport() {
    return await confirm({
      message: "Include Unicode characters in output?",
    });
  }
}
