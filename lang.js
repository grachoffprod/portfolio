// RU/EN switch: elements with data-ru/data-en use the selected language.
(function () {
  var lang = localStorage.getItem('lang') || 'en';
  function apply() {
    document.querySelectorAll('[data-ru]').forEach(function (el) {
      var value = el.getAttribute('data-' + lang);
      if (value === null) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = value;
      else el.textContent = value;
    });
    document.querySelectorAll('.demo-toggle').forEach(function (button) {
      if (button.dataset.open === 'true') button.textContent = lang === 'ru' ? 'Скрыть демо' : 'Hide demo';
    });
    document.documentElement.lang = lang;
    var button = document.getElementById('lang');
    if (button) button.textContent = lang === 'ru' ? 'EN' : 'RU';
    document.dispatchEvent(new Event('langchange'));
  }
  window.currentLang = function () { return lang; };

  document.addEventListener('click', function (event) {
    var target = event.target;
    if (target.id === 'lang') {
      lang = lang === 'ru' ? 'en' : 'ru';
      localStorage.setItem('lang', lang);
      apply();
      return;
    }
    var toggle = target.closest && target.closest('.demo-toggle');
    if (toggle) {
      var service = toggle.closest('.service');
      var panel = document.getElementById(toggle.getAttribute('aria-controls'));
      var opening = panel.hidden;
      document.querySelectorAll('.service .demo-panel').forEach(function (other) {
        other.hidden = true;
        var otherButton = other.closest('.service').querySelector('.demo-toggle');
        otherButton.setAttribute('aria-expanded', 'false');
        otherButton.dataset.open = 'false';
      });
      if (opening) {
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.textContent = lang === 'ru' ? 'Скрыть демо' : 'Hide demo';
        toggle.dataset.open = 'true';
      } else {
        toggle.dataset.open = 'false';
      }
      document.querySelectorAll('.demo-toggle').forEach(function (button) {
        if (button.dataset.open !== 'true') button.textContent = lang === 'ru' ? 'Демо' : 'Demo';
      });
      if (service && opening) service.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
      return;
    }
    var choice = target.closest && target.closest('[data-choice]');
    if (choice) handleChatChoice(choice);
  });

  function handleChatChoice(button) {
    var chat = button.closest('.chat');
    var messages = chat.querySelector('.chat-messages, .messages');
    var stage = chat.dataset.stage || 'service';
    var value = button.getAttribute('data-' + lang);
    var user = document.createElement('p');
    user.className = 'bubble user-message';
    user.textContent = value;
    messages.insertBefore(user, messages.querySelector('.chat-actions'));
    var actions = messages.querySelector('.chat-actions, .actions');
    var prompt = document.createElement('p');
    prompt.className = 'bubble bot-message';
    actions.replaceChildren();
    if (stage === 'service') {
      chat.dataset.service = value;
      chat.dataset.stage = 'date';
      prompt.textContent = lang === 'ru' ? 'Выберите дату:' : 'Choose a date:';
      addChoices(actions, 'date', ['Tomorrow', 'Friday']);
    } else if (stage === 'date') {
      chat.dataset.date = value;
      chat.dataset.stage = 'time';
      prompt.textContent = lang === 'ru' ? 'Удобное время?' : 'What time works for you?';
      addChoices(actions, 'time', ['10:00', '14:30', '17:00']);
    } else {
      chat.dataset.stage = 'done';
      prompt.textContent = lang === 'ru'
        ? 'Готово! Записал: ' + chat.dataset.service + ', ' + chat.dataset.date + ' в ' + value + '. Это локальная демо-симуляция.'
        : 'Booked! ' + chat.dataset.service + ', ' + chat.dataset.date + ' at ' + value + '. This is an offline demo.';
      actions.innerHTML = '<button type="button" data-chat-reset>' + (lang === 'ru' ? 'Начать заново' : 'Start again') + '</button>';
    }
    messages.insertBefore(prompt, actions);
    messages.scrollTop = messages.scrollHeight;
  }
  function addChoices(container, type, labels) {
    labels.forEach(function (label) {
      var button = document.createElement('button');
      button.type = 'button';
      button.dataset.choice = type;
      button.setAttribute('data-en', label);
      var russian = type === 'date' ? (label === 'Tomorrow' ? 'Завтра' : 'Пятница') : label;
      button.setAttribute('data-ru', russian);
      button.textContent = lang === 'ru' ? russian : label;
      container.appendChild(button);
    });
  }
  document.addEventListener('click', function (event) {
    if (!event.target.matches('[data-chat-reset]')) return;
    var chat = event.target.closest('.chat');
    chat.dataset.stage = 'service';
    delete chat.dataset.service;
    delete chat.dataset.date;
    var messages = chat.querySelector('.chat-messages, .messages');
    var actionClass = chat.querySelector('.chat-actions, .actions').className;
    messages.innerHTML = '<p class="bubble bot-message" data-ru="Привет! Что хотите забронировать?" data-en="Hi! What would you like to book?">' + (lang === 'ru' ? 'Привет! Что хотите забронировать?' : 'Hi! What would you like to book?') + '</p><div class="' + actionClass + '"><button data-choice="service" data-ru="Стрижка" data-en="Haircut">' + (lang === 'ru' ? 'Стрижка' : 'Haircut') + '</button><button data-choice="service" data-ru="Консультация" data-en="Consultation">' + (lang === 'ru' ? 'Консультация' : 'Consultation') + '</button></div>';
  });

  document.querySelectorAll('[data-compare]').forEach(function (compare) {
    var range = compare.querySelector('input[type="range"]');
    range.addEventListener('input', function () { compare.style.setProperty('--split', range.value + '%'); });
    compare.style.setProperty('--split', range.value + '%');
  });
  document.querySelectorAll('.automation-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var area = form.parentElement.querySelector('.sheet-wrap');
      var row = document.createElement('tr');
      [data.get('name'), data.get('phone')].forEach(function (value) {
        var cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
      });
      area.querySelector('tbody').prepend(row);
      area.hidden = false;
      area.querySelector('.telegram-notice').textContent = lang === 'ru'
        ? 'Telegram · Новая заявка: ' + data.get('name') + ' (' + data.get('phone') + ')'
        : 'Telegram · New request: ' + data.get('name') + ' (' + data.get('phone') + ')';
      form.reset();
    });
  });

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('visible'); });

  var hero = document.querySelector('.hero');
  if (hero && !reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (event) {
      var rect = hero.getBoundingClientRect();
      hero.style.setProperty('--glow-x', (event.clientX - rect.left) + 'px');
      hero.style.setProperty('--glow-y', (event.clientY - rect.top) + 'px');
    });
    document.querySelectorAll('.service.card').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - .5;
        var y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 2.5) + 'deg) rotateY(' + (x * 2.5) + 'deg) translateY(-2px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }
  apply();
})();
