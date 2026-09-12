import { BookmarkWithDetails } from "@/lib/db/queries";

export interface GeographicDrawerDef {
  id: string;
  romanNumeral: string;
  title: string;
  stateCode: string;
  subtitle: string;
  description: string;
}

export interface PopulatedDrawer extends GeographicDrawerDef {
  bookmarks: BookmarkWithDetails[];
  count: number;
}

export const US_STATES_LIST: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

function toRoman(num: number): string {
  const lookup: { [key: string]: number } = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman;
}

// 50 State Drawers + 1 Other Countries Drawer = 51 total (4 columns wide)
export const GEOGRAPHIC_DRAWER_DEFS: GeographicDrawerDef[] = [
  ...US_STATES_LIST.map((st, idx) => ({
    id: `drawer-state-${st.code.toLowerCase()}`,
    romanNumeral: `DRAWER ${toRoman(idx + 1)}`,
    title: st.name,
    stateCode: st.code,
    subtitle: `${st.name} Archive`,
    description: `Specimen bookmarks gathered from independent and historic bookstores in ${st.name}.`,
  })),
  {
    id: "drawer-international",
    romanNumeral: `DRAWER ${toRoman(51)}`,
    title: "Other Countries",
    stateCode: "INTL",
    subtitle: "International Archive",
    description: "Bookmarks gathered from France, the UK, Europe, and international booksellers worldwide.",
  },
];

// Map lookup for fast state resolution
const STATE_NAME_TO_CODE = new Map<string, string>();
const STATE_CODE_TO_CODE = new Map<string, string>();

US_STATES_LIST.forEach((st) => {
  STATE_NAME_TO_CODE.set(st.name.toUpperCase(), st.code.toLowerCase());
  STATE_CODE_TO_CODE.set(st.code.toUpperCase(), st.code.toLowerCase());
});

// City overrides for major historic cities where state might be omitted or inferred
const CITY_TO_STATE_CODE: { [city: string]: string } = {
  "new york": "ny",
  "brooklyn": "ny",
  "manhattan": "ny",
  "queens": "ny",
  "san francisco": "ca",
  "los angeles": "ca",
  "berkeley": "ca",
  "oakland": "ca",
  "san diego": "ca",
  "chicago": "il",
  "evanston": "il",
  "broken arrow": "ok",
  "tulsa": "ok",
  "oklahoma city": "ok",
  "boston": "ma",
  "cambridge": "ma",
  "philadelphia": "pa",
  "pittsburgh": "pa",
  "austin": "tx",
  "houston": "tx",
  "dallas": "tx",
  "san antonio": "tx",
  "seattle": "wa",
  "portland": "or",
  "new orleans": "la",
};

export function classifyBookmarkRegion(bookmark: BookmarkWithDetails): string {
  const store = bookmark.bookstore;
  if (!store) return "drawer-international";

  const country = (store.country || "United States").trim().toUpperCase();
  const state = (store.stateProvince || "").trim().toUpperCase();
  const city = (store.city || "").trim().toLowerCase();

  // 1. Non-US Country or known international cities
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

  // 2. Direct State Code Lookup (e.g. "NY", "CA", "IL")
  if (state && STATE_CODE_TO_CODE.has(state)) {
    const code = STATE_CODE_TO_CODE.get(state)!;
    return `drawer-state-${code}`;
  }

  // 3. Full State Name Lookup (e.g. "NEW YORK", "CALIFORNIA")
  if (state && STATE_NAME_TO_CODE.has(state)) {
    const code = STATE_NAME_TO_CODE.get(state)!;
    return `drawer-state-${code}`;
  }

  // 4. City Fallback Lookup
  if (city && CITY_TO_STATE_CODE[city]) {
    return `drawer-state-${CITY_TO_STATE_CODE[city]}`;
  }

  // Default fallback for unassigned US states
  return "drawer-state-ny";
}

export function getGeographicDrawers(bookmarks: BookmarkWithDetails[]): PopulatedDrawer[] {
  const drawerMap = new Map<string, BookmarkWithDetails[]>();
  for (const def of GEOGRAPHIC_DRAWER_DEFS) {
    drawerMap.set(def.id, []);
  }

  for (const bm of bookmarks) {
    const regionId = classifyBookmarkRegion(bm);
    const list = drawerMap.get(regionId);
    if (list) {
      list.push(bm);
    } else {
      drawerMap.get("drawer-international")?.push(bm);
    }
  }

  return GEOGRAPHIC_DRAWER_DEFS.map((def) => {
    const regionalBookmarks = drawerMap.get(def.id) || [];
    return {
      ...def,
      bookmarks: regionalBookmarks,
      count: regionalBookmarks.length,
    };
  });
}
