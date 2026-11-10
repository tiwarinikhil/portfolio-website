"""
Bump the ?v=... number on every CSS/JS link in the HTML pages.

Why: browsers keep old copies of CSS/JS files. If a visitor gets a new page with an old script,
parts of the site break. A new version number makes every browser download the fresh files.

Run after changing any file in assets/ or content/:
    python tools/bump-version.py
"""
import glob, os, re, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
version = time.strftime("%Y%m%d%H%M")
pages = [os.path.join(ROOT, "index.html"), os.path.join(ROOT, "blogs.html"), os.path.join(ROOT, "404.html")] + glob.glob(os.path.join(ROOT, "blog", "*.html"))
for p in pages:
    s = open(p, encoding="utf-8").read()
    s2 = re.sub(r'((?:assets|content)/[^"?]+\.(?:css|js))\?v=[\w.-]+', r"\1?v=" + version, s)
    if s2 != s:
        open(p, "w", encoding="utf-8", newline="\n").write(s2)
        print("updated", os.path.relpath(p, ROOT))
print("version", version)
