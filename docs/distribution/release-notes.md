# Release notes

CI opens a GitHub Release only when someone pushes a `v*` tag (for example `v0.1.3`). The workflow attaches brand-named store zips (prefer **Overwire** for rebrand tags):

- `overwire-<version>-chrome.zip` (Chrome and Edge; Detour-named zips remain for legacy brand builds)
- `overwire-<version>-firefox.zip` when a Firefox zip is produced
- sources zip for the tagged tree

Product marketing changelog (what users read): the site page [`/changelog/`](https://overwire.protovoid.com/changelog/) in the `overwire-web` repo. Keep that page honest about Chrome Web Store status (current vs submitted vs released). Do not claim Overwire is live on the store until review clears.

Notes start as GitHub’s generated commit list. Replace or extend them before you send users to the release. Mention:

- What changed for someone using the extension
- Permission or manifest changes, if any
- Browser versions you actually ran (`e2e:chrome`, and Firefox if you checked it)
- That rules still stay on the device
- Rebrand context when relevant (Overwire / Bypass Arc; formerly Detour; same store id for in-place updates)

Do not paste rule bodies, tokens, or store credentials into the notes.

The tag should match the version you intend to ship. `extension/package.json` is currently `0.1.3` for the Overwire CWS rebrand package. Bump the package version in the same commit you tag, so the zip name and the manifest version agree.

Store upload is a separate manual step ([store-listing.md](store-listing.md)). A GitHub Release does not publish to Chrome, Edge, or AMO.
