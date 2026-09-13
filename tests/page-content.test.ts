import { describe, it, expect, beforeEach } from "vitest";
import { db, initDb } from "@/db";
import { getPageContent, updatePageContent } from "@/lib/db/page-content";

describe("Page Content Persistence", () => {
  beforeEach(async () => {
    await initDb();
  });

  it("returns empty or default content when no custom page content has been saved", async () => {
    const content = await getPageContent("about");
    expect(typeof content).toBe("object");
  });

  it("saves and retrieves custom content for a page slug", async () => {
    const slug = "partners";
    const testSections = {
      hero_subtitle: "Custom test subtitle for partners",
      curator_letter_title: "Thank you to our amazing patrons",
      curator_letter_body: "We appreciate all contributions.",
    };

    await updatePageContent(slug, testSections);

    const retrieved = await getPageContent(slug);
    expect(retrieved.hero_subtitle).toBe("Custom test subtitle for partners");
    expect(retrieved.curator_letter_title).toBe("Thank you to our amazing patrons");
    expect(retrieved.curator_letter_body).toBe("We appreciate all contributions.");
  });

  it("updates existing section keys without overwriting untouched keys", async () => {
    const slug = "contact";
    await updatePageContent(slug, {
      section_a: "Initial A",
      section_b: "Initial B",
    });

    await updatePageContent(slug, {
      section_b: "Updated B",
    });

    const retrieved = await getPageContent(slug);
    expect(retrieved.section_a).toBe("Initial A");
    expect(retrieved.section_b).toBe("Updated B");
  });
});
