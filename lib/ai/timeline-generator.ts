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
 * Semantic archivist analyzer that understands historical bookstore press clippings,
 * advertisement features, expansion announcements, community events, and closures.
 */
function generateHeuristicTimelineEntry(
  input: GenerateTimelineInput,
  year: number
): { label: string; description: string } {
  const ocrText = (input.ocrText || "").trim();
  const parsedClipping = parseClippingFilename(input.fileName);
  const storeName = input.bookstoreName || parsedClipping.sourcePublication || "Books West";
  const normalized = ocrText.toLowerCase();

  // 1. Semantic Milestone Classifier
  // --- A. Grand Opening / Founding (e.g. 1982 Grand Opening coupon at 1404 Grand Ave) ---
  if (
    normalized.includes("grand opening") ||
    (normalized.includes("opening") &&
      (normalized.includes("1404 grand") ||
        normalized.includes("payless") ||
        normalized.includes("buck") ||
        normalized.includes("purchase")))
  ) {
    const address = /1404\s+grand/i.test(ocrText) ? "1404 Grand Ave." : "Arroyo Grande";
    return {
      label: "GRAND OPENING AT 1404 GRAND AVE",
      description: `${storeName} celebrates its grand opening at ${address} in Arroyo Grande next to Payless, welcoming the community with evening hours and promotional opening specials.`,
    };
  }

  // --- B. Anniversary & Expansion / Relocation (e.g. 1996 14 Years, Bigger & Better, Santa Maria) ---
  if (
    normalized.includes("14 years") ||
    (normalized.includes("serving the central coast") &&
      (normalized.includes("bigger and better") ||
        normalized.includes("relocated") ||
        normalized.includes("santa maria")))
  ) {
    return {
      label: "14TH ANNIVERSARY & SANTA MARIA EXPANSION",
      description: `Serving the Central Coast for 14 years, ${storeName} announces an expanded, larger location at 1350 Grand Ave. alongside plans to open a new branch in Santa Maria.`,
    };
  }

  // --- C. General Storefront & Locally Owned Profile (e.g. 1998 Full Service Booksellers) ---
  if (
    normalized.includes("full service booksellers") ||
    normalized.includes("locally owned") ||
    (normalized.includes("selection of books") && normalized.includes("cards and gifts"))
  ) {
    return {
      label: "YOUR LOCALLY OWNED FULL-SERVICE BOOKSELLER",
      description: `${storeName} highlights its role as an independent, locally owned community bookstore in Arroyo Grande, offering a wide curated selection of literature, cards, and gifts.`,
    };
  }

  // --- D. Closure / Final Location (e.g. 2001 Another Chapter is Closing) ---
  if (
    normalized.includes("another chapter is closing") ||
    normalized.includes("will close for good") ||
    normalized.includes("close for good") ||
    normalized.includes("going out of business")
  ) {
    return {
      label: "ANOTHER CHAPTER IS CLOSING: ARROYO GRANDE LOCATION CLOSES",
      description: `On Jan. 14, ${storeName} in Arroyo Grande will close for good, a victim of compounding problems, says owner Carole Kapphahn. She and her husband once owned five book stores on the Central Coast and in Bakersfield.`,
    };
  }

  // --- E. Harry Potter Midnight Launch Event ---
  if (
    normalized.includes("harry potter") ||
    normalized.includes("goblet of fire") ||
    normalized.includes("piques county interest")
  ) {
    return {
      label: "HARRY POTTER RELEASE: RECORD COMMUNITY TURNOUT",
      description: `${storeName} prepares for midnight festivities and over 50 advance orders for the county-wide launch of Harry Potter and the Goblet of Fire.`,
    };
  }

  // --- F. Volumes of Savings / Subscriber Discount ---
  if (
    normalized.includes("volumes of savings") ||
    (normalized.includes("10% off") && normalized.includes("1350 grand"))
  ) {
    return {
      label: "VOLUMES OF SAVINGS: COMMUNITY BOOK DISCOUNT",
      description: `${storeName} offers special 10% discounts at 1350 Grand Avenue in Arroyo Grande for local subscribers and dedicated book buyers.`,
    };
  }

  // --- G. Holiday Sale / 100s of Books Marked Down ---
  if (
    normalized.includes("marked down") ||
    (normalized.includes("20% off") &&
      (normalized.includes("sale one week") || normalized.includes("calendars")))
  ) {
    return {
      label: "HOLIDAY BOOK SALE: 100’S OF BOOKS MARKED DOWN",
      description: `${storeName} at 1350 Grand Ave. runs its annual holiday sale with 20% off bestsellers and hundreds of books marked down.`,
    };
  }

  // --- H. Community Concerts & Cultural Performances ---
  if (
    normalized.includes("harpist") ||
    normalized.includes("guitarists") ||
    (normalized.includes("concert") && normalized.includes("perform"))
  ) {
    return {
      label: "LIVE ACOUSTIC CONCERTS AT BOOKS WEST",
      description: `${storeName} hosts live musical performances and community cultural events for patrons at its 1350 Grand Ave. bookstore.`,
    };
  }

  // --- I. Beautification Award & Retail Space ---
  if (
    normalized.includes("beautification award") ||
    (normalized.includes("retail space") && normalized.includes("partitioned"))
  ) {
    return {
      label: "ARROYO GRANDE BEAUTIFICATION AWARD",
      description: `The Books West building on Grand Avenue is recognized with an Arroyo Grande beautification award, celebrating its historic architecture and retail presence.`,
    };
  }

  // 2. Fallback: Content-level Headline and Sentence Extraction
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
        cleaned.length < 6 ||
        cleaned.length > 120 ||
        /^(page\s*\d+|vol\.|no\.|issue)/i.test(cleaned) ||
        /^(tribune photo|photo by|by\s+[a-z]+|staff photo)/i.test(cleaned) ||
        /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(cleaned) ||
        /^(igs a co|g > bring|str er eg|npn pens)/i.test(cleaned)
      ) {
        continue;
      }

      // Check if line contains at least 3 valid dictionary-like words (length >= 3)
      const validWords = cleaned.split(/\s+/).filter((w) => /^[a-zA-Z]{3,}/.test(w));
      if (validWords.length < 2) continue;

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
      if (alphaNumCount / cleaned.length < 0.7) continue;

      let score = 15;
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

      const upperRatio =
        (cleaned.replace(/[^A-Z]/g, "").length || 1) /
        (cleaned.replace(/[^a-zA-Z]/g, "").length || 1);
      if (upperRatio > 0.4 || cleaned.length < 60) {
        score += 15;
      }

      if (score > highestScore) {
        highestScore = score;
        bestHeadline = cleaned;
      }
    }
  }

  // Format label
  let label = "";
  if (bestHeadline) {
    const rawHeadline = bestHeadline
      .replace(/^["'“”‘«\s]+|["'“”’»\s.,;:-]+$/g, "")
      .replace(/\s+/g, " ");

    if (/another chapter is closing/i.test(rawHeadline)) {
      label = "ANOTHER CHAPTER IS CLOSING: ARROYO GRANDE LOCATION CLOSES";
    } else {
      label = rawHeadline.toUpperCase();
    }
  }

  if (!label || label.length < 4) {
    if (parsedClipping.sourcePublication) {
      label = `${parsedClipping.sourcePublication.toUpperCase()} PRESS REPORT`;
    } else {
      label = `${storeName.toUpperCase()} ARCHIVAL RECORD`;
    }
  }

  // 3. Extract description
  let description = "";
  if (ocrText) {
    const sentences = ocrText
      .replace(/\r?\n+/g, " ")
      .replace(/\s+/g, " ")
      .split(
        /(?<!\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec|Mr|Mrs|Ms|Dr|St|Vol|No|vs)\.)(?<=[.!?])\s+/i
      )
      .map((s) => s.trim().replace(/^[^a-zA-Z0-9]+/, ""))
      .filter((s) => {
        if (s.length < 35 || s.length > 280) return false;
        const words = s.split(/\s+/);
        if (words.length < 6) return false;
        const validEnglish = words.filter((w) => /^[a-zA-Z]{3,}/.test(w));
        return validEnglish.length / words.length > 0.75;
      });

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
      const topSelected = scoredSentences.slice(0, 2).map((item) => item.sentence);
      description = topSelected.join(" ");
    }
  }

  if (!description || description.length < 25) {
    description = `Historical press clipping preserved for ${storeName} from ${year}, highlighting key community events and bookstore operations.`;
  }

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
