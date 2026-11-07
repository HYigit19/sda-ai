#!/usr/bin/env python3
"""Social media brand kit: profile pictures, banners and transparent logos.
Usage: python3 tools/social.py   (run tools/make_logo.py first) -> src/assets/brand/social/"""
import asyncio, base64
from pathlib import Path
from playwright.async_api import async_playwright

BRAND = Path(__file__).resolve().parent.parent / "src" / "assets" / "brand"
OUT = BRAND / "social"; OUT.mkdir(exist_ok=True)
FONT = Path(__file__).with_name("geist.woff2").as_uri()
svg = lambda f: "data:image/svg+xml;base64," + base64.b64encode((BRAND / f).read_bytes()).decode()
NAVY, OR, BG = "#0B1F2A", "#EA580C", "#F8F7F5"
PROMPT = ('<svg viewBox="0 0 32 32" style="width:{s}px;height:{s}px"><path d="M8.5 10.5 14 16l-5.5 5.5" fill="none" stroke="#FF6A13" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'
          '<rect x="16" y="19.6" width="8.5" height="3.4" rx="1.7" fill="#F4F4F6"/></svg>')
GLOWS = ('<div style="position:absolute;width:{a}px;height:{a}px;left:-{x}px;top:-{y}px;border-radius:50%;background:radial-gradient(circle,#FFC9A6,transparent 66%);filter:blur(30px);opacity:.85"></div>'
         '<div style="position:absolute;width:{a}px;height:{a}px;right:-{x}px;bottom:-{y}px;border-radius:50%;background:radial-gradient(circle,#A9DEFA,transparent 66%);filter:blur(30px);opacity:.8"></div>')

def banner(w, h, pad_left, logo_h, title, sub, safe_note=""):
    return f'''<div style="width:{w}px;height:{h}px;position:relative;overflow:hidden;background:{BG};font-family:Geist">
      {GLOWS.format(a=int(h*2), x=int(h*.6), y=int(h*1.1))}
      <div style="position:absolute;left:{pad_left}px;right:{int(w*.06)}px;top:0;bottom:0;display:flex;align-items:center;justify-content:space-between;gap:{int(h*.15)}px">
        <img src="{svg('logo.svg')}" style="height:{logo_h}px">
        <div style="text-align:right">
          <div style="font:600 {int(h*.13)}px/1.08 Geist;letter-spacing:-.035em;color:{NAVY}">{title}</div>
          <div style="margin-top:{int(h*.05)}px;font:500 {int(h*.06)}px Geist;color:#5E6068;white-space:nowrap">{sub}</div>
        </div>
      </div></div>'''

TITLE = 'AI that works the way<br>your <span style="color:%s">team</span> does.' % OR
SUB = "AI agents · Automation · Web &amp; mobile apps · Data"
JOBS = [
    # profile pictures (safe for circle crops)
    ("profile-mark-1080.png", 1080, 1080, f'<div style="width:1080px;height:1080px;background:{NAVY};display:grid;place-items:center">{PROMPT.format(s=760)}</div>'),
    ("profile-mark-400.png", 400, 400, f'<div style="width:400px;height:400px;background:{NAVY};display:grid;place-items:center">{PROMPT.format(s=282)}</div>'),
    ("profile-logo-white-1080.png", 1080, 1080, f'<div style="width:1080px;height:1080px;background:#fff;display:grid;place-items:center"><img src="{svg("logo-stacked.svg")}" style="width:860px"></div>'),
    # covers / banners
    ("linkedin-banner-1584x396.png", 1584, 396, banner(1584, 396, 420, 120, TITLE, SUB)),
    ("x-header-1500x500.png", 1500, 500, banner(1500, 500, 330, 130, TITLE, SUB)),
    ("facebook-cover-1640x624.png", 1640, 624, banner(1640, 624, 140, 170, TITLE, SUB)),
    ("youtube-banner-2560x1440.png", 2560, 1440, f'''<div style="width:2560px;height:1440px;position:relative;overflow:hidden;background:{BG}">{GLOWS.format(a=1500, x=300, y=600)}
        <div style="position:absolute;left:507px;top:509px;width:1546px;height:423px;display:flex;align-items:center;justify-content:center;gap:80px"><img src="{svg('logo.svg')}" style="height:190px"></div></div>'''),
    # transparent logos
    ("logo-transparent.png", 2000, 0, f'<img src="{svg("logo.svg")}" style="width:2000px;display:block">'),
    ("logo-white-transparent.png", 2000, 0, f'<img src="{svg("logo-white.svg")}" style="width:2000px;display:block">'),
    ("logo-stacked-transparent.png", 1200, 1200, f'<img src="{svg("logo-stacked.svg")}" style="width:1200px;height:1200px;display:block">'),
    ("logo-mark-transparent.png", 1024, 1024, f'<img src="{svg("logo-mark.svg")}" style="width:1024px;height:1024px;display:block">'),
]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
        tmp = OUT / "_t.html"
        for name, w, h, body in JOBS:
            pg = await b.new_page(viewport={"width": w, "height": h or 800})
            tmp.write_text(f'<!doctype html><html><head><style>@font-face{{font-family:Geist;src:url("{FONT}") format("woff2");font-weight:100 900}}html,body{{margin:0;background:transparent}}</style></head><body>{body}</body></html>')
            await pg.goto(tmp.as_uri()); await pg.wait_for_timeout(500)
            el = await pg.query_selector("body > *")
            await el.screenshot(path=str(OUT / name), omit_background=True)
            await pg.close(); print("rendered", name)
        tmp.unlink(); await b.close()
asyncio.run(main())
