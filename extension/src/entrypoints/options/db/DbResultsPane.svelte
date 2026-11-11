<!-- extension/src/entrypoints/options/db/DbResultsPane.svelte -->
<script lang="ts">
  import { formatDbCell } from '../../../db-client/cell-format';
  import type { DbQueryTabResult } from '../../../db-client/model';

  let {
    resultSets = [],
    activeResultIndex = 0,
    batchMessages = [],
    running = false,
    batchProgress = null,
    chunkProgress = null,
    canCancel = false,
    activePane = $bindable<'results' | 'messages'>('results'),
    onSelectResult,
    onLoadMore,
    onCancel,
    onRowClick,
    onCellClick,
  }: {
    resultSets?: DbQueryTabResult[];
    activeResultIndex?: number;
    batchMessages?: string[];
    running?: boolean;
    batchProgress?: { current: number; total: number } | null;
    chunkProgress?: { index: number; total: number } | null;
    canCancel?: boolean;
    activePane?: 'results' | 'messages';
    onSelectResult: (index: number) => void;
    onLoadMore: () => void;
    onCancel?: () => void;
    onRowClick: (row: unknown[], index: number) => void;
    onCellClick: (column: string, value: unknown, row: unknown[], index: number) => void;
  } = $props();

  const ROW_HEIGHT = 28;
  const OVERSCAN = 10;
  const DEFAULT_COL_W = '16rem';

  const active = $derived(resultSets[activeResultIndex] ?? null);
  const columns = $derived(active?.columns ?? []);
  const rows = $derived(active?.rows ?? []);
  const timingMs = $derived(active?.timingMs);
  const pageToken = $derived(active?.pageToken ?? null);

  const allMessages = $derived.by(() => {
    const out: string[] = [...batchMessages];
    for (let i = 0; i < resultSets.length; i++) {
      const r = resultSets[i]!;
      for (const w of r.warnings ?? []) out.push(`Result ${i + 1}: ${w}`);
      for (const m of r.messages ?? []) out.push(`Result ${i + 1}: ${m}`);
    }
    return out;
  });

  let colWidths = $state<Record<string, number>>({});
  let scrollTop = $state(0);
  let viewportHeight = $state(280);
  let gridWrapEl: HTMLDivElement | undefined = $state();
  let tableEl: HTMLTableElement | undefined = $state();
  let elapsedMs = $state(0);

  const startIndex = $derived(Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN));
  const endIndex = $derived(
    Math.min(rows.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN),
  );
  const visibleRows = $derived(rows.slice(startIndex, endIndex));
  const topPad = $derived(startIndex * ROW_HEIGHT);
  const bottomPad = $derived(Math.max(0, (rows.length - endIndex) * ROW_HEIGHT));

  const tableColVars = $derived.by(() => {
    const parts: string[] = [];
    for (let i = 0; i < columns.length; i++) {
      const w = colWidths[columns[i]!];
      if (w) parts.push(`--col-w-${i}:${w}px`);
    }
    return parts.join(';');
  });

  const elapsedLabel = $derived(
    elapsedMs < 1000 ? `${(elapsedMs / 1000).toFixed(1)}s` : `${(elapsedMs / 1000).toFixed(1)}s`,
  );

  const chunkMbLabel = $derived.by(() => {
    if (!chunkProgress || chunkProgress.total <= 0) return null;
    const approxMb = ((chunkProgress.index + 1) * 0.9).toFixed(1);
    return `Receiving large result: chunk ${chunkProgress.index + 1} of ${chunkProgress.total} (~${approxMb} MB)…`;
  });

  $effect(() => {
    if (!running) {
      elapsedMs = 0;
      return;
    }
    const started = Date.now();
    elapsedMs = 0;
    const id = setInterval(() => {
      elapsedMs = Date.now() - started;
    }, 100);
    return () => clearInterval(id);
  });

  $effect(() => {
    const el = gridWrapEl;
    if (!el) return;
    const measure = () => {
      viewportHeight = el.clientHeight || 280;
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  });

  function onScroll() {
    if (!gridWrapEl) return;
    scrollTop = gridWrapEl.scrollTop;
  }

  function applyColVar(ci: number, widthPx: number) {
    tableEl?.style.setProperty(`--col-w-${ci}`, `${widthPx}px`);
  }

  function initResize(e: MouseEvent, colName: string, ci: number) {
    e.preventDefault();
    e.stopPropagation();

    const thElement = (e.currentTarget as HTMLElement).parentElement;
    if (!thElement) return;

    const startWidth = thElement.getBoundingClientRect().width;
    const startX = e.clientX;

    function onMouseMove(moveEvent: MouseEvent) {
      const next = Math.max(60, startWidth + (moveEvent.clientX - startX));
      applyColVar(ci, next);
    }

    function onMouseUp(upEvent: MouseEvent) {
      const next = Math.max(60, startWidth + (upEvent.clientX - startX));
      colWidths[colName] = next;
      applyColVar(ci, next);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    }

    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }
</script>

<div class="results">
  <div class="tabs" role="tablist">
    {#each resultSets as _rs, i (i)}
      <button
        type="button"
        class:active={activePane === 'results' && activeResultIndex === i}
        role="tab"
        aria-selected={activePane === 'results' && activeResultIndex === i}
        onclick={() => {
          onSelectResult(i);
          activePane = 'results';
        }}
      >
        Result {i + 1}{#if resultSets[i]?.rows?.length} ({resultSets[i]!.rows.length}){/if}
      </button>
    {/each}
    <button
      type="button"
      class:active={activePane === 'messages'}
      role="tab"
      aria-selected={activePane === 'messages'}
      onclick={() => (activePane = 'messages')}
    >
      Messages{#if allMessages.length} ({allMessages.length}){/if}
    </button>
    <span class="meta">
      {#if timingMs !== undefined}{timingMs} ms{/if}
      {#if rows.length} · {rows.length} row{rows.length === 1 ? '' : 's'}{/if}
    </span>
  </div>

  {#if running}
    <div class="run-bar" role="status" aria-live="polite">
      <span class="run-phase">
        {#if batchProgress && batchProgress.total > 1}
          Running statement {batchProgress.current} of {batchProgress.total}…
        {:else}
          Executing…
        {/if}
      </span>
      <span class="run-elapsed">{elapsedLabel}</span>
      {#if chunkMbLabel}
        <span class="run-chunk">{chunkMbLabel}</span>
      {/if}
      {#if canCancel && onCancel}
        <button type="button" class="btn cancel" onclick={onCancel}>Cancel query</button>
      {/if}
      {#if chunkProgress && chunkProgress.total > 0}
        <div
          class="run-meter"
          style="--pct: {Math.min(100, ((chunkProgress.index + 1) / chunkProgress.total) * 100)}%"
        ></div>
      {/if}
    </div>
  {/if}

  {#if activePane === 'results'}
    <div
      class="grid-wrap"
      class:dimmed={running && rows.length > 0}
      bind:this={gridWrapEl}
      onscroll={onScroll}
    >
      {#if resultSets.length === 0 || columns.length === 0}
        {#if running}
          <p class="empty">Waiting for results…</p>
        {:else}
          <p class="empty">Run a query to see results here.</p>
        {/if}
      {:else}
        <table
          class="grid"
          bind:this={tableEl}
          style="table-layout: fixed; width: max-content; min-width: 100%; {tableColVars}"
        >
          <colgroup>
            {#each columns as _col, ci}
              <col style="width: var(--col-w-{ci}, {DEFAULT_COL_W});" />
            {/each}
          </colgroup>
          <thead>
            <tr>
              {#each columns as col, ci}
                <th style="width: var(--col-w-{ci}, {DEFAULT_COL_W}); position: relative;">
                  <span class="th-content">{col}</span>
                  <button
                    type="button"
                    class="resize-handle"
                    aria-label="Resize column"
                    tabindex="-1"
                    onmousedown={(e) => initResize(e, col, ci)}
                  ></button>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#if topPad > 0}
              <tr class="spacer" aria-hidden="true">
                <td colspan={columns.length} style="height: {topPad}px; padding: 0; border: 0;"></td>
              </tr>
            {/if}
            {#each visibleRows as row, localI (startIndex + localI)}
              {@const rowIndex = startIndex + localI}
              <tr style="height: {ROW_HEIGHT}px;" onclick={() => onRowClick(row, rowIndex)}>
                {#each row as cell, ci}
                  {@const cellText = formatDbCell(cell)}
                  <td style="max-width: var(--col-w-{ci}, {DEFAULT_COL_W});">
                    <button
                      type="button"
                      class="cell"
                      title={cellText}
                      onclick={(e) => {
                        e.stopPropagation();
                        onCellClick(columns[ci] ?? String(ci), cell, row, rowIndex);
                      }}
                    >
                      {cellText}
                    </button>
                  </td>
                {/each}
              </tr>
            {/each}
            {#if bottomPad > 0}
              <tr class="spacer" aria-hidden="true">
                <td colspan={columns.length} style="height: {bottomPad}px; padding: 0; border: 0;"></td>
              </tr>
            {/if}
          </tbody>
        </table>
      {/if}
    </div>
    <div class="foot">
      <button type="button" class="btn" disabled={!pageToken || running} onclick={onLoadMore}>Load next page</button>
    </div>
  {:else}
    <div class="msgs">
      {#if allMessages.length}
        <ul>
          {#each allMessages as m}
            <li>{m}</li>
          {/each}
        </ul>
      {:else}
        <p class="empty">No messages yet.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .results {
    display: flex;
    flex-direction: column;
    min-height: 0;
    flex: 1;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    overflow: hidden;
  }
  .tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2, var(--surface));
    flex-wrap: wrap;
  }
  .tabs button {
    background: transparent;
    border: 0;
    padding: 8px 10px;
    color: var(--muted);
    cursor: pointer;
    font: inherit;
  }
  .tabs button.active {
    color: var(--fg, var(--text));
    box-shadow: inset 0 -2px 0 var(--accent);
  }
  .meta {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--muted);
  }
  .run-bar {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--border);
    background: color-mix(in srgb, var(--accent) 8%, var(--surface-2, var(--surface)));
    font-size: 0.78rem;
    color: var(--fg, var(--text));
  }
  .run-elapsed {
    font-variant-numeric: tabular-nums;
    color: var(--muted);
  }
  .run-chunk {
    color: var(--muted);
  }
  .run-bar .cancel {
    margin-left: auto;
  }
  .run-meter {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 2px;
    width: var(--pct, 0%);
    background: var(--accent);
    transition: width 80ms linear;
  }
  .grid-wrap {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .grid-wrap.dimmed {
    opacity: 0.72;
  }
  .grid {
    border-collapse: collapse;
    font-size: 0.78rem;
  }
  .grid th {
    position: sticky;
    top: 0;
    background: var(--surface-2, var(--surface));
    z-index: 1;
    text-align: left;
    padding: 4px 8px;
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
    overflow: hidden;
  }

  .th-content {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 8px;
  }

  .resize-handle {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: col-resize;
    user-select: none;
    z-index: 2;
  }
  .resize-handle:hover {
    background: color-mix(in srgb, var(--accent) 50%, transparent);
  }

  .grid td {
    padding: 0;
    border-bottom: 1px solid var(--border);
    height: 1.7rem;
    overflow: hidden;
  }
  .cell {
    display: block;
    width: 100%;
    height: 1.7rem;
    padding: 0 8px;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    font: inherit;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .foot {
    padding: 6px 8px;
    border-top: 1px solid var(--border);
  }
  .msgs {
    padding: 8px 12px;
    overflow: auto;
    flex: 1;
    font-size: 0.85rem;
  }
  .empty {
    color: var(--muted);
    padding: 12px;
    margin: 0;
  }
  .btn {
    font: inherit;
    font-size: 0.8rem;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface-2, var(--surface));
    color: inherit;
    cursor: pointer;
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
