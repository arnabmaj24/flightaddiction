import type { FlightResult } from "../types/flight";

export function rankByCheapest(results: FlightResult[], maxResults?: number): FlightResult[] {
  const sorted = [...results].sort((a, b) => a.price - b.price);

  if (typeof maxResults !== "number") {
    return sorted;
  }

  return sorted.slice(0, Math.max(0, maxResults));
}
