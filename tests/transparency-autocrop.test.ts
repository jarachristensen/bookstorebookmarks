import { describe, it, expect } from "vitest";
import { getNonTransparentBoundingBox } from "@/lib/utils/image-compressor";

describe("Transparency Autocrop & Bounding Box Detection", () => {
  it("should detect the exact bounding box of a bookmark centered in a transparent canvas", () => {
    // Create a 10x10 mock RGBA image buffer (100 pixels * 4 = 400 bytes)
    const width = 10;
    const height = 10;
    const data = new Uint8ClampedArray(width * height * 4); // all 0s = 100% transparent

    // Place a 4x6 bookmark spec from x: 3..6 and y: 2..7
    for (let y = 2; y <= 7; y++) {
      for (let x = 3; x <= 6; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = 200; // R
        data[idx + 1] = 150; // G
        data[idx + 2] = 100; // B
        data[idx + 3] = 255; // Alpha (opaque)
      }
    }

    const bbox = getNonTransparentBoundingBox(data, width, height, 10);
    expect(bbox).not.toBeNull();
    expect(bbox?.x).toBe(3);
    expect(bbox?.y).toBe(2);
    expect(bbox?.width).toBe(4); // 3, 4, 5, 6 = 4 pixels
    expect(bbox?.height).toBe(6); // 2, 3, 4, 5, 6, 7 = 6 pixels
  });

  it("should return full dimensions when there is no transparent border", () => {
    const width = 8;
    const height = 8;
    const data = new Uint8ClampedArray(width * height * 4);

    // Fill completely with opaque pixels
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255; // Alpha
    }

    const bbox = getNonTransparentBoundingBox(data, width, height, 10);
    expect(bbox).not.toBeNull();
    expect(bbox?.x).toBe(0);
    expect(bbox?.y).toBe(0);
    expect(bbox?.width).toBe(8);
    expect(bbox?.height).toBe(8);
  });

  it("should ignore stray low-alpha noise below threshold", () => {
    const width = 6;
    const height = 6;
    const data = new Uint8ClampedArray(width * height * 4);

    // Put very low alpha noise (alpha=5) at corners
    data[3] = 5; // (0,0)
    data[(5 * width + 5) * 4 + 3] = 5; // (5,5)

    // Put real bookmark pixels (alpha=255) at (2,2) to (3,3)
    for (let y = 2; y <= 3; y++) {
      for (let x = 2; x <= 3; x++) {
        const idx = (y * width + x) * 4;
        data[idx + 3] = 255;
      }
    }

    const bbox = getNonTransparentBoundingBox(data, width, height, 15);
    expect(bbox).not.toBeNull();
    expect(bbox?.x).toBe(2);
    expect(bbox?.y).toBe(2);
    expect(bbox?.width).toBe(2);
    expect(bbox?.height).toBe(2);
  });

  it("should return null for entirely transparent canvas", () => {
    const width = 5;
    const height = 5;
    const data = new Uint8ClampedArray(width * height * 4); // all 0 alpha

    const bbox = getNonTransparentBoundingBox(data, width, height, 10);
    expect(bbox).toBeNull();
  });
});
