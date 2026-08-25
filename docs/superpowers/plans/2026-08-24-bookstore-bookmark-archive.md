# Bookstore Bookmark Archive & Research Dossier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Next.js application featuring an aesthetic, non-endless scroll specimen tray for exploring bookstore bookmarks with 3D flip inspection, a detailed bookstore research dossier with historical clippings and zoomable newspaper transcriptions, and a password-protected admin CMS for catalog curation.

**Architecture:** Next.js (App Router) + TypeScript + Tailwind CSS with custom archival typography and palette. SQLite database managed via Drizzle ORM. Dynamic UI with Framer Motion for tactile specimen tray pagination, realistic bookmark lifts, 3D paper flips, and clipping lightbox. Secure HTTP-only session auth for `/admin`.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Better-SQLite3, Drizzle ORM, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-24-bookstore-bookmark-archive-design.md`

## Global Constraints
- Node.js 18+ runtime
- TypeScript strict mode
- Full responsive support (desktop, tablet, mobile)
- Zero external database credentials required for local execution (uses local SQLite file `data/archive.db`)
- Archival aesthetic: warm parchment backgrounds, editorial serif typography, monospaced catalog accession numbers

---

### Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `next.config.js`
- Create: `.env.example`
- Create: `.env`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: Project foundation with Next.js App Router, Tailwind CSS, TypeScript, and Vitest test runner.

- [ ] **Step 1: Create package.json with dependencies**
- [ ] **Step 2: Create TypeScript, Tailwind, PostCSS, and Next.js configuration files**
- [ ] **Step 3: Create .env and .env.example with default admin credentials**
- [ ] **Step 4: Create Vitest config and verify unit test setup**
- [ ] **Step 5: Run tests and verify build configuration**

---

### Task 2: Database Schema & Drizzle ORM Setup

**Files:**
- Create: `db/schema.ts`
- Create: `db/index.ts`
- Create: `drizzle.config.ts`
- Test: `tests/db-schema.test.ts`

**Interfaces:**
- Produces: `bookstores`, `bookmarks`, and `archivalMedia` tables in Drizzle ORM; `db` client instance.

- [ ] **Step 1: Write unit tests for schema structure and foreign key relations**
- [ ] **Step 2: Run test to verify it fails (db schema not implemented)**
- [ ] **Step 3: Implement `db/schema.ts` with all fields from spec**
- [ ] **Step 4: Implement `db/index.ts` SQLite connection and initialization**
- [ ] **Step 5: Run test to verify database initializes and passes schema tests**

---

### Task 3: Seed Script & Curated Historical Collection

**Files:**
- Create: `db/seed.ts`
- Create: `public/seed-images/` (placeholder SVGs and curated historical imagery for Gotham, Shakespeare & Co, City Lights, Kroch's & Brentano's)
- Test: `tests/seed.test.ts`

**Interfaces:**
- Produces: `seedDatabase()` function that populates the database with initial museum-quality records.

- [ ] **Step 1: Write test for seed script execution and record verification**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `db/seed.ts` with complete research essays, citations, and clipping metadata for the 4 historic bookstores**
- [ ] **Step 4: Run seed test and verify all bookmarks, bookstores, and clippings are correctly inserted**

---

### Task 4: Data Access Layer & Server Queries

**Files:**
- Create: `lib/db/queries.ts`
- Test: `tests/queries.test.ts`

**Interfaces:**
- Produces:
  - `getBookmarksWithBookstores(filters?: FilterOptions): Promise<BookmarkWithDetails[]>`
  - `getBookmarkBySlug(slug: string): Promise<BookmarkWithDetails | null>`
  - `getAllBookstores(): Promise<Bookstore[]>`
  - `getArchivalMediaForBookstore(bookstoreId: string): Promise<ArchivalMedia[]>`
  - `getFilterOptions(): Promise<{ cities: string[]; eras: string[]; specialties: string[] }>`

- [ ] **Step 1: Write unit tests for queries (filtering by city, era, search term, pagination)**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement queries in `lib/db/queries.ts`**
- [ ] **Step 4: Run tests to verify query filtering and data shaping pass**

---

### Task 5: Archival Design System, Layout & Typography

**Files:**
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `components/ui/Header.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/Button.tsx`
- Test: `tests/ui-components.test.tsx`

**Interfaces:**
- Produces: Global layout with serif fonts, parchment styling, top navigation bar with search/filters, and reusable archival UI primitives.

- [ ] **Step 1: Write component tests for Badge, Button, and Header**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `globals.css` with archival palette and linen textures**
- [ ] **Step 4: Implement `app/layout.tsx`, `Header.tsx`, `Badge.tsx`, `Button.tsx`**
- [ ] **Step 5: Run tests and verify visual components render properly**

---

### Task 6: Interactive Specimen Tray & Bookmark Card Component

**Files:**
- Create: `components/exhibit/BookmarkCard.tsx`
- Create: `components/exhibit/SpecimenTray.tsx`
- Create: `components/exhibit/TrayControls.tsx`
- Test: `tests/specimen-tray.test.tsx`

**Interfaces:**
- Produces: Specimen Tray rendering 6–8 bookmarks with natural tilt, tactile drop shadow, smooth previous/next tray animations, and keyboard navigation.

- [ ] **Step 1: Write tests for tray pagination slicing and navigation state**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `BookmarkCard.tsx` with physical styling, subtle angle variation, and hover lift**
- [ ] **Step 4: Implement `SpecimenTray.tsx` and `TrayControls.tsx` with Framer Motion transitions**
- [ ] **Step 5: Run tests to verify pagination and selection events**

---

### Task 7: 3D Flip Bookmark Inspector & Lift Canvas

**Files:**
- Create: `components/exhibit/BookmarkInspector.tsx`
- Test: `tests/bookmark-inspector.test.tsx`

**Interfaces:**
- Produces: Modal / Overlay Canvas displaying the lifted bookmark with an interactive 3D rotation flip (front/back), dimensions, and condition badge.

- [ ] **Step 1: Write unit tests for flip state and front/back toggle**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `BookmarkInspector.tsx` with 3D paper transform and texture shadows**
- [ ] **Step 4: Run test to verify flip transitions and close handlers**

---

### Task 8: Bookstore Research Dossier Sheet

**Files:**
- Create: `components/exhibit/BookstoreDossier.tsx`
- Create: `components/exhibit/MarkdownRenderer.tsx`
- Test: `tests/bookstore-dossier.test.tsx`

**Interfaces:**
- Produces: Slide-over or side-by-side research panel displaying bookstore identity, years active, founders, specialties tags, narrative research essay, and trivia anecdotes.

- [ ] **Step 1: Write test for dossier metadata display and markdown rendering**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `MarkdownRenderer.tsx` and `BookstoreDossier.tsx`**
- [ ] **Step 4: Run test to verify full dossier renders with correct data**

---

### Task 9: Archival Media & Newspaper Clipping Lightbox

**Files:**
- Create: `components/exhibit/ClippingLightbox.tsx`
- Test: `tests/clipping-lightbox.test.tsx`

**Interfaces:**
- Produces: Archival media gallery inside the dossier with click-to-zoom lightbox, publication citation metadata, and readable transcription toggle.

- [ ] **Step 1: Write tests for lightbox opening, zoom toggle, and transcription panel**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `ClippingLightbox.tsx`**
- [ ] **Step 4: Run tests to verify lightbox interactions**

---

### Task 10: Admin Authentication & Session Security

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/admin/login/page.tsx`
- Test: `tests/auth.test.ts`

**Interfaces:**
- Produces: Session token cookie issuance, admin passphrase verification, and protected route middleware / checks.

- [ ] **Step 1: Write tests for password verification and session cookie signing**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `lib/auth.ts` and auth API endpoints**
- [ ] **Step 4: Implement `app/admin/login/page.tsx` with elegant login card**
- [ ] **Step 5: Run tests and verify unauthorized access is blocked**

---

### Task 11: Admin Curation Dashboard & CRUD Actions

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/api/bookmarks/route.ts`
- Create: `app/api/bookmarks/[id]/route.ts`
- Create: `lib/db/mutations.ts`
- Test: `tests/admin-mutations.test.ts`

**Interfaces:**
- Produces: Admin overview table of all bookmarks/bookstores, delete action, toggle featured, and direct links to editor.

- [ ] **Step 1: Write tests for create, update, and delete mutations**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `lib/db/mutations.ts` and API handlers**
- [ ] **Step 4: Implement `app/admin/page.tsx` dashboard interface**
- [ ] **Step 5: Run tests to verify mutations and admin listing**

---

### Task 12: Admin Bookmark & Bookstore Form Editor with Media Upload

**Files:**
- Create: `components/admin/BookmarkForm.tsx`
- Create: `components/admin/ImageDropzone.tsx`
- Create: `components/admin/MediaManager.tsx`
- Create: `app/admin/new/page.tsx`
- Create: `app/admin/edit/[id]/page.tsx`
- Create: `app/api/upload/route.ts`
- Test: `tests/admin-form.test.tsx`

**Interfaces:**
- Produces: Full curation editor for uploading bookmark scans, entering bookstore metadata, writing markdown blurbs, and managing historical clippings.

- [ ] **Step 1: Write tests for form validation and media upload payload**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `app/api/upload/route.ts` local file saver**
- [ ] **Step 4: Implement `ImageDropzone.tsx`, `MediaManager.tsx`, and `BookmarkForm.tsx`**
- [ ] **Step 5: Implement `app/admin/new/page.tsx` and `app/admin/edit/[id]/page.tsx`**
- [ ] **Step 6: Run tests and verify new entries save and update correctly**

---

### Task 13: Database Backup & JSON Export

**Files:**
- Create: `app/api/export/route.ts`
- Test: `tests/export.test.ts`

**Interfaces:**
- Produces: `GET /api/export` endpoint that returns a structured, timestamped JSON archive of all bookmarks, bookstores, and media.

- [ ] **Step 1: Write test for JSON export endpoint structure**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `app/api/export/route.ts`**
- [ ] **Step 4: Run test to verify export contains all database entities**

---

### Task 14: Main Exhibition Page Assembly & Full End-to-End Verification

**Files:**
- Create: `app/page.tsx`
- Create: `app/bookmarks/[slug]/page.tsx`
- Test: `tests/e2e-flow.test.tsx`

**Interfaces:**
- Produces: Integrated main page (`/`) linking the Curator's Specimen Tray, Search/Filters, 3D Flip Inspector, and Bookstore Dossier; dedicated shareable slug URLs (`/bookmarks/[slug]`).

- [ ] **Step 1: Write integration test for the full user flow (search, filter, open bookmark, flip, read dossier)**
- [ ] **Step 2: Implement `app/page.tsx` and `app/bookmarks/[slug]/page.tsx`**
- [ ] **Step 3: Run full test suite (`npm test`) to verify 100% pass rate**
- [ ] **Step 4: Test development server build (`npm run build`)**
