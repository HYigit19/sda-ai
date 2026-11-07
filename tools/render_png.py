#!/usr/bin/env python3
"""Renders the PNG brand assets from the SVG logos (Playwright, Chromium).
Usage: python3 tools/render_png.py   (run tools/make_logo.py first)"""
import asyncio, base64, sys
from pathlib import Path
from playwright.async_api import async_playwright

BRAND = Path(__file__).resolve().parent.parent / "src" / "assets" / "brand"
FONT = (Path(__file__).with_name("geist.woff2")).as_uri()
svg = lambda f: "data:image/svg+xml;base64," + base64.b64encode((BRAND / f).read_bytes()).decode()

JOBS = [
    ("favicon-32.png", 32, 32, f'<img src="{svg("logo-mark.svg")}" style="width:32px;height:32px">'),
    ("icon-192.png", 192, 192, f'<img src="{svg("logo-mark.svg")}" style="width:192px;height:192px">'),
    ("icon-512.png", 512, 512, f'<img src="{svg("logo-mark.svg")}" style="width:512px;height:512px">'),
    ("apple-touch-icon.png", 180, 180, f'<div style="width:180px;height:180px;background:#fff;display:grid;place-items:center"><img src="{svg("logo-mark.svg")}" style="width:150px;height:150px"></div>'),
    ("logo.png", 1200, 0, f'<img src="{svg("logo.svg")}" style="width:1200px;display:block">'),
    ("logo-stacked.png", 880, 880, f'<img src="{svg("logo-stacked.svg")}" style="width:880px;height:880px;display:block">'),
    ("og-image.png", 1200, 630, f'''
    <div style="width:1200px;height:630px;position:relative;overflow:hidden;background:#F8F7F5">
      <div style="position:absolute;width:760px;height:760px;left:-220px;top:-320px;border-radius:50%;background:radial-gradient(circle,#FFC9A6,transparent 66%);filter:blur(30px);opacity:.8"></div>
      <div style="position:absolute;width:700px;height:700px;right:-240px;bottom:-330px;border-radius:50%;background:radial-gradient(circle,#A9DEFA,transparent 66%);filter:blur(30px);opacity:.8"></div>
      <div style="position:absolute;left:90px;top:96px"><img src="{svg("logo.svg")}" style="height:96px"></div>
      <div style="position:absolute;left:90px;top:262px;width:980px;font:600 72px/1.02 'Geist',system-ui;letter-spacing:-0.045em;color:#0B1F2A">AI that works the way<br>your <span style="color:#EA580C">team</span> does.</div>
      <div style="position:absolute;left:90px;bottom:70px;font:400 28px 'Geist',system-ui;color:#5E6068">AI agents · Automation · Web &amp; mobile apps · Data</div>
    </div>'''),
]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
        for name, w, h, body in JOBS:
            pg = await b.new_page(viewport={"width": w, "height": h or 300})
            await pg.set_content(f'<!doctype html><html><head><style>@font-face{{font-family:Geist;src:url("{FONT}") format("woff2");font-weight:100 900}}html,body{{margin:0;background:transparent}}</style></head><body>{body}</body></html>')
            await pg.wait_for_timeout(500)
            el = await pg.query_selector("body > *")
            await el.screenshot(path=str(BRAND / name), omit_background=True)
            await pg.close(); print("rendered", name)
        await b.close()
asyncio.run(main())
