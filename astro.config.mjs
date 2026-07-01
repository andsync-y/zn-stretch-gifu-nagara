// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// 本番の独自ドメインが決まったら SITE_URL を差し替える（morning-todo参照）。
// 例: https://zenryoku-stretch-gifu-nagara.com
const SITE_URL = 'https://example-zn-gifu-nagara.pages.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
