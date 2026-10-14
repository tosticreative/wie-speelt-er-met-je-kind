"""Build the static V3 site without local editing tools."""
from pathlib import Path
import shutil
import re

root = Path(__file__).resolve().parents[1]
out = root / "public-site"
out.mkdir(exist_ok=False)
for source in (root / "dist").iterdir():
    if source.is_file() and source.suffix in {".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico", ".css", ".txt"}:
        shutil.copy2(source, out / source.name)
for name in ("app.js", "public.js", "analytics.js", "defaults.json", "v3.css", "cursor-target.svg", "cursor-arrow.svg"):
    shutil.copy2(root / "dist/v3" / name, out / name)
shutil.copy2(root / "content/copy.json", out / "content.json")
html = (root / "dist/v3/index.html").read_text()
html = html.replace('href="../styles.css', 'href="styles.css')
html = html.replace('src="../', 'src="')
html = html.replace('<link rel="stylesheet" href="editor.css">', '')
html = html.replace('<script type="module" src="editor.js"></script>', '<script type="module" src="public.js?v=analytics1"></script>')
html = re.sub(r'<div class="v3-mode"[^>]*>.*?</div>', '', html)
assert not any(value in html for value in ("editor.js", "editor.css", "Tekststudio", "GAME MODE"))
(out / "index.html").write_text(html)
assert not (out / "editor.js").exists()
assert not (out / "editor.css").exists()
print("Built public V3 without editor.")