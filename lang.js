// RU/EN switch shared by all pages: elements with data-ru/data-en get text in the chosen language.
// English by default; the #lang button toggles and the choice is remembered.
(function () {
  var lang = localStorage.getItem('lang') || 'en';
  function apply() {
    document.querySelectorAll('[data-ru]').forEach(function (el) {
      var value = el.getAttribute('data-' + lang);
      if (value === null) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = value;
      else el.textContent = value;
    });
    document.documentElement.lang = lang;
    var button = document.getElementById('lang');
    if (button) button.textContent = lang === 'ru' ? 'EN' : 'RU';
    document.dispatchEvent(new Event('langchange'));
  }
  window.currentLang = function () { return lang; };
  window.setLang = function (next) {
    if (next !== 'ru' && next !== 'en') return;
    lang = next; localStorage.setItem('lang', lang); apply();
  };
  document.addEventListener('click', function (event) {
    if (event.target.id === 'lang') window.setLang(lang === 'ru' ? 'en' : 'ru');
  });
  // Keep every open page (and embedded demos) in the same language.
  window.addEventListener('storage', function (event) {
    if (event.key === 'lang' && event.newValue && event.newValue !== lang) { lang = event.newValue; apply(); }
  });
  apply();
})();
