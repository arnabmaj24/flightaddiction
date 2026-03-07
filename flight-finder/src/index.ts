import { normalizeOffers } from "./core/normalize";
import { rankByCheapest } from "./core/rank";
import { validateAndBuildParams } from "./core/validate";
import { AmadeusProvider } from "./providers/amadeus";
import type { FlightResult, SearchParams } from "./types/flight";
import type { FlightProvider } from "./types/search";

export async function searchAnywhere(params: SearchParams): Promise<FlightResult[]> {
  const validated = validateAndBuildParams(params);
  const provider: FlightProvider = new AmadeusProvider();

  const offers = await provider.searchAnywhere(validated);
  const normalized = normalizeOffers(offers);
  return rankByCheapest(normalized, validated.maxResults);
}

export type { SearchParams, FlightResult } from "./types/flight";
