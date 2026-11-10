import { describe, expect, it, vi } from 'vitest';
import type { PageApi } from '../page-inject/sync';
import { LEGACY_SRI_RUNTIME_ID, SRI_RUNTIME_FILE, SRI_RUNTIME_ID, syncSriRuntime } from './sri-runtime';

function fakeScripting() {
  const content = new Map<string, unknown>();
  const scripting = {
    getRegisteredContentScripts: vi.fn(async ({ ids }: { ids?: string[] } = {}) => [...content.keys()].filter((id) => !ids || ids.includes(id)).map((id) => ({ id }))),
    registerContentScripts: vi.fn(async (scripts: { id: string }[]) => scripts.forEach((script) => content.set(script.id, script))),
    unregisterContentScripts: vi.fn(async ({ ids }: { ids?: string[] } = {}) => (ids ?? [...content.keys()]).forEach((id) => content.delete(id))),
  };
  return { scripting: scripting as unknown as PageApi['scripting'], content, calls: scripting };
}

describe('syncSriRuntime', () => {
  it('registers the MAIN-world hook only while a body rule is armed', async () => {
    const { scripting, content, calls } = fakeScripting();
    expect(await syncSriRuntime(scripting, true)).toBeUndefined();
    expect(content.get(SRI_RUNTIME_ID)).toMatchObject({ world: 'MAIN', runAt: 'document_start', allFrames: true, js: [SRI_RUNTIME_FILE] });
    expect(await syncSriRuntime(scripting, true)).toBeUndefined();
    expect(calls.registerContentScripts).toHaveBeenCalledTimes(1);

    expect(await syncSriRuntime(scripting, false)).toBeUndefined();
    expect(content.size).toBe(0);
  });

  it('reports a registration failure without throwing', async () => {
    const { scripting, calls } = fakeScripting();
    calls.registerContentScripts.mockRejectedValueOnce(new Error('no file'));
    expect(await syncSriRuntime(scripting, true)).toBe('no file');
  });

  it('unregisters legacy detour-sri before registering overwire-sri', async () => {
    const { scripting, content, calls } = fakeScripting();
    content.set(LEGACY_SRI_RUNTIME_ID, { id: LEGACY_SRI_RUNTIME_ID });
    expect(await syncSriRuntime(scripting, true)).toBeUndefined();
    expect(content.has(LEGACY_SRI_RUNTIME_ID)).toBe(false);
    expect(content.get(SRI_RUNTIME_ID)).toMatchObject({ id: SRI_RUNTIME_ID, js: [SRI_RUNTIME_FILE] });
    expect(calls.unregisterContentScripts).toHaveBeenCalledWith({ ids: [LEGACY_SRI_RUNTIME_ID] });
  });
});
