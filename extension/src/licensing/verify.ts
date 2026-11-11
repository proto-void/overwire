/**
 * Offline Ed25519 license verify (ADR-032 / Approved licensing.md).
 * No phone-home. MIT core stays free; invalid keys fail open to Community.
 */

import type { StorageAreaLike } from '../rule-model/storage';

export const LICENSE_KEY_STORAGE = 'licenseKey';
export const LICENSE_STATUS_STORAGE = 'licenseStatus';
export const LICENSE_PREFIX = 'OWPRO';
/** Clock skew window for `exp` claims (seconds). */
export const EXP_SKEW_SEC = 300;
export const PRICING_URL = 'https://overwire.protovoid.com/#pricing';

export type LicenseTier = 'pro' | 'team';
export type LicenseDisplayTier = 'community' | LicenseTier;

export type LicenseClaims = {
  tier: LicenseTier;
  iat: number;
  exp?: number;
  seats?: number;
  features?: string[];
  /** Stripe customer id or email hash — never a secret. */
  sub?: string;
};

export type LicenseStatus = {
  valid: boolean;
  tier: LicenseDisplayTier;
  claims?: LicenseClaims;
  reason?: string;
  /** True when the active key came from enterprise managed storage. */
  fromManaged?: boolean;
};

export type ManagedStorageLike = {
  get(keys?: string | string[] | null): Promise<Record<string, unknown>>;
};

export type LicenseStorageDeps = {
  local: StorageAreaLike;
  managed?: ManagedStorageLike | null;
  /** Override build-time public key (tests). SPKI bytes or base64url/base64 string. */
  publicKeySpki?: Uint8Array | string | null;
  now?: number;
};

const encoder = new TextEncoder();

const community = (reason: string, fromManaged = false): LicenseStatus => ({
  valid: false,
  tier: 'community',
  reason,
  fromManaged,
});

export function badgeLabel(status: LicenseStatus | undefined | null): string {
  if (!status?.valid) return 'MIT Free';
  if (status.tier === 'team') return 'TEAM';
  if (status.tier === 'pro') return 'PRO';
  return 'MIT Free';
}

/** Pro power tools may unlock; MIT core never consults this for lockout. */
export function isProUnlocked(status: LicenseStatus | undefined | null): boolean {
  return Boolean(status?.valid && (status.tier === 'pro' || status.tier === 'team'));
}

export function isTeamUnlocked(status: LicenseStatus | undefined | null): boolean {
  return Boolean(status?.valid && status.tier === 'team');
}

/**
 * Soft Pro upgrade CTA visibility. Fail open: show when Pro is not unlocked;
 * never use this to disable MIT or Pro tool buttons.
 */
export function shouldShowProUpgradeCta(status: LicenseStatus | undefined | null): boolean {
  return !isProUnlocked(status);
}

export function base64UrlDecode(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function base64UrlEncode(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Build-time public verify key (SPKI, base64url or standard base64). Empty = Community only. */
export function readBuildPublicKey(): string {
  try {
    const raw = import.meta.env.LICENSE_VERIFY_PUBLIC_KEY;
    return typeof raw === 'string' ? raw.trim() : '';
  } catch {
    return '';
  }
}

function toSpkiBytes(input: Uint8Array | string | null | undefined): Uint8Array | null {
  if (input == null) return null;
  if (input instanceof Uint8Array) return input.length > 0 ? input : null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const stripped = trimmed.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  try {
    return base64UrlDecode(stripped);
  } catch {
    return null;
  }
}

function parseClaims(payloadJson: string): { ok: true; claims: LicenseClaims } | { ok: false; reason: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(payloadJson);
  } catch {
    return { ok: false, reason: 'malformed-payload' };
  }
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'malformed-payload' };
  const o = raw as Record<string, unknown>;
  const tierRaw = typeof o.tier === 'string' ? o.tier.toLowerCase() : '';
  const tier: LicenseTier | null =
    tierRaw === 'pro' ? 'pro' : tierRaw === 'team' || tierRaw === 'enterprise' ? 'team' : null;
  if (!tier) return { ok: false, reason: 'bad-tier' };
  const iat = typeof o.iat === 'number' && Number.isFinite(o.iat) ? o.iat : NaN;
  if (!Number.isFinite(iat)) return { ok: false, reason: 'bad-iat' };
  const claims: LicenseClaims = { tier, iat };
  if (typeof o.exp === 'number' && Number.isFinite(o.exp)) claims.exp = o.exp;
  if (typeof o.seats === 'number' && Number.isFinite(o.seats) && o.seats > 0) claims.seats = o.seats;
  if (Array.isArray(o.features)) {
    claims.features = o.features.filter((f): f is string => typeof f === 'string');
  }
  if (typeof o.sub === 'string' && o.sub) claims.sub = o.sub;
  return { ok: true, claims };
}

/**
 * Verify an `OWPRO.<base64url-payload>.<base64url-sig>` key offline.
 * Signature covers the exact payload segment bytes (UTF-8 of the base64url string), matching the Stripe webhook template.
 */
export async function verifyLicenseKeyOffline(
  key: string,
  opts?: { publicKeySpki?: Uint8Array | string | null; now?: number },
): Promise<LicenseStatus> {
  const trimmed = key?.trim() ?? '';
  if (!trimmed) return community('missing');

  const parts = trimmed.split('.');
  if (parts.length !== 3) return community('malformed');
  const [prefix, payloadB64, sigB64] = parts as [string, string, string];
  if (prefix !== LICENSE_PREFIX) return community('bad-prefix');
  if (!payloadB64 || !sigB64) return community('malformed');

  const spki = toSpkiBytes(opts?.publicKeySpki ?? readBuildPublicKey());
  if (!spki) return community('no-verify-key');

  let signature: Uint8Array;
  try {
    signature = base64UrlDecode(sigB64);
  } catch {
    return community('malformed-sig');
  }

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey('spki', spki as BufferSource, { name: 'Ed25519' }, false, [
      'verify',
    ]);
  } catch {
    return community('unsupported-key');
  }

  let ok = false;
  try {
    ok = await crypto.subtle.verify('Ed25519', cryptoKey, signature as BufferSource, encoder.encode(payloadB64));
  } catch {
    return community('verify-failed');
  }
  if (!ok) return community('bad-signature');

  let payloadJson: string;
  try {
    payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
  } catch {
    return community('malformed-payload');
  }

  const parsed = parseClaims(payloadJson);
  if (!parsed.ok) return community(parsed.reason);

  const now = opts?.now ?? Math.floor(Date.now() / 1000);
  if (parsed.claims.exp !== undefined && now > parsed.claims.exp + EXP_SKEW_SEC) {
    return { valid: false, tier: 'community', claims: parsed.claims, reason: 'expired' };
  }

  return { valid: true, tier: parsed.claims.tier, claims: parsed.claims };
}

async function readManagedLicenseKey(managed: ManagedStorageLike | null | undefined): Promise<string | undefined> {
  if (!managed) return undefined;
  try {
    const bag = await managed.get(LICENSE_KEY_STORAGE);
    const v = bag?.[LICENSE_KEY_STORAGE];
    return typeof v === 'string' && v.trim() ? v.trim() : undefined;
  } catch {
    // Managed area may be absent outside enterprise policy.
    return undefined;
  }
}

/**
 * Re-verify stored / managed key and persist `licenseStatus`. Never throws for missing keys.
 */
export async function refreshLicenseState(deps: LicenseStorageDeps): Promise<LicenseStatus> {
  const { local, managed, publicKeySpki, now } = deps;
  try {
    const managedKey = await readManagedLicenseKey(managed);
    if (managedKey) {
      const managedStatus = await verifyLicenseKeyOffline(managedKey, { publicKeySpki, now });
      if (managedStatus.valid) {
        const status: LicenseStatus = { ...managedStatus, fromManaged: true };
        await local.set({ [LICENSE_STATUS_STORAGE]: status });
        return status;
      }
    }

    const bag = await local.get(LICENSE_KEY_STORAGE);
    const pasted = typeof bag[LICENSE_KEY_STORAGE] === 'string' ? (bag[LICENSE_KEY_STORAGE] as string) : '';
    const status = await verifyLicenseKeyOffline(pasted, { publicKeySpki, now });
    await local.set({ [LICENSE_STATUS_STORAGE]: status });
    return status;
  } catch (e) {
    const status = community(e instanceof Error ? e.message : 'refresh-error');
    try {
      await local.set({ [LICENSE_STATUS_STORAGE]: status });
    } catch {
      /* ignore */
    }
    return status;
  }
}

/** Persist a pasted key and refresh derived status (user path; does not write managed). */
export async function saveLicenseKey(
  local: StorageAreaLike,
  key: string,
  opts?: Omit<LicenseStorageDeps, 'local'>,
): Promise<LicenseStatus> {
  const trimmed = key.trim();
  await local.set({ [LICENSE_KEY_STORAGE]: trimmed });
  return refreshLicenseState({ local, ...opts });
}

export async function clearLicenseKey(
  local: StorageAreaLike,
  opts?: Omit<LicenseStorageDeps, 'local'>,
): Promise<LicenseStatus> {
  await local.set({ [LICENSE_KEY_STORAGE]: '' });
  return refreshLicenseState({ local, ...opts });
}

export async function loadLicenseStatus(local: StorageAreaLike): Promise<LicenseStatus> {
  try {
    const bag = await local.get(LICENSE_STATUS_STORAGE);
    const raw = bag[LICENSE_STATUS_STORAGE];
    if (!raw || typeof raw !== 'object') return community('unset');
    const s = raw as LicenseStatus;
    if (typeof s.valid !== 'boolean' || typeof s.tier !== 'string') return community('unset');
    return s;
  } catch {
    return community('unset');
  }
}
