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
