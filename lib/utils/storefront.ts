export const DEFAULT_STOREFRONT_IMAGE = "/images/nobookstoreimage.png";

/**
 * Normalizes a bookstore name by stripping all non-alphanumeric characters and lowercasing.
 * Example: "City Lights Booksellers & Publishers" -> "citylightsbooksellerspublishers"
 */
export function normalizeStoreName(name: string): string {
  if (!name) return "";
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Slugifies a bookstore name with hyphens.
 * Example: "City Lights Booksellers" -> "city-lights-booksellers"
 */
export function slugifyStoreName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Returns candidate filenames/relative paths for a given bookstore.
 */
export function getStorefrontCandidatePaths(store: { name: string; id?: string }): string[] {
  const normalized = normalizeStoreName(store.name);
  const slugified = slugifyStoreName(store.name);
  const id = store.id ? store.id.toLowerCase().trim() : "";
  const normalizedId = store.id ? normalizeStoreName(store.id) : "";

  const candidates: string[] = [];

  // Primary user-requested pattern: [bookstorename]-storefront.png
  if (normalized) candidates.push(`/images/storefronts/${normalized}-storefront.png`);
  if (slugified && slugified !== normalized) candidates.push(`/images/storefronts/${slugified}-storefront.png`);
  if (id && id !== normalized && id !== slugified) candidates.push(`/images/storefronts/${id}-storefront.png`);
  if (normalizedId && normalizedId !== normalized && normalizedId !== id) candidates.push(`/images/storefronts/${normalizedId}-storefront.png`);

  // Common stem patterns (e.g. "citylights" for "City Lights Booksellers & Publishers")
  const strippedCommon = normalized
    .replace(/(booksellers|publishers|books|bookstore|bookshop|and|the)+/g, "")
    .trim();
  if (strippedCommon && strippedCommon !== normalized && strippedCommon.length >= 4) {
    candidates.push(`/images/storefronts/${strippedCommon}-storefront.png`);
  }

  // Secondary variations (.png, .jpg, .webp, .svg)
  const extensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
  for (const ext of extensions) {
    if (normalized) {
      const p = `/images/storefronts/${normalized}${ext}`;
      if (!candidates.includes(p)) candidates.push(p);
    }
    if (slugified) {
      const p = `/images/storefronts/${slugified}${ext}`;
      if (!candidates.includes(p)) candidates.push(p);
    }
    if (id) {
      const p = `/images/storefronts/${id}${ext}`;
      if (!candidates.includes(p)) candidates.push(p);
    }
  }

  return candidates;
}

/**
 * Resolves the diecut storefront image URL for a bookstore:
 * 1. Checks public/images/storefronts for a matching diecut file
 * 2. Matches exact names, slugified names, IDs, and base stems (e.g. citylights -> City Lights Booksellers)
 * 3. If not found, uses default image (/images/nobookstoreimage.png)
 */
export function resolveStorefrontImage(
  store: {
    name: string;
    id?: string;
  },
  availableFiles?: string[]
): string {
  const fileList = availableFiles || [];

  if (fileList.length > 0) {
    const normalizedFilesMap = new Map<string, string>();
    const fileBaseEntries: { base: string; file: string }[] = [];

    for (const file of fileList) {
      // Index by raw lowercase and stripped lowercase
      const withoutExt = file.replace(/\.[^/.]+$/, "");
      const normalizedWithoutExt = normalizeStoreName(withoutExt);
      const slugWithoutExt = slugifyStoreName(withoutExt);

      normalizedFilesMap.set(file.toLowerCase(), file);
      normalizedFilesMap.set(withoutExt.toLowerCase(), file);
      normalizedFilesMap.set(normalizedWithoutExt, file);
      normalizedFilesMap.set(slugWithoutExt, file);

      // Clean base by stripping storefront/front suffix
      const cleanBase = normalizedWithoutExt.replace(/storefront$/, "").replace(/front$/, "");
      if (cleanBase) {
        normalizedFilesMap.set(cleanBase, file);
        fileBaseEntries.push({ base: cleanBase, file });
      }
    }

    const normName = normalizeStoreName(store.name);
    const slugName = slugifyStoreName(store.name);
    const storeId = store.id ? normalizeStoreName(store.id) : "";
    const storeSlugId = store.id ? slugifyStoreName(store.id) : "";

    // 1. Check specific patterns: name-storefront, id-storefront, name, id
    const candidateKeys = [
      `${normName}storefront`,
      `${slugName}-storefront`,
      `${storeId}storefront`,
      `${storeSlugId}-storefront`,
      normName,
      slugName,
      storeId,
      storeSlugId,
    ];

    for (const key of candidateKeys) {
      if (key && normalizedFilesMap.has(key)) {
        return `/images/storefronts/${normalizedFilesMap.get(key)}`;
      }
    }

    // 2. Prefix & stem matching (e.g. "citylights" matches "City Lights Booksellers & Publishers" / "city-lights-books")
    for (const { base, file } of fileBaseEntries) {
      if (base.length >= 4) {
        if (
          normName.startsWith(base) ||
          base.startsWith(normName) ||
          (storeId && (storeId.startsWith(base) || base.startsWith(storeId)))
        ) {
          return `/images/storefronts/${file}`;
        }
      }
    }
  }

  // If no storefront diecut image exists in storefronts folder, use default placeholder
  return DEFAULT_STOREFRONT_IMAGE;
}
