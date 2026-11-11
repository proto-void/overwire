<script lang="ts">
  import { badgeLabel, type LicenseStatus } from '../licensing/verify';

  let {
    status,
    onclick,
  }: {
    status: LicenseStatus | undefined | null;
    onclick?: () => void;
  } = $props();

  const label = $derived(badgeLabel(status));
  const tierClass = $derived(
    status?.valid && status.tier === 'team' ? 'team' : status?.valid && status.tier === 'pro' ? 'pro' : 'free',
  );
</script>

<button
  type="button"
  class="license-badge {tierClass}"
  data-testid="license-badge"
  title="License"
  {onclick}
>
  {label}
</button>

<style>
  .license-badge {
    display: inline-flex;
    align-items: center;
    min-height: 1.35rem;
    padding: 0 var(--space-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    color: var(--text-muted);
    font: inherit;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
  }

  .license-badge:hover,
  .license-badge:focus-visible {
    color: var(--text);
    outline: none;
    border-color: var(--text-muted);
  }

  .license-badge.pro {
    color: var(--accent, var(--text));
    border-color: color-mix(in srgb, var(--accent, var(--border)) 45%, var(--border));
  }

  .license-badge.team {
    color: var(--text);
    border-color: color-mix(in srgb, var(--text) 35%, var(--border));
    background: color-mix(in srgb, var(--surface-2) 70%, var(--text) 8%);
  }
</style>
