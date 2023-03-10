import { SSTConfig } from "sst";
import { WebStack } from "./stacks/WebStack";

export default {
  config() {
    return {
      name: "marble",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: "nodejs16.x",
      nodejs: {
        format: "esm",
      },
    });

    app.stack(WebStack);
  },
} satisfies SSTConfig;
