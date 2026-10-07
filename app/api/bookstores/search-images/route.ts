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

  // 0. Optional: Google Custom Search API (if configured in environment)
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCseId =
    process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCseId) {
    try {
      const googleEndpoint = `https://customsearch.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCseId}&q=${encodeURIComponent(
        query
      )}&searchType=image&num=10`;

      const gRes = await fetch(googleEndpoint, {
        next: { revalidate: 3600 },
      });

      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData.items)) {
          for (let i = 0; i < gData.items.length; i++) {
            const item = gData.items[i];
            const fullUrl = item.link;
            if (!fullUrl || seenUrls.has(fullUrl)) continue;
            seenUrls.add(fullUrl);

            results.push({
              id: `google-${i}-${Date.now()}`,
              title: item.title || query,
              url: fullUrl,
              thumbnailUrl: item.image?.thumbnailLink || fullUrl,
              source: `Google (${item.displayLink || "Web"})`,
              description: item.snippet || undefined,
              width: item.image?.width,
              height: item.image?.height,
            });
          }
        }
      }
    } catch (gErr) {
      console.warn("Google Image Search API error:", gErr);
    }
  }

  // 0b. Optional: Google Places API (Fetches user-uploaded Google Maps storefront/interior photos)
  const placesApiKey =
    process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (placesApiKey) {
    try {
      const placesEndpoint = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${placesApiKey}`;

      const pRes = await fetch(placesEndpoint, {
        next: { revalidate: 3600 },
      });

      if (pRes.ok) {
        const pData = await pRes.json();
        const topPlace = pData.results?.[0];
        if (topPlace && Array.isArray(topPlace.photos)) {
          for (let i = 0; i < topPlace.photos.length; i++) {
            const photo = topPlace.photos[i];
            const photoRef = photo.photo_reference;
            if (!photoRef) continue;

            const fullUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photoRef}&key=${placesApiKey}`;
            const thumbUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${placesApiKey}`;

            if (!seenUrls.has(fullUrl)) {
              seenUrls.add(fullUrl);
              const author = photo.html_attributions?.[0]
                ? photo.html_attributions[0].replace(/<[^>]*>/g, "")
                : "Google Maps User";

              results.push({
                id: `maps-${i}-${Date.now()}`,
                title: `${topPlace.name || query} (${topPlace.formatted_address || "Google Maps"})`,
                url: fullUrl,
                thumbnailUrl: thumbUrl,
                source: "Google Maps",
                description: `Photo by ${author}`,
                width: photo.width,
                height: photo.height,
              });
            }
          }
        }
      }
    } catch (pErr) {
      console.warn("Google Places Photo API error:", pErr);
    }
  }

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
