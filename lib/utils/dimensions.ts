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

  const isExplicitLandscape = /\b(horizontal|landscape)\b/i.test(dimStr);
  const isExplicitPortrait = /\b(vertical|portrait|tall)\b/i.test(dimStr);

  // Check if labeled like "1.5 H x 6 W" or "6 W x 1.5 H"
  const wMatch = dimStr.match(/(\d+(?:\.\d+)?|\d+\s+\d+\/\d+|\d+\/\d+)\s*(?:["”″]|in(?:ch(?:es)?)?)?\s*(?:width|w)\b/i);
  const hMatch = dimStr.match(/(\d+(?:\.\d+)?|\d+\s+\d+\/\d+|\d+\/\d+)\s*(?:["”″]|in(?:ch(?:es)?)?)?\s*(?:height|h)\b/i);

  // Matches formats like '2.25" × 7.5"', '2.25 x 7.5', '2 1/4 x 7 1/2', '7.0" × 2.0"'
  const cleaned = dimStr.replace(/["”″]/g, "").trim();
  const parts = cleaned.split(/[×xX]/).map((p) => p.trim());

  const parseFractionOrDecimal = (val: string): number => {
    // Clean labels like W, H, in, inches, (horizontal), (landscape), etc.
    const cleanedVal = val.replace(/(?:inches|inch|in|width|height|w|h|\(horizontal\)|\(landscape\)|\(vertical\)|\(portrait\))\b\.?/gi, "").trim();
    if (cleanedVal.includes(" ")) {
      // e.g. "2 1/4"
      const [whole, frac] = cleanedVal.split(" ");
      const [num, den] = (frac || "").split("/").map(Number);
      return Number(whole) + (den ? num / den : 0);
    } else if (cleanedVal.includes("/")) {
      // e.g. "3/4"
      const [num, den] = cleanedVal.split("/").map(Number);
      return den ? num / den : 0;
    }
    return parseFloat(cleanedVal);
  };

  if (wMatch && hMatch) {
    const width = parseFractionOrDecimal(wMatch[1]);
    const height = parseFractionOrDecimal(hMatch[1]);
    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      return {
        width,
        height,
        aspectRatio: width / height,
        isLandscape: width > height || (isExplicitLandscape && !isExplicitPortrait),
        rawText: dimStr,
      };
    }
  }

  if (parts.length === 2) {
    let width = parseFractionOrDecimal(parts[0]);
    let height = parseFractionOrDecimal(parts[1]);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      // Check if parts had explicit W or H indicator
      const part0HasH = /\b(h|height)\b/i.test(parts[0]);
      const part1HasW = /\b(w|width)\b/i.test(parts[1]);
      if (part0HasH && part1HasW) {
        // First part was height, second was width
        const temp = width;
        width = height;
        height = temp;
      } else if (isExplicitLandscape && !isExplicitPortrait && width < height) {
        // Swap so width is larger if user typed e.g. "1.5 x 6 (horizontal)"
        const temp = width;
        width = height;
        height = temp;
      }

      return {
        width,
        height,
        aspectRatio: width / height,
        isLandscape: width > height || (isExplicitLandscape && !isExplicitPortrait),
        rawText: dimStr,
      };
    }
  }

  if (isExplicitLandscape && !isExplicitPortrait) {
    return {
      width: 7.5,
      height: 2.25,
      aspectRatio: 7.5 / 2.25,
      isLandscape: true,
      rawText: dimStr,
    };
  }

  return fallback;
}
