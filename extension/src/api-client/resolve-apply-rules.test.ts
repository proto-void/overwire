import { describe, expect, it } from 'vitest';
import { resolveApplyRules } from './resolve-apply-rules';

describe('resolveApplyRules', () => {
  it('inherits the global default', () => {
    expect(resolveApplyRules(true, 'inherit')).toBe(true);
    expect(resolveApplyRules(false, 'inherit')).toBe(false);
    expect(resolveApplyRules(true, undefined)).toBe(true);
    expect(resolveApplyRules(false, null)).toBe(false);
  });

  it('forces on', () => {
    expect(resolveApplyRules(false, 'on')).toBe(true);
  });

  it('forces off', () => {
    expect(resolveApplyRules(true, 'off')).toBe(false);
  });
});
