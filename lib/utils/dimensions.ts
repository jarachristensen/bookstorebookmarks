/**
 * Dimension parser and aspect ratio calculator for physical bookmarks.
 * Standard benchmark bookmark size is ~ 2.25" width x 7.5" height (ratio: ~0.3).
 */
export interface ParsedDimensions {
  widthInches: number;
  heightInches: number;
  aspectRatio: number; // width / height
  formatted: string;
}

export function parseDimensions(dimStr: string | null | undefined): ParsedDimensions {
  const defaultDimensions: ParsedDimensions = {
    widthInches: 2.25,
    heightInches: 7.5,
    aspectRatio: 2.25 / 7.5, // ~0.30
    formatted: '2.25" × 7.5"',
  };

  if (!dimStr || dimStr.trim() === "") {
    return defaultDimensions;
  }

  const clean = dimStr.trim().toLowerCase();

  // Match patterns like:
  // "2.25" x 7.5"", "2.25 × 7.5", "2 x 8", "55mm x 190mm", "5.5cm x 19cm", "55 x 190"
  const regex = /([\d.]+)\s*(?:mm|cm|in|"|'')?\s*(?:[x×*,\/]|by|-)\s*([\d.]+)\s*(?:mm|cm|in|"|'')?/i;
  const match = clean.match(regex);

  if (!match) {
    return { ...defaultDimensions, formatted: dimStr };
  }

  let w = parseFloat(match[1]);
  let h = parseFloat(match[2]);

  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    return defaultDimensions;
  }

  // Detect millimeters (e.g. > 20)
  if (clean.includes("mm") || (w > 20 && h > 20)) {
    w = w / 25.4; // convert mm to inches
    h = h / 25.4;
  } else if (clean.includes("cm") || (w > 2 && w < 15 && h > 10 && h < 35 && clean.includes("cm"))) {
    w = w / 2.54; // convert cm to inches
    h = h / 2.54;
  }

  // Ensure width is the smaller dimension for tall bookmarks
  if (w > h && w > 4) {
    const temp = w;
    w = h;
    h = temp;
  }

  const aspectRatio = w / h;

  return {
    widthInches: Number(w.toFixed(2)),
    heightInches: Number(h.toFixed(2)),
    aspectRatio: Number(aspectRatio.toFixed(3)),
    formatted: dimStr,
  };
}

/**
 * Calculates exact screen display dimensions for a bookmark based on its real physical measurements.
 */
export function calculateScreenDimensions(
  dim: ParsedDimensions,
  baseHeightPx: number = 340
) {
  // Height scales with physical height, normalized around 7.5" standard
  const rawHeight = baseHeightPx * (dim.heightInches / 7.5);
  const heightPx = Math.round(Math.min(Math.max(rawHeight, 270), 390));

  // Width is strictly determined by true aspect ratio (width = height * ratio)
  const widthPx = Math.round(heightPx * dim.aspectRatio);

  return {
    widthPx,
    heightPx,
    aspectRatio: dim.aspectRatio,
  };
}
