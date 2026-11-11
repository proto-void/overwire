const BLOB_PREVIEW = 48;
const JSON_PREVIEW = 120;

function isArrayBufferView(value: unknown): value is ArrayBufferView {
  return ArrayBuffer.isView(value);
}

function bytesPreview(bytes: Uint8Array): string {
  const n = Math.min(bytes.length, BLOB_PREVIEW);
  let hex = '';
  for (let i = 0; i < n; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0');
  }
  const suffix = bytes.length > BLOB_PREVIEW ? '…' : '';
  return `blob(${bytes.length}) ${hex}${suffix}`;
}

/**
 * Decodes bytes to a UTF-8 string. 
 * - If the decoded string is valid JSON, it returns the parsed object/array.
 * - If it's normal text, it returns a single-line trimmed string.
 * - If it's binary data, it returns null.
 */
function tryDecodeText(bytes: Uint8Array): unknown | null {
  try {
    const decodedText = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    
    // 1. Check if the text inside the buffer is a nested JSON object or array
    const trimmed = decodedText.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // Fall through to regular text handling if JSON parsing fails
      }
    }

    // 2. Otherwise handle as normal text data
    const singleLineText = decodedText.replace(/\s+/g, ' ').trim();
    return singleLineText.length > JSON_PREVIEW 
      ? `${singleLineText.slice(0, JSON_PREVIEW)}…` 
      : singleLineText;
  } catch {
    return null; // Return null to fall back to raw hex representation
  }
}

/**
 * Format a DB cell for a compact one-line grid row.
 */
export function formatDbCell(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : String(value);
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'string') {
    const one = value.replace(/\s+/g, ' ').trim();
    return one.length > JSON_PREVIEW ? `${one.slice(0, JSON_PREVIEW)}…` : one;
  }
  if (value instanceof ArrayBuffer) {
    const decoded = tryDecodeText(new Uint8Array(value));
    return typeof decoded === 'object' && decoded !== null ? JSON.stringify(decoded) : String(decoded ?? bytesPreview(new Uint8Array(value)));
  }
  if (isArrayBufferView(value)) {
    const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const decoded = tryDecodeText(bytes);
    return typeof decoded === 'object' && decoded !== null ? JSON.stringify(decoded) : String(decoded ?? bytesPreview(bytes));
  }
  if (typeof value === 'object') {
    const maybe = value as { type?: string; data?: unknown };
    if (maybe.type === 'Buffer' && Array.isArray(maybe.data)) {
      const bytes = Uint8Array.from(maybe.data as number[]);
      const decoded = tryDecodeText(bytes);
      return typeof decoded === 'object' && decoded !== null ? JSON.stringify(decoded) : String(decoded ?? bytesPreview(bytes));
    }
    try {
      const json = JSON.stringify(value);
      if (json === undefined) return String(value);
      const one = json.replace(/\s+/g, ' ');
      return one.length > JSON_PREVIEW ? `${one.slice(0, JSON_PREVIEW)}…` : one;
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  return String(value);
}

/**
 * Deeply formats any properties inside an RPC payload object, 
 * unpacking binary nested text and JSON structures cleanly.
 */
export function formatPayload(payload: unknown): unknown {
  if (payload === null || payload === undefined) return payload;
  
  if (
    payload instanceof ArrayBuffer || 
    ArrayBuffer.isView(payload) || 
    (typeof payload === 'object' && (payload as { type?: string }).type === 'Buffer')
  ) {
    const bytes = payload instanceof ArrayBuffer 
      ? new Uint8Array(payload)
      : ArrayBuffer.isView(payload)
      ? new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength)
      : Uint8Array.from((payload as { data: number[] }).data);
      
    const decoded = tryDecodeText(bytes);
    if (decoded !== null) {
      return formatPayload(decoded);
    }
    // Keep formatDbCell ONLY for binary blobs to get the hex preview marker
    return formatDbCell(payload);
  }
  
  if (Array.isArray(payload)) {
    return payload.map(formatPayload);
  }
  
  if (typeof payload === 'object') {
    const formattedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(payload)) {
      formattedObj[key] = formatPayload(val);
    }
    return formattedObj;
  }
  
  // FIX: Return the raw string/primitive value instead of calling formatDbCell here!
  return payload;
}
