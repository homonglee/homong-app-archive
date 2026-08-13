import json
import os
import re
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

RECIPIENT = os.environ.get('CONTACT_RECIPIENT', 'tigerlee@hovision.co.kr')
ALLOWED_TYPES = {'강의 문의', 'AI 컨설팅 문의', '앱 제작·기술 문의', '기술자료·협업 문의', '기타 문의'}
EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
MAX_BODY = 24_000


def validate_contact(data):
    cleaned = {key: str(data.get(key, '')).strip() for key in ('name', 'company', 'email', 'phone', 'type', 'message', 'website')}
    if cleaned['website']:
        return None, '요청을 처리할 수 없습니다.'
    if not all(cleaned[key] for key in ('name', 'company', 'email', 'type', 'message')):
        return None, '필수 항목을 모두 입력해주세요.'
    if not EMAIL_RE.match(cleaned['email']):
        return None, '올바른 이메일 주소를 입력해주세요.'
    if cleaned['type'] not in ALLOWED_TYPES:
        return None, '올바른 문의 유형을 선택해주세요.'
    if any(len(cleaned[key]) > limit for key, limit in {'name': 80, 'company': 120, 'email': 200, 'phone': 40, 'message': 5000}.items()):
        return None, '입력 내용이 너무 깁니다.'
    return cleaned, None


def formsubmit_payload(data):
    return {
        '_subject': f"[Homong 문의] {data['type']} - {data['name']}",
        '_template': 'table',
        '_captcha': 'false',
        '이름': data['name'],
        '소속 또는 회사명': data['company'],
        '회신 이메일': data['email'],
        '연락처': data['phone'] or '미입력',
        '문의 유형': data['type'],
        '문의 내용': data['message'],
    }


class handler(BaseHTTPRequestHandler):
    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length <= 0 or length > MAX_BODY:
                return self.send_json(400, {'ok': False, 'message': '요청 크기가 올바르지 않습니다.'})
            data = json.loads(self.rfile.read(length).decode('utf-8'))
        except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
            return self.send_json(400, {'ok': False, 'message': '요청 형식이 올바르지 않습니다.'})

        cleaned, error = validate_contact(data)
        if error:
            return self.send_json(400, {'ok': False, 'message': error})

        request = urllib.request.Request(
            f'https://formsubmit.co/ajax/{RECIPIENT}',
            data=json.dumps(formsubmit_payload(cleaned), ensure_ascii=False).encode('utf-8'),
            headers={
                'Content-Type': 'application/json', 'Accept': 'application/json',
                'Origin': 'https://homong-app.com', 'Referer': 'https://homong-app.com/',
                'X-Requested-With': 'XMLHttpRequest', 'User-Agent': 'Homong-App-Archive/1.0',
            },
            method='POST',
        )
        try:
            with urllib.request.urlopen(request, timeout=12) as response:
                result = json.loads(response.read().decode('utf-8'))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
            return self.send_json(502, {'ok': False, 'message': '메일 전송 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'})

        if result.get('success') in (True, 'true'):
            return self.send_json(200, {'ok': True, 'message': '문의 메일을 전송했습니다.'})
        message = str(result.get('message') or '메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.')
        if 'Activation' in message or 'Activate Form' in message:
            message = '메일 수신 주소의 최초 활성화가 필요합니다. tigerlee@hovision.co.kr로 발송된 FormSubmit 확인 메일에서 Activate Form을 눌러주세요.'
        return self.send_json(502, {'ok': False, 'message': message})
