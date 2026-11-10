# Chrome Web Store assets checklist

Manual upload only. Build the Overwire zip first, then gather listing media.

```bash
cd "/Users/hamzakhan/overwire"
BRAND=overwire corepack pnpm --filter @overwire/extension zip
```

**Last verified:** 2026-11-10 — Overwire Bypass Arc promos + real Overwire UI screenshots (dark, `example.com` / `localhost`), 24-bit PNG no alpha, exact CWS sizes; **no promotional video** (Hamza removed the global promo MP4/poster). Competitor research only: `promo-video-brief.md`. Skip the CWS YouTube / Promotional video field for now.

## Required / strongly recommended

| Asset | Spec | Source / notes |
|-------|------|----------------|
| **Store icon** | 128×128 PNG | Prefer zip `icons/128.png` (may include alpha). Convenience copy (RGB flattened): `store-icon-128.png` in this folder. Also `extension/.output/overwire/chrome-mv3/icons/128.png` |
| **Small promo tile** | Exactly **440×280**, JPEG or **24-bit PNG (no alpha)** | Ready: `promo-small-440x280.png` (Overwire wordmark + Bypass Arc) |
| **Marquee promo tile** | Exactly **1400×560**, JPEG or **24-bit PNG (no alpha)** | Ready: `promo-marquee-1400x560.png` (Overwire wordmark + Bypass Arc) |
| **Screenshots** | Exactly **1280×800** or **640×400**, JPEG or **24-bit PNG (no alpha)** | Max 5; at least 1 required. Real Overwire UI captures below |
| **Promo video (global)** | Optional — **skip for now** | **No promo video shipped.** Do not upload a YouTube URL. Research notes only: `promo-video-brief.md` |

CWS rejects wrong pixel dimensions and PNGs with an alpha channel. Do **not** upload “≥1280×800” sources — resize/export to one of the two exact sizes first.

## Files in this folder

| File | Role |
|------|------|
| `popup.png`, `redirect.png`, `mock.png`, `log.png`, `headers.png`, `inject.png`, `body.png` | CWS-ready **1280×800** RGB 24-bit PNG (no alpha) — real Overwire dark UI |
| `*-source-2560x1800.png` | High-res backups before the CWS resize |
| `popup-portrait-800x1280.png` | Portrait popup capture (reference; not for CWS upload; raw dims may be 800×1500 @2x) |
| `promo-small-440x280.png`, `promo-marquee-1400x560.png` | Overwire Bypass Arc promo tiles (ready) |
| `promo-video-brief.md` | Competitor / peer research only — **no promo video shipped** |
| `store-icon-128.png` | Convenience 128×128 RGB flattened Bypass Arc icon for dashboard upload |

Paste-ready dashboard packet: [CWS-SUBMIT.md](../CWS-SUBMIT.md).

## Promotional video — skip for now

**No promotional video** in this folder. The prior global MP4 and poster were removed (Hamza taste). Leave Store listing → Graphic assets → **Promotional video** empty; do **not** paste a YouTube URL. Competitor research (if a future cut is approved): `promo-video-brief.md`.

## Screenshot capture notes

Regen dark-theme product shots (demo rules on `example.com` / `localhost` only) from an **Overwire** unpacked build:

```bash
cd extension
# Prefer Overwire output for rebrand shots:
# load unpacked: ../extension/.output/overwire/chrome-mv3/
CHROME=$(node scripts/install-chrome.mjs) \
  DETOUR_EXT="$(pwd)/.output/overwire/chrome-mv3" \
  DETOUR_WEB_SHOTS="/Users/hamzakhan/Project/overwire-web/public/screenshots" \
  DETOUR_STORE_ASSETS="$(pwd)/../docs/distribution/store-assets" \
  node scripts/capture-web-screenshots.mjs
```

That writes WebP+PNG to `Project/overwire-web/public/screenshots/` and copies PNGs here. For CWS upload, ensure each shot is exactly **1280×800** RGB (no alpha); pad/resize on `#0B0F19` if needed. Seed `overwireRebrandSeen: true` when capturing so the one-time Detour→Overwire banner is dismissed.

CWS upload order (highest intent first; max 5):

1. `popup.png` — Applied strip (portrait padded onto 1280×800 dark canvas)
2. `redirect.png` — Rules + redirect drawer
3. `mock.png` — Mock fetch / XHR
4. `log.png` — On-device match log
5. Optional fifth: `headers.png`, `inject.png`, or `body.png`

Tips:

- Export exactly **1280×800** (preferred) or **640×400** as **24-bit PNG with no alpha** (flatten on `#0B0F19` / `#07060d` if needed). Wrong size → “The image size is incorrect.”
- Use Overwire dark UI (default theme); avoid light theme for primary shots.
- Crop chrome browser UI if the store prefers the extension surface only.
- Do not include partner/Rogers branding, internal hostnames, or customer data in screenshots.
- Prefer `localhost` / `example.com` URLs in any visible rules.
- File names and CWS captions should describe the UI (“Redirect rules”, “Mock fetch”), not generic “screenshot1”.

## Listing copy pointers

- Title / description: [store-listing.md](../store-listing.md)
- Permission justifications: [permissions.md](../permissions.md)
- Full paste packet: [CWS-SUBMIT.md](../CWS-SUBMIT.md)
- Privacy URL: **https://overwire.protovoid.com/privacy/**
- Homepage: **https://overwire.protovoid.com/**
- Support: **https://overwire.protovoid.com/support/**
- Source: **https://github.com/proto-void/overwire**

## Out of scope here

Automating CWS upload APIs. Attach promo PNGs to this folder locally if useful; they need not be committed.
