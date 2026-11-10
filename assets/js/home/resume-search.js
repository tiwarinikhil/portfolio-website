/*
  "Ask about my experience" on the home page.
  A small BM25 keyword search over every line of the resume in content/data.js, with a few synonyms.
  Runs fully in the browser; nothing is sent anywhere.
*/
(function () {
  "use strict";
  var NK = window.NK, S = NK.site;
  if (!NK.$("#ask-form")) return;
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
  var add = function (list, fn) { (list || []).forEach(fn); };
  add(S.experience, function (j) {
    (j.points || []).forEach(function (pt) { docs.push({ text: pt, src: j.role + ", " + j.company }); });
  });
  add(S.projects, function (p) {
    docs.push({ text: p.summary, src: p.title + " · " + p.where });
    (p.details || []).forEach(function (d) { docs.push({ text: d, src: p.title + " · " + p.where }); });
  });
  add(S.skills, function (g) { docs.push({ text: (g.items || []).join(", "), src: "Skills · " + g.group }); });
  add(S.education, function (e) { docs.push({ text: e.degree + ", " + e.school + ", " + e.dates, src: "Education" }); });
  add(S.achievements, function (a) { docs.push({ text: a, src: "Achievements" }); });

  var N = docs.length, avg = 0, df = {};
  docs.forEach(function (d) {
    d.toks = tokens(d.text);
    avg += d.toks.length;
    d.tf = {};
    d.toks.forEach(function (t) { d.tf[t] = (d.tf[t] || 0) + 1; });
    Object.keys(d.tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
  });
  avg /= Math.max(N, 1);

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
        frag.appendChild(NK.el("mark", null, part));
      } else if (part) {
        frag.appendChild(document.createTextNode(part));
      }
    });
    return frag;
  }
  var hits = NK.$("#ask-hits");
  function run(q) {
    hits.textContent = "";
    if (!q.trim()) return;
    var res = search(q);
    if (!res.length) {
      var none = NK.el("li", "no-hit", "Nothing in my resume matches that. Ask me directly in the form below.");
      hits.appendChild(none);
      return;
    }
    res.forEach(function (r) {
      var li = NK.el("li", "hit");
      li.appendChild(NK.el("span", "hit-score", r.score.toFixed(1)));
      var t = NK.el("span", "hit-text");
      t.appendChild(highlight(r.d.text, r.terms));
      li.appendChild(t);
      li.appendChild(NK.el("span", "hit-src", r.d.src));
      hits.appendChild(li);
    });
  }
  var askInput = NK.$("#ask-input");
  NK.$("#ask-form").addEventListener("submit", function (e) { e.preventDefault(); run(askInput.value); });
  ["Have you deployed on AWS?", "Voice agents?", "Vector databases", "Fine-tuning LLaMA", "Computer vision"].forEach(function (q) {
    var c = NK.el("button", "chip", q);
    c.type = "button";
    c.addEventListener("click", function () { askInput.value = q; run(q); });
    NK.$("#ask-chips").appendChild(c);
  });
  run(askInput.value);
})();
