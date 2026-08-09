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

    def test_embed_shell_reads_slug_from_visible_archive_path(self):
        shell = (ROOT / "app-shell.html").read_text(encoding="utf-8")

        self.assertIn("location.pathname", shell)
        self.assertNotIn("new URLSearchParams(location.search).get('slug')", shell)

    def test_static_snapshot_never_exposes_internal_origins(self):
        raw = (ROOT / "apps_static.json").read_text(encoding="utf-8")
        apps = json.loads(raw)["apps"]

        self.assertNotIn(".vercel.app", raw)
        for app in apps:
            with self.subTest(slug=app["slug"]):
                self.assertEqual(app["url"], f"{PUBLIC_ORIGIN}/{app['slug']}")
                self.assertNotIn("deploymentUrl", app)
                self.assertNotIn("localUrl", app)

    def test_archive_ui_does_not_reference_internal_deployment_fields(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertNotIn("deploymentUrl", html)
        self.assertNotIn("외부 배포 링크", html)
        self.assertNotIn("외부 실행", html)

    def test_moa_uses_direct_archive_rewrite_instead_of_embed_shell(self):
        registry = load_json("apps_registry.json")
        config = load_json("vercel.json")
        rewrites = {item["source"]: item["destination"] for item in config["rewrites"]}
        slug = "moa-ai-bookmark-manager"

        self.assertNotEqual(registry[slug].get("routeMode"), "embed")
        self.assertEqual(rewrites[f"/{slug}/"], registry[slug]["deploymentUrl"].rstrip("/") + "/")
        self.assertEqual(rewrites[f"/{slug}/:path*"], registry[slug]["deploymentUrl"].rstrip("/") + "/:path*")


if __name__ == "__main__":
    unittest.main()
