# Archive update rules

- Preserve the approved interface layout unless the user asks to change it. The header, book carousel, intro, and search/category controls retain their current placement.
- The current release starts at v5.01. For every subsequent user-requested production update, run `node scripts/bump-version.cjs` once before committing that release. This updates `version.json` and the header badge together: v5.01 -> v5.02 -> v5.03. Do not bump for every file or test adjustment within one unreleased change.
- Include both version files in the same release commit. Run `node tests/test_archive_theme.cjs` to check their consistency, followed by the relevant existing tests.
- Keep Dark and Light usable with readable cards, controls, book slides, profile details, and dialogs. Preserve the browser's saved theme and app order. Check the affected interface in both themes before publishing.
- Keep existing app URLs and current app metadata unless a requested update requires changing them. Production updates publish through the existing homonglee/homong-app-archive Git connection to the existing homong-app.com Vercel project.
