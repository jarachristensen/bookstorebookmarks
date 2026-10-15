# Implementation Plan: Next Release Enhancements

This implementation plan details the step-by-step tasks to implement the 10 release features specified in [`docs/superpowers/specs/2026-10-15-next-release-features-design.md`](file:///Users/jarachristensen/Documents/bookstore-bookmarks/docs/superpowers/specs/2026-10-15-next-release-features-design.md).

---

## User Review Required

> [!NOTE]
> All specifications and architectural decisions were reviewed and approved by the user in the design phase. No breaking database migrations or destructive schema changes are required.

---

## Proposed Changes

### 1. Cataloging & Creation Workflow (Items 1, 4, 5, 6)
- **`components/admin/BookmarkForm.tsx`**:
  - Remove `<MediaManager>` section from bookmark addition view.
  - Set default state values for `specialties` and `notablePatronsTrivia` to `""`.
  - Add `websiteUrl` input field in bookstore details section.
  - Fix concurrent upload race condition by switching all `setFormData` calls to functional state updates (`setFormData(prev => ...)`).
  - Automatically detect image orientation upon upload and set default dimensions accordingly if wide.
- **`tests/admin-form.test.tsx`**:
  - Test initial blank fields, website URL input, absence of clippings manager, and state updates during concurrent uploads.

### 2. Article-Insensitive Alphabetical Sorting (Item 7)
- **`lib/utils/sorting.ts`** *(New)*:
  - Helper `getSortableName(name: string): string` to strip leading `"The "`, `"A "`, `"An "`.
  - Helper `compareBookstoresAlphabetically(a, b)` for deterministic sorting.
- **`lib/db/queries.ts`**:
  - Use `getSortableName` in `getAllBookstores()` to ensure all bookstore queries return article-normalized order.
- **`components/bookstores/BookstoresDirectoryClient.tsx`**:
  - Ensure client-side search and grouping sorts using `getSortableName`.
- **`tests/sorting.test.ts`** *(New)*:
  - Unit tests for article stripping and sorting.

### 3. Curator Cabinet Most Recently Added Ordering (Item 8)
- **`app/admin/page.tsx`**:
  - Sort bookmarks by `createdAt DESC` so newest bookmarks are at the top of Curator's Cabinet.
- **`app/admin/AdminTableClient.tsx`**:
  - Maintain newest-first sorting for bookmarks table.
- **`tests/admin-table-sort.test.tsx`** *(New)*:
  - Unit tests verifying table displays most recently created bookmarks first.

### 4. Main Page Landscape Bookmark Layout Fix (Item 9)
- **`lib/utils/dimensions.ts`**:
  - Extend `parseDimensions` to recognize additional horizontal formats and aspect ratios.
- **`components/home/BookmarkPaperSpread.tsx`**:
  - In `BookmarkPaperItem`, ensure natural aspect ratio handles landscape images gracefully without squishing into vertical 1:3.2 slots.
  - Ensure single/unpaired landscape bookmarks render in multi-column width (`col-span-2 lg:col-span-3`) with horizontal aspect ratio.
- **`tests/bookmark-paper-spread.test.tsx`**:
  - Test single landscape bookmark slot assignment and multi-column rendering.

### 5. Bookstore Branches as Distinct Directory Entries (Item 2)
- **`lib/db/mutations.ts`**:
  - In `saveBookstoreDossier`, when saving a flagship bookstore, automatically create/sync branch locations into distinct bookstore rows with `isFlagship: 0`, `flagshipId: bookstoreId`, `branchLabel: loc.label`, `streetAddress: loc.streetAddress`, `city: loc.city`, `stateProvince: loc.stateProvince`, `country: loc.country`.
- **`components/bookstores/BookstoreDetailView.tsx`**:
  - Render "Sister Branches & Other Locations" section linking to all sibling branches and parent flagship.
- **`tests/chain-bookstores.test.ts`**:
  - Integration tests verifying auto-creation and querying of branch bookstores from parent flagship dossier.

### 6. Bazaar Multiple Copies Trade Selection (Item 3)
- **`components/trading/TradingHubClient.tsx`**:
  - Add `selectedQuantities` state map.
  - Render `+` and `−` quantity buttons in trade cart, bounded between 1 and `bookmark.tradeQuantity`.
  - Send `{ bookmarkId, quantity }` in `requestedBookmarksSnapshot`.
- **`components/trading/OtherBookmarksHubClient.tsx`**:
  - Add identical quantity adjustment controls for other ephemera bookmarks.
- **`tests/trading-quantities.test.tsx`** *(New)*:
  - Component tests for quantity increments/decrements and payload preparation.

### 7. "Trader Extraordinaires" Leaderboard (Item 10)
- **`lib/utils/trader-leaderboard.ts`** *(New)*:
  - `formatCollectorInitials(name: string): string` (e.g. `"Jane Doe"` $\rightarrow$ `"J. D."`).
  - `computeTraderLeaderboard(proposals)`: Aggregates accepted proposals into ranked list of top traders with total requested bookmarks.
- **`components/trading/TraderLeaderboard.tsx`** *(New)*:
  - Broadside-styled antique leaderboard component matching FAQ styling.
- **`components/trading/TradingHubClient.tsx`**:
  - Embed `<TraderLeaderboard>` in right sidebar below FAQ section.
- **`tests/trader-leaderboard.test.tsx`** *(New)*:
  - Tests for initials masking, aggregation logic, and UI rendering.

---

## Verification Plan

### Automated Tests
Run Vitest on all individual feature test suites:
- `npx vitest run tests/sorting.test.ts`
- `npx vitest run tests/admin-form.test.tsx`
- `npx vitest run tests/admin-table-sort.test.tsx`
- `npx vitest run tests/bookmark-paper-spread.test.tsx`
- `npx vitest run tests/chain-bookstores.test.ts`
- `npx vitest run tests/trading-quantities.test.tsx`
- `npx vitest run tests/trader-leaderboard.test.tsx`

Run full regression test suite:
- `npm test`

Run production Next.js build:
- `npm run build`

---

## Step-by-Step Implementation Tasks

### Task 1: Cataloging Cleanups & Concurrency Fix (Items 1, 4, 5, 6)
**Files to touch:**
- `components/admin/BookmarkForm.tsx`
- `tests/admin-form.test.tsx`

**Instructions:**
1. In `components/admin/BookmarkForm.tsx`:
   - Set default state values for `specialties: ""` and `notablePatronsTrivia: ""` in `formData.bookstore`.
   - Remove `<MediaManager>` section (around line 1210-1216) and its unused imports if any.
   - Add a website URL input field under the bookstore location/years section:
     ```tsx
     <div>
       <label className="block text-xs font-mono text-stone-600 mb-1">BOOKSTORE WEBSITE URL</label>
       <input
         type="url"
         placeholder="https://example.com"
         value={formData.bookstore.websiteUrl || ""}
         onChange={(e) => setFormData((prev) => ({
           ...prev,
           bookstore: { ...prev.bookstore, websiteUrl: e.target.value },
         }))}
         className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#E8E2D5] rounded-lg text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-serif"
       />
     </div>
     ```
   - Convert all `setFormData` calls in image upload handlers to functional updates:
     ```tsx
     <ImageDropzone
       label="Bookmark Front Scan"
       value={formData.bookmark.frontImageUrl}
       onChange={(url) =>
         setFormData((prev) => ({
           ...prev,
           bookmark: { ...prev.bookmark, frontImageUrl: url },
         }))
       }
       onUploadingChange={setIsUploadingFront}
       aspectRatio={parsedDimensions.isLandscape ? "landscape" : "bookmark"}
       required
     />
     <ImageDropzone
       label="Bookmark Verso / Back Scan (Optional)"
       value={formData.bookmark.backImageUrl || ""}
       onChange={(url) =>
         setFormData((prev) => ({
           ...prev,
           bookmark: { ...prev.bookmark, backImageUrl: url },
         }))
       }
       onUploadingChange={setIsUploadingBack}
       aspectRatio={parsedDimensions.isLandscape ? "landscape" : "bookmark"}
     />
     ```
2. Update/create tests in `tests/admin-form.test.tsx` verifying:
   - Initial specialties and trivia are blank (`""`).
   - Website URL input modifies state.
   - MediaManager is not rendered in BookmarkForm.
   - Concurrent front and back uploads update state without clobbering each other.
3. Run tests: `npx vitest run tests/admin-form.test.tsx`
4. Commit:
   `git add components/admin/BookmarkForm.tsx tests/admin-form.test.tsx && git commit -m "fix(catalog): clean up add-bookmark fields, add website input, remove clippings upload, and fix upload race condition"`

---

### Task 2: Article-Insensitive Alphabetical Sorting (Item 7)
**Files to touch:**
- `lib/utils/sorting.ts` (New)
- `lib/db/queries.ts`
- `components/bookstores/BookstoresDirectoryClient.tsx`
- `tests/sorting.test.ts` (New)

**Instructions:**
1. Create `lib/utils/sorting.ts`:
   ```ts
   /**
    * Returns a normalized sortable string ignoring leading English articles (A, An, The).
    */
   export function getSortableName(name: string): string {
     if (!name) return "";
     return name.replace(/^(the|a|an)\s+/i, "").trim();
   }

   export function compareBookstoresAlphabetically<T extends { name: string }>(a: T, b: T): number {
     const nameA = getSortableName(a.name).toLowerCase();
     const nameB = getSortableName(b.name).toLowerCase();
     if (nameA < nameB) return -1;
     if (nameA > nameB) return 1;
     return a.name.localeCompare(b.name);
   }
   ```
2. In `lib/db/queries.ts`:
   - Import `compareBookstoresAlphabetically` and sort `allStores` in `getAllBookstores()` before returning.
3. In `components/bookstores/BookstoresDirectoryClient.tsx`:
   - When sorting bookstores for directory display, sort using `compareBookstoresAlphabetically`.
4. Create `tests/sorting.test.ts` with test cases:
   - `"The Owls Nest"` sorts under O (after `"Oak Books"`, before `"Oxford Books"`).
   - `"A Book Store"` sorts under B (after `"Automaton Books"`, before `"Borders"`).
   - `"An Antique Shop"` sorts under A (based on Antique).
5. Run tests: `npx vitest run tests/sorting.test.ts`
6. Commit:
   `git add lib/utils/sorting.ts lib/db/queries.ts components/bookstores/BookstoresDirectoryClient.tsx tests/sorting.test.ts && git commit -m "feat(sorting): implement article-insensitive alphabetical bookstore sorting"`

---

### Task 3: Curator Cabinet Most Recently Added Ordering (Item 8)
**Files to touch:**
- `app/admin/page.tsx`
- `app/admin/AdminTableClient.tsx`
- `tests/admin-table-sort.test.tsx` (New)

**Instructions:**
1. In `app/admin/page.tsx`:
   - When passing `bookmarks` to `<AdminTableClient>`, sort them by `createdAt` descending:
     ```ts
     const sortedBookmarks = [...bookmarks].sort((a, b) => {
       const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
       const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
       return timeB - timeA;
     });
     ```
2. In `app/admin/AdminTableClient.tsx`:
   - Verify that the default bookmarks table view preserves this `createdAt` descending order when initialized and after updates.
3. Create `tests/admin-table-sort.test.tsx` verifying:
   - Bookmarks with newer `createdAt` timestamps appear before older bookmarks.
4. Run tests: `npx vitest run tests/admin-table-sort.test.tsx`
5. Commit:
   `git add app/admin/page.tsx app/admin/AdminTableClient.tsx tests/admin-table-sort.test.tsx && git commit -m "feat(admin): sort bookmarks by most recently added at the top in curator cabinet"`

---

### Task 4: Main Page Landscape Bookmark Layout Fix (Item 9)
**Files to touch:**
- `lib/utils/dimensions.ts`
- `components/home/BookmarkPaperSpread.tsx`
- `tests/bookmark-paper-spread.test.tsx`

**Instructions:**
1. In `lib/utils/dimensions.ts`:
   - Enhance `parseDimensions` to handle formats like `"7.5 x 2.25"`, `"7 1/2 × 2 1/4"`, `"7.5\" W × 2.25\" H"`.
   - Ensure `isLandscape: width > height`.
2. In `components/home/BookmarkPaperSpread.tsx`:
   - In `BookmarkPaperItem`, add a check so that if an item is landscape or its image aspect ratio is landscape, it maintains `aspect-[3.2/1] max-h-[170px]`.
   - In `groupBookmarksForSpread`, verify that an unpaired landscape bookmark (single item in a `landscape-stack` slot) renders cleanly with `col-span-2 lg:col-span-3` rather than squishing into a 1-column portrait slot.
3. In `tests/bookmark-paper-spread.test.tsx`:
   - Add a test case with an odd number of landscape bookmarks (e.g. 1 portrait and 1 landscape bookmark).
   - Verify that the single landscape bookmark is allocated to a `landscape-stack` slot with multi-column span and `isLandscape={true}`.
4. Run tests: `npx vitest run tests/bookmark-paper-spread.test.tsx`
5. Commit:
   `git add lib/utils/dimensions.ts components/home/BookmarkPaperSpread.tsx tests/bookmark-paper-spread.test.tsx && git commit -m "fix(home): ensure unpaired landscape bookmarks span multi-column with horizontal aspect ratio"`

---

### Task 5: Branch Bookstores Auto-Creation & Cross-Linking (Item 2)
**Files to touch:**
- `lib/db/mutations.ts`
- `components/bookstores/BookstoreDetailView.tsx`
- `tests/chain-bookstores.test.ts`

**Instructions:**
1. In `lib/db/mutations.ts`, in `saveBookstoreDossier`:
   - When saving a bookstore:
     - Check if `data.bookstore.locations` has secondary/branch locations.
     - For each location where `idx > 0` (or where `!loc.isMovedFrom` or `loc.label.toLowerCase().includes("branch")`):
       - If the flagship is marked `isFlagship: true`, generate or match a branch bookstore ID:
         `branchId = loc.id && !loc.id.startsWith("loc-") ? loc.id : generateSlug("${data.bookstore.name}-${loc.label}-${loc.city}")`
       - Auto-upsert this branch record into `bookstores` table:
         ```ts
         await db.insert(bookstores).values({
           id: branchId,
           name: data.bookstore.name,
           city: loc.city || data.bookstore.city,
           stateProvince: loc.stateProvince || data.bookstore.stateProvince,
           country: loc.country || data.bookstore.country,
           streetAddress: loc.streetAddress || null,
           isFlagship: false,
           flagshipId: bookstoreId,
           chainName: data.bookstore.chainName || data.bookstore.name,
           branchLabel: loc.label,
           yearOpened: data.bookstore.yearOpened,
           yearClosed: loc.isCurrent ? null : data.bookstore.yearClosed,
           isStillOperating: Boolean(loc.isCurrent),
           historicalBlurb: `Branch location of ${data.bookstore.name}.`,
           createdAt: now,
           updatedAt: now,
         }).onConflictDoUpdate({
           target: bookstores.id,
           set: {
             city: loc.city || data.bookstore.city,
             stateProvince: loc.stateProvince || data.bookstore.stateProvince,
             country: loc.country || data.bookstore.country,
             streetAddress: loc.streetAddress || null,
             branchLabel: loc.label,
             isStillOperating: Boolean(loc.isCurrent),
             updatedAt: now,
           },
         });
         ```
2. In `components/bookstores/BookstoreDetailView.tsx`:
   - If the bookstore has `branches` (as a flagship) or `flagshipStore` (as a branch):
     - Render a dedicated **"Sister Branches & Other Locations"** section displaying sister branches with addresses and direct links to their dossier pages.
3. In `tests/chain-bookstores.test.ts`:
   - Add a test verifying that saving a flagship store with branch locations automatically inserts the branch bookstore records into `bookstores` and links them.
4. Run tests: `npx vitest run tests/chain-bookstores.test.ts`
5. Commit:
   `git add lib/db/mutations.ts components/bookstores/BookstoreDetailView.tsx tests/chain-bookstores.test.ts && git commit -m "feat(bookstores): auto-create distinct bookstore directory entries for branches and cross-link sister branches"`

---

### Task 6: Bazaar Multiple Copies Trade Selection (Item 3)
**Files to touch:**
- `components/trading/TradingHubClient.tsx`
- `components/trading/OtherBookmarksHubClient.tsx`
- `tests/trading-quantities.test.tsx` (New)

**Instructions:**
1. In `components/trading/TradingHubClient.tsx`:
   - Add state: `const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({})`.
   - When a bookmark is selected, set `selectedQuantities[bm.id] = 1`.
   - When deselected, delete from `selectedQuantities`.
   - In the trade drawer list of selected bookmarks:
     - Render quantity controls: `−`, `[Quantity]`, `+`.
     - Decrement: `Math.max(1, (selectedQuantities[bm.id] || 1) - 1)`.
     - Increment: `Math.min(bm.tradeQuantity || 1, (selectedQuantities[bm.id] || 1) + 1)`.
     - If `bm.tradeQuantity <= 1`, disable `+`.
   - Update submission payload:
     - `requestedBookmarksSnapshot`: Include `quantity: selectedQuantities[bm.id] || 1`.
     - Update total item count badges to reflect `Object.values(selectedQuantities).reduce((a, b) => a + b, 0)`.
2. In `components/trading/OtherBookmarksHubClient.tsx`:
   - Implement the identical `selectedQuantities` tracking, `+` / `−` controls, and payload serialization for non-bookstore ephemera.
3. Create `tests/trading-quantities.test.tsx`:
   - Test selecting a bookmark with `tradeQuantity: 3`.
   - Verify clicking `+` increases quantity to 2 and 3, and cannot exceed 3.
   - Verify clicking `−` decreases quantity down to 1, and cannot go below 1.
   - Verify trade proposal payload contains `{ bookmarkId, quantity: 3 }`.
4. Run tests: `npx vitest run tests/trading-quantities.test.tsx`
5. Commit:
   `git add components/trading/TradingHubClient.tsx components/trading/OtherBookmarksHubClient.tsx tests/trading-quantities.test.tsx && git commit -m "feat(trading): allow multiple copy quantity selection capped at available trade inventory"`

---

### Task 7: "Trader Extraordinaires" Leaderboard (Item 10)
**Files to touch:**
- `lib/utils/trader-leaderboard.ts` (New)
- `components/trading/TraderLeaderboard.tsx` (New)
- `components/trading/TradingHubClient.tsx`
- `tests/trader-leaderboard.test.tsx` (New)

**Instructions:**
1. Create `lib/utils/trader-leaderboard.ts`:
   ```ts
   export interface TraderLeaderboardEntry {
     collectorInitials: string;
     totalBookmarksTraded: number;
     tradesCount: number;
   }

   export function formatCollectorInitials(name: string): string {
     if (!name || !name.trim()) return "?";
     const parts = name.trim().split(/\s+/).filter(Boolean);
     if (parts.length === 1) {
       return `${parts[0][0].toUpperCase()}.`;
     }
     const first = parts[0][0].toUpperCase();
     const last = parts[parts.length - 1][0].toUpperCase();
     return `${first}. ${last}.`;
   }

   export function computeTraderLeaderboard(proposals: any[]): TraderLeaderboardEntry[] {
     const accepted = proposals.filter((p) => p.status === "accepted" || p.status === "completed");
     const collectorMap = new Map<string, { totalBookmarks: number; tradesCount: number }>();

     for (const p of accepted) {
       const name = p.collectorName || "Anonymous";
       let count = 0;
       try {
         const items = JSON.parse(p.requestedBookmarksSnapshot || "[]");
         if (Array.isArray(items)) {
           count = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
         }
       } catch {
         count = 1;
       }
       if (count === 0) count = 1;

       const current = collectorMap.get(name) || { totalBookmarks: 0, tradesCount: 0 };
       collectorMap.set(name, {
         totalBookmarks: current.totalBookmarks + count,
         tradesCount: current.tradesCount + 1,
       });
     }

     return Array.from(collectorMap.entries())
       .map(([name, stats]) => ({
         collectorInitials: formatCollectorInitials(name),
         totalBookmarksTraded: stats.totalBookmarks,
         tradesCount: stats.tradesCount,
       }))
       .sort((a, b) => b.totalBookmarksTraded - a.totalBookmarksTraded)
       .slice(0, 10);
   }
   ```
2. Create `components/trading/TraderLeaderboard.tsx`:
   - Broadside-styled antique card with matching typography and same width as the FAQ block.
   - Header: *"Trader Extraordinaires"* with an antique laurel/trophy icon and subtitle *"Most active collectors by accepted trade volume"*.
   - Table / list of top traders with rank badges (1st, 2nd, 3rd in antique bronze/silver/gold styling), masked initials, and total bookmarks exchanged.
3. In `components/trading/TradingHubClient.tsx`:
   - Import `<TraderLeaderboard>` and place it in the right column directly below the FAQ accordion.
4. Create `tests/trader-leaderboard.test.tsx` verifying:
   - `formatCollectorInitials` handles single names, two names, and multi-word names.
   - `computeTraderLeaderboard` aggregates items across accepted proposals correctly and sorts highest volume first.
   - `<TraderLeaderboard>` renders the ranked collector initials and quantities.
5. Run tests: `npx vitest run tests/trader-leaderboard.test.tsx`
6. Commit:
   `git add lib/utils/trader-leaderboard.ts components/trading/TraderLeaderboard.tsx components/trading/TradingHubClient.tsx tests/trader-leaderboard.test.tsx && git commit -m "feat(trading): add Trader Extraordinaires leaderboard below FAQ on bazaar page"`

---

### Task 8: Full Test Suite & Production Build Verification
**Files to touch:**
- All touched files

**Instructions:**
1. Run all 54+ test suites across the repository:
   `npm test`
2. Run Next.js production build:
   `npm run build`
3. Verify zero errors, warnings, or regressions.
4. Verify dev server status.

---
