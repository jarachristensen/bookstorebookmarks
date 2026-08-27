export interface ParsedDimensions {
  width: number; // in inches
  height: number; // in inches
  aspectRatio: number; // width / height
  isLandscape: boolean;
  rawText: string;
}

export function parseDimensions(dimStr?: string | null): ParsedDimensions {
  const fallback: ParsedDimensions = {
    width: 2.25,
    height: 7.5,
    aspectRatio: 2.25 / 7.5,
    isLandscape: false,
    rawText: dimStr || '2.25" × 7.5"',
  };

  if (!dimStr || typeof dimStr !== "string") {
    return fallback;
  }

  // Matches formats like '2.25" × 7.5"', '2.25 x 7.5', '2 1/4 x 7 1/2', '7.0" × 2.0"'
  const cleaned = dimStr.replace(/["”″]/g, "").trim();
  const parts = cleaned.split(/[×xX]/).map((p) => p.trim());

  if (parts.length === 2) {
    const parseFractionOrDecimal = (val: string): number => {
      const trimmed = val.trim();
      if (trimmed.includes(" ")) {
        // e.g. "2 1/4"
        const [whole, frac] = trimmed.split(" ");
        const [num, den] = frac.split("/").map(Number);
        return Number(whole) + (den ? num / den : 0);
      } else if (trimmed.includes("/")) {
        // e.g. "3/4"
        const [num, den] = trimmed.split("/").map(Number);
        return den ? num / den : 0;
      }
      return parseFloat(trimmed);
    };

    const width = parseFractionOrDecimal(parts[0]);
    const height = parseFractionOrDecimal(parts[1]);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      return {
        width,
        height,
        aspectRatio: width / height,
        isLandscape: width > height,
        rawText: dimStr,
      };
    }
  }

  return fallback;
}
