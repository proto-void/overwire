/**
 * Stable per-user install location for the Databases SEA helper (ADR-029 / plan 041).
 * Primary paths use Overwire; Detour paths remain for discovery / uninstall of un-upgraded helpers.
 */
import { existsSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';

export type HelperOs = NodeJS.Platform;

/** Windows %LOCALAPPDATA% (or fallback under homedir). */
function localAppData(): string {
  return process.env.LOCALAPPDATA?.trim() || join(homedir(), 'AppData', 'Local');
}

export function helperInstallDir(os: HelperOs = platform()): string {
  if (os === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'Overwire', 'db-host');
  }
  if (os === 'win32') {
    return join(localAppData(), 'Overwire', 'db-host');
  }
  const xdg = process.env.XDG_DATA_HOME?.trim();
  return join(xdg || join(homedir(), '.local', 'share'), 'overwire', 'db-host');
}

/** Pre-rebrand Detour install dir (read/remove only). */
export function legacyHelperInstallDir(os: HelperOs = platform()): string {
  if (os === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'Detour', 'db-host');
  }
  if (os === 'win32') {
    return join(localAppData(), 'Detour', 'db-host');
  }
  const xdg = process.env.XDG_DATA_HOME?.trim();
  return join(xdg || join(homedir(), '.local', 'share'), 'detour', 'db-host');
}

export function helperBinaryName(os: HelperOs = platform()): string {
  return os === 'win32' ? 'overwire-db-host.exe' : 'overwire-db-host';
}

export function legacyHelperBinaryName(os: HelperOs = platform()): string {
  return os === 'win32' ? 'detour-db-host.exe' : 'detour-db-host';
}

export function helperBinaryPath(os: HelperOs = platform()): string {
  return join(helperInstallDir(os), helperBinaryName(os));
}

/**
 * Resolve an installed helper binary: prefer Overwire path, then legacy Detour path/name.
 */
export function resolveInstalledHelperBinary(os: HelperOs = platform()): string | null {
  const primary = helperBinaryPath(os);
  if (existsSync(primary)) return primary;
  const legacySameDir = join(helperInstallDir(os), legacyHelperBinaryName(os));
  if (existsSync(legacySameDir)) return legacySameDir;
  const legacyDir = join(legacyHelperInstallDir(os), legacyHelperBinaryName(os));
  if (existsSync(legacyDir)) return legacyDir;
  const legacyOverwireName = join(legacyHelperInstallDir(os), helperBinaryName(os));
  if (existsSync(legacyOverwireName)) return legacyOverwireName;
  return null;
}
