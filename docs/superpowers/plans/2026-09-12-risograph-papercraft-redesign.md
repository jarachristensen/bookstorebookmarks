# Risograph & Papercraft Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire website with a vibrant Risograph & Papercraft aesthetic, replacing the hardwood specimen cabinet with a Split 2-Column Hero and a dense minimalist bookmark spread grid on a textured paper canvas.

**Architecture:** Extend Tailwind design tokens with risograph colors and paper elevation classes; build a Split 2-Column Hero (`RisographHero.tsx`) with duotone typography, live search, and the illustrated fanned hand; build a dense responsive papercraft bookmark grid (`BookmarkPaperSpread.tsx`) with authentic alpha shadows, hover tooltips, and 3D specimen inspection; restyle header, footer, dossier, and inspector with the papercraft theme.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Vitest, Testing Library.

**Spec:** [`docs/superpowers/specs/2026-09-12-risograph-papercraft-redesign-design.md`](file:///Users/jarachristensen/Documents/bookstore-bookmarks/docs/superpowers/specs/2026-09-12-risograph-papercraft-redesign-design.md)

## Global Constraints
- Keep all work strictly on local branch `feat/homepage-display-concepts` (do NOT push to `origin/main` until user approves).
- Background: Warm cream paper canvas (`#FAF8F5`).
- Primary colors: Riso Magenta (`#F43F7A`), Cobalt Blue (`#2563EB`), Sun Yellow (`#F59E0B`), Leaf Green (`#10B981`), Deep Print Ink (`#18181B`).
- All existing features (search, filtering, 3D bookmark flip inspection, bookstore dossier navigation, admin portal) must remain 100% functional.
- Zero broken tests: All test suites must pass on every task.

---

### Task 1: Design Tokens, Risograph Theme Colors & Global Paper Grain Background

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Test: `tests/theme-tokens.test.ts`

**Interfaces:**
- Produces: Tailwind color classes `bg-riso-paper`, `bg-riso-paper-warm`, `text-riso-pink`, `text-riso-blue`, `text-riso-yellow`, `text-riso-green`, `text-riso-ink`, `text-riso-ink-muted`, and shadow classes `shadow-paper-soft`, `shadow-paper-lift`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/theme-tokens.test.ts
import { describe, it, expect } from "vitest";
import tailwindConfig from "../tailwind.config";

describe("Risograph Theme Tokens", () => {
  it("defines riso color palette tokens", () => {
    const colors = tailwindConfig.theme?.extend?.colors as any;
    expect(colors?.riso?.paper).toBe("#FAF8F5");
    expect(colors?.riso?.pink).toBe("#F43F7A");
    expect(colors?.riso?.blue).toBe("#2563EB");
    expect(colors?.riso?.yellow).toBe("#F59E0B");
    expect(colors?.riso?.green).toBe("#10B981");
    expect(colors?.riso?.ink).toBe("#18181B");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/theme-tokens.test.ts`  
Expected: FAIL (missing `riso` color tokens)

- [ ] **Step 3: Update `tailwind.config.ts` and `app/globals.css`**

Add `riso` color tokens, paper shadows, and global CSS paper texture classes in `tailwind.config.ts` and `app/globals.css`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/theme-tokens.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css tests/theme-tokens.test.ts
git commit -m "feat(theme): add risograph color palette and paper grain tokens"
```

---

### Task 2: Risograph Split 2-Column Hero Component

**Files:**
- Create: `components/home/RisographHero.tsx`
- Test: `tests/risograph-hero.test.tsx`

**Interfaces:**
- Consumes: Filter options, bookmark counts, search query, callbacks (`onSearchChange`, `onCountryChange`, `onCityChange`, `onEraChange`, `onStatusChange`, `onShuffle`).
- Produces: `<RisographHero />` component with duotone typography, stats badges, search/filter controls, and illustrated hand artwork.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/risograph-hero.test.tsx
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RisographHero } from "@/components/home/RisographHero";

describe("RisographHero Component", () => {
  it("renders duotone title, tagline, stats badges, search input, and filter pills", () => {
    const handleSearch = vi.fn();
    const handleShuffle = vi.fn();

    render(
      <RisographHero
        totalBookstores={42}
        totalBookmarks={150}
        search=""
        onSearchChange={handleSearch}
        country="all"
        onCountryChange={vi.fn()}
        countries={["United States", "France"]}
        city="all"
        onCityChange={vi.fn()}
        cities={["New York", "Paris"]}
        era="all"
        onEraChange={vi.fn()}
        eras={[{ label: "All Eras", value: "all" }]}
        status="all"
        onStatusChange={vi.fn()}
        onShuffle={handleShuffle}
      />
    );

    expect(screen.getByText(/The/i)).toBeDefined();
    expect(screen.getByText(/Bookstore/i)).toBeDefined();
    expect(screen.getByText(/Bookmark/i)).toBeDefined();
    expect(screen.getByText(/Archive/i)).toBeDefined();
    expect(screen.getByText(/They saved our place, now there is a place to save them/i)).toBeDefined();
    expect(screen.getByText(/42/i)).toBeDefined();
    expect(screen.getByText(/150/i)).toBeDefined();

    const searchInput = screen.getByPlaceholderText(/search archive/i);
    fireEvent.change(searchInput, { target: { value: "gotham" } });
    expect(handleSearch).toHaveBeenCalledWith("gotham");

    const shuffleBtn = screen.getByRole("button", { name: /shuffle/i });
    fireEvent.click(shuffleBtn);
    expect(handleShuffle).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/risograph-hero.test.tsx`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/home/RisographHero.tsx`**

Build the Split 2-Column Hero layout with duotone typography, tagline, stats badges, search input, filter pills, shuffle button, and the hand artwork (`/images/risograph-hero.png`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/risograph-hero.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/RisographHero.tsx tests/risograph-hero.test.tsx
git commit -m "feat(hero): create RisographHero component with split 2-column layout"
```

---

### Task 3: Minimalist Bookmark Paper Spread Grid Component

**Files:**
- Create: `components/home/BookmarkPaperSpread.tsx`
- Test: `tests/bookmark-paper-spread.test.tsx`

**Interfaces:**
- Consumes: `bookmarks: BookmarkWithDetails[]`, `onInspectBookmark: (bm) => void`, `onResetFilters?: () => void`.
- Produces: `<BookmarkPaperSpread />` responsive dense grid of bookmarks with hover tooltips and click-to-inspect.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/bookmark-paper-spread.test.tsx
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkPaperSpread } from "@/components/home/BookmarkPaperSpread";
import { BookmarkWithDetails } from "@/lib/db/queries";

describe("BookmarkPaperSpread Component", () => {
  const mockBookmarks: BookmarkWithDetails[] = [
    {
      id: "bm-1",
      bookstoreId: "store-1",
      title: "Gotham Bookmark",
      accessionNo: "BM-001",
      frontImageUrl: "/test.jpg",
      backImageUrl: null,
      yearProduced: 1982,
      material: "Paper",
      dimensions: '2" × 7"',
      condition: "Good",
      acquisitionDate: null,
      acquisitionNotes: null,
      isFeatured: false,
      displayOrder: 1,
      accentColor: null,
      createdAt: "",
      updatedAt: "",
      bookstore: {
        id: "store-1",
        name: "Gotham Book Mart",
        city: "New York",
        stateProvince: "NY",
        country: "United States",
        streetAddress: "41 W 47th St",
        yearOpened: 1920,
        yearClosed: 2007,
        isStillOperating: false,
        founders: "Frances Steloff",
        specialties: "[]",
        historicalBlurb: "",
        notablePatronsTrivia: "[]",
        websiteUrl: null,
        createdAt: "",
        updatedAt: "",
        archivalMedia: [],
      },
    },
  ];

  it("renders bookmarks floating on paper canvas and triggers inspect on click", () => {
    const handleInspect = vi.fn();

    render(
      <BookmarkPaperSpread
        bookmarks={mockBookmarks}
        onInspectBookmark={handleInspect}
      />
    );

    const bookmarkBtn = screen.getByRole("button", { name: /gotham bookmark/i });
    expect(bookmarkBtn).toBeDefined();

    fireEvent.click(bookmarkBtn);
    expect(handleInspect).toHaveBeenCalledWith(mockBookmarks[0]);
  });

  it("renders empty state when bookmarks list is empty", () => {
    const handleReset = vi.fn();

    render(
      <BookmarkPaperSpread
        bookmarks={[]}
        onInspectBookmark={vi.fn()}
        onResetFilters={handleReset}
      />
    );

    expect(screen.getByText(/no bookmarks found/i)).toBeDefined();
    const resetBtn = screen.getByRole("button", { name: /reset all filters/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/bookmark-paper-spread.test.tsx`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `components/home/BookmarkPaperSpread.tsx`**

Build responsive multi-column grid (`grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8`) with floating paper shadows, hover tooltips, and empty state.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/bookmark-paper-spread.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/home/BookmarkPaperSpread.tsx tests/bookmark-paper-spread.test.tsx
git commit -m "feat(spread): create BookmarkPaperSpread minimalist ephemera grid component"
```

---

### Task 4: Restyle Header & Footer with Risograph Papercraft Aesthetic

**Files:**
- Modify: `components/ui/Header.tsx`
- Modify: `app/page.tsx` (footer & global shell)
- Test: `tests/ui-components.test.tsx`

**Interfaces:**
- Produces: Restyled `<Header />` with duotone text logo, risograph active nav pills, Instagram badge, and Curator portal.

- [ ] **Step 1: Update `components/ui/Header.tsx`**

Style header with clean paper borders, duotone logo text, and risograph accent colors.

- [ ] **Step 2: Update footer in `app/page.tsx` and shared layouts**

Apply risograph styling to footer, mission statement, and social links.

- [ ] **Step 3: Run existing UI tests to verify**

Run: `npx vitest run tests/ui-components.test.tsx`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/ui/Header.tsx app/page.tsx tests/ui-components.test.tsx
git commit -m "feat(ui): style Header and Footer with risograph papercraft aesthetic"
```

---

### Task 5: Integrate Homepage with New Hero & Paper Spread

**Files:**
- Modify: `components/exhibit/ExhibitGalleryClient.tsx`
- Modify: `app/page.tsx`
- Modify: `components/exhibit/BookmarkInspector.tsx`
- Modify: `components/exhibit/BookstoreDossier.tsx`
- Test: `tests/e2e-flow.test.tsx`

**Interfaces:**
- Connects `RisographHero` search/filters to `BookmarkPaperSpread` with `filteredBookmarks` and 3D inspection modal.

- [ ] **Step 1: Update `components/exhibit/ExhibitGalleryClient.tsx`**

Replace `FlatFileCabinet` with `RisographHero` and `BookmarkPaperSpread`. Maintain all search, filter, shuffle, inspection modal, and dossier drawer states.

- [ ] **Step 2: Update `tests/e2e-flow.test.tsx`**

Verify the full user journey: Hero renders -> search/filters narrow spread -> click bookmark opens 3D inspector -> inspect flip -> navigate to bookstore page.

- [ ] **Step 3: Run e2e flow test**

Run: `npx vitest run tests/e2e-flow.test.tsx`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/exhibit/ExhibitGalleryClient.tsx components/exhibit/BookmarkInspector.tsx components/exhibit/BookstoreDossier.tsx tests/e2e-flow.test.tsx
git commit -m "feat(exhibit): integrate RisographHero and BookmarkPaperSpread into main gallery"
```

---

### Task 6: Full Verification & Build Validation

**Files:**
- All tests & build artifacts

- [ ] **Step 1: Run complete test suite**

Run: `npm test`  
Expected: All test suites pass (0 failures).

- [ ] **Step 2: Run production build**

Run: `npm run build`  
Expected: Clean build with 0 TypeScript/ESLint errors.

- [ ] **Step 3: Final Commit & Summary**

```bash
git commit --allow-empty -m "chore: verify risograph papercraft redesign passes all tests and builds cleanly"
```
