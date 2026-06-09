/* =====================================================================
   마크다운 자가렌더 단일 HTML 렌더러
   사용: 문서 HTML에
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/<user>/doc-assets@v1/doc.css">
     <script src="https://cdn.jsdelivr.net/npm/marked@12/marked.min.js"></script>
     <script src="https://cdn.jsdelivr.net/gh/<user>/doc-assets@v1/doc.js"></script>
   필요한 DOM: #source(마크다운), #content, #nav, #themeToggle, #toTop
   ===================================================================== */
(function () {
  function run() {
    var srcEl = document.getElementById('source');
    var host = document.getElementById('content');
    if (!srcEl || !host) return;
    var src = srcEl.textContent;

    // 1) 마크다운 렌더 (marked 미로드 시 raw 폴백)
    if (window.marked) {
      marked.setOptions({ gfm: true, breaks: false });
      host.innerHTML = marked.parse(src);
    } else {
      host.innerHTML = '<pre style="white-space:pre-wrap">' + src.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</pre>';
    }

    // 2) 표 래핑
    host.querySelectorAll('table').forEach(function (t) {
      var w = document.createElement('div'); w.className = 'table-wrap';
      t.parentNode.insertBefore(w, t); w.appendChild(t);
    });

    // 3) 콜아웃 변환:  > [!TYPE] 제목
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

    // 4) 섹션 번호/ID + 사이드바 자동 생성
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

    // 5) 테마 토글
    var tg = document.getElementById('themeToggle');
    function isDark() { var d = document.documentElement.getAttribute('data-theme'); return d ? d === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
    if (tg) {
      var lbl = function () { tg.textContent = isDark() ? '☀ 라이트' : '🌙 다크'; };
      tg.onclick = function () { var n = isDark() ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', n); try { localStorage.setItem('mdtheme', n); } catch (e) {} lbl(); };
      lbl();
    }

    // 6) 맨 위로
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
