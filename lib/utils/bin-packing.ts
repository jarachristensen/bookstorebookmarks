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

/**
 * 2D Skyline Bin-Packing Algorithm for True-Scale Specimen Trays.
 * Packs items according to true physical dimensions in inches, stacking
 * landscape/shorter bookmarks in open vertical pockets without overlap.
 */
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
  // Ensures standard tallest bookmark (~8.8 in) occupies ~82% of tray height
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

      // Find best fitting skyline segment:
      // Prefers exact width matches (stacking below similar sized items) or lowest y
      let bestSegmentIdx = -1;
      let bestScore = Infinity;

      for (let s = 0; s < skyline.length; s++) {
        const seg = skyline[s];
        if (seg.width >= wPx && seg.y + hPx <= trayHeight - buffer) {
          // Score: combines Y position with width waste penalty
          // Stacking in an already established column (seg.y > buffer) is rewarded if width matches closely
          const widthWaste = seg.width - wPx;
          const isExactWidthStack = Math.abs(seg.width - requiredW) < 15 || Math.abs(seg.width - wPx) < 15;
          const isShelfSlot = seg.y > buffer;
          
          let score = seg.y + widthWaste * 0.2;
          if (isShelfSlot && isExactWidthStack) {
            // Prioritize filling the open vertical pocket in this column!
            score -= 100;
          }

          if (score < bestScore) {
            bestScore = score;
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
