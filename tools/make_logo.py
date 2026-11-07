#!/usr/bin/env python3
"""Generates the SDA AI Services logo set as SVG (text converted to outlines).

Needs: pip install fonttools brotli ; the Geist variable font at tools/geist.woff2
Output: src/assets/brand/*.svg   (PNG exports are rendered by tools/render_png.js)
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "brand"
OUT.mkdir(parents=True, exist_ok=True)
FONT = Path(__file__).with_name("geist.woff2")

INK, TEAL_TEXT, WHITE = "#0E1B22", "#0D7270", "#FFFFFF"
G1, G2 = "#17A39D", "#FF7D5E"          # teal -> coral
SPARK = "M12 0c.6 5.8 3.4 9.9 12 12-8.6 2.1-11.4 6.2-12 12-.6-5.8-3.4-9.9-12-12 8.6-2.1 11.4-6.2 12-12z"

def font_at(w):
    f = TTFont(FONT)
    return instantiateVariableFont(f, {"wght": w}, inplace=False)

def text_path(font, text, size, tracking_em=0.0):
    """Return (svg path d, width, cap height) for text with baseline at y=0."""
    gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
    upm = font["head"].unitsPerEm
    s = size / upm
    x, ds = 0.0, []
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, 0)))
        ds.append(pen.getCommands())
        x += hmtx[g][0] * s + (tracking_em * size if i < len(text) - 1 else 0)
    bp = BoundsPen(gs); gs[cmap[ord("H")]].draw(bp)
    cap = bp.bounds[3] * s
    return " ".join(ds), x, cap

def mark(x, y, size, gid):
    """Gradient squircle with a white sparkle and a small companion sparkle."""
    r = size * 0.28
    big = size * 0.56 / 24      # sparkle scale
    small = size * 0.2 / 24
    # teal base + coral glow from the bottom-right corner (no muddy teal/coral midpoint)
    return (f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="#1FB8AC"/><stop offset="1" stop-color="#0B7774"/></linearGradient>'
            f'<radialGradient id="{gid}c" cx="1" cy="1" r=".78"><stop offset="0" stop-color="{G2}"/><stop offset=".4" stop-color="{G2}" stop-opacity=".6"/><stop offset="1" stop-color="{G2}" stop-opacity="0"/></radialGradient>'
            f'<radialGradient id="{gid}h" cx=".22" cy=".12" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>'
            f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{r:.2f}" fill="url(#{gid})"/>'
            f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{r:.2f}" fill="url(#{gid}c)"/>'
            f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{r:.2f}" fill="url(#{gid}h)"/>'
            f'<path d="{SPARK}" fill="{WHITE}" transform="translate({x + size*0.17:.2f} {y + size*0.27:.2f}) scale({big:.4f})"/>'
            f'<path d="{SPARK}" fill="{WHITE}" fill-opacity=".9" transform="translate({x + size*0.66:.2f} {y + size*0.13:.2f}) scale({small:.4f})"/>')

def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')

def main():
    bold, med = font_at(700), font_at(560)
    # --- horizontal lockup: mark + SDA / AI SERVICES ---
    M = 64
    d1, w1, cap1 = text_path(bold, "SDA", 40, -0.01)
    d2, w2, cap2 = text_path(med, "AI SERVICES", 10.5, 0.34)
    gap = 16
    tx = M + gap
    base1 = 34                 # baseline of SDA
    base2 = base1 + 20         # baseline of tagline
    W = tx + max(w1, w2) + 4
    for name, c1, c2 in (("logo", INK, TEAL_TEXT), ("logo-white", WHITE, "#BFEDE6")):
        body = (mark(0, 0, M, "g") +
                f'<path d="{d1}" fill="{c1}" transform="translate({tx} {base1})"/>'
                f'<path d="{d2}" fill="{c2}" transform="translate({tx + 1} {base2})"/>')
        (OUT / f"{name}.svg").write_text(svg(W, M, body, "SDA AI Services"))
    # --- stacked lockup (for square spaces, social avatars) ---
    S = 220
    m = 96
    d3, w3, _ = text_path(bold, "SDA", 56, -0.01)
    d4, w4, _ = text_path(med, "AI SERVICES", 13, 0.34)
    body = (mark((S - m) / 2, 18, m, "g") +
            f'<path d="{d3}" fill="{INK}" transform="translate({(S - w3) / 2:.2f} {18 + m + 58})"/>'
            f'<path d="{d4}" fill="{TEAL_TEXT}" transform="translate({(S - w4) / 2:.2f} {18 + m + 82})"/>')
    (OUT / "logo-stacked.svg").write_text(svg(S, S, body, "SDA AI Services"))
    # --- mark only / favicon ---
    (OUT / "logo-mark.svg").write_text(svg(64, 64, mark(0, 0, 64, "g"), "SDA AI Services"))
    print("written:", sorted(p.name for p in OUT.glob("*.svg")))

if __name__ == "__main__":
    main()
