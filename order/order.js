(function () {
  var CONFIG = {
    WEB3FORMS_KEY: "",
    WORKER_URL: "",
    USDT_ADDRESS: "",
    STRIPE_LINKS: {
      fixes: "",
      landing: "",
      calculator: "",
      bot: "",
      automation: "",
      ai: ""
    }
  };

  function init() {
    var form = document.getElementById('order-form');
    if (!form) return;

    var contact = form.querySelector('[name="contact"]');
    var error = document.getElementById('order-error');
    var button = document.getElementById('order-submit');
    var service = form.querySelector('[name="service"]');
    var done = document.getElementById('order-done');
    var payCard = document.getElementById('pay-card');
    var payCardLater = document.getElementById('pay-card-later');
    var payUsdt = document.getElementById('pay-usdt');
    var usdtAddress = document.getElementById('usdt-address');
    var copyButton = document.getElementById('copy-usdt');

    function translate(key) {
      return window.t ? window.t(key) : key;
    }

    function selectedContactMethod() {
      var selected = form.querySelector('[name="contact_method"]:checked');
      return selected ? selected.value : 'email';
    }

    function updateContact() {
      if (!contact) return;
      var method = selectedContactMethod();
      if (method === 'telegram') {
        contact.type = 'text';
        contact.placeholder = translate('phTelegram');
      } else if (method === 'whatsapp') {
        contact.type = 'tel';
        contact.placeholder = translate('phWhatsapp');
      } else {
        contact.type = 'email';
        contact.placeholder = translate('phEmail');
      }
    }

    function value(name) {
      var field = form.querySelector('[name="' + name + '"]');
      return field ? field.value : '';
    }

    function showError() {
      if (error) {
        error.textContent = translate('sendError');
        error.hidden = false;
        error.removeAttribute('hidden');
      }
      if (button) {
        button.disabled = false;
        button.textContent = translate('submit');
      }
    }

    function sendWeb3Forms(payload) {
      return fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: CONFIG.WEB3FORMS_KEY,
          subject: 'New order: ' + payload.service,
          from_name: 'Portfolio order',
          service: payload.service,
          task: payload.task,
          examples: payload.examples,
          deadline: payload.deadline,
          budget: payload.budget,
          name: payload.name,
          contact_method: payload.contact_method,
          contact: payload.contact,
          lang: payload.lang,
          page: payload.page
        })
      }).then(function (response) {
        return response.json();
      }).then(function (result) {
        return !!(result && result.success === true);
      }).catch(function () {
        return false;
      });
    }

    function sendWorker(payload) {
      return fetch(CONFIG.WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'order',
          service: payload.service,
          task: payload.task,
          examples: payload.examples,
          deadline: payload.deadline,
          budget: payload.budget,
          name: payload.name,
          contact_method: payload.contact_method,
          contact: payload.contact,
          lang: payload.lang,
          page: payload.page
        })
      }).then(function (response) {
        return response.ok;
      }).catch(function () {
        return false;
      });
    }

    function finishSuccess() {
      form.hidden = true;
      form.setAttribute('hidden', '');
      if (done) {
        done.hidden = false;
        done.removeAttribute('hidden');
      }

      var stripe = service && service.value !== 'other' ? CONFIG.STRIPE_LINKS[service.value] : '';
      if (payCard) {
        if (stripe) {
          payCard.href = stripe;
          payCard.hidden = false;
          payCard.removeAttribute('hidden');
          if (payCardLater) payCardLater.hidden = true;
        } else {
          payCard.hidden = true;
          if (payCardLater) {
            payCardLater.hidden = false;
            payCardLater.removeAttribute('hidden');
          }
        }
      }

      if (CONFIG.USDT_ADDRESS) {
        if (usdtAddress) usdtAddress.textContent = CONFIG.USDT_ADDRESS;
        if (payUsdt) {
          payUsdt.hidden = false;
          payUsdt.removeAttribute('hidden');
        }
      } else if (payUsdt) {
        payUsdt.hidden = true;
      }

      if (done) {
        var heading = done.querySelector('h2');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          done.scrollIntoView();
          heading.focus();
        } else {
          done.scrollIntoView();
        }
      }
    }

    var query = window.location.search.match(/[?&]service=([^&]*)/);
    if (query && service) {
      var requestedService;
      try { requestedService = decodeURIComponent(query[1].replace(/\+/g, ' ')); }
      catch (e) { requestedService = query[1]; }
      var i;
      for (i = 0; i < service.options.length; i++) {
        if (service.options[i].value === requestedService) {
          service.value = requestedService;
          break;
        }
      }
    }

    form.addEventListener('change', function (event) {
      if (event.target && event.target.name === 'contact_method') updateContact();
    });
    updateContact();
    document.addEventListener('langchange', updateContact);

    if (copyButton) {
      copyButton.addEventListener('click', function () {
        var copiedText = CONFIG.USDT_ADDRESS;
        function copied() {
          copyButton.textContent = translate('copied');
          window.setTimeout(function () { copyButton.textContent = translate('copy'); }, 2000);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(copiedText).then(copied).catch(function () {
            var area = document.createElement('textarea');
            area.value = copiedText;
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            document.body.removeChild(area);
            copied();
          });
        } else {
          var area = document.createElement('textarea');
          area.value = copiedText;
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
          copied();
        }
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var method = selectedContactMethod();
      if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('contact'))) {
        if (contact) contact.setCustomValidity(translate('sendError'));
        form.reportValidity();
        if (contact) contact.setCustomValidity('');
        return;
      }
      if (error) error.hidden = true;
      if (button) {
        button.disabled = true;
        button.textContent = translate('sending');
      }

      var payload = {
        service: value('service'),
        task: value('task'),
        examples: value('examples'),
        deadline: value('deadline'),
        budget: value('budget'),
        name: value('name'),
        contact_method: method,
        contact: value('contact'),
        lang: window.currentLang ? window.currentLang() : '',
        page: window.location.href
      };
      var requests = [];
      if (CONFIG.WEB3FORMS_KEY) requests.push(sendWeb3Forms(payload));
      if (CONFIG.WORKER_URL) requests.push(sendWorker(payload));
      if (!requests.length) {
        console.warn('order: no endpoints configured');
        finishSuccess();
        return;
      }
      Promise.all(requests).then(function (results) {
        var ok = false;
        var i;
        for (i = 0; i < results.length; i++) if (results[i]) ok = true;
        if (ok) finishSuccess();
        else showError();
      }).catch(showError);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
