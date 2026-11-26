// Language follows the visitor's browser: RU/EN from built-in copy, any other via Google Translate.
(function () {
  var languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
  var detected = String(languages[0] || 'en').toLowerCase().split(/[-_]/)[0];
  if (!/^[a-z]{2,3}$/.test(detected)) detected = 'en';
  try { localStorage.removeItem('lang'); } catch (e) {}
  var lang = detected;
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
  window.currentLang = function () { return lang; };
  if (translated) addGoogleTranslate();
  else clearTranslateCookie();
  apply();
})();
