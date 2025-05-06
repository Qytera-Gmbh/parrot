import { configureParrot } from "../../cli-config.js";
import { StdOutDrainHandler } from "./stdout-drain-handler.js";

await configureParrot(() => {
  return {
    drains: {
      ["stdout"]: new StdOutDrainHandler(),
    },
  };
});
