export type TripType = "one_way" | "round_trip";

export interface SearchParams {
  origin?: string;
  destinations?: string[];
  regions?: string[];
  countries?: string[];
  airline?: string;
  banTransitCountries?: string[];
  tripType: TripType;
  departureStart: string;
  departureEnd: string;
  returnStart?: string;
  returnEnd?: string;
  maxStops?: number;
  maxBudget?: number;
  maxResults?: number;
}

export interface FlightResult {
  destination: string;
  destinationCode: string;
  price: number;
  currency: string;
  departDate: string;
  returnDate?: string;
  stops?: number;
  airlineCode?: string;
  airlineName?: string;
  lastVerifiedAt?: string;
  bookingLink?: string;
  googleFlightsLink?: string;
}

export interface ProviderSearchParams {
  origin: string;
  destinations?: string[];
  regions?: string[];
  countries?: string[];
  airline?: string;
  banTransitCountries?: string[];
  tripType: TripType;
  departureStart: string;
  departureEnd: string;
  returnStart?: string;
  returnEnd?: string;
  maxStops?: number;
  maxBudget?: number;
  maxResults: number;
}

export interface ProviderOffer {
  destinationCode: string;
  destinationName?: string;
  amount: number;
  currency: string;
  departDate: string;
  returnDate?: string;
  stops?: number;
  airlineCode?: string;
  airlineName?: string;
  lastVerifiedAt?: string;
  bookingLink?: string;
  googleFlightsLink?: string;
}
