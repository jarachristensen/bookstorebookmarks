/**
 * OCR Post-Processing Sanitizer & Noise Filter
 *
 * Cleans raw Tesseract / OCR text from historic newspaper scans.
 * Specifically removes halftone photo dot-matrix artifacts, engraving stipple noise,
 * border graphics, broken line hyphens, and isolated OCR symbol clusters.
 */

/**
 * Determines whether a line extracted from an OCR scan is halftone photo noise,
 * border graphics, or an uninformative dot-matrix artifact.
 */
export function isHalftoneNoiseLine(line: string): boolean {
  let cleaned = line.trim();
  if (cleaned.length < 3) return true;

  // Clean edge symbols
  cleaned = cleaned.replace(/^[|:;=~#_+*"'‘“”»«\[\]{}<>\s]+|[|:;=~#_+*"'‘“”»«\[\]{}<>\s]+$/g, "");
  if (cleaned.length < 3) return true;

  // Halftone artifacts frequently contain weird noise characters like =, ~, §, |, ^, *, \, _, ], [, {, }
  const junkSymbols = cleaned.replace(/[^=~#_+*^\\\[\]{}<>§|]/g, "");
  if (junkSymbols.length >= 2 || (junkSymbols.length === 1 && cleaned.length < 35)) {
    return true;
  }

  // Tokenize alphabetical words
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const words = rawTokens.map((t) => t.replace(/[^a-zA-Z]/g, "")).filter(Boolean);
  if (words.length === 0) return true;

  // Single word line: must be at least 4 letters, or a recognizable year
  if (words.length === 1) {
    if (words[0].length < 4 && !/\b(19\d{2}|20\d{2})\b/.test(cleaned)) {
      return true;
    }
    return false;
  }

  // Calculate average word length and ratio of short words (<= 2 chars)
  const totalLetters = words.reduce((acc, w) => acc + w.length, 0);
  const avgWordLen = totalLetters / words.length;
  const shortCount = words.filter((w) => w.length <= 2).length;
  const shortRatio = shortCount / words.length;

  // Halftone photo dot-matrix noise is dominated by short 1-2 letter fragments
  // e.g. "RT, FR Cr La ee yi mG a", "a SAPD 4 EE EN", "A th h t | i", "foe ca . F elas ee 5"
  if (words.length >= 3 && (shortRatio >= 0.5 || avgWordLen < 3.2)) {
    // Preserve byline like "By Leslie E. Stevens"
    if (/^by\s+[a-zA-Z]+/i.test(cleaned)) {
      return false;
    }
    return true;
  }

  // If there are zero words of length >= 3, it is noise
  const validWords = words.filter((w) => w.length >= 3);
  if (validWords.length === 0) return true;

  // Reject lines with scattered non-year digits (e.g. "Epa i E4 | - hd 3 a Ga")
  const numTokens = rawTokens.filter((t) => /\d/.test(t) && !/\b(18\d{2}|19\d{2}|20\d{2})\b/.test(t));
  if (
    numTokens.length >= 2 ||
    (numTokens.length === 1 && words.length <= 4 && !/\b(no|vol|page)\.\s*\d+|\$\d+|\d+%/i.test(cleaned))
  ) {
    return true;
  }

  // Reject erratic mixed-case alternation within line (e.g. "fal HER")
  if (/\b[a-z]{2,}\s+[A-Z]{3,}\b/.test(cleaned)) {
    return true;
  }

  return false;
}

/**
 * Clean up raw OCR transcription text:
 * - Strips halftone photo artifacts and isolated noise lines
 * - Fixes broken hyphenated words at linebreaks (e.g. "indepen- \n dent" -> "independent")
 * - Cleans stray graphic banner prefixes (e.g. "var Businesses: Books WEST" -> "Books WEST")
 * - Normalizes spacing into readable archival paragraphs
 */
export function cleanOcrTranscription(rawText: string): string {
  if (!rawText) return "";

  const lines = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

  const cleanedLines: string[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Clean leading artifact prefixes like "var Businesses: Books WEST" -> "Books WEST"
    line = line.replace(/^var\s+[a-z]+:\s*/i, "");

    // Remove leading/trailing border punctuation (preserving trailing hyphen for word wraps)
    line = line.replace(/^[|:;=~#_+*"'‘“”»«\[\]{}<>\s]+/, "");
    line = line.replace(/[|:;=~#_+*"'‘“”»«\[\]{}<>\s]+$/, "");
    if (line.length < 3) continue;

    if (isHalftoneNoiseLine(line)) {
      continue;
    }

    cleanedLines.push(line);
  }

  // Join lines
  let text = cleanedLines.join("\n");

  // Merge broken hyphenated words across linebreaks
  // e.g. "indepen-\n dent" -> "independent", "com-\n pounding" -> "compounding"
  text = text.replace(/(\b[a-zA-Z]{2,})-\s*\n\s*([a-zA-Z]{2,}\b)/g, "$1$2");

  // Normalize excessive newlines (max 2 consecutive newlines)
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}
