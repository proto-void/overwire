# Push Overwire to GitHub (Protovoid org)

Use your **Protovoid** organization account (not `HamzaKhan-Rogers`). Create empty public repos first if they do not exist: `proto-void/overwire` and `proto-void/overwire-web`.

## Extension → `proto-void/overwire`

From the local checkout (folder is `/Users/hamzakhan/overwire`):

```sh
cd "/Users/hamzakhan/overwire"
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:proto-void/overwire.git
# Review and commit your launch changes first, then:
git push -u origin main
```

Optional first release after CI is green:

```sh
git tag v0.1.0
git push origin v0.1.0
```

Chrome zip for manual CWS upload (already built locally):

`extension/.output/overwire/overwire-<version>-chrome.zip`

Privacy / homepage for the store listing:

- https://overwire.protovoid.com/privacy/
- https://overwire.protovoid.com
  (legacy `detour.protovoid.com` remains dual-host until Hamza deploys the 301 Worker)

## Product site → `proto-void/overwire-web`

```sh
cd "/Users/hamzakhan/Project/overwire-web"
git remote remove origin 2>/dev/null || true
git remote add origin git@github.com:proto-void/overwire-web.git
git push -u origin main
```

Or create + push in one step:

```sh
cd "/Users/hamzakhan/Project/overwire-web"
gh repo create proto-void/overwire-web --public --source=. --remote=origin --push
```

## Deploy site (after `wrangler login`)

```sh
cd "/Users/hamzakhan/Project/overwire-web"
npm run deploy
```

See `~/Project/overwire-web/docs/DEPLOY.md` for DNS notes.
