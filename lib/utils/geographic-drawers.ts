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
    id: "drawer-state-ny",
    romanNumeral: "DRAWER I",
    title: "New York",
    subtitle: "New York Archive",
    description: "Bookmarks from Greenwich Village, Manhattan, Brooklyn, and historic New York bookshops.",
  },
  {
    id: "drawer-state-ca",
    romanNumeral: "DRAWER II",
    title: "California",
    subtitle: "California Archive",
    description: "San Francisco, North Beach, Los Angeles, and California independent presses.",
  },
  {
    id: "drawer-state-il",
    romanNumeral: "DRAWER III",
    title: "Illinois",
    subtitle: "Illinois Archive",
    description: "Historic Chicago Loop department emporiums, college bookshops, and Midwest imprints.",
  },
  {
    id: "drawer-state-ok",
    romanNumeral: "DRAWER IV",
    title: "Oklahoma",
    subtitle: "Oklahoma Archive",
    description: "Heartland archives, Tulsa, Broken Arrow, and Oklahoma booksellers.",
  },
  {
    id: "drawer-state-ma",
    romanNumeral: "DRAWER V",
    title: "Massachusetts",
    subtitle: "Massachusetts Archive",
    description: "Boston, Cambridge, and historic New England antiquarian dealers.",
  },
  {
    id: "drawer-state-pa",
    romanNumeral: "DRAWER VI",
    title: "Pennsylvania",
    subtitle: "Pennsylvania Archive",
    description: "Philadelphia, Pittsburgh, and historic Keystone State bookshops.",
  },
  {
    id: "drawer-state-tx",
    romanNumeral: "DRAWER VII",
    title: "Texas",
    subtitle: "Texas Archive",
    description: "Austin, San Antonio, Dallas, Houston, and Lone Star State presses.",
  },
  {
    id: "drawer-state-wa-or",
    romanNumeral: "DRAWER VIII",
    title: "Washington & Oregon",
    subtitle: "Pacific Northwest Archive",
    description: "Seattle, Portland, and Pacific Northwest independent booksellers.",
  },
  {
    id: "drawer-state-la",
    romanNumeral: "DRAWER IX",
    title: "Louisiana",
    subtitle: "Louisiana Archive",
    description: "French Quarter antiquarians, New Orleans literary salons, and Southern presses.",
  },
  {
    id: "drawer-state-other-us",
    romanNumeral: "DRAWER X",
    title: "Other US States",
    subtitle: "National Collection",
    description: "Specimens gathered from independent bookshops across all other US states.",
  },
  {
    id: "drawer-international",
    romanNumeral: "DRAWER XI",
    title: "Other Countries",
    subtitle: "International Archive",
    description: "Bookmarks gathered from France, the UK, Europe, and international booksellers worldwide.",
  },
  {
    id: "drawer-all",
    romanNumeral: "MASTER DRAWER",
    title: "All Specimens",
    subtitle: "Complete Archive",
    description: "The complete chronological archive of all specimen bookmarks across all states and countries.",
  },
];

export function classifyBookmarkRegion(bookmark: BookmarkWithDetails): string {
  const store = bookmark.bookstore;
  if (!store) return "drawer-all";

  const country = (store.country || "United States").trim().toUpperCase();
  const state = (store.stateProvince || "").trim().toUpperCase();
  const city = (store.city || "").trim().toLowerCase();

  // 1. Non-US and non-European countries or international
  if (
    (country !== "UNITED STATES" && country !== "USA" && country !== "US") ||
    city === "paris" ||
    city === "london" ||
    city === "edinburgh" ||
    city === "dublin" ||
    city === "berlin" ||
    city === "rome" ||
    city === "amsterdam" ||
    city === "madrid" ||
    city === "tokyo" ||
    city === "vancouver" ||
    city === "toronto"
  ) {
    return "drawer-international";
  }

  // 2. Specific US States
  if (
    state === "NY" ||
    state === "NEW YORK" ||
    city === "new york" ||
    city === "brooklyn" ||
    city === "manhattan" ||
    city === "queens"
  ) {
    return "drawer-state-ny";
  }

  if (
    state === "CA" ||
    state === "CALIFORNIA" ||
    city === "san francisco" ||
    city === "los angeles" ||
    city === "berkeley" ||
    city === "oakland" ||
    city === "san diego"
  ) {
    return "drawer-state-ca";
  }

  if (
    state === "IL" ||
    state === "ILLINOIS" ||
    city === "chicago" ||
    city === "evanston"
  ) {
    return "drawer-state-il";
  }

  if (
    state === "OK" ||
    state === "OKLAHOMA" ||
    city === "broken arrow" ||
    city === "tulsa" ||
    city === "oklahoma city"
  ) {
    return "drawer-state-ok";
  }

  if (
    state === "MA" ||
    state === "MASSACHUSETTS" ||
    city === "boston" ||
    city === "cambridge"
  ) {
    return "drawer-state-ma";
  }

  if (
    state === "PA" ||
    state === "PENNSYLVANIA" ||
    city === "philadelphia" ||
    city === "pittsburgh"
  ) {
    return "drawer-state-pa";
  }

  if (
    state === "TX" ||
    state === "TEXAS" ||
    city === "austin" ||
    city === "houston" ||
    city === "dallas" ||
    city === "san antonio"
  ) {
    return "drawer-state-tx";
  }

  if (
    state === "WA" ||
    state === "WASHINGTON" ||
    state === "OR" ||
    state === "OREGON" ||
    city === "seattle" ||
    city === "portland"
  ) {
    return "drawer-state-wa-or";
  }

  if (
    state === "LA" ||
    state === "LOUISIANA" ||
    city === "new orleans"
  ) {
    return "drawer-state-la";
  }

  // Fallback for other US states (Ohio, Georgia, Florida, Colorado, etc.)
  return "drawer-state-other-us";
}

export function getGeographicDrawers(bookmarks: BookmarkWithDetails[]): PopulatedDrawer[] {
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
      drawerMap.get("drawer-state-other-us")?.push(bm);
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
