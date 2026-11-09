/**
 * Neutral BRAND_* env vars with DETOUR_* fallbacks during the Overwire transition (plan 041).
 * Default brand slug remains `detour` until cutover.
 */

export function envBrandSlug(fallback = 'detour'): string {
  const raw = (process.env.BRAND || process.env.DETOUR_BRAND || fallback).trim();
  return raw || fallback;
}

export function envBrandDir(): string | undefined {
  const raw = (process.env.BRAND_DIR || process.env.DETOUR_BRAND_DIR || '').trim();
  return raw || undefined;
}

export function envBrandName(): string | undefined {
  const raw = (process.env.BRAND_NAME || process.env.DETOUR_BRAND_NAME || '').trim();
  return raw || undefined;
}

export function envOmitChromiumManifestKey(): boolean {
  return (
    process.env.BRAND_OMIT_CHROMIUM_MANIFEST_KEY === '1' ||
    process.env.DETOUR_OMIT_CHROMIUM_MANIFEST_KEY === '1'
  );
}

export function envDbE2e(): boolean {
  return process.env.BRAND_DB_E2E === '1' || process.env.DETOUR_DB_E2E === '1';
}

export function envDbHostCmd(): string | undefined {
  const raw = (process.env.BRAND_DB_HOST_CMD || process.env.DETOUR_DB_HOST_CMD || '').trim();
  return raw || undefined;
}

export function envPackOs(): string | undefined {
  const raw = (process.env.BRAND_PACK_OS || process.env.DETOUR_PACK_OS || '').trim();
  return raw || undefined;
}

export function envPackArch(): string | undefined {
  const raw = (process.env.BRAND_PACK_ARCH || process.env.DETOUR_PACK_ARCH || '').trim();
  return raw || undefined;
}

export function envSeaDir(): string | undefined {
  const raw = (process.env.BRAND_SEA_DIR || process.env.DETOUR_SEA_DIR || '').trim();
  return raw || undefined;
}

export function envExtDir(): string | undefined {
  const raw = (process.env.BRAND_EXT_DIR || process.env.DETOUR_EXT_DIR || '').trim();
  return raw || undefined;
}

export function envSeaNode(): string | undefined {
  const raw = (process.env.BRAND_SEA_NODE || process.env.DETOUR_SEA_NODE || '').trim();
  return raw || undefined;
}

export function envPickfileScpt(): string | undefined {
  const raw = (process.env.BRAND_PICKFILE_SCPT || process.env.DETOUR_PICKFILE_SCPT || '').trim();
  return raw || undefined;
}
