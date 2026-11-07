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

INK, TEAL_TEXT, WHITE = "#17181C", "#C2410C", "#FFFFFF"
G1, G2 = "#C2410C", "#FDA978"          # orange gradient (dark -> light)
DOT = "#0EA5E9"                         # sky-blue circuit dots
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
    """Gradient circle with a white cloud and three circuit lines (same drawing as the site header)."""
    k = size / 56
    return (f'<defs><linearGradient id="{gid}" x1="0" y1="1" x2="1" y2="0">'
            f'<stop offset="0" stop-color="{G1}"/><stop offset="1" stop-color="{G2}"/></linearGradient></defs>'
            f'<g transform="translate({x:.2f} {y:.2f}) scale({k:.4f})">'
            f'<circle cx="28" cy="28" r="27" fill="url(#{gid})"/>'
            '<path d="M17.5 34.5a6.6 6.6 0 0 1 .9-13.1 9.6 9.6 0 0 1 18.4-3 7.6 7.6 0 0 1 3.3 16.1z" fill="#fff" fill-opacity=".95"/>'
            '<g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M23 34.5v3.6h-4"/><path d="M28 34.5v6.4"/><path d="M33 34.5v3.6h4"/></g>'
            '<circle cx="17" cy="38.1" r="1.9" fill="none" stroke="#fff" stroke-width="1.5"/>'
            f'<circle cx="28" cy="42.8" r="2.3" fill="{DOT}" stroke="#fff" stroke-width="1.4"/>'
            f'<circle cx="39" cy="38.1" r="1.9" fill="{DOT}" stroke="#fff" stroke-width="1.3"/></g>')

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
    for name, c1, c2 in (("logo", INK, TEAL_TEXT), ("logo-white", WHITE, "#FFD2B5")):
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
