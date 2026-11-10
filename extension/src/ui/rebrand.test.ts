import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { dismissRebrandBanner, REBRAND_SEEN_KEY, shouldShowRebrandBanner } from './rebrand';

const area = fakeBrowser.storage.local;

describe('rebrand banner', () => {
  beforeEach(() => fakeBrowser.reset());

  it('stays hidden on a fresh profile', async () => {
    expect(await shouldShowRebrandBanner(area)).toBe(false);
  });

  it('shows when legacy workspace data exists and the notice is unseen', async () => {
    await area.set({ workspace: { v: 1, data: { groups: [] } } });
    expect(await shouldShowRebrandBanner(area)).toBe(true);
  });

  it('shows when dbConnections or apiCollections exist', async () => {
    await area.set({ dbConnections: [] });
    expect(await shouldShowRebrandBanner(area)).toBe(true);
    await fakeBrowser.reset();
    await area.set({ apiCollections: [] });
    expect(await shouldShowRebrandBanner(area)).toBe(true);
  });

  it('hides after dismiss', async () => {
    await area.set({ workspace: { v: 1, data: { groups: [] } } });
    await dismissRebrandBanner(area);
    expect((await area.get(REBRAND_SEEN_KEY))[REBRAND_SEEN_KEY]).toBe(true);
    expect(await shouldShowRebrandBanner(area)).toBe(false);
  });
});
