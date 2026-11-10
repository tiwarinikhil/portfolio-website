/*
  Motion on every page. Loaded last, after the page content is built.
  - Glow behind the first screen
  - Fade-in on scroll. Fail-safe: only things below the first screen are hidden, and a second check
    on every scroll shows anything that is on screen even if the browser's observer never fires.
  - Numbers count up, cards light up under the mouse
  - Home: the resume window tilts flat and the big statement lights up word by word as you scroll
  - Articles: a link icon on each heading
  Visitors who ask their system for reduced motion get none of this.
*/
(function () {
  "use strict";
  var NK = window.NK, doc = document, root = doc.documentElement;
  var main = doc.getElementById("main");
  if (/[?&]prerender(&|=|$)/.test(location.search)) return; /* tools/prerender.py: keep the HTML plain */
  root.classList.add("fx");

  NK.safe("glow", function () {
    if (!main || !NK.$(".hero, .page-head, .post-head")) return;
    var a = NK.el("div", "aurora");
    a.setAttribute("aria-hidden", "true");
    a.innerHTML = "<span></span><span></span><span></span><i></i>";
    main.insertBefore(a, main.firstChild);
  });

  /* ---------- Fade in on scroll ---------- */
  var REVEAL = [".section-head", ".exp-side", ".stat", ".project", ".job", ".skill-group", ".service", ".tile",
    ".statement-wrap .kicker", ".blog-card", ".blog-cta > *", ".more-list li",
    ".prose > h2", ".prose > .table-wrap", ".prose > .callout", ".prose > .steps > li", ".prose > .copy-block", ".dsa-sec"].join(",");
  var pending = [];
  function show(n) { n.classList.add("in"); }
  function check() {
    if (!pending.length) return;
    var vh = window.innerHeight;
    pending = pending.filter(function (n) {
      var r = n.getBoundingClientRect();
      if (r.top < vh - 20 || r.height === 0) { show(n); return false; }
      return true;
    });
  }
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.01 }) : null;

  function reveal(scope) {
    if (NK.reduce) return;
    var nodes = [];
    if (scope.matches && scope.matches(REVEAL)) nodes.push(scope);
    if (scope.querySelectorAll) nodes = nodes.concat(NK.$$(REVEAL, scope));
    var vh = window.innerHeight;
    nodes.forEach(function (n) {
      if (n.classList.contains("rv")) return;
      if (n.getBoundingClientRect().top < vh) return; /* already on screen: never hide it */
      var i = n.parentNode ? [].indexOf.call(n.parentNode.children, n) : 0;
      n.style.setProperty("--d", Math.min(i, 5) * 60 + "ms");
      n.classList.add("rv");
      pending.push(n);
      if (io) io.observe(n);
    });
  }
  NK.safe("reveal", function () {
    reveal(doc.body);
    NK.onScroll(check);
    window.addEventListener("load", check);
    window.addEventListener("hashchange", function () { setTimeout(check, 50); });
    window.addEventListener("beforeprint", function () { pending.forEach(show); pending = []; });
    /* Blog cards arrive later (after the PDF list loads); fade those in too. */
    if ("MutationObserver" in window && main) {
      new MutationObserver(function (muts) {
        muts.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) reveal(n); }); });
      }).observe(main, { childList: true, subtree: true });
    }
  });

  /* ---------- Numbers count up ---------- */
  NK.safe("count up", function () {
    var nums = NK.$$(".stat dt, .dsa-stats b");
    if (!nums.length || NK.reduce || !("IntersectionObserver" in window)) return;
    function run(node) {
      var raw = node.textContent, m = raw.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
      if (!m) return;
      var end = parseFloat(m[2]), dec = (m[2].split(".")[1] || "").length, t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - p, 4);
        node.textContent = m[1] + (end * e).toFixed(dec) + m[3];
        if (p < 1) requestAnimationFrame(step); else node.textContent = raw;
      }
      requestAnimationFrame(step);
    }
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { cio.observe(n); });
  });

  /* ---------- Spotlight under the mouse ---------- */
  NK.safe("spotlight", function () {
    if (!(window.matchMedia && matchMedia("(hover: hover)").matches)) return;
    var GLOW = ".blog-card, .ask, .service, .tile, .skill-group, .more-list a, .stat, .copy-block, .kpal-panel";
    doc.addEventListener("pointermove", function (e) {
      var c = e.target.closest && e.target.closest(GLOW);
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px");
      c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  });

  /* ---------- Home: window tilt + statement words ---------- */
  NK.safe("scroll effects", function () {
    if (NK.reduce) return;
    var win = NK.$(".showcase .window");
    var blocks = NK.$$("[data-words]").map(function (blk) {
      var full = blk.textContent.trim();
      var words = full.split(/\s+/);
      var label = NK.el("span", "sr", full);
      blk.textContent = "";
      blk.appendChild(label);
      var spans = words.map(function (w, i) {
        var sp = NK.el("span", "w", w);
        sp.setAttribute("aria-hidden", "true");
        blk.appendChild(sp);
        if (i < words.length - 1) blk.appendChild(doc.createTextNode(" "));
        return sp;
      });
      return { el: blk, spans: spans };
    });
    NK.onScroll(function () {
      var vh = window.innerHeight;
      if (win) {
        if (window.innerWidth < 700) { win.style.removeProperty("--tilt"); win.style.removeProperty("--tscale"); }
        else {
          var p = Math.max(0, Math.min(1, (vh - win.getBoundingClientRect().top) / (vh * 0.65)));
          win.style.setProperty("--tilt", (14 * (1 - p)).toFixed(2) + "deg");
          win.style.setProperty("--tscale", (0.94 + 0.06 * p).toFixed(3));
        }
      }
      blocks.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
        var k = p * (b.spans.length + 4);
        b.spans.forEach(function (sp, i) {
          sp.style.setProperty("--o", (0.22 + 0.78 * Math.max(0, Math.min(1, k - i))).toFixed(2));
        });
      });
    });
  });

  /* ---------- Articles: link icon on headings ---------- */
  NK.safe("heading links", function () {
    NK.$$(".prose h2[id]").forEach(function (h) {
      var a = NK.el("a", "h-anchor");
      a.href = "#" + h.id;
      a.setAttribute("aria-label", "Copy a link to this section");
      a.innerHTML = NK.icon("link");
      a.addEventListener("click", function () {
        NK.copy(location.href.split("#")[0] + "#" + h.id).then(function () { NK.toast("Link copied"); }, function () {});
      });
      h.appendChild(a);
    });
  });
})();
