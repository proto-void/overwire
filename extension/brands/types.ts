/**
 * Build-time brand pack contract (`extension/brands/<slug>/brand.ts`).
 * Sole public product brand is Overwire (`brands/overwire/`). External trees via `BRAND_DIR`.
 */
export interface BrandConfig {
  name: string;
  shortName: string;
  description: string;
  /** Zip / output slug (kebab-case). */
  slug: string;
  defaultTheme: 'dark' | 'light';
  /**
   * Chrome MV3 public key (base64 DER SubjectPublicKeyInfo).
   * Stabilizes the unpacked extension id. Public only — never commit the private .pem.
   */
  chromiumManifestKey?: string;
  /**
   * Chromium extension ids for native-messaging allowed_origins
   * (stable unpacked id from the key, plus known store ids when published).
   */
  chromiumExtensionIds?: string[];
  /**
   * Native-messaging application name (`connectNative`).
   * Overwire host is `com.overwire.db`. Installers dual-register legacy `com.detour.db`
   * for upgrade continuity (ADR-031).
   */
  nativeHostName?: string;
}

/** Default when a brand pack omits `nativeHostName`. */
export const DEFAULT_NATIVE_HOST_NAME = 'com.overwire.db';

/** Pre-rebrand native host — dual-register / connectNative fallback only. */
export const LEGACY_NATIVE_HOST_NAME = 'com.detour.db';
