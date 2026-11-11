# Agent entrypoint

Before any non-trivial work:

1. Read **[AI/README.md](AI/README.md)** (master router).
2. Read **[AI/PRODUCT.md](AI/PRODUCT.md)** and **[AI/PROGRESS.md](AI/PROGRESS.md)**.
3. Open matching files under **[AI/intelligence/](AI/intelligence/)** before grepping the codebase.
4. For engineering process, follow **[.cursor/rules/agent-skills.mdc](.cursor/rules/agent-skills.mdc)** — pick 1–3 skills; do not load all vendor skills.
5. Specs are Draft until human approval — use `AI/skills/spec-workflow`. Plans live only under `AI/plans/`. Write durable facts back via `AI/skills/write-back-kb`.

Product facts in `AI/` win over vendor skill defaults. No secrets in the knowledge base. No `extension/` or `cli/` code until specs are Approved.

## Extension delivery (Overwire zip DoD)

Sole in-tree product brand is **Overwire** (`extension/brands/overwire/`). Build-time env: `BRAND` / `BRAND_DIR` / `BRAND_NAME` / `BRAND_OMIT_CHROMIUM_MANIFEST_KEY` (`DETOUR_*` aliases still accepted for one release). `BRAND=detour` is rejected — Detour flavor removed after CWS live.

Every extension delivery that changes `extension/` ends with:

```sh
corepack pnpm --filter @overwire/extension zip
# → extension/.output/overwire/overwire-<version>-chrome.zip
```

Report the zip path in the delivery summary. Packages are `@overwire/extension` + `@overwire/cli` (root name `overwire`). Native host: `com.overwire.db` with automatic fallback / dual-register of `com.detour.db` (upgrade continuity — not a Detour brand build). Partner Rogers product retired (plan 033); do not revive `zip:rogers` or a private `rogers-detour` tree.

Subagent prompts that change `extension/` must include this Overwire-only zip DoD.
