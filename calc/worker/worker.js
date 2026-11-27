// Cloudflare Worker: принимает заявку с калькулятора и пересылает её в Telegram.
// Секреты: TELEGRAM_TOKEN, TELEGRAM_CHAT_ID (можно несколько через запятую).
// Переменная: ALLOWED_ORIGINS — сайты клиента через запятую (пусто = любой).

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function cors(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const allow = allowed.length === 0 ? "*" : allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });

function buildMessage(d) {
  const lines = [`<b>🔔 Новая заявка: ${esc(d.title || d.niche || "калькулятор")}</b>`, ""];
  if (d.total != null) lines.push(`<b>Итог:</b> ${esc(Number(d.total).toLocaleString("ru-RU"))} ${esc(d.currency || "")}`);
  if (Array.isArray(d.items) && d.items.length) {
    lines.push("", "<b>Параметры:</b>");
    for (const it of d.items.slice(0, 30)) lines.push(`• ${esc(it.label)}: ${esc(it.value)}`);
  }
  lines.push("", `<b>Имя:</b> ${esc(d.name || "—")}`, `<b>Телефон:</b> ${esc(d.phone)}`);
  if (d.comment) lines.push(`<b>Комментарий:</b> ${esc(d.comment)}`);
  if (d.page) lines.push("", `<i>${esc(d.page)}</i>`);
  return lines.join("\n").slice(0, 4000);
}

export default {
  async fetch(request, env) {
    const headers = cors(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405, headers);

    let d;
    try { d = await request.json(); } catch { return json({ ok: false, error: "bad json" }, 400, headers); }

    if (d.website) return json({ ok: true }, 200, headers); // honeypot: бот заполнил скрытое поле
    const digits = String(d.phone || "").replace(/\D/g, "");
    if (digits.length < 9) return json({ ok: false, error: "phone" }, 400, headers);
    if (!env.TELEGRAM_TOKEN || !env.TELEGRAM_CHAT_ID) return json({ ok: false, error: "not configured" }, 500, headers);

    const text = buildMessage(d);
    const chats = String(env.TELEGRAM_CHAT_ID).split(",").map((s) => s.trim()).filter(Boolean);
    const results = await Promise.all(chats.map((chat_id) =>
      fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text, parse_mode: "HTML", disable_web_page_preview: true })
      }).then((r) => r.ok).catch(() => false)
    ));
    return results.some(Boolean) ? json({ ok: true }, 200, headers) : json({ ok: false, error: "telegram" }, 502, headers);
  }
};
