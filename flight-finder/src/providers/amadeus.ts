import "dotenv/config";

import type { ProviderOffer, ProviderSearchParams } from "../types/flight";
import type { FlightProvider } from "../types/search";

interface AmadeusTokenResponse {
  access_token: string;
}

interface AmadeusDestinationItem {
  destination: string;
  departureDate: string;
  returnDate?: string;
  price: {
    total: string;
    currency?: string;
  };
}

interface AmadeusDestinationsResponse {
  data?: AmadeusDestinationItem[];
  errors?: Array<{ detail?: string }>;
}

interface AmadeusOfferSegment {
  carrierCode?: string;
  departure?: {
    iataCode?: string;
    at?: string;
  };
  arrival?: {
    iataCode?: string;
  };
}

interface AmadeusOfferItinerary {
  segments?: AmadeusOfferSegment[];
}

interface AmadeusOfferItem {
  itineraries?: AmadeusOfferItinerary[];
  validatingAirlineCodes?: string[];
  price?: {
    total?: string;
    currency?: string;
  };
}

interface AmadeusOffersResponse {
  data?: AmadeusOfferItem[];
  errors?: Array<{ detail?: string }>;
}

const CURATED_FALLBACK_DESTINATIONS = [
  "LIS",
  "MAD",
  "BCN",
  "KEF",
  "DUB",
  "CDG",
  "BOG",
  "MEX",
  "CUN",
  "SJO",
  "LIM",
  "TPE",
  "NRT",
  "ICN",
  "BKK",
  "KUL",
  "SIN",
];
const MAX_FLIGHT_OFFERS_REQUESTS = 140;
const DEFAULT_OFFERS_PER_QUERY = 10;
const VERIFY_OFFERS_PER_QUERY = 25;
const AIRLINE_NAMES: Record<string, string> = {
  AC: "Air Canada",
  AF: "Air France",
  AM: "Aeromexico",
  AV: "Avianca",
  BA: "British Airways",
  CM: "Copa Airlines",
  DL: "Delta Air Lines",
  FI: "Icelandair",
  IB: "Iberia",
  KL: "KLM",
  LH: "Lufthansa",
  TK: "Turkish Airlines",
  TP: "TAP Air Portugal",
  TS: "Air Transat",
  UA: "United Airlines",
  WS: "WestJet",
};

export class AmadeusProvider implements FlightProvider {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl: string;

  public constructor() {
    this.clientId = process.env.AMADEUS_CLIENT_ID ?? "";
    this.clientSecret = process.env.AMADEUS_CLIENT_SECRET ?? "";
    this.baseUrl = process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com";
  }

  public async searchAnywhere(params: ProviderSearchParams): Promise<ProviderOffer[]> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "Amadeus credentials are missing. Set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in your environment.",
      );
    }

    const token = await this.getAccessToken();

    const airlineFilter = this.resolveAirlineFilter(params.airline);

    if (params.destinations && params.destinations.length > 0) {
      const targeted = await this.searchWithDestinationDateSweep(token, params, params.destinations);
      if (targeted.length > 0) {
        const initial = this.postProcess(targeted, params.maxBudget, params.maxResults, airlineFilter);
        return this.verifyAndFinalize(token, params, initial);
      }
      throw new Error("Destination/date sweep returned 0 results.");
    }

    if (airlineFilter.raw && !params.destinations?.length) {
      const airlineSweep = await this.searchWithDestinationDateSweep(token, params, CURATED_FALLBACK_DESTINATIONS);
      if (airlineSweep.length > 0) {
        const initial = this.postProcess(airlineSweep, params.maxBudget, params.maxResults, airlineFilter);
        return this.verifyAndFinalize(token, params, initial);
      }
      throw new Error(`No results found for airline filter '${airlineFilter.raw}'.`);
    }

    let primaryError: string | undefined;
    try {
      const primary = await this.searchWithFlightDestinations(token, params);
      if (primary.length > 0) {
        const initial = this.postProcess(primary, params.maxBudget, params.maxResults, airlineFilter);
        return this.verifyAndFinalize(token, params, initial);
      }
      this.log("flight-destinations returned 0 results. Falling back to flight-offers.");
    } catch (error: unknown) {
      primaryError = error instanceof Error ? error.message : "Unknown flight-destinations error";
      this.log(`Primary strategy failed: ${primaryError}`);
    }

    let fallbackError: string | undefined;
    try {
      const fallback = await this.searchWithFlightOffersFallback(token, params);
      if (fallback.length > 0) {
        const initial = this.postProcess(fallback, params.maxBudget, params.maxResults, airlineFilter);
        return this.verifyAndFinalize(token, params, initial);
      }
      fallbackError = "flight-offers fallback returned 0 results";
    } catch (error: unknown) {
      fallbackError = error instanceof Error ? error.message : "Unknown flight-offers fallback error";
    }

    throw new Error(
      `All provider strategies failed. Primary: ${primaryError ?? "no primary results"}. Fallback: ${fallbackError ?? "no fallback results"}.`,
    );
  }

  private async getAccessToken(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const url = `${this.baseUrl}/v1/security/oauth2/token`;
    this.log(`Request URL: ${url}`);
    this.log(`Query params: grant_type=client_credentials`);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    this.log(`HTTP status: ${res.status}`);

    if (!res.ok) {
      const text = await res.text();
      this.log(`Raw response body: ${text}`);
      throw new Error(`Amadeus auth failed (${res.status})`);
    }

    const json = (await res.json()) as AmadeusTokenResponse;
    if (!json.access_token) {
      throw new Error("Amadeus auth response did not include an access token.");
    }

    return json.access_token;
  }

  private async searchWithFlightDestinations(
    accessToken: string,
    params: ProviderSearchParams,
  ): Promise<ProviderOffer[]> {
    const query = new URLSearchParams({
      origin: params.origin,
      departureDate: `${params.departureStart},${params.departureEnd}`,
      oneWay: params.tripType === "one_way" ? "true" : "false",
      currencyCode: "CAD",
      max: String(Math.max(5, Math.min(params.maxResults * 3, 250))),
      viewBy: "DATE",
    });

    if (params.tripType === "round_trip" && params.returnStart && params.returnEnd) {
      query.set("returnDate", `${params.returnStart},${params.returnEnd}`);
    }

    if (typeof params.maxBudget === "number") {
      query.set("maxPrice", String(Math.floor(params.maxBudget)));
    }

    if (typeof params.maxStops === "number" && params.maxStops === 0) {
      query.set("nonStop", "true");
    }

    const url = `${this.baseUrl}/v1/shopping/flight-destinations?${query.toString()}`;
    const json = await this.fetchJson<AmadeusDestinationsResponse>(url, accessToken);

    const offers = (json.data ?? [])
      .map((item): ProviderOffer | null => {
        const amount = Number(item.price.total);
        if (Number.isNaN(amount)) {
          return null;
        }

        return {
          destinationCode: item.destination,
          amount,
          currency: item.price.currency ?? "CAD",
          departDate: item.departureDate,
          returnDate: params.tripType === "round_trip" ? item.returnDate : undefined,
          bookingLink: this.buildGoogleFlightsLink(
            params.origin,
            item.destination,
            item.departureDate,
            params.tripType === "round_trip" ? item.returnDate : undefined,
          ),
          googleFlightsLink: this.buildGoogleFlightsLink(
            params.origin,
            item.destination,
            item.departureDate,
            params.tripType === "round_trip" ? item.returnDate : undefined,
          ),
        };
      })
      .filter((offer): offer is ProviderOffer => offer !== null);

    return offers;
  }

  private async searchWithFlightOffersFallback(
    accessToken: string,
    params: ProviderSearchParams,
  ): Promise<ProviderOffer[]> {
    return this.searchWithDestinationDateSweep(accessToken, params, CURATED_FALLBACK_DESTINATIONS);
  }

  private async searchWithDestinationDateSweep(
    accessToken: string,
    params: ProviderSearchParams,
    destinations: string[],
  ): Promise<ProviderOffer[]> {
    const departureDates = this.listDates(params.departureStart, params.departureEnd);
    const returnDates =
      params.tripType === "round_trip" && params.returnStart && params.returnEnd
        ? this.listDates(params.returnStart, params.returnEnd)
        : [];

    let requestCount = 0;
    const collected: ProviderOffer[] = [];

    for (const destinationCode of destinations) {
      for (const departureDate of departureDates) {
        if (params.tripType === "round_trip") {
          for (const returnDate of returnDates) {
            if (returnDate < departureDate) {
              continue;
            }
            if (requestCount >= MAX_FLIGHT_OFFERS_REQUESTS) {
              this.log(
                `Reached request cap (${MAX_FLIGHT_OFFERS_REQUESTS}) during destination/date sweep; returning partial results.`,
              );
              return collected;
            }

            requestCount += 1;
            const extracted = await this.fetchFlightOffersForRoute(
              accessToken,
              params,
              destinationCode,
              departureDate,
              returnDate,
              DEFAULT_OFFERS_PER_QUERY,
            );
            collected.push(...extracted);
          }
          continue;
        }

        if (requestCount >= MAX_FLIGHT_OFFERS_REQUESTS) {
          this.log(
            `Reached request cap (${MAX_FLIGHT_OFFERS_REQUESTS}) during destination/date sweep; returning partial results.`,
          );
          return collected;
        }

        requestCount += 1;
        const extracted = await this.fetchFlightOffersForRoute(
          accessToken,
          params,
          destinationCode,
          departureDate,
          undefined,
          DEFAULT_OFFERS_PER_QUERY,
        );
        collected.push(...extracted);
      }
    }

    return collected;
  }

  private async fetchFlightOffersForRoute(
    accessToken: string,
    params: ProviderSearchParams,
    destinationCode: string,
    departureDate: string,
    returnDate?: string,
    maxOffers = DEFAULT_OFFERS_PER_QUERY,
  ): Promise<ProviderOffer[]> {
    const query = new URLSearchParams({
      originLocationCode: params.origin,
      destinationLocationCode: destinationCode,
      departureDate,
      adults: "1",
      max: String(maxOffers),
      currencyCode: "CAD",
    });

    const airlineFilter = this.resolveAirlineFilter(params.airline);
    if (airlineFilter.code) {
      query.set("includedAirlineCodes", airlineFilter.code);
    }

    if (returnDate) {
      query.set("returnDate", returnDate);
    }

    if (typeof params.maxBudget === "number") {
      query.set("maxPrice", String(Math.floor(params.maxBudget)));
    }

    if (typeof params.maxStops === "number" && params.maxStops === 0) {
      query.set("nonStop", "true");
    }

    const url = `${this.baseUrl}/v2/shopping/flight-offers?${query.toString()}`;

    try {
      const json = await this.fetchJson<AmadeusOffersResponse>(url, accessToken);
      return this.extractOffersFromFlightOffers(
        json,
        params.tripType,
        params.origin,
        destinationCode,
        params.maxStops,
        this.resolveAirlineFilter(params.airline),
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.log(`Route search failed ${params.origin}->${destinationCode} on ${departureDate}: ${message}`);
      return [];
    }
  }

  private extractOffersFromFlightOffers(
    payload: AmadeusOffersResponse,
    tripType: ProviderSearchParams["tripType"],
    originCode: string,
    destinationCode: string,
    maxStops?: number,
    airlineFilter?: { raw?: string; code?: string; normalizedName?: string },
  ): ProviderOffer[] {
    return (payload.data ?? [])
      .map((offer): ProviderOffer | null => {
        const price = Number(offer.price?.total ?? "");
        if (Number.isNaN(price)) {
          return null;
        }

        const itineraries = offer.itineraries ?? [];
        const firstItinerary = itineraries[0];
        const lastItinerary = itineraries[itineraries.length - 1];

        const departDate = this.segmentDate(firstItinerary?.segments?.[0]);
        if (!departDate) {
          return null;
        }

        const returnDate =
          tripType === "round_trip" && itineraries.length > 1
            ? this.segmentDate(lastItinerary?.segments?.[0])
            : undefined;
        const stops = this.countStops(itineraries);
        const airlineCode = this.bestAirlineCode(offer, firstItinerary);
        const airlineName = airlineCode ? AIRLINE_NAMES[airlineCode] : undefined;

        if (typeof maxStops === "number" && stops > maxStops) {
          return null;
        }

        if (airlineFilter && !this.matchesAirline(airlineCode, airlineName, airlineFilter)) {
          return null;
        }

        return {
          destinationCode,
          amount: price,
          currency: offer.price?.currency ?? "CAD",
          departDate,
          returnDate,
          stops,
          airlineCode,
          airlineName,
          bookingLink: this.buildGoogleFlightsLink(originCode, destinationCode, departDate, returnDate),
          googleFlightsLink: this.buildGoogleFlightsLink(originCode, destinationCode, departDate, returnDate),
        };
      })
      .filter((item): item is ProviderOffer => item !== null);
  }

  private segmentDate(segment?: AmadeusOfferSegment): string | undefined {
    const departureDateTime = segment?.departure?.at;
    if (!departureDateTime) {
      return undefined;
    }

    return departureDateTime.slice(0, 10);
  }

  private countStops(itineraries: AmadeusOfferItinerary[]): number {
    return itineraries.reduce((sum, itinerary) => {
      const segments = itinerary.segments ?? [];
      return sum + Math.max(0, segments.length - 1);
    }, 0);
  }

  private async verifyAndFinalize(
    accessToken: string,
    params: ProviderSearchParams,
    offers: ProviderOffer[],
  ): Promise<ProviderOffer[]> {
    const verified = await this.verifyTopRoutes(accessToken, params, offers);
    return this.postProcess(verified, params.maxBudget, params.maxResults, this.resolveAirlineFilter(params.airline));
  }

  private async verifyTopRoutes(
    accessToken: string,
    params: ProviderSearchParams,
    offers: ProviderOffer[],
  ): Promise<ProviderOffer[]> {
    if (offers.length === 0) {
      return offers;
    }

    const verifyCount = Math.min(offers.length, Math.max(3, Math.min(params.maxResults, 8)));
    const result = [...offers];

    for (let i = 0; i < verifyCount; i += 1) {
      const candidate = result[i];
      const refreshed = await this.fetchFlightOffersForRoute(
        accessToken,
        params,
        candidate.destinationCode,
        candidate.departDate,
        candidate.returnDate,
        VERIFY_OFFERS_PER_QUERY,
      );

      if (refreshed.length === 0) {
        continue;
      }

      const bestRefreshed = refreshed.reduce((best, current) => (current.amount < best.amount ? current : best), refreshed[0]);
      if (bestRefreshed.amount <= candidate.amount) {
        result[i] = {
          ...candidate,
          amount: bestRefreshed.amount,
          currency: bestRefreshed.currency,
          stops: bestRefreshed.stops,
          airlineCode: bestRefreshed.airlineCode,
          airlineName: bestRefreshed.airlineName,
          bookingLink: bestRefreshed.bookingLink,
          googleFlightsLink: bestRefreshed.googleFlightsLink,
        };
      }
    }

    return result;
  }

  private postProcess(
    offers: ProviderOffer[],
    maxBudget: number | undefined,
    maxResults: number,
    airlineFilter?: { raw?: string; code?: string; normalizedName?: string },
  ): ProviderOffer[] {
    const filtered = offers.filter((offer) => {
      const withinBudget = typeof maxBudget === "number" ? offer.amount <= maxBudget : true;
      const airlineMatch = airlineFilter ? this.matchesAirline(offer.airlineCode, offer.airlineName, airlineFilter) : true;
      return withinBudget && airlineMatch;
    });

    const dedupedByDestination = new Map<string, ProviderOffer>();
    for (const offer of filtered) {
      const existing = dedupedByDestination.get(offer.destinationCode);
      if (!existing || offer.amount < existing.amount) {
        dedupedByDestination.set(offer.destinationCode, offer);
      }
    }

    return [...dedupedByDestination.values()].sort((a, b) => a.amount - b.amount).slice(0, maxResults);
  }

  private async fetchJson<T>(url: string, accessToken: string): Promise<T> {
    const urlObj = new URL(url);
    this.log(`Request URL: ${urlObj.origin}${urlObj.pathname}`);
    this.log(`Query params: ${urlObj.searchParams.toString()}`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    this.log(`HTTP status: ${res.status}`);

    const rawBody = await res.text();
    if (!res.ok) {
      this.log(`Raw response body: ${rawBody}`);
      throw new Error(`Amadeus request failed (${res.status})`);
    }

    return JSON.parse(rawBody) as T;
  }

  private log(message: string): void {
    console.log(`[amadeus] ${message}`);
  }

  private bestAirlineCode(offer: AmadeusOfferItem, firstItinerary?: AmadeusOfferItinerary): string | undefined {
    if (offer.validatingAirlineCodes && offer.validatingAirlineCodes.length > 0) {
      return offer.validatingAirlineCodes[0];
    }
    return firstItinerary?.segments?.[0]?.carrierCode;
  }

  private resolveAirlineFilter(rawAirline: string | undefined): { raw?: string; code?: string; normalizedName?: string } {
    if (!rawAirline) {
      return {};
    }

    const raw = rawAirline.trim();
    if (!raw) {
      return {};
    }

    const upper = raw.toUpperCase();
    if (/^[A-Z0-9]{2}$/.test(upper)) {
      return { raw, code: upper };
    }

    const normalizedName = this.normalizeAirlineName(raw);
    const matchedCode = Object.entries(AIRLINE_NAMES).find(
      ([, name]) => this.normalizeAirlineName(name) === normalizedName,
    )?.[0];

    return {
      raw,
      code: matchedCode,
      normalizedName,
    };
  }

  private matchesAirline(
    offerCode: string | undefined,
    offerName: string | undefined,
    filter: { raw?: string; code?: string; normalizedName?: string },
  ): boolean {
    if (!filter.raw) {
      return true;
    }

    if (filter.code && offerCode && offerCode.toUpperCase() === filter.code) {
      return true;
    }

    if (filter.normalizedName) {
      const offerNameNorm = this.normalizeAirlineName(offerName ?? "");
      if (offerNameNorm === filter.normalizedName) {
        return true;
      }
    }

    return false;
  }

  private normalizeAirlineName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  private buildGoogleFlightsLink(
    originCode: string,
    destinationCode: string,
    departDate: string,
    returnDate?: string,
  ): string {
    const trip = returnDate
      ? `Flights from ${originCode} to ${destinationCode} on ${departDate}, return ${returnDate}`
      : `Flights from ${originCode} to ${destinationCode} on ${departDate}`;
    return `https://www.google.com/travel/flights?q=${encodeURIComponent(trip)}`;
  }

  private listDates(start: string, end: string): string[] {
    const dates: string[] = [];
    const cursor = new Date(`${start}T00:00:00Z`);
    const last = new Date(`${end}T00:00:00Z`);

    while (cursor <= last) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
  }
}
