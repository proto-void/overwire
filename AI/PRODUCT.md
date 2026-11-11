# Product strategy (locked)

**Last verified:** 2026-11-11

## Product

**Overwire** (formerly Detour) — free, MIT, open-source resource override and local developer workbench for modern browsers. Help developers **point production at their local (or mock) code** without a proxy appliance or paid SaaS — plus API Tester and Databases in the same extension.

## Brand

- **Name:** Overwire (full: Overwire Workbench)
- **Former name:** Detour (no in-tree brand flavor; storage schema + Chromium ids unchanged for upgrade)
- **Mark:** Concept A Bypass Arc (LOCKED 2026-11-09) — see ADR-031
- **Tagline:** “Point production at your code.”
- **License:** MIT
- **Domain:** `https://overwire.protovoid.com` (canonical). Legacy `detour.protovoid.com` taken down 2026-11-11 (detached from Worker `detour-web`, DNS NXDOMAIN, **no** 301/302)
- **GitHub:** `proto-void/overwire` (web: `proto-void/overwire-web`; old `detour` / `detour-web` names redirect)
- **Business model:** Free forever for **core**; optional Pro/Team via offline Ed25519 license keys (ADR-032) — **$0** recurring app-ops (no Overwire-hosted user database)
- **Build brand:** sole in-tree pack `extension/brands/overwire/`. `BRAND=detour` rejected. Runtime legacy fallbacks (`com.detour.db`, `detour:resync`, `detour-*` scripts, Detour export import) stay for zero data-loss. Do not revive Rogers.

## Developer workbench: API Tester + Databases

Beyond rule engines, Overwire ships in-extension developer tools that stay free, MIT, and account-free for core:

- **API Tester** — send HTTP / WebSocket / SSE from the options page; collections/folders; OAuth/SigV4/Digest; see which rules apply ([api-client](specs/api-client.md) A–C Done).
- **Databases** — connect to local or production databases via a self-managing native-messaging helper; query collections; production safety rails ([db-client](specs/db-client.md) Approved; Slices A–D shipped).

These widen the product past “point production at your code” into a local workbench. They must not introduce an Overwire backend, paid SaaS for core, or accounts.

## Architecture (tiered engines)

```
Rules → RuleCompiler → Core DNR | Inject scripting | Mock fetch/XHR
                     | Deep chrome.debugger | FF filterResponseData | Local Bridge CLI
```

| Tier | Engine | Role |
|------|--------|------|
| Core | declarativeNetRequest (DNR) | Redirect, header modify, block — default path |
| Inject | `chrome.scripting` / content scripts | Page JS/CSS inject |
| Mock | fetch/XHR patch (page world) | API mock responses without full body rewrite |
| Deep | `chrome.debugger` (Chromium) | Body override / advanced cases Core can't do |
| Firefox body | `filterResponseData` (where available) | Response body transform on Firefox |
| Local Bridge | Node CLI | Serve local folder / editor workflow over loopback |

## UX principles

- **Popup-first** quick toggles; full workspace in options/side panel
- **Recipes** — shareable starter rule packs (Vite, SPA fallback, CORS headers, etc.)
- **Rule tester** — paste a URL; show which rule wins (RO todo.txt wish)
- **RO import** — import Resource Override export formats where feasible
- **Dark default** UI (Overwire tokens: neon orange accent + green applied)

## Stack (planned)

WXT + TypeScript + Svelte 5 + CodeMirror 6 + valibot; Node CLI for Local Bridge. See [DECISIONS.md](DECISIONS.md) ADR-001.

## Distribution

- Chrome Web Store / Edge / Firefox AMO / optional Safari later
- GitHub releases for unpacked / CLI
- No account required
- CWS continuity: same Chromium extension ids as Detour for in-place upgrade (ADR-031)

## Hard nos

- No Overwire-hosted backend or mandatory cloud sync for core
- No paid SaaS dependency for core features
- No shipping user rule bodies / file contents as telemetry
- Do not market around gambling, adult, crypto, or politics
- No `extension/` or `cli/` implementation until module specs are **Approved**
- No license feature gates until `licensing` spec is **Approved** (ADR-032)

## V1 intent (high level)

See [specs/000-capability-map.md](specs/000-capability-map.md). Exact acceptance criteria live in specs under `AI/specs/`. Rebrand / monetization / DB perf checklist: [plans/041-overwire-rebrand-monetization-perf.md](plans/041-overwire-rebrand-monetization-perf.md).
