import { input } from "@inquirer/prompts";
import { getEnv } from "../../../../util/env.js";
import { DrainHandler } from "../../../cli-drain-handler.js";
import type { MicrosoftTeamsOutlet } from "./microsoft-teams-drain.js";
import { MicrosoftTeamsDrain } from "./microsoft-teams-drain.js";

export class MicrosoftTeamsDrainHandler extends DrainHandler<
  MicrosoftTeamsDrain,
  SerializedConfiguration,
  SerializedParameters
> {
  public buildDrain(): MicrosoftTeamsDrain {
    return new MicrosoftTeamsDrain({});
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public serializeDrain(drain: MicrosoftTeamsDrain): SerializedConfiguration {
    return {};
  }

  public deserializeDrain(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serializedDrain: SerializedConfiguration
  ): MicrosoftTeamsDrain {
    return new MicrosoftTeamsDrain({});
  }

  public async buildOutlet(): Promise<MicrosoftTeamsOutlet> {
    return {
      incomingWebhookUrl: await this.getWebhookUrl(),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public serializeOutlet(parameters: MicrosoftTeamsOutlet): SerializedParameters {
    return {};
  }

  public async deserializeOutlet(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    serializedParameters: SerializedParameters
  ): Promise<MicrosoftTeamsOutlet> {
    return {
      incomingWebhookUrl: await this.getWebhookUrl(),
    };
  }

  private async getWebhookUrl(): Promise<string> {
    return (
      getEnv("microsoft-teams-webhook-url", false) ??
      (await input({
        message: `What is the Webhook URL of your Microsoft Teams Channel?`,
      }))
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SerializedConfiguration {
  // Nothing. Currently, nothing must be configured in a Microsoft Teams drain handler.
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SerializedParameters {
  // Nothing. Currently, only the web hook URL is required, which is private information.
}
