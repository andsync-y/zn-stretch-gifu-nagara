// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { columnLastmods } from './scripts/lib/column-dates.mjs';

// コラム記事の slug → 更新日（無ければ公開日）。sitemap の <lastmod> に使う
const COLUMN_LASTMOD = columnLastmods();

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
        // 記事ページには更新日を lastmod として出し、更新時の再クロールを促す。
        // 固定ページは実更新日を持たないため付けない（誤った日付を送るより無い方がよい）
        const slug = item.url.match(/\/column\/([^/]+)$/)?.[1];
        if (slug && COLUMN_LASTMOD[slug]) item.lastmod = COLUMN_LASTMOD[slug];
        return item;
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
