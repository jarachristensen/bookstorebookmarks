import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import path from "path";
import fs from "fs";
import { createWorker } from "tesseract.js";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let worker: any = null;

  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "No imageUrl provided" }, { status: 400 });
    }

    // Resolve local image path if stored in public/
    let imageSource: string | Buffer = imageUrl;
    if (imageUrl.startsWith("/")) {
      const localPath = path.join(process.cwd(), "public", imageUrl);
      if (fs.existsSync(localPath)) {
        imageSource = fs.readFileSync(localPath);
      }
    }

    worker = await createWorker("eng");

    const ret = await worker.recognize(imageSource);
    await worker.terminate();
    worker = null;

    // Clean up recognized text
    const cleanedText = (ret.data.text || "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({
      text: cleanedText,
      confidence: ret.data.confidence,
    });
  } catch (err: any) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (_) {}
    }
    console.error("OCR Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to extract text via OCR" },
      { status: 500 }
    );
  }
}
