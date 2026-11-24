// RU/EN switch: every element with data-ru / data-en gets its text from the chosen language.
(function () {
  var lang = localStorage.getItem('lang') || (navigator.language.startsWith('ru') ? 'ru' : 'en');
  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ru]').forEach(function (el) {
      var t = el.getAttribute('data-' + lang);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t;
      else el.textContent = t;
    });
    var b = document.getElementById('lang');
    if (b) b.textContent = lang === 'ru' ? 'EN' : 'RU';
    document.dispatchEvent(new Event('langchange'));
  }
  window.currentLang = function () { return lang; };
  document.addEventListener('click', function (e) {
    if (e.target.id === 'lang') { lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('lang', lang); apply(); }
  });
  apply();
})();
