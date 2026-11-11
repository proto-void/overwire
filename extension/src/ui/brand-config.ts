export interface RuntimeBrand {
  name: string;
  shortName: string;
  slug: string;
  defaultTheme: 'dark' | 'light';
  /** Native-messaging host name; Overwire default `com.overwire.db` (legacy `com.detour.db`). */
  nativeHostName?: string;
}

declare global {
  interface ImportMetaEnv {
    readonly BRAND: RuntimeBrand | string;
    /** Absolute URL string when partner-logo.svg existed at build, else ''. */
    readonly PARTNER_LOGO_URL: string;
    /** Ed25519 SPKI public verify key (base64url/base64). Empty = Community only. */
    readonly LICENSE_VERIFY_PUBLIC_KEY: string;
  }
}

const DEFAULT_NATIVE_HOST = 'com.overwire.db';

const fallback: RuntimeBrand = {
  name: 'Overwire',
  shortName: 'Overwire',
  slug: 'overwire',
  defaultTheme: 'dark',
  nativeHostName: DEFAULT_NATIVE_HOST,
};

function resolveBrand(): RuntimeBrand {
  const raw = import.meta.env.BRAND as RuntimeBrand | string | undefined;
  if (raw && typeof raw === 'object' && (raw.defaultTheme === 'dark' || raw.defaultTheme === 'light')) {
    return {
      ...raw,
      nativeHostName: raw.nativeHostName?.trim() || DEFAULT_NATIVE_HOST,
    };
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as Partial<RuntimeBrand>;
      if (parsed.defaultTheme === 'dark' || parsed.defaultTheme === 'light') {
        return {
          name: parsed.name ?? fallback.name,
          shortName: parsed.shortName ?? fallback.shortName,
          slug: parsed.slug ?? fallback.slug,
          defaultTheme: parsed.defaultTheme,
          nativeHostName: parsed.nativeHostName?.trim() || DEFAULT_NATIVE_HOST,
        };
      }
    } catch {
      /* use fallback */
    }
  }
  return fallback;
}

export const brand: RuntimeBrand = resolveBrand();

export const brandName = brand.name;
export const brandShortName = brand.shortName;
export const brandSlug = brand.slug;
export const brandDefaultTheme = brand.defaultTheme;
export const nativeHostName = brand.nativeHostName?.trim() || DEFAULT_NATIVE_HOST;
