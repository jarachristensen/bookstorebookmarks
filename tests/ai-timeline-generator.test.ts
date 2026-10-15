import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  generateTimelineEntryFromArticle,
  GeneratedTimelineEntry,
} from "@/lib/ai/timeline-generator";
import { POST } from "@/app/api/timeline/generate-entry/route";
import * as authModule from "@/lib/auth";

describe("AI Timeline Generator - generateTimelineEntryFromArticle", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("extracts year, label, and description from historical clipping OCR and filename", async () => {
    const ocrText = `
JUDGE RULES 'HOWL' NOT OBSCENE
San Francisco, Oct. 3, 1957 — Municipal Court Judge Clayton Horn ruled today that the controversial poem "Howl" by Allen Ginsberg has redeeming social importance.
The ruling dismissed obscenity charges against City Lights bookstore owner Lawrence Ferlinghetti and clerk Shigeyoshi Murao.
    `.trim();

    const result: GeneratedTimelineEntry = await generateTimelineEntryFromArticle({
      ocrText,
      fileName: "San_Francisco_Chronicle_1957_10_04.jpg",
      bookstoreName: "City Lights Booksellers",
    });

    expect(result.year).toBe(1957);
    expect(result.label).toBeDefined();
    expect(result.label).toBe(result.label.toUpperCase());
    expect(result.label).toMatch(/HOWL|OBSCENE|JUDGE/);
    expect(result.description).toContain("Clayton Horn");
    expect(result.description.length).toBeGreaterThan(20);
  });

  it("prioritizes publicationDate over fileName and ocrText for year extraction", async () => {
    const result = await generateTimelineEntryFromArticle({
      publicationDate: "November 14, 1965",
      fileName: "clipping_1972_article.jpg",
      ocrText: "In the summer of 1980, the store expanded.",
    });

    expect(result.year).toBe(1965);
  });

  it("extracts year from fileName when publicationDate is missing", async () => {
    const result = await generateTimelineEntryFromArticle({
      fileName: "Village_Voice_1968_feature.jpg",
      ocrText: "Poetry reading scheduled for Friday evening.",
    });

    expect(result.year).toBe(1968);
  });

  it("extracts 4-digit year from ocrText when publicationDate and fileName lack a year", async () => {
    const result = await generateTimelineEntryFromArticle({
      fileName: "unknown_scan.png",
      ocrText: "A rare literary salon took place in December 1923 at the Gotham shop.",
    });

    expect(result.year).toBe(1923);
  });

  it("falls back to 1950 when no year is detectable across all inputs", async () => {
    const result = await generateTimelineEntryFromArticle({
      fileName: "undated_scan.jpg",
      ocrText: "Poetry readings and book signings every weekend.",
    });

    expect(result.year).toBe(1950);
  });

  it("handles sparse or completely empty OCR text gracefully using metadata fallback", async () => {
    const result = await generateTimelineEntryFromArticle({
      fileName: "The_New_York_Times_1947_11_14.png",
      bookstoreName: "Gotham Book Mart",
    });

    expect(result.year).toBe(1947);
    expect(result.label).toBeDefined();
    expect(result.label).toBe(result.label.toUpperCase());
    expect(result.description).toBeDefined();
    expect(result.description.length).toBeGreaterThan(15);
  });

  it("uses Gemini API when GEMINI_API_KEY is present", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";

    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  label: "HOWL TRIAL LANDMARK DECISION",
                  description:
                    "Judge Clayton Horn ruled that Allen Ginsberg's poem possessed redeeming social value.",
                }),
              },
            ],
          },
        },
      ],
    };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await generateTimelineEntryFromArticle({
      ocrText: "Sample text",
      fileName: "San_Francisco_1957.jpg",
    });

    expect(fetchSpy).toHaveBeenCalled();
    expect(result.year).toBe(1957);
    expect(result.label).toBe("HOWL TRIAL LANDMARK DECISION");
    expect(result.description).toContain("Judge Clayton Horn ruled");
  });

  it("uses OpenAI API when OPENAI_API_KEY is present and Gemini key is absent", async () => {
    process.env.OPENAI_API_KEY = "test-openai-key";

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              label: "NEW SUBTERRANEAN BOOK VAULT OPENS",
              description:
                "City Lights Booksellers launched a major basement poetry expansion in North Beach.",
            }),
          },
        },
      ],
    };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await generateTimelineEntryFromArticle({
      ocrText: "Sample text",
      fileName: "City_Lights_1958.jpg",
    });

    expect(fetchSpy).toHaveBeenCalled();
    expect(result.year).toBe(1958);
    expect(result.label).toBe("NEW SUBTERRANEAN BOOK VAULT OPENS");
    expect(result.description).toContain("basement poetry expansion");
  });

  it("gracefully falls back to heuristic generation if LLM API fails with an error", async () => {
    process.env.GEMINI_API_KEY = "test-gemini-key";

    vi.spyOn(global, "fetch").mockRejectedValue(new Error("Network timeout"));

    const result = await generateTimelineEntryFromArticle({
      ocrText: `
POETRY ROOM CELEBRATION
Poets and readers gathered at the bookshop in 1961 to commemorate the poetry room.
      `.trim(),
      fileName: "Poetry_1961.jpg",
    });

    expect(result.year).toBe(1961);
    expect(result.label).toBe("POETRY ROOM CELEBRATION");
    expect(result.description).toContain("Poets and readers gathered");
  });
});

describe("POST /api/timeline/generate-entry", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects unauthorized requests with status 401", async () => {
    vi.spyOn(authModule, "getAdminSession").mockResolvedValue(false);

    const req = new NextRequest("http://localhost:3000/api/timeline/generate-entry", {
      method: "POST",
      body: JSON.stringify({
        ocrText: "Headline event in 1960",
        fileName: "event_1960.jpg",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("accepts authorized curator requests and returns generated entry", async () => {
    vi.spyOn(authModule, "getAdminSession").mockResolvedValue(true);

    const req = new NextRequest("http://localhost:3000/api/timeline/generate-entry", {
      method: "POST",
      body: JSON.stringify({
        ocrText: `
CITY LIGHTS EXPANDS TO BASEMENT
San Francisco, 1958 — City Lights opened its new subterranean poetry department today.
        `.trim(),
        fileName: "City_Lights_1958.jpg",
        bookstoreName: "City Lights Booksellers",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.entry).toBeDefined();
    expect(data.entry.year).toBe(1958);
    expect(data.entry.label).toBe(data.entry.label.toUpperCase());
    expect(data.entry.description).toContain("subterranean");
  });

  it("handles malformed JSON request body gracefully", async () => {
    vi.spyOn(authModule, "getAdminSession").mockResolvedValue(true);

    const req = new NextRequest("http://localhost:3000/api/timeline/generate-entry", {
      method: "POST",
      body: "invalid-not-json",
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
