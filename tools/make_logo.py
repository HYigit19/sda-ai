#!/usr/bin/env python3
"""Generates the SDA AI Services logo set as SVG (text converted to outlines).

Mark: dark rounded square with an orange prompt chevron and a light cursor bar.
Wordmark: "SDA" (Unbounded ExtraBold) over "AI SERVICES" (Sora Bold, tracked to the same width).

Needs: pip install fonttools brotli ; fonts in tools/fonts/
Output: src/assets/brand/*.svg   (PNG exports: python3 tools/render_png.py)
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "brand"
OUT.mkdir(parents=True, exist_ok=True)
FONTS = Path(__file__).with_name("fonts")

NAVY, ORANGE, LIGHT, WHITE = "#0B1F2A", "#FF6A13", "#F4F4F6", "#FFFFFF"


def mark(x, y, size, bg=NAVY):
    """Rounded square (32-unit grid) with the prompt chevron and cursor bar."""
    k = size / 32
    return (f'<g transform="translate({x:.2f} {y:.2f}) scale({k:.4f})">'
            f'<rect width="32" height="32" rx="9" fill="{bg}"/>'
            f'<path d="M8.5 10.5 14 16l-5.5 5.5" fill="none" stroke="{ORANGE}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<rect x="16" y="19.6" width="8.5" height="3.4" rx="1.7" fill="{LIGHT}"/></g>')


def text_path(font, text, size, tracking=0.0):
    """(svg path d, advance width, ink bounds) for text with baseline at y=0; tracking in px."""
    gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
    s = size / font["head"].unitsPerEm
    x, ds, bp = 0.0, [], BoundsPen(gs)
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, 0)))
        gs[g].draw(TransformPen(bp, (s, 0, 0, -s, x, 0)))
        ds.append(pen.getCommands())
        x += hmtx[g][0] * s + (tracking if i < len(text) - 1 else 0)
    return " ".join(ds), x, bp.bounds  # bounds: xmin, ymin, xmax, ymax (y down)


def fit_tracking(font, text, size, width):
    _, w0, b0 = text_path(font, text, size)
    return (width - (b0[2] - b0[0])) / (len(text) - 1)


def wordmark(big, small, size_big):
    d1, _, b1 = text_path(big, "SDA", size_big, -0.01 * size_big)
    w = b1[2] - b1[0]
    size_small = size_big * 0.29
    t = fit_tracking(small, "AI SERVICES", size_small, w)
    d2, _, b2 = text_path(small, "AI SERVICES", size_small, t)
    gap = size_big * 0.2
    # put the top of SDA at y=0
    y1 = -b1[1]
    y2 = y1 + b1[3] + gap - b2[1]
    h = y2 + b2[3]
    return d1, (-b1[0], y1), d2, (-b2[0], y2), w, h


def svg(w, h, body, title="SDA AI Services"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')


def lockup(c1, c2, mark_bg=NAVY):
    big = TTFont(FONTS / "unbounded-latin-800-normal.woff2")
    small = TTFont(FONTS / "sora-latin-700-normal.woff2")
    M = 64
    d1, o1, d2, o2, w, h = wordmark(big, small, 38)
    tx, ty = M + 16, (M - h) / 2
    body = (mark(0, 0, M, mark_bg) +
            f'<path d="{d1}" fill="{c1}" transform="translate({tx + o1[0]:.2f} {ty + o1[1]:.2f})"/>'
            f'<path d="{d2}" fill="{c2}" transform="translate({tx + o2[0]:.2f} {ty + o2[1]:.2f})"/>')
    return svg(tx + w + 2, M, body), (big, small)


def main():
    (OUT / "logo.svg").write_text(lockup(NAVY, ORANGE)[0])
    (OUT / "logo-white.svg").write_text(lockup(WHITE, ORANGE, "#16323F")[0])
    # stacked lockup for square spaces / social avatars
    big = TTFont(FONTS / "unbounded-latin-800-normal.woff2")
    small = TTFont(FONTS / "sora-latin-700-normal.woff2")
    S, m = 220, 96
    d1, o1, d2, o2, w, h = wordmark(big, small, 46)
    top = (S - (m + 22 + h)) / 2
    tx, ty = (S - w) / 2, top + m + 22
    body = (mark((S - m) / 2, top, m) +
            f'<path d="{d1}" fill="{NAVY}" transform="translate({tx + o1[0]:.2f} {ty + o1[1]:.2f})"/>'
            f'<path d="{d2}" fill="{ORANGE}" transform="translate({tx + o2[0]:.2f} {ty + o2[1]:.2f})"/>')
    (OUT / "logo-stacked.svg").write_text(svg(S, S, body))
    (OUT / "logo-mark.svg").write_text(svg(64, 64, mark(0, 0, 64)))
    print("written:", sorted(p.name for p in OUT.glob("*.svg")))


if __name__ == "__main__":
    main()
