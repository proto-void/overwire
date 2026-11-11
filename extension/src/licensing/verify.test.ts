import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  LICENSE_KEY_STORAGE,
  LICENSE_PREFIX,
  LICENSE_STATUS_STORAGE,
  badgeLabel,
  base64UrlEncode,
  clearLicenseKey,
  isProUnlocked,
  isTeamUnlocked,
  refreshLicenseState,
  saveLicenseKey,
  shouldShowProUpgradeCta,
  verifyLicenseKeyOffline,
} from './verify';

const encoder = new TextEncoder();

async function mint(
  claims: Record<string, unknown>,
  opts?: { prefix?: string },
): Promise<{ key: string; spkiB64: string }> {
  const { publicKey, privateKey } = await crypto.subtle.generateKey({ name: 'Ed25519' }, true, [
    'sign',
    'verify',
  ]);
  const spki = new Uint8Array(await crypto.subtle.exportKey('spki', publicKey));
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const sig = new Uint8Array(await crypto.subtle.sign('Ed25519', privateKey, encoder.encode(payload)));
  const prefix = opts?.prefix ?? LICENSE_PREFIX;
  return {
    key: `${prefix}.${payload}.${base64UrlEncode(sig)}`,
    spkiB64: base64UrlEncode(spki),
  };
}

describe('verifyLicenseKeyOffline', () => {
  it('accepts a valid Pro key', async () => {
    const now = 1_700_000_000;
    const { key, spkiB64 } = await mint({ tier: 'pro', iat: now, seats: 1, features: ['er'] });
    const status = await verifyLicenseKeyOffline(key, { publicKeySpki: spkiB64, now });
    expect(status.valid).toBe(true);
    expect(status.tier).toBe('pro');
    expect(status.claims?.seats).toBe(1);
    expect(status.claims?.features).toEqual(['er']);
    expect(badgeLabel(status)).toBe('PRO');
    expect(isProUnlocked(status)).toBe(true);
    expect(isTeamUnlocked(status)).toBe(false);
    expect(shouldShowProUpgradeCta(status)).toBe(false);
  });

  it('shows Pro upgrade CTA when unlocked is false (fail open soft CTA)', () => {
    expect(shouldShowProUpgradeCta(undefined)).toBe(true);
    expect(shouldShowProUpgradeCta(null)).toBe(true);
    expect(shouldShowProUpgradeCta({ valid: false, tier: 'community', reason: 'missing' })).toBe(true);
  });

  it('accepts Team / enterprise tier alias', async () => {
    const now = 1_700_000_000;
    const { key, spkiB64 } = await mint({ tier: 'enterprise', iat: now, seats: 10 });
    const status = await verifyLicenseKeyOffline(key, { publicKeySpki: spkiB64, now });
    expect(status.valid).toBe(true);
    expect(status.tier).toBe('team');
    expect(badgeLabel(status)).toBe('TEAM');
    expect(isTeamUnlocked(status)).toBe(true);
  });

  it('rejects bad signature', async () => {
    const { key, spkiB64 } = await mint({ tier: 'pro', iat: 1 });
    const parts = key.split('.');
    parts[2] = base64UrlEncode(new Uint8Array(64).fill(7));
    const status = await verifyLicenseKeyOffline(parts.join('.'), { publicKeySpki: spkiB64 });
    expect(status.valid).toBe(false);
    expect(status.reason).toBe('bad-signature');
    expect(badgeLabel(status)).toBe('MIT Free');
  });

  it('rejects bad prefix', async () => {
    const { key, spkiB64 } = await mint({ tier: 'pro', iat: 1 }, { prefix: 'WRONG' });
    const status = await verifyLicenseKeyOffline(key, { publicKeySpki: spkiB64 });
    expect(status.valid).toBe(false);
    expect(status.reason).toBe('bad-prefix');
  });

  it('rejects expired keys (with skew)', async () => {
    const now = 1_700_000_000;
    const { key, spkiB64 } = await mint({ tier: 'pro', iat: now - 1000, exp: now - 400 });
    const status = await verifyLicenseKeyOffline(key, { publicKeySpki: spkiB64, now });
    expect(status.valid).toBe(false);
    expect(status.reason).toBe('expired');
  });

  it('allows near-expiry within skew', async () => {
    const now = 1_700_000_000;
    const { key, spkiB64 } = await mint({ tier: 'pro', iat: now - 10, exp: now - 60 });
    const status = await verifyLicenseKeyOffline(key, { publicKeySpki: spkiB64, now });
    expect(status.valid).toBe(true);
  });

  it('fails open when public key is missing', async () => {
    const { key } = await mint({ tier: 'pro', iat: 1 });
    const status = await verifyLicenseKeyOffline(key, { publicKeySpki: '' });
    expect(status.valid).toBe(false);
    expect(status.tier).toBe('community');
    expect(status.reason).toBe('no-verify-key');
  });

  it('rejects malformed strings', async () => {
    const status = await verifyLicenseKeyOffline('not-a-key', { publicKeySpki: 'AAAA' });
    expect(status.valid).toBe(false);
    expect(status.reason).toBe('malformed');
  });
});

describe('refreshLicenseState', () => {
  const area = fakeBrowser.storage.local;

  beforeEach(() => fakeBrowser.reset());

  it('persists community status when no key', async () => {
    const status = await refreshLicenseState({ local: area, publicKeySpki: 'x' });
    expect(status.valid).toBe(false);
    expect((await area.get(LICENSE_STATUS_STORAGE))[LICENSE_STATUS_STORAGE]).toMatchObject({
      valid: false,
      tier: 'community',
    });
  });

  it('prefers a valid managed key over local paste', async () => {
    const now = 1_700_000_000;
    const managed = await mint({ tier: 'team', iat: now, seats: 5 });
    const localKey = await mint({ tier: 'pro', iat: now });
    await area.set({ [LICENSE_KEY_STORAGE]: localKey.key });

    const managedArea = {
      async get() {
        return { [LICENSE_KEY_STORAGE]: managed.key };
      },
    };

    const status = await refreshLicenseState({
      local: area,
      managed: managedArea,
      publicKeySpki: managed.spkiB64,
      now,
    });
    expect(status.valid).toBe(true);
    expect(status.tier).toBe('team');
    expect(status.fromManaged).toBe(true);
  });

  it('saveLicenseKey then clearLicenseKey round-trips', async () => {
    const now = 1_700_000_000;
    const { key, spkiB64 } = await mint({ tier: 'pro', iat: now });
    const saved = await saveLicenseKey(area, key, { publicKeySpki: spkiB64, now });
    expect(saved.valid).toBe(true);
    expect((await area.get(LICENSE_KEY_STORAGE))[LICENSE_KEY_STORAGE]).toBe(key);

    const cleared = await clearLicenseKey(area, { publicKeySpki: spkiB64, now });
    expect(cleared.valid).toBe(false);
    expect(badgeLabel(cleared)).toBe('MIT Free');
  });
});
