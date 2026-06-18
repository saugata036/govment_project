/** Per-domain checks passed (of 5). Drives scorecards, check tiles, and domain score. */
export const DOMAIN_CHECKS_PASSED = {
  1: 4,
  2: 3,
  3: 5,
  4: 1,
  5: 4,
  6: 0,
  7: 5,
  8: 1,
  9: 2,
};

export const DOMAIN_KPIS_TRACKED = {
  1: 5,
  2: 7,
  3: 6,
  4: 4,
  5: 8,
  6: 6,
  7: 5,
  8: 7,
  9: 4,
};

export function buildCheckStates(passedCount, total) {
  return Array.from({ length: total }, (_, index) => index < passedCount);
}
