# Brand template

Copy this folder for an external white-label build via `BRAND_DIR` (absolute path).
Do **not** commit private partner brands into this public MIT repo. Do not revive Rogers.
There is no in-tree Detour flavor — sole product brand is `brands/overwire/`.

Required files:

- `brand.ts` — export default `{ name, shortName, description, slug, defaultTheme }`
- `tokens.css` — CSS variables for light/dark (see `brands/overwire/tokens.css`)
- `icon.svg` — toolbar / store icon source for `@wxt-dev/auto-icons`
- `logo.svg` — header wordmark (optional but recommended)
- `mark.svg` — compact mark tile (optional)

Optional:

- `partner-logo.svg` — co-brand lockup in options/popup header
- `fonts/` — licensed font files referenced from `tokens.css` (do not commit proprietary fonts to a public repo)

Build with:

```bash
BRAND_DIR=/absolute/path/to/brand corepack pnpm --filter @overwire/extension zip
```

Partner identity (if any) lives in tokens/icons/`partner-logo.svg`, not a forked product title unless `BRAND_NAME` is set. `DETOUR_*` env aliases still work for one release.
