// Renders PNG brand assets from the SVG logos with Playwright (Chromium).
// Usage: node tools/render_png.js   (run tools/make_logo.py first)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BRAND = path.join(__dirname, '..', 'src', 'assets', 'brand');
const svg = (f) => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(BRAND, f)).toString('base64');

const jobs = [
  // name, width, height, html body
  ['favicon-32.png', 32, 32, `<img src="${svg('logo-mark.svg')}" style="width:32px;height:32px">`],
  ['icon-192.png', 192, 192, `<img src="${svg('logo-mark.svg')}" style="width:192px;height:192px">`],
  ['icon-512.png', 512, 512, `<img src="${svg('logo-mark.svg')}" style="width:512px;height:512px">`],
  ['apple-touch-icon.png', 180, 180, `<div style="width:180px;height:180px;background:#fff;display:grid;place-items:center"><img src="${svg('logo-mark.svg')}" style="width:150px;height:150px"></div>`],
  ['logo.png', 1200, 0, `<img src="${svg('logo.svg')}" style="width:1200px;display:block">`],
  ['logo-stacked.png', 880, 880, `<img src="${svg('logo-stacked.svg')}" style="width:880px;height:880px;display:block">`],
  ['og-image.png', 1200, 630, `
    <div style="width:1200px;height:630px;position:relative;overflow:hidden;background:#F7F9F9;font-family:system-ui">
      <div style="position:absolute;width:760px;height:760px;left:-220px;top:-320px;border-radius:50%;background:radial-gradient(circle,#7FE3D6,transparent 66%);filter:blur(30px);opacity:.75"></div>
      <div style="position:absolute;width:700px;height:700px;right:-240px;bottom:-330px;border-radius:50%;background:radial-gradient(circle,#FFB59F,transparent 66%);filter:blur(30px);opacity:.75"></div>
      <div style="position:absolute;left:90px;top:96px"><img src="${svg('logo.svg')}" style="height:96px"></div>
      <div style="position:absolute;left:90px;top:262px;width:980px;font:600 72px/1.02 'Geist',system-ui;letter-spacing:-0.045em;color:#0E1B22">AI that works the way<br>your <span style="color:#0D7270">team</span> does.</div>
      <div style="position:absolute;left:90px;bottom:70px;font:400 28px system-ui;color:#56656E">AI agents · Automation · Web &amp; mobile apps · Data</div>
    </div>`],
];

(async () => {
  const b = await chromium.launch();
  for (const [name, w, h, body] of jobs) {
    const p = await b.newPage({ viewport: { width: w, height: h || 300 }, deviceScaleFactor: 1 });
    await p.setContent(`<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@600&display=swap"><style>html,body{margin:0;background:transparent}</style></head><body>${body}</body></html>`);
    await p.waitForTimeout(600);
    const el = await p.$('body > *');
    await el.screenshot({ path: path.join(BRAND, name), omitBackground: true });
    await p.close();
    console.log('rendered', name);
  }
  await b.close();
})();
