# Next Release Enhancements Design Specification

## Overview
This specification details the enhancements for the upcoming release across 10 functional requirements covering bookstore cataloging, branch automation, trading duplicate quantities, sorting rules, layout bin-packing, and the collector leaderboard.

---

## 1. Cataloging & Creation Workflow (Items 1, 4, 5, 6)

### 1.1 Remove Clippings Upload from Add Bookmark Modal (Item 1)
- **Problem**: When cataloging a new bookmark in `BookmarkForm.tsx`, an embedded `<MediaManager>` allows uploading press clippings to the associated bookstore. This clutters the bookmark flow and belongs on the dedicated bookstore dossier page.
- **Solution**: Remove the `<MediaManager>` section from `components/admin/BookmarkForm.tsx`.
- **Scope**: Keep only the essential bookstore fields (Name, City, State/Province, Country, Street Address, Year Opened, Specialties, Patrons/Trivia, Website).

### 1.2 Blank Default Fields for Bookstore Creation (Item 4)
- **Problem**: In `BookmarkForm.tsx`, `specialties` defaults to `"Literature, Rare Books, Poetry"` and `notablePatronsTrivia` defaults to `"Famous author signing\nHistoric event"`.
- **Solution**: Set default state values for both fields to empty strings (`""`).

### 1.3 Bookstore Website Field in Add Bookmark View (Item 5)
- **Problem**: `formData.bookstore.websiteUrl` exists in state but lacks an input field in `BookmarkForm.tsx`.
- **Solution**: Add a dedicated URL input field for the bookstore website under the address and years section of `BookmarkForm.tsx`.

### 1.4 Concurrent Image Upload Race Condition Fix (Item 6)
- **Problem**: Dropping or selecting front and back bookmark scans simultaneously can cause the front image to disappear because asynchronous upload completions update `formData` using stale state closures (`setFormData({ ...formData, ... })`).
- **Solution**:
  - Convert all state updates to functional setters: `setFormData((prev) => ({ ...prev, bookmark: { ...prev.bookmark, frontImageUrl: url } }))`.
  - Isolate front and back upload state tracking (`uploadingFront`, `uploadingBack`) so that independent uploads never cancel or overwrite each other.

---

## 2. Bookstore Branches as Distinct Directory Entries (Item 2)

### 2.1 Flagship & Branch Relationship
- The initial parent store is created as the flagship (`isFlagship: 1`, `chainName: <Bookstore Name>`).
- When adding a branch location in the Bookstore Visual Editor (`BookstoreVisualEditor.tsx`), the editor provides an action or automatic sync to generate a distinct record in the `bookstores` table:
  - `id`: Slugified from name + branch label + city (e.g. `books-west-lompoc-california`).
  - `name`: Flagship name.
  - `branchLabel`: The label specified (e.g. `"Lompoc Branch"`).
  - `streetAddress`, `city`, `stateProvince`, `country`: From the branch location inputs.
  - `isFlagship`: `0`.
  - `flagshipId`: The ID of the flagship parent store.
  - `chainName`: The shared chain name.
- Updates to branches on the flagship editor sync to the branch bookstore records.

### 2.2 Cross-Linking Across Branches
- In `BookstoreDetailView.tsx`, if a bookstore has a `flagshipId` or is a flagship with linked branches:
  - Render a **"Sister Branches & Other Locations"** panel showing other active/historic locations with links to their respective dossier pages.
  - On the vertical serpentine timeline, branch opening events link directly to the corresponding branch page.

---

## 3. Trading Bazaar Duplicates & Collector Leaderboard (Items 3, 10)

### 3.1 Multiple Trade Copies Selection (Item 3)
- **Context**: Bookmarks and Other Bookmarks have a `trade_quantity` column in the database indicating available duplicate copies.
- **Frontend Update**:
  - In `TradingHubClient.tsx` and `OtherBookmarksHubClient.tsx`, update the selection state:
    `selectedItems: Map<string, { bookmark: Bookmark; quantity: number }>`
  - In the trade cart / floating drawer, provide `+` and `−` buttons next to each selected bookmark.
  - Minimum requested quantity: `1`.
  - Maximum requested quantity: Capped at `bookmark.tradeQuantity`.
  - The trade proposal submission payload sends `{ bookmarkId, quantity }` for each requested item.

### 3.2 "Trader Extraordinaires" Leaderboard (Item 10)
- **Placement**: Located below the FAQ section on the trading page (`/trading`), styled with the same container width and antique broadside typography as the FAQ module.
- **Data Query**:
  - Aggregates all accepted trade proposals (`status = 'accepted'`).
  - Parses the items traded from each accepted proposal.
  - Groups by collector, calculating the total number of bookmarks requested.
- **Display**:
  - Masked Collector Initials: First initial and last initial (e.g., `"Jane Doe"` $\rightarrow$ `"J. D."`, `"SingleName"` $\rightarrow$ `"S."`).
  - Total Bookmarks Traded badge.
  - Top 5–10 ranked collectors displayed with antique ranking badges (1st, 2nd, 3rd, etc.).

---

## 4. Sorting, Layout & Curator Ordering (Items 7, 8, 9)

### 4.1 Article-Insensitive Alphabetical Sorting (Item 7)
- **Rule**: When sorting bookstores alphabetically, ignore leading English definite/indefinite articles: `"The "`, `"A "`, `"An "`.
  - Example: `"The Owls Nest"` sorts under **O**.
  - Example: `"A Book Store"` sorts under **B**.
- **Implementation**:
  - Helper utility `getSortableName(name: string): string` in `lib/utils/sorting.ts`:
    ```ts
    export function getSortableName(name: string): string {
      return name.replace(/^(the|a|an)\s+/i, "").trim();
    }
    ```
  - Apply in `lib/db/queries.ts` (in-memory sort or SQL custom collation) and `components/bookstores/BookstoresDirectoryClient.tsx`.

### 4.2 Curator Cabinet Most Recently Added Order (Item 8)
- **Implementation**:
  - In `app/admin/page.tsx` and `AdminTableClient.tsx`, sort the catalog bookmarks by `createdAt DESC` (or descending numeric ID if `createdAt` matches).
  - Newly cataloged bookmarks appear immediately at the top of the table.

### 4.3 Horizontal Bookmark Layout Fix (Item 9)
- **Problem**: As seen in `media_1792042268083_8086a9fe.png`, horizontal bookmarks (e.g. *Shaker Mill Books*) whose aspect ratio is wider than tall were assigned to a 1-column portrait slot with `aspect-[1/3.2] max-h-[380px]`, causing artificial vertical whitespace.
- **Solution**:
  - In `lib/utils/dimensions.ts` and `BookmarkPaperSpread.tsx`:
    - Improve landscape detection: if `dimensions` width > height, OR if `isLandscape` is flagged, OR if dimensions indicate a wide format.
    - If a landscape bookmark is unpaired (odd landscape item), render it spanning 2 columns (`col-span-2`) with `aspect-[3.2/1]` rather than collapsing into a 1-column portrait frame.

---

## 5. Testing & Verification Plan

1. **Unit & Component Tests**:
   - `tests/sorting.test.ts`: Verify `getSortableName` strips `"The "`, `"A "`, `"An "` case-insensitively and sorts properly.
   - `tests/bookmark-form.test.tsx`: Verify clippings upload is removed, default fields are blank, website field updates state, and concurrent uploads do not clobber state.
   - `tests/trading-quantity.test.tsx`: Verify multiple copy selection with `+` / `−` within bounds.
   - `tests/trader-leaderboard.test.tsx`: Verify initials formatting and total requested bookmark aggregation.
   - `tests/bookmark-paper-spread.test.tsx`: Verify single landscape bookmarks span 2 columns and render with horizontal aspect ratio.
   - `tests/chain-bookstores.test.ts`: Verify branch creation from flagship and cross-linking.
2. **Regression Verification**:
   - Run full test suite (`npm test`, all 54+ suites).
   - Verify `npm run build` succeeds cleanly.
