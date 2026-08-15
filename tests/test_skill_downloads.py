import json
import sys
import unittest
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
import server
SLUG = "memory-companion"
DOWNLOAD_URL = "https://homong-app.com/assets/downloads/memory-companion-skill.zip"
EXPECTED_SKILL_FILES = {
    "memory-companion/SKILL.md",
    "memory-companion/references/memory-schema.md",
    "memory-companion/scripts/detect_unfinished.py",
    "memory-companion/templates/memory-record.md",
}


class SkillDownloadTests(unittest.TestCase):
    def test_memory_companion_skill_is_registered_with_valid_zip(self):
        registry = json.loads((ROOT / "apps_registry.json").read_text(encoding="utf-8"))
        static_apps = json.loads((ROOT / "apps_static.json").read_text(encoding="utf-8"))["apps"]
        app = registry[SLUG]
        public_app = next(item for item in static_apps if item["slug"] == SLUG)

        self.assertEqual(app["downloadUrl"], DOWNLOAD_URL)
        self.assertEqual(public_app["downloadUrl"], DOWNLOAD_URL)

        archive = ROOT / "assets" / "downloads" / "memory-companion-skill.zip"
        self.assertTrue(archive.is_file())
        with zipfile.ZipFile(archive) as bundle:
            self.assertIsNone(bundle.testzip())
            self.assertEqual(set(bundle.namelist()), EXPECTED_SKILL_FILES)

    def test_public_api_and_archive_card_expose_skill_download(self):
        api_source = (ROOT / "api" / "apps.py").read_text(encoding="utf-8")
        index = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn("'downloadUrl'", api_source)
        self.assertIn("a.downloadUrl", index)
        self.assertIn("Skill ZIP", index)

    def test_local_preview_preserves_download_url(self):
        entry = server.manual_registry_entry(SLUG, {
            "name": "Memory Companion",
            "url": "https://homong-app.com/memory-companion",
            "downloadUrl": DOWNLOAD_URL,
        })
        self.assertEqual(entry["downloadUrl"], DOWNLOAD_URL)


if __name__ == "__main__":
    unittest.main()
