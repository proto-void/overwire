import type { ApplyRulesMode } from './model';

/**
 * Dual-scope Apply rules:
 * - Global default lives in api-client settings (`applyRules` boolean, default on).
 * - Per-request override: `inherit` | `on` | `off` (default inherit).
 * Explicit per-request wins; otherwise use global.
 */
export function resolveApplyRules(
  globalDefault: boolean,
  perRequest: ApplyRulesMode | undefined | null,
): boolean {
  if (perRequest === 'on') return true;
  if (perRequest === 'off') return false;
  return globalDefault;
}

/** @deprecated Prefer resolveApplyRules */
export const resolveApplyDetourRules = resolveApplyRules;
