from http.server import BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGETS = ROOT / 'app_targets.json'


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = TARGETS.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
