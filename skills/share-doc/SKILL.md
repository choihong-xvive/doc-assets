---
name: share-doc
description: >
  공유용 단일 HTML 문서를 사이드바 레이아웃(표지 + 자동 목차 + 콜아웃/단계/비교 컴포넌트)으로
  작성한다. 사용자가 "공유 문서", "공유용 문서", "share doc", 또는 사이드바형 마크다운 HTML
  문서를 만들어 달라고 할 때 사용. doc-assets CDN 테마(choihong-xvive/doc-assets)에 마크다운
  소스를 얹는 자가렌더 단일 파일 형식 — 빌드·서버 없이 브라우저에서 바로 렌더된다. 설계서·
  기획서·핸드오프·리포트를 팀/외부에 공유할 때.
---

# Share-Doc — 자가렌더 단일 HTML 문서

마크다운 본문을 **사이드바 레이아웃 + 표지 + 자동 목차**로 렌더하는 단일 HTML 파일을 만든다.
스타일·목차·테마 토글·한글 폰트 폴백은 전부 CDN(`choihong-xvive/doc-assets`)이 담당하므로,
**작성자는 `<script id="source">` 안의 마크다운만 쓴다.** CSS·렌더러는 손대지 않는다.

전체 규약 원문은 같은 레포의 `AUTHORING.md`, 복붙 시작점은 이 폴더의 `template.html`.

## 작성 절차 (3단계)

1. `template.html`을 복사한다. CDN `<script>` 3줄과 골격 id(`#source`/`#content`/`#nav`/
   `#themeToggle`/`#toTop`)는 **그대로 둔다** — 없거나 바꾸면 렌더가 깨진다.
2. `<title>`, 사이드바(brand·title·version·meta), 표지(`<header class="cover">`)의
   `{{…}}` 플레이스홀더를 실제 값으로 채운다. `<ul id="nav">`는 **비워둔다**(자동 생성).
3. 본문은 `<script type="text/markdown" id="source">` **안에만** 마크다운으로 쓴다.

## 형식 규칙 (CDN 렌더러 약속)

- **섹션** = `## 제목` → 사이드바 목차가 `##`에서 자동 생성(번호 01,02…). 의미 단위로 끊어라.
- **소제목** = `### 제목`.
- **콜아웃** = `> [!INFO|OK|WARN|DANGER] 제목` 한 줄 + 빈 `>` 줄 + 본문(인용 `>` 유지).
  - `INFO` 통찰·요지 / `OK` 확정·권장(초록) / `WARN` 주의(주황) / `DANGER` 치명·필수(빨강).
- **단계 리스트** = `1.` `2.` `3.` → 원형 번호 배지. 순서 있는 절차에만.
- **표** = 표준 파이프 테이블(자동 카드 래핑). 결정 매트릭스·비교에 적극 사용.
- **다이어그램/코드** = ` ``` ` 코드펜스 → 다크 박스. ASCII 박스·트리 환영.
- **표지** = `<header class="cover">`(eyebrow/title/subtitle/meta). 문서당 1개, 최상단.
- **좌우 비교** = `<div class="compare">` + `compare-col compare-bad`(❌)/`compare-good`(✅).
- 표지·비교 외에는 inline HTML을 쓰지 말고 전부 마크다운으로.

## 버전 고정 (공유/배포 시)

- 작업·미리보기: `@main` (최신, 캐시 mutable).
- **공유/배포본: 커밋 SHA로 고정**(`@a1b2c3d`) → 불변·영구. 스타일이 바뀌어도 옛 문서 안 깨짐.
- 태그(`@v1`)는 jsDelivr 캐시 이슈로 피한다(AUTHORING.md §5).

## 한계 (어디서 열리나)

JS 실행 + 인터넷(CDN)이 있어야 렌더된다. 데스크톱·모바일 브라우저 ✅ / Quick Look·메일
미리보기·오프라인 ❌. "아무 데서나 열려야" 하면 마크다운을 미리 렌더하고 CSS를 inline한
정적 자기완결본을 따로 뽑는다(AUTHORING.md §6).

## 설치 (다른 컴퓨터)

이 `share-doc/` 폴더를 `~/.claude/skills/`(전역) 또는 프로젝트 `.claude/skills/`에 복사하면
끝. 별도 의존성 없음 — 렌더 자산은 CDN으로 로드된다.

## 하지 말 것

- 인라인 `<style>`/`<link rel=stylesheet>` 추가 금지 — 테마는 CDN 단일 출처.
- 마크다운을 `<script id="source">` 밖(예: `#content` 안)에 쓰지 말 것 — 비어 있어야 렌더된다.
