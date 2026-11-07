"""Render tools/video/sda-video.html to an MP4 and a poster image.

Every CSS animation in the page is paused; this script sets each animation's
currentTime frame by frame, takes a screenshot and pipes the frames to ffmpeg.

    pip install playwright && python -m playwright install chromium
    python3 tools/video/render.py            # writes src/assets/media/sda-ai-services.mp4 + .jpg
"""
import asyncio, subprocess, sys
from pathlib import Path
from playwright.async_api import async_playwright

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "src" / "assets" / "media"
FPS, DURATION = 30, 34.6
W, H = 1920, 1080
POSTER_AT = 6.2  # seconds


async def main(chrome=None):
    OUT.mkdir(parents=True, exist_ok=True)
    mp4 = OUT / "sda-ai-services.mp4"
    ff = subprocess.Popen([
        "ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        "-an", str(mp4)], stdin=subprocess.PIPE)
    async with async_playwright() as p:
        kw = {"executable_path": chrome, "args": ["--no-sandbox"]} if chrome else {}
        browser = await p.chromium.launch(**kw)
        page = await browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
        await page.goto((HERE / "sda-video.html").as_uri())
        await page.evaluate("document.fonts.ready")
        await page.wait_for_timeout(500)
        seek = "ms => { document.getAnimations().forEach(a => { a.pause(); a.currentTime = ms; }); }"
        frames = int(round(DURATION * FPS))
        for i in range(frames):
            await page.evaluate(seek, i * 1000 / FPS)
            ff.stdin.write(await page.screenshot(type="jpeg", quality=92))
            if i % 150 == 0:
                print(f"frame {i}/{frames}", flush=True)
        await page.evaluate(seek, POSTER_AT * 1000)
        await page.screenshot(path=str(OUT / "sda-ai-services.jpg"), type="jpeg", quality=82)
        await browser.close()
    ff.stdin.close()
    ff.wait()
    print("wrote", mp4)


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1] if len(sys.argv) > 1 else None))
