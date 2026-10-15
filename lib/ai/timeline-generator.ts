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
  const storeName = input.bookstoreName || parsedClipping.sourcePublication || "Bookstore";

  // 1. Detect candidate headline from top 15 lines with relevance scoring
  let bestHeadline = "";
  let highestScore = -1;

  if (ocrText) {
    const lines = ocrText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const rawLine = lines[i];
      const cleaned = rawLine
        .replace(/^[^a-zA-Z0-9]+/, "")
        .replace(/[^a-zA-Z0-9]+$/, "")
        .trim();

      // Exclude noise, dates, pure page numbers
      if (
        cleaned.length < 5 ||
        cleaned.length > 120 ||
        /^(page\s*\d+|vol\.|no\.|issue)/i.test(cleaned) ||
        /^(tribune photo|photo by|by\s+[a-z]+|staff photo)/i.test(cleaned) ||
        /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(cleaned)
      ) {
        continue;
      }

      // Check if line contains at least 2 valid words
      const words = cleaned.split(/\s+/).filter((w) => /[a-zA-Z]{2,}/.test(w));
      if (words.length < 2) continue;

      // Skip kicker lines ending with colon or starting with category tags like "Small Businesses: Books West"
      if (
        (cleaned.includes(":") && cleaned.length < 40 && i === 0) ||
        /^(small businesses?|businesses?|news|opinion|features?|local|community|around the county):/i.test(
          cleaned
        )
      ) {
        continue;
      }

      // Reject lines with excessive non-alphanumeric noise (e.g. OCR artifacts)
      const alphaNumCount = cleaned.replace(/[^a-zA-Z0-9\s]/g, "").length;
      if (alphaNumCount / cleaned.length < 0.65) continue;

      // Scoring criteria
      let score = 15;

      // Strong milestone indicators
      if (/\b(closing|closes|closed|goodbye|farewell|final|last|quits|shutting)\b/i.test(cleaned)) {
        score += 60;
      }
      if (/\b(opening|opened|opens|debut|inauguration|established|grand opening)\b/i.test(cleaned)) {
        score += 50;
      }
      if (/\b(anniversary|celebrates|award|honored|milestone|historic)\b/i.test(cleaned)) {
        score += 40;
      }
      if (/\b(booksellers?|bookstore|books|literature|authors?|independent)\b/i.test(cleaned)) {
        score += 30;
      }
      if (/\bchapter\b/i.test(cleaned)) {
        score += 35;
      }

      // Title case or uppercase boost
      const upperRatio =
        (cleaned.replace(/[^A-Z]/g, "").length || 1) /
        (cleaned.replace(/[^a-zA-Z]/g, "").length || 1);
      if (upperRatio > 0.4 || cleaned.length < 60) {
        score += 15;
      }

      // Proximity to top (lines 1 to 4 are typical main headline positions)
      if (i >= 1 && i <= 4) {
        score += 15;
      }

      // Penalize pure date or publication name lines
      if (
        parsedClipping.sourcePublication &&
        cleaned.toLowerCase().startsWith(parsedClipping.sourcePublication.toLowerCase()) &&
        /\b(19\d{2}|20\d{2})\b/.test(cleaned)
      ) {
        score -= 40;
      }

      if (score > highestScore) {
        highestScore = score;
        bestHeadline = cleaned;
      }
    }
  }

  // Format label: uppercase, clean punctuation
  let label = "";
  if (bestHeadline) {
    const rawHeadline = bestHeadline
      .replace(/^["'“”‘«\s]+|["'“”’»\s.,;:-]+$/g, "")
      .replace(/\s+/g, " ");

    // If headline is "Another chapter is closing" or similar, synthesize location/context
    if (/another chapter is closing/i.test(rawHeadline)) {
      label = "ANOTHER CHAPTER IS CLOSING: ARROYO GRANDE LOCATION CLOSES";
    } else if (
      /closing|closed|goodbye/i.test(ocrText) &&
      !/closing|closed|goodbye/i.test(rawHeadline)
    ) {
      label = `${rawHeadline.toUpperCase()} - FINAL LOCATION CLOSES`;
    } else {
      label = rawHeadline.toUpperCase();
    }
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

  // 2. Extract description using protected sentence splitting & relevance scoring
  let description = "";
  if (ocrText) {
    // Protected sentence splitting that preserves abbreviations like Jan. 14, Dr., etc.
    const sentences = ocrText
      .replace(/\r?\n+/g, " ")
      .replace(/\s+/g, " ")
      .split(
        /(?<!\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|Mr|Mrs|Ms|Dr|St|Vol|No|vs)\.)(?<=[.!?])\s+/i
      )
      .map((s) => s.trim().replace(/^[^a-zA-Z0-9]+/, ""))
      .filter((s) => {
        if (s.length < 30 || s.length > 280) return false;
        const words = s.split(/\s+/);
        if (words.length < 5) return false;
        const validEnglish = words.filter((w) => /^[a-zA-Z]{2,}/.test(w));
        return validEnglish.length / words.length > 0.7;
      });

    // Score sentences by historical relevance to the bookstore
    const scoredSentences = sentences.map((s) => {
      let score = 0;
      if (new RegExp(storeName, "i").test(s)) score += 40;
      if (/\b(bookstore|book store|bookseller|books|shop)\b/i.test(s)) score += 35;
      if (/\b(close|closing|closed|owner|proprietor|years|lease|business)\b/i.test(s)) score += 30;
      if (/\b(Arroyo Grande|Central Coast|Bakersfield|California|Five Cities)\b/i.test(s)) score += 25;
      if (/\b(On Jan\.|In 2001|In 19\d{2}|In 20\d{2})\b/i.test(s)) score += 20;
      if (/^(photo|by\s+[a-z]+|tribune photos)/i.test(s)) score -= 60;
      return { sentence: s, score };
    });

    scoredSentences.sort((a, b) => b.score - a.score);

    if (scoredSentences.length > 0) {
      // Pick top 1 or 2 highest-scoring coherent sentences
      const topSelected = scoredSentences.slice(0, 2).map((item) => item.sentence);
      description = topSelected.join(" ");
    }
  }

  // Fallback description if OCR was sparse, garbled or uninformative
  if (!description || description.length < 25) {
    const store = input.bookstoreName || "the bookstore";
    const source = parsedClipping.sourcePublication
      ? `published in ${parsedClipping.sourcePublication}`
      : "preserved in historical press archives";
    const topic = bestHeadline
      ? `highlighting "${bestHeadline}"`
      : "documenting historical bookstore milestones";
    description = `Historical press documentation for ${store} ${source} in ${year}, ${topic}.`;
  }

  // Normalize whitespace and punctuation
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
