import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ImageDropzone } from "@/components/admin/ImageDropzone";

vi.mock("@/lib/utils/image-compressor", () => ({
  compressImageIfNeeded: vi.fn((file: File) => Promise.resolve(file)),
  getNonTransparentBoundingBox: vi.fn(),
}));

describe("ImageDropzone Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/preview-123");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("renders drop placeholder when value is empty", () => {
    render(<ImageDropzone label="Front Scan" value="" onChange={vi.fn()} />);

    expect(screen.getByText(/Front Scan/i)).toBeDefined();
    expect(screen.getByText(/Click or drop scan here/i)).toBeDefined();
  });

  it("renders image preview when value URL is provided", () => {
    render(
      <ImageDropzone
        label="Front Scan"
        value="https://example.com/scan.webp"
        onChange={vi.fn()}
      />
    );

    const img = screen.getByRole("img");
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("https://example.com/scan.webp");
    expect(screen.getByText(/Replace Scan/i)).toBeDefined();
  });

  it("handles upload failure without leaving a false-positive preview and displays retry UI", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network connection dropped"));
    const onChangeMock = vi.fn();

    render(<ImageDropzone label="Front Scan" value="" onChange={onChangeMock} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(["fake-image-content"], "bookmark-scan.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Network connection dropped/i)).toBeDefined();
      expect(screen.getByRole("button", { name: /Retry Upload/i })).toBeDefined();
    });

    // onChange was not called with a fake URL
    expect(onChangeMock).not.toHaveBeenCalled();
    // Preview image is not masquerading as a loaded image
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("successfully updates parent when upload succeeds", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({ url: "https://blob.vercel-storage.com/bookmark-scan.webp" })
        ),
    });
    const onChangeMock = vi.fn();

    render(<ImageDropzone label="Front Scan" value="" onChange={onChangeMock} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(["fake-image-content"], "bookmark-scan.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith(
        "https://blob.vercel-storage.com/bookmark-scan.webp",
        expect.any(File)
      );
    });
  });
});
