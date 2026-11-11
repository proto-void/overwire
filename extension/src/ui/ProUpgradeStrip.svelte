<script lang="ts">
  import { browser } from 'wxt/browser';
  import {
    LICENSE_KEY_STORAGE,
    LICENSE_STATUS_STORAGE,
    PRICING_URL,
    loadLicenseStatus,
    refreshLicenseState,
    shouldShowProUpgradeCta,
    type LicenseStatus,
    type ManagedStorageLike,
  } from '../licensing/verify';
  import LicenseModal from './LicenseModal.svelte';

  /**
   * Fail-open Pro CTA: soft upgrade affordance only. Never disables MIT / Pro tool buttons.
   */
  let {
    /** Optional short context line (e.g. "ER · compare · designer"). */
    hint = 'Power tools stay usable without a key.',
  }: {
    hint?: string;
  } = $props();

  const area = browser.storage.local;
  const managedStorage: ManagedStorageLike | null =
    (browser.storage as unknown as { managed?: ManagedStorageLike }).managed ?? null;

  let status: LicenseStatus | undefined = $state();
  let modalOpen = $state(false);

  const show = $derived(shouldShowProUpgradeCta(status));

  $effect(() => {
    void refreshLicenseState({ local: area, managed: managedStorage })
      .then((s) => (status = s))
      .catch(() => loadLicenseStatus(area).then((s) => (status = s)));

    const onChanged = (changes: Record<string, unknown>, areaName: string) => {
      if (
        (areaName === 'local' || areaName === 'managed') &&
        (LICENSE_KEY_STORAGE in changes || LICENSE_STATUS_STORAGE in changes)
      ) {
        void loadLicenseStatus(area).then((s) => (status = s));
      }
    };
    browser.storage.onChanged.addListener(onChanged);
    return () => browser.storage.onChanged.removeListener(onChanged);
  });
</script>

{#if show}
  <div class="pro-upgrade-strip" data-testid="pro-upgrade-strip" role="status">
    <p class="copy">
      <strong>Overwire Pro</strong>
      <span class="muted">{hint}</span>
    </p>
    <div class="actions">
      <button type="button" class="btn text" data-testid="pro-upgrade-paste" onclick={() => (modalOpen = true)}>
        Paste key
      </button>
      <a class="btn" href={PRICING_URL} target="_blank" rel="noopener noreferrer">Get Pro</a>
    </div>
  </div>
{/if}

<LicenseModal
  open={modalOpen}
  {area}
  managed={managedStorage}
  {status}
  onclose={() => (modalOpen = false)}
  onstatus={(next) => (status = next)}
/>

<style>
  .pro-upgrade-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2, 0.5rem);
    padding: 0.45rem 0.65rem;
    border: 1px solid var(--border);
    border-radius: var(--radius, 6px);
    background: color-mix(in srgb, var(--accent, #f97316) 8%, var(--surface-2, var(--surface)));
    font-size: 0.8rem;
  }

  .copy {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem 0.55rem;
    line-height: 1.35;
  }

  .muted {
    color: var(--text-muted, var(--muted));
    font-weight: 400;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    margin-inline-start: auto;
  }

  a.btn {
    text-decoration: none;
  }
</style>
