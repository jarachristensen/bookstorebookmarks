import { db } from "@/db";
import {
  bookmarks,
  bookstores,
  archivalMedia,
  tradeProposals,
  nonBookstoreBookmarks,
  NonBookstoreBookmark,
  NewNonBookstoreBookmark,
  BookstoreLocation,
  CustomTimelineEvent,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureDb } from "./queries";

export interface FullBookmarkInput {
  bookmark: {
    id?: string;
    bookstoreId?: string;
    title: string;
    accessionNo?: string;
    frontImageUrl: string;
    backImageUrl?: string | null;
    yearProduced?: number | null;
    material: string;
    dimensions: string;
    condition: string;
    acquisitionDate?: string | null;
    acquisitionNotes?: string | null;
    isFeatured?: boolean;
    tradeQuantity?: number;
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
    locations?: BookstoreLocation[] | null;
    timelineEvents?: CustomTimelineEvent[] | null;
    isFlagship?: boolean | null;
    flagshipId?: string | null;
    chainName?: string | null;
    branchLabel?: string | null;
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
    isStorefront?: boolean;
    mediaTag?: string | null;
    displayOrder?: number;
  }>;
}

export interface BookstoreDossierInput {
  bookstore: {
    id: string;
    name: string;
    city: string;
    stateProvince?: string | null;
    country: string;
    streetAddress?: string | null;
    locations?: BookstoreLocation[] | null;
    timelineEvents?: CustomTimelineEvent[] | null;
    isFlagship?: boolean | null;
    flagshipId?: string | null;
    chainName?: string | null;
    branchLabel?: string | null;
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
    isStorefront?: boolean;
    mediaTag?: string | null;
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
 * Generates a guaranteed unique bookstore ID, incorporating city/state if needed
 * to allow multiple distinct bookstores with the same name.
 */
export async function generateUniqueBookstoreId(
  name: string,
  city?: string | null,
  stateProvince?: string | null
): Promise<string> {
  const cleanName = (name || "bookstore").trim();
  const baseParts = [cleanName];
  if (city && city.trim()) baseParts.push(city.trim());
  if (stateProvince && stateProvince.trim()) baseParts.push(stateProvince.trim());

  let baseSlug = generateSlug(baseParts.join("-"));
  if (!baseSlug) baseSlug = "bookstore";

  const existing = await db.query.bookstores.findFirst({
    where: eq(bookstores.id, baseSlug),
  });

  if (!existing) {
    return baseSlug;
  }

  // If already exists, append a unique timestamp suffix
  return `${baseSlug}-${Date.now().toString().slice(-4)}`;
}

export interface BookmarkBulkUpdateItem {
  id: string;
  title: string;
  dimensions: string;
}

/**
 * Bulk update bookmark names and dimensions in a single operation.
 */
export async function bulkUpdateBookmarks(updates: BookmarkBulkUpdateItem[]): Promise<number> {
  await ensureDb();
  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const item of updates) {
    if (!item.id) continue;
    const updateData: Record<string, any> = { updatedAt: now };
    if (typeof item.title === "string" && item.title.trim()) {
      updateData.title = item.title.trim();
    }
    if (typeof item.dimensions === "string" && item.dimensions.trim()) {
      updateData.dimensions = item.dimensions.trim();
    }

    if (Object.keys(updateData).length > 1) {
      await db.update(bookmarks).set(updateData).where(eq(bookmarks.id, item.id));
      updatedCount++;
    }
  }

  return updatedCount;
}

/**
 * Upsert bookstore, bookmark, and associated media in a single transaction/operation.
 */
export async function saveBookmarkAndBookstore(data: FullBookmarkInput): Promise<string> {
  await ensureDb();
  const now = new Date().toISOString();

  // 1. Prepare Bookstore ID & Data (prevent accidental collisions with same-name stores)
  let bookstoreId = data.bookmark.bookstoreId || data.bookstore.id;
  if (!bookstoreId) {
    bookstoreId = await generateUniqueBookstoreId(
      data.bookstore.name,
      data.bookstore.city,
      data.bookstore.stateProvince
    );
  }

  // Check if store already exists or needs update
  const existingStore = await db.query.bookstores.findFirst({
    where: eq(bookstores.id, bookstoreId),
  });

  const bookstoreValues = {
    id: bookstoreId,
    name: data.bookstore.name || existingStore?.name || "Independent Bookstore",
    city: data.bookstore.city || existingStore?.city || "Unknown City",
    stateProvince: data.bookstore.stateProvince ?? existingStore?.stateProvince ?? null,
    country: data.bookstore.country || existingStore?.country || "United States",
    streetAddress: data.bookstore.streetAddress ?? existingStore?.streetAddress ?? null,
    locations: data.bookstore.locations !== undefined
      ? (data.bookstore.locations ? JSON.stringify(data.bookstore.locations) : null)
      : existingStore?.locations ?? null,
    timelineEvents: data.bookstore.timelineEvents !== undefined
      ? (data.bookstore.timelineEvents ? JSON.stringify(data.bookstore.timelineEvents) : null)
      : (existingStore?.timelineEvents ?? null),
    isFlagship: data.bookstore.isFlagship !== undefined
      ? Boolean(data.bookstore.isFlagship)
      : (existingStore?.isFlagship ?? false),
    flagshipId: data.bookstore.flagshipId !== undefined
      ? (data.bookstore.flagshipId || null)
      : (existingStore?.flagshipId ?? null),
    chainName: data.bookstore.chainName !== undefined
      ? (data.bookstore.chainName || null)
      : (existingStore?.chainName ?? null),
    branchLabel: data.bookstore.branchLabel !== undefined
      ? (data.bookstore.branchLabel || null)
      : (existingStore?.branchLabel ?? null),
    yearOpened: Number(data.bookstore.yearOpened) || existingStore?.yearOpened || 1900,
    yearClosed: data.bookstore.yearClosed !== undefined
      ? (data.bookstore.yearClosed ? Number(data.bookstore.yearClosed) : null)
      : (existingStore?.yearClosed ?? null),
    isStillOperating: data.bookstore.isStillOperating !== undefined
      ? Boolean(data.bookstore.isStillOperating)
      : (existingStore?.isStillOperating ?? false),
    founders: data.bookstore.founders ?? existingStore?.founders ?? null,
    specialties: JSON.stringify(data.bookstore.specialties || (existingStore?.specialties ? JSON.parse(existingStore.specialties) : [])),
    historicalBlurb: data.bookstore.historicalBlurb || existingStore?.historicalBlurb || "",
    notablePatronsTrivia: JSON.stringify(data.bookstore.notablePatronsTrivia || (existingStore?.notablePatronsTrivia ? JSON.parse(existingStore.notablePatronsTrivia) : [])),
    websiteUrl: data.bookstore.websiteUrl ?? existingStore?.websiteUrl ?? null,
    createdAt: existingStore?.createdAt || now,
    updatedAt: now,
  };

  await db.insert(bookstores).values(bookstoreValues).onConflictDoUpdate({
    target: bookstores.id,
    set: {
      ...bookstoreValues,
      createdAt: undefined,
      updatedAt: now,
    },
  });

  // 2. Prepare Bookmark ID & Data
  const bookmarkId = data.bookmark.id || generateSlug(`${data.bookmark.title}-${Date.now().toString().slice(-4)}`);
  const accessionNo = data.bookmark.accessionNo || `BM-${Date.now().toString().slice(-6)}`;

  const bookmarkValues = {
    id: bookmarkId,
    bookstoreId: bookstoreId,
    title: data.bookmark.title,
    accessionNo: accessionNo,
    frontImageUrl: data.bookmark.frontImageUrl,
    backImageUrl: data.bookmark.backImageUrl || null,
    yearProduced: data.bookmark.yearProduced ? Number(data.bookmark.yearProduced) : null,
    material: data.bookmark.material || "Paper Cardstock",
    dimensions: data.bookmark.dimensions || "2.25\" × 7.5\"",
    condition: data.bookmark.condition || "Good",
    acquisitionDate: data.bookmark.acquisitionDate || null,
    acquisitionNotes: data.bookmark.acquisitionNotes || null,
    isFeatured: Boolean(data.bookmark.isFeatured),
    tradeQuantity: data.bookmark.tradeQuantity !== undefined ? Number(data.bookmark.tradeQuantity) : 0,
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
      if (!item.imageUrl) continue;
      const mediaId = item.id || `media-${bookstoreId}-${Date.now()}-${idx}`;
      const mediaValues = {
        id: mediaId,
        bookstoreId: bookstoreId,
        mediaType: item.mediaType || "photo",
        imageUrl: item.imageUrl,
        caption: item.caption || "Archival Press Clipping",
        sourcePublication: item.sourcePublication || null,
        publicationDate: item.publicationDate || null,
        transcriptionText: item.transcriptionText || null,
        isStorefront: Boolean(item.isStorefront),
        mediaTag: item.mediaTag || null,
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
 * Upsert bookstore dossier and its archival media directly.
 */
export async function saveBookstoreDossier(data: BookstoreDossierInput): Promise<string> {
  await ensureDb();
  const now = new Date().toISOString();
  let bookstoreId = data.bookstore.id;
  if (!bookstoreId) {
    bookstoreId = await generateUniqueBookstoreId(
      data.bookstore.name,
      data.bookstore.city,
      data.bookstore.stateProvince
    );
  }

  const existingStore = await db.query.bookstores.findFirst({
    where: eq(bookstores.id, bookstoreId),
  });

  const bookstoreValues = {
    id: bookstoreId,
    name: data.bookstore.name || existingStore?.name || "Independent Bookstore",
    city: data.bookstore.city || existingStore?.city || "Unknown City",
    stateProvince: data.bookstore.stateProvince ?? existingStore?.stateProvince ?? null,
    country: data.bookstore.country || existingStore?.country || "United States",
    streetAddress: data.bookstore.streetAddress ?? existingStore?.streetAddress ?? null,
    locations: data.bookstore.locations !== undefined
      ? (data.bookstore.locations ? JSON.stringify(data.bookstore.locations) : null)
      : existingStore?.locations ?? null,
    timelineEvents: data.bookstore.timelineEvents !== undefined
      ? (data.bookstore.timelineEvents ? JSON.stringify(data.bookstore.timelineEvents) : null)
      : (existingStore?.timelineEvents ?? null),
    isFlagship: data.bookstore.isFlagship !== undefined
      ? Boolean(data.bookstore.isFlagship)
      : (existingStore?.isFlagship ?? false),
    flagshipId: data.bookstore.flagshipId !== undefined
      ? (data.bookstore.flagshipId || null)
      : (existingStore?.flagshipId ?? null),
    chainName: data.bookstore.chainName !== undefined
      ? (data.bookstore.chainName || null)
      : (existingStore?.chainName ?? null),
    branchLabel: data.bookstore.branchLabel !== undefined
      ? (data.bookstore.branchLabel || null)
      : (existingStore?.branchLabel ?? null),
    yearOpened: Number(data.bookstore.yearOpened) || existingStore?.yearOpened || 1900,
    yearClosed: data.bookstore.yearClosed !== undefined
      ? (data.bookstore.yearClosed ? Number(data.bookstore.yearClosed) : null)
      : (existingStore?.yearClosed ?? null),
    isStillOperating: data.bookstore.isStillOperating !== undefined
      ? Boolean(data.bookstore.isStillOperating)
      : (existingStore?.isStillOperating ?? false),
    founders: data.bookstore.founders ?? existingStore?.founders ?? null,
    specialties: JSON.stringify(data.bookstore.specialties || []),
    historicalBlurb: data.bookstore.historicalBlurb || existingStore?.historicalBlurb || "",
    notablePatronsTrivia: JSON.stringify(data.bookstore.notablePatronsTrivia || []),
    websiteUrl: data.bookstore.websiteUrl ?? existingStore?.websiteUrl ?? null,
    createdAt: existingStore?.createdAt || now,
    updatedAt: now,
  };

  await db.insert(bookstores).values(bookstoreValues).onConflictDoUpdate({
    target: bookstores.id,
    set: {
      ...bookstoreValues,
      createdAt: undefined,
      updatedAt: now,
    },
  });

  // Upsert archival media
  if (data.archivalMedia && data.archivalMedia.length > 0) {
    for (const [idx, item] of data.archivalMedia.entries()) {
      if (!item.imageUrl) continue;
      const mediaId = item.id || `media-${bookstoreId}-${Date.now()}-${idx}`;
      const mediaValues = {
        id: mediaId,
        bookstoreId: bookstoreId,
        mediaType: item.mediaType || "photo",
        imageUrl: item.imageUrl,
        caption: item.caption || "Archival Press Clipping",
        sourcePublication: item.sourcePublication || null,
        publicationDate: item.publicationDate || null,
        transcriptionText: item.transcriptionText || null,
        isStorefront: Boolean(item.isStorefront),
        mediaTag: item.mediaTag || null,
        displayOrder: item.displayOrder !== undefined ? item.displayOrder : idx,
        createdAt: now,
      };

      await db.insert(archivalMedia).values(mediaValues).onConflictDoUpdate({
        target: archivalMedia.id,
        set: mediaValues,
      });
    }
  }

  return bookstoreId;
}

/**
 * Delete a bookmark by ID.
 */
export async function deleteBookmark(bookmarkId: string): Promise<boolean> {
  await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));
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

export interface CreateTradeProposalInput {
  collectorName: string;
  collectorEmail: string;
  offeredItems: string;
  requestedBookmarkIds: string[];
  requestedBookmarksSnapshot?: Array<{
    id: string;
    title: string;
    accessionNo: string;
    bookstoreName?: string;
    frontImageUrl?: string;
  }>;
}

/**
 * Creates a new trade proposal from a collector.
 */
export async function createTradeProposal(data: CreateTradeProposalInput): Promise<string> {
  await ensureDb();
  const now = new Date().toISOString();
  const id = `trade-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  let snapshot = data.requestedBookmarksSnapshot;
  if (!snapshot || snapshot.length === 0) {
    const fetchedBookmarks = data.requestedBookmarkIds.length > 0
      ? await db.query.bookmarks.findMany({
          where: (b, { inArray }) => inArray(b.id, data.requestedBookmarkIds),
        })
      : [];
    const fetchedBookstores = await db.select().from(bookstores);
    const storeMap = new Map(fetchedBookstores.map((s) => [s.id, s.name]));

    const bookstoreSnapshots = fetchedBookmarks.map((b) => ({
      id: b.id,
      title: b.title,
      accessionNo: b.accessionNo,
      bookstoreName: storeMap.get(b.bookstoreId) || "Bookstore",
      frontImageUrl: b.frontImageUrl,
    }));

    const foundBmIds = new Set(fetchedBookmarks.map((b) => b.id));
    const missingIds = data.requestedBookmarkIds.filter((id) => !foundBmIds.has(id));

    let nonBmSnapshots: Array<{
      id: string;
      title: string;
      accessionNo: string;
      bookstoreName?: string;
      frontImageUrl?: string;
    }> = [];

    if (missingIds.length > 0) {
      const fetchedNonBms = await db.query.nonBookstoreBookmarks.findMany({
        where: (nb, { inArray }) => inArray(nb.id, missingIds),
      });
      nonBmSnapshots = fetchedNonBms.map((nb) => ({
        id: nb.id,
        title: nb.title,
        accessionNo: nb.id.toUpperCase(),
        bookstoreName: nb.category || "Other Ephemera",
        frontImageUrl: nb.frontImageUrl,
      }));
    }

    snapshot = [...bookstoreSnapshots, ...nonBmSnapshots];
  }

  await db.insert(tradeProposals).values({
    id,
    collectorName: data.collectorName.trim(),
    collectorEmail: data.collectorEmail.trim(),
    offeredItems: data.offeredItems.trim(),
    requestedBookmarkIds: JSON.stringify(data.requestedBookmarkIds),
    requestedBookmarksSnapshot: JSON.stringify(snapshot),
    status: "pending",
    notes: null,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Updates a trade proposal status.
 * If transitioning to 'accepted', automatically decrements tradeQuantity by 1
 * for each requested bookmark in the archive.
 */
export async function updateTradeProposalStatus(
  id: string,
  status: "pending" | "accepted" | "declined" | "completed",
  notes?: string
): Promise<boolean> {
  await ensureDb();
  const now = new Date().toISOString();

  const proposal = await db.query.tradeProposals.findFirst({
    where: eq(tradeProposals.id, id),
  });

  if (!proposal) return false;

  // If accepting a trade that wasn't already accepted, deduct duplicate copies
  if (status === "accepted" && proposal.status !== "accepted") {
    let bookmarkIds: string[] = [];
    try {
      bookmarkIds = JSON.parse(proposal.requestedBookmarkIds);
    } catch {}

    for (const bmId of bookmarkIds) {
      if (!bmId) continue;
      // 1. Try bookstore bookmarks
      const bm = await db.query.bookmarks.findFirst({
        where: eq(bookmarks.id, bmId),
      });
      if (bm) {
        const currentQty = typeof bm.tradeQuantity === "number" ? bm.tradeQuantity : 0;
        const newQty = Math.max(0, currentQty - 1);
        await db
          .update(bookmarks)
          .set({ tradeQuantity: newQty, updatedAt: now })
          .where(eq(bookmarks.id, bmId));
      } else {
        // 2. Try non-bookstore bookmarks
        const nonBm = await db.query.nonBookstoreBookmarks.findFirst({
          where: eq(nonBookstoreBookmarks.id, bmId),
        });
        if (nonBm) {
          const currentQty = typeof nonBm.tradeQuantity === "number" ? nonBm.tradeQuantity : 0;
          const newQty = Math.max(0, currentQty - 1);
          await db
            .update(nonBookstoreBookmarks)
            .set({ tradeQuantity: newQty, updatedAt: now })
            .where(eq(nonBookstoreBookmarks.id, bmId));
        }
      }
    }
  }

  const updateData: Record<string, any> = {
    status,
    updatedAt: now,
  };
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  await db
    .update(tradeProposals)
    .set(updateData)
    .where(eq(tradeProposals.id, id));

  return true;
}

/**
 * Deletes a trade proposal by ID.
 */
export async function deleteTradeProposal(id: string): Promise<boolean> {
  await ensureDb();
  await db.delete(tradeProposals).where(eq(tradeProposals.id, id));
  return true;
}

/**
 * Creates a single non-bookstore bookmark.
 */
export async function createNonBookstoreBookmark(data: {
  id?: string;
  title: string;
  category?: string;
  frontImageUrl: string;
  backImageUrl?: string | null;
  tradeQuantity?: number;
  dimensions?: string;
  material?: string;
  condition?: string;
  notes?: string;
  displayOrder?: number;
}): Promise<string> {
  await ensureDb();
  const now = new Date().toISOString();
  const id = data.id || generateSlug(`other-${data.title}-${Date.now().toString().slice(-4)}`);

  const entry: NewNonBookstoreBookmark = {
    id,
    title: data.title.trim(),
    category: data.category?.trim() || "General Ephemera",
    frontImageUrl: data.frontImageUrl.trim(),
    backImageUrl: data.backImageUrl ? data.backImageUrl.trim() : null,
    tradeQuantity: typeof data.tradeQuantity === "number" ? Math.max(0, data.tradeQuantity) : 1,
    dimensions: data.dimensions || '2" × 7"',
    material: data.material || "Printed Cardstock",
    condition: data.condition || "Collectible",
    notes: data.notes || null,
    displayOrder: typeof data.displayOrder === "number" ? data.displayOrder : 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(nonBookstoreBookmarks).values(entry).onConflictDoUpdate({
    target: nonBookstoreBookmarks.id,
    set: {
      ...entry,
      createdAt: undefined,
      updatedAt: now,
    },
  });

  return id;
}

/**
 * Bulk creates / imports non-bookstore bookmarks from a spreadsheet or array.
 */
export async function bulkCreateNonBookstoreBookmarks(
  items: Array<{
    id?: string;
    title: string;
    category?: string;
    frontImageUrl: string;
    backImageUrl?: string | null;
    tradeQuantity?: number;
    dimensions?: string;
    material?: string;
    condition?: string;
    notes?: string;
  }>
): Promise<{ inserted: number; ids: string[] }> {
  await ensureDb();
  const now = new Date().toISOString();
  let count = 0;
  const ids: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.title || !item.frontImageUrl) continue;

    const id = item.id || generateSlug(`other-${item.title}-${Date.now().toString().slice(-4)}-${i}`);
    const entry: NewNonBookstoreBookmark = {
      id,
      title: item.title.trim(),
      category: item.category?.trim() || "General Ephemera",
      frontImageUrl: item.frontImageUrl.trim(),
      backImageUrl: item.backImageUrl ? item.backImageUrl.trim() : null,
      tradeQuantity: typeof item.tradeQuantity === "number" ? Math.max(0, item.tradeQuantity) : 1,
      dimensions: item.dimensions || '2" × 7"',
      material: item.material || "Printed Cardstock",
      condition: item.condition || "Collectible",
      notes: item.notes || null,
      displayOrder: i,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(nonBookstoreBookmarks).values(entry).onConflictDoUpdate({
      target: nonBookstoreBookmarks.id,
      set: {
        ...entry,
        createdAt: undefined,
        updatedAt: now,
      },
    });

    ids.push(id);
    count++;
  }

  return { inserted: count, ids };
}

/**
 * Updates a non-bookstore bookmark.
 */
export async function updateNonBookstoreBookmark(
  id: string,
  data: Partial<NewNonBookstoreBookmark>
): Promise<boolean> {
  await ensureDb();
  const now = new Date().toISOString();

  const updateData: Record<string, any> = {
    ...data,
    updatedAt: now,
  };
  delete updateData.id;
  delete updateData.createdAt;

  await db
    .update(nonBookstoreBookmarks)
    .set(updateData)
    .where(eq(nonBookstoreBookmarks.id, id));

  return true;
}

/**
 * Deletes a non-bookstore bookmark.
 */
export async function deleteNonBookstoreBookmark(id: string): Promise<boolean> {
  await ensureDb();
  await db.delete(nonBookstoreBookmarks).where(eq(nonBookstoreBookmarks.id, id));
  return true;
}

