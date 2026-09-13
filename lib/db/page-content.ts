import { db, initDb } from "@/db";
import { pageContent } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Retrieve all custom content sections for a specific page slug.
 * Returns a key-value record mapping section_key -> content_markdown.
 */
export async function getPageContent(pageSlug: string): Promise<Record<string, string>> {
  try {
    await initDb();
    const rows = await db
      .select()
      .from(pageContent)
      .where(eq(pageContent.pageSlug, pageSlug));

    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.sectionKey] = row.contentMarkdown;
    }
    return result;
  } catch (error) {
    console.error(`Error fetching page content for ${pageSlug}:`, error);
    return {};
  }
}

/**
 * Save or update multiple section keys for a specific page slug.
 */
export async function updatePageContent(
  pageSlug: string,
  sections: Record<string, string>
): Promise<void> {
  await initDb();
  const now = new Date().toISOString();

  for (const [sectionKey, contentMarkdown] of Object.entries(sections)) {
    const id = `${pageSlug}_${sectionKey}`;

    // Upsert into page_content table
    const existing = await db
      .select()
      .from(pageContent)
      .where(eq(pageContent.id, id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(pageContent)
        .set({
          contentMarkdown,
          updatedAt: now,
        })
        .where(eq(pageContent.id, id));
    } else {
      await db.insert(pageContent).values({
        id,
        pageSlug,
        sectionKey,
        contentMarkdown,
        updatedAt: now,
      });
    }
  }
}
