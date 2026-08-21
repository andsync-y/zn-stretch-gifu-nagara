/**
 * 薬機法・景表法のNG表現（文脈を問わず出たら落とす断定・保証系）。
 *
 * コラムの品質GATE（lint-column.mjs）とGBP投稿ドラフト生成（gbp-post-draft.mjs）の
 * 両方が同じ基準で判定できるよう、ここを唯一の定義元にしている。
 * 言い換え表は docs/yakkihou-ng-ok.md を参照。
 *
 * ■ CLIとしても使える（人が目でチェックするのをやめるため）
 *
 *   node scripts/yakkihou-ng.mjs <ファイル...>   # ファイルを検査
 *   echo "本文" | node scripts/yakkihou-ng.mjs    # 標準入力を検査
 *   ... --json                                   # 結果をJSONで出す
 *
 * NG表現が1つでもあれば終了コード1。無ければ0。
 * AIに語リストを覚えさせて目視判定させると見落とすので、判定はここに寄せる。
 */
export const NG_PATTERNS = [
  /治る|治り(ます|やすい)|治療/,
  /効果があ(る|り)/,
  /改善(します|しました|されます|できます)/,
  /解消/,
  /矯正/,
  /効く|効きます/,
  /完治|即効/,
  /No\.?1|ナンバーワン/,
  /絶対(に)?(良く|治|改善|安全)/,
  /必ず(良く|治|改善|効)/,
  /根本(から)?改善/,
];

/**
 * NG表現ごとの言い換え候補。docs/yakkihou-ng-ok.md の要約。
 * 検出だけして直し方を示さないと、書き手が同じ表現を別の言い方で再発明してしまう。
 */
export const NG_SUGGESTIONS = [
  [/治る|治り|治療/, 'ケア／アプローチする／向き合う（医業類似行為を想起させる語は使わない）'],
  [/効果があ/, '体感として／〜と感じる方が多い'],
  [/改善(します|しました|されます|できます)/, 'アプローチする／目指す／ラクに感じる方が多い'],
  [/解消/, 'すっきり／軽やかに／めぐりをサポート'],
  [/矯正/, '姿勢を意識しやすい状態へ／可動域にアプローチ'],
  [/効く|効きます/, '心地よさを感じていただく／アプローチする'],
  [/完治|即効/, '（断定を外す。継続的なケアとして書く）'],
  [/No\.?1|ナンバーワン/, '事実のみを書く（例：岐阜市長良の完全個室パーソナルストレッチ専門店）'],
  [/絶対|必ず/, '一人ひとりに合わせて／〜を目指して（個人差がある旨を添える）'],
  [/根本(から)?改善/, '身体全体のバランスに向き合う／体感軸調整法でアプローチする'],
];

function suggestFor(term) {
  for (const [re, hint] of NG_SUGGESTIONS) if (re.test(term)) return hint;
  return '（docs/yakkihou-ng-ok.md の言い換え表を参照）';
}

/** テキストに含まれるNG表現をすべて返す（無ければ空配列） */
export function findNg(text) {
  const hits = [];
  for (const re of NG_PATTERNS) {
    const m = String(text).match(re);
    if (m) hits.push(m[0]);
  }
  return hits;
}

/**
 * 出現箇所つきで返す。同じ表現が複数回出ればその回数ぶん返す。
 * 行番号を出すのは、指摘を受けた側が探し直さずに直せるようにするため。
 */
export function findNgDetailed(text) {
  const src = String(text);
  const lines = src.split('\n');
  const hits = [];
  for (const re of NG_PATTERNS) {
    const g = new RegExp(re.source, 'g');
    let m;
    while ((m = g.exec(src)) !== null) {
      if (m[0] === '') { g.lastIndex++; continue; }
      const before = src.slice(0, m.index);
      const line = before.split('\n').length;
      hits.push({
        term: m[0],
        line,
        text: lines[line - 1]?.trim().slice(0, 120) ?? '',
        suggestion: suggestFor(m[0]),
      });
    }
  }
  return hits.sort((a, b) => a.line - b.line);
}

/* ------------------------------ CLI ------------------------------ */

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

async function cli(argv) {
  const asJson = argv.includes('--json');
  const files = argv.filter((a) => !a.startsWith('--'));
  const { readFile } = await import('node:fs/promises');

  const targets = [];
  if (files.length > 0) {
    for (const f of files) {
      try {
        targets.push({ name: f, text: await readFile(f, 'utf8') });
      } catch (e) {
        console.error(`読めません: ${f} (${e.code ?? e.message})`);
        process.exitCode = 2;
      }
    }
  } else {
    targets.push({ name: '(stdin)', text: await readStdin() });
  }

  const results = targets.map((t) => ({ file: t.name, hits: findNgDetailed(t.text) }));
  const total = results.reduce((n, r) => n + r.hits.length, 0);

  if (asJson) {
    console.log(JSON.stringify({ ok: total === 0, total, results }, null, 1));
  } else if (total === 0) {
    console.log(`薬機法チェック: NG表現なし（${targets.length}件を検査）`);
  } else {
    for (const r of results) {
      for (const h of r.hits) {
        console.log(`${r.file}:${h.line}  NG「${h.term}」 → ${h.suggestion}`);
        if (h.text) console.log(`    ${h.text}`);
      }
    }
    console.log(`\n薬機法チェック: NG表現 ${total}件。上記をすべて直してから公開すること。`);
  }
  // 呼び出し側（AI・CI）が終了コードだけ見れば判断できるようにする
  if (total > 0) process.exitCode = 1;
}

// import されたときは実行しない（lint-column.mjs / gbp-post-draft.mjs から使われるため）
if (import.meta.url === `file://${process.argv[1]}`) {
  await cli(process.argv.slice(2));
}
