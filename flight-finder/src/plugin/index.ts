import { searchAnywhere } from "../index";
import type { FlightResult, SearchParams } from "../types/flight";

export interface OpenClawLikePlugin {
  name: string;
  register: (ctx: {
    registerCommand: (name: string, handler: (params: SearchParams) => Promise<FlightResult[]>) => void;
  }) => void;
}

export const flightFinderPlugin: OpenClawLikePlugin = {
  name: "flight-finder",
  register(ctx) {
    ctx.registerCommand("flight-search", async (params: SearchParams) => searchAnywhere(params));
  },
};

export { searchAnywhere };
