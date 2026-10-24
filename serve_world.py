"""Serve SP Creek (the world/ folder) with caching off, so code updates show up on reload.

POST /save?path=assets/<file> writes the request body to world/assets/<file> (and only there),
so in-browser tools such as the backdrop stitcher can store their results in the project.
POST /save?path=renders/<file>.mp4 stores a rendered video in world/renders; with &offset=N the
body is written at byte N instead (long renders stream to disk in pieces).
"""
import functools
import http.server
import sys
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent / "world"
ASSETS = (ROOT / "assets").resolve()
RENDERS = (ROOT / "renders").resolve()
MAX_BYTES = 64 * 1024 * 1024
MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        url = urlparse(self.path)
        if url.path != "/save":
            return self.send_error(404)
        rel = parse_qs(url.query).get("path", [""])[0]
        target = (ROOT / rel).resolve()
        video = RENDERS in target.parents and target.suffix.lower() == ".mp4"
        if not video and (ASSETS not in target.parents or target.suffix.lower() not in (".png", ".jpg", ".webp", ".json")):
            return self.send_error(403, "Only images/json under world/assets or .mp4 under world/renders can be saved")
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0 or length > (MAX_VIDEO_BYTES if video else MAX_BYTES):
            return self.send_error(400, "Empty or too large")
        target.parent.mkdir(parents=True, exist_ok=True)
        offset = parse_qs(url.query).get("offset", [None])[0]
        if video and offset is not None:
            with open(target, "r+b" if target.exists() else "w+b") as f:
                f.seek(int(offset))
                f.write(self.rfile.read(length))
        else:
            target.write_bytes(self.rfile.read(length))
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(f"saved {target.relative_to(ROOT)}".encode())


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8810
    handler = functools.partial(NoCacheHandler, directory=str(ROOT))
    with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"SP Creek: http://localhost:{port}")
        if "--open" in sys.argv[2:]:
            import threading
            import webbrowser
            # Open only after the port is bound, so the first visit can connect.
            opener = threading.Timer(0.2, webbrowser.open, args=(f"http://localhost:{port}",))
            opener.daemon = True
            opener.start()
        httpd.serve_forever()


if __name__ == "__main__":
    main()
