import type { TestResults } from "../../models/test-results-model.js";
import { Drain } from "../drain.js";
import type { AdaptiveCardMessage } from "./microsoft-teams-cards.js";
import { getTestResultsCard } from "./microsoft-teams-cards.js";

export class MicrosoftTeamsDrain extends Drain<
  { incomingWebhookUrl: string },
  AdaptiveCardMessage
> {
  public async writeTestResults(results: TestResults): Promise<AdaptiveCardMessage> {
    const card = getTestResultsCard(results, { ["ID"]: results.id, ["Name"]: results.name });
    const response = await fetch(this.configuration.incomingWebhookUrl, {
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
