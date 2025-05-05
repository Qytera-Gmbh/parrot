import ansiColors from "ansi-colors";
import type { TestResult } from "../../models/test-model.js";
import { Drain } from "../drain.js";
import type { AdaptiveCardMessage } from "./microsoft-teams-cards.js";
import { getTestResultsCard } from "./microsoft-teams-cards.js";

export class MicrosoftTeamsDrain extends Drain<unknown, MicrosoftTeamsOutlet, AdaptiveCardMessage> {
  /**
   * How many characters to print at the beginning and end of the URL when printing the webhook URL.
   */
  private static readonly CHARACTERS_SHOWN = 10;

  public async writeTestResults(
    results: TestResult[],
    outlet: MicrosoftTeamsOutlet
  ): Promise<AdaptiveCardMessage> {
    console.log(
      `Draining test results to ${ansiColors.cyan(`${outlet.incomingWebhookUrl.slice(0, MicrosoftTeamsDrain.CHARACTERS_SHOWN)}...${outlet.incomingWebhookUrl.slice(-MicrosoftTeamsDrain.CHARACTERS_SHOWN)}`)} ...`
    );
    const card = getTestResultsCard(results);
    const response = await fetch(outlet.incomingWebhookUrl, {
      body: JSON.stringify(card),
      headers: { ["Content-Type"]: "application/json" },
      method: "POST",
    });
    if (response.status !== 200) {
      console.log(await response.text());
    }
    return card;
  }
}

/**
 * The details of a Microsoft Teams drain where test results can be written to.
 */
export interface MicrosoftTeamsOutlet {
  incomingWebhookUrl: string;
}
