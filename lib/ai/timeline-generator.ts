import { parseClippingFilename } from "@/lib/utils/clipping-parser";

export interface GeneratedTimelineEntry {
  year: number;
  label: string; // e.g. "HOWL OBSCENITY TRIAL ACQUITTAL"
  description: string; // 1-2 sentence summary
}

export interface GenerateTimelineInput {
  ocrText?: string;
  fileName?: string;
  bookstoreName?: string;
  publicationDate?: string;
}

const YEAR_REGEX = /\b(18\d{2}|19\d{2}|20\d{2})\b/;

/**
 * Extract 4-digit historical year with precedence:
 * 1. publicationDate
 * 2. fileName
 * 3. ocrText
 * 4. Fallback: 1950
 */
export function extractYearFromInput(input: GenerateTimelineInput): number {
  const matchYear = (text?: string): number | null => {
    if (!text) return null;
    // Replace underscores, hyphens, and dots so \b word boundaries match cleanly in filenames
    const normalized = text.replace(/[_/\\.-]/g, " ");
    const match = normalized.match(YEAR_REGEX);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const fromPub = matchYear(input.publicationDate);
  if (fromPub !== null) return fromPub;

  const fromFile = matchYear(input.fileName);
  if (fromFile !== null) return fromFile;

  const fromOcr = matchYear(input.ocrText);
  if (fromOcr !== null) return fromOcr;

  return 1950;
}

/**
 * Heuristic fallback when LLM API is unavailable or offline.
 */
function generateHeuristicTimelineEntry(
  input: GenerateTimelineInput,
  year: number
): { label: string; description: string } {
  const ocrText = (input.ocrText || "").trim();
  const parsedClipping = parseClippingFilename(input.fileName);

  // 1. Detect candidate headline from top lines
  let headline = "";
  if (ocrText) {
    const lines = ocrText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Look at top 10 lines for the best headline candidate
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const rawLine = lines[i];
      // Clean leading and trailing punctuation/bullets
      const line = rawLine
        .replace(/^[^a-zA-Z0-9]+/, "")
        .replace(/[^a-zA-Z0-9]+$/, "")
        .trim();

      // Exclude short noise, dates, pure page numbers
      if (
        line.length < 5 ||
        line.length > 120 ||
        /^page\s*\d+/i.test(line) ||
        /^(vol\.|no\.|issue|\d+)/i.test(line) ||
        /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(line)
      ) {
        continue;
      }

      // Check if line contains at least 2 valid words (length >= 2)
      const words = line.split(/\s+/).filter((w) => /[a-zA-Z]{2,}/.test(w));
      if (words.length < 2) continue;

      // Reject lines with excessive non-alphanumeric noise (e.g. OCR artifacts like | { } > < \ /)
      const alphaNumCount = line.replace(/[^a-zA-Z0-9\s]/g, "").length;
      if (alphaNumCount / line.length < 0.65) continue;

      // Skip lines that are just the newspaper title + date (e.g. "The Tribune, Friday, Nov 24, 2000")
      if (
        parsedClipping.sourcePublication &&
        line.toLowerCase().startsWith(parsedClipping.sourcePublication.toLowerCase()) &&
        /\b(19\d{2}|20\d{2})\b/.test(line)
      ) {
        continue;
      }

      headline = line;
      break;
    }
  }

  // Format label: uppercase, clean punctuation
  let label = "";
  if (headline) {
    label = headline
      .replace(/^["'“”‘«\s]+|["'“”’»\s.,;:-]+$/g, "")
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  // If no headline found in OCR, derive from metadata
  if (!label || label.length < 3) {
    if (parsedClipping.sourcePublication) {
      label = `${parsedClipping.sourcePublication.toUpperCase()} PRESS REPORT`;
    } else if (input.bookstoreName) {
      label = `${input.bookstoreName.toUpperCase()} ARCHIVAL RECORD`;
    } else {
      label = "ARCHIVAL PRESS REPORT";
    }
  }

  // 2. Extract description (1-2 sentences)
  let description = "";
  if (ocrText) {
    // Remove the detected headline from the top if it matches
    let bodyText = ocrText;
    if (headline && bodyText.startsWith(headline)) {
      bodyText = bodyText.slice(headline.length).trim();
    }

    // Split body into sentences
    const rawSentences = bodyText
      .replace(/\r?\n+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => {
        if (s.length < 25) return false;
        // Ensure sentence contains real words and not random OCR character noise
        const words = s.split(/\s+/);
        if (words.length < 4) return false;
        const validWords = words.filter((w) => /^[a-zA-Z]{2,}/.test(w));
        return validWords.length / words.length > 0.6;
      });

    if (rawSentences.length > 0) {
      const selected = rawSentences.slice(0, 2);
      description = selected.join(" ");
    }
  }

  // Fallback description if OCR was sparse, garbled or uninformative
  if (!description || description.length < 20) {
    const store = input.bookstoreName || "the bookstore";
    const source = parsedClipping.sourcePublication
      ? `published in ${parsedClipping.sourcePublication}`
      : "preserved in historical press archives";
    const topic = headline ? `highlighting "${headline}"` : "documenting historical bookstore milestones";
    description = `Historical press documentation for ${store} ${source} in ${year}, ${topic}.`;
  }

  // Normalize whitespace
  description = description.replace(/\s+/g, " ").trim();
  if (!/[.!?]$/.test(description)) {
    description += ".";
  }

  return { label, description };
}

/**
 * Call Gemini 1.5 Flash to synthesize label and description.
 */
async function callGemini(
  prompt: string,
  apiKey: string
): Promise<{ label: string; description: string } | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const parsed = JSON.parse(text);
  if (parsed.label && parsed.description) {
    return {
      label: String(parsed.label).trim().toUpperCase(),
      description: String(parsed.description).trim(),
    };
  }

  return null;
}

/**
 * Call OpenAI gpt-4o-mini to synthesize label and description.
 */
async function callOpenAI(
  prompt: string,
  apiKey: string
): Promise<{ label: string; description: string } | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a historical archivist. Return JSON with 'label' (short uppercase headline/title) and 'description' (1-2 sentence historical summary).",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content);
  if (parsed.label && parsed.description) {
    return {
      label: String(parsed.label).trim().toUpperCase(),
      description: String(parsed.description).trim(),
    };
  }

  return null;
}

/**
 * Main generator function.
 * Synthesizes a curated timeline milestone entry from article OCR and metadata.
 */
export async function generateTimelineEntryFromArticle(
  input: GenerateTimelineInput
): Promise<GeneratedTimelineEntry> {
  const year = extractYearFromInput(input);

  // If executing in browser, attempt to invoke server endpoint which has access to server environment keys
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/timeline/generate-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.entry && data.entry.label) {
          return data.entry;
        }
      }
    } catch {
      // Gracefully fall back to local execution
    }
  }

  // If Gemini or OpenAI keys are configured, try calling them
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (geminiKey || openAiKey) {
    const prompt = `
Analyze this bookstore newspaper clipping/article to extract a timeline milestone entry.
Year: ${year}
Bookstore: ${input.bookstoreName || "Unknown"}
File: ${input.fileName || ""}
Publication Date: ${input.publicationDate || ""}
OCR Text:
${(input.ocrText || "").slice(0, 3000)}

Return a JSON object with:
- "label": A concise, high-impact uppercase title for the milestone (e.g. "HOWL OBSCENITY TRIAL ACQUITTAL" or "POETRY ROOM INAUGURATION")
- "description": A concise, well-written 1 to 2 sentence summary describing the significance of the event.
    `.trim();

    try {
      if (geminiKey) {
        const aiResult = await callGemini(prompt, geminiKey);
        if (aiResult) {
          return { year, ...aiResult };
        }
      } else if (openAiKey) {
        const aiResult = await callOpenAI(prompt, openAiKey);
        if (aiResult) {
          return { year, ...aiResult };
        }
      }
    } catch {
      // Gracefully fall through to heuristic generator on network/timeout/parse failure
    }
  }

  // Heuristic generation fallback
  const fallback = generateHeuristicTimelineEntry(input, year);
  return {
    year,
    label: fallback.label,
    description: fallback.description,
  };
}
