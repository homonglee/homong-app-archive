#!/usr/bin/env python3
"""Generate Vercel routes for every manually registered archive app."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "apps_registry.json"
VERCEL_PATH = ROOT / "vercel.json"

# Some legacy apps call root-relative API/assets. Keep those calls on the
# archive domain while forwarding them to the correct deployment.
ROOT_REWRITES = [
    {"source": "/api/shorten", "destination": "https://url-qr-shortener-onepage.vercel.app/api/shorten"},
    {"source": "/api/translate", "destination": "https://ocr-translator-app-eight.vercel.app/api/translate"},
    {"source": "/app.js", "destination": "https://ocr-translator-app-eight.vercel.app/app.js"},
    {"source": "/styles.css", "destination": "https://ocr-translator-app-eight.vercel.app/styles.css"},
    {"source": "/api/analyze", "destination": "https://youtube-timeline-summarizer.vercel.app/api/analyze"},
    {"source": "/api/config", "destination": "https://schedule-share-link-generator.vercel.app/api/config"},
    {"source": "/api/google/:path*", "destination": "https://schedule-share-link-generator.vercel.app/api/google/:path*"},
    {"source": "/api/calendar/:path*", "destination": "https://schedule-share-link-generator.vercel.app/api/calendar/:path*"},
    {"source": "/api/share-link", "destination": "https://schedule-share-link-generator.vercel.app/api/share-link"},
]


def build_config(registry: dict) -> dict:
    redirects = []
    rewrites = list(ROOT_REWRITES)

    for slug, app in registry.items():
        redirects.append({
            "source": f"/{slug}",
            "destination": f"/{slug}/",
            "permanent": False,
        })

        deployment = app.get("deploymentUrl", "").rstrip("/")
        rewrites.append({
            "source": f"/{slug}/",
            "destination": f"/app-shell.html?slug={slug}",
        })
        # Nested static assets and API calls still use the original app target.
        if deployment:
            rewrites.append({"source": f"/{slug}/:path*", "destination": deployment + "/:path*"})
        else:
            rewrites.append({"source": f"/{slug}/:path*", "destination": f"/apps/{slug}/:path*"})

    return {"redirects": redirects, "rewrites": rewrites}


def main() -> None:
    registry = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
    config = build_config(registry)
    VERCEL_PATH.write_text(
        json.dumps(config, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"generated {len(config['redirects'])} redirects and {len(config['rewrites'])} rewrites")


if __name__ == "__main__":
    main()
