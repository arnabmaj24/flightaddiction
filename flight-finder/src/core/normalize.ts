import type { FlightResult, ProviderOffer } from "../types/flight";

const airportNames: Record<string, string> = {
  BCN: "Barcelona",
  BKK: "Bangkok",
  BOG: "Bogota",
  CDG: "Paris",
  CUN: "Cancun",
  DUB: "Dublin",
  ICN: "Seoul",
  KEF: "Reykjavik",
  KUL: "Kuala Lumpur",
  LIM: "Lima",
  LIS: "Lisbon",
  MAD: "Madrid",
  MEX: "Mexico City",
  NRT: "Tokyo",
  SIN: "Singapore",
  SJO: "San Jose",
  TPE: "Taipei",
};

const airlineNames: Record<string, string> = {
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

export function normalizeOffers(offers: ProviderOffer[]): FlightResult[] {
  return offers.map((offer) => {
    const price = Number(offer.amount);

    return {
      destination: offer.destinationName ?? airportNames[offer.destinationCode] ?? offer.destinationCode,
      destinationCode: offer.destinationCode,
      price: Number.isFinite(price) ? price : 0,
      currency: offer.currency,
      departDate: offer.departDate,
      returnDate: offer.returnDate,
      stops: offer.stops,
      airlineCode: offer.airlineCode,
      airlineName: offer.airlineName ?? (offer.airlineCode ? airlineNames[offer.airlineCode] : undefined),
      bookingLink: offer.bookingLink,
      googleFlightsLink: offer.googleFlightsLink,
    };
  });
}
