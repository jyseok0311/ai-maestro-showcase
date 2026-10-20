/* 마에스트로의 흔적 — traces.html 과 시안 D 가 함께 씁니다. 데이터는 traces-data.js(make_traces.py 가 만듦) */
(() => {
// 페이지마다 쓰는 칸이 다릅니다(흔적 페이지: 전부 / 시안 D: 악보·갤러리만). 없는 칸은 숨긴 빈 칸으로 채워 아래 코드를 그대로 씁니다
['stats', 'score', 'scoreFoot', 'gal', 'tabs', 'panel', 'src', 'tip'].forEach(id => {
  if (!document.getElementById(id)) { const d = document.createElement('div'); d.id = id; d.hidden = true; document.body.appendChild(d); }
});
// 미션 8개 — 대시보드 MISSIONS 와 같은 내용
const MISSIONS = [
  [1, '내 업무용 Skill 개선', 'Skill v2 + 적용 전후 기록'],
  [2, '엑셀 대시보드 만들기', 'raw data 자동연동 대시보드'],
  [3, '작은 업무 에이전트 시제품', '에이전트 + Padlet 공유'],
  [4, '문서 작성 에이전트 + 서브에이전트·Skill', '문서 작성 에이전트'],
  [5, '공시자료 분석 에이전트 보완', '부서장 시연 가능 수준'],
  [6, 'GAS 자동화 앱 1개 배포', '배포된 GAS 앱 1개'],
  [7, '나만의 에이전트 다듬기', '확실히 동작하는 한 기능'],
  [8, 'AI Agent 도입 가능성 검토 및 확장 토의', '도입 검토 + 확장 아이디어 2~3개'],
];
// 대시보드가 읽는 미션 제출 시트(폼 응답 원본). 이름은 시트에 이미 가려져(김*수) 있고, 자유 서술 '비고'는 쓰지 않습니다
const SHEET = 'https://docs.google.com/spreadsheets/d/1YCycv99P_M8DGI6bHcStGk-AMSycYCKT-qOilKqpUko/gviz/tq?tqx=out:csv&gid=2145842306';
const SNAP = window.TRACES_SNAP || { at:'', rows:[] };   // traces-data.js — [이름, 회차, 링크, 제출시각], 시트를 못 읽을 때 쓰는 마지막 저장본

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const csv = text => {   // 따옴표 안 쉼표·줄바꿈까지 처리하는 작은 CSV 해석기
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; } else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
};
const fromSheet = text => {
  const [h, ...rs] = csv(text), ix = k => h.findIndex(x => x.trim() === k);
  const iT = ix('Timestamp'), iN = ix('이름'), iR = ix('회차'), iL = ix('제출링크');
  return rs.map(r => [r[iN] || '', +((r[iR] || '').match(/(\d)\s*회차/) || [])[1] || 0, r[iL] || '', r[iT] || '']).filter(r => r[0] && r[1]);
};

// 링크 종류 — live: 누구나 바로 열리는 웹 / link: 코드·문서·드라이브 / none: 링크 없음·내 PC 파일·본인만 보이는 주소
function kindOf(raw) {
  const m = (raw || '').match(/https?:\/\/[^\s<>"]+/i);
  if (!m) return { k:'none', label:/file:\/\//i.test(raw) ? '내 PC 파일' : '링크 없음' };
  const u = m[0]; let h = ''; try { h = new URL(u).hostname; } catch (e) {}
  if (/claude\.ai\/(customize|settings)/.test(u)) return { k:'none', label:'Claude 스킬' };
  if (/\.github\.io$|\.pages\.dev$|\.vercel\.app$|\.netlify\.app$/.test(h) || /claude\.ai\/(public\/)?artifacts?\//.test(u)) return { k:'live', label:'웹 페이지', u };
  if (h === 'github.com') return { k:'code', label:'GitHub', u };
  if (h === 'drive.google.com') return { k:'link', label:'드라이브', u };
  if (h === 'docs.google.com') return { k:'link', label:/spreadsheets/.test(u) ? '구글 시트' : /presentation/.test(u) ? '슬라이드' : /forms/.test(u) ? '구글 폼' : '구글 문서', u };
  if (/padlet\.com$/.test(h)) return { k:'link', label:'패들렛', u };
  if (/asuscomm\.com$|^\d+\.\d+\.\d+\.\d+$|synology|quickconnect/.test(h)) return { k:'link', label:'공유 폴더', u };
  return { k:'link', label:'웹 링크', u };
}
const pretty = s => decodeURIComponent(s).replace(/\.(html?|zip|skill|md)$/i, '').replace(/^\d+[-_]/, '').replace(/[-_]+/g, ' ').trim()
  .replace(/\b([a-z])/g, c => c.toUpperCase()).replace(/\bAi\b/g, 'AI').replace(/\bGas\b/g, 'GAS').replace(/\bHr\b/g, 'HR');
function titleOf(raw, kd) {
  if (!kd.u) return kd.label;
  let p; try { p = new URL(kd.u); } catch (e) { return kd.label; }
  const seg = p.pathname.split('/').filter(Boolean);
  if (kd.label === 'GitHub') {
    if (seg.length < 2) return seg[0] || 'GitHub';
    const tail = (seg[2] === 'tree' || seg[2] === 'blob') && seg[4] ? seg[seg.length - 1] : seg[2] === 'settings' ? '' : '';
    return pretty(tail || seg[1]);
  }
  if (/\.github\.io$/.test(p.hostname)) {
    const last = seg[seg.length - 1] || '';
    const wk = last.match(/^week(\d+)/i);
    if (wk) return `${pretty(seg[0] || '')} · ${wk[1]}주차 기록`;
    return seg.length ? pretty(seg[seg.length - 1]) : '결과물 모음 홈페이지';
  }
  if (/\.pages\.dev$/.test(p.hostname)) return pretty(p.hostname.split('.')[0]) + (seg[0] ? ' · ' + seg[0] : '');
  if (/claude\.ai/.test(p.hostname)) return 'Claude 아티팩트';
  if (kd.label === '드라이브') return /folders/.test(p.pathname) ? '드라이브 폴더' : '드라이브 파일';
  return kd.label;
}
const md = ts => { const m = String(ts).match(/^(\d+)\/(\d+)\//) || String(ts).match(/\d{4}-(\d+)-(\d+)/); return m ? `${+m[1]}. ${+m[2]}.` : ''; };
const tsn = ts => { const d = new Date(ts); return isNaN(d) ? 0 : +d; };

function build(rows) {
  // 같은 사람·같은 회차·같은 링크를 여러 번 낸 것은 마지막 것 하나로
  const seen = new Map();
  rows.forEach(([who, r, link, ts]) => {
    const kd = kindOf(link), key = who + '|' + r + '|' + (kd.u || kd.label);
    const o = { who, r, kd, title: titleOf(link, kd), ts, t: tsn(ts) };
    if (!seen.has(key) || seen.get(key).t <= o.t) seen.set(key, o);
  });
  const recs = [...seen.values()];
  // 제출 기록이 없어도 악보에 한 줄을 갖는 마에스트로(명단 21명 기준) — 입학과 박*형
  const ROSTER_EXTRA = ['박*형'];
  const people = [...new Set(recs.map(x => x.who).concat(ROSTER_EXTRA))];
  const cell = new Map();   // 사람·회차 → 대표 기록(웹 > 코드·문서 > 없음)
  const rank = { live:3, code:2, link:2, none:1 };
  recs.forEach(x => { const k = x.who + '|' + x.r, c = cell.get(k); if (!c || rank[x.kd.k] > rank[c.kd.k] || (rank[x.kd.k] === rank[c.kd.k] && x.t > c.t)) cell.set(k, x); });
  const doneOf = p => MISSIONS.filter(([r]) => cell.has(p + '|' + r)).length;
  people.sort((a, b) => doneOf(b) - doneOf(a) || a.localeCompare(b, 'ko'));

  // 숫자
  const lives = new Map(); recs.filter(x => x.kd.k === 'live').forEach(x => { const c = lives.get(x.kd.u); if (!c || x.t > c.t) lives.set(x.kd.u, x); });
  const site = u => { try { const p = new URL(u), s0 = p.pathname.split('/').filter(Boolean)[0] || '';
    return p.hostname + (/\.github\.io$/.test(p.hostname) && s0 && !/\.html?$/.test(s0) ? '/' + s0 : ''); } catch (e) { return u; } };
  const groups = new Map();
  recs.filter(x => x.kd.k === 'live').forEach(x => { const k = x.who + '|' + site(x.kd.u); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); });
  const full = people.filter(p => doneOf(p) === 8).length;
  document.getElementById('stats').innerHTML = [
    [people.length, '명', 'AI 마에스트로', ''],
    [cell.size, '칸', `채워진 악보 (전체 ${people.length * 8}칸)`, 'g'],
    [full, '명', '여덟 미션 완주', ''],
    [lives.size, '개', '바로 열리는 웹 결과물', 'g'],
  ].map(([n, u, l, g]) => `<div class="${g}"><b>${n}<small>${u}</small></b><span>${l}</span></div>`).join('');

  // Ⅰ 악보
  const PITCH = [34, 31, 27.5, 24, 20.5, 17, 13.5, 10];   // 1회차 아랫줄 → 8회차 윗줄(음표 머리 위쪽 위치, px)
  document.getElementById('score').innerHTML = people.map((p, i) => `
    <div class="srow"><div class="nm">${esc(p)}</div><div class="ostaff">${MISSIONS.map(([r]) => {
      const x = cell.get(p + '|' + r);
      if (!x) return `<span class="c"><i class="rest" title="${r}회차 미제출"></i></span>`;
      const tag = x.kd.u ? 'a' : 'span', href = x.kd.u ? ` href="${esc(x.kd.u)}" target="_blank" rel="noopener noreferrer"` : ' tabindex="0"';
      return `<span class="c"><${tag} class="note ${x.kd.k === 'live' ? 'live' : x.kd.k === 'none' ? 'none' : 'link'}"${href}
        style="top:${PITCH[r - 1] - 4.75}px; transition-delay:${(i * 0.04 + r * 0.07).toFixed(2)}s"
        data-tip="<b>${esc(p)}</b> · ${r}회차 ${esc(MISSIONS[r - 1][1])}<br>${esc(x.kd.label)} — ${esc(x.title)}"
        aria-label="${esc(p)} ${r}회차 ${esc(x.kd.label)}"></${tag}></span>`;
    }).join('')}</div><div class="ct"><b>${doneOf(p)}</b>/8</div></div>`).join('');
  const rn = document.querySelector('.rnum div'); if (rn) rn.innerHTML = MISSIONS.map(([r]) => `<span>${r}</span>`).join('');
  document.getElementById('scoreFoot').innerHTML = `${people.length}명 × 8회차, <b>${people.length * 8}칸 중 ${cell.size}칸</b>이 음표로 채워졌습니다.<br>음표를 누르면 그 결과물이 열립니다.`;

  // Ⅱ 웹 결과물 갤러리 — 최근 회차부터
  document.getElementById('gal').innerHTML = [...groups.values()].map(g => g.sort((a, b) => a.r - b.r || a.t - b.t))
    .sort((a, b) => b.length - a.length || b[b.length - 1].r - a[a.length - 1].r).map(g => {
      const x = g[g.length - 1], many = new Set(g.map(y => y.r)).size > 1;
      const name = many ? x.title.replace(/\s*·\s*\d+주차 기록$/, '') : x.title;
      const rs = [...new Set(g.map(y => y.r))];
      return `
    <div class="win rv">
      <div class="bar"><i></i><i></i><i></i><span>${esc(site(x.kd.u))}</span></div>
      <div class="bd"><div class="mi">${rs.length > 1 ? `${rs.length}개 회차에 걸쳐 쌓은 기록` : `${x.r}회차 · ${esc(MISSIONS[x.r - 1][1])}`}</div>
        <h3><a href="${esc(x.kd.u)}" target="_blank" rel="noopener noreferrer">${esc(name)}</a></h3>
        ${many ? `<div class="chips">${g.filter((y, i) => g.findIndex(z => z.r === y.r) === i).map(y =>
            `<a href="${esc(y.kd.u)}" target="_blank" rel="noopener noreferrer" title="${y.r}회차 ${esc(MISSIONS[y.r - 1][1])}">${y.r}회차</a>`).join('')}</div>` : ''}
        <div class="by"><b>${esc(x.who)}</b> 마에스트로<a class="go" href="${esc(x.kd.u)}" target="_blank" rel="noopener noreferrer">열기 ↗</a></div></div>
    </div>`; }).join('') || '<p class="none-yet">아직 웹에 올린 결과물이 없습니다.</p>';

  // Ⅲ 회차별 기록
  const tabs = document.getElementById('tabs'), panel = document.getElementById('panel');
  tabs.innerHTML = MISSIONS.map(([r]) => `<button type="button" role="tab" aria-selected="false" data-r="${r}">${r}<span style="font-size:.78em;opacity:.7">회</span></button>`).join('');
  const show = r => {
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(+b.dataset.r === r)));
    const [, t, out] = MISSIONS[r - 1];
    const list = recs.filter(x => x.r === r).sort((a, b) => ({ live:0, code:1, link:1, none:2 }[a.kd.k] - { live:0, code:1, link:1, none:2 }[b.kd.k]) || a.who.localeCompare(b.who, 'ko'));
    const n = new Set(list.map(x => x.who)).size;
    panel.innerHTML = `<div class="mhd"><div class="r">${r}</div><div><h3>${esc(t)}</h3><p>결과물 · ${esc(out)}</p></div><div class="n"><b>${n}</b>명 제출</div></div>
      <ul class="recs">${list.map(x => `<li><span class="w">${esc(x.who)}</span><span class="k ${x.kd.k}">${esc(x.kd.label)}</span>
        ${x.kd.u ? `<a class="t" href="${esc(x.kd.u)}" target="_blank" rel="noopener noreferrer">${esc(x.title)} ↗</a>` : `<span class="t dim">${esc(x.title === x.kd.label ? '결과물 제출' : x.title)}</span>`}
        <span class="d">${md(x.ts)}</span></li>`).join('') || '<li class="none-yet">아직 제출이 없습니다.</li>'}</ul>`;
  };
  tabs.onclick = e => { const b = e.target.closest('button'); if (b) show(+b.dataset.r); };
  show(1);
  observe();
}

// 화면에 들어오면 떠오르기, 악보는 음표가 차례로 붙기
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
  { threshold: .12, rootMargin: '0px 0px -6% 0px' });
const observe = () => document.querySelectorAll('.rv:not(.in), .score:not(.in)').forEach(el => io.observe(el));

// 음표 설명 말풍선(마우스·포커스)
const tip = document.getElementById('tip');
const showTip = el => { tip.innerHTML = el.dataset.tip; const r = el.getBoundingClientRect(); tip.classList.add('on');
  const w = tip.offsetWidth; tip.style.left = Math.max(10, Math.min(innerWidth - w - 10, r.left + r.width / 2 - w / 2)) + 'px';
  tip.style.top = (r.top - tip.offsetHeight - 14 < 10 ? r.bottom + 12 : r.top - tip.offsetHeight - 14) + 'px'; };
document.addEventListener('mouseover', e => { const n = e.target.closest('.note'); n ? showTip(n) : tip.classList.remove('on'); });
document.addEventListener('focusin', e => { const n = e.target.closest('.note'); n ? showTip(n) : tip.classList.remove('on'); });
addEventListener('scroll', () => tip.classList.remove('on'), { passive: true });

const stamp = d => document.getElementById('src').textContent =
  `자율 스터디 대시보드 미션 제출 기준 · ${d} · 드라이브·시트 등은 공유 권한에 따라 열리지 않을 수 있습니다.`;
build(SNAP.rows); stamp(SNAP.at + ' 저장본');
fetch(SHEET, { cache: 'no-store' }).then(r => r.ok ? r.text() : Promise.reject()).then(t => {
  const rows = fromSheet(t); if (!rows.length) return;
  build(rows); const d = new Date(); stamp(`${d.getMonth() + 1}. ${d.getDate()}. ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} 실시간`);
}).catch(() => {});
})();
