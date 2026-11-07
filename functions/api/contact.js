// Cloudflare Pages Function: POST /api/contact
// Stores each request in KV (binding CONTACTS) and, if configured, emails it via Resend.
// Configure in Cloudflare: Pages project > Settings > Bindings (KV namespace "CONTACTS")
// and optional variables RESEND_API_KEY, CONTACT_TO (your inbox), CONTACT_FROM (verified sender).
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const clean = (v, max) => String(v || '').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  let d = {};
  const type = request.headers.get('Content-Type') || '';
  try {
    d = type.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
  } catch { return json({ ok: false, error: 'Invalid request' }, 400); }

  if (d['company-website']) return json({ ok: true });            // honeypot: silently accept bots
  const entry = {
    name: clean(d.name, 120), email: clean(d.email, 200), company: clean(d.company, 160),
    topic: clean(d.topic, 80), message: clean(d.message, 5000),
    at: new Date().toISOString(), ip: request.headers.get('CF-Connecting-IP') || '',
  };
  if (!entry.name) return json({ ok: false, error: 'Please add your name.' }, 400);
  if (!/^\S+@\S+\.\S+$/.test(entry.email)) return json({ ok: false, error: 'Please enter a valid email.' }, 400);

  let stored = false, mailed = false;
  if (env.CONTACTS) { await env.CONTACTS.put(`contact:${entry.at}:${crypto.randomUUID()}`, JSON.stringify(entry)); stored = true; }
  if (env.RESEND_API_KEY && env.CONTACT_TO) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM || 'SDA Website <onboarding@resend.dev>', to: [env.CONTACT_TO], reply_to: entry.email,
        subject: `New request: ${entry.topic || 'Website'} – ${entry.name}`,
        text: `Name: ${entry.name}\nEmail: ${entry.email}\nCompany: ${entry.company}\nTopic: ${entry.topic}\n\n${entry.message}`,
      }),
    });
    mailed = r.ok;
  }
  if (!stored && !mailed) return json({ ok: false, error: 'The contact form is not configured yet.' }, 503);
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: 'Use POST' }, 405);
