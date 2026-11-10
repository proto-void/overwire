<!-- extension/src/entrypoints/options/db/JsonTreeView.svelte -->
<script lang="ts">
  import JsonTreeView from './JsonTreeView.svelte';

  interface Props {
    value: unknown;
    label?: string;
    isLast?: boolean;
    depth?: number;
  }

  let { value, label = '', isLast = true, depth = 0 }: Props = $props();
  let toggleState = $state<boolean | null>(null);
  let expanded = $derived.by(() => toggleState ?? depth < 1);

  // Controls the string clipping state locally for this view element node
  let textExpanded = $state(false);
  const PAGE_SIZE = 100;
  let visibleCount = $state(PAGE_SIZE);

  const isObject = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === 'object' && !Array.isArray(v);
  const isArr = (v: unknown): v is unknown[] => Array.isArray(v);

  function toggle() {
    toggleState = !expanded;
    if (!expanded) visibleCount = PAGE_SIZE;
  }

  function showMore() {
    visibleCount += PAGE_SIZE;
  }
</script>

<div class="json-node" class:nest={depth > 0}>
  {#if isObject(value) || isArr(value)}
    {@const keys = isObject(value) ? Object.keys(value) : null}
    {@const entries = isObject(value) ? Object.entries(value) : value.map((v, i) => [String(i), v] as [string, unknown])}
    {@const openBracket = isObject(value) ? '{' : '['}
    {@const closeBracket = isObject(value) ? '}' : ']'}
    {@const shown = entries.slice(0, visibleCount)}
    {@const remaining = entries.length - shown.length}

    <div class="row layout-row" onclick={toggle} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggle()}>
      <button type="button" class="chev" aria-expanded={expanded}>{expanded ? '▾' : '▸'}</button>
      <div class="obj-text">
        {#if label}<span class="json-key">"{label}"</span><span class="json-colon">: </span>{/if}
        <span class="json-bracket">{openBracket}</span>
        {#if !expanded}
          <span class="json-summary">{isObject(value) ? `${keys!.length} keys` : `${value.length} items`}</span>
          <span class="json-bracket">{closeBracket}{isLast ? '' : ','}</span>
        {/if}
      </div>
    </div>

    {#if expanded}
      <div class="children">
        {#each shown as [k, val], index}
          <JsonTreeView
            value={val}
            label={isObject(value) ? String(k) : ''}
            isLast={remaining === 0 && index === shown.length - 1}
            depth={depth + 1}
          />
        {/each}
        {#if remaining > 0}
          <div class="row layout-row show-more-row">
            <span class="chev spacer" aria-hidden="true"></span>
            <button type="button" class="show-more-btn" onclick={(e) => { e.stopPropagation(); showMore(); }}>
              Show {Math.min(PAGE_SIZE, remaining)} more ({remaining.toLocaleString()} remaining)
            </button>
          </div>
        {/if}
      </div>
      <div class="row layout-row">
        <span class="chev spacer" aria-hidden="true"></span>
        <div class="obj-text">
          <span class="json-bracket">{closeBracket}{isLast ? '' : ','}</span>
        </div>
      </div>
    {/if}
  {:else}
    <div class="row layout-row">
      <span class="chev spacer" aria-hidden="true"></span>
      <div class="obj-text primitive">
        {#if label}<span class="json-key">"{label}"</span><span class="json-colon">: </span>{/if}
        {#if typeof value === 'string'}
          <!-- Clipped class controls inline-truncation; drops away on expansion -->
          <span class="json-string" class:clipped={!textExpanded}>"{value}"</span>
          
          {#if value.length > 40}
            <button 
              type="button" 
              class="toggle-text-btn" 
              onclick={(e) => { e.stopPropagation(); textExpanded = !textExpanded; }}
            >
              {textExpanded ? 'show less' : 'show more'}
            </button>
          {/if}
        {:else}
          <span class="json-primitive type-{typeof value}">{String(value)}</span>
        {/if}
        <span class="json-comma">{isLast ? '' : ','}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .json-node {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.8rem;
    line-height: 1.5;
    color: inherit;
    width: 100%;
  }
  .nest {
    margin-left: 0.75rem;
    border-left: 1px solid color-mix(in srgb, var(--border) 35%, transparent);
    padding-left: 0.25rem;
  }
  .layout-row {
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: flex-start;
  }
  .layout-row:hover {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
  }
  .row {
    display: flex;
    align-items: flex-start;
    min-width: 0;
  }
  .children {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .chev {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.2rem;
    border: 0;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    font: inherit;
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }
  .chev.spacer { visibility: hidden; }
  .obj-text {
    flex: 1;
    min-width: 0;
    padding: 1px 4px;
    word-break: break-all;
    white-space: normal;
  }
  .json-key {
    color: var(--text);
    opacity: 0.75;
    font-weight: 500;
    white-space: nowrap;
    display: inline-block;
  }
  .json-colon { color: var(--muted); }
  .json-string { 
    color: var(--accent); 
  }
  
  /* When clipped, text stays on one line. When expanded, it wraps naturally */
  .json-string.clipped {
    display: inline-block;
    max-width: 40ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }
  
  .toggle-text-btn {
    background: var(--surface-2, rgba(255, 255, 255, 0.05));
    color: var(--text-muted, var(--muted));
    border: 1px solid var(--border);
    font-family: inherit;
    font-size: 0.68rem;
    padding: 1px 5px;
    margin-left: 6px;
    border-radius: 3px;
    cursor: pointer;
    user-select: none;
    display: inline-block;
    vertical-align: middle;
  }
  .toggle-text-btn:hover {
    color: var(--fg, var(--text));
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }

  .json-primitive.type-number { color: #4ec9b0; }
  .json-primitive.type-boolean { color: #569cd6; font-weight: 600; }
  .json-comma, .json-bracket { color: var(--muted); font-weight: 600; }
  .json-summary {
    font-size: 0.7rem;
    color: var(--muted);
    background: color-mix(in srgb, var(--muted) 15%, transparent);
    padding: 1px 5px;
    margin: 0 2px;
    border-radius: 3px;
  }
  .show-more-row {
    cursor: default;
  }
  .show-more-btn {
    background: var(--surface-2, rgba(255, 255, 255, 0.05));
    color: var(--text-muted, var(--muted));
    border: 1px solid var(--border);
    font-family: inherit;
    font-size: 0.72rem;
    padding: 2px 8px;
    margin: 2px 0;
    border-radius: 4px;
    cursor: pointer;
  }
  .show-more-btn:hover {
    color: var(--fg, var(--text));
    background: color-mix(in srgb, var(--accent) 12%, transparent);
  }
</style>
