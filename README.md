# Portfolio website (Nikhil Kumar Tiwary)

This folder is your whole website. There is nothing to install and nothing to build.

## How the folder is organised

```
index.html            Home page (skeleton; the words come from content/data.js)
blogs.html            Blog page: every guide as a card
blog/                 One page per guide, plus blog/img for pictures inside articles
Blogs/                The guide PDFs
content/data.js       ALL THE WORDS: name, intro, projects, jobs, skills, links, blog titles   <- you edit this
assets/
  css/                tokens.css (colours, fonts) · base.css · layout.css (header, footer, buttons)
                      home.css · blog.css · article.css · effects.css (motion, search palette)
  js/core/            util.js (shared helpers) · theme.js · header.js · palette.js (Ctrl+K) · motion.js
  js/home/            render.js (builds the home page) · resume-search.js · contact.js
  js/blog/            list.js (blog page) · article.js (copy buttons, DSA tracker)
  fonts/              Inter and IBM Plex Mono, served from this site
  img/                Your photo as the logo and browser icon (profile-source.jpg is the original)
tools/                serve.py (preview) · bump-version.py (run after editing assets/ or content/)
```

To change colours, edit the top of `assets/css/tokens.css` (`--accent` is the main blue).

**After editing anything in `assets/` or `content/`, run `python tools/bump-version.py`.** It changes the `?v=` number on every CSS/JS link, so visitors' browsers fetch the new files instead of mixing old and new ones (that mix is what breaks a page).

## About the resume button

Your resume PDF is kept out of the GitHub repo on purpose. The "Resume (PDF)" button stays hidden while `resumeFile` in `content/data.js` is empty. To show it, put the PDF next to `index.html` and write its file name in `resumeFile`. Then remove `*.pdf` from `.gitignore` if you want it online.

## How to open it on your laptop

1. In this folder run `python tools/serve.py`.
2. Open http://localhost:8000.

It tells the browser not to cache, so a normal refresh always shows your latest edits. Everything works offline except the contact form (it needs to be online, see below).

## How to change the text

1. Open `content/data.js` in any text editor. VS Code is best (free), Notepad or TextEdit also work.
2. Change the words between the quotes `"like this"`. Keep the quotes and the commas at the end of lines.
3. Save, then refresh the browser.

Common changes:

- **Add a project:** inside `projects: [ ... ]`, copy one whole `{ ... },` block, paste it right below, and change its text. `tags` must use names from the `tags` list near the top (RAG, Agents, Voice, Vision, LLM fine-tuning, Research).
- **Add a GitHub link to a project:** add a line `link: "https://github.com/..."` inside that project's block.
- **Show your phone number:** change `showPhone: false` to `showPhone: true`.
- **Change your email:** edit the `email:` line.
- **Social icons:** the LinkedIn, Instagram and GitHub icons use the `linkedin`, `instagram` and `github` lines. Leave one empty to hide its icon on the home page.

If the page goes blank after an edit, a quote `"` or comma `,` is missing in `content/data.js`. Undo your last change (Ctrl+Z / Cmd+Z), save, and try again.

## How the contact form works

A website made of plain files can't send email by itself. The form sends messages to **Formspree** (free), which emails them to you.

1. Sign up at formspree.io with your Gmail.
2. Create a new form and copy its address, which looks like `https://formspree.io/f/abcdwxyz`.
3. In `content/data.js`, paste it into the `formEndpoint: ""` line, between the quotes.

Until you do this, the form tells visitors to email you directly, so no message is lost.

## How to put it on the internet

The full step-by-step guide is in the "Launch nikhiltiwari.in" doc (link in the project thread). Short version:

1. **Hosting (free):** the code is in github.com/tiwarinikhil/portfolio-website. Upload any new files there to a public GitHub repository, then in the repo go to Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save. You get the link `https://tiwarinikhil.github.io/portfolio-website/`.
2. **Domain:** after buying it, add these DNS records at your registrar (GoDaddy, Hostinger etc.):

   | Type | Name | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | tiwarinikhil.github.io |

   Then in GitHub Settings → Pages, type your domain under Custom domain, Save, and tick Enforce HTTPS once it's allowed.

3. **Updating later:** edit `content/data.js` on GitHub (open file → pencil icon → Commit changes). The live site updates in about a minute. Also copy the change into this folder so your laptop copy stays the same.

## Blog

The blog lives on its own page, `blogs.html`, which shows every PDF inside the `Blogs` folder as a card. The home page links to it from the menu. The first page of each PDF becomes its picture.

**To add a post:** put the PDF in `Blogs` and upload it to the `Blogs` folder on GitHub. That's it. It shows up on the live site within about 10 minutes.

- Start the file name with the next number, e.g. `4. My_New_Guide.pdf`. Higher numbers show first.
- The title comes from the file name (underscores become spaces). For a nicer title, a summary and tags, add a block to `blogs` at the bottom of `content/data.js`.
- To hide a post without deleting the PDF, add `hidden: true` to its block in `content/data.js`.
- Optional, for Google: add the PDF's address to `sitemap.xml` (spaces become `%20`).

**Posts with their own web page.** Each current post also has a full article page in the `blog` folder, and its card opens that page instead of the PDF. The page has a "Download PDF" button.

| File | What it is |
|---|---|
| `blog/ai-engineer-roadmap.html` | The AI Engineer roadmap: 7 phases with free resources and a project per phase |
| `blog/dsa-sheet-neetcode-150-striver.html` | The DSA sheet, with search, filters and tick boxes (ticks are saved in the reader's browser) |
| `blog/career-roadmap-framework.html` | The career roadmap guide, with copy buttons on the prompts |
| `blog/cold-dm-email-templates.html` | The cold DM templates, with copy buttons and the reply screenshots |
| `blog/img/` | Pictures used inside the articles |

To give a new PDF post its own page: copy one of these pages, rename it, change the text, then add `page: "your-file.html"` to that post's block in `content/data.js` and add the page's address to `sitemap.xml`. Upload the whole `blog` folder to GitHub along with the changed files.

**To preview on your laptop:** run `python tools/serve.py`, then open http://localhost:8000.

## SEO (getting found on Google)

What is already set up:

- **Name everywhere Google looks:** page title, main heading (H1), description, and structured data (`WebSite`, `ProfilePage`, `Person` with your photo, name spellings and LinkedIn/GitHub/Instagram links) in `index.html`.
- **Content in the HTML itself:** projects, experience, education, skills and services are written into `index.html` by `tools/prerender.py`, so Google sees them without running JavaScript.
- **Blog:** each post has `BlogPosting` and breadcrumb data; `blogs.html` lists every guide.
- `sitemap.xml`, `robots.txt`, `favicon.ico`, `404.html`, `CNAME` (the custom domain).

**After editing `content/data.js`:**

1. `python tools/prerender.py` (copies the new content into `index.html`)
2. `python tools/bump-version.py` (makes browsers fetch the new files)
3. In `index.html`, set `dateModified` to the current date and time, e.g. `2026-12-01T10:00:00+05:30`.
4. Upload the changed files.

The site address `https://nikhiltiwary.in/` is written in `index.html`, `sitemap.xml`, `robots.txt` and `CNAME`. If the domain ever changes, update all four.

## Note on the domain name

Your resume and LinkedIn say **Tiwary**. If you buy `nikhiltiwari.in` (with an i), people who type your name as written will miss it. Consider `nikhiltiwary.in`, or buy both.
