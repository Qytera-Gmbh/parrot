import type { TestResults } from "../../models/test-results-model.js";
import type { Drain } from "../drain.js";
import type { AdaptiveCardMessage } from "./cards.js";
import { getTestResultsCard } from "./cards.js";

export class MicrosoftTeamsDrain implements Drain<AdaptiveCardMessage> {
  private readonly incomingWebhookUrl: string;

  constructor(config: { incomingWebhookUrl: string }) {
    this.incomingWebhookUrl = config.incomingWebhookUrl;
  }

  public async writeTestResults(results: TestResults): Promise<AdaptiveCardMessage> {
    const card = getTestResultsCard(results, { ["ID"]: results.id, ["Name"]: results.name });
    const response = await fetch(this.incomingWebhookUrl, {
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
