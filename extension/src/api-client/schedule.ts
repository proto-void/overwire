import * as v from 'valibot';

export const API_SCHEDULES_KEY = 'apiSchedules';
export const ALARM_PREFIX = 'overwire-api-run:';
/** Pre-Overwire alarm names; still accepted on fire and cleared/migrated on update. */
export const LEGACY_ALARM_PREFIX = 'detour-api-run:';
/** chrome.alarms minimum period in minutes. */
export const MIN_INTERVAL_MINUTES = 1;

export const ApiScheduleSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  name: v.pipe(v.string(), v.minLength(1)),
  collectionId: v.string(),
  folderId: v.optional(v.nullable(v.string()), null),
  periodMinutes: v.pipe(v.number(), v.minValue(MIN_INTERVAL_MINUTES)),
  enabled: v.optional(v.boolean(), true),
  notifyOnFail: v.optional(v.boolean(), false),
  createdAt: v.number(),
});
export type ApiSchedule = v.InferOutput<typeof ApiScheduleSchema>;

export function alarmNameFor(scheduleId: string): string {
  return `${ALARM_PREFIX}${scheduleId}`;
}

export function legacyAlarmNameFor(scheduleId: string): string {
  return `${LEGACY_ALARM_PREFIX}${scheduleId}`;
}

export function scheduleIdFromAlarm(name: string): string | null {
  if (name.startsWith(ALARM_PREFIX)) return name.slice(ALARM_PREFIX.length) || null;
  if (name.startsWith(LEGACY_ALARM_PREFIX)) return name.slice(LEGACY_ALARM_PREFIX.length) || null;
  return null;
}

export function normalizePeriodMinutes(minutes: number): number {
  return Math.max(MIN_INTERVAL_MINUTES, Math.round(minutes));
}

/** Rewrite legacy `detour-api-run:*` alarms to `overwire-api-run:*` (same period). */
export async function migrateLegacyApiRunAlarms(alarmsApi: {
  getAll(): Promise<{ name: string; periodInMinutes?: number }[]>;
  clear(name: string): Promise<boolean>;
  create(name: string, info: { periodInMinutes: number }): Promise<void>;
}): Promise<number> {
  const all = await alarmsApi.getAll();
  let migrated = 0;
  for (const alarm of all) {
    if (!alarm.name.startsWith(LEGACY_ALARM_PREFIX)) continue;
    const id = alarm.name.slice(LEGACY_ALARM_PREFIX.length);
    const period = alarm.periodInMinutes;
    await alarmsApi.clear(alarm.name);
    if (!id || period === undefined) continue;
    await alarmsApi.create(alarmNameFor(id), { periodInMinutes: period });
    migrated += 1;
  }
  return migrated;
}

export const SCHEDULE_BROWSER_OPEN_COPY =
  'Scheduled runs use chrome.alarms and only fire while the browser is open. They do not run when Chrome is quit.';
