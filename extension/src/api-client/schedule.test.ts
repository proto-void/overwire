import { describe, expect, it, vi } from 'vitest';
import {
  alarmNameFor,
  LEGACY_ALARM_PREFIX,
  migrateLegacyApiRunAlarms,
  MIN_INTERVAL_MINUTES,
  normalizePeriodMinutes,
  scheduleIdFromAlarm,
} from './schedule';

describe('api schedule helpers', () => {
  it('builds and parses overwire alarm names', () => {
    expect(alarmNameFor('abc')).toBe('overwire-api-run:abc');
    expect(scheduleIdFromAlarm('overwire-api-run:abc')).toBe('abc');
    expect(scheduleIdFromAlarm('other')).toBeNull();
  });

  it('still parses legacy detour alarm names', () => {
    expect(scheduleIdFromAlarm('detour-api-run:abc')).toBe('abc');
    expect(scheduleIdFromAlarm(`${LEGACY_ALARM_PREFIX}`)).toBeNull();
  });

  it('clamps period to chrome.alarms minimum', () => {
    expect(normalizePeriodMinutes(0.5)).toBe(MIN_INTERVAL_MINUTES);
    expect(normalizePeriodMinutes(5.4)).toBe(5);
  });

  it('migrates legacy alarms to the overwire prefix', async () => {
    const create = vi.fn();
    const clear = vi.fn(async () => true);
    const migrated = await migrateLegacyApiRunAlarms({
      getAll: async () => [
        { name: 'detour-api-run:s1', periodInMinutes: 3 },
        { name: 'overwire-api-run:s2', periodInMinutes: 5 },
        { name: 'unrelated', periodInMinutes: 1 },
      ],
      clear,
      create,
    });
    expect(migrated).toBe(1);
    expect(clear).toHaveBeenCalledWith('detour-api-run:s1');
    expect(create).toHaveBeenCalledWith('overwire-api-run:s1', { periodInMinutes: 3 });
  });
});
