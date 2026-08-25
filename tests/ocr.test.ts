import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/ocr/route";
import { NextRequest } from "next/server";

describe("OCR API Route", () => {
  it("should reject unauthorized requests when no session cookie is present", async () => {
    const req = new NextRequest("http://localhost:3000/api/ocr", {
      method: "POST",
      body: JSON.stringify({ imageUrl: "/seed-images/gotham-front.svg" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
