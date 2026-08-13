import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location('contact_api', Path(__file__).parents[1] / 'api' / 'contact.py')
contact = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(contact)

VALID = {
    'name': '김도연', 'company': '호비전', 'email': 'tester@example.com',
    'phone': '010-1234-5678', 'type': '강의 문의', 'message': '강의를 부탁합니다.', 'website': ''
}

class Response:
    def __init__(self, payload): self.payload = payload
    def __enter__(self): return self
    def __exit__(self, *args): return False
    def read(self): return json.dumps(self.payload).encode()

class ContactApiTests(unittest.TestCase):
    def test_validate_contact_accepts_required_fields(self):
        cleaned, error = contact.validate_contact(VALID)
        self.assertIsNone(error)
        self.assertEqual(cleaned['email'], 'tester@example.com')

    def test_validate_contact_rejects_invalid_email(self):
        cleaned, error = contact.validate_contact({**VALID, 'email': 'invalid'})
        self.assertIsNone(cleaned)
        self.assertIn('이메일', error)

    def test_honeypot_is_rejected(self):
        cleaned, error = contact.validate_contact({**VALID, 'website': 'spam.example'})
        self.assertIsNone(cleaned)
        self.assertTrue(error)

    @patch('urllib.request.urlopen', return_value=Response({'success': 'true'}))
    def test_provider_success_payload(self, mocked):
        request = contact.urllib.request.Request(
            'https://formsubmit.co/ajax/test@example.com',
            data=json.dumps(contact.formsubmit_payload(VALID)).encode(),
            headers={'Content-Type':'application/json'}, method='POST')
        with contact.urllib.request.urlopen(request) as response:
            result = json.loads(response.read())
        self.assertEqual(result['success'], 'true')
        sent = json.loads(mocked.call_args.args[0].data.decode())
        self.assertEqual(sent['회신 이메일'], VALID['email'])
        self.assertEqual(sent['문의 내용'], VALID['message'])

if __name__ == '__main__': unittest.main()
