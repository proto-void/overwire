import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

const root = path.dirname(fileURLToPath(import.meta.url));
const overwireBrand = path.join(root, 'brands/overwire');

export default defineConfig({
  plugins: [WxtVitest()],
  resolve: {
    alias: {
      '@brand': overwireBrand,
      'virtual:brand-tokens': path.join(overwireBrand, 'tokens.css'),
    },
  },
  define: {
    'import.meta.env.BRAND': JSON.stringify({
      name: 'Overwire',
      shortName: 'Overwire',
      slug: 'overwire',
      defaultTheme: 'dark',
      nativeHostName: 'com.overwire.db',
    }),
    'import.meta.env.PARTNER_LOGO_URL': JSON.stringify(''),
    'import.meta.env.LICENSE_VERIFY_PUBLIC_KEY': JSON.stringify(''),
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
