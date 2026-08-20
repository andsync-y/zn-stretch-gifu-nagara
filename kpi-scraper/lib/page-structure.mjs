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

  // ページのどこかに電話番号らしき文字列があるかを探す。
  // 見つけても**番号は返さず**、「どのラベルの近くにあったか」だけを返す。
  // 一覧に無くても詳細やモーダルにあるかもしれないので、DOM全体を舐める。
  // ラベルとして採用してよいのは「値に見えないテキスト」だけ。
  // 表の中では隣のセル＝別の顧客データなので、ラベルに使うと値が漏れる。
  const safeLabel = (raw) => {
    const t = clip(raw, 24);
    if (!t) return '';
    const k = kind(t);
    const risky = ['電話番号', '電話番号(国際)', 'メール', '日本語(氏名の可能性)', 'カタカナ(フリガナ)', '日付', '金額'];
    return risky.includes(k) ? '' : t;
  };

  const phoneRe = /(^|[^\d-])0\d{1,4}-?\d{1,4}-?\d{3,4}([^\d-]|$)/;
  const phoneHits = [];
  for (const el of document.querySelectorAll('*')) {
    if (el.children.length > 0) continue; // 末端要素だけ見る（親で二重に数えない）
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!t || t.length > 40 || !phoneRe.test(t)) continue;

    // 表の中なら「列見出し」をラベルにする。見出しは構造上ラベルなので値ではない。
    // 隣のセルや親の前の行（＝別の顧客の行）は絶対に使わない（値が漏れる）
    let label = '';
    const td = el.closest('td');
    if (td) {
      const tr = td.parentElement;
      const table = el.closest('table');
      const idx = [...tr.children].indexOf(td);
      const ths = table ? [...table.querySelectorAll('thead th, tr:first-child th')] : [];
      label = clip(ths[idx] ? ths[idx].textContent : '', 24);
    } else {
      // 表の外は「直前の兄弟が末端要素かつ短い」ときだけラベルとみなす。
      // さらに safeLabel で「値に見えるもの」を弾く二重の防御をかける
      const prev = el.previousElementSibling;
      if (prev && prev.children.length === 0) {
        const t2 = (prev.textContent || '').replace(/\s+/g, ' ').trim();
        if (t2.length <= 12) label = safeLabel(t2);
      }
    }

    phoneHits.push({
      tag: el.tagName.toLowerCase(),
      label: label || '(ラベル不明)',
      cls: clip(el.getAttribute('class') || '', 30),
      inTable: !!td,
      inModal: !!el.closest('[role="dialog"], .modal, dialog'),
    });
    if (phoneHits.length >= 12) break;
  }

  // div主体のレイアウトでも「ラベル→値」を拾えるように、
  // 電話・氏名・回数券などのキーワードを含む要素の“次の要素”の種類を見る
  const KEY = /電話|TEL|携帯|メール|回数券|残|最終来店|前回来店|来店日|購入|チケット|氏名|お名前|フリガナ/;
  const labeled = [];
  for (const el of document.querySelectorAll('div, span, p, dt, label')) {
    // 末端要素だけをラベル候補にする。親要素を拾うと textContent に
    // 値（氏名など）が混ざり、ラベル文字列として値が漏れてしまう
    if (el.children.length > 0) continue;
    // 表の中は columns 側で扱う（見出し同士のペアを拾って無意味な行が出るのを防ぐ）
    if (el.closest('table')) continue;
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!t || t.length > 12 || !KEY.test(t)) continue;
    const next = el.nextElementSibling;
    if (!next) continue;
    labeled.push({ label: clip(t, 16), kind: kind(next.textContent) });
    if (labeled.length >= 30) break;
  }

  return {
    title: document.title,
    url: location.href,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => clip(h.textContent)).slice(0, 15),
    navItems: [...document.querySelectorAll('a.nav-item, nav a, aside a')].map((a) => clip(a.textContent, 24)).filter(Boolean).slice(0, 40),
    buttons: [...document.querySelectorAll('button')].map((b) => clip(b.textContent, 24)).filter(Boolean).slice(0, 40),
    exportish: [...new Set(exportish)],
    tables,
    fields: fields.slice(0, 40),
    labeled,
    phoneHits,
    hasPagination: /次へ|前へ|ページ|»|›/.test(document.body.innerText.slice(0, 20000)),
  };
}
