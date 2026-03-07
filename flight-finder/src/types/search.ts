import type { ProviderOffer, ProviderSearchParams } from "./flight";

export interface FlightProvider {
  searchAnywhere(params: ProviderSearchParams): Promise<ProviderOffer[]>;
}
