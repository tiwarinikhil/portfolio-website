"""
Copy the home page content from content/data.js into index.html as plain HTML.

Why: search engines read the HTML first. Without this, projects, experience, education, skills and
services only exist after JavaScript runs, and Google may index the page without them.
The page still builds itself from data.js in the browser (render.js replaces these blocks),
so this only changes what search engines and no-JavaScript visitors see.

Run after editing content/data.js (needs Microsoft Edge or Google Chrome installed):
    python tools/prerender.py
Then run tools/bump-version.py and upload index.html.
"""
import html, os, re, shutil, subprocess, sys, tempfile
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
BLOCKS = ["stats", "filters", "projects", "timeline", "skill-groups", "education", "achievements", "service-list"]

BROWSERS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    shutil.which("google-chrome") or "", shutil.which("chromium") or "", shutil.which("msedge") or "",
]


class Inner(HTMLParser):
    """Collects the inner HTML of elements with the given ids from a full page."""
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

    def __init__(self, ids):
        super().__init__(convert_charrefs=False)
        self.ids, self.out, self.stack = set(ids), {}, []  # stack of [id, depth, parts]

    def _emit(self, text):
        for s in self.stack:
            s[2].append(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        raw = self.get_starttag_text()
        self._emit(raw)
        if tag in self.VOID:
            return
        for s in self.stack:
            s[1] += 1
        if a.get("id") in self.ids:
            self.stack.append([a["id"], 0, []])

    def handle_endtag(self, tag):
        if tag in self.VOID:
            return
        done = None
        for s in self.stack:
            s[1] -= 1
        if self.stack and self.stack[-1][1] < 0:
            done = self.stack.pop()
            self.out[done[0]] = "".join(done[2])
        self._emit("</%s>" % tag)

    def handle_data(self, d): self._emit(d)
    def handle_entityref(self, n): self._emit("&%s;" % n)
    def handle_charref(self, n): self._emit("&#%s;" % n)


def render():
    exe = next((b for b in BROWSERS if b and os.path.exists(b)), None)
    if not exe:
        sys.exit("Edge or Chrome not found.")
    profile = tempfile.mkdtemp(prefix="prerender-")
    url = INDEX.as_uri() + "?prerender"
    try:
        out = subprocess.run([exe, "--headless=new", "--disable-gpu", "--no-first-run", "--user-data-dir=" + profile,
                              "--virtual-time-budget=4000", "--dump-dom", url],
                             capture_output=True, timeout=90)
    finally:
        shutil.rmtree(profile, ignore_errors=True)
    return out.stdout.decode("utf-8", "replace")


def main():
    dom = render()
    p = Inner(BLOCKS)
    p.feed(dom)
    missing = [b for b in BLOCKS if not p.out.get(b, "").strip()]
    if missing:
        sys.exit("Rendering failed, nothing changed. Empty: " + ", ".join(missing))

    src = INDEX.read_text(encoding="utf-8")
    for bid in BLOCKS:
        inner = p.out[bid].strip()
        pat = re.compile(r'(<(\w+)[^>]*\bid="%s"[^>]*>)(?:<!--pre-->.*?<!--/pre-->)?' % re.escape(bid), re.S)
        if not pat.search(src):
            sys.exit("Could not find #%s in index.html" % bid)
        src = pat.sub(lambda m: m.group(1) + "<!--pre-->" + inner + "<!--/pre-->", src, count=1)

    # Plain text fields (headline, intro, availability...) also come from data.js.
    for key, text in re.findall(r'data-bind="(\w+)"[^>]*>([^<]*)<', dom):
        safe = html.escape(html.unescape(text), quote=False)
        src = re.sub(r'(data-bind="%s"[^>]*>)[^<]*(<)' % key, lambda m: m.group(1) + safe + m.group(2), src)

    INDEX.write_text(src, encoding="utf-8", newline="\n")
    print("index.html updated:", ", ".join("%s (%d chars)" % (b, len(p.out[b])) for b in BLOCKS))


if __name__ == "__main__":
    main()
