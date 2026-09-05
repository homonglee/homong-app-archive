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
        self.assertEqual(rewrites[f"/{SLUG}/"], f"/{SLUG}-shell.html?slug={SLUG}")
        manual = (ROOT / "manuals" / f"{SLUG}.html").read_text(encoding="utf-8")
        self.assertIn("맞춤 캠핑 준비목록", manual)
        self.assertIn("PDF", manual)
        self.assertIn("XLSX", manual)
        self.assertIn("기본 선택", manual)
        self.assertIn("체크를 해제", manual)
        self.assertIn("각 카테고리", manual)
        self.assertIn("준비물 추가", manual)
        self.assertIn(f'href="/{SLUG}"', manual)

    def test_camping_share_shell_uses_camping_social_preview(self):
        shell_path = ROOT / f"{SLUG}-shell.html"
        shell = shell_path.read_text(encoding="utf-8")
        image_url = "https://homong-app.com/assets/camping-checklist-social-preview-v1.jpg"

        self.assertIn('<meta property="og:title" content="Camping Checklist — 맞춤 캠핑 준비목록"', shell)
        self.assertIn(f'<meta property="og:image" content="{image_url}"', shell)
        self.assertIn(f'<meta property="og:image:secure_url" content="{image_url}"', shell)
        self.assertIn('<meta property="og:image:type" content="image/jpeg"', shell)
        self.assertIn('<meta property="og:image:width" content="1200"', shell)
        self.assertIn('<meta property="og:image:height" content="630"', shell)
        self.assertIn(f'<meta name="twitter:image" content="{image_url}"', shell)
        self.assertTrue((ROOT / "assets" / "camping-checklist-social-preview-v1.jpg").is_file())


if __name__ == "__main__":
    unittest.main()
