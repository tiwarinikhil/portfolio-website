"""
Preview the site on your laptop: python tools/serve.py   then open http://localhost:8000

Same as "python -m http.server", but tells the browser never to cache, so you always see your latest edits.
"""
import http.server, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8000


class NoCache(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


# Threaded, so the browser can load many files at once without refused connections.
with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), NoCache) as httpd:
    print("Serving %s at http://localhost:%d (Ctrl+C to stop)" % (ROOT, PORT))
    httpd.serve_forever()
