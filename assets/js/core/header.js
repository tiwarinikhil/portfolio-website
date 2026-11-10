/*
  Header behaviour on every page:
  scroll progress bar, header shadow, back-to-top button, search button, mobile menu,
  and highlighting the current section (menu on the home page, "On this page" list on articles).
*/
(function () {
  "use strict";
  var NK = window.NK, doc = document;
  var header = NK.$(".top"), inner = NK.$(".top-inner"), nav = NK.$(".nav");
  var themeBtn = doc.getElementById("theme-toggle");

  NK.safe("progress", function () {
    var bar = NK.el("div", "scroll-progress");
    bar.setAttribute("aria-hidden", "true");
    doc.body.appendChild(bar);

    var toTop = NK.el("button", "to-top");
    toTop.type = "button";
    toTop.setAttribute("aria-label", "Back to top");
    toTop.innerHTML = NK.icon("up");
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: NK.reduce ? "auto" : "smooth" }); });
    doc.body.appendChild(toTop);

    NK.onScroll(function () {
      var y = window.scrollY, max = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      if (header) header.classList.toggle("scrolled", y > 8);
      toTop.classList.toggle("show", y > 900);
    });
  });

  NK.safe("search button", function () {
    if (!inner) return;
    var k = NK.el("button", "kbtn");
    k.type = "button";
    k.setAttribute("aria-label", "Search the site (Ctrl+K)");
    var mac = /Mac|iPhone|iPad/.test(navigator.platform || "");
    k.innerHTML = NK.icon("search") + '<span class="kbtn-text">Search</span><kbd>' + (mac ? "⌘" : "Ctrl") + " K</kbd>";
    inner.insertBefore(k, themeBtn || null);
    k.addEventListener("click", function () { if (NK.palette) NK.palette.open(); });
  });

  NK.safe("mobile menu", function () {
    if (!inner || !nav || !header) return;
    nav.id = nav.id || "site-nav";
    var m = NK.el("button", "menu-btn");
    m.type = "button";
    m.setAttribute("aria-controls", nav.id);
    function set(open) {
      header.classList.toggle("menu-open", open);
      m.setAttribute("aria-expanded", String(open));
      m.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      m.innerHTML = NK.icon(open ? "close" : "menu");
    }
    set(false);
    inner.appendChild(m);
    m.addEventListener("click", function () { set(!header.classList.contains("menu-open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
  });

  /* Mark the link whose section is at the top of the screen. */
  function spy(links, offset) {
    var map = [];
    links.forEach(function (a) {
      var id = (a.getAttribute("href") || "").split("#")[1];
      var sec = id && doc.getElementById(id);
      if (sec) map.push({ a: a, sec: sec });
    });
    if (!map.length) return;
    NK.onScroll(function () {
      var cur = null;
      map.forEach(function (m) { if (m.sec.getBoundingClientRect().top <= offset) cur = m; });
      map.forEach(function (m) {
        m.a.classList.toggle("on", m === cur);
        if (m === cur) m.a.setAttribute("aria-current", "true"); else m.a.removeAttribute("aria-current");
      });
    });
  }
  NK.safe("section highlight", function () {
    if (nav && NK.$(".hero")) spy(NK.$$('a[href^="#"]', nav), 140);
    var toc = NK.$$(".post-toc a");
    if (toc.length) spy(toc, 160);
  });
})();
