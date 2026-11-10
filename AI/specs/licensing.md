# Spec: licensing

**Status:** Approved  
**Last updated:** 2026-11-10  
**Approved by:** Hamza (2026-11-10)  
**Build order:** 12 (after distribution + workbench modules)  
**Depends on:** [PRODUCT.md](../PRODUCT.md) hard nos; [ADR-032](../DECISIONS.md); marketing `#pricing` on overwire.protovoid.com  
**Related:** [api-client](api-client.md) (Pro load reports), [db-client](db-client.md) (Pro ER / schema diff / designer), [distribution](distribution.md) (signed helper packs remain optional paid SKU)  
**Plan:** [041-overwire-rebrand-monetization-perf.md](../plans/041-overwire-rebrand-monetization-perf.md)

> **Gate:** **Approved.** Extension may implement offline verify, LicenseBadge/LicenseModal, and Pro/Team upgrade affordances. MIT core must stay ungated forever (fail open to Community).

## Objective

Define offline, account-free optional Pro/Team licensing for Overwire so paid power tools unlock via a locally verified Ed25519 license key, while every existing MIT core feature stays free forever with **$0** Overwire-hosted user database / phone-home license server.

## User stories

- As a Community user, I keep all network rules, API Tester core, Databases query workbench, Rule Tester, Match Log, Local Bridge, and unsigned helper packs forever without an account or license key.
- As a Pro buyer, after Stripe Checkout I receive an `OWPRO.…` key by email; I paste it once in Options and unlock Pro surfaces offline.
- As a Team admin, I can push an org license via Chrome Enterprise `chrome.storage.managed` and/or distribute site-license keys without Overwire running a user DB.
- As a maintainer, a stateless Stripe webhook Worker signs keys with a private Ed25519 key held only in Worker secrets; the extension embeds only the public key.
- As a user with an invalid/expired/missing key, MIT core never locks; gated Pro/Team UI fails open to “upgrade / paste key” affordances without disabling free tools.

## Acceptance criteria

### Policy (must hold in every implementation slice)

- [x] Core MIT surface remains ungated: Core DNR redirect/headers/block, inject JS/CSS, fetch/XHR mock, debugger body override / SRI paths, Local Bridge, API Tester send/collections/auth (non–load-report), Databases connect/query/results/history/collections, Rule Tester, Match Log, unsigned OS packs.
- [x] No Overwire-hosted accounts, license database, or telemetry of rule bodies / SQL / secrets for licensing.
- [x] Invalid, expired, malformed, or absent keys never remove MIT features (fail open to Community).
- [x] Private Ed25519 signing material never commits to git; only public verify key may ship in the extension.

### Key format & offline verify (implementation after Approve)

- [x] License string: `OWPRO.<base64url-payload>.<base64url-signature>` (Ed25519 over the exact payload **segment** bytes).
- [x] Payload JSON claims at minimum: `tier` (`pro` | `team`), `iat` (unix), optional `exp`, optional `seats`, optional `features[]`, optional `email` hash or Stripe customer id reference (no secrets).
- [x] `extension/src/licensing/verify.ts` exposes `verifyLicenseKeyOffline` + `refreshLicenseState` using WebCrypto `SubtleCrypto` (Ed25519).
- [x] Persist pasted `licenseKey` and derived `licenseStatus` `{ valid, tier, claims, reason }` in `browser.storage.local`.
- [x] Prefer org key from `browser.storage.managed` when present and valid (Team/MDM).
- [x] Background hooks: call `refreshLicenseState` on service worker boot, `runtime.onStartup`, `runtime.onInstalled`, and `storage.onChanged` for `licenseKey` (and managed key if observable).

### UI (implementation after Approve)

- [x] Subtle `MIT Free` / `PRO` / `TEAM` pill (`LicenseBadge`) in Options header and Popup footer; click opens `LicenseModal`.
- [x] Modal: paste key, show offline verification result (tier, seats, expiry, feature list), link **Get Overwire Pro** → `https://overwire.protovoid.com/#pricing`.
- [ ] Pro/Team **power** surfaces only (not MIT core) may show upgrade CTAs when `licenseStatus` is not valid for that tier:
  - Databases Pro drawer: ER diagram, schema/data compare DDL, visual table designer export
  - API Tester Power: multi-worker load reports + HTML/JSON export
  - Optional `chrome.storage.sync` cross-profile rule/env sync
  - Links to signed/notarized helper installers (Community keeps unsigned packs)
  - Team: vault secret resolver, export redaction guard, managed-policy locked groups/connections

### Issuance (Worker; template may land while Draft)

- [ ] Stateless Worker under web `workers/license-webhook/` verifies Stripe `stripe-signature`, on paid Checkout/session events builds payload + signs with `LICENSE_ED25519_PRIVATE_KEY`, writes key to Stripe Customer metadata, emails buyer (Resend/Postmark/etc. via env).
- [ ] Env placeholders only in repo: `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `LICENSE_ED25519_PRIVATE_KEY`, `LICENSE_MAIL_FROM`, mail provider token — **no real secrets**.
- [ ] Marketing `#pricing` already lists Community / Pro / Team; Stripe Payment Links filled in `site.config.ts` when ready (empty = Coming soon).

## Browser support table

| Surface | Chrome / Edge (MV3) | Firefox | Notes |
|---------|---------------------|---------|--------|
| WebCrypto Ed25519 verify | P0 | P0 | Use SubtleCrypto; document if a browser build lacks Ed25519 and fall back to “unsupported — MIT free” |
| `storage.local` license state | P0 | P0 | Same keys across brands; no rename of existing workspace keys |
| `storage.managed` org key | P0 Chromium Enterprise | P2 | Firefox enterprise policy path later if needed |
| LicenseBadge / Modal | P0 | P0 | Options + Popup |
| Stripe webhook Worker | N/A (Cloudflare) | N/A | Not shipped inside the extension |

## Limits and gotchas

- **Spec gate:** Draft ≠ build authority for gates (ADR-032, `spec-workflow`).
- **Fail open:** bugs in verify must not brick the extension or MIT tools.
- **Clock skew:** treat `exp` with a small skew window; missing `exp` = non-expiring until revoked via new issuance policy (revocation lists are out of v1).
- **No phone-home:** do not periodically contact Overwire to re-check; refresh is local re-verify of the stored key.
- **Brand continuity:** Detour→Overwire storage keys for workspace/rules stay unchanged; licensing keys are additive (`licenseKey`, `licenseStatus`).
- **Prices** live on the marketing site, not hard-coded as product truth in the extension (display copy may mirror site).
- **distribution.md** still lists proprietary licensing SKUs as out of scope for *store packaging*; this module owns the optional SKU behavior once Approved.
- Stripe Payment Links and live webhook deploy are ops steps; do not invent URLs or commit secrets.

## Out of scope

- Overwire-hosted user accounts or license SQL/KV database
- Phone-home entitlement APIs or device fingerprinting
- Locking MIT core features behind paywalls
- Online license revocation list / kill-switch server (v1)
- Auto-submit of store listings or paid notarization certificates in CI
- Implementing Pro feature engines themselves beyond gate hooks (ER/diff/load-test/vault may be separate plans once this spec is Approved)

## Verification

### After Approve (e-monetization-core)

- [x] Unit tests for parse/verify (valid, bad sig, bad prefix, expired, skew, missing public key) with a **test-only** keypair generated in tests (never the production private key).
- [x] Typecheck green; background refresh does not throw on missing key.
- [x] LicenseBadge + LicenseModal; Options header + Popup footer pills; Get Overwire Pro → `#pricing`.
- [ ] Manual: paste fixture Pro key (signed with matching `LICENSE_VERIFY_PUBLIC_KEY`) → badge shows PRO; clear key → MIT Free; MIT rules/DB/API still work throughout.
- [ ] Worker: stripe-cli signed fixture event → metadata + email path in dry-run / staging (ops).
- Dual-brand zip DoD when extension code ships: default `detour` zip + `BRAND=overwire` zip paths reported.

## Implementation checklist

1. [x] Approve this spec (Hamza, 2026-11-10).
2. [x] `extension/src/licensing/verify.ts` + unit tests.
3. [x] `background.ts` refresh hooks.
4. [x] `LicenseBadge.svelte` / `LicenseModal.svelte` + Options/Popup wiring.
5. [ ] Wire upgrade CTAs on Pro/Team-only surfaces (fail open; helpers `isProUnlocked` / `isTeamUnlocked` exported).
6. [ ] Production webhook secrets + Stripe Payment Links; deploy Worker when Hamza asks.
