// RU/EN switch: every element with data-ru / data-en gets its text from the chosen language.
(function () {
  var lang = localStorage.getItem('lang') || 'en';
  function apply() {
    document.querySelectorAll('[data-ru]').forEach(function (el) {
      var t = el.getAttribute('data-' + lang);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t;
      else el.textContent = t;
    });
    document.documentElement.lang = lang;
    var b = document.getElementById('lang');
    if (b) b.textContent = lang === 'ru' ? 'EN' : 'RU';
    document.dispatchEvent(new Event('langchange'));
  }
  window.currentLang = function () { return lang; };
  document.addEventListener('click', function (e) {
    if (e.target.id === 'lang') { lang = lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('lang', lang); apply(); }
  });
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }
  var hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var rect = hero.getBoundingClientRect();
      hero.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px');
      hero.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px');
    });
  }
  apply();
})();
