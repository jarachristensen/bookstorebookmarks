import { describe, it, expect } from "vitest";
import { parseClippingFilename } from "@/lib/utils/clipping-parser";

describe("Clipping Filename Parser", () => {
  it("should parse San_Francisco_Chronicle_2026_05_29_B8.jpg", () => {
    const result = parseClippingFilename("San_Francisco_Chronicle_2026_05_29_B8.jpg");
    expect(result.sourcePublication).toBe("San Francisco Chronicle");
    expect(result.publicationDate).toBe("May 29, 2026");
    expect(result.caption).toBe("San Francisco Chronicle (May 29, 2026)");
  });

  it("should parse The_New_York_Times_1947_11_14.png", () => {
    const result = parseClippingFilename("The_New_York_Times_1947_11_14.png");
    expect(result.sourcePublication).toBe("The New York Times");
    expect(result.publicationDate).toBe("Nov 14, 1947");
    expect(result.caption).toBe("The New York Times (Nov 14, 1947)");
  });

  it("should parse Chicago_Tribune_1955-10-24_page12.jpg", () => {
    const result = parseClippingFilename("Chicago_Tribune_1955-10-24_page12.jpg");
    expect(result.sourcePublication).toBe("Chicago Tribune");
    expect(result.publicationDate).toBe("Oct 24, 1955");
    expect(result.caption).toBe("Chicago Tribune (Oct 24, 1955)");
  });

  it("should parse Village_Voice_1968.jpg", () => {
    const result = parseClippingFilename("Village_Voice_1968.jpg");
    expect(result.sourcePublication).toBe("Village Voice");
    expect(result.publicationDate).toBe("1968");
    expect(result.caption).toBe("Village Voice (1968)");
  });

  it("should handle generic scan filenames gracefully without crashing", () => {
    const result = parseClippingFilename("scan_001.jpg");
    expect(result.sourcePublication).toBe("");
    expect(result.publicationDate).toBe("");
    expect(result.caption).toBe("Archival Press Clipping");
  });
});
