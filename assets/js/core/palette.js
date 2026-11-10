/*
  Search palette: Ctrl+K (Cmd+K on Mac), "/" or the Search button in the header.
  Lists pages, home sections, every guide from content/data.js, and a few actions.
*/
(function () {
  "use strict";
  var NK = window.NK, doc = document, root = doc.documentElement;
  var S = NK.site, BASE = NK.base;
  var isHome = !!NK.$(".hero");
  var pal = null, input, list, items = [], shown = [], idx = 0, lastFocus = null;

  function buildItems() {
    var out = [], home = BASE;
    out.push({ group: "Pages", title: "Home", hint: "About, projects, contact", href: home, ic: "page" });
    out.push({ group: "Pages", title: "Blog", hint: "All guides", href: BASE + "blogs.html", ic: "page" });
    [["work", "Projects", "Things I've built"], ["experience", "Experience", "Where I've worked"],
     ["skills", "Toolkit and education", "Tools, degrees, achievements"],
     ["services", "Hire me", "Freelance AI engineering"], ["contact", "Contact", "Send me a message"]].forEach(function (s) {
      out.push({ group: "Sections", title: s[1], hint: s[2], href: home + "#" + s[0], ic: "hash" });
    });
    (S.blogs || []).forEach(function (b) {
      if (b.hidden) return;
      out.push({ group: "Guides", title: b.title || b.file, hint: (b.tags || []).join(" · "), extra: b.summary || "", ic: "page",
        href: b.page ? BASE + "blog/" + b.page : BASE + "Blogs/" + encodeURIComponent(b.file) });
    });
    out.push({ group: "Actions", title: "Switch light / dark theme", hint: "Theme", ic: "bolt", run: function () {
      var t = doc.getElementById("theme-toggle"); if (t) t.click();
    } });
    if (S.email) out.push({ group: "Actions", title: "Copy my email address", hint: S.email, ic: "bolt", run: function () {
      NK.copy(S.email).then(function () { NK.toast("Email copied"); }, function () { location.href = "mailto:" + S.email; });
    } });
    [["linkedin", "LinkedIn", "Work history and posts"], ["instagram", "Instagram", "@nikhiltiwary.in"], ["github", "GitHub", "Code and open-source projects"]].forEach(function (l) {
      if (S[l[0]]) out.push({ group: "Links", title: l[1], hint: l[2], href: S[l[0]], ext: true, ic: "link" });
    });
    if (S.resumeFile) out.push({ group: "Links", title: "Resume (PDF)", hint: "Opens in a new tab", href: BASE + S.resumeFile, ext: true, ic: "page" });
    return out;
  }

  function build() {
    pal = NK.el("div", "kpal");
    pal.hidden = true;
    pal.innerHTML =
      '<div class="kpal-back" data-close></div>' +
      '<div class="kpal-panel" role="dialog" aria-modal="true" aria-label="Search the site">' +
      '<div class="kpal-search">' + NK.icon("search") +
      '<input type="text" placeholder="Search pages, guides, actions…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="kpal-list" aria-autocomplete="list">' +
      "<kbd>Esc</kbd></div>" +
      '<ul class="kpal-list" id="kpal-list" role="listbox"></ul>' +
      '<p class="kpal-foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></p>' +
      "</div>";
    doc.body.appendChild(pal);
    input = NK.$("input", pal);
    list = NK.$(".kpal-list", pal);
    items = buildItems();
    pal.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });
    input.addEventListener("input", function () { idx = 0; render(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") { e.preventDefault(); choose(shown[idx]); }
      else if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") { e.preventDefault(); }
    });
    list.addEventListener("click", function (e) {
      var li = e.target.closest("[data-i]");
      if (li) choose(shown[+li.getAttribute("data-i")]);
    });
    list.addEventListener("mousemove", function (e) {
      var li = e.target.closest("[data-i]");
      if (li && +li.getAttribute("data-i") !== idx) { idx = +li.getAttribute("data-i"); mark(); }
    });
  }

  function score(it, q) {
    if (!q) return 1;
    var hay = (it.title + " " + it.hint + " " + it.group + " " + (it.extra || "")).toLowerCase();
    var t = it.title.toLowerCase(), s = 0, words = q.toLowerCase().split(/\s+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (t.indexOf(w) === 0) s += 6; else if (t.indexOf(w) > -1) s += 4; else if (hay.indexOf(w) > -1) s += 1; else return 0;
    }
    return s;
  }

  function render() {
    var q = input.value.trim();
    shown = items.map(function (it, i) { return { it: it, s: score(it, q), i: i }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return q ? (b.s - a.s) || (a.i - b.i) : a.i - b.i; })
      .map(function (x) { return x.it; });
    list.textContent = "";
    if (!shown.length) { list.appendChild(NK.el("li", "kpal-empty", "Nothing found for “" + q + "”")); return; }
    var lastGroup = null;
    shown.forEach(function (it, i) {
      if (!q && it.group !== lastGroup) { list.appendChild(NK.el("li", "kpal-group", it.group)); lastGroup = it.group; }
      var li = NK.el("li", "kpal-item");
      li.setAttribute("role", "option"); li.id = "kpal-o" + i; li.setAttribute("data-i", i);
      var ic = NK.el("span", "kpal-ic"); ic.innerHTML = NK.icon(it.ic);
      var txt = NK.el("span", "kpal-txt");
      txt.appendChild(NK.el("b", null, it.title));
      if (it.hint) txt.appendChild(NK.el("small", null, it.hint));
      li.appendChild(ic); li.appendChild(txt);
      li.appendChild(NK.el("span", "kpal-go", it.run ? "Run" : it.ext ? "↗" : "↵"));
      list.appendChild(li);
    });
    mark();
  }
  function mark() {
    NK.$$(".kpal-item", list).forEach(function (li) {
      var on = +li.getAttribute("data-i") === idx;
      li.classList.toggle("on", on);
      li.setAttribute("aria-selected", String(on));
      if (on) { input.setAttribute("aria-activedescendant", li.id); li.scrollIntoView({ block: "nearest" }); }
    });
  }
  function move(d) { if (shown.length) { idx = (idx + d + shown.length) % shown.length; mark(); } }

  function choose(it) {
    if (!it) return;
    close();
    if (it.run) { it.run(); return; }
    if (it.ext) { window.open(it.href, "_blank", "noopener"); return; }
    var hash = it.href.split("#")[1];
    if (hash && isHome) {
      var t = doc.getElementById(hash);
      if (t) { t.scrollIntoView({ behavior: NK.reduce ? "auto" : "smooth" }); history.replaceState(null, "", "#" + hash); return; }
    }
    location.href = it.href;
  }
  function open() {
    if (!pal) build();
    lastFocus = doc.activeElement;
    pal.hidden = false;
    root.classList.add("kpal-lock");
    requestAnimationFrame(function () { pal.classList.add("open"); });
    input.value = ""; idx = 0; render(); input.focus();
  }
  function close() {
    if (!pal || pal.hidden) return;
    pal.classList.remove("open");
    root.classList.remove("kpal-lock");
    setTimeout(function () { pal.hidden = true; }, NK.reduce ? 0 : 160);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  NK.palette = { open: open, close: close };
  doc.addEventListener("keydown", function (e) {
    var tag = (doc.activeElement && doc.activeElement.tagName) || "";
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (pal && !pal.hidden) close(); else open();
    } else if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(tag) && !(doc.activeElement && doc.activeElement.isContentEditable)) {
      e.preventDefault(); open();
    }
  });
})();
