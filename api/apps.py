import json
from http.server import BaseHTTPRequestHandler
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / 'apps_static.json'
PUBLIC_FIELDS = {
    'slug', 'name', 'description', 'category', 'icon', 'url', 'github',
    'mtime', 'hasLocalIndex', 'source', 'downloadUrl',
}


def public_payload(data):
    return {
        'apps': [
            {key: value for key, value in app.items() if key in PUBLIC_FIELDS}
            for app in data.get('apps', [])
        ]
    }


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        data = json.loads(STATIC.read_text(encoding='utf-8'))
        body = json.dumps(public_payload(data), ensure_ascii=False).encode('utf-8')
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "s-maxage=60, stale-while-revalidate=300")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
