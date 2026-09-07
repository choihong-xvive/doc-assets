/* =====================================================================
   마크다운 자가렌더 단일 HTML 렌더러 (+ 스타일 내장)
   사용: 문서 HTML body 끝에
     <script src="https://cdn.jsdelivr.net/npm/marked@12/marked.min.js"></script>
     <script src=".../doc-assets@v4/doc.js"></script>
   필요한 DOM: #source(마크다운), #content, #nav, #themeToggle, #toTop
   참고: Obsidian HTML Viewer 등 샌드박스는 외부 <link> 스타일을 CSP로 차단하므로,
   CSS를 이 파일에 내장해 <style>로 주입한다(스크립트가 만든 인라인 스타일은 허용).
   ===================================================================== */
(function () {
  var CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800&display=swap');
:root{
  --background:oklch(0.985 0 0); --foreground:oklch(0.22 0 0); --card:oklch(1 0 0);
  --muted:oklch(0.955 0 0); --muted-foreground:oklch(0.52 0 0);
  --primary:oklch(0.457 0.24 277.023); --primary-foreground:oklch(0.962 0.018 272.314);
  --secondary:oklch(0.955 0 0); --accent:oklch(0.955 0 0);
  --border:oklch(0.90 0 0); --destructive:oklch(0.577 0.245 27.325);
  --sidebar:oklch(0.972 0 0); --sidebar-primary:oklch(0.511 0.262 276.966);
  --ok:oklch(0.62 0.13 162); --warn:oklch(0.70 0.15 70);
  --pre-bg:oklch(0.205 0 0); --pre-fg:oklch(0.97 0 0);
  --radius:0; --shadow-xs:0 1px 2px 0 oklch(0 0 0 / .04); --shadow-sm:0 1px 2px 0 oklch(0 0 0 / .06);
  --sp-1:.25rem; --sp-2:.5rem; --sp-3:.75rem; --sp-4:1rem; --sp-5:1.25rem; --sp-6:1.5rem;
  --sp-8:2rem; --sp-10:2.5rem; --sp-12:3rem; --sp-14:3.5rem; --sp-16:4rem; --sp-20:5rem;
  --mono:"SF Mono","Menlo","Consolas",ui-monospace,"Pretendard","Apple SD Gothic Neo","Malgun Gothic",monospace;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme=light]){
  --background:oklch(0.145 0 0); --foreground:oklch(0.985 0 0); --card:oklch(0.205 0 0);
  --muted:oklch(0.269 0 0); --muted-foreground:oklch(0.708 0 0);
  --primary:oklch(0.585 0.233 277.117); --secondary:oklch(0.274 0.006 286.033); --accent:oklch(0.269 0 0);
  --border:oklch(1 0 0 / 12%); --destructive:oklch(0.704 0.191 22.216);
  --sidebar:oklch(0.205 0 0); --sidebar-primary:oklch(0.585 0.233 277.117);
  --ok:oklch(0.72 0.14 162); --warn:oklch(0.80 0.14 78); --pre-bg:oklch(0.205 0 0);
  --shadow-xs:0 1px 2px 0 oklch(0 0 0 / .3); --shadow-sm:0 1px 2px 0 oklch(0 0 0 / .4);
}}
:root[data-theme=dark]{
  --background:oklch(0.145 0 0); --foreground:oklch(0.985 0 0); --card:oklch(0.205 0 0);
  --muted:oklch(0.269 0 0); --muted-foreground:oklch(0.708 0 0);
  --primary:oklch(0.585 0.233 277.117); --secondary:oklch(0.274 0.006 286.033); --accent:oklch(0.269 0 0);
  --border:oklch(1 0 0 / 12%); --destructive:oklch(0.704 0.191 22.216);
  --sidebar:oklch(0.205 0 0); --sidebar-primary:oklch(0.585 0.233 277.117);
  --ok:oklch(0.72 0.14 162); --warn:oklch(0.80 0.14 78); --pre-bg:oklch(0.205 0 0);
  --shadow-xs:0 1px 2px 0 oklch(0 0 0 / .3); --shadow-sm:0 1px 2px 0 oklch(0 0 0 / .4);
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:"Nunito Sans",-apple-system,BlinkMacSystemFont,"Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif;background:var(--background);color:var(--foreground);line-height:1.65;font-size:16px;-webkit-font-smoothing:antialiased;}
.layout{display:grid;grid-template-columns:280px 1fr;max-width:1400px;margin:0 auto;min-height:100vh;}
.sidebar{border-right:1px solid var(--border);padding:var(--sp-10) var(--sp-6);position:sticky;top:0;height:100vh;overflow-y:auto;background:var(--sidebar);}
.sidebar-brand{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted-foreground);font-weight:700;margin-bottom:var(--sp-2);}
.sidebar-title{font-size:18px;font-weight:800;line-height:1.3;margin:0 0 var(--sp-3);letter-spacing:-.02em;}
.sidebar-version{display:inline-block;font-size:10px;border:1px solid color-mix(in srgb,var(--primary) 40%,transparent);color:var(--primary);background:color-mix(in srgb,var(--primary) 8%,transparent);padding:2px 8px;margin-bottom:var(--sp-8);font-weight:700;letter-spacing:.05em;}
/* 버전 배지를 사이드바 하단(메타 뒤)에 둔 문서용. 위에 둔 기존 문서는 그대로다 */
.sidebar-meta + .sidebar-version{margin:var(--sp-5) 0 0;}
.sidebar-nav ul{list-style:none;padding:0;margin:0;}
.sidebar-nav li{margin-bottom:1px;}
.sidebar-nav a{display:flex;gap:var(--sp-2);padding:6px 10px;color:var(--muted-foreground);text-decoration:none;font-size:13px;line-height:1.4;transition:background .12s,color .12s;}
.sidebar-nav a:hover{color:var(--foreground);background:var(--accent);}
.sidebar-nav a.active{color:var(--sidebar-primary);background:color-mix(in srgb,var(--sidebar-primary) 10%,transparent);font-weight:600;}
.sidebar-nav .n{color:var(--muted-foreground);font-size:11px;font-weight:700;min-width:18px;font-variant-numeric:tabular-nums;}
.sidebar-nav a.active .n{color:var(--sidebar-primary);}
/* 사이드바 진행도: sticky 라 스크롤 어디서든 보인다. 범례는 세로로 쌓는다 */
.sidebar-progress{margin-top:var(--sp-8);padding-top:var(--sp-5);border-top:1px solid var(--border);}
.sidebar-progress-title{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted-foreground);font-weight:700;}
.sidebar-progress .progress{height:8px;margin:var(--sp-3) 0 var(--sp-3);}
.sidebar-progress .progress-legend{flex-direction:column;gap:5px;font-size:11.5px;margin:0;}
.sidebar-progress .progress-legend>span{display:flex;align-items:baseline;justify-content:space-between;gap:var(--sp-3);}
.sidebar-meta{margin-top:var(--sp-10);padding-top:var(--sp-5);border-top:1px solid var(--border);font-size:12px;color:var(--muted-foreground);line-height:1.85;}
.sidebar-meta strong{color:var(--foreground);}
.main{--main-px:var(--sp-16);padding:var(--sp-12) var(--main-px);max-width:900px;}
@media (max-width:1024px){
  .layout{grid-template-columns:1fr;}
  .sidebar{position:static;height:auto;border-right:0;border-bottom:1px solid var(--border);}
  .main{--main-px:var(--sp-6);padding:var(--sp-8) var(--main-px);}
}
.cover{margin-bottom:var(--sp-16);padding-bottom:var(--sp-12);border-bottom:1px solid var(--border);}
.cover-eyebrow{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--primary);font-weight:700;margin-bottom:var(--sp-4);}
.cover-title{font-size:clamp(2rem,5vw,3rem);font-weight:800;line-height:1.1;letter-spacing:-.03em;margin:0 0 var(--sp-5);}
.cover-subtitle{font-size:18px;color:var(--muted-foreground);line-height:1.55;max-width:660px;margin:0 0 var(--sp-8);}
.cover-meta{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--border);}
.cover-meta>div{display:flex;flex-direction:column;gap:4px;padding:var(--sp-4) var(--sp-4);border-right:1px solid var(--border);}
.cover-meta>div:last-child{border-right:0;}
.cover-meta span{font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted-foreground);font-weight:600;}
.cover-meta b{font-size:14px;font-weight:700;}
@media (max-width:680px){.cover-meta{grid-template-columns:repeat(2,1fr);}.cover-meta>div:nth-child(2){border-right:0;}}
.md-body h2{font-size:1.5rem;font-weight:800;letter-spacing:-.025em;line-height:1.2;margin:var(--sp-16) 0 var(--sp-5);padding-bottom:var(--sp-3);border-bottom:1px solid var(--border);scroll-margin-top:var(--sp-5);}
.md-body h2:first-of-type{margin-top:0;}
.md-body h3{font-size:1.0625rem;font-weight:700;margin:var(--sp-8) 0 var(--sp-3);}
.md-body h4{font-size:.9375rem;font-weight:700;color:var(--muted-foreground);margin:var(--sp-5) 0 var(--sp-2);}
.md-body p{margin:0 0 var(--sp-4);}
.md-body ul{margin:var(--sp-2) 0 var(--sp-4);padding-left:1.35rem;}
.md-body li{margin-bottom:var(--sp-2);}
.md-body strong{font-weight:700;color:var(--foreground);}
.md-body a{color:var(--primary);text-decoration:none;}
.md-body a:hover{text-decoration:underline;text-underline-offset:2px;}
.md-body hr{border:0;border-top:1px solid var(--border);margin:var(--sp-10) 0;}
.md-body code{font-family:var(--mono);font-size:.85em;background:var(--muted);color:var(--foreground);padding:2px 6px;}
.md-body pre{background:var(--pre-bg);color:var(--pre-fg);border:1px solid var(--border);padding:var(--sp-4) var(--sp-5);overflow-x:auto;font-size:13px;line-height:1.7;margin:var(--sp-4) 0 var(--sp-6);white-space:pre;}
.md-body pre code{background:transparent;color:var(--pre-fg);padding:0;font-size:13px;font-family:var(--mono);}
.table-wrap{border:1px solid var(--border);overflow-x:auto;margin:var(--sp-4) 0 var(--sp-6);box-shadow:var(--shadow-xs);}
.md-body table{width:100%;border-collapse:collapse;font-size:14px;background:var(--card);}
.md-body th{background:var(--muted);color:var(--muted-foreground);padding:10px 15px;font-weight:600;font-size:12.5px;border-bottom:1px solid var(--border);}
.md-body th:not([align]){text-align:left;}
.md-body td{padding:10px 15px;border-bottom:1px solid var(--border);vertical-align:top;}
.md-body tbody tr:last-child td{border-bottom:0;}
.md-body tbody tr:hover td{background:color-mix(in srgb,var(--muted) 55%,transparent);}
/* 표 안 코드: 끊을 자리를 min-content 계산에 넣는다 (CSS Text 4 의 anywhere).
   break-word 는 min-content 를 안 바꿔서 긴 경로가 열 폭을 계속 인질로 잡는다.
   짧은 열은 col-tight 가 셀 단위 nowrap 으로 지킨다 — 길이 문턱을 코드에 두지 않는다. */
.md-body td code{overflow-wrap:anywhere;}
.md-body th.col-tight,.md-body td.col-tight{width:1%;white-space:nowrap;}
.md-body blockquote{border:1px solid var(--border);border-left:3px solid var(--muted-foreground);background:var(--muted);padding:var(--sp-4) var(--sp-5);margin:var(--sp-5) 0;}
.md-body blockquote p:last-child{margin-bottom:0;}
.md-body .callout-title{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted-foreground);margin-bottom:var(--sp-2);}
.md-body blockquote.callout-info{border-left-color:var(--primary);background:color-mix(in srgb,var(--primary) 4%,var(--card));}
.md-body blockquote.callout-info .callout-title{color:var(--primary);}
.md-body blockquote.callout-ok{border-left-color:var(--ok);background:color-mix(in srgb,var(--ok) 5%,var(--card));}
.md-body blockquote.callout-ok .callout-title{color:var(--ok);}
.md-body blockquote.callout-warn{border-left-color:var(--warn);background:color-mix(in srgb,var(--warn) 8%,var(--card));}
.md-body blockquote.callout-warn .callout-title{color:var(--warn);}
.md-body blockquote.callout-danger{border-left-color:var(--destructive);border-color:color-mix(in srgb,var(--destructive) 22%,var(--border));background:color-mix(in srgb,var(--destructive) 5%,var(--card));}
.md-body blockquote.callout-danger .callout-title{color:var(--destructive);}
:root[data-theme=dark] .md-body blockquote.callout-info,:root[data-theme=dark] .md-body blockquote.callout-ok,:root[data-theme=dark] .md-body blockquote.callout-warn,:root[data-theme=dark] .md-body blockquote.callout-danger{background:var(--muted);}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .md-body blockquote.callout-info,:root:not([data-theme=light]) .md-body blockquote.callout-ok,:root:not([data-theme=light]) .md-body blockquote.callout-warn,:root:not([data-theme=light]) .md-body blockquote.callout-danger{background:var(--muted);}}
:root[data-theme=dark] .compare-bad,:root[data-theme=dark] .compare-good{background:var(--muted);}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .compare-bad,:root:not([data-theme=light]) .compare-good{background:var(--muted);}}
/* 카드: #content 에 data-cards="h3" 를 둔 문서에서만 켜진다(옵트인).
   요구사항·규칙처럼 「제목 + 본문」이 한 덩어리로 읽혀야 하는 문서용. */
.md-body .card{position:relative;border:1px solid var(--border);background:var(--card);box-shadow:var(--shadow-xs);padding:var(--sp-5) var(--sp-6) var(--sp-1);margin:var(--sp-5) 0 var(--sp-6);}
.md-body .card>h3{margin:0 0 var(--sp-4);padding-right:8rem;line-height:1.35;}
.md-body .card>h3 .card-id{position:absolute;top:var(--sp-5);right:var(--sp-6);font-family:var(--mono);font-size:11.5px;font-weight:700;letter-spacing:.04em;color:var(--primary);background:color-mix(in srgb,var(--primary) 9%,transparent);border:1px solid color-mix(in srgb,var(--primary) 30%,transparent);padding:3px 8px;white-space:nowrap;}
.md-body .card>h3 .card-title{font-weight:700;letter-spacing:-.01em;}
@media (max-width:680px){
  .md-body .card>h3{padding-right:0;}
  .md-body .card>h3 .card-id{position:static;display:block;width:fit-content;margin:0 0 var(--sp-2);}
}
.md-body .card:target{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary);}
.md-body .card>*:last-child{margin-bottom:var(--sp-4);}
.md-body .card .table-wrap{box-shadow:none;}
.md-body .card>p:first-of-type{color:var(--foreground);}
.md-body ol{list-style:none;counter-reset:step;padding-left:0;margin:var(--sp-4) 0 var(--sp-6);}
.md-body ol>li{counter-increment:step;position:relative;padding-left:2.75rem;margin-bottom:var(--sp-4);min-height:1.75rem;}
.md-body ol>li::before{content:counter(step);position:absolute;left:0;top:-1px;width:1.75rem;height:1.75rem;background:var(--primary);color:var(--primary-foreground);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;}
/* 문서 탭: 한 기능의 형제 문서 사이 이동. 표가 아니라 네비게이션이므로 nav 로 쓴다
   (표로 만들면 마크다운 첫 행이 헤더가 되어 내용 없는 빈 표가 된다). */
/* sticky 탭이 있는 문서는 본문 상단 여백을 탭이 대신한다. 여백을 남기면 붙기 전에
   빈 띠가 보이고, 붙은 뒤엔 그 자리가 비어 보인다. 숫자를 베끼지 않고 그 .main 을 겨냥한다
   — 브레이크포인트마다 다른 padding 값을 따라 적지 않아도 된다. */
.main:has(.doctabs){padding-top:0;}
.doctabs{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;background:var(--background);border-bottom:1px solid var(--border);margin:0 calc(-1 * var(--main-px)) var(--sp-8);padding:0 calc(var(--main-px) - var(--sp-5));}
/* sticky 탭이 앵커 대상을 가린다 — 탭이 있는 문서에서만 여유를 준다 */
.md-body:has(.doctabs) h2,.md-body:has(.doctabs) .card{scroll-margin-top:5.5rem;}
.doctabs a{padding:var(--sp-3) var(--sp-5);font-size:13.5px;font-weight:600;color:var(--muted-foreground);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .12s,background .12s;}
.doctabs a:hover{color:var(--foreground);background:var(--accent);text-decoration:none;}
.doctabs a[aria-current=page]{color:var(--primary);border-bottom-color:var(--primary);}
@media (max-width:680px){.doctabs a{padding:var(--sp-2) var(--sp-3);font-size:12.5px;}.md-body:has(.doctabs) h2,.md-body:has(.doctabs) .card{scroll-margin-top:4.5rem;}}
/* 진행 막대: 누적 세그먼트 + 같은 줄 범례. 폭은 요소의 style 속성으로 들어온다
   (색·간격은 여기서만 정한다 — 넘어오는 건 데이터뿐이다). */
.progress{display:flex;height:10px;border:1px solid var(--border);overflow:hidden;margin:var(--sp-4) 0 var(--sp-3);background:var(--muted);}
.progress .seg{width:var(--w,0);min-width:0;transition:width .2s;}
.progress .seg-done{background:var(--ok);}
.progress .seg-dev{background:var(--primary);}
.progress .seg-block{background:var(--destructive);}
.progress .seg-todo{background:var(--muted);}
.progress-legend{display:flex;flex-wrap:wrap;gap:var(--sp-2) var(--sp-5);font-size:12.5px;color:var(--muted-foreground);margin:0 0 var(--sp-6);}
.progress-legend b{color:var(--foreground);font-variant-numeric:tabular-nums;}
.progress-legend .sw{display:inline-block;width:9px;height:9px;margin-right:6px;vertical-align:baseline;border:1px solid color-mix(in srgb,var(--foreground) 15%,transparent);}
.progress-legend .sw-done{background:var(--ok);}
.progress-legend .sw-dev{background:var(--primary);}
.progress-legend .sw-block{background:var(--destructive);}
.progress-legend .sw-todo{background:var(--muted);}
.compare{display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-4);margin:var(--sp-5) 0;}
.compare-col{padding:var(--sp-4) var(--sp-5);border:1px solid var(--border);}
.compare-bad{background:color-mix(in srgb,var(--destructive) 4%,var(--card));border-color:color-mix(in srgb,var(--destructive) 22%,var(--border));}
.compare-good{background:color-mix(in srgb,var(--ok) 5%,var(--card));border-color:color-mix(in srgb,var(--ok) 25%,var(--border));}
.compare-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:var(--sp-3);}
.compare-bad .compare-label{color:var(--destructive);}
.compare-good .compare-label{color:var(--ok);}
.compare-col p{font-size:14px;margin:0;line-height:1.7;}
@media (max-width:680px){.compare{grid-template-columns:1fr;}}
#themeToggle{position:fixed;top:var(--sp-4);right:var(--sp-5);z-index:9999;cursor:pointer;background:var(--background);color:var(--muted-foreground);border:1px solid var(--border);padding:var(--sp-2) var(--sp-3);font:600 11.5px/1 "Nunito Sans",system-ui,sans-serif;box-shadow:var(--shadow-xs);}
#themeToggle:hover{background:var(--accent);color:var(--foreground);border-color:var(--muted-foreground);}
#copyMd{position:fixed;top:calc(var(--sp-4) + 30px);right:var(--sp-5);z-index:9999;cursor:pointer;background:var(--background);color:var(--muted-foreground);border:1px solid var(--border);padding:var(--sp-2) var(--sp-3);font:600 11.5px/1 "Nunito Sans",system-ui,sans-serif;box-shadow:var(--shadow-xs);}
#copyMd:hover{background:var(--accent);color:var(--foreground);border-color:var(--muted-foreground);}
#toTop{position:fixed;bottom:var(--sp-6);right:var(--sp-5);z-index:9999;cursor:pointer;width:38px;height:38px;display:inline-flex;align-items:center;justify-content:center;background:var(--primary);color:var(--primary-foreground);border:1px solid var(--primary);font-size:17px;box-shadow:var(--shadow-sm);opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .15s,transform .15s,filter .12s;}
#toTop.show{opacity:1;transform:none;pointer-events:auto;}
#toTop:hover{filter:brightness(1.1);}
@media print{#themeToggle,#copyMd,#toTop,.sidebar{display:none;}.layout{grid-template-columns:1fr;}.main{--main-px:20px;padding:20px;max-width:100%;}.doctabs{position:static;}}
`;

  function ensureStyle() {
    if (document.getElementById('doc-style')) return;
    var s = document.createElement('style');
    s.id = 'doc-style';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function applySavedTheme() {
    try { var t = localStorage.getItem('mdtheme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
  }

  function run() {
    ensureStyle();
    applySavedTheme();

    var srcEl = document.getElementById('source');
    var host = document.getElementById('content');
    if (!srcEl || !host) return;
    var src = srcEl.textContent;

    if (window.marked) {
      marked.setOptions({ gfm: true, breaks: false });
      host.innerHTML = marked.parse(src);
    } else {
      host.innerHTML = '<pre style="white-space:pre-wrap">' + src.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</pre>';
    }

    // 열 폭: 짧은 값만 담은 열(#, 상태 아이콘, 코드 한 단어 등)은 내용 폭에 고정해 남는 폭을
    // 서술형 열로 몰아준다. table-layout:auto 만으로는 여유 폭이 전 열에 고르게 퍼진다.
    // 헤더 텍스트는 판정에서 제외한다 — 헤더 라벨이 데이터보다 길어 열을 넓혀버리는 경우가 흔하다.
    var TIGHT_COL_MAXLEN = 12;
    host.querySelectorAll('table').forEach(function (t) {
      var rows = t.rows;
      if (rows.length) {
        var colLen = [];
        Array.prototype.forEach.call(rows, function (r) {
          if (r.parentNode && r.parentNode.tagName === 'THEAD') return;
          Array.prototype.forEach.call(r.cells, function (c, i) {
            var len = c.textContent.trim().length;
            if (len > (colLen[i] || 0)) colLen[i] = len;
          });
        });
        Array.prototype.forEach.call(rows, function (r) {
          Array.prototype.forEach.call(r.cells, function (c, i) {
            if (colLen[i] > 0 && colLen[i] <= TIGHT_COL_MAXLEN) c.classList.add('col-tight');
          });
        });
      }
      var w = document.createElement('div'); w.className = 'table-wrap';
      t.parentNode.insertBefore(w, t); w.appendChild(t);
    });

    var TYPE = { NOTE: 'info', INFO: 'info', TIP: 'ok', OK: 'ok', SUCCESS: 'ok', WARNING: 'warn', WARN: 'warn', CAUTION: 'warn', DANGER: 'danger', IMPORTANT: 'danger' };
    var LABEL = { info: '참고', ok: '권장', warn: '주의', danger: '중요' };
    host.querySelectorAll('blockquote').forEach(function (bq) {
      var first = bq.querySelector('p');
      if (!first) return;
      var m = first.textContent.match(/^\[!(\w+)\]\s*(.*)$/);
      if (!m) return;
      var t = TYPE[m[1].toUpperCase()] || 'info';
      bq.classList.add('callout-' + t);
      var title = document.createElement('div');
      title.className = 'callout-title';
      title.textContent = (m[2] || '').trim() || LABEL[t];
      first.remove();
      bq.insertBefore(title, bq.firstChild);
    });

    // 카드 묶기 — #content 에 data-cards="h3" 가 있을 때만 돈다.
    // 안 켠 문서의 렌더는 한 픽셀도 바뀌지 않는다(옵트인).
    // 「ID — 제목」 형태의 헤딩은 ID 를 배지로, 나머지를 제목으로 가른다.
    var cardSel = host.getAttribute('data-cards');
    if (cardSel) {
      var heads = Array.prototype.slice.call(host.querySelectorAll(':scope > ' + cardSel));
      var STOP = { H1: 1, H2: 1, HR: 1 };
      heads.forEach(function (h) {
        var card = document.createElement('section');
        card.className = 'card';
        h.parentNode.insertBefore(card, h);
        var n = h;
        while (n) {
          var next = n.nextElementSibling;
          card.appendChild(n);
          if (!next || next.tagName === h.tagName || STOP[next.tagName]) break;
          n = next;
        }
        var m = h.textContent.match(/^\s*([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)\s*[—–-]\s*([\s\S]+)$/);
        if (!m) return;
        card.id = m[1];               // 다른 문서가 #REQ-XXX-001 로 딥링크할 수 있게
        h.textContent = '';
        var idEl = document.createElement('span'); idEl.className = 'card-id'; idEl.textContent = m[1];
        var tEl = document.createElement('span'); tEl.className = 'card-title'; tEl.textContent = m[2].trim();
        h.appendChild(idEl); h.appendChild(tEl);
      });
    }

    var nav = document.getElementById('nav');
    var h2s = host.querySelectorAll('h2');
    if (nav) {
      h2s.forEach(function (h, i) {
        var id = 's' + (i + 1); h.id = id;
        var num = String(i + 1).padStart(2, '0');
        var li = document.createElement('li');
        li.innerHTML = '<a href="#' + id + '"><span class="n">' + num + '</span><span>' + h.textContent + '</span></a>';
        nav.appendChild(li);
      });
      var links = nav.querySelectorAll('a');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
          }
        });
      }, { rootMargin: '-20% 0px -55% 0px' });
      h2s.forEach(function (h) { io.observe(h); });
    }

    var tg = document.getElementById('themeToggle');
    function isDark() { var d = document.documentElement.getAttribute('data-theme'); return d ? d === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
    if (tg) {
      var lbl = function () { tg.textContent = isDark() ? '☀ 라이트' : '🌙 다크'; };
      tg.onclick = function () { var n = isDark() ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', n); try { localStorage.setItem('mdtheme', n); } catch (e) {} lbl(); };
      lbl();
    }

    // 마크다운 복사 버튼. 문서 HTML 을 고치지 않아도 되도록 여기서 만든다(#copyMd 를 직접 둔 문서면 그걸 쓴다).
    var cp = document.getElementById('copyMd');
    if (!cp) {
      cp = document.createElement('button');
      cp.id = 'copyMd';
      cp.type = 'button';
      cp.setAttribute('aria-label', '마크다운으로 복사');
      cp.title = '이 문서를 마크다운으로 복사';
      document.body.appendChild(cp);
    }
    var CP_LABEL = '📋 MD 복사', cpTimer = null;
    cp.textContent = CP_LABEL;

    // 세로 위치만 잰다 — 가로는 CSS 가 #themeToggle 과 같은 right:var(--sp-5) 로 맞춘다.
    // (window.innerWidth 로 계산하면 스크롤바 폭만큼 밀린다.) 높이는 패딩·폰트에서 나와 토큰으로 못 박는다.
    function placeCopy() {
      if (!tg) return;
      var r = tg.getBoundingClientRect();
      if (r.height) cp.style.top = (r.bottom + 8) + 'px';
    }
    placeCopy();
    window.addEventListener('resize', placeCopy);
    setTimeout(placeCopy, 200);   // 웹폰트가 늦게 붙어 토글 높이가 바뀌는 경우 대비

    function cpFlash(text) {
      cp.textContent = text;
      clearTimeout(cpTimer);
      cpTimer = setTimeout(function () { cp.textContent = CP_LABEL; }, 1500);
    }

    // 커버는 raw HTML 이라 마크다운으로 못 쓴다 — 제목/eyebrow/리드만 뽑아 h1 + 인용 + 문단으로 바꾼다.
    function asMarkdown() {
      var cover = src.match(/<header class="cover">[\s\S]*?<\/header>/);
      if (!cover) return src.trim() + '\n';
      var box = document.createElement('div');
      box.innerHTML = cover[0].replace(/<br\s*\/?>/gi, ' ');
      var flat = function (sel) {
        var el = box.querySelector(sel);
        return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
      };
      var head = [];
      var title = flat('.cover-title'), eyebrow = flat('.cover-eyebrow'), lead = flat('.cover-subtitle');
      if (title) head.push('# ' + title);
      if (eyebrow) head.push('> ' + eyebrow);
      if (lead) head.push(lead);
      return src.replace(cover[0], head.join('\n\n')).trim() + '\n';
    }

    cp.onclick = function () {
      var text = asMarkdown();
      var ok = function () { cpFlash('✓ 복사됨'); };
      var legacy = function () {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); ok(); } catch (e) { cpFlash('✕ 복사 실패'); }
        document.body.removeChild(ta);
      };
      // file:// 이나 비보안 컨텍스트에서는 clipboard API 가 막히므로 폴백이 필수다.
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, legacy);
      else legacy();
    };

    var top = document.getElementById('toTop');
    if (top) {
      var onScroll = function () { top.classList.toggle('show', window.scrollY > 400); };
      top.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
