# flight-finder

TypeScript project implementing **Mode 1** flight discovery: find the cheapest flights from Toronto (YYZ by default) to any destination in a date range.

## Scope

Implemented in this project:
- Provider abstraction with Amadeus Flight Destinations integration
- Input validation
- Provider response normalization into internal `FlightResult`
- Ranking by cheapest price
- Reusable API: `searchAnywhere(params: SearchParams): Promise<FlightResult[]>`
- CLI entrypoint for local testing
- Minimal OpenClaw plugin wrapper with `flight-search` command

Not implemented (intentionally):
- Points search
- Route optimization
- Alerts
- Background jobs

## Install

1. Go to project directory:

```bash
cd flight-finder
```

2. Install dependencies:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Build:

```bash
npm run build
```

## Environment Variables

Set these values in `.env`:

- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `AMADEUS_BASE_URL` (optional, default `https://test.api.amadeus.com`)

Notes:
- Mode 1 uses Amadeus `flight-destinations` API (destination discovery from origin).
- Prices are Amadeus-provided fares and may be cached/indicative.

## CLI Usage

Build first, then run:

```bash
node dist/cli/main.js --origin YYZ --start 2026-05-01 --end 2026-05-20
```

Optional flags:
- `--tripType one_way|round_trip` (default `one_way`)
- `--destinations CUN,LIS,BOG` (optional list of target destination airports)
- `--regions "East Asia,Southeast Asia"` (optional region tags; expands to airport groups)
- `--countries "China,Japan"` (optional country tags; expands to airport groups)
- `--airline UA` or `--airline "United Airlines"` (optional airline filter)
- `--banTransitCountries "US,..."` (optional transit-country ban list; default blocks `US`)
- `--returnStart YYYY-MM-DD`
- `--returnEnd YYYY-MM-DD`
- `--maxStops <number>`
- `--maxBudget <number>`
- `--maxResults <number>` (default `10`)

Example with destination/date sweep:

```bash
node dist/cli/main.js --origin YYZ --destinations CUN,LIS,BOG,KEF,NRT --start 2026-05-01 --end 2026-05-03 --maxResults 5
```

Example using region/country tags:

```bash
node dist/cli/main.js --origin YYZ --regions "East Asia" --countries "China" --tripType one_way --start 2026-05-01 --end 2026-05-03 --maxResults 5
```

Example round-trip with airline filter:

```bash
node dist/cli/main.js --origin YYZ --countries "Japan" --airline "Air Canada" --tripType round_trip --start 2026-05-01 --end 2026-05-05 --returnStart 2026-05-10 --returnEnd 2026-05-15 --maxResults 5
```

## Architecture

Project structure:

- `src/types/flight.ts`
  - Defines `SearchParams`, `FlightResult`, and provider-level types.
- `src/types/search.ts`
  - Defines provider interface (`FlightProvider`).
- `src/providers/amadeus.ts`
  - Isolated Amadeus provider implementation (OAuth + flight-destinations), env-driven credentials.
- `src/core/validate.ts`
  - Validates and normalizes input params.
- `src/core/normalize.ts`
  - Converts provider offers into internal `FlightResult` records.
- `src/core/rank.ts`
  - Sorts normalized results by lowest price.
- `src/index.ts`
  - Exposes `searchAnywhere(params)` reusable function.
- `src/cli/main.ts`
  - Command-line runner for Mode 1 testing.
- `src/plugin/index.ts`
  - Minimal OpenClaw plugin wrapper registering `flight-search`.

## Programmatic Use

```ts
import { searchAnywhere } from "./src";

const results = await searchAnywhere({
  origin: "YYZ",
  tripType: "one_way",
  departureStart: "2026-05-01",
  departureEnd: "2026-05-20",
  maxResults: 5,
});

console.log(results);
```
