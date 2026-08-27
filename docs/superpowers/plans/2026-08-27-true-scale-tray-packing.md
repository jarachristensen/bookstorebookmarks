# True-Scale Archival Specimen Tray & 2D Bin-Packing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mathematical 2D bin-packing layout engine that arranges bookmarks in true physical scale on interactive museum linen drawers, stacking landscape bookmarks cleanly into open pockets with tactile specimen hover tags.

**Architecture:** A 2D Skyline bin-packing algorithm in `lib/utils/bin-packing.ts` converts physical inch dimensions into responsive screen pixels via an archive-wide scale factor $S$. The algorithm places specimens on available contour shelves with dedicated spacing cushions, paginating overflow into museum drawer pages. `SpecimenTray.tsx` renders specimens at calculated coordinates with organic tilt, drop shadows, floating hover tags, and 3D flip inspection.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Jest / ts-node tests.

**Spec:** `docs/superpowers/specs/2026-08-27-true-scale-tray-packing-design.md`

## Global Constraints
- Every bookmark's size on screen must strictly correspond to its real physical dimensions relative to all other bookmarks.
- Items must have a dedicated $16\text{px}–24\text{px}$ buffer cushion and must never touch or overlap.
- Landscape bookmarks (width > height) must stack into open vertical pockets above/below each other.
- No regression in existing search, filter, or 3D flip inspection capabilities.

---

### Task 1: Dimension Parser & Landscape Orientation Detection

**Files:**
- Modify: `lib/utils/dimensions.ts`
- Test: `tests/dimensions.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface ParsedDimensions {
    width: number; // in inches
    height: number; // in inches
    aspectRatio: number; // width / height
    isLandscape: boolean;
    rawText: string;
  }
  export function parseDimensions(dimStr?: string | null): ParsedDimensions;
  ```

- [ ] **Step 1: Write tests for dimension parsing and landscape detection**

Create `tests/dimensions.test.ts`:
```ts
import { parseDimensions } from "../lib/utils/dimensions";

describe("parseDimensions", () => {
  it("should parse standard portrait bookmark dimensions", () => {
    const res = parseDimensions('2.25" × 7.5"');
    expect(res.width).toBeCloseTo(2.25);
    expect(res.height).toBeCloseTo(7.5);
    expect(res.isLandscape).toBe(false);
    expect(res.aspectRatio).toBeCloseTo(2.25 / 7.5);
  });

  it("should detect landscape bookmarks when width > height", () => {
    const res = parseDimensions('7.0" × 2.25"');
    expect(res.width).toBeCloseTo(7.0);
    expect(res.height).toBeCloseTo(2.25);
    expect(res.isLandscape).toBe(true);
    expect(res.aspectRatio).toBeCloseTo(7.0 / 2.25);
  });

  it("should handle atypical dimension strings gracefully with fallback", () => {
    const res = parseDimensions("vintage size");
    expect(res.width).toBe(2.25);
    expect(res.height).toBe(7.5);
    expect(res.isLandscape).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/dimensions.test.ts`
Expected: FAIL (or missing landscape fields)

- [ ] **Step 3: Update `lib/utils/dimensions.ts`**

Update `lib/utils/dimensions.ts`:
```ts
export interface ParsedDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  isLandscape: boolean;
  rawText: string;
}

export function parseDimensions(dimStr?: string | null): ParsedDimensions {
  const fallback: ParsedDimensions = {
    width: 2.25,
    height: 7.5,
    aspectRatio: 2.25 / 7.5,
    isLandscape: false,
    rawText: dimStr || '2.25" × 7.5"',
  };

  if (!dimStr || typeof dimStr !== "string") {
    return fallback;
  }

  // Matches formats like '2.25" × 7.5"', '2.25 x 7.5', '2 1/4 x 7 1/2', '7.0" × 2.0"'
  const cleaned = dimStr.replace(/["”″]/g, "").trim();
  const parts = cleaned.split(/[×xX]/).map((p) => p.trim());

  if (parts.length === 2) {
    const parseFractionOrDecimal = (val: string): number => {
      if (val.includes("/")) {
        const [num, den] = val.split("/").map(Number);
        return den ? num / den : 0;
      }
      return parseFloat(val);
    };

    const width = parseFractionOrDecimal(parts[0]);
    const height = parseFractionOrDecimal(parts[1]);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      return {
        width,
        height,
        aspectRatio: width / height,
        isLandscape: width > height,
        rawText: dimStr,
      };
    }
  }

  return fallback;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/dimensions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/utils/dimensions.ts tests/dimensions.test.ts
git commit -m "feat(dimensions): add landscape detection and numerical width/height parsing"
```

---

### Task 2: Mathematical 2D Skyline Bin-Packing Engine

**Files:**
- Create: `lib/utils/bin-packing.ts`
- Test: `tests/bin-packing.test.ts`

**Interfaces:**
- Consumes: `parseDimensions` from `lib/utils/dimensions.ts`
- Produces:
  ```ts
  export interface PackedItem<T = any> {
    item: T;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }

  export interface TrayDrawer<T = any> {
    pageIndex: number;
    items: PackedItem<T>[];
    width: number;
    height: number;
  }

  export interface PackingConfig {
    trayWidth: number;
    trayHeight: number;
    buffer?: number;
    maxInchesHeight?: number;
  }

  export function packSpecimenTrays<T extends { dimensions?: string | null; id?: string }>(
    items: T[],
    config: PackingConfig
  ): TrayDrawer<T>[];
  ```

- [ ] **Step 1: Write unit tests for 2D bin packing**

Create `tests/bin-packing.test.ts`:
```ts
import { packSpecimenTrays } from "../lib/utils/bin-packing";

describe("packSpecimenTrays", () => {
  it("should pack portrait bookmarks without coordinate overlap", () => {
    const specimens = [
      { id: "1", dimensions: '2.25" × 7.5"' },
      { id: "2", dimensions: '2.0" × 7.0"' },
      { id: "3", dimensions: '2.5" × 8.0"' },
    ];

    const trays = packSpecimenTrays(specimens, {
      trayWidth: 1000,
      trayHeight: 500,
      buffer: 16,
    });

    expect(trays.length).toBeGreaterThanOrEqual(1);
    expect(trays[0].items.length).toBe(3);

    // Check no horizontal overlap on same horizontal band
    const item1 = trays[0].items[0];
    const item2 = trays[0].items[1];
    expect(item2.x).toBeGreaterThanOrEqual(item1.x + item1.width);
  });

  it("should stack landscape bookmarks vertically in available open headroom", () => {
    const specimens = [
      { id: "tall-1", dimensions: '2.0" × 8.0"' },
      { id: "land-1", dimensions: '6.0" × 2.5"' },
      { id: "land-2", dimensions: '6.0" × 2.5"' },
      { id: "tall-2", dimensions: '2.0" × 8.0"' },
    ];

    const trays = packSpecimenTrays(specimens, {
      trayWidth: 1000,
      trayHeight: 500,
      buffer: 16,
    });

    expect(trays.length).toBe(1);
    const land1 = trays[0].items.find((i) => i.item.id === "land-1")!;
    const land2 = trays[0].items.find((i) => i.item.id === "land-2")!;

    // One landscape should stack below the other in the same horizontal slot
    expect(Math.abs(land1.x - land2.x)).toBeLessThan(10);
    expect(land2.y).toBeGreaterThanOrEqual(land1.y + land1.height);
  });

  it("should paginate into multiple drawers when capacity is exceeded", () => {
    const specimens = Array.from({ length: 15 }, (_, i) => ({
      id: `bm-${i}`,
      dimensions: '2.5" × 8.0"',
    }));

    const trays = packSpecimenTrays(specimens, {
      trayWidth: 600,
      trayHeight: 400,
      buffer: 16,
    });

    expect(trays.length).toBeGreaterThan(1);
    const totalPacked = trays.reduce((acc, t) => acc + t.items.length, 0);
    expect(totalPacked).toBe(15);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/bin-packing.test.ts`
Expected: FAIL (file missing)

- [ ] **Step 3: Implement `lib/utils/bin-packing.ts`**

Create `lib/utils/bin-packing.ts`:
```ts
import { parseDimensions } from "./dimensions";

export interface PackedItem<T = any> {
  item: T;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TrayDrawer<T = any> {
  pageIndex: number;
  items: PackedItem<T>[];
  width: number;
  height: number;
}

export interface PackingConfig {
  trayWidth: number;
  trayHeight: number;
  buffer?: number;
  maxInchesHeight?: number;
}

interface SkylineSegment {
  x: number;
  y: number;
  width: number;
}

export function packSpecimenTrays<T extends { dimensions?: string | null; id?: string }>(
  items: T[],
  config: PackingConfig
): TrayDrawer<T>[] {
  if (!items || items.length === 0) {
    return [];
  }

  const {
    trayWidth,
    trayHeight,
    buffer = 18,
    maxInchesHeight = 8.8,
  } = config;

  // 1. Calculate universal physical scale factor S (pixels per inch)
  // Ensures standard tallest bookmark (~8.8 in) occupies ~85% of tray height
  const scale = (trayHeight * 0.82) / maxInchesHeight;

  // Natural curator placement rotation angles
  const tiltSequence = [-1.2, 0.9, -0.6, 1.4, -0.9, 1.1, -1.5, 0.7, 1.3, -0.8];

  const drawers: TrayDrawer<T>[] = [];
  let currentDrawerIndex = 0;
  let remainingItems = [...items];

  while (remainingItems.length > 0) {
    const currentDrawerItems: PackedItem<T>[] = [];
    // Skyline contour tracking available top surface across tray width
    let skyline: SkylineSegment[] = [{ x: buffer, y: buffer, width: trayWidth - 2 * buffer }];
    const unplacedInThisDrawer: T[] = [];

    for (let i = 0; i < remainingItems.length; i++) {
      const item = remainingItems[i];
      const dim = parseDimensions(item.dimensions);
      const wPx = Math.round(dim.width * scale);
      const hPx = Math.round(dim.height * scale);

      const requiredW = wPx + buffer;
      const requiredH = hPx + buffer;

      // Find best fitting skyline segment (lowest y that fits required width & height)
      let bestSegmentIdx = -1;
      let bestY = Infinity;

      for (let s = 0; s < skyline.length; s++) {
        const seg = skyline[s];
        if (seg.width >= wPx && seg.y + hPx <= trayHeight - buffer) {
          if (seg.y < bestY) {
            bestY = seg.y;
            bestSegmentIdx = s;
          }
        }
      }

      if (bestSegmentIdx !== -1) {
        const seg = skyline[bestSegmentIdx];
        const posX = seg.x;
        const posY = seg.y;
        const rot = tiltSequence[currentDrawerItems.length % tiltSequence.length];

        currentDrawerItems.push({
          item,
          x: posX,
          y: posY,
          width: wPx,
          height: hPx,
          rotation: rot,
        });

        // Update Skyline: Replace or split segment
        const newSegY = posY + requiredH;
        const segOriginalWidth = seg.width;

        if (segOriginalWidth > requiredW) {
          // Replace portion and create new remainder segment
          skyline.splice(
            bestSegmentIdx,
            1,
            { x: posX, y: newSegY, width: wPx },
            { x: posX + requiredW, y: seg.y, width: segOriginalWidth - requiredW }
          );
        } else {
          seg.y = newSegY;
        }

        // Merge adjacent skyline segments with equal Y
        for (let m = 0; m < skyline.length - 1; m++) {
          if (skyline[m].y === skyline[m + 1].y && skyline[m].x + skyline[m].width === skyline[m + 1].x) {
            skyline[m].width += skyline[m + 1].width;
            skyline.splice(m + 1, 1);
            m--;
          }
        }
      } else {
        unplacedInThisDrawer.push(item);
      }
    }

    if (currentDrawerItems.length === 0) {
      // Safety guard: if an item is too large for the tray, force place it on its own page
      const oversized = remainingItems[0];
      const dim = parseDimensions(oversized.dimensions);
      currentDrawerItems.push({
        item: oversized,
        x: buffer,
        y: buffer,
        width: Math.min(trayWidth - 2 * buffer, Math.round(dim.width * scale)),
        height: Math.min(trayHeight - 2 * buffer, Math.round(dim.height * scale)),
        rotation: 0,
      });
      remainingItems = remainingItems.slice(1);
    } else {
      remainingItems = unplacedInThisDrawer;
    }

    drawers.push({
      pageIndex: currentDrawerIndex + 1,
      items: currentDrawerItems,
      width: trayWidth,
      height: trayHeight,
    });

    currentDrawerIndex++;
  }

  return drawers;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest tests/bin-packing.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/utils/bin-packing.ts tests/bin-packing.test.ts
git commit -m "feat(packing): implement mathematical 2D skyline bin-packing engine with true physical scale"
```

---

### Task 3: Landscape Specimen Admin Form Toggle

**Files:**
- Modify: `components/admin/BookmarkForm.tsx`

- [ ] **Step 1: Add Landscape Specimen Toggle & Dimensions Auto-Detection**

In `BookmarkForm.tsx`, add an orientation radio or toggle beside the Dimensions input, and update `ImageDropzone` to dynamically display in landscape mode when checked.

- [ ] **Step 2: Verify locally with dev server and build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/admin/BookmarkForm.tsx
git commit -m "feat(admin): add landscape orientation toggle and auto-detection in bookmark form"
```

---

### Task 4: Interactive Linen Tray Canvas & Hover Specimen Tags

**Files:**
- Modify: `components/exhibit/BookmarkCard.tsx`
- Modify: `components/exhibit/SpecimenTray.tsx`

**Interfaces:**
- Consumes: `PackedItem` from `lib/utils/bin-packing.ts`
- Produces: Interactive linen tray rendering specimens at $\{ x, y \}$ coordinates with floating specimen tags on hover and 3D flip inspection.

- [ ] **Step 1: Refactor `BookmarkCard.tsx` for Packed Placement & Hover Tags**

Update `BookmarkCard.tsx` to receive `packedItem: PackedItem<BookmarkWithDetails>` and render:
- Specimen at exact `{ left: x, top: y, width, height, rotate }`.
- Floating Archival Specimen Tag on hover with Bookstore name, dimensions, year, and location.
- 3D Flip inspection trigger on click.

- [ ] **Step 2: Refactor `SpecimenTray.tsx` with Dynamic Canvas Sizing**

Update `SpecimenTray.tsx` to:
- Use `useMemo` to pack bookmarks into `TrayDrawer[]` based on container dimensions.
- Support page drawer slide transitions using Framer Motion.
- Display drawer pagination indicators (**"Tray Drawer 1 of 3"**, prev/next controls).

- [ ] **Step 3: Test and build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/exhibit/BookmarkCard.tsx components/exhibit/SpecimenTray.tsx
git commit -m "feat(tray): render true-scale 2D packed specimens on linen canvas with hover specimen tags"
```

---

### Task 5: End-to-End Gallery Integration & Final Verification

**Files:**
- Modify: `components/exhibit/ExhibitGalleryClient.tsx`
- Test: `tests/bin-packing.test.ts`, `tests/dimensions.test.ts`

- [ ] **Step 1: Update `ExhibitGalleryClient.tsx`**

Connect search/filters directly to the new `SpecimenTray`, maintaining smooth tray transitions when filters change.

- [ ] **Step 2: Run all automated tests**

Run: `npx jest`
Expected: All unit tests PASS.

- [ ] **Step 3: Run production build verification**

Run: `npm run build`
Expected: Clean build with code 0.

- [ ] **Step 4: Commit & Push to GitHub**

```bash
git add .
git commit -m "feat(gallery): integrate true-scale 2D packed physical tray drawers"
git push origin main
```
