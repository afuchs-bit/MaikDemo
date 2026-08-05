// Gewerbekunden – Anfrageführung, WhatsApp-Vorbefüllung und Formularfeedback
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const concern = form.querySelector('[name="anliegen"]');
  const company = form.querySelector('[name="firma"]');
  const locationField = form.querySelector('[name="standort"]');
  const descriptionField = form.querySelector('[name="beschreibung"]');
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="telefon"]');
  const contactGroup = document.getElementById('kontaktGruppe');
  const files = document.getElementById('unterlagen');
  const fileSelection = document.getElementById('uploadSelection');
  const statusBox = document.getElementById('formStatus');
  const whatsappLinks = document.querySelectorAll('[data-whatsapp-link]');

  const concernLabels = {
    objektpflege: 'laufende Objektpflege',
    umbau: 'eine Bepflanzung oder Umgestaltung',
    erdarbeiten: 'Erd- oder Baggerarbeiten',
    baumkontrolle: 'eine Baumkontrolle',
    baumarbeiten: 'Baumarbeiten',
    begutachtung: 'eine fachliche Begutachtung im Garten- und Landschaftsbau',
    grenzbaum: 'die fachliche Einordnung eines Baums oder Gehölzes an einer Grundstücksgrenze',
    begruenung: 'eine Dach-, Fassaden- oder Stellplatzbegrünung',
    sturmnotdienst: 'Hilfe bei einem Sturmschaden',
    ausschreibung: 'die Prüfung einer Ausschreibung'
  };

  const modelLabels = {
    einmalig: 'einmaliger Einsatz',
    regelmaessig: 'regelmäßige Objektpflege',
    kombiniert: 'Pflege plus Sonderarbeiten'
  };

  const updateWhatsapp = () => {
    const selected = concernLabels[concern?.value] || 'eine gewerbliche Leistung';
    const name = company?.value.trim();
    const place = locationField?.value.trim();
    let message = `Hallo Herr Rohdich, wir interessieren uns für ${selected}.`;
    if (name) message += ` Firma: ${name}.`;
    if (place) message += ` Objektstandort: ${place}.`;
    message += ' Bitte melden Sie sich zur kurzen Abstimmung.';
    const href = `https://wa.me/491711738943?text=${encodeURIComponent(message)}`;
    whatsappLinks.forEach((link) => link.setAttribute('href', href));
  };

  const clearContactError = () => {
    email?.setCustomValidity('');
    phone?.setCustomValidity('');
    contactGroup?.classList.remove('is-invalid');
  };

  const validateContact = () => {
    clearContactError();
    if (!email?.value.trim() && !phone?.value.trim()) {
      const message = 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer an.';
      email?.setCustomValidity(message);
      phone?.setCustomValidity(message);
      contactGroup?.classList.add('is-invalid');
      return false;
    }
    return true;
  };

  const validateFiles = () => {
    if (!files?.files?.length) return true;
    const maxFiles = 5;
    const maxTotal = 12 * 1024 * 1024;
    const selectedFiles = Array.from(files.files);
    const total = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    let message = '';
    if (selectedFiles.length > maxFiles) message = 'Bitte wählen Sie höchstens 5 Dateien aus.';
    else if (total > maxTotal) message = 'Die ausgewählten Dateien dürfen zusammen höchstens 12 MB groß sein.';
    files.setCustomValidity(message);
    return !message;
  };

  document.querySelectorAll('[data-prefill-anliegen], [data-prefill-beschreibung]').forEach((link) => {
    link.addEventListener('click', () => {
      const concernValue = link.getAttribute('data-prefill-anliegen');
      const descriptionValue = link.getAttribute('data-prefill-beschreibung');
      if (concernValue && concern?.querySelector(`option[value="${concernValue}"]`)) concern.value = concernValue;
      if (descriptionValue && descriptionField && (!descriptionField.value.trim() || descriptionField.dataset.prefilled === 'true')) {
        descriptionField.value = descriptionValue;
        descriptionField.dataset.prefilled = 'true';
      }
      updateWhatsapp();
    });
  });

  [concern, company, locationField].forEach((field) => field?.addEventListener('input', updateWhatsapp));
  descriptionField?.addEventListener('input', () => delete descriptionField.dataset.prefilled);
  [email, phone].forEach((field) => field?.addEventListener('input', clearContactError));

  files?.addEventListener('change', () => {
    files.setCustomValidity('');
    const selected = Array.from(files.files || []);
    if (!selected.length) fileSelection.textContent = 'Noch keine Datei ausgewählt';
    else fileSelection.textContent = selected.map((file) => file.name).join(', ');
    validateFiles();
  });

  form.addEventListener('submit', (event) => {
    const contactIsValid = validateContact();
    const filesAreValid = validateFiles();
    if (!form.checkValidity() || !contactIsValid || !filesAreValid) {
      event.preventDefault();
      form.reportValidity();
      const invalid = form.querySelector(':invalid');
      invalid?.focus();
      return;
    }
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      event.preventDefault();
      if (statusBox) {
        statusBox.textContent = 'Vorschau: Die Angaben sind vollständig und würden auf dem Hetzner-Hosting sicher an Maik Rohdich gesendet.';
        statusBox.dataset.state = 'success';
        statusBox.hidden = false;
        statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Anfrage wird gesendet …';
    }
  });

  const params = new URLSearchParams(window.location.search);
  const state = params.get('status');
  if (state && statusBox) {
    const messages = {
      success: 'Vielen Dank. Ihre Anfrage wurde sicher übermittelt. Maik Rohdich meldet sich persönlich bei Ihnen.',
      validation: 'Bitte prüfen Sie Ihre Angaben. Mindestens eine Kontaktmöglichkeit und alle Pflichtfelder sind erforderlich.',
      files: 'Mindestens eine Datei konnte nicht verarbeitet werden. Bitte prüfen Sie Dateityp, Anzahl und Gesamtgröße.',
      send: 'Die Anfrage konnte technisch nicht versendet werden. Bitte nutzen Sie Telefon, WhatsApp oder E-Mail.',
      spam: 'Die Anfrage konnte nicht verarbeitet werden.'
    };
    statusBox.textContent = messages[state] || messages.send;
    statusBox.dataset.state = state === 'success' ? 'success' : 'error';
    statusBox.hidden = false;
    if (state !== 'success') statusBox.setAttribute('role', 'alert');
    history.replaceState({}, '', `${location.pathname}${location.hash || '#anfrage'}`);
  }

  updateWhatsapp();

  // Der mobile Schnellkontakt erscheint erst, wenn der Hero verlassen wurde.
  const hero = document.querySelector('.b2b-hero');
  const mobileActions = document.querySelector('.b2b-mobile-actions');
  const setMobileActionsVisible = (visible) => {
    if (!mobileActions) return;
    mobileActions.classList.toggle('is-visible', visible);
    mobileActions.setAttribute('aria-hidden', visible ? 'false' : 'true');
    mobileActions.toggleAttribute('inert', !visible);
  };
  if (hero && mobileActions && 'IntersectionObserver' in window) {
    const heroObserver = new IntersectionObserver(([entry]) => {
      setMobileActionsVisible(!entry.isIntersecting);
    }, { threshold: 0 });
    heroObserver.observe(hero);
  } else if (mobileActions) {
    const updateMobileActions = () => setMobileActionsVisible(window.scrollY > 500);
    window.addEventListener('scroll', updateMobileActions, { passive: true });
    updateMobileActions();
  }

  // Freigegebene Gewerbe-Fallstudien werden progressiv aus dem Projektindex
  // ergänzt. Ohne gültige Freigabe bleiben ausschließlich neutrale Motive stehen.
  const referenceTarget = document.querySelector('[data-approved-references]');
  const referenceFallback = document.querySelector('[data-reference-fallback]');

  const assetUrl = (value) => {
    if (/^https?:\/\//i.test(String(value))) return String(value);
    return new URL(`../${String(value).replace(/^\/+/, '')}`, document.baseURI).href;
  };

  const appendText = (parent, tag, value, className) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    parent.append(node);
    return node;
  };

  const renderCaseStudy = (project) => {
    const study = project.fallstudie;
    const article = document.createElement('article');
    article.className = 'b2b-approved-case';

    const media = document.createElement('div');
    media.className = 'b2b-approved-case-media';
    project.bilder.slice(0, 2).forEach((item) => {
      const img = document.createElement('img');
      img.src = assetUrl(item.bild);
      img.alt = item.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      media.append(img);
    });

    const body = document.createElement('div');
    body.className = 'b2b-approved-case-body';
    appendText(body, 'span', `${study.objektart} · ${project.ort}`);
    appendText(body, 'h3', project.titel);

    const details = document.createElement('dl');
    const values = [
      ['Ausgangslage', study.ausgangslage],
      ['Ergebnis', study.ergebnis],
      ['Betreuungsmodell', modelLabels[study.betreuungsmodell] || study.betreuungsmodell],
      ['Dauer / Turnus', study.dauer]
    ];
    values.forEach(([label, value]) => {
      const wrapper = document.createElement('div');
      appendText(wrapper, 'dt', label);
      appendText(wrapper, 'dd', value);
      details.append(wrapper);
    });
    body.append(details);

    const scope = document.createElement('ul');
    study.umfang.forEach((item) => appendText(scope, 'li', item));
    body.append(scope);
    article.append(media, body);
    return article;
  };

  if (referenceTarget) {
    fetch(new URL('../data/projekte-index.json', document.baseURI))
      .then((response) => {
        if (!response.ok) throw new Error(`Projektindex: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const approved = (Array.isArray(data.projekte) ? data.projekte : []).filter((project) =>
          Array.isArray(project.kundentyp) &&
          project.kundentyp.includes('gewerbe') &&
          project.fallstudie?.freigegeben === true &&
          Array.isArray(project.bilder) && project.bilder.length >= 2
        );
        if (!approved.length) return;
        const fragment = document.createDocumentFragment();
        approved.forEach((project) => fragment.append(renderCaseStudy(project)));
        referenceTarget.replaceChildren(fragment);
        referenceTarget.hidden = false;
        if (referenceFallback) referenceFallback.hidden = true;
      })
      .catch(() => {
        // Die statischen Arbeitsmotive sind der bewusste Offline-/Fehler-Fallback.
      });
  }
})();
