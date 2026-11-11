# Chrome Web Store — Overwire listing + package packet

Paste-ready handoff for the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).  
Listing is already live (historically as **Detour**). This packet is the **Overwire rebrand listing copy** plus the **0.1.3** store zip used for the rebrand upload.

**Phase status:** **Submitted for review** (Hamza, 2026-11-10) — human dashboard Submit complete. Agents do **not** re-upload package/assets unless a later rejection or version bump asks for it. **No promotional video** — skip the YouTube / Promotional video field. Do **not** unpublish/rollback.

**Last verified:** 2026-11-10 — Package **0.1.3** Overwire zip + paste blocks + Bypass Arc store media; **CWS Submit done**. Promo video MP4/poster **removed** per Hamza; leave Promotional video empty. Research-only notes: `store-assets/promo-video-brief.md`.

**Live listing:** [https://chromewebstore.google.com/detail/detour/jfgbokgdgpjhkciooicmbdgablgkklmn](https://chromewebstore.google.com/detail/detour/jfgbokgdgpjhkciooicmbdgablgkklmn)  
**Store id:** `jfgbokgdgpjhkciooicmbdgablgkklmn` (keep forever for in-place upgrade; older drafts wrongly used `…abigkklmn`). Dashboard path may still say `/detail/detour/` until Google refreshes after the title change.

---

## Package (verified)

| Item                   | Value                                                                                                      |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Zip path (Overwire)** | `/Users/hamzakhan/overwire/extension/.output/overwire/overwire-0.1.3-chrome.zip`                 |
| **Version**            | `0.1.3`                                                                                                    |
| **Size**               | ~497 KB (`508690` bytes; rebuilt after default-brand cutover)                                              |
| **manifest.name**      | `Overwire` (CWS Package “Title/Summary from package” uses this — not the longer Store listing Title paste) |
| **Store icon 128×128** | Inside zip at `icons/128.png` (also `extension/.output/overwire/chrome-mv3/icons/128.png`, or flattened `docs/distribution/store-assets/store-icon-128.png`) — Bypass Arc   |
| **Privacy policy**     | [https://overwire.protovoid.com/privacy/](https://overwire.protovoid.com/privacy/) — live on dual-host (legacy [detour…](https://detour.protovoid.com/privacy/) also 200; no live 301) |
| **Homepage**           | [https://overwire.protovoid.com/](https://overwire.protovoid.com/) (legacy [detour…](https://detour.protovoid.com/) also 200; dual-host, no live 301) |
| **Support URL**        | [https://overwire.protovoid.com/support/](https://overwire.protovoid.com/support/) (Help & Community; see [support.md](support.md)) |
| **Source**             | [https://github.com/proto-void/overwire](https://github.com/proto-void/overwire) (GitHub redirects from former `proto-void/detour`) |

Detour brand flavor removed (Overwire live on CWS). Sole zip: `extension/.output/overwire/overwire-0.1.3-chrome.zip`. `BRAND=detour` is rejected.

**Package Title vs Store listing Title:** Uploading this zip makes Package “Title/Summary from package” show `**Overwire`** (`manifest.name` from `extension/brands/overwire`). The Store listing Title paste below (`Overwire — HTTP Override, Redirect & Mock`) is a separate dashboard field. To lengthen the *package* title, change `brand.name` and rebuild; do not expect the listing Title paste alone to change the package-derived title.

**CWS rejects packages that include manifest** `key`**.** `pnpm zip` sets `BRAND_OMIT_CHROMIUM_MANIFEST_KEY=1` / `DETOUR_OMIT_CHROMIUM_MANIFEST_KEY=1` so the store zip has no `key`; local `pnpm build` / `pnpm dev` still keep it for a stable unpacked id (ADR-029).

Rebuild Overwire store zip:

```bash
cd "/Users/hamzakhan/overwire"
BRAND=overwire corepack pnpm --filter @overwire/extension zip
# Confirm: unzip -p extension/.output/overwire/overwire-0.1.3-chrome.zip manifest.json | grep -E '"key"' || echo "OK: no key"
```

---

## Phase 2 — map “Unable to publish” → dashboard tabs

Clear every red bullet from that dialog using the tabs below. **Save Draft** after Privacy practices (and again after Store listing) before Submit.

| Dialog error                                   | Dashboard tab                                     | Where in this file                                                |
| ---------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------- |
| Justification: `alarms`                        | **Privacy practices** → permission justifications | [Permission justifications](#permission-justifications-paste)     |
| Justification: `cookies`                       | **Privacy practices**                             | same (optional permission)                                        |
| Justification: `debugger`                      | **Privacy practices**                             | same                                                              |
| Justification: `declarativeNetRequest`         | **Privacy practices**                             | same                                                              |
| Justification: `declarativeNetRequestFeedback` | **Privacy practices**                             | same                                                              |
| Justification: host permission use             | **Privacy practices**                             | same (`host_permissions`)                                         |
| Justification: `identity`                      | **Privacy practices**                             | same (optional)                                                   |
| Justification: `nativeMessaging`               | **Privacy practices**                             | same (optional)                                                   |
| Justification: `notifications`                 | **Privacy practices**                             | same (optional)                                                   |
| Justification: remote code use                 | **Privacy practices**                             | [Remote code use](#remote-code-use-paste)                         |
| Justification: `scripting`                     | **Privacy practices**                             | [Permission justifications](#permission-justifications-paste)     |
| Justification: `storage`                       | **Privacy practices**                             | same                                                              |
| Justification: `unlimitedStorage`              | **Privacy practices**                             | same                                                              |
| Justification: `userScripts`                   | **Privacy practices**                             | same                                                              |
| Single purpose description                     | **Privacy practices**                             | [Single purpose](#single-purpose-privacy-practices--paste)        |
| Data Usage Certification                       | **Privacy practices**                             | [Data usage certification](#data-usage-certification)             |
| Screenshots / video missing                    | **Store listing** → media                         | [Screenshots](#screenshots-phase-1)                               |
| Icon image missing                             | **Store listing** → icon                          | [Store icon](#store-icon)                                         |
| Language not selected                          | **Store listing**                                 | [Listing fields](#listing-fields-store-listing--paste) → Language |
| Category not selected                          | **Store listing**                                 | same → Category                                                   |
| Detailed description too short / missing       | **Store listing**                                 | same → Detailed description                                       |

**Suggested order**

1. **Privacy practices** — paste single purpose, every permission justification (including optional + remote code), tick Data Usage Certification → **Save Draft**.
2. **Store listing** — category, language, title/short/detailed description, homepage, privacy URL, support email, screenshots, store icon → **Save Draft**.
3. **Package** (if not already) — upload the zip from the table above.
4. **Distribution** → Submit for review.

---

## Listing fields (Store listing — paste)

### Title (≤45) — **41 chars**

```
Overwire — HTTP Override, Redirect & Mock
```

### Short description (≤132) — **128 chars**

```
Redirect requests, modify headers, mock fetch/XHR, inject JS/CSS, and replace bodies locally. Free open-source Chrome extension.
```

### Category

`Developer Tools`

### Language

`English`

### Homepage URL

```
https://overwire.protovoid.com/
```

### Privacy policy URL

```
https://overwire.protovoid.com/privacy/
```

### Support URL

```
https://overwire.protovoid.com/support/
```

### Support / contact email

```
overwire@protovoid.com
```

### Detailed description (paste)

```
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
```

## Sources: [store-listing.md](store-listing.md).

## Single purpose (Privacy practices — paste)

```
Help developers redirect and override requests and page resources while they debug — rules stay on the device.
```

---

## Data usage certification

## On **Privacy practices**, check the box that you certify data usage complies with the [Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/). Overwire does not collect or transmit user browsing data or rule bodies to Overwire servers; see the privacy policy URL above.

## Permission justifications (paste)

Use these on the **Privacy practices** tab. CWS asks for a justification for every permission in the package — **including optional permissions that are unused until the user grants them**.

| Permission                      | Install vs optional | Why it is in the package                                                            | When it runs                                                                          |
| ------------------------------- | ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `declarativeNetRequest`         | Install             | Redirect, modify headers, and block matching requests                               | While Overwire is on and a rule compiled to DNR is enabled                            |
| `declarativeNetRequestFeedback` | Install             | Toolbar badge and the on-device match log (Chromium). No install warning            | While the badge or log is in use. Log stores a rule label and URL, not the rule body  |
| `storage`                       | Install             | Save the rule workspace, on/off switch, theme, and apply report on this device      | On edit and on browser start                                                          |
| `unlimitedStorage`              | Install             | Workspaces can hold inline scripts, CSS, and mock bodies the user typed             | Only for that local data                                                              |
| `scripting`                     | Install             | Inject the packaged page bridge and CSS the user wrote                              | When an inject or mock rule is enabled                                                |
| `alarms`                        | Install             | Schedule API Tester collection runs while Chrome is open                            | Only when the user enables a schedule in API Tester                                   |
| `userScripts`                   | Install (Chrome)    | Run **user-written** inline JS after Chrome’s “Allow user scripts”                  | Only after that grant, and only while an inline JS rule is enabled                    |
| `host_permissions: <all_urls>`  | Install             | Match whatever host the developer is debugging                                      | While a matching rule is enabled. Not used to upload browsing history                 |
| `debugger`                      | Install (Chrome)    | Replace a response body in place (MV3 has no other API)                             | Only after **Allow debugger**, only on matching http(s) tabs. Install does not attach |
| `nativeMessaging`               | Optional            | Talk to the optional local Databases helper on the user’s machine                   | Only after the user grants it (Databases tab); never talks to Overwire cloud          |
| `notifications`                 | Optional            | Optional OS notify when a scheduled API Tester run has failures                     | Only after grant, and only if the schedule has notify-on-fail                         |
| `cookies`                       | Optional            | Optional API Tester cookie jar (view/edit cookies for a domain the user is testing) | Only after grant on first cookie-jar use                                              |
| `identity`                      | Optional            | API Tester OAuth authorization-code + PKCE via `launchWebAuthFlow`                  | Only after grant when the user starts that OAuth flow                                 |

### Paste-ready justification paragraphs

Copy each block into the matching CWS field.

**alarms:** Used only for API Tester scheduled collection runs the user configures. `chrome.alarms` fires while the browser is open; schedules do not run when Chrome is quit. No browsing telemetry.

**cookies:** Optional. Requested only when the user opens the API Tester cookie jar. Used to view and edit cookies for domains the developer is testing in API Tester — not to scrape or upload the user’s general browsing cookies. Unused until granted.

**debugger:** Used only to replace a response body in place (MV3 has no other API for that). The extension does not read the original body. Attach happens only after the user clicks **Allow debugger**, and only on http(s) tabs that match a body rule. Install does not attach. Chrome shows its own debugging indicator while attached. Not used for screenshots, cookies export, or remote control.

**declarativeNetRequest:** Used to redirect, modify headers, and block matching requests while Overwire is on and a rule compiled to DNR is enabled. Local rules only; nothing is sent to an Overwire server.

**declarativeNetRequestFeedback:** Powers the toolbar badge and the on-device match log. The log stores a rule label and URL, not the rule body. No install warning.

**host_permissions (**`<all_urls>`**):** Required so a developer tool can match whatever host they are debugging. Redirect and header changes need access to the request URL and the page that started it; injection needs the page. Used only while a matching rule is enabled — not used to upload browsing history. Rules are not limited to one site in advance.

**identity:** Optional. Used only for API Tester OAuth 2.0 authorization-code + PKCE via `chrome.identity.launchWebAuthFlow` when the user starts that flow. Not used for Google account sign-in to Overwire (there is no Overwire account). Unused until granted.

**nativeMessaging:** Optional. Used only to connect to a local native messaging host the user installs for the Databases tab (queries run on-device). Overwire does not ship database traffic through an Overwire server. Unused until the user grants it on first Databases use.

**notifications:** Optional. Used only to show an OS notification when a scheduled API Tester run fails and the user enabled notify-on-fail. Unused until granted.

**scripting:** Injects the packaged page bridge and CSS the user wrote when an inject or mock rule is enabled.

**storage:** Saves the rule workspace, on/off switch, theme, and apply report on this device (on edit and on browser start).

**unlimitedStorage:** Workspaces can hold inline scripts, CSS, and mock bodies the user typed — local data only.

**userScripts:** Runs user-written inline JS only after the user allows user scripts, and only while an inline JS rule is enabled.

### Remote code use (paste)

CWS asks for a remote-code justification separately from API permissions.

```
Overwire does not load or execute code from Overwire-operated servers. Packaged page-bridge and mock-runtime scripts ship inside the extension. Inline inject JS uses chrome.userScripts only after the user enables “Allow user scripts,” and only for code the user authored in their rules. Optionally, a user may configure an inject JS/CSS rule with a URL they typed; that URL is fetched at apply time from the origin they specified (often localhost), not from Overwire. There is no userscript marketplace and no remote code from Overwire by default.
```

**Additional notes for reviewers:** Turning Overwire off clears active rules and does not register page scripts. Body override stays off until the user opts in (`bodyEngineConsent`). There is no account and no Overwire cloud. Optional permissions (`nativeMessaging`, `notifications`, `cookies`, `identity`) remain unused until the user grants them for the feature that needs them.
Source: [permissions.md](permissions.md).

---

## Screenshots (Phase 1)

Product PNGs live under `docs/distribution/store-assets/` (demo-safe `example.com` / `localhost` rules, dark UI). Promo tiles do **not** replace screenshots.

### CWS media rules (dashboard)

- **Screenshots:** exactly **1280×800** or **640×400**; JPEG or **24-bit PNG (no alpha)**; max 5; at least 1 required.
- **Small promo:** exactly **440×280** (same format rules).
- **Marquee promo:** exactly **1400×560** (same format rules).
- Wrong pixel size → **Error: The image size is incorrect.** Alpha PNG → reject. Do **not** upload “≥1280×800” sources.

### Ready files (upload order = CTR)

| Order | File           | Size                            | Caption                                |
| ----- | -------------- | ------------------------------- | -------------------------------------- |
| 1     | `popup.png`    | **1280×800** RGB PNG (no alpha) | `Popup with Applied strip`             |
| 2     | `redirect.png` | **1280×800** RGB PNG (no alpha) | `Redirect rules`                       |
| 3     | `mock.png`     | **1280×800** RGB PNG (no alpha) | `Mock fetch / XHR`                     |
| 4     | `log.png`      | **1280×800** RGB PNG (no alpha) | `On-device match log`                  |
| —     | `headers.png`  | **1280×800** RGB PNG (no alpha) | `Modify headers` (optional 5th)        |
| —     | `inject.png`   | **1280×800** RGB PNG (no alpha) | `Inject JS / CSS` (optional 5th)       |
| —     | `body.png`     | **1280×800** RGB PNG (no alpha) | `Replace response body` (optional 5th) |

Absolute paths (primary four):

1. `/Users/hamzakhan/overwire/docs/distribution/store-assets/popup.png`
2. `/Users/hamzakhan/overwire/docs/distribution/store-assets/redirect.png`
3. `/Users/hamzakhan/overwire/docs/distribution/store-assets/mock.png`
4. `/Users/hamzakhan/overwire/docs/distribution/store-assets/log.png`

High-res backups: `*-source-2560x1800.png`. Portrait reference: `popup-portrait-800x1280.png` (not for CWS upload).

**If** `popup.png` **already failed in the dashboard:** replace it with the new 1280×800 file first, then upload up to four more in the order above.

### If you need to re-capture manually

1. Load unpacked: `extension/.output/overwire/chrome-mv3/` (prefer Overwire brand for rebrand screenshots; Detour path also works).
2. Capture, then export exactly **1280×800** (or **640×400**) as **24-bit PNG with no alpha** (flatten on `#0B0F19` / Overwire dark if needed). Dark theme. `localhost` / `example.com` only — no Rogers / customer data.
3. Save under `docs/distribution/store-assets/` (keep a `*-source-*` high-res backup).

Details: [store-assets/README.md](store-assets/README.md).

### Store icon

If the dashboard asks separately: upload Bypass Arc 128×128.

Absolute paths (any one):

```
/Users/hamzakhan/overwire/docs/distribution/store-assets/store-icon-128.png
```

```
/Users/hamzakhan/overwire/extension/.output/overwire/chrome-mv3/icons/128.png
```

(Or extract `icons/128.png` from `overwire-0.1.3-chrome.zip`.) The `store-assets` copy is RGB flattened (no alpha) for picky dashboard uploads; the zip icon may keep a transparent corner.

### Promo tiles (optional but Overwire-ready)

| File | Size | Status |
|------|------|--------|
| `promo-small-440x280.png` | **440×280** RGB PNG (no alpha) | Overwire wordmark + Bypass Arc |
| `promo-marquee-1400x560.png` | **1400×560** RGB PNG (no alpha) | Overwire wordmark + Bypass Arc |

Absolute paths:

1. `/Users/hamzakhan/overwire/docs/distribution/store-assets/promo-small-440x280.png`
2. `/Users/hamzakhan/overwire/docs/distribution/store-assets/promo-marquee-1400x560.png`

### Promo video — skip for now

**No promotional video shipped.** The prior global MP4 and poster were removed (Hamza taste). Leave Store listing → Graphic assets → **Promotional video** empty; do **not** paste a YouTube URL. Competitor research only (if revisited later): [promo-video-brief.md](store-assets/promo-video-brief.md). Details: [store-assets/README.md](store-assets/README.md#promotional-video--skip-for-now).

### Screenshot checklist (Hamza before Submit)

- [ ] Title / short / detailed description pasted from this file (Overwire)
- [ ] Homepage `https://overwire.protovoid.com/` · Privacy `…/privacy/` · Support `…/support/`
- [ ] Support email `overwire@protovoid.com`
- [ ] Store icon 128×128 from Overwire zip or `store-assets/store-icon-128.png` (Bypass Arc)
- [ ] At least one 1280×800 screenshot uploaded (prefer order table above; assets are Overwire UI)
- [ ] Optional: upload small + marquee promo tiles from `store-assets/`
- [ ] Skip Promotional video / YouTube URL (no promo video shipped)
- [ ] Package: `overwire-0.1.3-chrome.zip` uploaded; version **0.1.3**; packaged name **Overwire**; manifest has **no** `key`
- [ ] Do **not** submit until the above Save Draft checks look green in the dashboard

---

## Dashboard steps (Overwire rebrand — you)

Agents prepare zip + paste blocks only. Hamza uploads and submits.

1. Open [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) → item `jfgbokgdgpjhkciooicmbdgablgkklmn`.
2. **Store listing:** paste Title / Short / Detailed + URLs/email from [Listing fields](#listing-fields-store-listing--paste) → **Save Draft**.
3. **Store listing → media:** store icon from Overwire zip / `store-icon-128.png`; screenshots per checklist above; optional Overwire promo tiles → **Save Draft**.
4. **Privacy practices:** refresh justifications / remote-code paste if still Detour-worded → **Save Draft**.
5. **Package:** Upload

   `/Users/hamzakhan/overwire/extension/.output/overwire/overwire-0.1.3-chrome.zip`  
     (Do **not** unpublish or rollback the live 0.1.2 item — upload a newer package on the same store id.)
6. Confirm version shows **0.1.3** and Package Title/Summary from package is **Overwire** (`manifest.name`).
7. **Submit for review** when ready (human only).

Expect extra scrutiny for `<all_urls>` + `debugger`. Justifications above already cover local-only body override after **Allow debugger**.

Do not claim affiliation with other “Detour” proxy add-ons (listing copy already distinguishes). Same store id keeps upgrades in place.

---

## After approval (Phase 3)

Listing is live. Repo/site store-id work:

1. **Done:** `chromeStoreUrl` in `/Users/hamzakhan/Project/overwire-web/site.config.ts` → live CWS URL above. Redeploy when ready: `cd ~/Project/overwire-web && npm run deploy` (needs Wrangler login — see [overwire-web docs/SEO.md](/Users/hamzakhan/Project/overwire-web/docs/SEO.md)).
2. **Done:** Public README Install section + Chrome Web Store badge point at the live URL (product name Overwire in docs).
3. **Done:** Store id on `extension/brands/overwire` brand config and CLI store id lists so NM `allowed_origins` pick it up on helper install.
4. **Manual / optional:** Protovoid `/products/` Overwire CTA already points at product/GitHub; keep CWS link if install-from-store is desired.
5. **Manual / optional:** Google Search Console for `overwire.protovoid.com` → submit `sitemap-index.xml` (legacy property may still be `detour.protovoid.com` during dual-host; **DNS gate clean**; **301 still human-deferred**).
6. **Done (Submit):** Listing paste + 0.1.3 package upload + Submit for review (Hamza, 2026-11-10). Keep this packet for rejection replies / future bumps.

---

## Out of scope this pass

- Edge Add-ons / Firefox AMO
- Automating CWS publish from CI / uploading the zip from an agent
- Git tag / GitHub Release for `v0.1.3` (optional; separate from CWS upload)
- Deploying `detour-to-overwire-redirect` while `overwire.protovoid.com` is NXDOMAIN

