#!/usr/bin/env python3
"""Homong App Archive local preview server.

Serves Homong's reviewed app archive. Apps are listed only after the user
approves them and an explicit apps_registry.json entry is added.
"""
from __future__ import annotations

import json
import mimetypes
import os
import posixpath
import re
import subprocess
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOME = Path('/Users/homong')
REGISTRY = ROOT / 'apps_registry.json'

EXCLUDE = {
    'Applications','Desktop','Documents','Downloads','Library','Movies','Music','Pictures','Public',
    'node_modules','__pycache__','venv','.venv','homong-app-archive'
}

EMOJI_BY_SLUG = {
    'url-qr-shortener-onepage':'🔗','markdown-lite-editor':'✍️','voice-memo-mindmap':'🎙️',
    'subscription-dashboard':'💳','micro-mood-journal':'🌙','lunch-roulette':'🍜',
    'ocr-translator-app':'📸','mastermind-page':'🧠','namecard-memo-indexer':'🪪',
    'eisenhower-prioritizer':'🧭','hermes-agent-interactive-page':'🤖'
}
CATEGORY_BY_SLUG = {
    'url-qr-shortener-onepage':'마케팅/유틸','markdown-lite-editor':'글쓰기/생산성',
    'voice-memo-mindmap':'음성/아이디어','subscription-dashboard':'재무/대시보드',
    'micro-mood-journal':'저널/감정','lunch-roulette':'팀/결정',
    'ocr-translator-app':'OCR/번역','mastermind-page':'학습/콘텐츠',
    'namecard-memo-indexer':'인맥/CRM','eisenhower-prioritizer':'우선순위/생산성',
    'hermes-agent-interactive-page':'AI/소개'
}
FALLBACK_DESC = {
    'url-qr-shortener-onepage':'긴 URL을 짧은 링크와 다운로드 가능한 QR 코드로 변환하는 원페이지 앱.',
    'markdown-lite-editor':'마크다운을 입력하면 우측에 실시간 웹 미리보기를 보여주고 HTML/PDF로 내보내는 초경량 에디터.',
    'voice-memo-mindmap':'음성 아이디어를 텍스트로 정리하고 핵심어를 마인드맵으로 시각화하는 앱.',
    'subscription-dashboard':'구독 서비스의 결제일, 월 지출, 해지/중지/재구독 상태를 한눈에 관리하는 대시보드.',
    'micro-mood-journal':'하루를 3문장으로 기록하고 감정 점수와 무드 아이콘을 저장하는 미니 저널.',
    'lunch-roulette':'팀원의 선호/제외 메뉴를 반영해 주변 맛집 후보를 룰렛으로 추천하는 점심 결정 앱.',
    'ocr-translator-app':'스크린샷을 업로드해 OCR로 텍스트를 추출하고 원하는 언어로 번역하는 앱.',
    'mastermind-page':'나폴레온 힐의 마스터마인드 원리를 인터랙티브하게 소개하고 그룹을 설계하는 페이지.',
    'namecard-memo-indexer':'명함 촬영, 연락처 추출, 만남 메모 저장/편집/삭제를 지원하는 인맥 관리 앱.',
    'eisenhower-prioritizer':'할 일을 긴급도와 중요도 기준으로 분류해 우선순위를 정리하는 매트릭스 앱.',
    'hermes-agent-interactive-page':'Hermes Agent를 인터랙티브하게 소개하는 원페이지 웹페이지.'
}


def load_registry() -> dict:
    if REGISTRY.exists():
        try:
            return json.loads(REGISTRY.read_text(encoding='utf-8'))
        except Exception:
            return {}
    return {}


def clean_text(value: str) -> str:
    return re.sub(r'\s+', ' ', value or '').strip()


def read_title_and_desc(app_dir: Path) -> tuple[str, str]:
    for idx in [app_dir / 'index.html', app_dir / 'public' / 'index.html']:
        if idx.exists():
            data = idx.read_text(encoding='utf-8', errors='ignore')[:220000]
            title = ''
            desc = ''
            m = re.search(r'<title[^>]*>(.*?)</title>', data, re.I | re.S)
            if m:
                title = clean_text(re.sub(r'<[^>]+>', '', m.group(1)))
            md = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']+)', data, re.I)
            if md:
                desc = clean_text(md.group(1))
            return title, desc
    pkg = app_dir / 'package.json'
    if pkg.exists():
        try:
            j = json.loads(pkg.read_text(encoding='utf-8'))
            return clean_text(j.get('name','')), clean_text(j.get('description',''))
        except Exception:
            pass
    return '', ''


def git_remote(app_dir: Path) -> str:
    if not (app_dir / '.git').exists():
        return ''
    try:
        out = subprocess.run(['git','config','--get','remote.origin.url'], cwd=app_dir, text=True, capture_output=True, timeout=2).stdout.strip()
        if out.startswith('git@github.com:'):
            out = 'https://github.com/' + out.split(':',1)[1]
        if out.endswith('.git'):
            out = out[:-4]
        return out
    except Exception:
        return ''


def vercel_project(app_dir: Path) -> str:
    p = app_dir / '.vercel' / 'project.json'
    if p.exists():
        try:
            return json.loads(p.read_text(encoding='utf-8')).get('projectName','')
        except Exception:
            return ''
    return ''


def app_entry(app_dir: Path, registry: dict) -> dict | None:
    slug = app_dir.name
    if slug in EXCLUDE or slug.startswith('.'):
        return None
    has_app = any((app_dir / marker).exists() for marker in ['index.html','public/index.html','package.json','vercel.json']) or (app_dir/'.vercel'/'project.json').exists()
    if not has_app:
        return None
    title, desc = read_title_and_desc(app_dir)
    overrides = registry.get(slug, {})
    project = vercel_project(app_dir)
    deployed = overrides.get('url') or (f'https://{project}.vercel.app' if project else '')
    launch = deployed or f'/apps/{urllib.parse.quote(slug)}/'
    st = app_dir.stat()
    return {
        'slug': slug,
        'name': overrides.get('name') or title or slug.replace('-', ' ').title(),
        'description': overrides.get('description') or desc or FALLBACK_DESC.get(slug, '로컬 프로젝트에서 자동 발견된 앱입니다.'),
        'category': overrides.get('category') or CATEGORY_BY_SLUG.get(slug, '자동 발견'),
        'icon': overrides.get('icon') or EMOJI_BY_SLUG.get(slug, '✨'),
        'url': launch,
        'deploymentUrl': deployed,
        'localUrl': f'/apps/{urllib.parse.quote(slug)}/',
        'github': overrides.get('github') or git_remote(app_dir),
        'path': slug,
        'mtime': st.st_mtime,
        'hasLocalIndex': (app_dir/'index.html').exists() or (app_dir/'public'/'index.html').exists(),
        'source': 'registry+scan' if overrides else 'auto-scan'
    }


def manual_registry_entry(slug: str, overrides: dict) -> dict:
    """Build one archive card from apps_registry.json only.

    New app folders under /Users/homong are intentionally NOT auto-added.
    The user reviews each app first, then we add an explicit registry entry.
    """
    app_dir = HOME / slug
    title = desc = ''
    mtime = 0
    has_local = False
    github = overrides.get('github', '')
    if app_dir.is_dir():
        title, desc = read_title_and_desc(app_dir)
        try:
            mtime = app_dir.stat().st_mtime
        except OSError:
            mtime = 0
        has_local = (app_dir / 'index.html').exists() or (app_dir / 'public' / 'index.html').exists()
        if not github:
            github = git_remote(app_dir)
    url = overrides.get('url') or (f'/apps/{urllib.parse.quote(slug)}/' if has_local else '#')
    deployment = url if url.startswith('http://') or url.startswith('https://') else ''
    return {
        'slug': slug,
        'name': overrides.get('name') or title or slug.replace('-', ' ').title(),
        'description': overrides.get('description') or desc or FALLBACK_DESC.get(slug, '검수 후 수동 등록된 앱입니다.'),
        'category': overrides.get('category') or CATEGORY_BY_SLUG.get(slug, '수동 등록'),
        'icon': overrides.get('icon') or EMOJI_BY_SLUG.get(slug, '✨'),
        'url': url,
        'deploymentUrl': deployment,
        'localUrl': f'/apps/{urllib.parse.quote(slug)}/' if has_local else '',
        'github': github,
        'path': slug if app_dir.is_dir() else '',
        'mtime': mtime,
        'hasLocalIndex': has_local,
        'source': 'manual-registry'
    }


def scan_apps() -> list[dict]:
    registry = load_registry()
    apps = [manual_registry_entry(slug, overrides) for slug, overrides in registry.items()]
    apps.sort(key=lambda x: x.get('mtime', 0), reverse=True)
    return apps


def safe_app_path(slug: str) -> Path | None:
    if '/' in slug or '\\' in slug or slug.startswith('.'):
        return None
    p = (HOME / slug).resolve()
    try:
        p.relative_to(HOME)
    except ValueError:
        return None
    if not p.is_dir():
        return None
    if (p/'index.html').exists():
        return p
    if (p/'public'/'index.html').exists():
        return p/'public'
    return p


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = urllib.parse.unquote(parsed.path)
        if path == '/api/apps':
            body = json.dumps({'apps': scan_apps()}, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type','application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path.startswith('/apps/'):
            parts = path.split('/')
            slug = parts[2] if len(parts) > 2 else ''
            base = safe_app_path(slug)
            if not base:
                self.send_error(404, 'App not found')
                return
            rel = '/'.join(parts[3:]) or 'index.html'
            if rel.endswith('/'):
                rel += 'index.html'
            target = (base / posixpath.normpath(rel).lstrip('/')).resolve()
            try:
                target.relative_to(base)
            except ValueError:
                self.send_error(403)
                return
            if target.is_dir():
                target = target / 'index.html'
            if not target.exists():
                self.send_error(404)
                return
            data = target.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', mimetypes.guess_type(str(target))[0] or 'application/octet-stream')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        # Serve archive static files from ROOT
        self.directory = str(ROOT)
        return super().do_GET()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '61337'))
    server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
    print(f'APP_ARCHIVE_SERVING http://127.0.0.1:{port}', flush=True)
    server.serve_forever()
