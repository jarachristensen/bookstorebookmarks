import { describe, it, expect } from "vitest";
import {
  normalizeStoreName,
  slugifyStoreName,
  getStorefrontCandidatePaths,
  resolveStorefrontImage,
  DEFAULT_STOREFRONT_IMAGE,
} from "@/lib/utils/storefront";

describe("Storefront Resolution Utility", () => {
  it("normalizes store names correctly", () => {
    expect(normalizeStoreName("City Lights Booksellers & Publishers")).toBe(
      "citylightsbooksellerspublishers"
    );
    expect(normalizeStoreName("A Clean Well-Lighted Place For Books")).toBe(
      "acleanwelllightedplaceforbooks"
    );
    expect(normalizeStoreName("Strand Book Store")).toBe("strandbookstore");
  });

  it("slugifies store names correctly", () => {
    expect(slugifyStoreName("City Lights Booksellers & Publishers")).toBe(
      "city-lights-booksellers-publishers"
    );
    expect(slugifyStoreName("A Clean Well-Lighted Place For Books")).toBe(
      "a-clean-well-lighted-place-for-books"
    );
  });

  it("generates candidate paths including user-specified pattern", () => {
    const paths = getStorefrontCandidatePaths({
      name: "City Lights Booksellers",
      id: "city-lights-booksellers",
    });

    expect(paths).toContain("/images/storefronts/citylightsbooksellers-storefront.png");
    expect(paths).toContain("/images/storefronts/city-lights-booksellers-storefront.png");
  });

  it("resolves exact diecut storefront image when file exists in storefronts list", () => {
    const mockFiles = [
      "citylightsbooksellers-storefront.png",
      "strandbookstore-storefront.png",
      "archesbookstore-storefront.png",
    ];

    const resolved = resolveStorefrontImage(
      {
        name: "City Lights Booksellers",
        id: "city-lights",
      },
      mockFiles
    );

    expect(resolved).toBe("/images/storefronts/citylightsbooksellers-storefront.png");
  });

  it("resolves citylights-storefront.png for City Lights Booksellers & Publishers", () => {
    const mockFiles = [
      "citylights-storefront.png",
      "greenapplebooks-storefront.png",
    ];

    const resolved = resolveStorefrontImage(
      {
        name: "City Lights Booksellers & Publishers",
        id: "city-lights-books",
      },
      mockFiles
    );

    expect(resolved).toBe("/images/storefronts/citylights-storefront.png");
  });

  it("falls back directly to nobookstoreimage.png if no diecut image exists in storefronts", () => {
    const resolved = resolveStorefrontImage(
      {
        name: "Unknown Old Store",
        id: "unknown-store",
      },
      []
    );

    expect(resolved).toBe(DEFAULT_STOREFRONT_IMAGE);
  });
});
