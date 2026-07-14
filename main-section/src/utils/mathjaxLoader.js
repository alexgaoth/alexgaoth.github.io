// On-demand MathJax loading (SEO-PLAN 0.6). The CDN script used to ship on
// every page from public/index.html; now it loads only when a thought's
// markdown actually contains TeX. Config mirrors the old template block,
// including the 'mathjax-ready' event ThoughtArticlePage listens for.
const MATHJAX_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';

// Matches the delimiters MathJax is configured for: $$...$$, \[...\],
// \(...\), and single-dollar inline math. Run on the preprocessed markdown
// (fenced ```math blocks are already rewritten to $$...$$ by then).
const TEX_PATTERN = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^\n$]+\$/;

export function containsTex(markdown) {
  return typeof markdown === 'string' && TEX_PATTERN.test(markdown);
}

let loadStarted = false;

export function ensureMathJax() {
  if (typeof window === 'undefined' || loadStarted || window.MathJax?.typesetPromise) {
    return;
  }
  loadStarted = true;

  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      processEnvironments: true,
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    },
    startup: {
      typeset: false,
      ready() {
        window.MathJax.startup.defaultReady();
        window.dispatchEvent(new Event('mathjax-ready'));
      },
    },
  };

  const script = document.createElement('script');
  script.defer = true;
  script.src = MATHJAX_SRC;
  document.head.appendChild(script);
}
