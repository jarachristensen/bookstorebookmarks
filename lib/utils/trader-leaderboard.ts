export interface TraderLeaderboardEntry {
  collectorInitials: string;
  totalBookmarksTraded: number;
  tradesCount: number;
}

/**
 * Converts a collector's full name into clean, privacy-preserving initials (e.g. "Jane Doe" -> "J. D.").
 */
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

/**
 * Aggregates accepted or completed trade proposals to compute top collectors by trade volume.
 */
export function computeTraderLeaderboard(proposals: any[] = []): TraderLeaderboardEntry[] {
  if (!Array.isArray(proposals)) return [];

  const accepted = proposals.filter(
    (p) => p && (p.status === "accepted" || p.status === "completed")
  );

  const collectorMap = new Map<string, { displayName: string; totalBookmarks: number; tradesCount: number }>();

  for (const p of accepted) {
    const rawName = p.collectorName?.trim() || "Anonymous";
    const groupKey = rawName.toLowerCase();
    let count = 0;

    try {
      if (p.requestedBookmarksSnapshot) {
        const items =
          typeof p.requestedBookmarksSnapshot === "string"
            ? JSON.parse(p.requestedBookmarksSnapshot)
            : p.requestedBookmarksSnapshot;

        if (Array.isArray(items)) {
          count = items.reduce(
            (sum: number, item: any) => sum + (Number(item?.quantity) || 1),
            0
          );
        }
      }
    } catch {
      count = 1;
    }

    if (count <= 0) count = 1;

    const current = collectorMap.get(groupKey) || {
      displayName: rawName,
      totalBookmarks: 0,
      tradesCount: 0,
    };
    collectorMap.set(groupKey, {
      displayName: current.displayName,
      totalBookmarks: current.totalBookmarks + count,
      tradesCount: current.tradesCount + 1,
    });
  }

  return Array.from(collectorMap.values())
    .map((stats) => ({
      collectorInitials: formatCollectorInitials(stats.displayName),
      totalBookmarksTraded: stats.totalBookmarks,
      tradesCount: stats.tradesCount,
    }))
    .sort((a, b) => b.totalBookmarksTraded - a.totalBookmarksTraded)
    .slice(0, 10);
}
