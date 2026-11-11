#!/usr/bin/env node
/**
 * Assemble a self-sufficient OS pack: extension + SEA helper + install scripts + READMEs.
 *
 *   corepack pnpm --filter @overwire/cli pack:os
 *
 * Env (BRAND_* preferred; DETOUR_* still accepted):
 *   BRAND / DETOUR_BRAND — extension brand slug for assets (default overwire)
 *   BRAND_PACK_OS / BRAND_PACK_ARCH — override target labels (default: host)
 *   BRAND_SEA_DIR / BRAND_EXT_DIR — prebuilt SEA / extension dirs
 *
 * Pack archive name is always `overwire-<ver>-<os>-<arch>` (plan 041).
 */
import {
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { platform, arch as osArch } from 'node:os';

const require = createRequire(import.meta.url);
const cliRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(cliRoot, '..');

const brandRaw = (process.env.BRAND || process.env.DETOUR_BRAND || 'overwire').trim() || 'overwire';
if (brandRaw === 'detour') {
  console.error(
    'Detour brand flavor was removed. Pack with default overwire (or BRAND_EXT_DIR for a custom chrome-mv3).',
  );
  process.exit(1);
}
const brand = brandRaw;
const brandName = brand === 'overwire' ? 'Overwire' : brand;
const packProduct = 'overwire';
const version = readExtVersion();
const osKey = process.env.BRAND_PACK_OS || process.env.DETOUR_PACK_OS || mapOs(platform());
const archKey = process.env.BRAND_PACK_ARCH || process.env.DETOUR_PACK_ARCH || mapArch(osArch());
const slug = `${packProduct}-${version}-${osKey}-${archKey}`;
const outRoot = join(cliRoot, '.packs', slug);
const seaDir =
  process.env.BRAND_SEA_DIR ||
  process.env.DETOUR_SEA_DIR ||
  join(cliRoot, '.sea');
const extDir =
  process.env.BRAND_EXT_DIR ||
  process.env.DETOUR_EXT_DIR ||
  join(repoRoot, 'extension', '.output', brand, 'chrome-mv3');

const isWin = osKey === 'windows';
const helperBinary = isWin ? 'overwire-db-host.exe' : 'overwire-db-host';
const installScript = isWin
  ? 'Install Overwire Helper.cmd'
  : platform() === 'darwin' && osKey === 'macos'
    ? 'Install Overwire Helper.command'
    : 'install.sh';
const uninstallScript = isWin
  ? 'Uninstall Overwire Helper.cmd'
  : platform() === 'darwin' && osKey === 'macos'
    ? 'Uninstall Overwire Helper.command'
    : 'uninstall.sh';

const releasesUrl = 'https://github.com/proto-void/overwire/releases';
const installDirExample = installDirFor(osKey);
const firstRunNotes = firstRunFor(osKey);
const osLabel = osLabelFor(osKey);

if (!existsSync(join(seaDir, helperBinary))) {
  // Transition: accept legacy SEA binary name if present.
  const legacy = isWin ? 'detour-db-host.exe' : 'detour-db-host';
  if (!existsSync(join(seaDir, legacy))) {
    console.error(`SEA binary missing at ${join(seaDir, helperBinary)}. Run sea:build first.`);
    process.exit(1);
  }
}

if (!existsSync(join(extDir, 'manifest.json'))) {
  console.error(`Extension build missing at ${extDir}. Run: pnpm --filter @overwire/extension build`);
  process.exit(1);
}

rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

cpSync(extDir, join(outRoot, 'extension'), { recursive: true });
copyFileSync(
  join(repoRoot, 'extension', 'README-load-unpacked.md'),
  join(outRoot, 'extension', 'README-load-unpacked.md'),
);

const helperOut = join(outRoot, 'helper');
mkdirSync(helperOut, { recursive: true });
const seaHelperSrc = existsSync(join(seaDir, helperBinary))
  ? join(seaDir, helperBinary)
  : join(seaDir, isWin ? 'detour-db-host.exe' : 'detour-db-host');
cpSync(seaHelperSrc, join(helperOut, helperBinary));
const pickfileBinary = isWin ? 'overwire-pickfile.exe' : 'overwire-pickfile';
const legacyPick = isWin ? 'detour-pickfile.exe' : 'detour-pickfile';
const pickSrc = existsSync(join(seaDir, pickfileBinary))
  ? join(seaDir, pickfileBinary)
  : existsSync(join(seaDir, legacyPick))
    ? join(seaDir, legacyPick)
    : null;
if (pickSrc) {
  cpSync(pickSrc, join(helperOut, pickfileBinary));
  if (!isWin) {
    try {
      chmodSync(join(helperOut, pickfileBinary), 0o755);
    } catch {
      /* ignore */
    }
  }
}
if (existsSync(join(seaDir, 'node_modules'))) {
  // Dereference pnpm symlinks so the zip is self-contained on another machine.
  copyTreeReal(join(seaDir, 'node_modules'), join(helperOut, 'node_modules'));
}
if (existsSync(join(seaDir, 'package.json'))) {
  copyFileSync(join(seaDir, 'package.json'), join(helperOut, 'package.json'));
} else {
  writeFileSync(
    join(helperOut, 'package.json'),
    `${JSON.stringify({ name: 'overwire-db-host', private: true }, null, 2)}\n`,
  );
}
if (!isWin) {
  try {
    chmodSync(join(helperOut, helperBinary), 0o755);
  } catch {
    /* ignore */
  }
}

const vars = {
  brandName: 'Overwire',
  version,
  osLabel,
  arch: archKey,
  helperBinary,
  installScript,
  uninstallScript,
  installDirExample,
  firstRunNotes,
  releasesUrl,
};

writeFileSync(join(outRoot, 'README.md'), renderTemplate('README.md.hbs', vars));
writeFileSync(join(helperOut, 'README.md'), renderTemplate('helper-README.md.hbs', vars));

writeInstallScripts(outRoot, { isWin, osKey, helperBinary, installScript, uninstallScript, brand });

// Archive
const packsDir = join(cliRoot, '.packs');
mkdirSync(packsDir, { recursive: true });
if (osKey === 'linux') {
  const tarPath = join(packsDir, `${slug}.tar.gz`);
  execFileSync('tar', ['-czf', tarPath, '-C', packsDir, slug], { stdio: 'inherit' });
  assertNoPlaceholders(outRoot);
  console.log('Wrote', tarPath);
} else {
  const zipPath = join(packsDir, `${slug}.zip`);
  zipDir(outRoot, zipPath);
  assertNoPlaceholders(outRoot);
  console.log('Wrote', zipPath);
}

function readExtVersion() {
  const pkg = JSON.parse(readFileSync(join(repoRoot, 'extension', 'package.json'), 'utf8'));
  return pkg.version || '0.0.0';
}

function mapOs(p) {
  if (p === 'darwin') return 'macos';
  if (p === 'win32') return 'windows';
  return 'linux';
}

function mapArch(a) {
  if (a === 'arm64') return 'arm64';
  if (a === 'x64' || a === 'x86_64') return 'x64';
  return a;
}

function osLabelFor(os) {
  if (os === 'macos') return 'macOS';
  if (os === 'windows') return 'Windows';
  return 'Linux';
}

function installDirFor(os) {
  if (os === 'macos') return '~/Library/Application Support/Overwire/db-host/';
  if (os === 'windows') return '%LOCALAPPDATA%\\Overwire\\db-host\\';
  return '${XDG_DATA_HOME:-~/.local/share}/overwire/db-host/';
}

function firstRunFor(os) {
  if (os === 'macos') {
    return [
      '**macOS Gatekeeper:** if macOS blocks the app, right-click the install script (or the helper) and choose **Open**.',
      'Or clear quarantine: `xattr -dr com.apple.quarantine <this-pack-folder>`.',
      'The installer also tries to clear quarantine on the copied helper.',
    ].join('\n');
  }
  if (os === 'windows') {
    return [
      '**Windows SmartScreen:** if Windows warns, click **More info** → **Run anyway**.',
    ].join('\n');
  }
  return [
    '**Linux:** if the install script is not executable after unzip, run `chmod +x install.sh uninstall.sh helper/overwire-db-host`.',
  ].join('\n');
}

function renderTemplate(name, vars) {
  let text = readFileSync(join(cliRoot, 'pack', 'templates', name), 'utf8');
  for (const [k, v] of Object.entries(vars)) {
    text = text.split(`{{${k}}}`).join(String(v));
  }
  if (/\{\{[a-zA-Z0-9_]+\}\}/.test(text)) {
    throw new Error(`Unresolved placeholders in ${name}`);
  }
  return text;
}

function assertNoPlaceholders(dir) {
  for (const rel of ['README.md', join('helper', 'README.md')]) {
    const text = readFileSync(join(dir, rel), 'utf8');
    if (text.includes('{{')) {
      throw new Error(`Leftover placeholders in ${rel}`);
    }
  }
}

function writeInstallScripts(root, opts) {
  const { isWin, helperBinary, installScript, uninstallScript } = opts;
  const brandFlag = '';
  if (isWin) {
    writeFileSync(
      join(root, installScript),
      `@echo off
cd /d "%~dp0helper"
${helperBinary} install${brandFlag}
echo.
pause
`,
    );
    writeFileSync(
      join(root, uninstallScript),
      `@echo off
cd /d "%~dp0helper"
${helperBinary} uninstall
echo.
pause
`,
    );
    return;
  }
  const installBody = `#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
HELPER="$DIR/helper/${helperBinary}"
chmod +x "$HELPER" 2>/dev/null || true
# Best-effort quarantine clear on the pack folder (macOS).
if command -v xattr >/dev/null 2>&1; then
  xattr -dr com.apple.quarantine "$DIR" 2>/dev/null || true
fi
exec "$HELPER" install${brandFlag}
`;
  const uninstallBody = `#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
HELPER="$DIR/helper/${helperBinary}"
chmod +x "$HELPER" 2>/dev/null || true
exec "$HELPER" uninstall
`;
  writeFileSync(join(root, installScript), installBody, { mode: 0o755 });
  writeFileSync(join(root, uninstallScript), uninstallBody, { mode: 0o755 });
}

/** Copy a directory tree, resolving symlinks to real files (pnpm-friendly). */
function copyTreeReal(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    const to = join(dest, name);
    const st = lstatSync(from);
    if (st.isSymbolicLink() || st.isDirectory()) {
      const real = realpathSync(from);
      const rst = lstatSync(real);
      if (rst.isDirectory()) {
        copyTreeReal(real, to);
      } else {
        copyFileSync(real, to);
      }
    } else if (st.isFile()) {
      copyFileSync(from, to);
    }
  }
}

function zipDir(dir, zipPath) {
  rmSync(zipPath, { force: true });
  // Prefer system zip for exec-bit friendliness on macOS.
  try {
    execFileSync('zip', ['-r', zipPath, dirname(dir) === join(cliRoot, '.packs') ? slug : '.'], {
      cwd: dirname(dir),
      stdio: 'inherit',
    });
  } catch {
    // Fallback: Node zlib walk is heavy; require zip.
    console.error('zip command failed; install zip or use tar.gz on Linux');
    process.exit(1);
  }
}
