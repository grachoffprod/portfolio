// Main page interactions: demo stage, card animations, counters, reveal, cursor glow.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var stage = document.getElementById('stage');
  var frame = document.getElementById('stage-frame');
  var openLink = document.getElementById('stage-open');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.service'));
  var current = null;

  function cardTitle(card) { return card.querySelector('h3').textContent; }

  function openDemo(card) {
    var name = card.dataset.demo;
    if (current === card) { closeDemo(); return; }
    cards.forEach(function (c) { c.classList.toggle('active', c === card); c.classList.toggle('dim', c !== card); });
    current = card;
    var url = 'demos/' + name + '/';
    document.getElementById('stage-num').textContent = card.querySelector('.num').textContent;
    document.getElementById('stage-name').textContent = cardTitle(card);
    openLink.href = url;
    stage.classList.remove('loaded');
    // Swap animation when switching between demos while the stage is already open.
    if (stage.classList.contains('open') && !reduced) {
      stage.classList.add('swap');
      setTimeout(function () { frame.src = url; stage.classList.remove('swap'); }, 220);
    } else frame.src = url;
    stage.classList.add('open');
    card.classList.add('pulse');
    setTimeout(function () { card.classList.remove('pulse'); }, 600);
    setTimeout(function () { stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }, reduced ? 0 : 280);
  }
  function closeDemo() {
    stage.classList.remove('open');
    cards.forEach(function (c) { c.classList.remove('active', 'dim'); });
    if (current) current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    current = null;
    setTimeout(function () { if (!current) frame.removeAttribute('src'); }, 500);
  }
  frame.addEventListener('load', function () { if (frame.getAttribute('src')) stage.classList.add('loaded'); });
  cards.forEach(function (card) {
    card.addEventListener('click', function () { openDemo(card); });
  });
  document.getElementById('stage-close').addEventListener('click', closeDemo);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && current) closeDemo(); });
  document.addEventListener('langchange', function () {
    if (current) document.getElementById('stage-name').textContent = cardTitle(current);
  });

  // Card tilt + spotlight following the pointer.
  if (finePointer && !reduced) {
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', x * 100 + '%');
        card.style.setProperty('--my', y * 100 + '%');
        card.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 6) + 'deg) rotateY(' + ((x - 0.5) * 6) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
    var glow = document.querySelector('.cursor-glow');
    window.addEventListener('pointermove', function (e) {
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      glow.classList.add('on');
    });
  }

  // Mobile carousel: highlight the card in the middle.
  var list = document.querySelector('.services');
  if ('IntersectionObserver' in window) {
    var centerObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('in-view', en.isIntersecting); });
    }, { root: list, threshold: 0.75 });
    cards.forEach(function (c) { centerObs.observe(c); });
  }

  // Count-up numbers.
  function countUp(el) {
    var target = +el.dataset.count, suffix = el.dataset.suffix || '', start = null;
    if (reduced) { el.textContent = target + suffix; return; }
    function step(t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / 1200), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = v + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Reveal on scroll (with staggered cards).
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('visible');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.1 });
    reveals.forEach(function (el) { obs.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('visible'); });
  cards.forEach(function (c, i) { c.style.setProperty('--i', i); });
  document.querySelectorAll('[data-count]').forEach(countUp);
})();
