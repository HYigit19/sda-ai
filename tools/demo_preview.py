"""Build a standalone preview page for ONE demo, without touching site/ or the repo root.

    python3 tools/demo_preview.py <slug>   ->  /tmp/sda-preview/<slug>/index.html

The page loads the site stylesheet, the shared demo toolkit and only this demo,
so several demos can be developed and tested in parallel.
"""
import importlib.util, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
d = ROOT / "src" / "demos" / slug
out = Path("/tmp/sda-preview") / slug
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)


def load(name):
    spec = importlib.util.spec_from_file_location(f"p_{name}", d / f"{name}.py")
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m


meta = load("meta").USE_CASE
html = load("markup").markup()
shutil.copy(ROOT / "src" / "assets" / "style.css", out / "style.css")
(out / "demos.css").write_text((ROOT / "src/demos/_shared/shared.css").read_text() + "\n" + (d / "demo.css").read_text())
(out / "demos.js").write_text((ROOT / "src/demos/_shared/shared.js").read_text() + "\n" + (d / "demo.js").read_text())
(out / "index.html").write_text(f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Preview · {meta['name']}</title>
<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="demos.css"></head>
<body><main id="main"><section class="demo-stage" style="padding:40px 0"><div class="wrap">
<h1 style="font-size:40px;margin-bottom:20px">{meta['name']}</h1>
{html}
</div></section>
<section style="height:60vh"></section></main>
<script src="demos.js"></script></body></html>""")
print(out / "index.html")
