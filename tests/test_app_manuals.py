import html
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APPS = json.loads((ROOT / 'apps_static.json').read_text(encoding='utf-8'))['apps']
INDEX = (ROOT / 'index.html').read_text(encoding='utf-8')

class AppManualTests(unittest.TestCase):
    def test_one_manual_exists_for_every_registered_app(self):
        files = sorted((ROOT / 'manuals').glob('*.html'))
        self.assertEqual(len(files), len(APPS))
        self.assertEqual({p.stem for p in files}, {a['slug'] for a in APPS})

    def test_every_manual_has_required_content_and_links(self):
        for app in APPS:
            with self.subTest(slug=app['slug']):
                page = (ROOT / 'manuals' / f"{app['slug']}.html").read_text(encoding='utf-8')
                self.assertIn(html.escape(app['name']), page)
                self.assertIn('사용 순서', page)
                self.assertIn('만들어지는 결과', page)
                self.assertIn('사용 전 확인', page)
                self.assertGreaterEqual(page.count('<li>'), 6)
                self.assertIn(f'href="/{app["slug"]}"', page)
                self.assertIn('href="/#apps"', page)

    def test_archive_uses_manual_button_instead_of_same_domain_badge(self):
        self.assertIn('class="manual-link"', INDEX)
        self.assertIn('/manuals/${encodeURIComponent(a.slug)}.html', INDEX)
        self.assertIn('📖 사용설명서', INDEX)
        self.assertNotIn('<span class="badge">동일 도메인</span>', INDEX)
        self.assertIn('.manual-link{', INDEX)

    def test_generator_matches_registry_and_is_repeatable(self):
        result = subprocess.run(
            [sys.executable, str(ROOT / 'scripts' / 'generate_manuals.py')],
            cwd=ROOT, capture_output=True, text=True, check=True,
        )
        self.assertIn(f'generated {len(APPS)} manuals', result.stdout)

if __name__ == '__main__': unittest.main()
