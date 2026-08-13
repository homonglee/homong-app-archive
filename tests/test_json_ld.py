import json
import re
import unittest
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
MATCH = re.search(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', HTML, re.S)
SCHEMA = json.loads(MATCH.group(1)) if MATCH else None

class JsonLdTests(unittest.TestCase):
    def test_json_ld_exists_and_is_valid_json(self):
        self.assertIsNotNone(SCHEMA)
        self.assertEqual(SCHEMA['@context'], 'https://schema.org')

    def test_person_identity_and_public_profile(self):
        person = next(item for item in SCHEMA['@graph'] if item['@type'] == 'Person')
        self.assertEqual(person['@id'], 'https://homong-app.com/#lee-yongho')
        self.assertEqual(person['name'], '이용호')
        self.assertIn('호몽', person['alternateName'])
        self.assertEqual(person['url'], 'https://homong-app.com/#profile')
        self.assertEqual(person['email'], 'mailto:tigerlee@hovision.co.kr')

    def test_books_reference_person_and_visible_assets(self):
        books = [item for item in SCHEMA['@graph'] if item['@type'] == 'Book']
        self.assertEqual(len(books), 3)
        for book in books:
            self.assertEqual(book['author']['@id'], 'https://homong-app.com/#lee-yongho')
            asset = book['image'].removeprefix('https://homong-app.com/').replace('/', str(Path('/')))
            self.assertTrue((ROOT / asset).exists(), book['image'])

if __name__ == '__main__': unittest.main()
