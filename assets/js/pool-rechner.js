// assets/js/pool-rechner.js  (AP-24)
// Pool-/Whirlpool-Umfeld-Rechner: qualitative Einordnung OHNE Preise.
// Läuft rein clientseitig. Erst wenn der Nutzer auf „Mit diesen Angaben anfragen"
// tippt, werden die Angaben (inkl. optionalem Budget) per WhatsApp übermittelt.
// Bedienbar ohne Maus: native Formularelemente, Aktualisierung bei jeder Änderung.

(function () {
  'use strict';

  var form = document.getElementById('prForm');
  var result = document.getElementById('prResult');
  var send = document.getElementById('prSend');
  if (!form || !result || !send) return;

  var WA = 'https://wa.me/491712345678?text=';

  var TEXT = {
    klein: 'Das klingt nach einem überschaubaren Vorhaben. Oft lässt sich so etwas zügig und planbar umsetzen.',
    mittel: 'Das klingt nach einem mittleren Vorhaben mit mehreren Arbeitsschritten. Die Reihenfolge stimmen wir sinnvoll aufeinander ab.',
    gross: 'Das klingt nach einem umfangreicheren Projekt. Vor allem Aushub und die Zugänglichkeit für Maschinen bestimmen hier den Aufwand – dafür ist eine Besichtigung wichtig.'
  };
  var LABEL = { klein: 'überschaubares Vorhaben', mittel: 'mittleres Vorhaben', gross: 'umfangreicheres Vorhaben' };
  var ABSCHLUSS = ' Eine belastbare Einschätzung geben wir Ihnen nach einem Termin vor Ort.';

  var ART_SCORE = { 'Whirlpool-Umfeld': 0, 'Pool bis ca. 24 m²': 1, 'Pool über ca. 24 m²': 2 };
  var ZUGANG_SCORE = { 'gut zugänglich': 0, 'eingeschränkt': 1, 'nur von Hand': 2 };

  function selectedRadio(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }
  function selectedChecks(name) {
    var out = [];
    form.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (el) { out.push(el.value); });
    return out;
  }

  function classify(score) {
    if (score <= 2) return 'klein';
    if (score <= 5) return 'mittel';
    return 'gross';
  }

  function update() {
    var art = selectedRadio('art');
    var scope = selectedChecks('scope');
    var zugang = selectedRadio('zugang');
    var budget = (form.elements.budget && form.elements.budget.value || '').trim();

    var score = (ART_SCORE[art] || 0) + scope.length + (ZUGANG_SCORE[zugang] || 0);
    var cls = classify(score);

    result.textContent = TEXT[cls] + ABSCHLUSS;

    // Zusammenfassung für die WhatsApp-Anfrage aufbauen.
    var lines = [
      'Hallo Herr Rohdich, ich interessiere mich für mein Pool-/Whirlpool-Umfeld.',
      '',
      'Vorhaben: ' + (art || '—'),
      'Umfang: ' + (scope.length ? scope.join(', ') : 'noch offen'),
      'Zugänglichkeit für Maschinen: ' + (zugang || '—')
    ];
    if (budget) lines.push('Grober Budgetrahmen: ' + budget);
    lines.push('');
    lines.push('Erste Einordnung (Website): ' + LABEL[cls] + '. Können wir dazu einen Termin vor Ort machen?');

    send.setAttribute('href', WA + encodeURIComponent(lines.join('\n')));
  }

  form.addEventListener('change', update);
  form.addEventListener('input', update);
  update();
})();
