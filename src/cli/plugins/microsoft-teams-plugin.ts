import { MicrosoftTeamsDrainHandler } from "../../drains/microsoft-teams/microsoft-teams-drain-handler.js";
import { configureParrot } from "../cli-config.js";

await configureParrot(() => {
  return {
    drains: {
      ["microsoft"]: {
        ["teams"]: {
          ["channel"]: new MicrosoftTeamsDrainHandler(),
        },
      },
    },
  };
});
