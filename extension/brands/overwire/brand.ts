import type { BrandConfig } from '../detour/brand';

/**
 * Overwire public brand (Concept A Bypass Arc — LOCKED 2026-11-09).
 * Default build brand after CWS rebrand cutover (ADR-031). Legacy: `BRAND=detour`.
 */
const brand: BrandConfig = {
  name: 'Overwire',
  shortName: 'Overwire',
  description:
    'Redirect requests, modify headers, mock fetch/XHR, inject JS/CSS, and query local or prod databases in your browser.',
  slug: 'overwire',
  defaultTheme: 'dark',
  // Target host name; installers should fall back to com.detour.db for existing helpers (ADR-031).
  nativeHostName: 'com.overwire.db',
  // Same Chromium public key / ids as Detour so CWS users upgrade in place (ADR-031).
  chromiumManifestKey:
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzVeG7r63pOvRcZZYFuV5y9yyHMiP0SfsDEHfeJd1l4GifOE0BA4GrwA3zIG4mXG6Vo2q+5eSZjt92j1t8FtJ00qcIgE4TaGV+g/aGOKL/ZbVOU5FANySELgbeWul048OyBZJK7ApRZ1dDHEKstAaSkjDSDAKfEVxrr5lkPPfuv24YHNZ/vm2WquyX6FbFskHEKijL22MYEy7uNFK9zjgJag9K3NnKntrR54jzHVCqxKiMIY4eomxnhvx+6d6JeRwuux6BJgoe4xk6JJWGzbnyi9WKL3HkEwgMA5XmT4UYCNsnZ6N/IWq2Se7X914Ub4Q/kVRYm26YE9F8kCbiBYH8QIDAQAB',
  chromiumExtensionIds: [
    'hegphfgboahkhkpiglcccnkbdpddpemj',
    'jfgbokgdgpjhkciooicmbdgablgkklmn',
  ],
};

export default brand;
