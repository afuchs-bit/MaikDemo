// Gewerbekunden – Anfrageführung, WhatsApp-Vorbefüllung und Formularfeedback
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form) return;

  const radioValue = (name) => form.querySelector(`[name="${name}"]:checked`)?.value || '';
  const setRadio = (name, value) => {
    const input = form.querySelector(`[name="${name}"][value="${value}"]`);
    if (!input) return false;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  const company = form.querySelector('[name="firma"]');
  const locationField = form.querySelector('[name="ort"]');
  const descriptionField = form.querySelector('[name="beschreibung"]');
  const additionalInfoField = form.querySelector('[name="sonstige_infos"]');
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="telefon"]');
  const emailRequiredMark = form.querySelector('[data-required-marker="email"]');
  const phoneRequiredMark = form.querySelector('[data-required-marker="telefon"]');
  const dangerGroup = document.getElementById('gefahrGruppe');
  const files = document.getElementById('unterlagen');
  const fileSelection = document.getElementById('uploadSelection');
  const statusBox = document.getElementById('formStatus');
  const confirmation = document.getElementById('anfrage-erfolg');
  const submitButton = document.getElementById('b2bSubmitButton');
  const submitLabel = submitButton?.querySelector('[data-submit-label]');
  const whatsappLinks = document.querySelectorAll('[data-whatsapp-link]');
  const stageToggles = Array.from(form.querySelectorAll('[data-stage-heading] .b2b-stage-toggle'));
  const stageHeadings = Array.from(form.querySelectorAll('[data-stage-heading]'));
  const stagePanels = Array.from(form.querySelectorAll('[data-stage-panel]'));
  let activeStage = 1;

  const concernLabels = {
    objektpflege: 'laufende Objektpflege',
    umbau: 'eine Umgestaltung oder neue Außenanlage',
    baumkontrolle: 'eine Baumkontrolle oder Baumarbeiten',
    begutachtung: 'eine fachliche Begutachtung im Garten- und Landschaftsbau',
    begruenung: 'eine Dach-, Fassaden- oder Stellplatzbegrünung',
    sturmnotdienst: 'Hilfe bei einem Sturmschaden',
    ausschreibung: 'die Prüfung einer Ausschreibung',
    sonstige: 'eine sonstige Objektanfrage'
  };

  const updateWhatsapp = () => {
    const selected = concernLabels[radioValue('anliegen')] || 'eine gewerbliche Leistung';
    const name = company?.value.trim();
    const place = locationField?.value.trim();
    let message = `Hallo Herr Rohdich, wir interessieren uns für ${selected}.`;
    if (name) message += ` Firma: ${name}.`;
    if (place) message += ` Objektstandort: ${place}.`;
    message += ' Bitte melden Sie sich zur kurzen Abstimmung.';
    const href = `https://wa.me/491711738943?text=${encodeURIComponent(message)}`;
    whatsappLinks.forEach((link) => link.setAttribute('href', href));
  };

  const getChoiceLabel = (name) => {
    const input = form.querySelector(`[name="${name}"]:checked`);
    return input?.closest('.b2b-choice')?.querySelector('span')?.textContent.trim() || '';
  };

  const updateDangerQuestion = () => {
    const isAcute = radioValue('zeitrahmen') === 'akut';
    if (dangerGroup) dangerGroup.hidden = !isAcute;
    form.querySelectorAll('[name="gefaehrdung"]').forEach((input) => {
      input.required = isAcute;
      if (!isAcute) input.checked = false;
    });
  };

  const updateContactRequirements = () => {
    const method = radioValue('kontaktweg');
    const needsEmail = method === 'email' || method === 'beides';
    const needsPhone = method === 'telefon' || method === 'beides';
    if (email) email.required = needsEmail;
    if (phone) phone.required = needsPhone;
    if (emailRequiredMark) emailRequiredMark.hidden = !needsEmail;
    if (phoneRequiredMark) phoneRequiredMark.hidden = !needsPhone;
  };

  const updateSubmitLabel = () => {
    if (!submitLabel) return;
    const isTender = radioValue('anliegen') === 'ausschreibung' || radioValue('zusammenarbeit') === 'ausschreibung';
    submitLabel.textContent = isTender ? 'Unterlagen zur Prüfung einreichen' : 'Objektanfrage übermitteln';
  };

  const validateFiles = () => {
    if (!files) return true;
    const upload = files.closest('.b2b-upload');
    files.setCustomValidity('');
    upload?.classList.remove('is-invalid');
    if (!files.files?.length) return true;
    const maxFiles = 5;
    const maxTotal = 12 * 1024 * 1024;
    const allowedExtensions = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'webp']);
    const selectedFiles = Array.from(files.files);
    const total = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const hasInvalidExtension = selectedFiles.some((file) => {
      const parts = file.name.toLowerCase().split('.');
      return parts.length < 2 || !allowedExtensions.has(parts.pop());
    });
    let message = '';
    if (selectedFiles.length > maxFiles) message = 'Bitte wählen Sie höchstens 5 Dateien aus.';
    else if (total > maxTotal) message = 'Die ausgewählten Dateien dürfen zusammen höchstens 12 MB groß sein.';
    else if (hasInvalidExtension) message = 'Mindestens eine Datei hat ein nicht unterstütztes Format.';
    files.setCustomValidity(message);
    upload?.classList.toggle('is-invalid', Boolean(message));
    if (message && fileSelection) fileSelection.textContent = message;
    return !message;
  };

  const stageIsComplete = (stage) => {
    const panel = form.querySelector(`[data-stage-panel="${stage}"]`);
    if (!panel) return false;
    const controls = Array.from(panel.querySelectorAll('input,select,textarea')).filter((field) => !field.disabled && !field.closest('.b2b-form-group[hidden]'));
    const required = controls.filter((field) => field.required);
    if (!required.length || required.some((field) => !field.checkValidity())) return false;
    return controls.every((field) => field.checkValidity());
  };

  const stageSummary = (stage) => {
    if (stage === 1) return [getChoiceLabel('anliegen'), getChoiceLabel('zusammenarbeit')].filter(Boolean).join(' · ') || 'Anlass und Zusammenarbeit';
    if (stage === 2) return [company?.value.trim(), locationField?.value.trim()].filter(Boolean).join(' · ') || 'Kontakt- und Standortdaten';
    if (stage === 3) {
      const timeframe = getChoiceLabel('zeitrahmen');
      if (descriptionField?.value.trim()) return timeframe ? `${timeframe} · Beschreibung ergänzt` : 'Beschreibung ergänzt';
      return timeframe || 'Situation, Bedarf und Dringlichkeit';
    }
    if (stage === 4) {
      const count = files?.files?.length || 0;
      const details = [];
      if (count) details.push(`${count} Datei${count === 1 ? '' : 'en'}`);
      if (additionalInfoField?.value.trim()) details.push('Hinweise ergänzt');
      return details.length ? `${details.join(' · ')} · Datenschutz` : 'Dateien, Hinweise und Datenschutz';
    }
    return '';
  };

  const updateStageStates = () => {
    stageHeadings.forEach((heading) => {
      const stage = Number(heading.dataset.stageHeading);
      const complete = stageIsComplete(stage);
      heading.classList.toggle('is-complete', complete);
      const summary = heading.querySelector('[data-stage-summary]');
      const state = heading.querySelector('.b2b-stage-state');
      if (summary) summary.textContent = stageSummary(stage);
      if (state) state.textContent = complete ? '✓' : stage === activeStage ? '−' : '→';
    });
  };

  const openStage = (stage, options = {}) => {
    const target = Number(stage);
    if (target < 1 || target > stagePanels.length) return;
    activeStage = target;
    stageToggles.forEach((toggle) => {
      const isActive = Number(toggle.closest('[data-stage-heading]').dataset.stageHeading) === target;
      toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
    stagePanels.forEach((panel) => { panel.hidden = Number(panel.dataset.stagePanel) !== target; });
    updateStageStates();
    const targetToggle = form.querySelector(`[data-stage-heading="${target}"] .b2b-stage-toggle`);
    if (options.focus) targetToggle?.focus({ preventScroll: true });
    if (options.scroll && window.matchMedia('(max-width: 820px)').matches) targetToggle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const firstInvalidInPanel = (panel) => Array.from(panel.querySelectorAll('input,select,textarea')).find((field) => !field.disabled && !field.closest('[hidden]') && !field.checkValidity());

  const validateStage = (stage) => {
    updateDangerQuestion();
    updateContactRequirements();
    validateFiles();
    const panel = form.querySelector(`[data-stage-panel="${stage}"]`);
    const invalid = panel ? firstInvalidInPanel(panel) : null;
    if (!invalid) {
      updateStageStates();
      return true;
    }
    form.classList.add('was-validated');
    invalid.closest('.b2b-form-group')?.classList.add('is-invalid');
    invalid.reportValidity();
    invalid.focus({ preventScroll: true });
    invalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  };

  const showStatus = (message, state = 'error') => {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.dataset.state = state;
    statusBox.hidden = false;
    statusBox.focus({ preventScroll: true });
    statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const showConfirmation = () => {
    if (!confirmation) return;
    confirmation.classList.add('is-visible');
    confirmation.focus({ preventScroll: true });
    confirmation.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState({}, '', `${location.pathname}?status=success#anfrage-erfolg`);
  };

  form.classList.add('is-enhanced');
  openStage(1);

  stageToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => openStage(toggle.closest('[data-stage-heading]').dataset.stageHeading, { scroll: true }));
  });
  form.querySelectorAll('[data-stage-next]').forEach((button) => {
    button.addEventListener('click', () => {
      if (validateStage(activeStage)) openStage(button.dataset.stageNext, { focus: true, scroll: true });
    });
  });
  form.querySelectorAll('[data-stage-back]').forEach((button) => {
    button.addEventListener('click', () => openStage(button.dataset.stageBack, { focus: true, scroll: true }));
  });

  document.querySelectorAll('[data-prefill-anliegen], [data-prefill-beschreibung], [data-prefill-zusammenarbeit]').forEach((link) => {
    link.addEventListener('click', () => {
      const concernValue = link.getAttribute('data-prefill-anliegen');
      const collaborationValue = link.getAttribute('data-prefill-zusammenarbeit');
      const descriptionValue = link.getAttribute('data-prefill-beschreibung');
      if (concernValue) setRadio('anliegen', concernValue);
      if (collaborationValue) setRadio('zusammenarbeit', collaborationValue);
      if (concernValue === 'sturmnotdienst') setRadio('zeitrahmen', 'akut');
      if (descriptionValue && descriptionField && (!descriptionField.value.trim() || descriptionField.dataset.prefilled === 'true')) {
        descriptionField.value = descriptionValue;
        descriptionField.dataset.prefilled = 'true';
      }
      openStage(1);
      updateWhatsapp();
      updateSubmitLabel();
      updateStageStates();
    });
  });

  [company, locationField].forEach((field) => field?.addEventListener('input', updateWhatsapp));
  descriptionField?.addEventListener('input', () => delete descriptionField.dataset.prefilled);
  form.addEventListener('input', () => {
    form.querySelectorAll('.b2b-form-group.is-invalid').forEach((group) => group.classList.remove('is-invalid'));
    updateStageStates();
  });
  form.addEventListener('change', (event) => {
    if (event.target.name === 'zeitrahmen') updateDangerQuestion();
    if (event.target.name === 'kontaktweg') updateContactRequirements();
    updateSubmitLabel();
    updateWhatsapp();
    updateStageStates();
  });

  files?.addEventListener('change', () => {
    const selected = Array.from(files.files || []);
    if (!selected.length) fileSelection.textContent = 'Noch keine Datei ausgewählt';
    else {
      const total = selected.reduce((sum, file) => sum + file.size, 0);
      const totalLabel = total >= 1024 * 1024 ? `${(total / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(total / 1024)} KB`;
      fileSelection.textContent = `${selected.map((file) => file.name).join(', ')} · ${totalLabel}`;
    }
    validateFiles();
    updateStageStates();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateDangerQuestion();
    updateContactRequirements();
    const filesAreValid = validateFiles();
    const invalid = form.querySelector(':invalid');
    if (!filesAreValid || invalid) {
      form.classList.add('was-validated');
      const target = invalid || files;
      const panel = target?.closest('[data-stage-panel]');
      if (panel) openStage(panel.dataset.stagePanel);
      target?.closest('.b2b-form-group')?.classList.add('is-invalid');
      target?.reportValidity();
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    // Ohne data-endpoint läuft das Formular im reinen Frontend-Betrieb: die Angaben
    // werden geprüft, aber nicht versendet. Zum Anbinden eines Backends das Attribut
    // am Formular setzen.
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      showStatus('Ihre Angaben sind vollständig, das Formular ist aber noch nicht angebunden – es wird nichts versendet. Bitte schicken Sie uns Ihre Anfrage per E-Mail an maik@rohdich.de oder melden sich telefonisch oder per WhatsApp.');
      return;
    }

    const originalLabel = submitLabel?.textContent || 'Objektanfrage übermitteln';
    if (submitButton) submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Anfrage wird übermittelt …';
    if (statusBox) statusBox.hidden = true;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
      });
      const result = await response.json().catch(() => ({ ok: false, state: 'send' }));
      if (!response.ok || !result.ok) throw new Error(result.state || 'send');
      form.reset();
      showConfirmation();
    } catch (error) {
      const messages = {
        validation: 'Bitte prüfen Sie Ihre Angaben. Mindestens ein Pflichtfeld ist noch nicht vollständig.',
        files: 'Mindestens eine Datei konnte nicht verarbeitet werden. Bitte prüfen Sie Dateityp, Anzahl und Gesamtgröße.',
        send: 'Die Anfrage konnte technisch nicht versendet werden. Ihre Angaben bleiben erhalten. Bitte versuchen Sie es erneut oder nutzen Sie Telefon, WhatsApp oder E-Mail.',
        spam: 'Die Anfrage konnte nicht verarbeitet werden.'
      };
      showStatus(messages[error.message] || messages.send);
    } finally {
      if (submitButton) submitButton.disabled = false;
      if (submitLabel) submitLabel.textContent = originalLabel;
    }
  });

  // Die Auswertung von ?status=… gehört zum Backend-Betrieb und wird mit dem Backend
  // wieder ergänzt. Ohne Backend setzt niemand den Parameter.

  updateDangerQuestion();
  updateContactRequirements();
  updateSubmitLabel();
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
