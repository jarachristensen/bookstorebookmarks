import { db } from "@/db";
import { bookstores, archivalMedia, Bookstore, ArchivalMedia } from "@/db/schema";
import {
  normalizeStoreName,
  slugifyStoreName,
  formatStoreNameFromFilename,
} from "./storefront";
import { getAvailableStorefrontFiles } from "./storefront-server";

export interface SyncStorefrontsResult {
  totalFiles: number;
  newBookstoresCreated: string[];
  mediaLinkedToExistingStores: string[];
  alreadySyncedCount: number;
}

let lastSyncTimestamp = 0;
const SYNC_COOLDOWN_MS = 2000; // 2 seconds throttle to prevent redundant disk scanning

/**
 * Automatically scans public/images/storefronts and:
 * 1. Links new storefront photos to existing bookstores in the database (adding archivalMedia if missing).
 * 2. Automatically creates and registers new bookstore entries for uncataloged storefront photos.
 */
export async function autoSyncStorefronts(options?: { force?: boolean }): Promise<SyncStorefrontsResult> {
  const now = Date.now();
  if (!options?.force && now - lastSyncTimestamp < SYNC_COOLDOWN_MS) {
    return {
      totalFiles: 0,
      newBookstoresCreated: [],
      mediaLinkedToExistingStores: [],
      alreadySyncedCount: 0,
    };
  }
  lastSyncTimestamp = now;

  let files: string[] = [];
  try {
    files = getAvailableStorefrontFiles().filter((file) => {
      return /\.(png|jpe?g|webp|svg|gif)$/i.test(file);
    });
  } catch (err) {
    console.warn("Could not read storefronts directory:", err);
    return {
      totalFiles: 0,
      newBookstoresCreated: [],
      mediaLinkedToExistingStores: [],
      alreadySyncedCount: 0,
    };
  }

  if (files.length === 0) {
    return {
      totalFiles: 0,
      newBookstoresCreated: [],
      mediaLinkedToExistingStores: [],
      alreadySyncedCount: 0,
    };
  }

  const existingStores = await db.select().from(bookstores);
  const existingMedia = await db.select().from(archivalMedia);

  const existingMediaUrls = new Set<string>();
  for (const m of existingMedia) {
    if (m.imageUrl) {
      existingMediaUrls.add(m.imageUrl.toLowerCase());
    }
  }

  const result: SyncStorefrontsResult = {
    totalFiles: files.length,
    newBookstoresCreated: [],
    mediaLinkedToExistingStores: [],
    alreadySyncedCount: 0,
  };

  const isoNow = new Date().toISOString();

  for (const file of files) {
    const imageUrl = `/images/storefronts/${file}`;
    const imageUrlLower = imageUrl.toLowerCase();

    // Check if this image file is already registered in archivalMedia
    const alreadyLinked = existingMedia.find(
      (m) => m.imageUrl && m.imageUrl.toLowerCase() === imageUrlLower
    );

    const withoutExt = file.replace(/\.[^/.]+$/, "");
    const normalizedFileWithoutExt = normalizeStoreName(withoutExt);
    const slugFileWithoutExt = slugifyStoreName(withoutExt);
    const cleanStem = normalizedFileWithoutExt.replace(/(storefront|front)$/i, "");

    // Try finding matching bookstore in DB
    let matchedStore = existingStores.find((s) => {
      const normName = normalizeStoreName(s.name);
      const slugName = slugifyStoreName(s.name);
      const normId = normalizeStoreName(s.id);
      const slugId = slugifyStoreName(s.id);

      if (
        normName === normalizedFileWithoutExt ||
        slugName === slugFileWithoutExt ||
        normId === normalizedFileWithoutExt ||
        slugId === slugFileWithoutExt
      ) {
        return true;
      }

      // Check with storefront suffix stripped
      if (
        cleanStem &&
        (normName === cleanStem ||
          slugName === cleanStem ||
          normId === cleanStem ||
          slugId === cleanStem)
      ) {
        return true;
      }

      // Check prefix / stem if at least 4 chars (e.g. citylights matching city-lights-books)
      if (cleanStem.length >= 4) {
        if (
          normName.startsWith(cleanStem) ||
          cleanStem.startsWith(normName) ||
          normId.startsWith(cleanStem) ||
          cleanStem.startsWith(normId)
        ) {
          return true;
        }
      }

      return false;
    });

    if (matchedStore) {
      if (!alreadyLinked) {
        const sanitizedFilename = file.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const mediaId = `media-storefront-${matchedStore.id}-${sanitizedFilename}`;
        try {
          await db
            .insert(archivalMedia)
            .values({
              id: mediaId,
              bookstoreId: matchedStore.id,
              mediaType: "photo",
              imageUrl,
              caption: `${matchedStore.name} Storefront Photo`,
              isStorefront: true,
              mediaTag: "storefront",
              displayOrder: 0,
              createdAt: isoNow,
            })
            .onConflictDoNothing();

          result.mediaLinkedToExistingStores.push(`${matchedStore.name} (${file})`);
        } catch (insertErr) {
          console.error("Failed to link storefront media:", insertErr);
        }
      } else {
        result.alreadySyncedCount++;
      }
    } else {
      // New Bookstore detected from storefront image!
      const newStoreId =
        slugifyStoreName(withoutExt.replace(/[-_]?(storefront|front)$/i, "")) ||
        `store-${Date.now()}`;
      const newStoreName = formatStoreNameFromFilename(file);

      const newStore = {
        id: newStoreId,
        name: newStoreName,
        city: "Unknown",
        stateProvince: null,
        country: "United States",
        streetAddress: null,
        yearOpened: 1970,
        yearClosed: null,
        isStillOperating: true,
        historicalBlurb: `### ${newStoreName}\n\nHistoric independent bookstore cataloged in the archive.`,
        specialties: JSON.stringify(["Independent Bookseller", "Community Bookstore"]),
        websiteUrl: null,
        createdAt: isoNow,
        updatedAt: isoNow,
      };

      try {
        await db.insert(bookstores).values(newStore).onConflictDoNothing();
        existingStores.push(newStore as any);

        const sanitizedFilename = file.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const mediaId = `media-storefront-${newStoreId}-${sanitizedFilename}`;
        await db
          .insert(archivalMedia)
          .values({
            id: mediaId,
            bookstoreId: newStoreId,
            mediaType: "photo",
            imageUrl,
            caption: `${newStoreName} Storefront Photo`,
            isStorefront: true,
            mediaTag: "storefront",
            displayOrder: 0,
            createdAt: isoNow,
          })
          .onConflictDoNothing();

        result.newBookstoresCreated.push(`${newStoreName} [${newStoreId}] (${file})`);
      } catch (createErr) {
        console.error("Failed to create bookstore from storefront image:", createErr);
      }
    }
  }

  return result;
}
