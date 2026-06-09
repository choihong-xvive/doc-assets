# doc-assets

마크다운 **자가렌더 단일 HTML 문서**용 공용 스타일·렌더러. 공개로 두고 jsDelivr가 marked처럼
서빙한다 → 문서 HTML 하나만 공유해도(인터넷만 되면) 스타일·렌더가 적용됨.

## 파일
- (스타일 CSS는 `doc.js`에 내장 — 별도 doc.css 파일 없음)
- `doc.js` — 마크다운 렌더 + 사이드바 자동생성 + 콜아웃/표/단계 변환 + 테마토글 + 맨위로
- `theme-init.js` — 렌더 전 테마 적용(no-flash), `<head>`에서 동기 로드

## 사용 (문서 HTML)
`<commit>` 자리에 **커밋 SHA**를 넣는다(아래 "버전 고정" 참고).
```html
<head>
  <script src="https://cdn.jsdelivr.net/gh/choihong-xvive/doc-assets@<commit>/theme-init.js"></script>
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
  <script src="https://cdn.jsdelivr.net/gh/choihong-xvive/doc-assets@<commit>/doc.js"></script>
</body>
```
> 스타일은 `doc.js`가 인라인 `<style>`로 주입한다(외부 CSS `<link>`는 Obsidian HTML Viewer 등 샌드박스 CSP가 막으므로 별도 link 불필요).

## 콘텐츠 규약 (마크다운)
- 섹션 = `## 제목` (사이드바 자동)
- 콜아웃 = `> [!INFO|OK|WARN|DANGER] 제목` + 다음 줄 본문
- 단계 = 숫자 리스트(`1. 2. 3.`) → 원형 번호
- 다이어그램 = ` ``` ` 코드펜스(다크)
- 표지·비교박스 등 특수블록 = 소량 inline HTML

## 버전 고정 (중요) — 커밋 SHA 권장
jsDelivr는 **커밋 SHA**(`@a9200ab…`)를 즉시·영구 서빙한다. 반면 **태그는 캐시 이슈**가 잦다:
새 태그는 한동안 404, 이동한 태그는 옛 내용을 stale 서빙(목록/매핑 캐시). 그래서 **배포 문서는 커밋 SHA로 핀**한다.

- 자산 수정 → 커밋/푸시 → 그 **커밋 SHA**를 문서 HTML의 jsDelivr URL에 박는다.
- 기존 문서는 옛 SHA에 그대로 남아 안 깨짐(불변).
- `@main`은 "항상 최신"이지만 mutable + 캐시(최대 7일) → 개발 미리보기용으로만.
- 부득이 태그를 쓰면 새 태그 생성(이동 금지) + 필요 시 `https://purge.jsdelivr.net/gh/<user>/doc-assets@<ref>/<file>`로 purge.
