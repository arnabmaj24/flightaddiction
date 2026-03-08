interface CatalogEntry {
  label: string;
  airports: string[];
  aliases: string[];
}

const REGION_CATALOG: Record<string, CatalogEntry> = {
  east_asia: {
    label: "East Asia",
    airports: ["HND", "NRT", "KIX", "ICN", "GMP", "PEK", "PVG", "CAN", "HKG", "TPE"],
    aliases: ["east asia", "e asia", "eastasia", "northeast asia", "north east asia"],
  },
  southeast_asia: {
    label: "Southeast Asia",
    airports: ["SIN",, "BKK", "DMK", "CGK", "DPS", "MNL", "SGN", "HAN", "CEB"],
    aliases: ["southeast asia", "south east asia", "se asia", "sea"],
  },
  south_asia: {
    label: "South Asia",
    airports: ["DEL", "BOM", "BLR", "HYD", "MAA", "CMB", "DAC", "KTM", "COK"],
    aliases: ["south asia", "s asia", "indian subcontinent"],
  },
  middle_east: {
    label: "Middle East",
    airports: ["DXB", "AUH", "DOH", "RUH", "JED", "KWI", "BAH", "MCT", "AMM"],
    aliases: ["middle east", "gulf", "mea"],
  },
  western_europe: {
    label: "Western Europe",
    airports: ["LHR", "CDG", "AMS", "FRA", "MUC", "MAD", "BCN", "ZRH", "VIE", "DUB"],
    aliases: ["western europe", "west europe", "w europe", "europe west"],
  },
  eastern_europe: {
    label: "Eastern Europe",
    airports: ["WAW", "PRG", "BUD", "OTP", "SOF", "BEG", "RIX", "TBS", "ATH"],
    aliases: ["eastern europe", "east europe", "e europe", "europe east"],
  },
  north_america: {
    label: "North America",
    airports: ["JFK", "EWR", "BOS", "IAD", "ATL", "ORD", "DFW", "LAX", "SFO", "MEX"],
    aliases: ["north america", "na", "n america"],
  },
  latin_america_caribbean: {
    label: "Latin America",
    airports: ["BOG", "LIM", "SCL", "EZE", "GRU", "GIG", "CUN", "PTY", "SJO", "MEX"],
    aliases: ["latin america", "latam", "south america", "central america", "caribbean"],
  },
  oceania: {
    label: "Oceania",
    airports: ["SYD", "MEL", "BNE", "PER", "ADL", "AKL", "CHC", "WLG", "NAN"],
    aliases: ["oceania", "australia nz", "australasia"],
  },
  africa: {
    label: "Africa",
    airports: ["JNB", "CPT", "DUR", "CAI", "CMN", "NBO", "ADD", "LOS", "ACC", "DAR"],
    aliases: ["africa", "sub saharan africa"],
  },
};

const COUNTRY_CATALOG: Record<string, CatalogEntry> = {
  china: {
    label: "China",
    airports: ["PEK", "PKX", "PVG", "CAN", "SZX", "CTU", "XIY"],
    aliases: ["china", "cn", "mainland china"],
  },
  japan: {
    label: "Japan",
    airports: ["HND", "NRT", "KIX", "NGO", "FUK", "CTS"],
    aliases: ["japan", "jp"],
  },
  south_korea: {
    label: "South Korea",
    airports: ["ICN", "GMP", "PUS", "CJU"],
    aliases: ["south korea", "korea", "kr", "republic of korea"],
  },
  hong_kong: {
    label: "Hong Kong",
    airports: ["HKG"],
    aliases: ["hong kong", "hk"],
  },
  taiwan: {
    label: "Taiwan",
    airports: ["TPE", "KHH", "TSA"],
    aliases: ["taiwan", "tw"],
  },
  singapore: {
    label: "Singapore",
    airports: ["SIN"],
    aliases: ["singapore", "sg"],
  },
  thailand: {
    label: "Thailand",
    airports: ["BKK", "DMK", "HKT", "CNX", "KBV"],
    aliases: ["thailand", "th"],
  },
  malaysia: {
    label: "Malaysia",
    airports: ["KUL", "PEN", "BKI", "LGK", "JHB"],
    aliases: ["malaysia", "my"],
  },
  indonesia: {
    label: "Indonesia",
    airports: ["CGK", "DPS", "SUB", "KNO", "UPG"],
    aliases: ["indonesia", "id"],
  },
  vietnam: {
    label: "Vietnam",
    airports: ["SGN", "HAN", "DAD", "CXR", "PQC"],
    aliases: ["vietnam", "vn"],
  },
  philippines: {
    label: "Philippines",
    airports: ["MNL", "CEB", "CRK", "DVO"],
    aliases: ["philippines", "ph"],
  },
  india: {
    label: "India",
    airports: ["DEL", "BOM", "BLR", "HYD", "MAA", "CCU", "GOI", "COK"],
    aliases: ["india", "in"],
  },
  uae: {
    label: "United Arab Emirates",
    airports: ["DXB", "AUH", "SHJ"],
    aliases: ["uae", "united arab emirates", "ae"],
  },
  qatar: {
    label: "Qatar",
    airports: ["DOH"],
    aliases: ["qatar", "qa"],
  },
  turkey: {
    label: "Turkey",
    airports: ["IST", "SAW", "AYT"],
    aliases: ["turkey", "tr", "turkiye"],
  },
  uk: {
    label: "United Kingdom",
    airports: ["LHR", "LGW", "MAN", "EDI", "BHX"],
    aliases: ["united kingdom", "uk", "great britain", "gb"],
  },
  france: {
    label: "France",
    airports: ["CDG", "ORY", "NCE", "LYS", "MRS"],
    aliases: ["france", "fr"],
  },
  germany: {
    label: "Germany",
    airports: ["FRA", "MUC", "BER", "DUS", "HAM"],
    aliases: ["germany", "de"],
  },
  spain: {
    label: "Spain",
    airports: ["MAD", "BCN", "PMI", "AGP", "SVQ"],
    aliases: ["spain", "es"],
  },
  italy: {
    label: "Italy",
    airports: ["FCO", "MXP", "VCE", "NAP", "CTA"],
    aliases: ["italy", "it"],
  },
  portugal: {
    label: "Portugal",
    airports: ["LIS", "OPO", "FAO"],
    aliases: ["portugal", "pt"],
  },
  netherlands: {
    label: "Netherlands",
    airports: ["AMS", "EIN", "RTM"],
    aliases: ["netherlands", "nl", "holland"],
  },
  usa: {
    label: "United States",
    airports: ["JFK", "EWR", "BOS", "IAD", "ATL", "ORD", "DFW", "LAX", "SFO", "MIA"],
    aliases: ["united states", "usa", "us", "america"],
  },
  canada: {
    label: "Canada",
    airports: ["YYZ", "YVR", "YUL", "YYC", "YOW", "YEG"],
    aliases: ["canada", "ca"],
  },
  mexico: {
    label: "Mexico",
    airports: ["MEX", "CUN", "GDL", "MTY", "PVR"],
    aliases: ["mexico", "mx"],
  },
  brazil: {
    label: "Brazil",
    airports: ["GRU", "GIG", "BSB", "CNF"],
    aliases: ["brazil", "br"],
  },
  colombia: {
    label: "Colombia",
    airports: ["BOG", "MDE", "CTG", "CLO"],
    aliases: ["colombia", "co"],
  },
  peru: {
    label: "Peru",
    airports: ["LIM", "CUZ", "AQP"],
    aliases: ["peru", "pe"],
  },
  australia: {
    label: "Australia",
    airports: ["SYD", "MEL", "BNE", "PER", "ADL", "OOL", "CNS"],
    aliases: ["australia", "au"],
  },
  new_zealand: {
    label: "New Zealand",
    airports: ["AKL", "CHC", "WLG", "ZQN"],
    aliases: ["new zealand", "nz"],
  },
  south_africa: {
    label: "South Africa",
    airports: ["JNB", "CPT", "DUR"],
    aliases: ["south africa", "za"],
  },
  egypt: {
    label: "Egypt",
    airports: ["CAI", "HRG", "SSH"],
    aliases: ["egypt", "eg"],
  },
  kenya: {
    label: "Kenya",
    airports: ["NBO", "MBA"],
    aliases: ["kenya", "ke"],
  },
  ethiopia: {
    label: "Ethiopia",
    airports: ["ADD"],
    aliases: ["ethiopia", "et"],
  },
  morocco: {
    label: "Morocco",
    airports: ["CMN", "RAK", "AGA"],
    aliases: ["morocco", "ma"],
  },
};

function normalizeKey(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function buildAliasMap(catalog: Record<string, CatalogEntry>): Map<string, string> {
  const map = new Map<string, string>();

  for (const [key, entry] of Object.entries(catalog)) {
    map.set(normalizeKey(key), key);
    map.set(normalizeKey(entry.label), key);
    for (const alias of entry.aliases) {
      map.set(normalizeKey(alias), key);
    }
  }

  return map;
}

const REGION_ALIAS_MAP = buildAliasMap(REGION_CATALOG);
const COUNTRY_ALIAS_MAP = buildAliasMap(COUNTRY_CATALOG);

export interface CatalogResolution {
  airports: string[];
  unknownRegions: string[];
  unknownCountries: string[];
}

export function resolveCatalogAirports(regions?: string[], countries?: string[]): CatalogResolution {
  const resolvedAirports = new Set<string>();
  const unknownRegions: string[] = [];
  const unknownCountries: string[] = [];

  for (const region of regions ?? []) {
    const key = REGION_ALIAS_MAP.get(normalizeKey(region));
    if (!key) {
      unknownRegions.push(region);
      continue;
    }

    for (const airport of REGION_CATALOG[key].airports) {
      resolvedAirports.add(airport);
    }
  }

  for (const country of countries ?? []) {
    const key = COUNTRY_ALIAS_MAP.get(normalizeKey(country));
    if (!key) {
      unknownCountries.push(country);
      continue;
    }

    for (const airport of COUNTRY_CATALOG[key].airports) {
      resolvedAirports.add(airport);
    }
  }

  return {
    airports: [...resolvedAirports],
    unknownRegions,
    unknownCountries,
  };
}

export function listSupportedRegions(): string[] {
  return Object.values(REGION_CATALOG)
    .map((entry) => entry.label)
    .sort((a, b) => a.localeCompare(b));
}

export function listSupportedCountries(): string[] {
  return Object.values(COUNTRY_CATALOG)
    .map((entry) => entry.label)
    .sort((a, b) => a.localeCompare(b));
}
