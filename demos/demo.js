// Tiny scenario engine for demos (chat helpers optional): typing, messages, quick replies,
// push notifications and a step tracker. Autoplay by default, "try it" mode waits for clicks.
(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function T(key, vars) { return window.t ? window.t(key, vars) : key; }
  function Cancel() {}

  window.ChatDemo = function (opts) {
    var msgs = document.querySelector(opts.msgs);
    var replies = document.querySelector(opts.replies);
    var status = document.querySelector(opts.status);
    var push = document.querySelector(opts.push);
    var steps = Array.prototype.slice.call(document.querySelectorAll(opts.steps + ' li'));
    var playBtn = document.querySelector(opts.play);
    var tryBtn = document.querySelector(opts.try);
    var run = 0, manual = false, started = false;

    function guard(id) { if (id !== run) throw new Cancel(); }
    function sleep(ms, id) {
      return new Promise(function (res, rej) {
        setTimeout(function () { id !== run ? rej(new Cancel()) : res(); }, reduced ? Math.min(ms, 120) : ms);
      });
    }
    function scroll() { if (msgs) msgs.scrollTop = msgs.scrollHeight; }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function clock() { var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }

    function api(id) {
      return {
        wait: function (ms) { return sleep(ms, id); },
        step: function (i) {
          guard(id);
          steps.forEach(function (li, n) { li.classList.toggle('done', n < i); li.classList.toggle('now', n === i); });
          var cap = document.getElementById('nowcap');
          if (cap && steps[i]) {
            cap.innerHTML = '<span class="k">' + (i + 1) + '</span><div>' + steps[i].querySelector('div').innerHTML + '</div>';
            cap.classList.remove('flip'); void cap.offsetWidth; cap.classList.add('flip');
          }
        },
        bot: function (html, typing) {
          guard(id);
          var d = el('div', 'dots', '<i></i><i></i><i></i>');
          msgs.appendChild(d); scroll();
          if (status) { status.textContent = T('typing'); status.classList.add('typing'); }
          return sleep(typing || 900, id).then(function () {
            d.remove();
            if (status) { status.textContent = T('online'); status.classList.remove('typing'); }
            var m = el('div', 'msg bot', html + '<span class="meta">' + clock() + '</span>');
            msgs.appendChild(m); scroll();
            return sleep(350, id);
          }, function (e) { d.remove(); throw e; });
        },
        card: function (title, rows) {
          guard(id);
          var body = rows.map(function (r) { return '<div><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></div>'; }).join('');
          var m = el('div', 'msg bot card', '<div class="card-top"><i class="ok">✓</i>' + esc(title) + '</div><div class="card-rows">' + body + '</div>');
          msgs.appendChild(m); scroll();
          return sleep(500, id);
        },
        me: function (text) {
          guard(id);
          msgs.appendChild(el('div', 'msg me', esc(text) + '<span class="meta">' + clock() + ' ✓✓</span>')); scroll();
          return sleep(450, id);
        },
        // options: [{id, label}], pick: id chosen in autoplay
        ask: function (options, pick, echo) {
          guard(id);
          replies.innerHTML = '';
          var buttons = options.map(function (o, i) {
            var b = el('button', 'reply'); b.type = 'button'; b.textContent = o.label;
            b.style.animationDelay = i * 60 + 'ms'; b.dataset.id = o.id;
            replies.appendChild(b); return b;
          });
          return new Promise(function (res, rej) {
            var done = false;
            function choose(b) {
              if (done) return; done = true;
              b.classList.add('tap');
              buttons.forEach(function (x) { x.disabled = true; });
              setTimeout(function () {
                if (id !== run) return rej(new Cancel());
                replies.innerHTML = '';
                var o = options.filter(function (x) { return x.id === b.dataset.id; })[0];
                res(o);
              }, 260);
            }
            buttons.forEach(function (b) { b.addEventListener('click', function () { choose(b); }); });
            if (!manual) {
              sleep(1400, id).then(function () {
                var b = buttons.filter(function (x) { return x.dataset.id === pick; })[0] || buttons[0];
                choose(b);
              }, rej);
            }
          }).then(function (o) { return this.me(echo || o.label).then(function () { return o; }); }.bind(this));
        },
        push: function (title, text, ms) {
          guard(id);
          push.querySelector('b').textContent = title;
          push.querySelector('p').textContent = text;
          push.classList.add('on');
          return sleep(ms || 2600, id).then(function () { push.classList.remove('on'); return sleep(400, id); });
        }
      };
    }

    function reset() {
      if (msgs) msgs.innerHTML = '';
      if (replies) replies.innerHTML = '';
      if (push) push.classList.remove('on');
      steps.forEach(function (li) { li.classList.remove('done', 'now'); });
      var cap = document.getElementById('nowcap'); if (cap) cap.innerHTML = '';
      if (status) { status.textContent = T('online'); status.classList.remove('typing'); }
      if (opts.reset) opts.reset();
    }
    function start() {
      started = true;
      var id = ++run;
      reset();
      opts.script(api(id)).then(function () {
        steps.forEach(function (li) { li.classList.add('done'); li.classList.remove('now'); });
      }, function (e) { if (!(e instanceof Cancel)) throw e; });
    }

    playBtn.addEventListener('click', function () { manual = false; if (tryBtn) tryBtn.setAttribute('aria-pressed', 'false'); start(); });
    if (tryBtn && tryBtn !== playBtn) tryBtn.addEventListener('click', function () { manual = true; tryBtn.setAttribute('aria-pressed', 'true'); start(); });
    document.addEventListener('langchange', function () { if (started) start(); });

    // Autoplay once the phone is on screen.
    var phone = document.querySelector(opts.phone || '.phone');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !started) { start(); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(phone);
    } else start();
  };
})();
