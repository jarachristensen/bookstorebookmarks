import { db } from "@/db";
import { bookmarks, bookstores, archivalMedia, Bookmark, Bookstore, ArchivalMedia } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export interface FilterOptions {
  search?: string;
  city?: string;
  era?: string; // e.g. "pre-1940", "1940-1960", "post-1960"
  status?: "all" | "open" | "historic";
  specialty?: string;
}

export type BookmarkWithDetails = Bookmark & {
  bookstore: (Bookstore & { archivalMedia: ArchivalMedia[] }) | null;
};

export type BookstoreWithDetails = Bookstore & {
  bookmarks: Bookmark[];
  archivalMedia: ArchivalMedia[];
};

/**
 * Fetch all bookmarks with joined bookstore details and historical media, applying optional filters.
 */
export async function getBookmarksWithBookstores(filters?: FilterOptions): Promise<BookmarkWithDetails[]> {
  const allBookmarks = await db.select().from(bookmarks).orderBy(asc(bookmarks.displayOrder), desc(bookmarks.yearProduced));
  const allBookstores = await db.select().from(bookstores);
  const allMedia = await db.select().from(archivalMedia).orderBy(asc(archivalMedia.displayOrder));

  // Map relations in memory for fast retrieval
  const bookstoreMap = new Map<string, Bookstore & { archivalMedia: ArchivalMedia[] }>();

  for (const store of allBookstores) {
    const media = allMedia.filter((m) => m.bookstoreId === store.id);
    bookstoreMap.set(store.id, { ...store, archivalMedia: media });
  }

  let results: BookmarkWithDetails[] = allBookmarks.map((bm) => ({
    ...bm,
    bookstore: bookstoreMap.get(bm.bookstoreId) || null,
  }));

  if (!filters) return results;

  const { search, city, era, status, specialty } = filters;

  if (city && city !== "all") {
    results = results.filter((bm) => bm.bookstore?.city.toLowerCase() === city.toLowerCase());
  }

  if (status && status !== "all") {
    if (status === "open") {
      results = results.filter((bm) => bm.bookstore?.isStillOperating === true);
    } else if (status === "historic") {
      results = results.filter((bm) => bm.bookstore?.isStillOperating === false);
    }
  }

  if (era && era !== "all") {
    results = results.filter((bm) => {
      const year = bm.yearProduced || bm.bookstore?.yearOpened || 0;
      if (era === "pre-1940") return year < 1940;
      if (era === "1940-1960") return year >= 1940 && year <= 1960;
      if (era === "post-1960") return year > 1960;
      return true;
    });
  }

  if (specialty && specialty !== "all") {
    results = results.filter((bm) => {
      if (!bm.bookstore?.specialties) return false;
      try {
        const specs: string[] = JSON.parse(bm.bookstore.specialties);
        return specs.some((s) => s.toLowerCase().includes(specialty.toLowerCase()));
      } catch {
        return false;
      }
    });
  }

  if (search && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    results = results.filter((bm) => {
      const titleMatch = bm.title.toLowerCase().includes(q);
      const accessionMatch = bm.accessionNo.toLowerCase().includes(q);
      const materialMatch = bm.material.toLowerCase().includes(q);
      const storeNameMatch = bm.bookstore?.name.toLowerCase().includes(q);
      const cityMatch = bm.bookstore?.city.toLowerCase().includes(q);
      const foundersMatch = bm.bookstore?.founders?.toLowerCase().includes(q);
      const blurbMatch = bm.bookstore?.historicalBlurb.toLowerCase().includes(q);
      const triviaMatch = bm.bookstore?.notablePatronsTrivia?.toLowerCase().includes(q);

      return (
        titleMatch ||
        accessionMatch ||
        materialMatch ||
        storeNameMatch ||
        cityMatch ||
        foundersMatch ||
        blurbMatch ||
        triviaMatch
      );
    });
  }

  return results;
}

/**
 * Fetch a single bookmark by its ID / slug.
 */
export async function getBookmarkBySlug(slug: string): Promise<BookmarkWithDetails | null> {
  const bm = await db.query.bookmarks.findFirst({
    where: eq(bookmarks.id, slug),
  });

  if (!bm) return null;

  const store = await db.query.bookstores.findFirst({
    where: eq(bookstores.id, bm.bookstoreId),
  });

  const media = await db.query.archivalMedia.findMany({
    where: eq(archivalMedia.bookstoreId, bm.bookstoreId),
    orderBy: [asc(archivalMedia.displayOrder)],
  });

  return {
    ...bm,
    bookstore: store ? { ...store, archivalMedia: media } : null,
  };
}

/**
 * Fetch all bookstores with their associated bookmarks and media.
 */
export async function getAllBookstores(): Promise<BookstoreWithDetails[]> {
  const allStores = await db.select().from(bookstores).orderBy(asc(bookstores.name));
  const allBookmarks = await db.select().from(bookmarks);
  const allMedia = await db.select().from(archivalMedia).orderBy(asc(archivalMedia.displayOrder));

  return allStores.map((store) => ({
    ...store,
    bookmarks: allBookmarks.filter((bm) => bm.bookstoreId === store.id),
    archivalMedia: allMedia.filter((m) => m.bookstoreId === store.id),
  }));
}

/**
 * Fetch a single bookstore by ID.
 */
export async function getBookstoreById(id: string): Promise<BookstoreWithDetails | null> {
  const store = await db.query.bookstores.findFirst({
    where: eq(bookstores.id, id),
  });

  if (!store) return null;

  const bms = await db.query.bookmarks.findMany({
    where: eq(bookmarks.bookstoreId, id),
    orderBy: [asc(bookmarks.displayOrder)],
  });

  const media = await db.query.archivalMedia.findMany({
    where: eq(archivalMedia.bookstoreId, id),
    orderBy: [asc(archivalMedia.displayOrder)],
  });

  return {
    ...store,
    bookmarks: bms,
    archivalMedia: media,
  };
}

/**
 * Get dynamic filter options available in the current database collection.
 */
export async function getFilterOptions(): Promise<{
  cities: string[];
  eras: { label: string; value: string }[];
  specialties: string[];
}> {
  const allStores = await db.select().from(bookstores);
  const cities = Array.from(new Set(allStores.map((s) => s.city))).filter(Boolean).sort();

  const specialtiesSet = new Set<string>();
  for (const store of allStores) {
    if (store.specialties) {
      try {
        const parsed: string[] = JSON.parse(store.specialties);
        parsed.forEach((s) => specialtiesSet.add(s));
      } catch {}
    }
  }

  return {
    cities,
    eras: [
      { label: "All Eras", value: "all" },
      { label: "Early Century (Pre-1940)", value: "pre-1940" },
      { label: "Mid-Century & Post-War (1940–1960)", value: "1940-1960" },
      { label: "Late 20th Century (Post-1960)", value: "post-1960" },
    ],
    specialties: Array.from(specialtiesSet).sort(),
  };
}
