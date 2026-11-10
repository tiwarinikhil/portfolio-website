/*
  Home page: builds every section from content/data.js.
  Each section is built separately (NK.safe), so a mistake in one never empties the others.
  index.html also holds a plain-HTML copy of these sections for search engines (tools/prerender.py);
  each block below clears that copy and rebuilds it with the interactive version.
*/
(function () {
  "use strict";
  var NK = window.NK, S = NK.site, $ = NK.$, el = NK.el, safe = NK.safe;

  safe("text", function () {
    NK.$$("[data-bind]").forEach(function (n) {
      var v = S[n.getAttribute("data-bind")];
      if (v) n.textContent = v;
    });
    var resume = $("#resume-link");
    if (resume) { if (S.resumeFile) resume.href = S.resumeFile; else resume.hidden = true; }
    var mail = $("#email-link");
    if (mail && S.email) { mail.textContent = S.email; mail.href = "mailto:" + S.email; }
    var ph = $("#phone-line");
    if (ph && S.showPhone && S.phone) { ph.textContent = "Phone / WhatsApp: " + S.phone; ph.hidden = false; }
  });

  safe("social icons", function () {
    NK.$$("[data-social]").forEach(function (a) {
      var k = a.getAttribute("data-social");
      if (k === "email") { if (S.email) a.href = "mailto:" + S.email; return; }
      if (S[k]) a.href = S[k]; else a.hidden = true;
    });
  });

  safe("numbers", function () {
    var box = $("#stats");
    box.textContent = ""; /* replaces the copy written into index.html by tools/prerender.py */
    (S.stats || []).forEach(function (s) {
      var d = el("div", "stat");
      d.appendChild(el("dt", null, s.value));
      d.appendChild(el("dd", null, s.label));
      box.appendChild(d);
    });
  });

  safe("skills strip", function () {
    var stats = $(".stats"), words = [];
    (S.skills || []).forEach(function (g) { (g.items || []).forEach(function (w) { words.push(w); }); });
    if (!stats || !words.length) return;
    var ticker = el("div", "ticker wrap");
    ticker.setAttribute("aria-label", "Tools I use");
    var track = el("div", "ticker-track");
    for (var k = 0; k < 2; k++) {
      var row = el("ul", "ticker-row");
      if (k) row.setAttribute("aria-hidden", "true");
      words.forEach(function (w) { row.appendChild(el("li", null, w)); });
      track.appendChild(row);
    }
    ticker.appendChild(track);
    stats.parentNode.insertBefore(ticker, stats.nextSibling);
  });

  safe("projects", function () {
    var list = $("#projects"), filters = $("#filters");
    list.textContent = ""; filters.textContent = "";
    var projects = S.projects || [], tags = S.tags || [];
    var active = NK.store("filter") || "All";
    if (active !== "All" && tags.indexOf(active) < 0) active = "All";

    projects.forEach(function (p, i) {
      var li = el("li", "project");
      li.dataset.tags = (p.tags || []).join("|");
      var btn = el("button", "project-btn");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "p-more-" + i);

      var meta = el("div", "p-meta");
      meta.appendChild(el("span", "p-kind", p.kind));
      meta.appendChild(el("span", null, p.where));
      if (p.year) meta.appendChild(el("span", null, p.year));

      var main = el("div", "p-main");
      main.appendChild(el("h3", null, p.title));
      main.appendChild(el("p", "p-sum", p.summary));
      main.appendChild(el("span", "p-toggle", "Show details"));

      var metric = el("div", "p-metric" + (String(p.metric || "").length > 7 ? " long" : ""));
      metric.appendChild(el("b", null, p.metric));
      metric.appendChild(el("span", null, p.metricLabel));

      var more = el("div", "p-more");
      more.id = "p-more-" + i;
      more.hidden = true;
      if (p.details && p.details.length) {
        var ul = el("ul");
        p.details.forEach(function (d) { ul.appendChild(el("li", null, d)); });
        more.appendChild(ul);
      }
      var stack = el("div", "p-stack");
      (p.stack || []).forEach(function (t) { stack.appendChild(el("span", null, t)); });
      more.appendChild(stack);
      if (p.link) {
        var a = el("a", "p-link", "View the code on GitHub");
        a.href = p.link; a.target = "_blank"; a.rel = "noopener";
        more.appendChild(a);
      }

      btn.appendChild(meta); btn.appendChild(main); btn.appendChild(metric); btn.appendChild(more);
      btn.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        more.hidden = open;
        main.querySelector(".p-toggle").textContent = open ? "Show details" : "Hide details";
      });
      li.appendChild(btn);
      list.appendChild(li);
    });

    function countFor(tag) {
      return tag === "All" ? projects.length : projects.filter(function (p) { return (p.tags || []).indexOf(tag) >= 0; }).length;
    }
    function apply(tag) {
      active = tag;
      NK.store("filter", tag);
      NK.$$(".filter", filters).forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tag === tag)); });
      NK.$$(".project", list).forEach(function (li) {
        li.hidden = tag !== "All" && li.dataset.tags.split("|").indexOf(tag) < 0;
      });
    }
    ["All"].concat(tags).forEach(function (tag) {
      var n = countFor(tag);
      if (!n) return;
      var b = el("button", "filter", tag);
      b.type = "button";
      b.dataset.tag = tag;
      b.appendChild(el("span", "n", String(n)));
      b.addEventListener("click", function () { apply(tag); });
      filters.appendChild(b);
    });
    apply(active);
  });

  safe("experience", function () {
    var tl = $("#timeline");
    tl.textContent = "";
    (S.experience || []).forEach(function (j) {
      var li = el("li", "job");
      li.appendChild(el("div", "job-dates", j.dates));
      li.appendChild(el("h3", null, j.company));
      li.appendChild(el("p", "job-role", j.role + (j.place ? ", " + j.place : "")));
      var ul = el("ul");
      (j.points || []).forEach(function (pt) { ul.appendChild(el("li", null, pt)); });
      li.appendChild(ul);
      tl.appendChild(li);
    });
  });

  safe("toolkit", function () {
    var box = $("#skill-groups");
    box.textContent = "";
    (S.skills || []).forEach(function (g) {
      var d = el("div", "skill-group");
      d.appendChild(el("h3", null, g.group));
      var items = el("div", "skill-items");
      (g.items || []).forEach(function (it) { items.appendChild(el("span", null, it)); });
      d.appendChild(items);
      box.appendChild(d);
    });
  });

  safe("education", function () {
    var edu = $("#education");
    edu.textContent = "";
    (S.education || []).forEach(function (e) {
      var li = el("li");
      li.appendChild(el("b", null, e.degree));
      li.appendChild(el("span", null, e.school + ", " + e.dates));
      edu.appendChild(li);
    });
    $("#achievements").textContent = (S.achievements || []).join(" ");
  });

  safe("services", function () {
    var box = $("#service-list");
    box.textContent = "";
    (S.services || []).forEach(function (s) {
      var d = el("div", "service");
      d.appendChild(el("h3", null, s.title));
      d.appendChild(el("p", null, s.text));
      box.appendChild(d);
    });
  });
})();
