// Built-in translations and language picker.
(function () {
  var LANGS = [
    ['en', 'English'], ['ru', 'Русский'], ['uk', 'Українська'], ['de', 'Deutsch'],
    ['es', 'Español'], ['fr', 'Français'], ['zh', '中文'], ['ar', 'العربية']
  ];
  function label(c) { return c === 'uk' ? 'UA' : c.toUpperCase(); }
  var codes = LANGS.map(function (item) { return item[0]; });
  window.LANGS = LANGS;
  var lang = 'en';
  try {
    var saved = localStorage.getItem('lang');
    if (codes.indexOf(saved) !== -1) lang = saved;
  } catch (e) {}

  function clearTranslateCookie() {
    var host = location.hostname;
    var domains = [''];
    if (host && host.indexOf('.') !== -1 && !/^\d+(\.\d+){3}$/.test(host)) {
      var labels = host.split('.');
      for (var i = 0; i < labels.length - 1; i++) {
        var domain = labels.slice(i).join('.');
        domains.push(domain, '.' + domain);
      }
    }
    domains.forEach(function (domain) {
      document.cookie = 'googtrans=;path=/;max-age=0;SameSite=Lax' + (domain ? ';domain=' + domain : '');
    });
  }
  clearTranslateCookie();

  function translation(key) {
    var dict = window.I18N || {};
    if (dict[lang] && Object.prototype.hasOwnProperty.call(dict[lang], key)) return dict[lang][key];
    if (dict.en && Object.prototype.hasOwnProperty.call(dict.en, key)) return dict.en[key];
    return null;
  }
  function interpolate(value, vars) {
    return String(value).replace(/\{([^{}]+)\}/g, function (match, name) {
      return vars && Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match;
    });
  }
  window.t = function (key, vars) {
    var value = translation(key);
    return value === null ? key : interpolate(value, vars);
  };
  window.currentLang = function () { return lang; };

  var trigger = document.getElementById('lang');
  var panel = null;
  var backdrop = null;
  var options = [];
  var focusedIndex = 0;
  var isOpen = false;

  var menuStyles = document.createElement('style');
  menuStyles.textContent = [
    '.lm-trigger{display:inline-flex;align-items:center;justify-content:center;gap:7px;width:68px;height:36px;padding:0 10px;color:#f5f5f5;background:#141414;border:1px solid #2e2e2e;border-radius:10px;font:700 13px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer;transition:border-color .18s,background .18s}',
    '.lm-trigger:hover,.lm-trigger[aria-expanded="true"]{border-color:#ff2d2d;background:rgba(255,45,45,.14)}',
    '.lm-trigger svg{width:16px;height:16px;flex:none}',
    '.lm-panel{position:fixed;z-index:10001;width:220px;padding:6px;background:#141414;border:1px solid #2e2e2e;border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.5);opacity:0;transform:translateY(-6px) scale(.98);transform-origin:top right;transition:opacity 180ms cubic-bezier(.2,.8,.2,1),transform 180ms cubic-bezier(.2,.8,.2,1)}',
    '[dir="rtl"] .lm-panel{transform-origin:top left}',
    '.lm-panel.lm-open{opacity:1;transform:translateY(0) scale(1)}',
    '.lm-option{display:flex;align-items:center;gap:10px;width:100%;height:42px;padding:0 12px;color:#f5f5f5;background:transparent;border:0;border-radius:9px;text-align:start;font:500 14px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer}',
    '.lm-option:hover,.lm-option:focus-visible{outline:0;background:#222}',
    '.lm-check{width:12px;color:#ff2d2d;font-size:15px;text-align:center}',
    '.lm-name{flex:1}',
    '.lm-code{color:#888;font-size:11px;text-transform:uppercase}',
    '.lm-backdrop{display:none}.lm-panel[hidden],.lm-backdrop[hidden]{display:none!important}',
    '@media(max-width:640px){.lm-backdrop{display:block;position:fixed;z-index:10000;inset:0;background:rgba(0,0,0,.55);opacity:0;transition:opacity 260ms ease}.lm-backdrop.lm-open{opacity:1}.lm-panel{top:auto!important;right:0!important;bottom:0!important;left:0!important;width:100%;padding:10px 18px calc(14px + env(safe-area-inset-bottom));border:0;border-top:1px solid #2e2e2e;border-radius:18px 18px 0 0;box-shadow:0 -14px 40px rgba(0,0,0,.35);opacity:0;transform:translateY(100%);transition:transform 260ms cubic-bezier(.2,.8,.2,1),opacity 260ms ease}.lm-panel.lm-open{opacity:1;transform:translateY(0)}.lm-handle{display:block;width:36px;height:4px;margin:0 auto 12px;border-radius:9px;background:#555}.lm-option{height:52px}}',
    '@media(prefers-reduced-motion:reduce){.lm-panel,.lm-backdrop,.lm-trigger{transition:none!important}}'
  ].join('\n');
  document.head.appendChild(menuStyles);

  if (trigger) {
    var button = document.createElement('button');
    button.id = 'lang';
    button.type = 'button';
    button.className = 'lm-trigger';
    button.setAttribute('aria-label', 'Language');
    button.setAttribute('aria-haspopup', 'listbox');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('translate', 'no');
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"></path></svg><span class="lm-code"></span>';
    trigger.replaceWith(button);
    trigger = button;

    backdrop = document.createElement('div');
    backdrop.className = 'lm-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    panel = document.createElement('div');
    panel.className = 'lm-panel';
    panel.id = 'lm-options';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', 'Language');
    panel.hidden = true;
    panel.innerHTML = '<span class="lm-handle" aria-hidden="true"></span>';
    LANGS.forEach(function (item) {
      var option = document.createElement('button');
      option.type = 'button';
      option.className = 'lm-option';
      option.setAttribute('role', 'option');
      option.setAttribute('data-lang', item[0]);
      option.innerHTML = '<span class="lm-check" aria-hidden="true"></span><span class="lm-name"></span><span class="lm-code"></span>';
      option.querySelector('.lm-name').textContent = item[1];
      option.querySelectorAll('.lm-code')[0].textContent = label(item[0]);
      panel.appendChild(option);
      options.push(option);
      option.addEventListener('click', function () { window.setLang(item[0]); closeMenu(true); });
    });
    document.body.appendChild(backdrop);
    document.body.appendChild(panel);

    function updateMenu() {
      trigger.querySelector('.lm-code').textContent = label(lang);
      options.forEach(function (option) {
        var selected = option.getAttribute('data-lang') === lang;
        option.setAttribute('aria-selected', selected ? 'true' : 'false');
        option.querySelector('.lm-check').textContent = selected ? '✓' : '';
      });
    }
    function positionMenu() {
      if (window.innerWidth <= 640) return;
      var rect = trigger.getBoundingClientRect();
      var rtl = document.documentElement.dir === 'rtl';
      var left = rtl ? rect.left : rect.right - 220;
      left = Math.max(8, Math.min(left, window.innerWidth - 228));
      panel.style.left = left + 'px';
      panel.style.right = 'auto';
      panel.style.top = Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 420)) + 'px';
    }
    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      positionMenu();
      updateMenu();
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      backdrop.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('lm-open'); backdrop.classList.add('lm-open'); });
      focusedIndex = Math.max(0, codes.indexOf(lang));
      options[focusedIndex].focus();
    }
    function closeMenu(returnFocus) {
      if (!isOpen) return;
      isOpen = false;
      trigger.setAttribute('aria-expanded', 'false');
      panel.classList.remove('lm-open');
      backdrop.classList.remove('lm-open');
      window.setTimeout(function () {
        if (!isOpen) { panel.hidden = true; backdrop.hidden = true; }
      }, window.innerWidth <= 640 ? 260 : 180);
      if (returnFocus) trigger.focus();
    }
    trigger.setAttribute('aria-controls', panel.id);
    trigger.addEventListener('click', function () { isOpen ? closeMenu(false) : openMenu(); });
    backdrop.addEventListener('click', function () { closeMenu(true); });
    document.addEventListener('pointerdown', function (event) {
      if (isOpen && !panel.contains(event.target) && !trigger.contains(event.target)) closeMenu(true);
    });
    document.addEventListener('keydown', function (event) {
      if (!isOpen) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        var step = event.key === 'ArrowDown' ? 1 : -1;
        focusedIndex = (focusedIndex + step + options.length) % options.length;
        options[focusedIndex].focus();
      }
    });
    window.addEventListener('resize', positionMenu);
    updateMenu();
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = translation(el.getAttribute('data-i18n'));
      if (value !== null) el.textContent = value;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var value = translation(el.getAttribute('data-i18n-html'));
      if (value !== null) el.innerHTML = value;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (entry) {
        var pair = entry.trim().split(':');
        if (pair.length < 2) return;
        var value = translation(pair.slice(1).join(':').trim());
        if (value !== null) el.setAttribute(pair[0].trim(), value);
      });
    });
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    if (trigger) trigger.querySelector('.lm-code').textContent = label(lang);
    if (panel) options.forEach(function (option) {
      var selected = option.getAttribute('data-lang') === lang;
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
      option.querySelector('.lm-check').textContent = selected ? '✓' : '';
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }
  window.setLang = function (code) {
    if (codes.indexOf(code) === -1 || code === lang) return;
    lang = code;
    try { localStorage.setItem('lang', lang); } catch (e) {}
    apply();
  };
  window.addEventListener('storage', function (event) {
    if (event.key === 'lang' && codes.indexOf(event.newValue) !== -1 && event.newValue !== lang) {
      lang = event.newValue;
      apply();
    }
  });
  apply();
})();
