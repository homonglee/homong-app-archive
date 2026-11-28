import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class DiscoveryApiTests(unittest.TestCase):
    def test_api_keeps_public_metadata(self):
        spec = importlib.util.spec_from_file_location('archive_api', ROOT / 'api/apps.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        snapshot = json.loads((ROOT / 'apps_static.json').read_text(encoding='utf-8'))
        published = module.public_payload(snapshot)['apps']
        self.assertEqual(len(published), 47)
        self.assertNotIn('mastermind-page', {a['slug'] for a in published})
        for a, original in zip(published, snapshot['apps']):
            for key in ('primaryCategory','tags','collections','featuredRank','availability','quality','limitations','verification'):
                self.assertEqual(a[key], original[key])
            self.assertNotIn('deploymentUrl', a)

    def test_local_registry_keeps_same_metadata(self):
        spec = importlib.util.spec_from_file_location('archive_server', ROOT / 'server.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        registry = module.load_registry()
        cards = {a['slug']: a for a in module.scan_apps()}
        self.assertEqual(set(cards), set(registry))
        for slug, app in registry.items():
            for key in ('primaryCategory','tags','collections','featuredRank','availability','quality','limitations','verification'):
                self.assertEqual(cards[slug][key], app[key])

if __name__ == '__main__':
    unittest.main()
