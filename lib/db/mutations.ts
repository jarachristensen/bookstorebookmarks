import { db } from "@/db";
import { bookmarks, bookstores, archivalMedia, Bookmark, Bookstore, ArchivalMedia } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface FullBookmarkInput {
  bookmark: {
    id?: string;
    bookstoreId?: string;
    title: string;
    accessionNo: string;
    frontImageUrl: string;
    backImageUrl?: string | null;
    yearProduced?: number | null;
    material: string;
    dimensions: string;
    condition: string;
    acquisitionDate?: string | null;
    acquisitionNotes?: string | null;
    isFeatured?: boolean;
    displayOrder?: number;
    accentColor?: string | null;
  };
  bookstore: {
    id?: string;
    name: string;
    city: string;
    stateProvince?: string | null;
    country: string;
    streetAddress?: string | null;
    yearOpened: number;
    yearClosed?: number | null;
    isStillOperating?: boolean;
    founders?: string | null;
    specialties?: string[];
    historicalBlurb: string;
    notablePatronsTrivia?: string[];
    websiteUrl?: string | null;
  };
  archivalMedia?: Array<{
    id?: string;
    mediaType: string;
    imageUrl: string;
    caption: string;
    sourcePublication?: string | null;
    publicationDate?: string | null;
    transcriptionText?: string | null;
    displayOrder?: number;
  }>;
}

/**
 * Generate a clean URL-friendly slug from a title/name string.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Upsert bookstore, bookmark, and associated media in a single transaction/operation.
 */
export async function saveBookmarkAndBookstore(data: FullBookmarkInput): Promise<string> {
  const now = new Date().toISOString();

  // 1. Prepare Bookstore ID & Data
  const bookstoreId = data.bookstore.id || generateSlug(data.bookstore.name);
  const bookstoreValues = {
    id: bookstoreId,
    name: data.bookstore.name,
    city: data.bookstore.city,
    stateProvince: data.bookstore.stateProvince || null,
    country: data.bookstore.country || "United States",
    streetAddress: data.bookstore.streetAddress || null,
    yearOpened: Number(data.bookstore.yearOpened) || 1900,
    yearClosed: data.bookstore.yearClosed ? Number(data.bookstore.yearClosed) : null,
    isStillOperating: Boolean(data.bookstore.isStillOperating),
    founders: data.bookstore.founders || null,
    specialties: JSON.stringify(data.bookstore.specialties || []),
    historicalBlurb: data.bookstore.historicalBlurb || "",
    notablePatronsTrivia: JSON.stringify(data.bookstore.notablePatronsTrivia || []),
    websiteUrl: data.bookstore.websiteUrl || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(bookstores).values(bookstoreValues).onConflictDoUpdate({
    target: bookstores.id,
    set: {
      ...bookstoreValues,
      createdAt: undefined, // preserve original creation timestamp
      updatedAt: now,
    },
  });

  // 2. Prepare Bookmark ID & Data
  const bookmarkId = data.bookmark.id || generateSlug(data.bookmark.title);
  const bookmarkValues = {
    id: bookmarkId,
    bookstoreId: bookstoreId,
    title: data.bookmark.title,
    accessionNo: data.bookmark.accessionNo,
    frontImageUrl: data.bookmark.frontImageUrl,
    backImageUrl: data.bookmark.backImageUrl || null,
    yearProduced: data.bookmark.yearProduced ? Number(data.bookmark.yearProduced) : null,
    material: data.bookmark.material || "Paper Cardstock",
    dimensions: data.bookmark.dimensions || "2.25\" × 7.5\"",
    condition: data.bookmark.condition || "Good",
    acquisitionDate: data.bookmark.acquisitionDate || null,
    acquisitionNotes: data.bookmark.acquisitionNotes || null,
    isFeatured: Boolean(data.bookmark.isFeatured),
    displayOrder: Number(data.bookmark.displayOrder) || 0,
    accentColor: data.bookmark.accentColor || "#881337",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(bookmarks).values(bookmarkValues).onConflictDoUpdate({
    target: bookmarks.id,
    set: {
      ...bookmarkValues,
      createdAt: undefined,
      updatedAt: now,
    },
  });

  // 3. Upsert Archival Media
  if (data.archivalMedia && data.archivalMedia.length > 0) {
    for (const [idx, item] of data.archivalMedia.entries()) {
      const mediaId = item.id || `media-${bookstoreId}-${Date.now()}-${idx}`;
      const mediaValues = {
        id: mediaId,
        bookstoreId: bookstoreId,
        mediaType: item.mediaType || "photo",
        imageUrl: item.imageUrl,
        caption: item.caption,
        sourcePublication: item.sourcePublication || null,
        publicationDate: item.publicationDate || null,
        transcriptionText: item.transcriptionText || null,
        displayOrder: item.displayOrder !== undefined ? item.displayOrder : idx,
        createdAt: now,
      };

      await db.insert(archivalMedia).values(mediaValues).onConflictDoUpdate({
        target: archivalMedia.id,
        set: mediaValues,
      });
    }
  }

  return bookmarkId;
}

/**
 * Delete a bookmark by ID.
 */
export async function deleteBookmark(bookmarkId: string): Promise<boolean> {
  const result = await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));
  return true;
}

/**
 * Delete a bookstore by ID (cascades to associated bookmarks and media).
 */
export async function deleteBookstore(bookstoreId: string): Promise<boolean> {
  await db.delete(bookstores).where(eq(bookstores.id, bookstoreId));
  return true;
}

/**
 * Toggle the featured flag on a bookmark.
 */
export async function toggleBookmarkFeatured(bookmarkId: string, isFeatured: boolean): Promise<boolean> {
  await db
    .update(bookmarks)
    .set({ isFeatured, updatedAt: new Date().toISOString() })
    .where(eq(bookmarks.id, bookmarkId));
  return true;
}
