import type { PageApi } from '../page-inject/sync';

export const SRI_RUNTIME_ID = 'overwire-sri';
/** Pre-Overwire SRI content-script id; unregister on sync so the hook never double-injects. */
export const LEGACY_SRI_RUNTIME_ID = 'detour-sri';
/** WXT output of `entrypoints/sri-main.content.ts`. */
export const SRI_RUNTIME_FILE = 'content-scripts/sri-main.js';

/**
 * MAIN-world hook, present only while a body rule is armed.
 * Open pages keep the previous hook until the next load.
 */
export async function syncSriRuntime(scripting: PageApi['scripting'], armed: boolean): Promise<string | undefined> {
  try {
    const knownIds = [SRI_RUNTIME_ID, LEGACY_SRI_RUNTIME_ID];
    const present = new Set((await scripting.getRegisteredContentScripts({ ids: knownIds })).map((script) => script.id));
    const toUnregister = [
      ...(present.has(LEGACY_SRI_RUNTIME_ID) ? [LEGACY_SRI_RUNTIME_ID] : []),
      ...(!armed && present.has(SRI_RUNTIME_ID) ? [SRI_RUNTIME_ID] : []),
    ];
    if (toUnregister.length > 0) await scripting.unregisterContentScripts({ ids: toUnregister });
    if (!armed) return;
    if (present.has(SRI_RUNTIME_ID)) return;
    await scripting.registerContentScripts([
      {
        id: SRI_RUNTIME_ID,
        js: [SRI_RUNTIME_FILE],
        matches: ['<all_urls>'],
        runAt: 'document_start',
        allFrames: true,
        world: 'MAIN',
        persistAcrossSessions: true,
      },
    ]);
    return;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}
