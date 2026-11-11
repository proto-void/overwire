/**
 * Stable Chromium extension ids for native-messaging allowed_origins.
 * Same public key / ids as the former Detour listing so CWS upgrades in place (ADR-031).
 * Public key lives in extension/brands/overwire/brand.ts (public only — never the .pem).
 */

/** Stable unpacked id (manifest key in brands/overwire). */
export const OVERWIRE_UNPACKED_CHROMIUM_ID = 'hegphfgboahkhkpiglcccnkbdpddpemj';

/** Known Chrome Web Store / Edge store ids (Overwire listing continuity). */
export const OVERWIRE_STORE_CHROMIUM_IDS: readonly string[] = [
  'jfgbokgdgpjhkciooicmbdgablgkklmn',
];

/** @deprecated Alias — same id as OVERWIRE_UNPACKED_CHROMIUM_ID. */
export const DETOUR_UNPACKED_CHROMIUM_ID = OVERWIRE_UNPACKED_CHROMIUM_ID;

/** @deprecated Alias — same list as OVERWIRE_STORE_CHROMIUM_IDS. */
export const DETOUR_STORE_CHROMIUM_IDS = OVERWIRE_STORE_CHROMIUM_IDS;

export function defaultChromiumExtensionIds(
  _brand: 'detour' | 'overwire' = 'overwire',
): string[] {
  // Brand arg ignored: Detour and Overwire share Chromium ids for in-place upgrade.
  return [OVERWIRE_UNPACKED_CHROMIUM_ID, ...OVERWIRE_STORE_CHROMIUM_IDS];
}

/** 32-char Chrome extension id (a–p). */
export function isChromiumExtensionId(id: string): boolean {
  return /^[a-p]{32}$/.test(id);
}
