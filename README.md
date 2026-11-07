# SDA AI Services – website

Static website for SDA AI Services: AI agents, workflow automation, custom web and mobile apps, data management and enterprise integration. It includes six interactive demos that run in the browser.

## Structure

| Path | What it is |
|---|---|
| `build.py` | All page content and templates. Run it to regenerate `site/`. |
| `src/assets/` | Styles (`style.css`), site scripts (`main.js`), demo apps (`demos.js`), logo set (`brand/`), security headers (`../_headers`) |
| `site/` | **The finished website** (16 content pages + legal pages, sitemap, robots, manifest). This is what Cloudflare serves. |
| `functions/api/contact.js` | Cloudflare Pages Function that receives the contact form |
| `tools/` | Logo generator (`make_logo.py`, `render_png.js`) and the Geist font (SIL Open Font License) |

## Edit and rebuild

```bash
python3 build.py
```

Logo (only needed if you change it):

```bash
pip install fonttools brotli && python3 tools/make_logo.py && node tools/render_png.js
```

## Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → choose `HYigit19/sda-ai`.
2. Build settings: **Framework preset** None, **Build command** `python3 build.py` (or leave empty, `site/` is committed), **Build output directory** `site`.
3. **Save and Deploy**. The site goes live at `https://<project>.pages.dev`. Every push to `main` deploys again.

### Contact form

The form posts to `/api/contact` (`functions/api/contact.js`). To receive requests, in the Pages project open **Settings**:

- **Bindings** → add a **KV namespace** binding named `CONTACTS` (stores every request), and/or
- **Variables and secrets** → `RESEND_API_KEY` (secret, from resend.com), `CONTACT_TO` (your inbox), optionally `CONTACT_FROM` (a verified sender address) to get each request by email.

Without either, the form tells visitors to email you directly.

## Before launch

- [ ] Set `EMAIL` in `build.py` to your real address (currently `hello@sda-ai.services`).
- [ ] Set `SITE_URL` in `build.py` to your final domain once it is connected (currently `https://sda-ai.pages.dev`).
- [ ] Fill in every `[bracketed]` value in the privacy policy and legal notice (`privacy()` and `legal()` in `build.py`) and have them reviewed.
- [ ] Configure the contact form (see above).
- [ ] Rebuild with `python3 build.py`, commit and push.
