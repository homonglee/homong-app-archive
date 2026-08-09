import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ORIGIN = "https://homong-app.com"


def load_json(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


class ArchiveRouteTests(unittest.TestCase):
    def test_every_registered_app_uses_archive_domain_path(self):
        registry = load_json("apps_registry.json")

        self.assertTrue(registry)
        for slug, app in registry.items():
            with self.subTest(slug=slug):
                self.assertEqual(app["url"], f"{PUBLIC_ORIGIN}/{slug}")
                self.assertNotIn(".vercel.app", app["url"])

    def test_every_registered_app_has_a_same_domain_route(self):
        registry = load_json("apps_registry.json")
        config = load_json("vercel.json")
        redirects = {item["source"]: item for item in config.get("redirects", [])}
        rewrites = {item["source"]: item for item in config.get("rewrites", [])}

        for slug, app in registry.items():
            with self.subTest(slug=slug):
                self.assertEqual(redirects[f"/{slug}"]["destination"], f"/{slug}/")
                self.assertIn(f"/{slug}/", rewrites)

                deployment = app.get("deploymentUrl", "")
                if app.get("routeMode") == "embed":
                    self.assertEqual(
                        rewrites[f"/{slug}/"]["destination"],
                        f"/app-shell.html?slug={slug}",
                    )
                elif deployment:
                    self.assertEqual(
                        rewrites[f"/{slug}/"]["destination"],
                        deployment.rstrip("/") + "/",
                    )
                    self.assertEqual(
                        rewrites[f"/{slug}/:path*"]["destination"],
                        deployment.rstrip("/") + "/:path*",
                    )
                else:
                    self.assertEqual(
                        rewrites[f"/{slug}/"]["destination"],
                        f"/apps/{slug}/index.html",
                    )
                    self.assertEqual(
                        rewrites[f"/{slug}/:path*"]["destination"],
                        f"/apps/{slug}/:path*",
                    )

    def test_static_snapshot_never_exposes_vercel_as_launch_url(self):
        apps = load_json("apps_static.json")["apps"]

        self.assertTrue(apps)
        for app in apps:
            with self.subTest(slug=app["slug"]):
                self.assertEqual(app["url"], f"{PUBLIC_ORIGIN}/{app['slug']}")
                self.assertNotIn(".vercel.app", app["url"])


if __name__ == "__main__":
    unittest.main()
