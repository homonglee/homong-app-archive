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

                self.assertEqual(
                    rewrites[f"/{slug}/"]["destination"],
                    f"/app-shell.html?slug={slug}",
                )

                self.assertNotIn(f"/{slug}/:path*", rewrites)

    def test_newsletter_alias_routes_survive_route_regeneration(self):
        config = load_json("vercel.json")
        redirects = {item["source"]: item["destination"] for item in config["redirects"]}
        rewrites = {item["source"]: item["destination"] for item in config["rewrites"]}

        self.assertEqual(redirects["/newsletter"], "/newsletter/")
        self.assertEqual(rewrites["/newsletter/"], "https://newsletter-webzine.vercel.app/")
        self.assertEqual(
            rewrites["/newsletter/s/:id"],
            "https://newsletter-webzine.vercel.app/api/reader?id=:id",
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

    def test_header_links_to_hoyeon_jijae_homepage(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn('class="btn nav-hovision"', html)
        self.assertIn('href="https://hovision.co.kr"', html)
        self.assertIn('target="_blank"', html)
        self.assertIn('rel="noopener noreferrer"', html)
        self.assertIn('호연지재 홈페이지', html)

    def test_social_share_preview_uses_branded_image(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        image_url = "https://homong-app.com/assets/homong-app-social-preview-v3.jpg"

        self.assertIn(f'<meta property="og:image" content="{image_url}"', html)
        self.assertIn('<meta property="og:image:width" content="1280"', html)
        self.assertIn('<meta property="og:image:height" content="640"', html)
        self.assertIn(f'<meta name="twitter:image" content="{image_url}"', html)
        self.assertTrue((ROOT / "assets" / "homong-app-social-preview-v3.jpg").is_file())

    def test_homepage_hero_uses_new_social_banner(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn('src="/assets/homong-app-social-preview-v2.jpg"', html)
        self.assertIn('width="1280" height="427"', html)
        self.assertNotIn('/assets/archive-intro-banner.jpg', html)

    def test_archive_cards_visibly_render_branded_urls(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn('class="archive-url"', html)
        self.assertIn("new URL(url, location.href).href", html)
        self.assertIn(".archive-url{", html)
        self.assertIn("overflow-wrap:anywhere", html)

    def test_archive_ui_supports_persistent_manual_card_order(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")

        self.assertIn('id="reorderBtn"', html)
        self.assertIn('id="resetOrderBtn"', html)
        self.assertIn('draggable="${state.reordering}"', html)
        self.assertIn("dragstart", html)
        self.assertIn("dragover", html)
        self.assertIn("homong-app-card-order-v1", html)
        self.assertIn('/assets/archive-order.js', html)
        self.assertIn('data-move="up"', html)
        self.assertIn('data-move="down"', html)
        self.assertIn('data-move="first"', html)
        self.assertIn('data-move="last"', html)
        self.assertIn('맨 위로', html)
        self.assertIn('맨 아래로', html)
        self.assertIn("aria-label=\"앱 순서 편집\"", html)

    def test_internal_registry_is_excluded_from_vercel_deployment(self):
        ignored = (ROOT / ".vercelignore").read_text(encoding="utf-8").splitlines()

        self.assertIn("apps_registry.json", ignored)
        self.assertNotIn("app-shell.html", ignored)

    def test_all_apps_use_shell_with_manual_button(self):
        registry = load_json("apps_registry.json")
        config = load_json("vercel.json")
        rewrites = {item["source"]: item["destination"] for item in config["rewrites"]}
        shell = (ROOT / "app-shell.html").read_text(encoding="utf-8")

        for slug in registry:
            with self.subTest(slug=slug):
                self.assertEqual(rewrites[f"/{slug}/"], f"/app-shell.html?slug={slug}")
        self.assertIn('id="manualLink"', shell)
        self.assertIn('/manuals/${encodeURIComponent(slug)}.html', shell)
        self.assertIn('📖 사용설명서', shell)
        self.assertIn('geolocation', shell)

    def test_app_shell_links_use_social_share_preview(self):
        shell = (ROOT / "app-shell.html").read_text(encoding="utf-8")
        image_url = "https://homong-app.com/assets/homong-app-social-preview-v3.jpg"

        self.assertIn(f'<meta property="og:image" content="{image_url}"', shell)
        self.assertIn('<meta property="og:image:width" content="1280"', shell)
        self.assertIn('<meta property="og:image:height" content="640"', shell)
        self.assertIn(f'<meta name="twitter:image" content="{image_url}"', shell)

    def test_manual_button_uses_reserved_toolbar_instead_of_overlaying_app(self):
        shell = (ROOT / "app-shell.html").read_text(encoding="utf-8")

        self.assertIn('id="shellToolbar"', shell)
        self.assertIn('body { overflow: hidden; background: #f7f7f4; display: flex; flex-direction: column; }', shell)
        self.assertIn('#shellToolbar {', shell)
        self.assertIn('flex: 0 0 58px', shell)
        self.assertIn('iframe { display: block; flex: 1 1 auto; min-height: 0; height: auto;', shell)
        manual_css = shell.split('#manualLink {', 1)[1].split('}', 1)[0]
        self.assertNotIn('position: fixed', manual_css)

    def test_app_targets_match_registry_without_public_api_exposure(self):
        registry = load_json("apps_registry.json")
        targets = load_json("app_targets.json")
        public_api = (ROOT / "api" / "apps.py").read_text(encoding="utf-8")

        self.assertEqual(set(targets), set(registry))
        for slug, app in registry.items():
            expected = app.get("deploymentUrl", "").rstrip("/") + "/" if app.get("deploymentUrl") else f"/apps/{slug}/index.html"
            self.assertEqual(targets[slug], expected)
        self.assertNotIn("deploymentUrl", public_api)


if __name__ == "__main__":
    unittest.main()
