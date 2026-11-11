import type { StorageAreaLike } from '../rule-model/storage';

/** Set after the one-time Detour → Overwire upgrade banner is dismissed (or auto-acked). */
export const REBRAND_SEEN_KEY = 'overwireRebrandSeen';

export const REBRAND_BANNER_COPY =
  'Detour is now Overwire — all your rules, API collections, and database connections are right here.';

/**
 * Show the upgrade banner when this profile already has Detour-era data and has not
 * dismissed the notice. Top-level storage keys stay unchanged (`workspace`, etc.).
 */
export async function shouldShowRebrandBanner(area: StorageAreaLike): Promise<boolean> {
  const seen = (await area.get(REBRAND_SEEN_KEY))[REBRAND_SEEN_KEY];
  if (seen === true) return false;
  const workspace = (await area.get('workspace')).workspace;
  if (workspace !== undefined) return true;
  const dbConnections = (await area.get('dbConnections')).dbConnections;
  if (dbConnections !== undefined) return true;
  const apiCollections = (await area.get('apiCollections')).apiCollections;
  return apiCollections !== undefined;
}

export async function dismissRebrandBanner(area: StorageAreaLike): Promise<void> {
  await area.set({ [REBRAND_SEEN_KEY]: true });
}
