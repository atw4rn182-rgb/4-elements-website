(function () {
  'use strict';

  var form = document.getElementById('quote-form');
  if (!form) return;

  var statusEl = document.getElementById('quote-status');
  var serviceSelect = form.querySelector('#service');

  // Prefill service from ?service= query param
  try {
    var params = new URLSearchParams(window.location.search);
    var service = params.get('service');
    if (service && serviceSelect) {
      var match = Array.prototype.find.call(serviceSelect.options, function (opt) {
        return opt.value.toLowerCase() === service.toLowerCase();
      });
      if (match) {
        serviceSelect.value = match.value;
      } else {
        // Try partial match
        Array.prototype.some.call(serviceSelect.options, function (opt) {
          if (!opt.value) return false;
          if (opt.value.toLowerCase().indexOf(service.toLowerCase()) !== -1 ||
              service.toLowerCase().indexOf(opt.value.toLowerCase()) !== -1) {
            serviceSelect.value = opt.value;
            return true;
          }
          return false;
        });
      }
    }
  } catch (e) { /* ignore */ }

  function showStatus(message, isError) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.classList.toggle('is-error', !!isError);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var name = (form.name.value || '').trim();
    var company = (form.company.value || '').trim();
    var phone = (form.phone.value || '').trim();
    var email = (form.email.value || '').trim();
    var serviceNeeded = (form.service.value || '').trim();
    var location = (form.location.value || '').trim();
    var details = (form.details.value || '').trim();

    if (!name || !phone || !email || !serviceNeeded) {
      showStatus('Please complete all required fields before sending.', true);
      return;
    }

    var to = form.getAttribute('data-to') || 'PURCHASING@4ELEMENTSOILFIELD.COM';
    var division = form.getAttribute('data-division') || 'Division';
    var prefix = form.getAttribute('data-subject-prefix') || '[Quote]';

    var subject = prefix + ' ' + serviceNeeded;
    var body = [
      'Division: ' + division,
      'Name: ' + name,
      'Company: ' + (company || 'N/A'),
      'Phone: ' + phone,
      'Email: ' + email,
      'Service Needed: ' + serviceNeeded,
      'Job Location: ' + (location || 'N/A'),
      '',
      'Project Details:',
      details || 'N/A'
    ].join('\n');

    var mailto =
      'mailto:' + encodeURIComponent(to) +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    showStatus('Opening your email client to send this ' + division + ' quote request…', false);
    window.location.href = mailto;
  });
})();
