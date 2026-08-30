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
      // canonical（Base.astro）は末尾スラッシュを落とした形なので、sitemapのURLも同じ形に揃える。
      // 揃えないと「sitemapが送るURL」と「canonicalが指すURL」が全ページで食い違い、シグナルが無駄になる。
      // ルート（https://zn-stretch-gifu.com/）だけは素のオリジンとして残す。
      serialize(item) {
        if (item.url !== `${SITE_URL}/`) item.url = item.url.replace(/\/$/, '');
        return item;
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
