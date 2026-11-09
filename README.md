# Portfolio website (Nikhil Kumar Tiwary)

This folder is your whole website. There is nothing to install and nothing to build.

## What each file does

| File | What it is | Do you edit it? |
|---|---|---|
| `index.html` | The page itself (the skeleton) | Rarely |
| `data.js` | **All the words on the site**: name, intro, projects, jobs, skills, email, form address | **Yes, this is the one you edit** |
| `style.css` | Colours, fonts, spacing, phone layout | Only to change the look |
| `app.js` | Makes it interactive: resume search, project filters, theme switch, contact form | No |
| `README.md` | This file | No |

## About the resume button

Your resume PDF is kept out of the GitHub repo on purpose. The "Resume (PDF)" button stays hidden while `resumeFile` in `data.js` is empty. To show it, put the PDF next to `index.html` and write its file name in `resumeFile`. Then remove `*.pdf` from `.gitignore` if you want it online.

## How to open it on your laptop

1. Open this folder.
2. Double-click `index.html`. It opens in your browser (Chrome, Edge, Safari).

That's it. Everything works offline except the fonts (they need internet) and the contact form (it needs to be online and connected, see below).

If you change a file, save it and press refresh in the browser to see the change.

## How to change the text

1. Open `data.js` in any text editor. VS Code is best (free), Notepad or TextEdit also work.
2. Change the words between the quotes `"like this"`. Keep the quotes and the commas at the end of lines.
3. Save, then refresh the browser.

Common changes:

- **Add a project:** inside `projects: [ ... ]`, copy one whole `{ ... },` block, paste it right below, and change its text. `tags` must use names from the `tags` list near the top (RAG, Agents, Voice, Vision, LLM fine-tuning, Research).
- **Add a GitHub link to a project:** add a line `link: "https://github.com/..."` inside that project's block.
- **Show your phone number:** change `showPhone: false` to `showPhone: true`.
- **Change your email:** edit the `email:` line.

If the page goes blank after an edit, a quote `"` or comma `,` is missing in `data.js`. Undo your last change (Ctrl+Z / Cmd+Z), save, and try again.

## How the contact form works

A website made of plain files can't send email by itself. The form sends messages to **Formspree** (free), which emails them to you.

1. Sign up at formspree.io with your Gmail.
2. Create a new form and copy its address, which looks like `https://formspree.io/f/abcdwxyz`.
3. In `data.js`, paste it into the `formEndpoint: ""` line, between the quotes.

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

3. **Updating later:** edit `data.js` on GitHub (open file → pencil icon → Commit changes). The live site updates in about a minute. Also copy the change into this folder so your laptop copy stays the same.

## Note on the domain name

Your resume and LinkedIn say **Tiwary**. If you buy `nikhiltiwari.in` (with an i), people who type your name as written will miss it. Consider `nikhiltiwary.in`, or buy both.
