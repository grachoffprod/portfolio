// Cloudflare Worker (free plan): receives the landing form and forwards it to Telegram.
// Secrets are set in the Cloudflare dashboard, never in this file or on the page:
//   BOT_TOKEN — token from @BotFather, CHAT_ID — your chat id, ALLOWED_ORIGIN — e.g. https://grachoffprod.github.io
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN, 'Access-Control-Allow-Headers': 'Content-Type' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: cors });
    let d;
    try { d = await req.json(); } catch { return new Response('Bad JSON', { status: 400, headers: cors }); }
    const clip = (v) => String(v || '').slice(0, 500);
    if (d.kind === 'order') {
      const orderClip = (v, max) => String(v || '').slice(0, max);
      if (!clip(d.name).trim() || !orderClip(d.task, 1500).trim() || !clip(d.contact).trim())
        return new Response('Invalid', { status: 400, headers: cors });
      const text = `🆕 New order\nService: ${clip(d.service)}\nTask: ${orderClip(d.task, 1500)}\nExamples: ${orderClip(d.examples, 1500)}\nDeadline: ${clip(d.deadline)}\nBudget: ${clip(d.budget)}\nName: ${clip(d.name)}\nContact method: ${clip(d.contact_method)}\nContact: ${clip(d.contact)}\nLanguage: ${clip(d.lang)}\nPage: ${clip(d.page)}`;
      const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.CHAT_ID, text }),
      });
      return new Response(r.ok ? 'ok' : 'telegram error', { status: r.ok ? 200 : 502, headers: cors });
    }
    if (!clip(d.name).trim() || (clip(d.phone).match(/\d/g) || []).length < 7)
      return new Response('Invalid', { status: 400, headers: cors });
    const text = `🆕 New request\nName: ${clip(d.name)}\nPhone: ${clip(d.phone)}\nType: ${clip(d.type)}` +
      (d.comment ? `\nComment: ${clip(d.comment)}` : '');
    const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text }),
    });
    return new Response(r.ok ? 'ok' : 'telegram error', { status: r.ok ? 200 : 502, headers: cors });
  },
};
