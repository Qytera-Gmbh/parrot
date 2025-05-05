import { configureParrot } from "../../../cli-config.js";
import { MicrosoftTeamsDrainHandler } from "./microsoft-teams-drain-handler.js";

await configureParrot(() => {
  return {
    drains: {
      ["microsoft"]: {
        ["teams"]: new MicrosoftTeamsDrainHandler(),
      },
    },
  };
});
