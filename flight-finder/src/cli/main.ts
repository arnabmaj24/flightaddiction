import "dotenv/config";

import { searchAnywhere } from "../index";
import type { SearchParams, TripType } from "../types/flight";

function readArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) {
    return undefined;
  }
  return process.argv[idx + 1];
}

function parseNumberArg(name: string): number | undefined {
  const value = readArg(name);
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`--${name} must be a number`);
  }
  return parsed;
}

function parseDestinationsArg(): string[] | undefined {
  const raw = readArg("destinations");
  if (!raw) {
    return undefined;
  }

  const destinations = raw
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter((value) => value.length > 0);

  return destinations.length > 0 ? destinations : undefined;
}

async function main(): Promise<void> {
  const tripType = (readArg("tripType") as TripType | undefined) ?? "one_way";

  const start = readArg("start");
  const end = readArg("end");

  if (!start || !end) {
    throw new Error("Both --start and --end are required (YYYY-MM-DD).");
  }

  if (tripType === "round_trip" && (!readArg("returnStart") || !readArg("returnEnd"))) {
    throw new Error("For round_trip, both --returnStart and --returnEnd are required (YYYY-MM-DD).");
  }

  const params: SearchParams = {
    origin: readArg("origin") ?? "YYZ",
    destinations: parseDestinationsArg(),
    airline: readArg("airline"),
    tripType,
    departureStart: start,
    departureEnd: end,
    returnStart: readArg("returnStart"),
    returnEnd: readArg("returnEnd"),
    maxStops: parseNumberArg("maxStops"),
    maxBudget: parseNumberArg("maxBudget"),
    maxResults: parseNumberArg("maxResults") ?? 10,
  };

  const results = await searchAnywhere(params);
  const requested = params.maxResults ?? 10;

  console.log(`Top ${Math.min(requested, results.length)} cheapest destinations from ${params.origin}:`);
  console.log("");

  results.forEach((flight, index) => {
    const datePart = flight.returnDate ? `${flight.departDate} -> ${flight.returnDate}` : flight.departDate;
    const airlinePart = flight.airlineName ? ` - ${flight.airlineName}` : "";
    console.log(
      `${index + 1}. ${flight.destination} (${flight.destinationCode}) - ${flight.currency} ${flight.price} - ${datePart}${airlinePart}`,
    );
    if (flight.googleFlightsLink) {
      console.log(`   Google Flights: ${flight.googleFlightsLink}`);
    } else if (flight.bookingLink) {
      console.log(`   Booking: ${flight.bookingLink}`);
    }
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";

  if (message.includes("All provider strategies failed")) {
    console.error("Flight search failed. Possible causes:");
    console.error("- Amadeus sandbox instability");
    console.error("- overly broad search parameters");
    console.error("- API quota exceeded");
    console.error(`Details: ${message}`);
  } else {
    console.error(`Error: ${message}`);
  }

  process.exit(1);
});
