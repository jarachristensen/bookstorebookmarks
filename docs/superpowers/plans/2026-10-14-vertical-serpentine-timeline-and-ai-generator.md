# Vertical Serpentine Timeline & AI Article Event Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the bookstore timeline into an antique 19th-century broadside-inspired vertical serpentine (winding) timeline with alternating illustrations and clean year badges, accompanied by an AI newspaper article scanner that automatically synthesizes timeline milestones from uploaded clippings.

**Architecture:** 
1. Build `lib/ai/timeline-generator.ts` and `app/api/timeline/generate-entry/route.ts` to analyze OCR text and extract curated event titles, years, and summaries.
2. Integrate the `Auto-add to Timeline` upload hook in `BookstoreVisualEditor.tsx` / `MediaManager.tsx`.
3. Construct `BookstoreVerticalTimeline.tsx` rendering an antique decorative header, SVG serpentine track, alternating odd/even steps, expanded media-less cards, clean year pills, and mobile single-column fallback.
4. Replace existing timeline usage in `BookstoreDetailView.tsx` while preserving backward compatibility.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Tesseract.js, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-14-vertical-serpentine-timeline-and-ai-generator-design.md`

## Global Constraints
- Branch: Stay strictly on local branch `feat/next-release`.
- Do NOT push to remote origin until user gives explicit instruction.
- Riso color palette tokens: `#FAF8F5` (paper), `#FDFBF7` (warm paper), `#E8E2D5` (paper border), `#18181B` (ink), `#F43F7A` (pink), `#2563EB` (blue).
- High image resolution: Preserve 100% image quality without downscaling or lossy compression.
- 100% test pass rate across all suites.

---

### Task 1: AI Timeline Entry Generator (`POST /api/timeline/generate-entry`)

**Files:**
- Create: `lib/ai/timeline-generator.ts`
- Create: `app/api/timeline/generate-entry/route.ts`
- Test: `tests/ai-timeline-generator.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface GeneratedTimelineEntry {
    year: number;
    label: string; // e.g. "HOWL OBSCENITY TRIAL ACQUITTAL"
    description: string; // 1-2 sentence summary
  }
  export async function generateTimelineEntryFromArticle(input: {
    ocrText?: string;
    fileName?: string;
    bookstoreName?: string;
    publicationDate?: string;
  }): Promise<GeneratedTimelineEntry>;
  ```

- [ ] **Step 1: Write the failing test**

```ts
// tests/ai-timeline-generator.test.ts
import { describe, it, expect } from "vitest";
import { generateTimelineEntryFromArticle } from "@/lib/ai/timeline-generator";

describe("generateTimelineEntryFromArticle", () => {
  it("extracts historical event title, year, and description from article OCR text", async () => {
    const ocrText = `
      SAN FRANCISCO CHRONICLE — October 4, 1957
      JUDGE RULES 'HOWL' NOT OBSCENE
      Municipal Judge Clayton Horn ruled yesterday that the poem 'Howl' by Allen Ginsberg
      has redeeming social importance and dismissed obscenity charges against publisher Lawrence Ferlinghetti.
    `;

    const result = await generateTimelineEntryFromArticle({
      ocrText,
      fileName: "San_Francisco_Chronicle_1957_10_04.jpg",
      bookstoreName: "City Lights Booksellers",
    });

    expect(result.year).toBe(1957);
    expect(result.label).toBeDefined();
    expect(result.label.length).toBeGreaterThan(3);
    expect(result.description).toBeDefined();
    expect(result.description.length).toBeGreaterThan(15);
  });

  it("falls back gracefully when OCR text is sparse using filename metadata", async () => {
    const result = await generateTimelineEntryFromArticle({
      ocrText: "",
      fileName: "New_York_Times_1920_Gotham_Mart_Opens.jpg",
      bookstoreName: "Gotham Book Mart",
    });

    expect(result.year).toBe(1920);
    expect(result.label).toMatch(/Gotham|Opens|Press/i);
    expect(result.description).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/ai-timeline-generator.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `lib/ai/timeline-generator.ts` and `app/api/timeline/generate-entry/route.ts`**
Implement synthesis with Gemini / OpenAI API call if keys exist in environment, and an intelligent heuristic lead-extractor fallback when keys are absent.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/ai-timeline-generator.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add lib/ai/timeline-generator.ts app/api/timeline/generate-entry/route.ts tests/ai-timeline-generator.test.ts
git commit -m "feat(timeline): add AI timeline event generator from article OCR and metadata"
```

---

### Task 2: Bookstore Media Upload Auto-Timeline Integration

**Files:**
- Modify: `components/admin/BookstoreVisualEditor.tsx`
- Modify: `components/admin/MediaManager.tsx`
- Test: `tests/timeline-auto-add.test.tsx`

**Interfaces:**
- Consumes: `generateTimelineEntryFromArticle` from Task 1
- Produces: Updated timeline events state with attached media when upload completes with `autoAddToTimeline` enabled.

- [ ] **Step 1: Write the failing test**

```tsx
// tests/timeline-auto-add.test.tsx
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MediaManager } from "@/components/admin/MediaManager";

describe("MediaManager Auto-Add to Timeline Toggle", () => {
  it("renders auto-add to timeline checkbox for newspaper clippings", () => {
    render(
      <MediaManager
        mediaList={[]}
        onChange={vi.fn()}
        onAutoAddToTimeline={vi.fn()}
      />
    );

    expect(screen.getByText(/Auto-add to Timeline/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/timeline-auto-add.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement Auto-Add to Timeline toggle and upload wiring**
In `MediaManager.tsx` and `BookstoreVisualEditor.tsx`:
- Add `[✓] Auto-add to Timeline` checkbox.
- When an article is uploaded, if checked, invoke OCR and `POST /api/timeline/generate-entry`, then append to `customEvents` with the media item linked.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/timeline-auto-add.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add components/admin/MediaManager.tsx components/admin/BookstoreVisualEditor.tsx tests/timeline-auto-add.test.tsx
git commit -m "feat(admin): add auto-add to timeline toggle and clipping analyzer hook"
```

---

### Task 3: Winding Serpentine Vertical Timeline Component

**Files:**
- Create: `components/bookstores/BookstoreVerticalTimeline.tsx`
- Modify: `components/bookstores/BookstoreHorizontalTimeline.tsx` (re-export and bridge)
- Test: `tests/bookstore-vertical-timeline.test.tsx`

**Interfaces:**
- Produces:
  ```tsx
  export interface BookstoreVerticalTimelineProps {
    bookstore: BookstoreWithDetails;
    onSelectMedia?: (media: ArchivalMedia) => void;
    customEvents?: CustomTimelineEvent[];
    isEditable?: boolean;
    onEditEvent?: (event: TimelineEvent) => void;
    onDeleteEvent?: (eventId: string) => void;
  }
  export function BookstoreVerticalTimeline(props: BookstoreVerticalTimelineProps): JSX.Element;
  ```

- [ ] **Step 1: Write the failing test**

```tsx
// tests/bookstore-vertical-timeline.test.tsx
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookstoreVerticalTimeline } from "@/components/bookstores/BookstoreVerticalTimeline";

describe("BookstoreVerticalTimeline Component", () => {
  const mockBookstore: any = {
    id: "bs-1",
    name: "City Lights Booksellers",
    city: "San Francisco",
    yearOpened: 1953,
    isStillOperating: true,
    locations: null,
    archivalMedia: [
      {
        id: "media-1",
        imageUrl: "/uploads/storefront-1953.jpg",
        caption: "City Lights Storefront",
        publicationDate: "1953",
        isStorefront: true,
      },
    ],
    timelineEvents: JSON.stringify([
      {
        id: "ev-1",
        year: 1953,
        label: "Grand Opening on Columbus Ave",
        description: "Founded by Lawrence Ferlinghetti and Peter D. Martin.",
        type: "opening",
        mediaId: "media-1",
      },
      {
        id: "ev-2",
        year: 1957,
        label: "Howl Obscenity Trial Victory",
        description: "Municipal court acquits publisher of obscenity charges.",
        type: "press",
      },
    ]),
  };

  it("renders antique TIMELINE header and clean year badges without the word Year", () => {
    render(<BookstoreVerticalTimeline bookstore={mockBookstore} />);

    expect(screen.getByText("TIMELINE")).toBeDefined();
    expect(screen.getByText("1953")).toBeDefined();
    expect(screen.getByText("1957")).toBeDefined();
    expect(screen.queryByText("Year 1953")).toBeNull();
  });

  it("expands text across the step when an event has no media", () => {
    render(<BookstoreVerticalTimeline bookstore={mockBookstore} />);

    expect(screen.getByText("Howl Obscenity Trial Victory")).toBeDefined();
    expect(screen.getByText(/Municipal court acquits/i)).toBeDefined();
  });

  it("triggers media selection when thumbnail is clicked", () => {
    const onSelectMedia = vi.fn();
    render(
      <BookstoreVerticalTimeline
        bookstore={mockBookstore}
        onSelectMedia={onSelectMedia}
      />
    );

    const thumbnail = screen.getByAltText(/City Lights Storefront/i);
    fireEvent.click(thumbnail);
    expect(onSelectMedia).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/bookstore-vertical-timeline.test.tsx`
Expected: FAIL (component not found)

- [ ] **Step 3: Implement `BookstoreVerticalTimeline.tsx`**
- Antique display header "TIMELINE" with vintage rules.
- SVG serpentine curving line connecting nodes for desktop/tablet.
- Alternating left/right rhythm for odd/even events.
- Expanded centered text card for events without media.
- Dark charcoal pill badge with clean year numbers (`1953`).
- Single-column left-aligned responsive layout on mobile (< 768px).
- Clickable thumbnails with hover magnifying glass opening lightbox.
- Re-export in `BookstoreHorizontalTimeline.tsx` for seamless compatibility.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/bookstore-vertical-timeline.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add components/bookstores/BookstoreVerticalTimeline.tsx components/bookstores/BookstoreHorizontalTimeline.tsx tests/bookstore-vertical-timeline.test.tsx
git commit -m "feat(timeline): implement vertical serpentine timeline with alternating media and clean year badges"
```

---

### Task 4: Integration in Bookstore Detail View & Visual Editor

**Files:**
- Modify: `components/bookstores/BookstoreDetailView.tsx`
- Modify: `components/admin/BookstoreVisualEditor.tsx`
- Test: `tests/bookstore-timeline-thumbnails.test.tsx`

- [ ] **Step 1: Verify existing timeline tests**
Run: `npx vitest run tests/bookstore-timeline-thumbnails.test.tsx`
Expected: PASS

- [ ] **Step 2: Wire `BookstoreVerticalTimeline` in `BookstoreDetailView.tsx` and `BookstoreVisualEditor.tsx`**
Update imports and props to render the vertical timeline with full click-to-zoom and editing support.

- [ ] **Step 3: Run timeline tests**
Run: `npx vitest run tests/bookstore-timeline-thumbnails.test.tsx tests/bookstore-vertical-timeline.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add components/bookstores/BookstoreDetailView.tsx components/admin/BookstoreVisualEditor.tsx tests/bookstore-timeline-thumbnails.test.tsx
git commit -m "feat(bookstores): integrate vertical serpentine timeline in detail view and editor"
```

---

### Task 5: End-to-End Build & Full Test Suite Verification

**Files:**
- Verification only

- [ ] **Step 1: Run full test suite**
Run: `npm test`
Expected: 52+ test files pass, 100% green.

- [ ] **Step 2: Run production Next.js build**
Run: `npm run build`
Expected: Clean build with 0 TypeScript/lint errors.

- [ ] **Step 3: Commit any adjustments if needed**
```bash
git commit -m "chore(release): verify vertical timeline and AI generator pass all tests and production build"
```
