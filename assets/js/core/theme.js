/*
  Light / dark theme. Loaded in <head> so the saved theme is applied before the page paints (no flash).
  Follows the system setting until the visitor presses the theme button; then their choice is remembered.
*/
(function () {
  "use strict";
  var root = document.documentElement;
  function get() { try { return localStorage.getItem("theme"); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem("theme", v); } catch (e) { /* storage blocked */ } }

  var saved = get();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function current() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var text = btn.querySelector(".theme-text");
    function label() {
      var next = current() === "dark" ? "light" : "dark";
      if (text) text.textContent = next === "dark" ? "Dark" : "Light";
      btn.setAttribute("aria-label", "Switch to " + next + " theme");
    }
    function flip() {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      set(next);
      label();
    }
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    btn.addEventListener("click", function () {
      if (!document.startViewTransition || reduce) { flip(); return; }
      /* New theme grows as a circle from the button. */
      var r = btn.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      var t = document.startViewTransition(flip);
      t.ready.then(function () {
        root.animate({ clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + rad + "px at " + x + "px " + y + "px)"] },
          { duration: 500, easing: "cubic-bezier(.2,.7,.2,1)", pseudoElement: "::view-transition-new(root)" });
      }).catch(function () { /* animation skipped, theme still changed */ });
    });
    label();
  });
})();
