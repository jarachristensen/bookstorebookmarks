import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface ImageSearchResult {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  source: string;
  year?: string;
  description?: string;
  width?: number;
  height?: number;
}

export async function GET(req: NextRequest) {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json(
      { error: "Unauthorized curator session." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results: ImageSearchResult[] = [];
  const seenUrls = new Set<string>();

  // 1. Search Wikimedia Commons (Rich public domain & CC cultural heritage)
  try {
    const commonsEndpoint = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=400&format=json`;

    const commonsRes = await fetch(commonsEndpoint, {
      headers: {
        "User-Agent": "BookstoreArchiveBot/1.0 (contact@bookstorebookmarks.internal)",
      },
      next: { revalidate: 3600 },
    });

    if (commonsRes.ok) {
      const data = await commonsRes.json();
      const pages = data.query?.pages;
      if (pages && typeof pages === "object") {
        for (const pageId of Object.keys(pages)) {
          const page = pages[pageId];
          const info = page.imageinfo?.[0];
          if (!info || !info.url) continue;

          // Skip vector SVGs, audio/video
          const mime = info.mime || "";
          if (mime.includes("svg") || mime.includes("audio") || mime.includes("video") || mime.includes("pdf")) {
            continue;
          }

          const rawTitle = (page.title || "").replace(/^File:/i, "").replace(/\.[^/.]+$/, "");
          const cleanTitle = decodeURIComponent(rawTitle).replace(/_/g, " ");

          let year: string | undefined;
          const dateVal =
            info.extmetadata?.DateTimeOriginal?.value ||
            info.extmetadata?.DateTime?.value;
          if (dateVal && typeof dateVal === "string") {
            const yrMatch = dateVal.match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
            if (yrMatch) year = yrMatch[0];
          }

          const fullUrl = info.url;
          const thumbUrl = info.thumburl || fullUrl;

          if (!seenUrls.has(fullUrl)) {
            seenUrls.add(fullUrl);
            results.push({
              id: `commons-${pageId}`,
              title: cleanTitle || query,
              url: fullUrl,
              thumbnailUrl: thumbUrl,
              source: "Wikimedia Commons",
              year,
              description: info.extmetadata?.ImageDescription?.value?.replace(/<[^>]*>/g, "") || undefined,
              width: info.width,
              height: info.height,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Wikimedia Commons search error:", err);
  }

  // 2. Search Openverse (Flickr, Europeana, libraries, archives)
  try {
    const openverseEndpoint = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
      query
    )}&page_size=24`;

    const ovRes = await fetch(openverseEndpoint, {
      headers: {
        "User-Agent": "BookstoreArchiveBot/1.0 (contact@bookstorebookmarks.internal)",
      },
      next: { revalidate: 3600 },
    });

    if (ovRes.ok) {
      const ovData = await ovRes.json();
      if (Array.isArray(ovData.results)) {
        for (const item of ovData.results) {
          if (!item.url || seenUrls.has(item.url)) continue;
          seenUrls.add(item.url);

          let year: string | undefined;
          if (item.indexed_on) {
            const yrMatch = String(item.indexed_on).match(/\b(18\d{2}|19\d{2}|20\d{2})\b/);
            if (yrMatch) year = yrMatch[0];
          }

          results.push({
            id: `ov-${item.id}`,
            title: item.title || query,
            url: item.url,
            thumbnailUrl: item.thumbnail || item.url,
            source: item.source ? `Openverse (${item.source})` : "Openverse",
            year,
            description: item.creator ? `By ${item.creator}` : undefined,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Openverse search error:", err);
  }

  // 3. Wikipedia Page Images Fallback
  try {
    const wikiEndpoint = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&prop=pageimages&pithumbsize=1000&format=json`;

    const wikiRes = await fetch(wikiEndpoint, {
      headers: {
        "User-Agent": "BookstoreArchiveBot/1.0 (contact@bookstorebookmarks.internal)",
      },
      next: { revalidate: 3600 },
    });

    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const pages = wikiData.query?.pages;
      if (pages && typeof pages === "object") {
        for (const pageId of Object.keys(pages)) {
          const page = pages[pageId];
          const thumb = page.thumbnail?.source;
          if (thumb && !seenUrls.has(thumb)) {
            seenUrls.add(thumb);
            results.push({
              id: `wiki-${pageId}`,
              title: page.title || query,
              url: thumb,
              thumbnailUrl: thumb,
              source: "Wikipedia",
              width: page.thumbnail?.width,
              height: page.thumbnail?.height,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Wikipedia search error:", err);
  }

  return NextResponse.json({ results });
}
