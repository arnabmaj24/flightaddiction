import type { ProviderSearchParams, SearchParams } from "../types/flight";

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

function assertDateRange(start: string, end: string, label: string): void {
  if (!isValidDate(start) || !isValidDate(end)) {
    throw new Error(`${label} dates must use YYYY-MM-DD format.`);
  }
  if (start > end) {
    throw new Error(`${label} start date must be on or before end date.`);
  }
}

export function validateAndBuildParams(input: SearchParams): ProviderSearchParams {
  const origin = (input.origin ?? "YYZ").toUpperCase();
  const destinations = input.destinations?.map((d) => d.toUpperCase().trim()).filter((d) => d.length > 0);
  const airline = input.airline?.trim();
  const maxResults = input.maxResults ?? 10;

  if (input.tripType !== "one_way" && input.tripType !== "round_trip") {
    throw new Error("tripType must be either 'one_way' or 'round_trip'.");
  }

  if (!/^[A-Z]{3}$/.test(origin)) {
    throw new Error("origin must be a valid 3-letter IATA airport code.");
  }

  if (destinations && destinations.some((d) => !/^[A-Z]{3}$/.test(d))) {
    throw new Error("Each destination must be a valid 3-letter IATA airport code.");
  }

  if (maxResults <= 0) {
    throw new Error("maxResults must be greater than 0.");
  }

  if (typeof input.maxStops === "number" && input.maxStops < 0) {
    throw new Error("maxStops cannot be negative.");
  }

  if (typeof input.maxBudget === "number" && input.maxBudget <= 0) {
    throw new Error("maxBudget must be greater than 0.");
  }

  assertDateRange(input.departureStart, input.departureEnd, "Departure");

  if (input.tripType === "round_trip") {
    if (!input.returnStart || !input.returnEnd) {
      throw new Error("returnStart and returnEnd are required for round_trip searches.");
    }
    assertDateRange(input.returnStart, input.returnEnd, "Return");
  }

  return {
    origin,
    destinations,
    airline,
    tripType: input.tripType,
    departureStart: input.departureStart,
    departureEnd: input.departureEnd,
    returnStart: input.returnStart,
    returnEnd: input.returnEnd,
    maxStops: input.maxStops,
    maxBudget: input.maxBudget,
    maxResults,
  };
}
