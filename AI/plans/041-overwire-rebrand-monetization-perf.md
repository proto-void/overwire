# Plan 041 — Overwire rebrand, monetization, DB big-data & popup fix (foundation + checklist)

**Status:** In Progress (2026-11-10)  
**Authority:** Cursor master plan `mockroute_rebrand_+_db_safety_+_popup_fix_c7bfb844` + Hamza “Go” for foundation assets.  
**Related:** ADR-031 (Overwire identity), ADR-032 (Ed25519 offline licensing), ADR-033 (DB big-data). Supersedes product-name stance in ADR-003 (kept historical).

## Goal

Rebrand Detour → **Overwire** (mark LOCKED: Concept A Bypass Arc), document zero-loss migrations and repo/folder rename runbooks, sketch MIT + Pro/Team offline licensing and Databases big-data architecture, then execute remaining pillars without colliding with sibling streams (DB/popup, `/support/` page).

## Foundation wave (this delivery)

Owned by the foundation agent. Do **not** `mv` parent folders or rename GitHub remotes in this wave.

- [x] Author this plan + index in `AI/plans/README.md`
- [x] ADRs in `AI/DECISIONS.md` (identity, Bypass Arc, rename intent, neutral IDs, Ed25519 licensing sketch, DB big-data)
- [x] Ship `extension/brands/overwire/` (brand.ts, tokens.css dark + WCAG AA light, icon/logo/mark.svg Bypass Arc only)
- [x] Web brand SVGs under detour-web `public/brand/` + favicon; OG 1200×630 when tooling allows
- [x] Update `AI/PRODUCT.md`, `AI/PROGRESS.md`, intelligence brand/naming facts (`write-back-kb`)
- [x] Build `DETOUR_BRAND=overwire` zip → `extension/.output/overwire/overwire-0.1.2-chrome.zip`
- [x] Default build brand remains `detour` until explicit cutover (documented below)

## Out of scope (foundation wave)

- [x] **m-repo-folder-workspace:** GitHub rename + remote retarget + URL sweep + `overwire.code-workspace` + local `mv` to `/Users/hamzakhan/overwire` and `/Users/hamzakhan/Project/overwire-web` (2026-11-10; see [docs/ops/local-folder-rename.md](../../docs/ops/local-folder-rename.md))
- **b-ext-identifiers** full sweep (defer; avoid sibling DB/popup files)
- **c-cli-helper**, **d-monorepo-names** full sweeps (checklist only unless zero-collision stretch)
- [x] **e-monetization-core** (Approved `licensing.md` 2026-11-10): `verify.ts` + tests, background refresh, LicenseBadge/Modal, Options/Popup pills; MIT core ungated; Stripe live deploy still ops
- **f–j** DB safety / big-data / popup (sibling)
- **support-page** body under `src/pages/support/**` (sibling)
- **l-cws-publish-runbook** actual CWS publish (document only)
- Concept B/C logos; Rogers revival

## Default brand (cutover done 2026-11-10)

- Build-time `BRAND` / `DETOUR_BRAND` default is **`overwire`**.
- Legacy Detour flavor: `BRAND=detour` → `extension/brands/detour/`.
- Cutover gated on CWS Overwire listing submit + identifier follow-ups (A2) — both done.
- Do not revive Rogers / `zip:rogers`.

## Canonical naming map

| Surface | Value |
|---------|--------|
| Product | Overwire (full: Overwire Workbench) |
| CWS title (≤45) | `Overwire — HTTP Override, Redirect & Mock` |
| Domain | `https://overwire.protovoid.com` |
| Support email | `overwire@protovoid.com` |
| GitHub | `proto-void/overwire`, `proto-void/overwire-web` |
| Packages (target) | root `overwire`, `@overwire/extension`, `@overwire/cli` |
| Native host (target) | `com.overwire.db` (read-fallback `com.detour.db`) |
| Chromium ids | Keep existing key + unpacked/CWS ids (in-place upgrade) |
| Firefox gecko (target) | `overwire@protovoid.com` |
| Storage keys | Unchanged (`workspace`, `apiCollections`, `dbConnections`, …) |

## Visual system — Concept A Bypass Arc (LOCKED 2026-11-09)

- Metaphor: horizontal network wire; neon-orange override arc jumps over muted/dashed production segment; lands on live green terminal node.
- Colors: accent `#FF6B00` (dark), light accent `#C2410C` (AA text on white), applied `#00FF66`, bg `#0B0F19`.
- Rejected: Concept B Spliced Wire, Concept C Switch Gate — do not ship.
- Assets: `icon.svg` (tile), `mark.svg` (glyph), `logo.svg` (mark + wordmark).

## Neutral internal identifiers (checklist — later wave)

Zero data loss: keep top-level `chrome.storage.local` keys. Migrate with legacy read-fallbacks.

- [x] `applyDetourRules` → `applyRules` (accept legacy on read)
- [x] `ALARM_PREFIX` → `overwire-api-run:` (accept `detour-api-run:`)
- [x] `USER_SCRIPT_PREFIX` → `overwire-` (unregister legacy `detour-*` on update)
- [x] Status `'detour-off'` → `'off-global'`
- [x] MIME / postMessage / export filenames → overwire; import both envelopes
- [x] One-time upgrade banner via `overwireRebrandSeen`
- [x] **Follow-up (Wave 1 A2, 2026-11-10):** content-script / page ids → `overwire-bridge`, `overwire-mock`, `overwire-sri` (+ meta `overwire-sri`, message `overwire:resync`); unregister legacy `detour-*` on every sync; MAIN hook prefers new meta, falls back to `detour-sri` once

**Collision note:** do not edit `Databases.svelte`, `DbResultsPane.svelte`, `JsonTreeView.svelte`, `db-client/storage.ts`, `db-client/protocol.ts`, `popup/main.ts` while sibling owns f–j.

## CLI / monorepo rename (checklist — Wave 2 done 2026-11-10)

- [x] `@overwire/cli` + bins `overwire`, `overwire-db-host` (+ `detour` shim one release)
- [x] Pack names `overwire-<ver>-<os>-<arch>.zip`; helper dirs Overwire; keychain + dual NM host with `com.detour.db` fallback
- [x] Root package `overwire`; CI / bump-version / docker-compose / `.output/<brand>` / AGENTS dual-brand DoD
- [x] Neutral `BRAND_*` env with `DETOUR_*` fallback during transition (default brand now `overwire`)

## Monetization (ADR-032 — spec before code)

Core MIT features stay free forever, local-only, account-free. Paid tiers via offline Ed25519 license `OWPRO.<payload>.<sig>` verified with WebCrypto; no phone-home DB.

- [x] `AI/specs/licensing.md` **Approved** (Hamza, 2026-11-10)
- [x] Non-gating Worker template `detour-web/workers/license-webhook/` (env placeholders only; no secrets; email stub)
- [x] **e-monetization-core:** `extension/src/licensing/verify.ts` + unit tests, background refresh, LicenseBadge/LicenseModal, Options header + Popup footer pills (2026-11-10). MIT core stays free; `isProUnlocked`/`isTeamUnlocked` helpers for later CTAs
- [ ] Stripe Payment Links + live webhook deploy (ops; after Hamza ask) + bake `LICENSE_VERIFY_PUBLIC_KEY` into builds
- [ ] Tier matrix upgrade CTAs on Pro/Team-only surfaces (fail open; use licensing helpers)

## DB big-data architecture (ADR-033 — Wave 1 f–j shipped 2026-11-10)

- [x] Strip `resultSets` rows from `chrome.storage.local` persist
- [x] Virtualize `DbResultsPane` (~35 DOM rows) + single-pass `formatDbCell` + CSS-var column resize
- [x] Chunk progress + elapsed timer + cancel; session-cached `setKeyspace`
- [x] Paginate `JsonTreeView`; `$derived` drawer payload formatting

## Website / SEO / CWS (partially sibling)

- [ ] Domain + Worker 301 `detour.protovoid.com` → `overwire.protovoid.com` — **DNS gate clean** (re-probed 2026-11-10: dig A/AAAA + curl HTTP/2 200 both hosts). **Still human-deferred** (premature Worker was deleted earlier; dual-host `detour-web` kept). Deploy only on explicit Hamza cutover ask.
- [x] `site.config` / SEO / brand assets (foundation + Wave 2)
- [x] `/support/` content
- [x] protovoid.com product card → Overwire
- [x] CWS listing **docs/runbook** + **0.1.3** Overwire zip — **Submitted for review** (Hamza, 2026-11-10)
- [x] Default build brand cutover to `overwire` (2026-11-10; dual-brand zip DoD: default overwire + `BRAND=detour` legacy)
- Changelog / release-notes / overwire-web `/changelog/` — **sibling owns** (do not edit from this stream)

### CWS publish runbook (Hamza dashboard — Submit DONE 2026-11-10)

1. ~~Build Overwire store zip~~ → `extension/.output/overwire/overwire-0.1.3-chrome.zip` (no manifest `key`).
2. ~~Paste listing~~ from [CWS-SUBMIT.md](../../docs/distribution/CWS-SUBMIT.md).
3. ~~Upload zip; Submit for review~~ (human). Keep Chromium key/ids for in-place upgrade.
4. OS helper packs: macos-arm64 local pack exists; other hosts via CI matrix.
5. After approval: optional YouTube promotional video URL; Search Console sitemap; Edge/AMO later.

## Rename runbook — repos, folders, workspace (m-repo)

**GitHub (done 2026-11-10):** `proto-void/detour` → `proto-void/overwire`, `proto-void/detour-web` → `proto-void/overwire-web`. Remotes retargeted; clone/badge/docs URLs swept. `overwire.code-workspace` added at monorepo root.

**Local folders (done 2026-11-10):** `/Users/hamzakhan/overwire` and `/Users/hamzakhan/Project/overwire-web`. Full step list / reopen notes: [docs/ops/local-folder-rename.md](../../docs/ops/local-folder-rename.md).

Leave alone: git history rewrite; `chrome.storage` key `workspace`; stale `~/.cursor/projects/Users-hamzakhan-Resource-Override` cache.

## Multitask-proof (foundation stream)

| Topic | Rule |
|-------|------|
| Streams | Foundation = plan/ADRs/brand/KB/site brand strings. Sibling = DB/popup. Sibling = `/support/`. Ship/rename last and solo. |
| Owned paths | `AI/plans/041-*.md`, `AI/plans/README.md`, `AI/DECISIONS.md`, `AI/PRODUCT.md`, brand sections in intelligence, `extension/brands/overwire/**`, detour-web `public/brand/**` + `favicon.svg` + `site.config.ts` brand fields |
| Leave alone | `Databases.svelte`, `DbResultsPane.svelte`, `JsonTreeView.svelte`, `db-client/storage.ts`, `db-client/protocol.ts`, `popup/main.ts`, `src/pages/support/**`, parent folder `mv`, GitHub rename |
| Shared | `PROGRESS.md` append-only; do not rewrite peer bullets |
| Sims / locks | N/A for foundation docs+brand |

## Verification (foundation)

- [x] Plan indexed; ADRs present with Last verified bumped
- [x] `extension/brands/overwire/` builds (default unset `BRAND` → overwire zip)
- [x] `BRAND=detour` still builds Detour flavor
- [x] Web Bypass Arc SVGs replace Detour marks in `public/brand/` (+ favicon); OG noted or shipped
- [x] No edits under sibling exclusive paths above
- [x] Identifier neutralization (Wave 2 b-ext-identifiers, 2026-11-10)
- [x] CLI / monorepo rename + CWS Submit + default brand cutover + local folder rename (2026-11-10)
- Remaining ops: Stripe live links, 301 on Hamza ask, CWS approval wait, changelog sibling

## Next after foundation (historical — mostly done)

Most foundation follow-ons shipped. Remaining: await CWS approval, optional 301, Stripe live wiring, changelog sibling, Windows/VPN Cassandra smokes.
