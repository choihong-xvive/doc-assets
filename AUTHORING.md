# 문서 HTML 작성 가이드 (AI/사람용)

이 레포(`choihong-xvive/doc-assets`)의 `doc.js`/`theme-init.js`를 써서 **마크다운 자가렌더 단일 HTML 문서**를 만드는 법. 새 문서가 필요하면 이 가이드대로 하면 된다. 복붙 시작점: [`TEMPLATE.html`](TEMPLATE.html).

## 0. 한 줄 개념
HTML 한 파일 안에 콘텐츠를 **마크다운으로** 넣으면, 브라우저에서 `doc.js`가 그걸 HTML로 렌더하고 스타일(shadcn 톤, light/dark)을 입힌다. CSS는 `doc.js`가 인라인 `<style>`로 주입한다(외부 link 불필요). 편집은 마크다운 블록만.

## 1. 만드는 법 (3단계)
1. `TEMPLATE.html` 복사.
2. `<aside class="sidebar">`의 brand/title/version/meta와 `<title>`을 채운다. `<ul id="nav">`는 **비워둔다**(자동 생성).
3. `<script type="text/markdown" id="source">` 안을 **마크다운으로** 작성. 끝.

## 2. 필수 골격 (이 id들이 있어야 doc.js가 동작)
- `#source` — 마크다운 원문(`<script type="text/markdown">`)
- `#content` — 렌더 결과가 들어갈 빈 컨테이너(`<div class="md-body" id="content">`)
- `#nav` — 사이드바 목록(`<ul id="nav">`, 비워둠 → `##`에서 자동 생성)
- `#themeToggle`, `#toTop` — 다크토글·맨위로 버튼(없으면 그 기능만 생략)
- body 끝에 `marked`(CDN) → `doc.js`(CDN) 순서로 로드

> **`#copyMd`(MD 복사 버튼)는 마크업이 필요 없다.** doc.js가 `#themeToggle` 바로 밑에 자동으로
> 만들어 붙인다 — 기존 문서도 핀만 올리면 생긴다. 클릭하면 `#source`의 마크다운 원문이
> 클립보드로 복사된다(커버 블록은 `# 제목` + 인용 + 리드 문단으로 치환). 인쇄 시 숨김.
> 위치를 직접 잡고 싶으면 `<button id="copyMd">`를 두면 doc.js가 그 엘리먼트를 재사용한다.

## 3. 마크다운 규약
| 쓰는 법 | 결과 |
|---|---|
| `## 제목` | 섹션 헤더 + **사이드바 항목 자동 생성**(번호 01,02…) |
| `### 제목` | 소제목 |
| `> [!INFO] 제목` + 빈 `>` + 본문 | 콜아웃(인디고). 타입: `INFO`/`OK`(초록)/`WARN`(주황)/`DANGER`(빨강). 제목 생략 시 기본 라벨 |
| `1. 2. 3.` 숫자 리스트 | **원형 번호 단계**로 렌더 |
| 표 \| ... \| | 카드형 표(자동 `.table-wrap` 래핑) |
| ` ``` ` 코드펜스 | **다크 박스**(ASCII 다이어그램/트리/코드에) |
| `**굵게**` `\`코드\`` `[링크](url)` | 일반 마크다운 |

### 콜아웃 예
```
> [!WARN] 토큰 취급
>
> 본문 내용. 리스트도 가능:
> - 항목
```

## 4. 특수 블록(소량 inline HTML 섬)
마크다운으로 표현 안 되는 시각 블록만 inline HTML로(나머진 전부 마크다운). marked가 그대로 통과시킴.

- **표지(cover)**: `<header class="cover">` 안에 `.cover-eyebrow`/`.cover-title`/`.cover-subtitle`/`.cover-meta`(4칸 `<div><span>키</span><b>값</b></div>`).
- **비교(compare)**: `<div class="compare">` 안에 `.compare-col.compare-bad`(❌) / `.compare-col.compare-good`(✅), 각 `.compare-label` + `<p>`.
- 스니펫은 `TEMPLATE.html` 참고.

## 5. 버전 고정 (배포/공유 시 중요)
`doc.js`/`theme-init.js`는 jsDelivr로 로드한다. URL의 `@<ref>`:
- **개발/미리보기**: `@main` (항상 최신, 단 캐시 ~7일·mutable)
- **배포/공유본**: **커밋 SHA로 고정** → `@a1b2c3d`. 즉시·영구·불변. 스타일 바뀌어도 옛 문서 안 깨짐.
- 현재 최신 SHA: `git -C doc-assets rev-parse HEAD` 또는 GitHub 커밋에서 확인.
- ⚠️ **태그(@v1…)는 피한다**: jsDelivr가 새 태그를 한동안 404, 이동 태그를 stale 서빙하는 캐시 이슈가 잦다. 커밋 SHA가 가장 안전.

## 6. 어디서 열리나 (중요한 한계)
이 문서는 **JS 실행 + 인터넷(CDN)** 이 있어야 렌더된다.
| 환경 | 됨? | 비고 |
|---|---|---|
| 데스크톱 브라우저(Chrome/Safari/Edge) | ✅ | 권장 |
| iOS/Android **모바일 브라우저** | ✅ | 인터넷 필요 |
| Obsidian | ⚠️ | **HTML Viewer 플러그인 + Scripts ON** 필요. 기본 미리보기는 JS 차단 |
| iOS **파일 앱 미리보기(Quick Look)** | ❌ | **JS 실행 안 함** → 껍데기만. Documents by Readdle 같은 브라우저앱으로 열 것 |
| 메일/메신저 미리보기 | ❌ | 보통 JS 차단 |
| 오프라인 | ❌ | CDN(marked·doc.js) 필요 |

→ **"아무 데서나/오프라인/Quick Look"에서도 열려야 하면**: 마크다운을 **미리 HTML로 렌더하고 CSS를 inline한 정적 자기완결본**을 따로 뽑는다(스크립트·CDN 0). 자가렌더본은 작업/공유(브라우저)용, 정적본은 배포용으로 역할 분리.

## 7. doc.js가 하는 일 (참고)
`run()`에서: ① 인라인 `<style>` 주입(CSS는 doc.js에 내장) ② 저장된 테마 적용 ③ `marked.parse(#source)` → `#content` ④ 표 `.table-wrap` 래핑 ⑤ `> [!TYPE]` blockquote → 콜아웃 변환 ⑥ `##`에서 사이드바 생성 + 스크롤 스파이 ⑦ 테마토글 ⑧ 맨위로. marked 미로드 시 raw 폴백.
