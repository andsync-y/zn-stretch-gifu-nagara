// ============================================================
// /content.json — SNS運用システム（AIコンテンツ運用基盤）向けの構造化データ
//
// 症状ページ・コラム・店舗情報を、外部システムが再構成しやすい形で出力する。
// 形式は「AIコンテンツ運用システム 設計図 v2」§12 ContentItem / §14 に準拠。
// ビルド時に静的生成される（公開済みコンテンツのみが載る）。
// ============================================================
import type { APIRoute } from 'astro';
import { SITE } from '../consts';
import { SYMPTOM_CONTENT } from '../data/symptom-content';
import { COLUMNS } from '../data/columns';

const ORIGIN = 'https://zn-stretch-gifu.com';

type ContentItem = {
  id: string;
  type: 'symptom' | 'column' | 'faq' | 'store' | 'campaign';
  slug: string;
  title: string;
  summary: string;
  target?: string;
  causes?: string[];
  selfCare?: string[];
  keyPoints?: string[];
  tags?: string[];
  url: string;
  publishedAt?: string;
  updatedAt: string;
};

const toIso = (ymd: string) => `${ymd}T00:00:00+09:00`;

export const GET: APIRoute = () => {
  const symptoms: ContentItem[] = SYMPTOM_CONTENT.map((s) => ({
    id: `symptom:${s.slug}`,
    type: 'symptom',
    slug: s.slug,
    title: s.title,
    summary: s.summary,
    target: s.target,
    causes: s.causes,
    keyPoints: s.keyPoints,
    tags: s.tags,
    url: `${ORIGIN}/symptoms/${s.slug}`,
    publishedAt: toIso(s.publishedAt),
    updatedAt: toIso(s.updatedAt),
  }));

  const columns: ContentItem[] = COLUMNS.map((c) => ({
    id: `column:${c.slug}`,
    type: 'column',
    slug: c.slug,
    title: c.heading,
    summary: c.desc,
    tags: c.tags,
    keyPoints: c.relatedSymptoms?.map((slug) => `related-symptom:${slug}`),
    url: `${ORIGIN}/column/${c.slug}`,
    publishedAt: toIso(c.date),
    updatedAt: toIso(c.updated ?? c.date),
  }));

  const store: ContentItem = {
    id: 'store:zn-stretch-gifu-nagara',
    type: 'store',
    slug: 'zn-stretch-gifu-nagara',
    title: SITE.brand,
    summary: `${SITE.area}の${SITE.business}。個室・マンツーマンで、担当は全員女性トレーナー。ZST協会認定の独自メソッド「体感軸調整法」でアプローチ。営業${SITE.hours}（${SITE.closed}）。${SITE.parking}。${SITE.landmark}。`,
    keyPoints: [
      `住所：${SITE.addressFull}`,
      `電話：${SITE.tel}`,
      `営業時間：${SITE.hours}（${SITE.closed}）`,
      `駐車場：${SITE.parking}`,
      `目印：${SITE.landmark}`,
      `オープン：${SITE.openedOn}`,
      '初回60分3,300円（税込・おひとり様1回限り）',
    ],
    tags: ['店舗情報', '岐阜市', '長良', 'パーソナルストレッチ'],
    url: `${ORIGIN}/`,
    updatedAt: toIso('2026-07-15'),
  };

  const body = {
    generatedAt: new Date().toISOString(),
    site: ORIGIN,
    items: [...symptoms, ...columns, store],
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
