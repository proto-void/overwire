# Local folder rename (Hamza-only)

**Status: DONE (2026-11-10).** Local parents renamed. GitHub rename was already done (`proto-void/overwire`, `proto-void/overwire-web`). Remotes already pointed at the new URLs. In-repo clone/badge/docs URLs were swept. `overwire.code-workspace` lives at the monorepo root and includes `overwire-web`.

## Completed targets

| Old | New |
|-----|-----|
| `/Users/hamzakhan/Resource Override` | `/Users/hamzakhan/overwire` |
| `/Users/hamzakhan/Project/detour-web` | `/Users/hamzakhan/Project/overwire-web` |

Commands that were run:

```sh
mv "/Users/hamzakhan/Resource Override" /Users/hamzakhan/overwire
mv /Users/hamzakhan/Project/detour-web /Users/hamzakhan/Project/overwire-web
```

## Confirm remotes

```sh
cd /Users/hamzakhan/overwire && git remote -v
# origin  https://github.com/proto-void/overwire.git

cd /Users/hamzakhan/Project/overwire-web && git remote -v
# origin  https://github.com/proto-void/overwire-web.git
```

## Open Cursor

Quit the old window (it is bound to the former path). Open `/Users/hamzakhan/overwire/overwire.code-workspace` (name **Overwire**).

Leave alone: git history rewrite; `chrome.storage` key `workspace`; stale `~/.cursor/projects/Users-hamzakhan-Resource-Override` (Cursor recreates on reopen).

## Not part of this runbook

- CWS publish
- Blind `detour` → `overwire` 301 Worker redeploy (dual-host 200 is current live truth)
- Root/package brand cutover beyond what is already landed
