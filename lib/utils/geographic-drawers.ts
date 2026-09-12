import { BookmarkWithDetails } from "@/lib/db/queries";

export interface GeographicDrawerDef {
  id: string;
  romanNumeral: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface PopulatedDrawer extends GeographicDrawerDef {
  bookmarks: BookmarkWithDetails[];
  count: number;
}

export const GEOGRAPHIC_DRAWER_DEFS: GeographicDrawerDef[] = [
  {
    id: "drawer-east-coast",
    romanNumeral: "DRAWER I",
    title: "New York & East Coast",
    subtitle: "Mid-Atlantic & New England Archives",
    description: "Letterpress and promotional bookmarks from Greenwich Village, Manhattan, Boston, and historic East Coast bookshops.",
  },
  {
    id: "drawer-west-coast",
    romanNumeral: "DRAWER II",
    title: "California & West Coast",
    subtitle: "Pacific & Counterculture Presses",
    description: "Beat Generation keepsakes, North Beach imprints, and independent bookstore specimens across California and the Pacific Northwest.",
  },
  {
    id: "drawer-europe",
    romanNumeral: "DRAWER III",
    title: "Paris, UK & European Archive",
    subtitle: "Continental & Transatlantic Salons",
    description: "Expatriate stamps, Left Bank Paris bookshops, London antiquarian dealers, and continental European literary institutions.",
  },
  {
    id: "drawer-midwest",
    romanNumeral: "DRAWER IV",
    title: "Midwest & Heartland",
    subtitle: "Great Lakes & Prairie Booksellers",
    description: "Historic Loop department emporiums, college town bookshops, and Heartland literary archives.",
  },
  {
    id: "drawer-south",
    romanNumeral: "DRAWER V",
    title: "American South & Sunbelt",
    subtitle: "Southern Gothic & Sunbelt Imprints",
    description: "Venerable French Quarter antiquarians, Southern university presses, and independent bookstores across the South.",
  },
  {
    id: "drawer-international",
    romanNumeral: "DRAWER VI",
    title: "International & World Editions",
    subtitle: "Global Archival Specimens",
    description: "Bookmarks gathered from independent booksellers and historic book districts around the world.",
  },
  {
    id: "drawer-all",
    romanNumeral: "MASTER DRAWER",
    title: "Complete Archival Collection",
    subtitle: "All Regions & Specimen Trays",
    description: "The complete chronological archive of all specimen bookmarks across every region and era.",
  },
];

const EAST_COAST_STATES = new Set([
  "NY", "NEW YORK", "MA", "MASSACHUSETTS", "PA", "PENNSYLVANIA", "NJ", "NEW JERSEY",
  "CT", "CONNECTICUT", "ME", "MAINE", "NH", "NEW HAMPSHIRE", "VT", "VERMONT",
  "RI", "RHODE ISLAND", "DC", "DISTRICT OF COLUMBIA", "MD", "MARYLAND", "DE", "DELAWARE"
]);

const WEST_COAST_STATES = new Set([
  "CA", "CALIFORNIA", "WA", "WASHINGTON", "OR", "OREGON", "NV", "NEVADA",
  "HI", "HAWAII", "AK", "ALASKA"
]);

const MIDWEST_STATES = new Set([
  "IL", "ILLINOIS", "OH", "OHIO", "MI", "MICHIGAN", "IN", "INDIANA",
  "WI", "WISCONSIN", "MN", "MINNESOTA", "IA", "IOWA", "MO", "MISSOURI",
  "KS", "KANSAS", "NE", "NEBRASKA", "ND", "NORTH DAKOTA", "SD", "SOUTH DAKOTA",
  "OK", "OKLAHOMA"
]);

const SOUTH_STATES = new Set([
  "TX", "TEXAS", "GA", "GEORGIA", "FL", "FLORIDA", "NC", "NORTH CAROLINA",
  "SC", "SOUTH CAROLINA", "TN", "TENNESSEE", "AL", "ALABAMA", "MS", "MISSISSIPPI",
  "LA", "LOUISIANA", "AR", "ARKANSAS", "VA", "VIRGINIA", "KY", "KENTUCKY", "WV", "WEST VIRGINIA",
  "AZ", "ARIZONA", "NM", "NEW MEXICO", "CO", "COLORADO", "UT", "UTAH"
]);

const EUROPE_COUNTRIES = new Set([
  "FRANCE", "UNITED KINGDOM", "UK", "GREAT BRITAIN", "ENGLAND", "SCOTLAND", "WALES",
  "IRELAND", "NORTHERN IRELAND", "GERMANY", "ITALY", "SPAIN", "NETHERLANDS", "HOLLAND",
  "SWITZERLAND", "AUSTRIA", "BELGIUM", "PORTUGAL", "SWEDEN", "NORWAY", "DENMARK",
  "FINLAND", "GREECE", "POLAND", "CZECH REPUBLIC", "CZECHIA", "HUNGARY", "ICELAND"
]);

export function classifyBookmarkRegion(bookmark: BookmarkWithDetails): string {
  const store = bookmark.bookstore;
  if (!store) return "drawer-all";

  const country = (store.country || "United States").trim().toUpperCase();
  const state = (store.stateProvince || "").trim().toUpperCase();
  const city = (store.city || "").trim().toLowerCase();

  // 1. European countries or cities
  if (EUROPE_COUNTRIES.has(country) || city === "paris" || city === "london" || city === "edinburgh" || city === "dublin" || city === "berlin" || city === "rome" || city === "amsterdam" || city === "madrid") {
    return "drawer-europe";
  }

  // 2. Non-US and non-European countries
  if (country !== "UNITED STATES" && country !== "USA" && country !== "US") {
    return "drawer-international";
  }

  // 3. United States regional classifications
  // Check West Coast
  if (WEST_COAST_STATES.has(state) || city === "san francisco" || city === "los angeles" || city === "seattle" || city === "portland" || city === "berkeley" || city === "oakland" || city === "san diego") {
    return "drawer-west-coast";
  }

  // Check East Coast
  if (EAST_COAST_STATES.has(state) || city === "new york" || city === "brooklyn" || city === "manhattan" || city === "queens" || city === "boston" || city === "philadelphia" || city === "cambridge" || city === "washington") {
    return "drawer-east-coast";
  }

  // Check Midwest
  if (MIDWEST_STATES.has(state) || city === "chicago" || city === "minneapolis" || city === "detroit" || city === "cleveland" || city === "indianapolis" || city === "milwaukee" || city === "broken arrow" || city === "tulsa") {
    return "drawer-midwest";
  }

  // Check South
  if (SOUTH_STATES.has(state) || city === "new orleans" || city === "austin" || city === "atlanta" || city === "houston" || city === "dallas" || city === "nashville" || city === "miami") {
    return "drawer-south";
  }

  // Default fallback for unassigned US states
  return "drawer-east-coast";
}

export function getGeographicDrawers(bookmarks: BookmarkWithDetails[]): PopulatedDrawer[] {
  // Master collection holds all bookmarks
  const masterDrawerBookmarks = [...bookmarks];

  const drawerMap = new Map<string, BookmarkWithDetails[]>();
  for (const def of GEOGRAPHIC_DRAWER_DEFS) {
    if (def.id !== "drawer-all") {
      drawerMap.set(def.id, []);
    }
  }

  for (const bm of bookmarks) {
    const regionId = classifyBookmarkRegion(bm);
    const list = drawerMap.get(regionId);
    if (list) {
      list.push(bm);
    } else {
      // Fallback
      drawerMap.get("drawer-east-coast")?.push(bm);
    }
  }

  return GEOGRAPHIC_DRAWER_DEFS.map((def) => {
    const regionalBookmarks = def.id === "drawer-all" ? masterDrawerBookmarks : (drawerMap.get(def.id) || []);
    return {
      ...def,
      bookmarks: regionalBookmarks,
      count: regionalBookmarks.length,
    };
  });
}
