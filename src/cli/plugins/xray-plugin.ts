import { XrayTestPlanSourceHandler } from "../../sources/xray/test-plan/xray-test-plan-source-handler.js";
import { configureParrot } from "../cli-config.js";

await configureParrot((config) => {
  return {
    sources: {
      ...config.sources,
      ["xray"]: {
        ["test plan"]: new XrayTestPlanSourceHandler(),
      },
    },
  };
});
