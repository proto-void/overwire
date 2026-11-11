<script lang="ts">
  import { tick } from 'svelte';
  import type { StorageAreaLike } from '../rule-model/storage';
  import {
    LICENSE_KEY_STORAGE,
    PRICING_URL,
    clearLicenseKey,
    loadLicenseStatus,
    saveLicenseKey,
    type LicenseStatus,
    type ManagedStorageLike,
  } from '../licensing/verify';

  let {
    open,
    area,
    managed = null,
    status,
    onclose,
    onstatus,
  }: {
    open: boolean;
    area: StorageAreaLike;
    managed?: ManagedStorageLike | null;
    status: LicenseStatus | undefined | null;
    onclose: () => void;
    onstatus?: (next: LicenseStatus) => void;
  } = $props();

  let draft = $state('');
  let busy = $state(false);
  let localStatus: LicenseStatus | undefined | null = $state(null);
  let panel: HTMLElement | undefined = $state();
  let inputEl: HTMLTextAreaElement | undefined = $state();

  const shown = $derived(localStatus ?? status);

  $effect(() => {
    if (!open) return;
    localStatus = status;
    void (async () => {
      try {
        const bag = await area.get(LICENSE_KEY_STORAGE);
        const stored = bag[LICENSE_KEY_STORAGE];
        draft = typeof stored === 'string' ? stored : '';
      } catch {
        draft = '';
      }
      localStatus = await loadLicenseStatus(area);
      await tick();
      inputEl?.focus();
    })();
  });

  function onKeydown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onclose();
    }
  }

  async function applyKey() {
    busy = true;
    try {
      const next = await saveLicenseKey(area, draft, { managed });
      localStatus = next;
      onstatus?.(next);
    } finally {
      busy = false;
    }
  }

  async function removeKey() {
    busy = true;
    try {
      draft = '';
      const next = await clearLicenseKey(area, { managed });
      localStatus = next;
      onstatus?.(next);
    } finally {
      busy = false;
    }
  }

  function formatExp(exp: number | undefined): string {
    if (exp === undefined) return 'Does not expire';
    try {
      return new Date(exp * 1000).toLocaleString();
    } catch {
      return String(exp);
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="backdrop" data-testid="license-modal" role="presentation" onclick={onclose}>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
    <div
      class="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="license-modal-title"
      bind:this={panel}
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
    >
      <header>
        <h2 id="license-modal-title">License</h2>
        <button type="button" class="btn text" onclick={onclose} aria-label="Close">×</button>
      </header>

      <p class="lede muted">
        Paste an Overwire Pro or Team key. Verification is offline on this device. Core MIT features stay free forever
        with or without a key.
      </p>

      <label class="field">
        <span>License key</span>
        <textarea
          bind:this={inputEl}
          bind:value={draft}
          rows="3"
          spellcheck="false"
          autocomplete="off"
          placeholder="OWPRO.…."
          disabled={busy || shown?.fromManaged}
        ></textarea>
      </label>

      {#if shown?.fromManaged}
        <p class="note" role="status">Org key from managed policy is active.</p>
      {/if}

      <div class="result" data-testid="license-result">
        {#if shown?.valid && shown.claims}
          <p><strong>{shown.tier === 'team' ? 'TEAM' : 'PRO'}</strong> · offline verified</p>
          {#if shown.claims.seats !== undefined}
            <p class="muted">Seats: {shown.claims.seats}</p>
          {/if}
          <p class="muted">Expiry: {formatExp(shown.claims.exp)}</p>
          {#if shown.claims.features?.length}
            <p class="muted">Features: {shown.claims.features.join(', ')}</p>
          {/if}
        {:else}
          <p><strong>MIT Free</strong> (Community)</p>
          {#if shown?.reason && shown.reason !== 'missing' && shown.reason !== 'unset'}
            <p class="muted">Status: {shown.reason}</p>
          {/if}
        {/if}
      </div>

      <footer>
        <a class="btn primary" href={PRICING_URL} target="_blank" rel="noopener noreferrer">Get Overwire Pro</a>
        <div class="actions">
          {#if !shown?.fromManaged}
            <button type="button" class="btn text" onclick={removeKey} disabled={busy}>Clear</button>
            <button type="button" class="btn" onclick={applyKey} disabled={busy || !draft.trim()} aria-busy={busy}>
              {busy ? 'Checking…' : 'Save key'}
            </button>
          {/if}
        </div>
      </footer>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: grid;
    place-items: center;
    padding: var(--space-4);
    background: color-mix(in srgb, var(--bg, #000) 45%, transparent);
  }

  .panel {
    width: min(28rem, 100%);
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: 0 12px 40px color-mix(in srgb, #000 35%, transparent);
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  h2 {
    margin: 0;
    font-size: 1.05rem;
  }

  .lede {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.45;
  }

  .field {
    display: grid;
    gap: var(--space-1);
    font-size: 0.8rem;
    font-weight: 600;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    resize: vertical;
    min-height: 4.5rem;
    padding: var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font: inherit;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.75rem;
    font-weight: 400;
  }

  .result {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
    font-size: 0.85rem;
  }

  .result p {
    margin: 0.15rem 0;
  }

  .note {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .actions {
    display: flex;
    gap: var(--space-2);
    margin-inline-start: auto;
  }

  a.btn {
    text-decoration: none;
  }
</style>
