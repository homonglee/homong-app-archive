import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "camping-checklist"


class CampingChecklistRegistrationTests(unittest.TestCase):
    def test_camping_checklist_is_registered_end_to_end(self):
        registry = json.loads((ROOT / "apps_registry.json").read_text(encoding="utf-8"))
        static_apps = json.loads((ROOT / "apps_static.json").read_text(encoding="utf-8"))["apps"]
        targets = json.loads((ROOT / "app_targets.json").read_text(encoding="utf-8"))
        config = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
        redirects = {row["source"]: row["destination"] for row in config["redirects"]}
        rewrites = {row["source"]: row["destination"] for row in config["rewrites"]}

        self.assertIn(SLUG, registry)
        self.assertEqual(registry[SLUG]["url"], "https://homong-app.com/camping-checklist")
        self.assertEqual(registry[SLUG]["deploymentUrl"], "https://camping-checklist-three.vercel.app")
        self.assertEqual(registry[SLUG]["github"], "https://github.com/homonglee/camping-checklist")
        self.assertEqual(sum(app["slug"] == SLUG for app in static_apps), 1)
        self.assertEqual(static_apps[0]["slug"], SLUG)
        self.assertNotIn("deploymentUrl", static_apps[0])
        self.assertEqual(targets[SLUG], "https://camping-checklist-three.vercel.app/")
        self.assertEqual(redirects[f"/{SLUG}"], f"/{SLUG}/")
        self.assertEqual(rewrites[f"/{SLUG}/"], f"/app-shell.html?slug={SLUG}")
        manual = (ROOT / "manuals" / f"{SLUG}.html").read_text(encoding="utf-8")
        self.assertIn("맞춤 캠핑 준비목록", manual)
        self.assertIn("PDF", manual)
        self.assertIn("XLSX", manual)
        self.assertIn("기본 선택", manual)
        self.assertIn("체크를 해제", manual)
        self.assertIn(f'href="/{SLUG}"', manual)


if __name__ == "__main__":
    unittest.main()
