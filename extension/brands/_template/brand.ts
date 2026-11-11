import type { BrandConfig } from '../types';

/**
 * External / partner brand pack template (`BRAND_DIR`).
 * Display name defaults to Overwire; override with `BRAND_NAME` at build time when needed.
 */
const brand: BrandConfig = {
  name: process.env.BRAND_NAME?.trim() || process.env.DETOUR_BRAND_NAME?.trim() || 'Overwire',
  shortName: 'Overwire',
  description: 'Point production at your code.',
  slug: 'example-partner',
  defaultTheme: 'light',
  // Optional: nativeHostName (default com.overwire.db) so a partner helper can coexist.
  // Optional: set chromiumManifestKey (public base64 DER only) + chromiumExtensionIds for stable unpacked id / NM allowed_origins.
};

export default brand;
