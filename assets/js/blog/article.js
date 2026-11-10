/*
  Article pages (blog/*.html):
  - "Copy" buttons on prompts and message templates
  - DSA sheet: search, filters and a done-tracker saved in this browser
  Theme, header and motion come from assets/js/core.
*/
(function () {
  "use strict";
  var NK = window.NK;

  /* Copy buttons on prompts and message templates */
  function textOf(id) {
    var n = document.getElementById(id);
    return n ? n.innerText.replace(/\n{3,}/g, "\n\n").trim() : "";
  }
  /* Example prompts show only the filled details; copying adds the shared role, rules and output parts. */
  function examplePrompt(id) {
    var master = textOf("master-prompt"), details = textOf(id);
    var start = master.indexOf("=== MY DETAILS"), rules = master.indexOf("=== STRICT RULES");
    if (start < 0 || rules < 0) return details;
    return master.slice(0, start) + details + "\n\n" + master.slice(rules);
  }
  document.querySelectorAll("[data-copy], [data-copy-example]").forEach(function (b) {
    var original = b.textContent;
    b.addEventListener("click", function () {
      var text = b.hasAttribute("data-copy-example") ? examplePrompt(b.getAttribute("data-copy-example")) : textOf(b.getAttribute("data-copy"));
      NK.copy(text).then(function () {
        b.textContent = "Copied"; b.classList.add("done");
      }, function () {
        b.textContent = "Select and copy";
      }).then(function () {
        setTimeout(function () { b.textContent = original; b.classList.remove("done"); }, 1800);
      });
    });
  });

  /* DSA sheet */
  var sheet = document.querySelector("[data-dsa]");
  if (!sheet) return;
  var KEY = "dsa-done-v1";
  var items = Array.prototype.slice.call(sheet.querySelectorAll(".q"));
  var sections = Array.prototype.slice.call(sheet.querySelectorAll(".dsa-sec"));
  var search = document.getElementById("dsa-search");
  var filterBtns = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var fill = document.querySelector(".progress-fill");
  var countEl = document.getElementById("dsa-done-count");
  var emptyEl = document.getElementById("dsa-empty");
  var filter = "all";

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } }
  function save(ids) { try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) { /* ignore */ } }
  var done = {};
  load().forEach(function (id) { done[id] = true; });

  function progress() {
    var n = items.filter(function (li) { return done[li.getAttribute("data-id")]; }).length;
    countEl.textContent = n + " / " + items.length + " done";
    fill.style.width = (items.length ? (n / items.length) * 100 : 0) + "%";
  }
  function apply() {
    var q = (search.value || "").trim().toLowerCase();
    var shown = 0;
    items.forEach(function (li) {
      var ok = true;
      if (q && li.getAttribute("data-q").indexOf(q) < 0) ok = false;
      if (filter === "n" && !li.hasAttribute("data-n")) ok = false;
      if (filter === "s" && !li.hasAttribute("data-s")) ok = false;
      if (filter === "both" && !(li.hasAttribute("data-n") && li.hasAttribute("data-s"))) ok = false;
      if (filter === "todo" && done[li.getAttribute("data-id")]) ok = false;
      li.hidden = !ok;
      if (ok) shown++;
    });
    sections.forEach(function (sec) { sec.hidden = !sec.querySelector(".q:not([hidden])"); });
    emptyEl.hidden = shown > 0;
  }

  items.forEach(function (li) {
    var id = li.getAttribute("data-id"), box = li.querySelector("input");
    li.setAttribute("data-q", li.querySelector(".q-name").textContent.toLowerCase());
    box.checked = !!done[id];
    li.classList.toggle("done", box.checked);
    box.addEventListener("change", function () {
      if (box.checked) done[id] = true; else delete done[id];
      li.classList.toggle("done", box.checked);
      save(Object.keys(done));
      progress();
      if (filter === "todo") apply();
    });
  });
  search.addEventListener("input", apply);
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      filter = b.getAttribute("data-filter");
      filterBtns.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      apply();
    });
  });
  document.getElementById("dsa-reset").addEventListener("click", function () {
    if (!window.confirm("Clear all ticks on this sheet?")) return;
    done = {}; save([]);
    items.forEach(function (li) { li.querySelector("input").checked = false; li.classList.remove("done"); });
    progress(); apply();
  });
  progress();
})();
