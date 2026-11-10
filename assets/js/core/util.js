/*
  Shared helpers for every page (loaded right after content/data.js).
  Everything hangs off one global, window.NK, so the other scripts stay small.
*/
(function () {
  "use strict";
  var doc = document;
  var me = (doc.currentScript && doc.currentScript.src) || "";
  var NK = (window.NK = window.NK || {});

  NK.site = window.SITE || {};
  /* Site root URL, worked out from where this file lives, so links work from /blog/ pages too. */
  NK.base = me.replace(/assets\/js\/core\/util\.js(\?.*)?$/, "");
  NK.reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  NK.$ = function (sel, root) { return (root || doc).querySelector(sel); };
  NK.$$ = function (sel, root) { return [].slice.call((root || doc).querySelectorAll(sel)); };

  NK.el = function (tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* localStorage that never throws (private mode, blocked storage). */
  NK.store = function (key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
    return null;
  };

  /* Run one part of the page; if it fails, log it and keep going so the rest still works. */
  NK.safe = function (name, fn) {
    try { fn(); } catch (e) { if (window.console) console.error("[" + name + "] failed:", e); }
  };

  NK.ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    page: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    hash: '<path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    link: '<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'
  };
  NK.icon = function (name) {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (NK.ICONS[name] || "") + "</svg>";
  };

  /* Copy text; falls back to a hidden textarea where the clipboard API is not allowed. */
  NK.copy = function (text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0";
      doc.body.appendChild(ta); ta.select();
      try { if (doc.execCommand("copy")) resolve(); else reject(new Error("copy")); } catch (e) { reject(e); }
      doc.body.removeChild(ta);
    });
  };

  var toastEl = null, toastTimer = 0;
  NK.toast = function (msg) {
    if (!toastEl) { toastEl = NK.el("div", "toast"); toastEl.setAttribute("role", "status"); doc.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  };

  /* One shared, throttled scroll/resize loop. Other scripts add a function with NK.onScroll(fn). */
  var scrollFns = [], ticking = false;
  function tick() { ticking = false; scrollFns.forEach(function (fn) { NK.safe("scroll", fn); }); }
  function queue() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  NK.onScroll = function (fn) { scrollFns.push(fn); NK.safe("scroll", fn); };
})();
