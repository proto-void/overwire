import { describe, expect, it } from 'vitest';
import { isScriptRunResult, LEGACY_SCRIPT_RESULT_TYPE, SCRIPT_RESULT_TYPE } from './scripts';

describe('isScriptRunResult', () => {
  it('accepts overwire and legacy detour result types', () => {
    expect(isScriptRunResult({ type: SCRIPT_RESULT_TYPE, id: '1', ok: true, tests: [] })).toBe(true);
    expect(isScriptRunResult({ type: LEGACY_SCRIPT_RESULT_TYPE, id: '1', ok: true, tests: [] })).toBe(true);
    expect(isScriptRunResult({ type: 'other', id: '1', ok: true, tests: [] })).toBe(false);
  });
});
