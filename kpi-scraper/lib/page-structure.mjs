/**
 * ブラウザ内で実行して、ページの構造と「各列の値の種類」だけを取り出す関数。
 *
 * ⚠️ この関数は **セルの値を戻り値に含めない**。値はブラウザ内で種類ラベル
 * （'電話番号' '日付' '金額' …）に潰され、ラベルだけが外へ出る。
 * 顧客情報を扱う画面を調べるための安全装置なので、値を返す変更をしないこと。
 *
 * Playwrightの page.evaluate() に渡す前提のため、外側のスコープを参照しない
 * 自己完結した関数にしてある（そのままテストからも呼べる）。
 */
export function extractStructure() {
  const clip = (s, n = 50) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n);

  // ここが肝：値を「種類」に潰す。戻り値に元の文字列を含めない
  const kind = (raw) => {
    const t = (raw || '').replace(/\s+/g, ' ').trim();
    if (!t) return 'empty';
    const tel = t.replace(/[‐‑–—ー－]/g, '-');
    if (/^(\+81|81)\d{9,10}$/.test(tel.replace(/-/g, ''))) return '電話番号(国際)';
    if (/^0\d{1,4}-?\d{1,4}-?\d{3,4}$/.test(tel)) return '電話番号';
    if (/@/.test(t) && /\./.test(t)) return 'メール';
    if (/^\d{4}[-/年]\s?\d{1,2}[-/月]\s?\d{1,2}/.test(t)) return '日付';
    if (/^(男性|女性|男|女)$/.test(t)) return '性別';
    if (/^[¥￥]?[\d,]+\s?円?$/.test(t) && /[,¥￥円]/.test(t)) return '金額';
    if (/^\d+(\.\d+)?%$/.test(t)) return '割合';
    if (/^\d+$/.test(t)) return `数字(${t.length}桁)`;
    if (/^[ァ-ヶー\s]+$/.test(t)) return 'カタカナ(フリガナ)';
    if (/^[一-龠々ぁ-んァ-ヶー\s]{2,10}$/.test(t)) return '日本語(氏名の可能性)';
    return 'その他テキスト';
  };

  // 「th＋td1つ」が並ぶ縦持ちテーブル（詳細画面）は表として解釈しない。
  // 下の fields 側で「ラベル→種類」として拾うので、二重に出ると読みにくくなる
  const isVertical = (t) => {
    const rows = [...t.querySelectorAll('tr')];
    return rows.length > 1 && rows.every((tr) => tr.querySelector('th') && tr.querySelectorAll('td').length === 1);
  };

  const tables = [...document.querySelectorAll('table')].filter((t) => !isVertical(t)).slice(0, 12).map((t) => {
    const headers = [...t.querySelectorAll('thead th, tr:first-child th')].map((th) => clip(th.textContent));
    const tbodyRows = [...t.querySelectorAll('tbody tr')];
    const bodyRows = tbodyRows.length ? tbodyRows : [...t.querySelectorAll('tr')].slice(1);
    const sample = bodyRows.slice(0, 8);
    const colCount = sample.reduce((max, tr) => Math.max(max, tr.querySelectorAll('td').length), 0);
    const columns = [];
    for (let c = 0; c < colCount; c++) {
      const kinds = {};
      for (const tr of sample) {
        const cell = tr.querySelectorAll('td')[c];
        const k = kind(cell ? cell.textContent : '');
        kinds[k] = (kinds[k] || 0) + 1;
      }
      const top = Object.entries(kinds).sort((a, b) => b[1] - a[1])[0];
      columns.push({ index: c, header: headers[c] || '(見出しなし)', kind: top ? top[0] : 'unknown', kinds });
    }
    return { headers, rowCount: bodyRows.length, columns };
  });

  // 詳細画面の「ラベル → 値」形式も拾う（dl/dt-dd、および th-td の縦持ち）
  const fields = [];
  for (const dl of [...document.querySelectorAll('dl')].slice(0, 5)) {
    const dts = [...dl.querySelectorAll('dt')];
    const dds = [...dl.querySelectorAll('dd')];
    dts.forEach((dt, i) => fields.push({ label: clip(dt.textContent, 24), kind: kind(dds[i] ? dds[i].textContent : '') }));
  }
  for (const tr of [...document.querySelectorAll('tr')].slice(0, 60)) {
    const th = tr.querySelector('th');
    const tds = tr.querySelectorAll('td');
    if (th && tds.length === 1) fields.push({ label: clip(th.textContent, 24), kind: kind(tds[0].textContent) });
  }

  const exportish = [...document.querySelectorAll('a, button')]
    .map((el) => clip(el.textContent, 30))
    .filter((t) => /CSV|ダウンロード|エクスポート|出力|印刷/i.test(t));

  return {
    title: document.title,
    url: location.href,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => clip(h.textContent)).slice(0, 15),
    navItems: [...document.querySelectorAll('a.nav-item, nav a, aside a')].map((a) => clip(a.textContent, 24)).filter(Boolean).slice(0, 40),
    buttons: [...document.querySelectorAll('button')].map((b) => clip(b.textContent, 24)).filter(Boolean).slice(0, 40),
    exportish: [...new Set(exportish)],
    tables,
    fields: fields.slice(0, 40),
    hasPagination: /次へ|前へ|ページ|»|›/.test(document.body.innerText.slice(0, 20000)),
  };
}
