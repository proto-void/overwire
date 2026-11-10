import { describe, expect, it } from 'vitest';
import { formatDbCell, formatPayload } from './cell-format';

describe('cell-format utilities', () => {
  describe('formatDbCell', () => {
    it('formats nullish and primitives', () => {
      expect(formatDbCell(null)).toBe('null');
      expect(formatDbCell(undefined)).toBe('null');
      expect(formatDbCell(true)).toBe('true');
      expect(formatDbCell(42)).toBe('42');
      expect(formatDbCell('hi')).toBe('hi');
    });

    it('collapses whitespace and truncates long strings', () => {
      expect(formatDbCell('a\n\tb')).toBe('a b');
      const long = 'x'.repeat(200);
      expect(formatDbCell(long).endsWith('…')).toBe(true);
      expect(formatDbCell(long).length).toBeLessThan(130);
    });

    it('decodes readable plain text inside buffers directly to strings', () => {
      // UTF-8 bytes for "Hello"
      const textBytes = new Uint8Array([72, 101, 108, 108, 111]);
      expect(formatDbCell(textBytes)).toBe('Hello');
    });

    it('previews genuine binary blobs as hex strings', () => {
      // 0xDE 0xAD are invalid UTF-8 start bytes and will trigger the hex fallback
      const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      expect(formatDbCell(bytes)).toContain('blob(4)');
      expect(formatDbCell(bytes)).toContain('deadbeef');

      // Object-style buffer containing invalid UTF-8 binary
      expect(formatDbCell({ type: 'Buffer', data: [0xde, 0xad, 0xbe, 0xef] })).toContain('blob(4)');
    });

    it('unpacks stringified JSON objects sitting inside buffers into single lines', () => {
      // UTF-8 bytes for '{"id":1}'
      const jsonBytes = new Uint8Array([123, 34, 105, 100, 34, 58, 49, 125]);
      expect(formatDbCell(jsonBytes)).toBe('{"id":1}');
    });

    it('stringifies regular JSON objects on one line', () => {
      expect(formatDbCell({ a: 1 })).toBe('{"a":1}');
    });
  });

  describe('formatPayload', () => {
    it('leaves standard objects and primitives completely untouched', () => {
      const standardData = { id: 42, active: true, name: 'User' };
      expect(formatPayload(standardData)).toEqual(standardData);
    });

    it('recursively processes deep arrays and nested objects', () => {
      const nested = {
        rows: [
          { data: new Uint8Array([72, 101, 108, 108, 111]) } // "Hello"
        ]
      };
      expect(formatPayload(nested)).toEqual({
        rows: [{ data: 'Hello' }]
      });
    });

    it('fully unpacks embedded stringified JSON objects into real traversable fields', () => {
      // UTF-8 bytes for '{"nested":{"value":true}}'
      const jsonBuffer = new Uint8Array([
        123, 34, 110, 101, 115, 116, 101, 100, 34, 58, 123, 34, 118, 97, 108,
        117, 101, 34, 58, 116, 114, 117, 101, 125, 125
      ]);

      const payload = {
        connectionId: 'abc-123',
        result: jsonBuffer
      };

      // Verified: Unpacks the buffer into a genuine object, allowing your tree viewer to expand it
      expect(formatPayload(payload)).toEqual({
        connectionId: 'abc-123',
        result: {
          nested: {
            value: true
          }
        }
      });
    });
  });
});
