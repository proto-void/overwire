import { describe, expect, it } from 'vitest';
import { brand, brandDefaultTheme, brandName, brandSlug, nativeHostName } from './brand-config';
import { parseTheme } from './theme';

describe('runtime brand', () => {
  it('exposes the Overwire brand in the default unit-test build', () => {
    expect(brandName).toBe('Overwire');
    expect(brandSlug).toBe('overwire');
    expect(brandDefaultTheme).toBe('dark');
    expect(brand.shortName).toBe('Overwire');
    expect(nativeHostName).toBe('com.overwire.db');
  });

  it('uses the brand defaultTheme when no preference is stored', () => {
    expect(parseTheme(undefined)).toBe(brandDefaultTheme);
  });
});
