/* Builds the page from data.js. You should not need to edit this file to change content. */
(function () {
  "use strict";
  var S = window.SITE;
  var $ = function (sel) { return document.querySelector(sel); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* Plain text fields */
  document.querySelectorAll("[data-bind]").forEach(function (n) {
    var v = S[n.getAttribute("data-bind")];
    if (v) n.textContent = v;
  });
  $("#year").textContent = new Date().getFullYear();
  if (S.resumeFile) { $("#resume-link").href = S.resumeFile; } else { $("#resume-link").hidden = true; }
  ["#li-link", "#foot-li"].forEach(function (s) { $(s).href = S.linkedin; });
  ["#gh-link", "#foot-gh"].forEach(function (s) { $(s).href = S.github; });
  $("#email-link").textContent = S.email;
  $("#email-link").href = "mailto:" + S.email;
  if (S.showPhone && S.phone) {
    var ph = $("#phone-line");
    ph.textContent = "Phone / WhatsApp: " + S.phone;
    ph.hidden = false;
  }

  /* Theme toggle: system by default, remembered once chosen */
  var root = document.documentElement;
  var saved = store("theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function labelTheme() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    $("#theme-toggle .theme-text").textContent = next === "dark" ? "Dark" : "Light";
    $("#theme-toggle").setAttribute("aria-label", "Switch to " + next + " theme");
  }
  $("#theme-toggle").addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("theme", next);
    labelTheme();
  });
  labelTheme();

  /* Stats */
  var stats = $("#stats");
  S.stats.forEach(function (s) {
    var d = el("div", "stat");
    d.appendChild(el("dt", null, s.value));
    d.appendChild(el("dd", null, s.label));
    stats.appendChild(d);
  });

  /* Projects with filter */
  var list = $("#projects");
  var filters = $("#filters");
  var active = store("filter") || "All";
  if (active !== "All" && S.tags.indexOf(active) < 0) active = "All";

  S.projects.forEach(function (p, i) {
    var li = el("li", "project");
    li.dataset.tags = p.tags.join("|");
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

    var metric = el("div", "p-metric");
    metric.appendChild(el("b", null, p.metric));
    metric.appendChild(el("span", null, p.metricLabel));

    btn.appendChild(meta);
    btn.appendChild(main);
    btn.appendChild(metric);

    var more = el("div", "p-more");
    more.id = "p-more-" + i;
    more.hidden = true;
    if (p.details && p.details.length) {
      var ul = el("ul");
      p.details.forEach(function (d) { ul.appendChild(el("li", null, d)); });
      more.appendChild(ul);
    }
    var stack = el("div", "p-stack");
    p.stack.forEach(function (t) { stack.appendChild(el("span", null, t)); });
    more.appendChild(stack);
    if (p.link) {
      var a = el("a", "p-link", "View the code on GitHub");
      a.href = p.link; a.target = "_blank"; a.rel = "noopener";
      more.appendChild(a);
    }
    btn.appendChild(more);

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
    return tag === "All" ? S.projects.length : S.projects.filter(function (p) { return p.tags.indexOf(tag) >= 0; }).length;
  }
  ["All"].concat(S.tags).forEach(function (tag) {
    var n = countFor(tag);
    if (!n) return;
    var b = el("button", "filter", tag);
    b.type = "button";
    b.appendChild(el("span", "n", String(n)));
    b.dataset.tag = tag;
    b.addEventListener("click", function () { applyFilter(tag); });
    filters.appendChild(b);
  });
  function applyFilter(tag) {
    active = tag;
    store("filter", tag);
    filters.querySelectorAll(".filter").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.tag === tag));
    });
    list.querySelectorAll(".project").forEach(function (li) {
      li.hidden = tag !== "All" && li.dataset.tags.split("|").indexOf(tag) < 0;
    });
  }
  applyFilter(active);

  /* Experience */
  var tl = $("#timeline");
  S.experience.forEach(function (j) {
    var li = el("li", "job");
    li.appendChild(el("div", "job-dates", j.dates));
    var body = el("div");
    body.appendChild(el("h3", null, j.company));
    body.appendChild(el("p", "job-role", j.role + ", " + j.place));
    var ul = el("ul");
    j.points.forEach(function (pt) { ul.appendChild(el("li", null, pt)); });
    body.appendChild(ul);
    li.appendChild(body);
    tl.appendChild(li);
  });

  /* Skills, education, services */
  var sg = $("#skill-groups");
  S.skills.forEach(function (g) {
    var d = el("div", "skill-group");
    d.appendChild(el("h3", null, g.group));
    var items = el("div", "skill-items");
    g.items.forEach(function (it) { items.appendChild(el("span", null, it)); });
    d.appendChild(items);
    sg.appendChild(d);
  });
  var edu = $("#education");
  S.education.forEach(function (e) {
    var li = el("li");
    li.appendChild(el("b", null, e.degree));
    li.appendChild(el("span", null, e.school + ", " + e.dates));
    edu.appendChild(li);
  });
  $("#achievements").textContent = S.achievements.join(" ");
  var sl = $("#service-list");
  S.services.forEach(function (s) {
    var d = el("div", "service");
    d.appendChild(el("h3", null, s.title));
    d.appendChild(el("p", null, s.text));
    sl.appendChild(d);
  });

  /* Resume search: BM25 over every line of the resume, with a few synonyms */
  var STOP = "a an the and or of to in on for with by at is are was were be been do does did you your i my me have has had it its this that what which who how can could would will from as any ever about into over".split(" ");
  var SYN = {
    aws: ["aws", "ec2", "s3", "lambda"],
    cloud: ["aws", "ec2", "s3", "lambda", "deploy"],
    deploy: ["deploy", "production", "aws"],
    voice: ["voice", "elevenlabs", "speech", "tts", "whisper", "asr"],
    speech: ["speech", "voice", "whisper", "asr", "tts"],
    rag: ["rag", "retrieval", "pinecone", "faiss", "embed", "semantic", "chunk"],
    search: ["search", "retrieval", "semantic", "bm25"],
    vector: ["vector", "pinecone", "faiss", "chromadb", "embed"],
    agent: ["agent", "agentic", "langgraph", "langchain", "react", "mcp", "tool"],
    vision: ["vision", "opencv", "mediapipe", "pose", "track", "yolo", "clip", "video"],
    finetun: ["fine", "tun", "llama"],
    fine: ["fine", "tun", "llama"],
    llm: ["llm", "llama", "gpt", "openai", "groq"],
    research: ["research", "iit", "ropar", "activitynet", "sota"],
    client: ["client", "freelanc", "international"],
    database: ["postgresql", "mysql", "database", "sql"]
  };
  function stem(w) {
    w = w.toLowerCase();
    if (w.length > 5 && /ing$/.test(w)) return w.slice(0, -3);
    if (w.length > 4 && /ed$/.test(w)) return w.slice(0, -2);
    if (w.length > 4 && /ment$/.test(w)) return w.slice(0, -4);
    if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
    return w;
  }
  function tokens(text) {
    return (text.toLowerCase().match(/[a-z0-9]+/g) || [])
      .filter(function (w) { return STOP.indexOf(w) < 0; })
      .map(stem);
  }

  var docs = [];
  S.experience.forEach(function (j) {
    j.points.forEach(function (pt) { docs.push({ text: pt, src: j.role + ", " + j.company }); });
  });
  S.projects.forEach(function (p) {
    docs.push({ text: p.summary, src: p.title + " · " + p.where });
    (p.details || []).forEach(function (d) { docs.push({ text: d, src: p.title + " · " + p.where }); });
  });
  S.skills.forEach(function (g) { docs.push({ text: g.items.join(", "), src: "Skills · " + g.group }); });
  S.education.forEach(function (e) { docs.push({ text: e.degree + ", " + e.school + ", " + e.dates, src: "Education" }); });
  S.achievements.forEach(function (a) { docs.push({ text: a, src: "Achievements" }); });

  var N = docs.length, avg = 0, df = {};
  docs.forEach(function (d) {
    d.toks = tokens(d.text);
    avg += d.toks.length;
    d.tf = {};
    d.toks.forEach(function (t) { d.tf[t] = (d.tf[t] || 0) + 1; });
    Object.keys(d.tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
  });
  avg /= N;

  function expand(q) {
    var out = {};
    tokens(q).forEach(function (t) {
      out[t] = 1;
      Object.keys(SYN).forEach(function (k) {
        if (t === k || t.indexOf(k) === 0) SYN[k].forEach(function (s) { if (!out[s]) out[s] = 0.6; });
      });
    });
    return out;
  }
  function matchTerm(tok, terms) {
    for (var t in terms) { if (tok === t || (t.length >= 4 && tok.indexOf(t) === 0)) return terms[t]; }
    return 0;
  }
  function search(q) {
    var terms = expand(q), k1 = 1.4, b = 0.75;
    return docs.map(function (d) {
      var score = 0;
      Object.keys(d.tf).forEach(function (tok) {
        var w = matchTerm(tok, terms);
        if (!w) return;
        var idf = Math.log(1 + (N - df[tok] + 0.5) / (df[tok] + 0.5));
        var tf = d.tf[tok];
        score += w * idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * d.toks.length / avg));
      });
      return { d: d, score: score };
    }).filter(function (r) { return r.score > 0.5; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 3)
      .map(function (r) { r.terms = terms; return r; });
  }
  function highlight(text, terms) {
    var frag = document.createDocumentFragment();
    text.split(/([A-Za-z0-9]+)/).forEach(function (part) {
      if (/^[A-Za-z0-9]+$/.test(part) && STOP.indexOf(part.toLowerCase()) < 0 && matchTerm(stem(part), terms)) {
        frag.appendChild(el("mark", null, part));
      } else if (part) {
        frag.appendChild(document.createTextNode(part));
      }
    });
    return frag;
  }
  var hits = $("#ask-hits");
  function run(q) {
    hits.textContent = "";
    if (!q.trim()) return;
    var res = search(q);
    if (!res.length) {
      var none = el("li", "no-hit", "Nothing in my resume matches that. Ask me directly in the form below.");
      hits.appendChild(none);
      return;
    }
    res.forEach(function (r) {
      var li = el("li", "hit");
      li.appendChild(el("span", "hit-score", r.score.toFixed(1)));
      var t = el("span", "hit-text");
      t.appendChild(highlight(r.d.text, r.terms));
      li.appendChild(t);
      li.appendChild(el("span", "hit-src", r.d.src));
      hits.appendChild(li);
    });
  }
  var askInput = $("#ask-input");
  $("#ask-form").addEventListener("submit", function (e) { e.preventDefault(); run(askInput.value); });
  ["Have you deployed on AWS?", "Voice agents?", "Vector databases", "Fine-tuning LLaMA", "Computer vision"].forEach(function (q) {
    var c = el("button", "chip", q);
    c.type = "button";
    c.addEventListener("click", function () { askInput.value = q; run(q); });
    $("#ask-chips").appendChild(c);
  });
  run(askInput.value);

  /* Copy email */
  $("#copy-email").addEventListener("click", function () {
    var b = this;
    function done(msg) { b.textContent = msg; setTimeout(function () { b.textContent = "Copy"; }, 1800); }
    function selectIt() {
      var r = document.createRange(); r.selectNodeContents($("#email-link"));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      done("Selected");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(S.email).then(function () { done("Copied"); }, selectIt);
    } else { selectIt(); }
  });

  /* Contact form: sends to Formspree once formEndpoint is set in data.js */
  var form = $("#contact-form"), status = $("#form-status"), submit = $("#f-submit");
  function setStatus(msg, kind) { status.textContent = msg; status.className = "form-status " + (kind || ""); }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    ["#f-name", "#f-email", "#f-what"].forEach(function (id) {
      var f = $(id), good = f.value.trim() && (f.type !== "email" || /.+@.+\..+/.test(f.value));
      f.parentNode.classList.toggle("bad", !good);
      if (!good) ok = false;
    });
    if (!ok) { setStatus("Please fill in your name, a valid email and a few lines about the project.", "err"); return; }
    if (!S.formEndpoint) {
      setStatus("The form is not connected yet, so nothing was sent. Please email " + S.email + " instead.", "err");
      return;
    }
    submit.disabled = true; submit.textContent = "Sending";
    fetch(S.formEndpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (r) {
        if (!r.ok) throw new Error("bad");
        form.reset();
        setStatus("Thanks, your message reached me. I'll reply within a few hours (IST).", "ok");
      })
      .catch(function () {
        setStatus("The message did not send. Please email " + S.email + " instead.", "err");
      })
      .then(function () { submit.disabled = false; submit.textContent = "Send message"; });
  });

  /* Highlight the nav link for the section on screen */
  if ("IntersectionObserver" in window) {
    var links = {};
    document.querySelectorAll(".nav a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.toggle("on", k === en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }
})();
