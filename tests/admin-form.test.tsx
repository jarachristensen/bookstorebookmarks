import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookmarkForm } from "@/components/admin/BookmarkForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/utils/image-compressor", () => ({
  compressImageIfNeeded: vi.fn((file: File) => Promise.resolve(file)),
  getNonTransparentBoundingBox: vi.fn(),
}));

describe("BookmarkForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/preview-123");
    global.URL.revokeObjectURL = vi.fn();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/bookstores")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as any;
  });

  it("should render all main input sections and controls", () => {
    render(<BookmarkForm />);

    expect(screen.getByText(/1. Bookmark Specimen/i)).toBeDefined();
    expect(screen.getByText(/2. Associated Bookstore Research Dossier/i)).toBeDefined();
    expect(screen.getByText(/Bookmark Front Scan/i)).toBeDefined();
    const matches = screen.getAllByPlaceholderText(/e.g. Gotham Book Mart/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("should show validation error if user submits without frontImageUrl", async () => {
    render(<BookmarkForm />);

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.getByText(/Please upload at least the front bookmark scan/i)
      ).toBeDefined();
    });
  });

  it("should submit successfully when all required fields and frontImageUrl are provided", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/bookstores")) {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        });
      }
      if (url === "/api/bookmarks") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "bm-123" }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as any;

    const initialData = {
      bookmark: {
        title: "City Lights Bookmark",
        frontImageUrl: "https://example.com/front.webp",
        backImageUrl: "",
        yearProduced: 1970,
        material: "Paper",
        dimensions: '2" × 7"',
        condition: "Fine",
        acquisitionDate: "",
        acquisitionNotes: "",
        isFeatured: false,
        displayOrder: 0,
        accentColor: "#881337",
      },
      bookstore: {
        name: "City Lights",
        city: "San Francisco",
        stateProvince: "CA",
        country: "United States",
        streetAddress: "261 Columbus Ave",
        yearOpened: 1953,
        yearClosed: "",
        isStillOperating: true,
        founders: "Lawrence Ferlinghetti",
        specialties: "Poetry",
        historicalBlurb: "Iconic bookstore",
        notablePatronsTrivia: "Beat poets",
        websiteUrl: "https://citylights.com",
      },
      archivalMedia: [],
    };

    render(<BookmarkForm initialData={initialData} />);

    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/bookmarks",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("should initialize specialties and notablePatronsTrivia as blank strings", () => {
    render(<BookmarkForm />);
    const specialtiesInput = screen.getByPlaceholderText(
      /Modernist Poetry, Rare Editions, Cinema/i
    ) as HTMLInputElement;
    const triviaInput = screen.getByPlaceholderText(
      /Patti Smith worked as a clerk here/i
    ) as HTMLTextAreaElement;

    expect(specialtiesInput.value).toBe("");
    expect(triviaInput.value).toBe("");
  });

  it("should render bookstore website URL input and allow typing", () => {
    render(<BookmarkForm />);
    const websiteInput = screen.getByPlaceholderText("https://example.com") as HTMLInputElement;
    expect(websiteInput).toBeDefined();
    expect(websiteInput.value).toBe("");
    fireEvent.change(websiteInput, { target: { value: "https://citylights.com" } });
    expect(websiteInput.value).toBe("https://citylights.com");
  });

  it("should not render MediaManager or clippings upload in BookmarkForm", () => {
    render(<BookmarkForm />);
    expect(screen.queryByText(/Bulk Upload Scans/i)).toBeNull();
    expect(screen.queryByText(/Drag & drop multiple scans here/i)).toBeNull();
    expect(screen.queryByText(/3\. Archival Media & Newspaper Clippings/i)).toBeNull();
  });

  it("should handle concurrent front and back uploads without clobbering each other", async () => {
    let resolveFrontUpload!: (val: any) => void;
    let resolveBackUpload!: (val: any) => void;

    const frontUploadPromise = new Promise((resolve) => {
      resolveFrontUpload = resolve;
    });
    const backUploadPromise = new Promise((resolve) => {
      resolveBackUpload = resolve;
    });

    let uploadCallCount = 0;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === "/api/upload") {
        uploadCallCount++;
        if (uploadCallCount === 1) {
          return frontUploadPromise;
        }
        return backUploadPromise;
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as any;

    render(<BookmarkForm />);

    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    expect(fileInputs.length).toBeGreaterThanOrEqual(2);

    const frontFile = new File(["front-content"], "front-scan.png", { type: "image/png" });
    const backFile = new File(["back-content"], "back-scan.png", { type: "image/png" });

    // Trigger both uploads concurrently
    fireEvent.change(fileInputs[0], { target: { files: [frontFile] } });
    fireEvent.change(fileInputs[1], { target: { files: [backFile] } });

    // Resolve front upload first
    resolveFrontUpload({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ url: "https://example.com/front-scan.webp" })),
    });

    // Resolve back upload second
    resolveBackUpload({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ url: "https://example.com/back-scan.webp" })),
    });

    // Both scans must be present in the UI and not overwritten
    await waitFor(() => {
      const frontImg = screen.getByRole("img", { name: /Bookmark Front Scan/i });
      const backImg = screen.getByRole("img", { name: /Bookmark Verso \/ Back Scan/i });

      expect(frontImg).toBeDefined();
      expect(frontImg.getAttribute("src")).toBe("https://example.com/front-scan.webp");
      expect(backImg).toBeDefined();
      expect(backImg.getAttribute("src")).toBe("https://example.com/back-scan.webp");
    });
  });
});
