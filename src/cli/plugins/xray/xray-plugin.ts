import { configureParrot } from "../../cli-config.js";
import { XrayTestPlanSourceHandler } from "./test-plan/xray-test-plan-source-handler.js";

await configureParrot(() => {
  return {
    sources: {
      ["xray"]: {
        ["test plan"]: new XrayTestPlanSourceHandler(),
      },
    },
  };
});
