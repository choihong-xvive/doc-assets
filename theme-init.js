// 렌더 전 테마 적용 (no-flash). <head>에서 동기 로드.
try { var t = localStorage.getItem('mdtheme'); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
