# @overwire/cli

Local Bridge (loopback file server) and Databases native messaging host for Overwire.

## Local Bridge

```bash
corepack pnpm --filter @overwire/cli exec node --experimental-strip-types src/cli.ts bridge ./dist
```

## Databases helper

```bash
corepack pnpm --filter @overwire/cli exec node --experimental-strip-types src/cli.ts db install --extension-id=<chrome-extension-id>
corepack pnpm --filter @overwire/cli exec node --experimental-strip-types src/cli.ts db uninstall
```

Bins: `overwire`, `overwire-db-host` (and transition alias `detour` for one release).  
Native host: `com.overwire.db` (install also registers legacy `com.detour.db`).

(`pnpm exec overwire` may not be linked if nothing depends on `@overwire/cli`. Use `node … src/cli.ts` or `node bin/overwire.js` instead.)

## Tests

```bash
DETOUR_DB_E2E=1 corepack pnpm --filter @overwire/cli test:db-e2e
```

SEA spike: `corepack pnpm --filter @overwire/cli sea:build` → `cli/.sea/`.

```bash
corepack pnpm --filter @overwire/cli test
corepack pnpm --filter @overwire/cli typecheck
```
