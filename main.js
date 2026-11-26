// Main page interactions: card tilt, reveal, cursor glow. Cards link straight to demo pages.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.service'));

  // Card tilt + spotlight following the pointer.
  if (finePointer && !reduced) {
    cards.forEach(function (card) {
      var cardFrame = 0;
      var pointer = null;
      card.addEventListener('pointermove', function (e) {
        pointer = { x: e.clientX, y: e.clientY };
        if (cardFrame) return;
        cardFrame = requestAnimationFrame(function () {
          cardFrame = 0;
          var r = card.getBoundingClientRect();
          var x = (pointer.x - r.left) / r.width, y = (pointer.y - r.top) / r.height;
          card.style.setProperty('--mx', x * 100 + '%');
          card.style.setProperty('--my', y * 100 + '%');
          card.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 6) + 'deg) rotateY(' + ((x - 0.5) * 6) + 'deg) translateY(-4px)';
        });
      });
      card.addEventListener('pointerleave', function () {
        if (cardFrame) cancelAnimationFrame(cardFrame);
        cardFrame = 0;
        pointer = null;
        card.style.transform = '';
      });
    });
    var glow = document.querySelector('.cursor-glow');
    if (glow) {
      var glowFrame = 0;
      var glowX = 0, glowY = 0;
      window.addEventListener('pointermove', function (e) {
        glowX = e.clientX;
        glowY = e.clientY;
        if (glowFrame) return;
        glowFrame = requestAnimationFrame(function () {
          glowFrame = 0;
          glow.style.transform = 'translate(' + glowX + 'px,' + glowY + 'px)';
          glow.classList.add('on');
        });
      });
    }
  }

  // Keep the marquee idle outside the viewport and while its page is hidden.
  var marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    var marqueeVisible = true;
    function pauseMarquee() {
      marqueeTrack.classList.toggle('lm-paused', !marqueeVisible || document.hidden);
    }
    if ('IntersectionObserver' in window) {
      var marqueeObserver = new IntersectionObserver(function (entries) {
        marqueeVisible = entries[0].isIntersecting;
        pauseMarquee();
      });
      marqueeObserver.observe(marqueeTrack.closest('.marquee') || marqueeTrack);
    }
    document.addEventListener('visibilitychange', pauseMarquee);
    pauseMarquee();
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
