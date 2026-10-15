import { describe, it, expect } from "vitest";
import { getSortableName, compareBookstoresAlphabetically } from "@/lib/utils/sorting";

describe("Article-Insensitive Sorting Utilities", () => {
  describe("getSortableName", () => {
    it("strips leading 'The ', 'A ', and 'An ' (case-insensitive)", () => {
      expect(getSortableName("The Owls Nest")).toBe("Owls Nest");
      expect(getSortableName("the owls nest")).toBe("owls nest");
      expect(getSortableName("THE OWLS NEST")).toBe("OWLS NEST");
      expect(getSortableName("A Book Store")).toBe("Book Store");
      expect(getSortableName("a book store")).toBe("book store");
      expect(getSortableName("An Antique Shop")).toBe("Antique Shop");
      expect(getSortableName("an antique shop")).toBe("antique shop");
      expect(getSortableName("  The Owls Nest  ")).toBe("Owls Nest");
    });

    it("does not strip words that simply start with the letters of articles", () => {
      expect(getSortableName("Theatre Books")).toBe("Theatre Books");
      expect(getSortableName("Anchor Books")).toBe("Anchor Books");
      expect(getSortableName("Apollo Books")).toBe("Apollo Books");
      expect(getSortableName("Theme Books")).toBe("Theme Books");
    });

    it("handles empty or falsy strings gracefully", () => {
      expect(getSortableName("")).toBe("");
      expect(getSortableName(undefined as unknown as string)).toBe("");
      expect(getSortableName(null as unknown as string)).toBe("");
    });
  });

  describe("compareBookstoresAlphabetically", () => {
    it("sorts 'The Owls Nest' under O (after 'Oak Books', before 'Oxford Books')", () => {
      const stores = [
        { name: "Oxford Books" },
        { name: "The Owls Nest" },
        { name: "Oak Books" },
      ];

      stores.sort(compareBookstoresAlphabetically);

      expect(stores.map((s) => s.name)).toEqual([
        "Oak Books",
        "The Owls Nest",
        "Oxford Books",
      ]);
    });

    it("sorts 'A Book Store' under B (after 'Automaton Books', before 'Borders')", () => {
      const stores = [
        { name: "Borders" },
        { name: "Automaton Books" },
        { name: "A Book Store" },
      ];

      stores.sort(compareBookstoresAlphabetically);

      expect(stores.map((s) => s.name)).toEqual([
        "Automaton Books",
        "A Book Store",
        "Borders",
      ]);
    });

    it("sorts 'An Antique Shop' under A (based on Antique)", () => {
      const stores = [
        { name: "Apple Books" },
        { name: "An Antique Shop" },
        { name: "Animals & Co" },
      ];

      stores.sort(compareBookstoresAlphabetically);

      expect(stores.map((s) => s.name)).toEqual([
        "Animals & Co",
        "An Antique Shop",
        "Apple Books",
      ]);
    });

    it("breaks ties with the original name using localeCompare", () => {
      const stores = [
        { name: "The Book Store" },
        { name: "A Book Store" },
        { name: "Book Store" },
      ];

      stores.sort(compareBookstoresAlphabetically);

      // "A Book Store" < "Book Store" < "The Book Store" in localeCompare
      expect(stores.map((s) => s.name)).toEqual([
        "A Book Store",
        "Book Store",
        "The Book Store",
      ]);
    });
  });
});
