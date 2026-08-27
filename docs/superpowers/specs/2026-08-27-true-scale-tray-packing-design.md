# True-Scale Archival Specimen Tray & 2D Bin-Packing Layout Engine

## Overview & Vision
In physical museum archives and collector drawers, bookmarks are displayed according to their true physical dimensions rather than being artificially stretched or cropped into uniform grid rows. This design introduces a mathematical 2D bin-packing layout engine (using the 2D Skyline algorithm) that packs bookmarks in true real-world scale (e.g. $1\text{ inch} = S\text{ pixels}$) with realistic spacing cushions into museum-grade velvet/linen drawers. Landscape bookmarks, oversized broadsides, and small ticket slips fit naturally into available pockets (like Tetris), delivering an authentic physical exhibition experience.

---

## Requirements & Scope

### 1. True Physical Scale Calibration
- **Input Dimension Parsing:** Parses physical measurement strings (e.g. `"2.25\" × 7.5\""`, `"7.0\" × 2.0\""`, `"5.5\" × 2\""`) into numeric width ($W_{\text{in}}$) and height ($H_{\text{in}}$) in inches.
- **Universal Scale Factor ($S$):**
  - Defines a responsive pixels-per-inch scale factor $S$ (calibrated so that the tallest bookmark in the collection $\approx 8.5\text{–}9\text{ inches}$ fits within the tray container height $H_{\text{tray}}$).
  - Bookmark pixel dimensions: $W_{\text{px}} = W_{\text{in}} \times S$, $H_{\text{px}} = H_{\text{in}} \times S$.
  - Preserves exact relative size across all bookmarks in the archive.

### 2. Mathematical 2D Skyline Bin-Packing Engine (`lib/utils/bin-packing.ts`)
- **Skyline Shelf Tracking:**
  - Maintains the top contour (skyline) across the tray width $W_{\text{tray}}$.
  - Scans for the lowest available contour slot where a specimen of $(W_{\text{px}} + 2 \cdot \text{buffer}, H_{\text{px}} + 2 \cdot \text{buffer})$ fits.
  - When placing a short or landscape bookmark, the remaining vertical headroom is retained in the contour, allowing another landscape bookmark or small slip to stack directly above or below it.
- **Specimen Spacing Buffer:**
  - Enforces a dedicated $16\text{px}–24\text{px}$ buffer around each specimen so items never touch or clip each other's drop shadows.
- **Multi-Tray Pagination:**
  - When a tray is full, the engine closes the current drawer and packs remaining items into Tray Page 2, 3, etc.
  - Returns an array of packed drawers: `TrayPage[]` where each page contains `{ x, y, width, height, rotation, bookmark }`.

### 3. Landscape Specimen Support in Admin Form (`BookmarkForm.tsx`)
- **Landscape Specimen Toggle:** Adds an **"Orientation: [ ] Landscape Specimen"** toggle in the bookmark creation/editing form.
- **Auto-Detection:** Automatically activates when entered width is greater than height (e.g. `7.0" × 2.25"`), with manual toggle override.
- **Aspect Ratio Calibration:** Configures dropzones and preview canvases to render in landscape mode ($16/9$ or true aspect ratio) when selected.

### 4. Interactive Linen Tray Canvas (`SpecimenTray.tsx` & `BookmarkCard.tsx`)
- **Linen Tray Aesthetics:** High-end museum exhibit tray with tactile linen cloth inlay, brass corner plates, and subtle depth.
- **Specimen Placement:** Absolute positioning based on calculated $\{ x, y \}$ coordinates with organic tilt ($\pm 0.5^\circ$ to $\pm 1.4^\circ$) and photorealistic drop shadows.
- **Tactile Lift & Hover Tag:**
  - Hovering a bookmark triggers a gentle elevation ($z$-index boost, $-8\text{px}$ lift, enhanced drop shadow).
  - Displays a floating archival specimen tooltip above/near the item:
    - Bookmark Title & Bookstore Name
    - Year Produced (e.g. `c. 1978`)
    - Physical Dimensions (e.g. `2.25" × 7.5"`)
    - Geographic Origin (e.g. `Portland, OR`)
- **3D Flip Inspector Integration:** Clicking/tapping any specimen opens the full 3D Flip Inspector (Recto/Verso flip, physical specifications, and Bookstore Dossier).

### 5. Responsive Design & Mobile Adaptability
- **Desktop ($\ge 1024\text{px}$):** $W_{\text{tray}} \approx 1100\text{px}, H_{\text{tray}} \approx 540\text{px}$, packing 6–10 specimens per drawer.
- **Tablet ($640\text{px} - 1023\text{px}$):** $W_{\text{tray}} \approx 720\text{px}, H_{\text{tray}} \approx 480\text{px}$, packing 4–6 specimens per drawer.
- **Mobile ($< 640\text{px}$):** Responsive scale factor $S$ preventing horizontal overflow while maintaining relative size comparisons.

---

## Architecture & Data Flow

```
[FilterBar / Search / Initial Bookmarks]
                   │
                   ▼
  [useMemo: Dimensions Parser & Universal Scale Factor S]
                   │
                   ▼
     [lib/utils/bin-packing.ts: packTrays(bookmarks, trayConfig)]
                   │
                   ▼
         [Paginated Tray Drawers: TrayPage[]]
                   │
                   ▼
       [components/exhibit/SpecimenTray.tsx]
           ├─ [Linen Tray Canvas & Brass Corners]
           ├─ [Framer Motion Drawer Slide Animation]
           └─ [Mapped PackedBookmarkItem components]
                   │
                   ├─ [Specimen with Natural Tilt & Drop Shadow]
                   ├─ [Hover Floating Archival Specimen Tag]
                   └─ [Click Event -> BookmarkInspector Modal]
```

---

## Key Files Touched & Created

1. **`lib/utils/bin-packing.ts` [NEW]:**
   - Implements the 2D Skyline bin-packing algorithm.
   - Calculates responsive scale factor $S$, item buffers, and generates paginated `TrayPage` coordinates.
2. **`lib/utils/dimensions.ts` [MODIFY]:**
   - Enhances dimension parser to extract numeric width/height and recognize landscape orientation.
3. **`components/admin/BookmarkForm.tsx` [MODIFY]:**
   - Adds the "Orientation: Landscape Specimen" toggle and automatic dimension detection.
4. **`components/exhibit/SpecimenTray.tsx` [MODIFY]:**
   - Refactors from fixed CSS grid to responsive 2D packed canvas with drawer slide transitions.
5. **`components/exhibit/BookmarkCard.tsx` [MODIFY]:**
   - Adapts to absolute coordinate rendering, hover specimen tag pill, and tactile lift.
6. **`components/exhibit/ExhibitGalleryClient.tsx` [MODIFY]:**
   - Connects the packed trays to pagination and filtering.

---

## Verification & Testing Plan

### Automated Tests
- **`tests/bin-packing.test.ts` [NEW]:**
  - Verify 2D bin packing handles pure portrait bookmarks.
  - Verify 2D bin packing stacks 2 landscape bookmarks vertically in a single column slot.
  - Verify buffers/cushions prevent coordinate overlap.
  - Verify multi-tray pagination when items exceed capacity.

### Manual Verification
- Verify that landscape bookmarks (e.g. $7.0\times2.0\text{ in}$) stack cleanly with vertical bookmarks on the tray.
- Verify that a 4-inch ticket bookmark renders noticeably shorter than a 7.5-inch letterpress bookmark.
- Test hover floating specimen tag and click-to-flip inspection.
- Test drawer pagination with prev/next buttons and arrow keys.
- Test responsiveness across mobile, tablet, and desktop viewport sizes.
