import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import {
  helperBinaryName,
  helperInstallDir,
  legacyHelperBinaryName,
  legacyHelperInstallDir,
} from './helper-paths.ts';
import {
  chromeAllowedOrigins,
  resolveChromiumExtensionIds,
} from './install.ts';
import { DETOUR_STORE_CHROMIUM_IDS, DETOUR_UNPACKED_CHROMIUM_ID } from './extension-ids.ts';
import { HOST_NAME, LEGACY_HOST_NAME } from './protocol.ts';

describe('helperInstallDir', () => {
  it('uses Application Support/Overwire on macOS', () => {
    assert.equal(
      helperInstallDir('darwin'),
      join(homedir(), 'Library', 'Application Support', 'Overwire', 'db-host'),
    );
    assert.equal(helperBinaryName('darwin'), 'overwire-db-host');
    assert.equal(legacyHelperBinaryName('darwin'), 'detour-db-host');
    assert.equal(
      legacyHelperInstallDir('darwin'),
      join(homedir(), 'Library', 'Application Support', 'Detour', 'db-host'),
    );
  });

  it('uses LOCALAPPDATA/Overwire on Windows', () => {
    const dir = helperInstallDir('win32');
    assert.match(dir, /Overwire[/\\]db-host$/);
    assert.equal(helperBinaryName('win32'), 'overwire-db-host.exe');
    assert.match(legacyHelperInstallDir('win32'), /Detour[/\\]db-host$/);
  });

  it('uses XDG data home on Linux', () => {
    const prev = process.env.XDG_DATA_HOME;
    process.env.XDG_DATA_HOME = '/tmp/xdg-data-overwire-test';
    try {
      assert.equal(helperInstallDir('linux'), join('/tmp/xdg-data-overwire-test', 'overwire', 'db-host'));
      assert.equal(legacyHelperInstallDir('linux'), join('/tmp/xdg-data-overwire-test', 'detour', 'db-host'));
    } finally {
      if (prev === undefined) delete process.env.XDG_DATA_HOME;
      else process.env.XDG_DATA_HOME = prev;
    }
  });
});

describe('allowed_origins / extension ids', () => {
  it('defaults to Detour unpacked + store ids (same for overwire brand)', () => {
    const expected = [DETOUR_UNPACKED_CHROMIUM_ID, ...DETOUR_STORE_CHROMIUM_IDS];
    assert.deepEqual(resolveChromiumExtensionIds({}), expected);
    assert.deepEqual(resolveChromiumExtensionIds({ brand: 'detour' }), expected);
    assert.deepEqual(resolveChromiumExtensionIds({ brand: 'overwire' }), expected);
  });

  it('merges --extension-id with brand defaults', () => {
    // Chrome ids are 32 chars from a–p only.
    const extra = 'abcdefghijklmnopabcdefghijklmnop';
    assert.deepEqual(resolveChromiumExtensionIds({ extensionId: extra }), [
      DETOUR_UNPACKED_CHROMIUM_ID,
      ...DETOUR_STORE_CHROMIUM_IDS,
      extra,
    ]);
  });

  it('builds chrome-extension origins', () => {
    assert.deepEqual(chromeAllowedOrigins([DETOUR_UNPACKED_CHROMIUM_ID]), [
      `chrome-extension://${DETOUR_UNPACKED_CHROMIUM_ID}/`,
    ]);
  });

  it('exposes Overwire host with Detour legacy', () => {
    assert.equal(HOST_NAME, 'com.overwire.db');
    assert.equal(LEGACY_HOST_NAME, 'com.detour.db');
  });
});
