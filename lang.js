// Site opens in English. Visitor picks a language in the top-right selector.
// EN/RU use built-in copy; other languages are machine-translated by Google Translate.
(function () {
  var LANGS = [
    ['en', 'English'], ['ru', 'Русский'], ['uk', 'Українська'], ['de', 'Deutsch'],
    ['es', 'Español'], ['fr', 'Français'], ['zh-CN', '中文'], ['ar', 'العربية']
  ];
  var codes = LANGS.map(function (l) { return l[0]; });
  var lang = 'en';
  try { var saved = localStorage.getItem('lang'); if (codes.indexOf(saved) !== -1) lang = saved; } catch (e) {}
  var translated = lang !== 'ru' && lang !== 'en';

  function cookie(name, value, domain) {
    document.cookie = name + '=' + value + ';path=/' + (domain ? ';domain=' + domain : '') + ';max-age=' + (value ? 31536000 : 0) + ';SameSite=Lax';
  }
  function clearTranslateCookie() {
    cookie('googtrans', '', '');
    var host = location.hostname;
    if (host && host.indexOf('.') !== -1 && !/^\d+(\.\d+){3}$/.test(host)) {
      var labels = host.split('.');
      for (var i = 0; i < labels.length - 1; i++) {
        var domain = labels.slice(i).join('.');
        cookie('googtrans', '', domain);
        cookie('googtrans', '', '.' + domain);
      }
    }
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
  function addGoogleTranslate() {
    cookie('googtrans', '/en/' + lang, '');
    var container = document.createElement('div');
    container.id = 'google_translate_element';
    container.setAttribute('aria-hidden', 'true');
    document.body.appendChild(container);
    window.googleTranslateElementInit = function () {
      if (window.google && google.translate) new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
    };
    var script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);
  }
  function choose(next) {
    if (codes.indexOf(next) === -1 || next === lang) return;
    var wasTranslated = translated;
    lang = next;
    translated = next !== 'ru' && next !== 'en';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    if (translated) { cookie('googtrans', '/en/' + lang, ''); location.reload(); return; }
    clearTranslateCookie();
    if (wasTranslated) { location.reload(); return; }
    apply();
  }

  var oldButton = document.getElementById('lang');
  if (oldButton) {
    var selector = document.createElement('select');
    selector.id = 'lang';
    selector.className = 'notranslate';
    selector.setAttribute('translate', 'no');
    selector.setAttribute('aria-label', 'Language');
    LANGS.forEach(function (l) {
      var item = document.createElement('option');
      item.value = l[0];
      item.textContent = l[1];
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
