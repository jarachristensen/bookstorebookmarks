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

    // One landscape should stack below the other in the same column/slot
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
