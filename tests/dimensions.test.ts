import { parseDimensions } from "../lib/utils/dimensions";

describe("parseDimensions", () => {
  it("should parse standard portrait bookmark dimensions", () => {
    const res = parseDimensions('2.25" × 7.5"');
    expect(res.width).toBeCloseTo(2.25);
    expect(res.height).toBeCloseTo(7.5);
    expect(res.isLandscape).toBe(false);
    expect(res.aspectRatio).toBeCloseTo(2.25 / 7.5);
  });

  it("should detect landscape bookmarks when width > height", () => {
    const res = parseDimensions('7.0" × 2.25"');
    expect(res.width).toBeCloseTo(7.0);
    expect(res.height).toBeCloseTo(2.25);
    expect(res.isLandscape).toBe(true);
    expect(res.aspectRatio).toBeCloseTo(7.0 / 2.25);
  });

  it("should parse fractional inch dimensions like 2 1/4 x 7 1/2", () => {
    const res = parseDimensions("2 1/4 x 7 1/2");
    expect(res.width).toBeCloseTo(2.25);
    expect(res.height).toBeCloseTo(7.5);
    expect(res.isLandscape).toBe(false);
  });

  it("should handle atypical dimension strings gracefully with fallback", () => {
    const res = parseDimensions("vintage size");
    expect(res.width).toBe(2.25);
    expect(res.height).toBe(7.5);
    expect(res.isLandscape).toBe(false);
  });
});
