import type { TestResults } from "../../models/test-results-model.js";
import { Drain } from "../drain.js";
import type { AdaptiveCardMessage } from "./microsoft-teams-cards.js";
import { getTestResultsCard } from "./microsoft-teams-cards.js";

export class MicrosoftTeamsDrain extends Drain<
  unknown,
  MicrosoftTeamsDrainDetails,
  AdaptiveCardMessage
> {
  public async writeTestResults(
    results: TestResults,
    details: MicrosoftTeamsDrainDetails
  ): Promise<AdaptiveCardMessage> {
    const card = getTestResultsCard(results, { ["ID"]: results.id, ["Name"]: results.name });
    const response = await fetch(details.incomingWebhookUrl, {
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
export interface MicrosoftTeamsDrainDetails {
  incomingWebhookUrl: string;
}
