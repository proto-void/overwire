import { browser } from 'wxt/browser';
import { syncRules } from '../engine-core/apply';
import { createCoalescer } from '../engine-core/coalesce';
import type { DnrApi } from '../engine-core/dnr';
import type { DebuggerApi, TabsApi } from '../engine-deep/chrome-session';
import type { WebRequestApi } from '../engine-deep/firefox-filter';
import { BODY_CONSENT_KEY } from '../engine-deep/permissions';
import { createBodyEngine, type PermissionQuery } from '../engine-deep/sync';
import { fetchText, handleBridgeMessage, type Sender } from '../page-inject/background-handlers';
import { LEGACY_RESYNC_MESSAGE, RESYNC_MESSAGE, type PageApi } from '../page-inject/sync';
import { BRIDGE_SESSION_KEY } from '../local-bridge/session';
import { ENABLED_KEY, WORKSPACE_KEY } from '../rule-model/storage';
import { startMatchLog, type ActionBadgeApi, type MatchLogDeps } from '../observability/install';
import { loadApiClientState, saveApiClientState } from '../api-client/storage';
import { runCollection, toStoredReport } from '../api-client/runner';
import { migrateLegacyApiRunAlarms, scheduleIdFromAlarm } from '../api-client/schedule';
import { loadWorkspace } from '../rule-model/storage';
import { brandName } from '../ui/brand-config';
import { LICENSE_KEY_STORAGE, refreshLicenseState } from '../licensing/verify';

export default defineBackground(() => {
  const dnr = browser.declarativeNetRequest as unknown as DnrApi;
  const area = browser.storage.local;
  const managed = (browser.storage as unknown as { managed?: { get: typeof browser.storage.local.get } })
    .managed;

  const refreshLicenseSafely = () =>
    refreshLicenseState({ local: area, managed }).catch((e) =>
      console.error(`${brandName}: license refresh failed`, e),
    );
  // Boot + lifecycle: local re-verify only (no phone-home).
  void refreshLicenseSafely();
  const page: PageApi = {
    scripting: browser.scripting as unknown as PageApi['scripting'],
    // Read live: it appears/disappears as the user flips the toggle or grants the permission, and can throw.
    get userScripts() {
      try {
        return (browser as unknown as { userScripts?: PageApi['userScripts'] }).userScripts;
      } catch {
        return undefined;
      }
    },
  };

  const firefox = import.meta.env.FIREFOX;
  const matches = startMatchLog({
    dnr: dnr as unknown as MatchLogDeps['dnr'],
    action: browser.action as unknown as ActionBadgeApi,
    local: area,
    session: browser.storage.session,
    tabs: browser.tabs as unknown as MatchLogDeps['tabs'],
    storageEvents: browser.storage.onChanged,
  });
  const bodyEngine = createBodyEngine({
    browser: firefox ? 'firefox' : 'chrome',
    permissions: browser.permissions as unknown as PermissionQuery,
    consent: async () => (await area.get(BODY_CONSENT_KEY))[BODY_CONSENT_KEY] === true,
    ...(firefox
      ? { firefox: { webRequest: browser.webRequest as unknown as WebRequestApi } }
      : {
          chrome: () => {
            try {
              const dbg = (browser as unknown as { debugger?: DebuggerApi }).debugger;
              if (!dbg?.onEvent || !dbg.attach) return undefined;
              return { debugger: dbg, tabs: browser.tabs as unknown as TabsApi };
            } catch {
              return undefined;
            }
          },
        }),
    onMatch: (note) => {
      void matches.note({ ...note, source: 'body' });
    },
  });

  const refresh = createCoalescer(async () => {
    const report = await syncRules(dnr, area, undefined, page, bodyEngine);
    if (report.refused.length > 0 || report.errors.length > 0) {
      console.warn(`Detour: ${report.applied.length} network and ${report.injected?.length ?? 0} page rule(s) applied, ${report.refused.length} refused`, report);
    }
  });
  const refreshSafely = () => refresh().catch((e) => console.error('Detour: failed to apply rules', e));

  // Dynamic rules persist across restarts but user scripts are cleared on update, so re-apply on both.
  // Also rewrite legacy detour-api-run:* alarms to overwire-api-run:*.
  const onInstalled = () => {
    void migrateLegacyApiRunAlarms(browser.alarms).catch((e) => console.error(`${brandName}: alarm migration failed`, e));
    refreshSafely();
    void refreshLicenseSafely();
  };
  browser.runtime.onInstalled.addListener(onInstalled);
  browser.runtime.onStartup.addListener(() => {
    refreshSafely();
    void refreshLicenseSafely();
  });
  browser.runtime.onSuspend?.addListener(() => {
    void bodyEngine.stop();
  });
  browser.permissions.onAdded.addListener(refreshSafely);
  browser.permissions.onRemoved.addListener(refreshSafely);
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && (WORKSPACE_KEY in changes || ENABLED_KEY in changes || BRIDGE_SESSION_KEY in changes)) void refreshSafely();
    if ((areaName === 'local' || areaName === 'managed') && LICENSE_KEY_STORAGE in changes) {
      void refreshLicenseSafely();
    }
  });

  browser.runtime.onMessage.addListener((message: unknown, sender) => {
    if (sender.id !== browser.runtime.id) return;
    const messageType = (message as { type?: unknown } | null)?.type;
    if (messageType === RESYNC_MESSAGE || messageType === LEGACY_RESYNC_MESSAGE) {
      if (sender.tab === undefined || sender.url?.startsWith(browser.runtime.getURL('/'))) void refreshSafely();
      return;
    }
    void handleBridgeMessage(message, sender as Sender, {
      local: area,
      session: browser.storage.session,
      insertCSS: (details) => browser.scripting.insertCSS(details),
      fetchText,
      onMatch: (match) => {
        void matches.note(match);
      },
    }).catch((e) => console.error('Detour: page message failed', e));
  });

  // API Tester scheduled runs (Slice B) — only while the browser is open.
  browser.alarms.onAlarm.addListener((alarm) => {
    const scheduleId = scheduleIdFromAlarm(alarm.name);
    if (!scheduleId) return;
    void (async () => {
      const loaded = await loadApiClientState(area);
      if (!loaded.ok) return;
      const schedule = (loaded.value.schedules ?? []).find((s) => s.id === scheduleId && s.enabled !== false);
      if (!schedule) return;
      const collection = loaded.value.collections.find((c) => c.id === schedule.collectionId);
      if (!collection) return;
      const ws = await loadWorkspace(area);
      const workspace = ws.ok ? ws.value : { groups: [] };
      const env = loaded.value.environments.find((e) => e.id === loaded.value.activeEnvironmentId);
      try {
        const report = await runCollection({
          collection,
          folderId: schedule.folderId,
          iterations: 1,
          globalApplyRules: loaded.value.applyRules !== false,
          workspace,
          scopes: {
            environment: env?.variables ?? [],
            collection: collection.variables ?? [],
            globals: loaded.value.globals ?? [],
          },
          skipScripts: true,
        });
        await saveApiClientState(area, {
          ...loaded.value,
          runs: [toStoredReport(report), ...(loaded.value.runs ?? [])].slice(0, 50),
        });
        if (schedule.notifyOnFail && report.summary.failed > 0) {
          try {
            await browser.notifications?.create(`overwire-api-run-${report.id}`, {
              type: 'basic',
              iconUrl: 'icons/128.png',
              title: `${brandName} API Tester`,
              message: `Scheduled “${schedule.name}”: ${report.summary.failed} failed of ${report.summary.total}`,
            });
          } catch {
            /* notifications optional */
          }
        }
      } catch (e) {
        console.error(`${brandName}: scheduled API run failed`, e);
      }
    })();
  });
});
