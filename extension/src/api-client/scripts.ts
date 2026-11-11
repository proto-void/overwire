/** Sandboxed script runner protocol (null-origin iframe ↔ host via postMessage). */

export const SCRIPT_TIMEOUT_MS = 5_000;

export const SCRIPT_RUN_TYPE = 'overwire-api-script-run' as const;
export const SCRIPT_RESULT_TYPE = 'overwire-api-script-result' as const;
/** Legacy Detour postMessage types (accepted on receive during transition). */
export const LEGACY_SCRIPT_RUN_TYPE = 'detour-api-script-run' as const;
export const LEGACY_SCRIPT_RESULT_TYPE = 'detour-api-script-result' as const;

export type ScriptPhase = 'prerequest' | 'test';

export interface ScriptRunRequest {
  type: typeof SCRIPT_RUN_TYPE | typeof LEGACY_SCRIPT_RUN_TYPE;
  id: string;
  phase: ScriptPhase;
  code: string;
  /** Serializable pm context snapshot. */
  context: {
    environment: Record<string, string>;
    collectionVariables: Record<string, string>;
    globals: Record<string, string>;
    request: {
      method: string;
      url: string;
      headers: Record<string, string>;
      body: string | null;
    };
    response?: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      body: string;
      responseTime: number;
    };
  };
}

export interface ScriptTestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface ScriptRunResult {
  type: typeof SCRIPT_RESULT_TYPE | typeof LEGACY_SCRIPT_RESULT_TYPE;
  id: string;
  ok: boolean;
  error?: string;
  tests: ScriptTestResult[];
  /** Mutations from pre-request / test scripts. */
  mutated?: {
    environment?: Record<string, string>;
    collectionVariables?: Record<string, string>;
    globals?: Record<string, string>;
    request?: {
      method?: string;
      url?: string;
      headers?: Record<string, string>;
      body?: string | null;
    };
    /** From `pm.execution.setNextRequest` — null means stop the runner. */
    nextRequest?: string | null;
    /** From `pm.visualizer.set(template, data)`. */
    visualizer?: { template: string; data: unknown } | null;
  };
}

export function isScriptRunResult(data: unknown): data is ScriptRunResult {
  if (!data || typeof data !== 'object') return false;
  const type = (data as ScriptRunResult).type;
  return type === SCRIPT_RESULT_TYPE || type === LEGACY_SCRIPT_RESULT_TYPE;
}

/**
 * Race a script result against a hard timeout. The host must still tear down the iframe.
 * Does not grant the sandbox any extension APIs.
 */
export function withScriptTimeout<T>(promise: Promise<T>, timeoutMs = SCRIPT_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Script timed out after ${timeoutMs} ms`)), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
