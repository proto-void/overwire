# Overwire CWS promo video — competitive research (no video shipped)

**Status:** **No promotional video shipped.** Hamza removed the generated global promo clip (2026-11-10). This file is **research notes only** — competitor/peer scan + creative patterns for a possible future cut. Do **not** treat it as instructions to upload or recreate a store MP4.

**Last verified:** 2026-11-10  
**Audience:** Chrome Web Store shoppers / frontend + QA developers  
**CWS constraint (if ever revisited):** Optional field = **YouTube URL only** (no MP4 upload to the dashboard).

Primary creative references are **non-Requestly** peers. Requestly is listed last as a single secondary data point only.

## Competitor / peer scan (Requestly de-emphasized)

| Name | Promo / demo URL | Length / form | Structure & craft notes |
|------|------------------|---------------|-------------------------|
| **Proxyman** (best short-form model) | [Map Local 25s](https://proxyman.com/videos/map-local); [Capture HTTP 25s](https://proxyman.com/videos/capture-http-https-traffic); [Breakpoint 30s](https://proxyman.com/videos/breakpoint-tool); [iOS Simulator 32s](https://proxyman.com/videos/ios-simulator); [Android 44s](https://proxyman.com/videos/android) | Ultra-short **silent product clips** of real app chrome | Always **3 steps**: create rule → configure → see result. One job per clip. No motion-graphics soup; premium = sharp UI + calm pacing. |
| **Resource Override** | [Overview](https://www.youtube.com/watch?v=62QIWAP9mMM) (~**12s** on YT player) | Raw utilitarian screencast | Dense, unpolished, still clear: show **URL → localhost** in the real options UI. Proves short store cuts can be pure UI with no VO or brand theater. |
| **Tampermonkey** (inject peer) | [Install & use](https://www.youtube.com/watch?v=8tyjJD65zws) (~3:13 official) | Calm VO + real Chrome chrome | Install → **pin toolbar** → popup toggles → dashboard. Shows *where* the extension lives. Useful for “toolbar product” storytelling, not for neon SaaS looks. |
| **Mockoon** (mock peer) | [Video tutorials](https://mockoon.com/video-tutorials/) (Getting started / Responses / Proxy); community e.g. [How to mock API](https://www.youtube.com/watch?v=IM-eY0GiHjc) (~6:21) | Calm desktop UI walkthrough | Pedagogy: define route → set JSON body → hit in browser. Honest product surface; no abstract brand film. |
| **HTTP Toolkit** | Homepage product shots + community intro set (e.g. [Android demo](https://www.youtube.com/watch?v=ttf8IhfI0Ao)); site markets intercept/edit/mock | Screenshot-led site; longer community intros | Sells **rules** (mock, redirect, transform headers) with dark explore UI. Pattern: stills of real tooling beat animated fluff. |
| **Modify Header Value** | [Browser Extension Review](https://www.youtube.com/watch?v=KM4uKx-BjIg) (third-party) | Review / how-to screencast | Header tools often rely on third-party demos, not polished in-house promos. |
| **Tamper Dev** (ex Tamper Chrome) | Community e.g. [Burp alternative walkthrough](https://www.youtube.com/watch?v=Y0Gk78_L1yU); product [tamper.dev](https://tamper.dev/) | Tutorial screencast; site uses static screenshots | Intercept → edit request/response → continue. Screenshot galleries substitute for missing short store promo. |
| **ModHeader V3** | CWS [listing](https://chromewebstore.google.com/detail/modheader-v3-%E2%80%94-by-modhead/cndlnhnjdlmipaflgajjikndbfkfnohp); channel [@modheader1815](https://www.youtube.com/@modheader1815) | **No strong store-style promo** found | Wins on **one-job copy + screenshots**. Do not invent spectacle ModHeader does not use. |
| **Header Editor** / **DevHeader** / **xHeader** | CWS listings; DevHeader site [devheader.com](https://www.devheader.com/) with UI stills | No polished promo videos found | Closest Overwire feature peers market via **three stills**: headers, redirects, mocks. Local-only / privacy framing. |
| **Request Interceptor** (CWS clones) | e.g. [bfgbla…](https://chromewebstore.google.com/detail/request-interceptor/bfgblailifedppfilabonohepkofbkpm) | Generally **no** promo video | Feature list + screenshots only. |
| **Moesif Origin Tracer** | [CWS](https://chromewebstore.google.com/detail/moesif-origincors-changer/digfbfaphojjndkpccljibejjbppifbc) | No short extension promo (Moesif YT is thought-leadership) | Narrow CORS job; screenshots > video. |
| **Redirect Path (Ayima)** | Third-party SEO tutorials only (e.g. Spanish how-to) | Not a store promo peer | Status-code auditor; weak creative reference for override tools. |
| **Charles Proxy** | Long getting-started tutorials (e.g. Kodeco); no short official store cut | Setup-heavy | Less relevant for 15s CWS pacing. |
| **Requestly** *(secondary only)* | Long feature VO screencasts on YT | 3–4+ min tutorials | Useful as “feature order” trivia only — **do not** copy VO length, Loom head, or purple gradient framing for a short store cut. |

## Patterns that work (from the non-Requestly set)

1. **Proxyman rule:** one concrete job, three beats (make rule → configure → prove it), ~25–30s, real UI, almost no VO.
2. **Resource Override rule:** even ~12s works if the redirect URL pair is readable on screen.
3. **Screenshot-first peers (ModHeader / DevHeader / Header Editor / Moesif):** many category leaders ship **no** promo video; when they do market, they show **real panels**, not motion graphics.
4. **Mockoon / HTTP Toolkit:** calm product surfaces; mock = show body/status; rewrite = show match → action.
5. **Tampermonkey:** establish toolbar presence if space allows; pin + toggle is the trust moment.
6. **Silent-friendly:** short store loops autoplay muted — captions or self-evident UI > VO.
7. **Avoid:** purple neon SaaS, particle tunnels, floating AI-morphed collage panels, Detour wordmarks.

## What Overwire should copy (if a future cut is approved)

- **Proxyman pacing + 3-step pedagogy** compressed into ~15s (redirect / mock / headers).
- **RO density:** hero is the readable `production → localhost` rule row.
- **DevHeader still language:** three surfaces, same dark local-tool honesty.
- **Mockoon mock honesty:** show the mock body surface, not abstract “API magic.”
- Bypass Arc only: `#0B0F19`, `#FF6B00`, `#00FF66` applied. No Detour.

## What to avoid (incl. prior Overwire gens)

- AI-morphed floating multi-window collage (prior mid-frames hallucinated UI / version chrome).
- Requestly-length VO tutorials or purple gradient “SaaS trailer” framing as the CWS cut.
- Generic neon glow, particles, holographic glass.
- Detour branding, partner marks, customer hostnames (keep `example.com` / `localhost`).

## Historical creative sketch (not shipped)

Prior regen aimed at ~15s, 16:9 1080p, silent captions (Proxyman × RO): open → Redirect → Mock → Headers → Add to Chrome, Ken Burns on unaltered store screenshots. That MP4 and poster were **deleted** per Hamza taste. **No YouTube URL** for CWS for now — skip the Promotional video field.
