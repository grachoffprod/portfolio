// RU/EN copy with automatic browser-language translation for other languages.
(function () {
  var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
  var detected = String(languages[0] || 'en').toLowerCase().split(/[-_]/)[0];
  if (!/^[a-z]{2,3}$/.test(detected)) detected = 'en';
  var saved = localStorage.getItem('lang');
  var lang = saved || detected;
  var translated = lang !== 'ru' && lang !== 'en';

  function cookie(name, value, domain) {
    document.cookie = name + '=' + value + ';path=/' + (domain ? ';domain=' + domain : '') + ';max-age=' + (value ? 31536000 : 0) + ';SameSite=Lax';
  }
  function clearTranslateCookie() {
    var host = location.hostname;
    cookie('googtrans', '', '');
    if (host && host.indexOf('.') !== -1 && !/^\d+(\.\d+){3}$/.test(host) && host !== 'localhost') {
      var labels = host.split('.');
      for (var i = 0; i < labels.length - 1; i++) {
        var domain = labels.slice(i).join('.');
        cookie('googtrans', '', domain);
        cookie('googtrans', '', '.' + domain);
      }
    }
  }
  function setTranslateCookie(code) {
    cookie('googtrans', '/en/' + code, '');
  }
  function apply() {
    document.querySelectorAll('[data-ru]').forEach(function (el) {
      var value = el.getAttribute('data-' + (lang === 'ru' ? 'ru' : 'en'));
      if (value === null) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = value;
      else el.textContent = value;
    });
    document.documentElement.lang = lang;
    var selector = document.getElementById('lang');
    if (selector) selector.value = lang;
    document.dispatchEvent(new Event('langchange'));
  }
  var translateStyles = document.createElement('style');
  translateStyles.textContent = '.goog-te-banner-frame,.skiptranslate iframe,#goog-gt-tt{display:none!important}body{top:0!important}#google_translate_element{position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden}';
  document.head.appendChild(translateStyles);
  function initGoogleTranslate() {
    if (!window.google || !google.translate) return;
    new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
  }
  function addGoogleTranslate() {
    setTranslateCookie(lang);
    var container = document.createElement('div');
    container.id = 'google_translate_element';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
    window.googleTranslateElementInit = initGoogleTranslate;
    var script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }
  function choose(next) {
    if (next !== 'ru' && next !== 'en' && next !== detected && next !== lang) return;
    var wasTranslated = translated || document.cookie.indexOf('googtrans=') !== -1;
    lang = next;
    translated = next !== 'ru' && next !== 'en';
    localStorage.setItem('lang', lang);
    if (translated) {
      setTranslateCookie(lang);
      location.reload();
      return;
    }
    clearTranslateCookie();
    if (wasTranslated) { location.reload(); return; }
    apply();
  }

  var oldButton = document.getElementById('lang');
  if (oldButton && oldButton.tagName !== 'SELECT') {
    var selector = document.createElement('select');
    selector.id = 'lang';
    selector.className = 'notranslate';
    selector.setAttribute('translate', 'no');
    selector.setAttribute('aria-label', 'Select language');
    var options = [['ru', 'RU'], ['en', 'EN']];
    if (detected !== 'ru' && detected !== 'en') options.push([detected, detected.toUpperCase()]);
    if (lang !== 'ru' && lang !== 'en' && lang !== detected) options.push([lang, lang.toUpperCase()]);
    options.forEach(function (option) {
      var item = document.createElement('option');
      item.value = option[0];
      item.textContent = option[1];
      selector.appendChild(item);
    });
    oldButton.replaceWith(selector);
    selector.addEventListener('change', function () { choose(selector.value); });
  }

  window.currentLang = function () { return lang; };
  window.setLang = choose;
  window.addEventListener('storage', function (event) {
    if (event.key === 'lang' && event.newValue && event.newValue !== lang) location.reload();
  });
  if (translated) addGoogleTranslate();
  else clearTranslateCookie();
  apply();
})();
