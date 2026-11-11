import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'wxt';
import type { BrandConfig } from './brands/types';
import { DEFAULT_NATIVE_HOST_NAME } from './brands/types';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

/**
 * Brand directory: `BRAND_DIR` / `DETOUR_BRAND_DIR` (absolute path) wins;
 * else in-tree `brands/overwire` only (Detour flavor removed after CWS live).
 * External dirs let private partner repos build without copying assets into this tree (ADR-030).
 * `DETOUR_*` env aliases still accepted for one release.
 */
function resolveBrandDir(): { dir: string; slug: string } {
  const external = (process.env.BRAND_DIR || process.env.DETOUR_BRAND_DIR || '').trim();
  if (external) {
    const dir = path.isAbsolute(external) ? external : path.resolve(process.cwd(), external);
    if (!existsSync(path.join(dir, 'brand.ts'))) {
      throw new Error(
        `BRAND_DIR/DETOUR_BRAND_DIR="${dir}" is missing brand.ts (see brands/_template/).`,
      );
    }
    const slugEnv = (process.env.BRAND || process.env.DETOUR_BRAND || '').trim();
    const slug = slugEnv || path.basename(dir) || 'overwire';
    return { dir, slug };
  }
  const slugRaw = (process.env.BRAND || process.env.DETOUR_BRAND || 'overwire').trim() || 'overwire';
  if (slugRaw === 'detour') {
    throw new Error(
      'Detour brand flavor was removed (Overwire is live on CWS). Use default overwire, or BRAND_DIR for an external pack.',
    );
  }
  const slug = slugRaw;
  const dir = path.join(root, 'brands', slug);
  if (!existsSync(path.join(dir, 'brand.ts'))) {
    throw new Error(
      `Unknown BRAND="${slug}". Expected ${path.relative(root, path.join(dir, 'brand.ts'))} (sole in-tree brand: overwire), or set BRAND_DIR.`,
    );
  }
  return { dir, slug };
}

function loadBrand(brandDir: string): BrandConfig {
  const brandPath = path.join(brandDir, 'brand.ts');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require(brandPath) as { default: BrandConfig };
  const brand = mod.default;
  const nameOverride = (process.env.BRAND_NAME || process.env.DETOUR_BRAND_NAME || '').trim();
  if (nameOverride) return { ...brand, name: nameOverride };
  return brand;
}

const { dir: brandDir } = resolveBrandDir();
const brand = loadBrand(brandDir);
const iconSvg = path.join(brandDir, 'icon.svg');
const tokensCss = path.join(brandDir, 'tokens.css');
const partnerLogo = path.join(brandDir, 'partner-logo.svg');
const partnerLogoUrl = existsSync(partnerLogo) ? partnerLogo : '';
const nativeHostName = brand.nativeHostName?.trim() || DEFAULT_NATIVE_HOST_NAME;

if (!existsSync(iconSvg)) {
  throw new Error(`Brand icon missing: ${path.relative(root, iconSvg) || iconSvg}`);
}
if (!existsSync(tokensCss)) {
  throw new Error(`Brand tokens missing: ${path.relative(root, tokensCss) || tokensCss}`);
}

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/auto-icons'],
  outDir: `.output/${brand.slug}`,
  autoIcons: {
    // Path is resolved relative to srcDir by the module.
    baseIconPath: path.relative(path.join(root, 'src'), iconSvg),
    developmentIndicator: false,
  },
  zip: {
    name: brand.slug,
    artifactTemplate: '{{name}}-{{packageVersion}}-{{browser}}{{modeSuffix}}.zip',
    excludeSources: [
      '**/.env',
      '**/.env.*',
      '**/*.pem',
      '**/*.p12',
      '**/credentials/**',
      '**/secrets/**',
      '**/.wxt/**',
      '**/brands/rogers/**',
    ],
  },
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: brand.name,
    short_name: brand.shortName,
    description: brand.description,
    // Stable unpacked Chromium id (public key only — ADR-029). Omit on Firefox.
    // CWS rejects packages that include manifest `key` — strip for store zips
    // (`pnpm zip` sets DETOUR_OMIT_CHROMIUM_MANIFEST_KEY=1). Keep for serve/build
    // so local unpacked + OS packs retain a stable extension id.
    ...(browser !== 'firefox' &&
    brand.chromiumManifestKey &&
    process.env.BRAND_OMIT_CHROMIUM_MANIFEST_KEY !== '1' &&
    process.env.DETOUR_OMIT_CHROMIUM_MANIFEST_KEY !== '1'
      ? { key: brand.chromiumManifestKey }
      : {}),
    // auto-icons fills `icons`; also set action.default_icon so the toolbar
    // never falls back to Chrome's letter glyph when icons/ is present.
    // default_title is re-applied in build:manifestGenerated — WXT copies
    // popup/index.html <title> over action.default_title after this object merges.
    action: {
      default_title: brand.name,
      default_icon: {
        16: 'icons/16.png',
        32: 'icons/32.png',
        48: 'icons/48.png',
        128: 'icons/128.png',
      },
    },
    permissions: [
      'declarativeNetRequest',
      'storage',
      'unlimitedStorage',
      'scripting',
      'alarms',
      ...(browser === 'firefox' ? [] : ['userScripts', 'debugger', 'declarativeNetRequestFeedback']),
    ],
    host_permissions: ['<all_urls>'],
    sandbox: {
      pages: ['api-script-sandbox.html'],
    },
    // Chromium enterprise policy schema for org license keys (licensing.md / ADR-032).
    ...(browser !== 'firefox' ? { storage: { managed_schema: 'managed_schema.json' } } : {}),
    ...(browser === 'firefox'
      ? {
          optional_permissions: [
            'userScripts',
            'webRequest',
            'webRequestBlocking',
            'webRequestFilterResponse',
            'nativeMessaging',
            'notifications',
            'cookies',
            'identity',
          ],
          browser_specific_settings: {
            gecko: {
              // AMO id for Overwire (legacy detour@protovoid.com only via external BRAND_DIR packs).
              id: brand.slug === 'detour' ? 'detour@protovoid.com' : 'overwire@protovoid.com',
              strict_min_version: '128.0',
              data_collection_permissions: { required: ['none'] },
            },
          },
        }
      : {
          minimum_chrome_version: '120',
          optional_permissions: ['nativeMessaging', 'notifications', 'cookies', 'identity'],
        }),
  }),
  // Popup HTML <title> becomes action.default_title — re-apply brand.name after WXT merge.
  hooks: {
    'build:manifestGenerated': (_wxt, manifest) => {
      manifest.action ??= {};
      manifest.action.default_title = brand.name;
    },
  },
  vite: () => ({
    define: {
      'import.meta.env.BRAND': JSON.stringify({
        name: brand.name,
        shortName: brand.shortName,
        slug: brand.slug,
        defaultTheme: brand.defaultTheme,
        nativeHostName,
      }),
      // Emitted as a file URL only when the optional partner mark exists (never invent trademarks).
      'import.meta.env.PARTNER_LOGO_URL': JSON.stringify(
        partnerLogoUrl ? `/@fs/${partnerLogoUrl}` : '',
      ),
      // Public Ed25519 SPKI only (base64url/base64). Never bake a private signing key.
      'import.meta.env.LICENSE_VERIFY_PUBLIC_KEY': JSON.stringify(
        (process.env.LICENSE_VERIFY_PUBLIC_KEY || process.env.BRAND_LICENSE_VERIFY_PUBLIC_KEY || '').trim(),
      ),
    },
    resolve: {
      alias: {
        'virtual:brand-tokens': tokensCss,
        '@brand': brandDir,
      },
    },
  }),
});
