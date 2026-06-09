# doc-assets

마크다운 **자가렌더 단일 HTML 문서**용 공용 스타일·렌더러. 공개로 두고 jsDelivr가 marked처럼
서빙한다 → 문서 HTML 하나만 공유해도(인터넷만 되면) 스타일·렌더가 적용됨.

## 파일
- `doc.css` — shadcn 토큰(neutral + indigo) 기반 문서 스타일 (light/dark)
- `doc.js` — 마크다운 렌더 + 사이드바 자동생성 + 콜아웃/표/단계 변환 + 테마토글 + 맨위로
- `theme-init.js` — 렌더 전 테마 적용(no-flash), `<head>`에서 동기 로드

## 사용 (문서 HTML)
```html
<head>
  <script src="https://cdn.jsdelivr.net/gh/choihong-xvive/doc-assets@v2/theme-init.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/choihong-xvive/doc-assets@v2/doc.css">
</head>
<body>
  <button id="themeToggle" type="button"></button>
  <button id="toTop" type="button">↑</button>
  <div class="layout">
    <aside class="sidebar">… <nav class="sidebar-nav"><ul id="nav"></ul></nav> …</aside>
    <main class="main"><div class="md-body" id="content"></div></main>
  </div>
  <script type="text/markdown" id="source">
  … 마크다운 콘텐츠 …
  </script>
  <script src="https://cdn.jsdelivr.net/npm/marked@12/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/choihong-xvive/doc-assets@v2/doc.js"></script>
</body>
```

## 콘텐츠 규약 (마크다운)
- 섹션 = `## 제목` (사이드바 자동)
- 콜아웃 = `> [!INFO|OK|WARN|DANGER] 제목` + 다음 줄 본문
- 단계 = 숫자 리스트(`1. 2. 3.`) → 원형 번호
- 다이어그램 = ` ``` ` 코드펜스(다크)
- 표지·비교박스 등 특수블록 = 소량 inline HTML

## 버전 고정 (중요)
공유한 문서가 안 깨지게 **태그로 핀**한다: `@v1`, `@v2` … (또는 커밋 해시).
스타일을 바꾸면 새 태그를 만들고, 기존 문서는 옛 태그에 남겨 안정성을 유지.
`@main`은 jsDelivr 캐시(최대 7일) 때문에 즉시 반영이 안 될 수 있음 → 배포본엔 태그 사용.
