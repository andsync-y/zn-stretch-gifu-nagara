// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// 本番ドメイン（Xserverで取得・Vercelで公開）
const SITE_URL = 'https://zn-stretch-gifu.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // /lp は広告専用（noindex）のためサイトマップから除外
      filter: (page) => !page.endsWith('/lp') && !page.endsWith('/lp/'),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
