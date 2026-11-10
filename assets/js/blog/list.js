/*
  Blog list (blogs.html). Finds every PDF in the "Blogs" folder and shows it as a card,
  with a search box and topic buttons. Titles, summaries, tags and article pages come from content/data.js ("blogs").
  On localhost it reads the folder listing; on the live site it asks the GitHub API (cached 10 minutes).
*/
(function () {
  "use strict";
  var S = window.SITE || {};
  var REPO = "tiwarinikhil/portfolio-website";
  var FOLDER = "Blogs";
  var PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function isPdf(name) { return /\.pdf$/i.test(name); }
  function orderOf(name) { var m = name.match(/^(\d+)/); return m ? parseInt(m[1], 10) : -1; }
  function titleFrom(name) {
    return name
      .replace(/\.pdf$/i, "")
      .replace(/^\d+\s*[.)_\-]*\s*/, "")
      .replace(/[_]+/g, " ")
      .replace(/\bnikhil\s+(kumar\s+)?tiwar[iy]\b/ig, "")
      .replace(/\s{2,}/g, " ")
      .trim() || name;
  }

  /* 1. On localhost: read the folder listing the local server gives us. */
  function fromLocalFolder() {
    return fetch(FOLDER + "/", { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("no listing");
      return r.text();
    }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var names = [];
      doc.querySelectorAll("a[href]").forEach(function (a) {
        var name = decodeURIComponent(a.getAttribute("href").split("?")[0].split("/").pop());
        if (isPdf(name) && names.indexOf(name) < 0) names.push(name);
      });
      if (!names.length) throw new Error("empty listing");
      return names;
    });
  }

  /* 2. On the live site: ask GitHub which PDFs are in the folder (cached for 10 minutes). */
  function fromGitHub() {
    var key = "blogs-list-v1";
    try {
      var c = JSON.parse(sessionStorage.getItem(key) || "null");
      if (c && Date.now() - c.t < 600000) return Promise.resolve(c.names);
    } catch (e) { /* storage blocked */ }
    return fetch("https://api.github.com/repos/" + REPO + "/contents/" + FOLDER, {
      headers: { Accept: "application/vnd.github+json" }
    }).then(function (r) {
      if (!r.ok) throw new Error("github " + r.status);
      return r.json();
    }).then(function (items) {
      var names = items.filter(function (it) { return it.type === "file" && isPdf(it.name); })
        .map(function (it) { return it.name; });
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), names: names })); } catch (e) { /* ignore */ }
      return names;
    });
  }

  function discover() {
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (location.protocol === "file:") return Promise.reject(new Error("file"));
    return local ? fromLocalFolder().catch(fromGitHub) : fromGitHub();
  }

  /* Merge what we found with the optional titles/summaries in data.js. */
  function build(found) {
    var meta = {};
    (S.blogs || []).forEach(function (b) { if (b && b.file) meta[b.file] = b; });
    var names = found && found.length ? found : Object.keys(meta);
    return names.map(function (name) {
      var m = meta[name] || {};
      return {
        file: name,
        url: FOLDER + "/" + encodeURIComponent(name),
        page: m.page ? "blog/" + m.page : "",
        title: m.title || titleFrom(name),
        summary: m.summary || "",
        tags: m.tags || [],
        hidden: !!m.hidden,
        order: orderOf(name)
      };
    }).filter(function (p) { return !p.hidden; })
      .sort(function (a, b) { return (b.order - a.order) || a.title.localeCompare(b.title); });
  }

  /* PDF.js draws page 1 of each PDF as the card picture. */
  var pdfjsReady = null;
  function loadPdfJs() {
    if (!pdfjsReady) {
      pdfjsReady = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = PDFJS + "pdf.min.js";
        s.onload = function () {
          var lib = window.pdfjsLib;
          if (!lib) { reject(new Error("pdfjs")); return; }
          lib.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
          resolve(lib);
        };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return pdfjsReady;
  }
  function drawThumb(post, box, pagesEl) {
    if (location.protocol === "file:") return;
    loadPdfJs().then(function (lib) {
      return lib.getDocument({ url: post.url, disableAutoFetch: true, disableStream: true }).promise;
    }).then(function (doc) {
      if (!post.page) pagesEl.textContent = doc.numPages + (doc.numPages === 1 ? " page" : " pages");
      return doc.getPage(1);
    }).then(function (page) {
      var width = box.clientWidth || 360;
      var base = page.getViewport({ scale: 1 });
      var scale = (width * Math.min(window.devicePixelRatio || 1, 2)) / base.width;
      var vp = page.getViewport({ scale: scale });
      var canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.setAttribute("aria-hidden", "true");
      return page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise.then(function () {
        box.appendChild(canvas);
        box.classList.add("has-thumb");
      });
    }).catch(function () { /* keep the plain cover */ });
  }

  function card(post) {
    var li = el("li", "blog-card");
    li.setAttribute("data-tags", post.tags.join("|"));
    li.setAttribute("data-text", (post.title + " " + post.summary + " " + post.tags.join(" ")).toLowerCase());
    var a = el("a", "blog-link");
    /* A post with its own web page opens it; otherwise the card opens the PDF in a new tab. */
    if (post.page) {
      a.href = post.page;
    } else {
      a.href = post.url;
      a.target = "_blank";
      a.rel = "noopener";
    }

    var thumb = el("div", "blog-thumb");
    var cover = el("div", "blog-cover");
    cover.appendChild(el("span", "blog-cover-kind", "PDF"));
    cover.appendChild(el("span", "blog-cover-title", post.title));
    thumb.appendChild(cover);

    var body = el("div", "blog-body");
    if (post.tags.length) {
      var tags = el("div", "blog-tags");
      post.tags.forEach(function (t) { tags.appendChild(el("span", null, t)); });
      body.appendChild(tags);
    }
    body.appendChild(el("h3", null, post.title));
    if (post.summary) body.appendChild(el("p", "blog-sum", post.summary));
    var meta = el("div", "blog-meta");
    var pages = el("span", null, post.page ? "Article + PDF" : "PDF");
    meta.appendChild(pages);
    meta.appendChild(el("span", "blog-read", post.page ? "Read →" : "Read ↗"));
    body.appendChild(meta);

    a.appendChild(thumb);
    a.appendChild(body);
    li.appendChild(a);

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); drawThumb(post, thumb, pages); }
      }, { rootMargin: "200px" });
      io.observe(thumb);
    } else {
      drawThumb(post, thumb, pages);
    }
    return li;
  }

  function render(list, posts) {
    var limit = parseInt(list.getAttribute("data-limit") || "0", 10);
    var shown = limit ? posts.slice(0, limit) : posts;
    list.textContent = "";
    if (!shown.length) {
      list.appendChild(el("li", "blog-empty", "No posts yet."));
      return;
    }
    shown.forEach(function (p) { list.appendChild(card(p)); });
    document.querySelectorAll("[data-blog-count]").forEach(function (n) {
      n.textContent = posts.length + (posts.length === 1 ? " post" : " posts");
    });
  }

  /* Search box and topic buttons on blogs.html */
  function tools(list, posts) {
    var box = document.querySelector("[data-blog-tools]");
    if (!box || posts.length < 2) return;
    var q = document.getElementById("blog-q"), tagBox = document.getElementById("blog-tags"), shown = document.getElementById("blog-shown");
    var tags = [];
    posts.forEach(function (p) { p.tags.forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });
    var active = "All";
    ["All"].concat(tags).forEach(function (t) {
      var b = el("button", "filter", t);
      b.type = "button";
      b.setAttribute("aria-pressed", String(t === active));
      b.addEventListener("click", function () { active = t; apply(); });
      tagBox.appendChild(b);
    });
    var empty = el("li", "blog-empty", "No guides match. Try another word or topic.");
    function apply() {
      var words = q.value.toLowerCase().split(/\s+/).filter(Boolean), n = 0;
      tagBox.querySelectorAll(".filter").forEach(function (b) { b.setAttribute("aria-pressed", String(b.textContent === active)); });
      list.querySelectorAll(".blog-card").forEach(function (li) {
        var text = li.getAttribute("data-text") || "";
        var ok = (active === "All" || (li.getAttribute("data-tags") || "").split("|").indexOf(active) >= 0) &&
          words.every(function (w) { return text.indexOf(w) >= 0; });
        li.hidden = !ok; if (ok) n++;
      });
      if (!n) list.appendChild(empty); else if (empty.parentNode) empty.parentNode.removeChild(empty);
      shown.textContent = n === posts.length ? posts.length + " guides" : n + " of " + posts.length + " guides";
    }
    q.addEventListener("input", apply);
    box.hidden = false;
    apply();
  }

  var lists = document.querySelectorAll("[data-blogs]");
  if (!lists.length) return;
  discover().then(build, function () { return build(null); }).then(function (posts) {
    lists.forEach(function (list) { render(list, posts); if (!list.getAttribute("data-limit")) tools(list, posts); });
  });
})();
