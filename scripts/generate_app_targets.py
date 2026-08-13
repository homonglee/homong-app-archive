#!/usr/bin/env python3
"""Generate app-shell targets without exposing them in the public archive API."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
registry = json.loads((ROOT / 'apps_registry.json').read_text(encoding='utf-8'))
targets = {}
for slug, app in registry.items():
    deployment = app.get('deploymentUrl', '').rstrip('/')
    targets[slug] = deployment + '/' if deployment else f'/apps/{slug}/index.html'
(ROOT / 'app_targets.json').write_text(
    json.dumps(targets, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
)
print(f'generated {len(targets)} app-shell targets')
