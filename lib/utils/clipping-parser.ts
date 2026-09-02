/**
 * Parser for newspaper clipping filenames.
 * Example: "San_Francisco_Chronicle_2026_05_29_B8.jpg"
 * -> Publication: "San Francisco Chronicle", Date: "May 29, 2026", Caption: "San Francisco Chronicle (May 29, 2026)"
 */

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface ParsedClippingMetadata {
  sourcePublication: string;
  publicationDate: string;
  caption: string;
}

export function parseClippingFilename(fileName: string | null | undefined): ParsedClippingMetadata {
  const defaultResult: ParsedClippingMetadata = {
    sourcePublication: "",
    publicationDate: "",
    caption: "Archival Press Clipping",
  };

  if (!fileName || typeof fileName !== "string") {
    return defaultResult;
  }

  // Remove extension
  const baseName = fileName.replace(/\.[^/.]+$/, "").trim();
  if (!baseName) return defaultResult;

  // Regular expression to match YYYY_MM_DD, YYYY-MM-DD, YYYY_MM, or 4-digit Year
  // Examples: 2026_05_29, 1947_11_14, 1955-10-24, 1968
  const fullDateRegex = /(?:^|[_-])((?:18|19|20)\d{2})[_-](0[1-9]|1[0-2])[_-](0[1-9]|[12]\d|3[01])(?:[_-]|$)/;
  const yearMonthRegex = /(?:^|[_-])((?:18|19|20)\d{2})[_-](0[1-9]|1[0-2])(?:[_-]|$)/;
  const yearOnlyRegex = /(?:^|[_-])((?:18|19|20)\d{2})(?:[_-]|$)/;

  let year = "";
  let month = "";
  let day = "";
  let dateIndex = -1;
  let dateMatchLength = 0;

  const fullMatch = baseName.match(fullDateRegex);
  if (fullMatch && fullMatch.index !== undefined) {
    year = fullMatch[1];
    month = fullMatch[2];
    day = fullMatch[3];
    dateIndex = fullMatch.index;
    dateMatchLength = fullMatch[0].length;
  } else {
    const ymMatch = baseName.match(yearMonthRegex);
    if (ymMatch && ymMatch.index !== undefined) {
      year = ymMatch[1];
      month = ymMatch[2];
      dateIndex = ymMatch.index;
      dateMatchLength = ymMatch[0].length;
    } else {
      const yearMatch = baseName.match(yearOnlyRegex);
      if (yearMatch && yearMatch.index !== undefined) {
        year = yearMatch[1];
        dateIndex = yearMatch.index;
        dateMatchLength = yearMatch[0].length;
      }
    }
  }

  // Extract the publication name prefix (everything before the date match)
  let rawPubName = "";
  if (dateIndex > 0) {
    rawPubName = baseName.substring(0, dateIndex);
  } else if (dateIndex === 0) {
    // Date is at start, look after date
    rawPubName = baseName.substring(dateMatchLength);
  } else {
    // No date found, check if baseName looks like a title or generic
    if (!baseName.toLowerCase().startsWith("scan") && !baseName.toLowerCase().startsWith("image")) {
      rawPubName = baseName;
    }
  }

  // Clean up publication name
  let publication = rawPubName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Remove common trailing junk like "page", "pg", "section", "b8", etc. if present
  publication = publication.replace(/\b(?:page|pg|p|section|sec|vol)\s*\d+.*$/i, "").trim();

  // Capitalize words properly
  if (publication) {
    publication = publication
      .split(" ")
      .map((w) => {
        const lower = w.toLowerCase();
        if (["and", "of", "the", "in", "on", "at", "for"].includes(lower)) {
          return lower === "the" ? "The" : lower;
        }
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(" ");

    // Ensure leading "the" is capitalized
    if (publication.toLowerCase().startsWith("the ")) {
      publication = "The " + publication.slice(4);
    }
  }

  // Format date string
  let formattedDate = "";
  if (year && month && day) {
    const monthNum = parseInt(month, 10) - 1;
    const monthStr = MONTH_NAMES[monthNum] || month;
    const dayNum = parseInt(day, 10);
    // If year is 2026, use Full Month (e.g. May 29, 2026), else Nov 14, 1947
    const mName = parseInt(year, 10) >= 2000 ? FULL_MONTH_NAMES[monthNum] : monthStr;
    formattedDate = `${mName} ${dayNum}, ${year}`;
  } else if (year && month) {
    const monthNum = parseInt(month, 10) - 1;
    formattedDate = `${MONTH_NAMES[monthNum]} ${year}`;
  } else if (year) {
    formattedDate = year;
  }

  // Build smart caption
  let caption = "Archival Press Clipping";
  if (publication && formattedDate) {
    caption = `${publication} (${formattedDate})`;
  } else if (publication) {
    caption = `${publication} Clipping`;
  } else if (formattedDate) {
    caption = `Press Clipping (${formattedDate})`;
  }

  return {
    sourcePublication: publication,
    publicationDate: formattedDate,
    caption,
  };
}

export interface MediaLike {
  id?: string;
  isStorefront?: boolean | number | null;
  mediaType?: string | null;
  imageUrl: string;
  caption?: string | null;
  sourcePublication?: string | null;
  publicationDate?: string | null;
  createdAt?: string | null;
  displayOrder?: number | null;
}

/**
 * Extracts a 4-digit year from media publication date, caption, or createdAt.
 */
export function extractYearFromMedia(m?: Partial<MediaLike> | null): number {
  if (!m) return 0;
  if (m.publicationDate) {
    const match = m.publicationDate.match(/\b(18\d\d|19\d\d|20\d\d)\b/);
    if (match) return parseInt(match[1], 10);
  }
  if (m.caption) {
    const match = m.caption.match(/\b(18\d\d|19\d\d|20\d\d)\b/);
    if (match) return parseInt(match[1], 10);
  }
  if (m.createdAt) {
    const d = new Date(m.createdAt);
    if (!isNaN(d.getTime())) return d.getFullYear();
  }
  return 0;
}

/**
 * Returns storefront/exterior photos sorted so the most recent is first.
 */
export function sortMediaByMostRecent<T extends Partial<MediaLike>>(mediaList: T[]): T[] {
  return [...mediaList].sort((a, b) => {
    const yearA = extractYearFromMedia(a);
    const yearB = extractYearFromMedia(b);
    if (yearB !== yearA) return yearB - yearA;
    return (b.displayOrder || 0) - (a.displayOrder || 0);
  });
}

/**
 * Returns the most recent storefront photo for a bookstore.
 */
export function getMostRecentStorefrontMedia<T extends Partial<MediaLike>>(mediaList: T[]): T | null {
  if (!mediaList || mediaList.length === 0) return null;
  const storefronts = mediaList.filter((m) => Boolean(m.isStorefront) || m.mediaType === "photo");
  if (storefronts.length > 0) {
    return sortMediaByMostRecent(storefronts)[0];
  }
  return mediaList[0] || null;
}

