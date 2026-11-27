(function () {
  const S = Object.assign({ preset: "ceilings", endpoint: "", demo: true, currency: "" }, window.CALC_SETTINGS || {});
  const P = window.CALC_PRESETS, CUR = window.CALC_CURRENCIES, LANG_CUR = window.CALC_LANG_CURRENCY;
  const T = (k) => (window.t ? window.t(k) : k);
  const lang = () => (window.currentLang ? window.currentLang() : "en");
  const qs = new URLSearchParams(location.search);
  let key = P[qs.get("niche")] ? qs.get("niche") : S.preset;
  let cfg, state, shown = 0, sent = false;

  const $ = (s, r = document) => r.querySelector(s);
  const root = $("#calc");

  // Валюта: жёстко из настроек клиента, иначе по языку (RU → ₽, UA → ₴, остальные → $).
  const curCode = () => S.currency || LANG_CUR[lang()] || "USD";

  function money(n) {
    const code = curCode(), l = lang();
    const num = Math.round(n).toLocaleString(l === "en" || l === "ar" ? "en-US" : l === "zh" ? "zh-CN" : l).replace(/ | /g, " ");
    if (code === "RUB") return num + " ₽";
    if (code === "UAH") return num + " ₴";
    if (l === "en") return "$" + num;
    if (l === "zh") return num + " 美元";
    return num + " $";
  }

  function init(k, keep) {
    key = k; cfg = P[k];
    if (!keep) {
      state = {};
      for (const f of cfg.fields) {
        state[f.id] = f.type === "number" ? f.default ?? f.min ?? 0 : f.type === "select" ? 0 : !!f.default;
      }
    }
    document.documentElement.style.setProperty("--accent", cfg.accent || "#2f6fed");
    render();
  }

  // Итог в базовой валюте (USD) → валюта языка, с округлением.
  function compute() {
    let sum = 0, mult = 1;
    const val = (id) => Number(state[id]) || 0;
    for (const f of cfg.fields) {
      const unit = f.perUnit ? val(f.perUnit) : 1;
      if (f.type === "number") {
        if (f.mult) mult *= val(f.id);
        else if (f.price) sum += val(f.id) * f.price * unit;
      } else if (f.type === "select") {
        const o = f.options[state[f.id]];
        if (o.price) sum += o.price * unit;
        if (o.mult) mult *= o.mult;
      } else if (f.type === "checkbox" && state[f.id]) {
        sum += f.price * unit;
      }
    }
    const c = CUR[curCode()] || CUR.USD;
    const total = Math.max(sum * mult, cfg.minTotal || 0) * c.rate;
    return Math.round(total / c.round) * c.round;
  }

  function summary() {
    return cfg.fields.map((f) => {
      if (f.type === "number") return { label: T(f.label), value: `${state[f.id]} ${f.unit ? T(f.unit) : ""}`.trim() };
      if (f.type === "select") return { label: T(f.label), value: T(f.options[state[f.id]].label) };
      return state[f.id] ? { label: T(f.label), value: T("yes") } : null;
    }).filter(Boolean);
  }

  function fieldHTML(f) {
    if (f.type === "number") return `
      <div class="field">
        <label for="f-${f.id}">${T(f.label)}</label>
        <div class="num">
          <input type="range" id="r-${f.id}" min="${f.min}" max="${f.max}" step="${f.step || 1}" value="${state[f.id]}" data-id="${f.id}" aria-label="${T(f.label)}">
          <div class="num-box">
            <button type="button" class="step" data-id="${f.id}" data-d="-1" aria-label="${T("less")}">−</button>
            <input type="number" id="f-${f.id}" min="${f.min}" max="${f.max}" step="${f.step || 1}" value="${state[f.id]}" data-id="${f.id}" inputmode="numeric">
            <span class="unit">${f.unit ? T(f.unit) : ""}</span>
            <button type="button" class="step" data-id="${f.id}" data-d="1" aria-label="${T("more")}">+</button>
          </div>
        </div>
      </div>`;
    if (f.type === "select") return `
      <div class="field">
        <span class="lbl">${T(f.label)}</span>
        <div class="chips" role="radiogroup" aria-label="${T(f.label)}">
          ${f.options.map((o, i) => `<button type="button" role="radio" aria-checked="${i === state[f.id]}" class="chip${i === state[f.id] ? " on" : ""}" data-id="${f.id}" data-i="${i}">${T(o.label)}</button>`).join("")}
        </div>
      </div>`;
    return `
      <label class="check">
        <input type="checkbox" data-id="${f.id}" ${state[f.id] ? "checked" : ""}>
        <span class="box"></span><span>${T(f.label)}</span>
      </label>`;
  }

  function render() {
    document.title = T("pageTitle");
    const tabs = S.demo ? `<nav class="tabs">${Object.entries(P).map(([k, p]) =>
      `<button type="button" class="tab${k === key ? " on" : ""}" data-k="${k}">${T(p.tab)}</button>`).join("")}</nav>` : "";
    const checks = cfg.fields.filter((f) => f.type === "checkbox");
    root.innerHTML = `${tabs}
      <header class="head"><h1>${T(cfg.title)}</h1><p>${T(cfg.subtitle)}</p></header>
      <div class="grid">
        <section class="fields">
          ${cfg.fields.filter((f) => f.type !== "checkbox").map(fieldHTML).join("")}
          ${checks.length ? `<div class="field"><span class="lbl">${T("extra")}</span><div class="checks">${checks.map(fieldHTML).join("")}</div></div>` : ""}
        </section>
        <aside class="side">
          <div class="total-card">
            <span class="t-lbl">${T("estimate")}</span>
            <div class="total" id="total" aria-live="polite">0</div>
            <p class="note">${T(cfg.note)}</p>
          </div>
          <form class="lead" novalidate>${sent ? doneHTML() : `
            <input type="text" name="name" placeholder="${T("name")}" aria-label="${T("name")}" autocomplete="name">
            <input type="tel" name="phone" placeholder="${T("phone")}" aria-label="${T("phone")}" autocomplete="tel" required dir="ltr">
            <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            <button type="submit" class="cta">${T(cfg.cta)}</button>
            <p class="msg" role="status"></p>`}
          </form>
        </aside>
      </div>`;
    shown = 0; update();
  }

  const doneHTML = () => `<div class="done"><div class="ok">✓</div><b>${T("sent")}</b><p>${T("sentNote")}</p>${S.endpoint ? "" : `<p class="demo">${T("demoNote")}</p>`}</div>`;

  function update() {
    const target = compute(), el = $("#total"), from = shown, t0 = performance.now();
    shown = target;
    clearTimeout(update.t);
    update.t = setTimeout(() => { el.textContent = money(target); }, 400); // если анимация не отработала
    if (document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = money(target); return; }
    const tick = (t) => {
      if (shown !== target) return;
      const k = Math.min(1, (t - t0) / 350), e = 1 - Math.pow(1 - k, 3);
      el.textContent = money(from + (target - from) * e);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function setNum(id, v) {
    const f = cfg.fields.find((x) => x.id === id);
    v = Math.min(f.max, Math.max(f.min, Number(v) || 0));
    state[id] = v;
    $(`#f-${id}`).value = v; $(`#r-${id}`).value = v;
    update();
  }

  root.addEventListener("input", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    if (e.target.type === "checkbox") { state[id] = e.target.checked; update(); }
    else if (e.target.type === "range") setNum(id, e.target.value);
    else if (e.target.type === "number" && e.target.value !== "") setNum(id, e.target.value);
  });
  root.addEventListener("change", (e) => { if (e.target.type === "number") setNum(e.target.dataset.id, e.target.value); });

  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.classList.contains("tab")) { sent = false; return init(b.dataset.k); }
    if (b.classList.contains("step")) {
      const f = cfg.fields.find((x) => x.id === b.dataset.id);
      return setNum(f.id, state[f.id] + (f.step || 1) * Number(b.dataset.d));
    }
    if (b.classList.contains("chip")) {
      state[b.dataset.id] = Number(b.dataset.i);
      b.parentElement.querySelectorAll(".chip").forEach((c, i) => {
        c.classList.toggle("on", i === state[b.dataset.id]);
        c.setAttribute("aria-checked", i === state[b.dataset.id]);
      });
      update();
    }
  });

  root.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target, msg = $(".msg", form), btn = $(".cta", form);
    const phone = form.phone.value.trim();
    if (phone.replace(/\D/g, "").length < 9) {
      msg.className = "msg err"; msg.textContent = T("phoneErr");
      form.phone.focus(); return;
    }
    const payload = {
      niche: key, title: T(cfg.tab), total: compute(), currency: curCode(), lang: lang(), items: summary(),
      name: form.name.value.trim(), phone, website: form.website.value, page: location.href
    };
    btn.disabled = true; msg.className = "msg"; msg.textContent = T("sending");
    try {
      if (!S.endpoint) {
        console.log("Demo request:", payload);
        await new Promise((r) => setTimeout(r, 500));
      } else {
        const r = await fetch(S.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error(r.status);
      }
      sent = true;
      form.innerHTML = doneHTML();
    } catch {
      btn.disabled = false; msg.className = "msg err"; msg.textContent = T("sendErr");
    }
  });

  // Смена языка в шапке → перевод и валюта меняются сразу, выбранные параметры сохраняются.
  document.addEventListener("langchange", () => { if (cfg) init(key, true); });

  init(key);
})();
