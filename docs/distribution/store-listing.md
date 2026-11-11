# Store listing

Manual submission only. CI does not call the Chrome, Edge, or Firefox publish APIs.

**Listing title (≤45):** Overwire — HTTP Override, Redirect & Mock  
**Short description (≤132):** Redirect requests, modify headers, mock fetch/XHR, inject JS/CSS, and replace bodies locally. Free open-source Chrome extension.  
**Installed name** (manifest, Overwire brand): Overwire  
**Package Title/Summary from package:** same as `manifest.name` (`Overwire`) after uploading the Overwire store zip — distinct from the longer **Listing title** paste above.  
**Store zip (rebrand upload):** `extension/.output/overwire/overwire-0.1.3-chrome.zip` (version **0.1.3**; past live 0.1.2 — see [CWS-SUBMIT.md](CWS-SUBMIT.md))  
**Category:** Developer Tools  
**Language:** English  
**Homepage:** https://overwire.protovoid.com/  
**Support URL:** https://overwire.protovoid.com/support/  
**Privacy policy URL:** https://overwire.protovoid.com/privacy/  
**Source:** https://github.com/proto-void/overwire  
**Support email:** overwire@protovoid.com

Character counts (verify before paste): title **41**; short description **128**.

Live CWS item id stays `jfgbokgdgpjhkciooicmbdgablgkklmn` (in-place upgrade; Chromium key/ids unchanged). Dashboard slug may still show `detour` until Google refreshes after the title change — that is expected. Do **not** unpublish/rollback to change the package title; upload **0.1.3** on the same id.

Use this copy so reviewers treat the product as **Overwire**, not the unrelated “Detour” proxy add-on (`detour-proxy` on AMO). Confirm the final URL slug in the dashboard after the listing title save (ADR-031).

## Description (paste)

Overwire is a free, open-source Chrome extension to redirect requests, modify headers, mock fetch and XHR, inject JS or CSS, and replace response bodies — so you can point production URLs at localhost or mock code while you debug.

Everything runs in your browser. Rules stay on your device. There is no account, no Overwire cloud, and no Overwire server in the middle.

### What it does

- **Redirect requests** — map production scripts, APIs, or hosts to localhost or another origin
- **Modify request and response headers** — add, rewrite, or strip headers on matched URLs
- **Block URLs** — stop selected requests from loading
- **Inject JS or CSS** — drop in debug scripts or styles on matched pages
- **Mock fetch / XHR** — stub API responses without a proxy appliance
- **Replace response bodies** — swap response content locally after you allow it

### Privacy

Overwire is local-only. Your rules, mocks, and match log do not leave the browser via Overwire. There is no telemetry product and no SaaS sync.

On Chrome, body override uses the debugger API only after you click **Allow debugger**. On Firefox it uses response filtering, only after you allow that permission.

### Open source

MIT license. Source and docs: https://github.com/proto-void/overwire  
Product site: https://overwire.protovoid.com/  
Help & Community: https://overwire.protovoid.com/support/

### Not a proxy or SaaS

Overwire is a developer tools extension for rewriting requests and page resources in-browser. It is **not** a VPN, traffic proxy, or hosted cloud service. It is unrelated to any “Detour” proxy add-on on other stores. (Earlier store builds used the name Detour; this listing is the same extension id, rebranded in place.)

## Chrome Web Store

**Submit packet (paste-ready):** [CWS-SUBMIT.md](CWS-SUBMIT.md) — zip path, dialog→tab map, listing fields, every permission + remote-code justification, screenshot checklist, and dashboard steps. Prefer that file over copying piecemeal from here when clearing an “Unable to publish” dialog.

1. Build the **Overwire** store zip (omit private key):  
   `cd "/Users/hamzakhan/overwire" && BRAND=overwire corepack pnpm --filter @overwire/extension zip`  
   (`DETOUR_BRAND=overwire` still works.)
2. Upload `extension/.output/overwire/overwire-<version>-chrome.zip` in the [developer dashboard](https://chrome.google.com/webstore/devconsole) for item `jfgbokgdgpjhkciooicmbdgablgkklmn`.
3. **Privacy practices first:** single purpose, all permission justifications (including optional + remote code), data-usage certification → **Save Draft**. Full paste blocks: [CWS-SUBMIT.md](CWS-SUBMIT.md); table: [permissions.md](permissions.md).
4. **Store listing:** paste **title**, **short description**, and **detailed description** above; Category **Developer Tools**; Language **English**; Privacy policy **https://overwire.protovoid.com/privacy/**; Homepage **https://overwire.protovoid.com/**; Support **https://overwire.protovoid.com/support/** · source **https://github.com/proto-void/overwire**; screenshots + store icon per [store-assets/README.md](store-assets/README.md) → **Save Draft**.
5. Submit for review (Hamza only — agents prepare zip + docs, they do not upload).

Host permission `<all_urls>` and the `debugger` permission will get extra review. The justifications are written for that.

## Edge Add-ons

Use the **same Chromium zip** as Chrome (`overwire-<version>-chrome.zip`). Submit in [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview). Same listing copy and privacy URL.

## Firefox AMO

1. `BRAND=overwire corepack pnpm --filter @overwire/extension zip:firefox` (from repo root, or `cd extension && …`).
2. Upload `overwire-<version>-firefox.zip` and the sources zip at [addons.mozilla.org](https://addons.mozilla.org/developers/).
3. Overwire packs gecko id `overwire@protovoid.com`. Confirm the packaged id in the zip. Minimum Firefox is 128. Helper install also allows legacy `detour@protovoid.com` for upgrade continuity.
4. Data collection: none (`data_collection_permissions.required` is `none`).
5. Use the same listing title and the privacy policy URL.

## Not in this repo

Automating upload would need secrets in GitHub Actions, not in files. Do not add them until you decide to publish from CI:

| Store | Secret names the publisher CLI expects |
|-------|----------------------------------------|
| Chrome | `CHROME_EXTENSION_ID`, plus a service-account client email and private key (or a short-lived access token) |
| Edge | `EDGE_PRODUCT_ID`, `EDGE_CLIENT_ID`, `EDGE_API_KEY` |
| Firefox | `FIREFOX_JWT_ISSUER`, `FIREFOX_JWT_SECRET`, extension id `overwire@protovoid.com` (or transitional `detour@protovoid.com`) |

`wxt` exposes `wxt-publish-extension` for that later step. This slice does not call it. GitHub Release zips need no extra secret.
