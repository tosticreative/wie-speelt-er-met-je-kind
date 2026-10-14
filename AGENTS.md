# Preserve the editor's content across versions

- V1 lives in `dist/index.html`, `dist/styles.css`, and `dist/app.js`. Do not replace it when changing V2.
- User-edited text is stored in `content/copy.json`. Never regenerate, reset, or replace this file with defaults. Preserve unknown keys and the `content/backups/` folder.
- V2 uses `dist/v2/defaults.json` and fixed `data-copy` / `data-copy-attrs` IDs. Retain existing IDs when moving or redesigning a text field. New text fields need new unique IDs and editor entries.
- Future versions must load the same `/api/content` data; saved values override defaults. Do not derive IDs from DOM order again.
- Every website text must remain editable, including dynamic carousel copy, sources, buttons, metadata and nondecorative accessibility labels. Use textContent / setAttribute, never user-supplied HTML.
- Verify saving and reload, conflict detection, and that all defaults have a corresponding rendered or dynamic binding. Run `python3 -m unittest test_editor.py`.
- This is a local-only editor. A public deployment requires authenticated server-side persistence; never expose this development server through a public tunnel.
