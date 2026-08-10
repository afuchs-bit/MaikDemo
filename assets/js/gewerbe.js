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
  const email = form.querySelector('[name="email"]');
  const phone = form.querySelector('[name="telefon"]');
  const emailRequiredMark = form.querySelector('[data-required-marker="email"]');
  const phoneRequiredMark = form.querySelector('[data-required-marker="telefon"]');
  const dangerGroup = document.getElementById('gefahrGruppe');
  const uploadInputs = Array.from(form.querySelectorAll('[data-upload-input]'));
  const statusBox = document.getElementById('formStatus');
  const confirmation = document.getElementById('anfrage-erfolg');
  const submitButton = document.getElementById('b2bSubmitButton');
  const submitLabel = submitButton?.querySelector('[data-submit-label]');
  const acuteSubmitButton = form.querySelector('[data-b2b-acute-submit]');
  const whatsappLinks = document.querySelectorAll('[data-whatsapp-link]');
  const stagePanels = Array.from(form.querySelectorAll('[data-stage-panel]'));
  const acutePanel = form.querySelector('[data-b2b-acute-panel]');
  const acuteScroll = acutePanel?.querySelector('.b2b-acute-scroll');
  const acuteDamageGroup = acutePanel?.querySelector('[data-acute-damage-group]');
  const acuteDamageError = acutePanel?.querySelector('[data-acute-damage-error]');
  const formKicker = form.querySelector('[data-b2b-form-kicker]');
  const formTitle = form.querySelector('[data-b2b-form-title]');
  const formHeadNote = form.querySelector('[data-form-head-note]');
  const formHeadEmergency = form.querySelector('[data-form-head-emergency]');
  const progress = form.querySelector('[data-form-progress]');
  const progressStep = form.querySelector('[data-progress-step]');
  const progressLabel = form.querySelector('[data-progress-label]');
  const progressPercent = form.querySelector('[data-progress-percent]');
  const progressSelection = form.querySelector('[data-progress-selection]');
  const progressSegments = Array.from(form.querySelectorAll('.b2b-form-progress-track > span'));
  const stageLabels = ['Anliegen', 'Auftraggeber & Objekt', 'Beschreibung & Zeitrahmen', 'Unterlagen & Freigabe'];
  let activeStage = 1;
  let acuteMode = false;

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
    const selected = acuteMode ? concernLabels.sturmnotdienst : concernLabels[radioValue('anliegen')] || 'eine gewerbliche Leistung';
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
    const standardDangerInputs = Array.from(dangerGroup?.querySelectorAll('[name="gefaehrdung"]') || []);
    const isStandardAcute = !acuteMode && radioValue('zeitrahmen') === 'akut';
    if (dangerGroup) dangerGroup.hidden = !isStandardAcute;
    standardDangerInputs.forEach((input, index) => {
      input.required = isStandardAcute && index === 0;
      if (!isStandardAcute) input.checked = false;
    });
  };

  const updateContactRequirements = () => {
    if (acuteMode) return;
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

  const validateFileInput = (input) => {
    if (!input || input.disabled) return true;
    const upload = input.closest('.b2b-upload');
    const fileSelection = upload?.querySelector('[data-upload-selection]');
    input.setCustomValidity('');
    upload?.classList.remove('is-invalid');
    if (!input.files?.length) return true;
    const maxFiles = 5;
    const maxTotal = 12 * 1024 * 1024;
    const allowedExtensions = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'webp']);
    const selectedFiles = Array.from(input.files);
    const total = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const hasInvalidExtension = selectedFiles.some((file) => {
      const parts = file.name.toLowerCase().split('.');
      return parts.length < 2 || !allowedExtensions.has(parts.pop());
    });
    let message = '';
    if (selectedFiles.length > maxFiles) message = 'Bitte wählen Sie höchstens 5 Dateien aus.';
    else if (total > maxTotal) message = 'Die ausgewählten Dateien dürfen zusammen höchstens 12 MB groß sein.';
    else if (hasInvalidExtension) message = 'Mindestens eine Datei hat ein nicht unterstütztes Format.';
    input.setCustomValidity(message);
    upload?.classList.toggle('is-invalid', Boolean(message));
    if (message && fileSelection) fileSelection.textContent = message;
    return !message;
  };

  const validateFiles = () => uploadInputs.every(validateFileInput);

  const validateAcuteDamage = (showError = false) => {
    if (!acutePanel || !acuteDamageGroup) return true;
    const boxes = Array.from(acuteDamageGroup.querySelectorAll('input[type="checkbox"]'));
    boxes.forEach((box) => box.setCustomValidity(''));
    if (!acuteMode) {
      acuteDamageGroup.classList.remove('is-invalid');
      if (acuteDamageError) acuteDamageError.hidden = true;
      return true;
    }
    const valid = boxes.some((box) => box.checked);
    if (!valid && boxes[0]) boxes[0].setCustomValidity('Bitte wählen Sie aus, was betroffen ist.');
    acuteDamageGroup.classList.toggle('is-invalid', showError && !valid);
    if (acuteDamageError) acuteDamageError.hidden = valid || !showError;
    return valid;
  };

  const updateProgress = () => {
    if (progress) progress.hidden = acuteMode;
    if (acuteMode) return;
    const label = stageLabels[activeStage - 1] || stageLabels[0];
    const percentage = activeStage * 25;
    const concern = getChoiceLabel('anliegen');
    const collaboration = getChoiceLabel('zusammenarbeit');
    const selectionParts = [concern, collaboration].filter(Boolean);
    const selection = selectionParts.length === 2
      ? selectionParts.join(' · ')
      : selectionParts.length === 1
        ? `${selectionParts[0]} · noch nicht vollständig`
        : 'noch nicht vollständig';

    if (progressStep) progressStep.textContent = `Schritt ${activeStage} von 4`;
    if (progressLabel) progressLabel.textContent = label;
    if (progressPercent) progressPercent.textContent = `${percentage} %`;
    if (progressSelection) progressSelection.textContent = selection;
    progressSegments.forEach((segment, index) => {
      segment.classList.toggle('is-complete', index + 1 < activeStage);
      segment.classList.toggle('is-current', index + 1 === activeStage);
    });
    if (progress) {
      progress.setAttribute('aria-valuenow', String(activeStage));
      progress.setAttribute('aria-valuetext', `Schritt ${activeStage} von 4: ${label}. Auswahl: ${selection}.`);
    }
  };

  const updateStageStates = () => updateProgress();

  const updateScrollCue = (panel) => {
    if (!panel) return;
    const scrollArea = panel.querySelector('.b2b-stage-scroll');
    const cue = panel.querySelector('[data-scroll-cue], [data-acute-scroll-cue]');
    if (!scrollArea || !cue) return;
    const canScroll = scrollArea.scrollHeight > scrollArea.clientHeight + 4;
    const isAtEnd = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 4;
    cue.hidden = !canScroll || isAtEnd || window.matchMedia('(max-width: 1160px), (max-height: 699px)').matches;
    scrollArea.tabIndex = canScroll ? 0 : -1;
  };

  const updateAllScrollCues = () => [...stagePanels, acutePanel].forEach(updateScrollCue);

  const openStage = (stage, options = {}) => {
    if (acuteMode) return;
    const target = Number(stage);
    if (target < 1 || target > stagePanels.length) return;
    activeStage = target;
    stagePanels.forEach((panel) => { panel.hidden = Number(panel.dataset.stagePanel) !== target; });
    updateStageStates();
    const targetPanel = form.querySelector(`[data-stage-panel="${target}"]`);
    const targetTitle = targetPanel?.querySelector('.b2b-stage-panel-head h4');
    const scrollArea = targetPanel?.querySelector('.b2b-stage-scroll');
    if (scrollArea) scrollArea.scrollTop = 0;
    if (options.focus) targetTitle?.focus({ preventScroll: true });
    if (options.scroll && window.matchMedia('(max-width: 1160px), (max-height: 699px)').matches) {
      targetTitle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    requestAnimationFrame(() => updateScrollCue(targetPanel));
  };

  const toggleControls = (root, enabled) => {
    root?.querySelectorAll('input, select, textarea').forEach((control) => {
      control.disabled = !enabled;
    });
  };

  const restoreViewport = (position) => {
    if (!position) return;
    requestAnimationFrame(() => {
      window.scrollTo({ left: position.x, top: position.y, behavior: 'auto' });
      requestAnimationFrame(() => window.scrollTo({ left: position.x, top: position.y, behavior: 'auto' }));
    });
  };

  const setAcuteMode = (active, options = {}) => {
    const viewportPosition = options.preserveViewport ? { x: window.scrollX, y: window.scrollY } : null;
    acuteMode = Boolean(active);
    form.classList.toggle('is-acute', acuteMode);
    stagePanels.forEach((panel) => {
      toggleControls(panel, !acuteMode);
      panel.hidden = acuteMode || Number(panel.dataset.stagePanel) !== activeStage;
    });
    if (acutePanel) {
      acutePanel.hidden = !acuteMode;
      toggleControls(acutePanel, acuteMode);
      acutePanel.querySelectorAll('[data-acute-required]').forEach((control) => {
        control.required = acuteMode;
      });
      acutePanel.classList.remove('is-attempted');
    }
    if (formKicker) formKicker.textContent = acuteMode ? 'Dringender Sonderfall' : 'Objektanfrage';
    if (formTitle) formTitle.textContent = acuteMode ? 'Sturmschaden schnell melden.' : 'Ihre Angaben in vier übersichtlichen Kapiteln';
    if (formHeadNote) formHeadNote.hidden = acuteMode;
    if (formHeadEmergency) formHeadEmergency.hidden = !acuteMode;
    if (acuteMode && acuteScroll) acuteScroll.scrollTop = 0;
    updateDangerQuestion();
    updateContactRequirements();
    validateAcuteDamage(false);
    updateProgress();
    requestAnimationFrame(() => updateScrollCue(acuteMode ? acutePanel : stagePanels[activeStage - 1]));
    restoreViewport(viewportPosition);
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
    panel.classList.add('is-attempted');
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
  setAcuteMode(false);

  form.querySelectorAll('[data-stage-next]').forEach((button) => {
    button.addEventListener('click', () => {
      if (validateStage(activeStage)) openStage(button.dataset.stageNext, { focus: true, scroll: true });
    });
  });
  form.querySelectorAll('[data-stage-back]').forEach((button) => {
    button.addEventListener('click', () => openStage(button.dataset.stageBack, { focus: true, scroll: true }));
  });
  [...stagePanels, acutePanel].forEach((panel) => {
    if (!panel) return;
    const scrollArea = panel.querySelector('.b2b-stage-scroll');
    const cue = panel.querySelector('[data-scroll-cue], [data-acute-scroll-cue]');
    scrollArea?.addEventListener('scroll', () => updateScrollCue(panel), { passive: true });
    cue?.addEventListener('click', () => {
      scrollArea?.scrollBy({ top: Math.max(180, scrollArea.clientHeight * .7), behavior: 'smooth' });
    });
  });
  form.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', () => requestAnimationFrame(() => updateScrollCue(details.closest('[data-stage-panel], [data-b2b-acute-panel]'))));
  });
  window.addEventListener('resize', updateAllScrollCues, { passive: true });

  document.querySelectorAll('[data-prefill-anliegen], [data-prefill-beschreibung], [data-prefill-zusammenarbeit]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const preserveViewport = link.matches('.form-emergency-shortcut');
      const viewportPosition = preserveViewport ? { x: window.scrollX, y: window.scrollY } : null;
      if (preserveViewport) event.preventDefault();
      const concernValue = link.getAttribute('data-prefill-anliegen');
      const collaborationValue = link.getAttribute('data-prefill-zusammenarbeit');
      const descriptionValue = link.getAttribute('data-prefill-beschreibung');
      if (concernValue === 'sturmnotdienst') {
        setAcuteMode(true, { preserveViewport });
        return;
      }
      if (acuteMode) setAcuteMode(false, { preserveViewport });
      if (concernValue) setRadio('anliegen', concernValue);
      if (collaborationValue) setRadio('zusammenarbeit', collaborationValue);
      if (descriptionValue && descriptionField && (!descriptionField.value.trim() || descriptionField.dataset.prefilled === 'true')) {
        descriptionField.value = descriptionValue;
        descriptionField.dataset.prefilled = 'true';
      }
      openStage(1);
      updateWhatsapp();
      updateSubmitLabel();
      updateStageStates();
      restoreViewport(viewportPosition);
    });
  });

  form.querySelectorAll('[data-b2b-return-standard]').forEach((button) => {
    button.addEventListener('click', () => {
      const viewportPosition = { x: window.scrollX, y: window.scrollY };
      button.blur();
      activeStage = 1;
      setAcuteMode(false);
      openStage(1);
      document.getElementById('stage-title-1')?.focus({ preventScroll: true });
      restoreViewport(viewportPosition);
    });
  });

  [company, locationField].forEach((field) => field?.addEventListener('input', updateWhatsapp));
  descriptionField?.addEventListener('input', () => delete descriptionField.dataset.prefilled);
  form.addEventListener('input', () => {
    form.querySelectorAll('.b2b-form-group.is-invalid').forEach((group) => group.classList.remove('is-invalid'));
    if (acuteMode) validateAcuteDamage(acutePanel?.classList.contains('is-attempted'));
    updateStageStates();
  });
  form.addEventListener('change', (event) => {
    if (!acuteMode && event.target.name === 'zeitrahmen') updateDangerQuestion();
    if (!acuteMode && event.target.name === 'kontaktweg') updateContactRequirements();
    if (acuteMode && event.target.name === 'schaden[]') validateAcuteDamage(acutePanel?.classList.contains('is-attempted'));
    updateSubmitLabel();
    updateWhatsapp();
    updateStageStates();
  });

  uploadInputs.forEach((input) => input.addEventListener('change', () => {
    const selected = Array.from(input.files || []);
    const fileSelection = input.closest('.b2b-upload')?.querySelector('[data-upload-selection]');
    if (fileSelection) {
      if (!selected.length) fileSelection.textContent = 'Noch keine Datei ausgewählt';
      else {
        const total = selected.reduce((sum, file) => sum + file.size, 0);
        const totalLabel = total >= 1024 * 1024 ? `${(total / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(total / 1024)} KB`;
        fileSelection.textContent = `${selected.map((file) => file.name).join(', ')} · ${totalLabel}`;
      }
    }
    validateFileInput(input);
    updateStageStates();
  }));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateDangerQuestion();
    updateContactRequirements();
    const filesAreValid = validateFiles();
    const damageIsValid = validateAcuteDamage(true);
    const invalid = Array.from(form.elements).find((field) =>
      !field.disabled && ['INPUT', 'SELECT', 'TEXTAREA'].includes(field.tagName) && !field.checkValidity()
    );
    if (!filesAreValid || !damageIsValid || invalid) {
      const target = invalid || uploadInputs.find((input) => !input.disabled && !input.checkValidity()) || acuteDamageGroup?.querySelector('input');
      const panel = target?.closest('[data-stage-panel], [data-b2b-acute-panel]');
      const standardPanel = target?.closest('[data-stage-panel]');
      if (standardPanel) openStage(standardPanel.dataset.stagePanel);
      panel?.classList.add('is-attempted');
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

    const submittingAcute = acuteMode;
    const activeSubmitButton = submittingAcute ? acuteSubmitButton : submitButton;
    const originalLabel = submittingAcute ? activeSubmitButton?.textContent : submitLabel?.textContent;
    if (activeSubmitButton) activeSubmitButton.disabled = true;
    if (submittingAcute && activeSubmitButton) activeSubmitButton.textContent = 'Meldung wird übermittelt …';
    else if (submitLabel) submitLabel.textContent = 'Anfrage wird übermittelt …';
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
      activeStage = 1;
      setAcuteMode(false);
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
      if (activeSubmitButton) activeSubmitButton.disabled = false;
      if (submittingAcute && activeSubmitButton) activeSubmitButton.textContent = originalLabel || 'Sturm- oder Baumschaden melden →';
      else if (submitLabel) submitLabel.textContent = originalLabel || 'Objektanfrage übermitteln';
    }
  });

  // Die Auswertung von ?status=… gehört zum Backend-Betrieb und wird mit dem Backend
  // wieder ergänzt. Ohne Backend setzt niemand den Parameter.

  updateDangerQuestion();
  updateContactRequirements();
  updateSubmitLabel();
  updateWhatsapp();
  updateProgress();
  requestAnimationFrame(updateAllScrollCues);

  // AP-100: Deep-Link-Vorbefüllung, z. B. aus dem Galerie-CTA — ?anliegen=<radiowert>.
  // Gleiche Wirkung wie ein Klick auf [data-prefill-anliegen]; unbekannte Werte lassen
  // setRadio false liefern und bleiben folgenlos. Zur Sektion springt der #anfrage-Anker.
  const queryConcern = new URLSearchParams(location.search).get('anliegen');
  if (queryConcern === 'sturmnotdienst') {
    setAcuteMode(true);
  } else if (queryConcern && setRadio('anliegen', queryConcern)) {
    openStage(1);
    updateWhatsapp();
    updateSubmitLabel();
    updateStageStates();
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

// Gewerbekunden-FAQ: weich animierte, voneinander unabhängige Akkordeon-Gruppen.
(() => {
  'use strict';

  const section = document.querySelector('.b2b-faq');
  const groups = Array.from(document.querySelectorAll('[data-b2b-faq-group]'));
  if (!section || !groups.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 280;
  const easing = 'cubic-bezier(.22,.61,.36,1)';
  const states = new WeakMap();

  const getState = (entry) => {
    if (!states.has(entry)) states.set(entry, { animation: null, bodyAnimation: null, targetOpen: entry.open });
    return states.get(entry);
  };

  const clearMotionStyles = (entry) => {
    entry.classList.remove('is-opening', 'is-closing');
    entry.style.removeProperty('height');
    entry.style.removeProperty('overflow');
    entry.querySelector('.faq-body')?.style.removeProperty('opacity');
  };

  const finishImmediately = (entry, shouldOpen) => {
    const state = getState(entry);
    state.animation?.cancel();
    state.bodyAnimation?.cancel();
    state.animation = null;
    state.bodyAnimation = null;
    state.targetOpen = shouldOpen;
    entry.open = shouldOpen;
    clearMotionStyles(entry);
  };

  const animateEntry = (entry, shouldOpen) => {
    const state = getState(entry);
    state.targetOpen = shouldOpen;
    if (reducedMotion.matches || typeof entry.animate !== 'function') {
      finishImmediately(entry, shouldOpen);
      return;
    }

    const summary = entry.querySelector('summary');
    const body = entry.querySelector('.faq-body');
    if (!summary || !body) {
      finishImmediately(entry, shouldOpen);
      return;
    }

    const currentHeight = entry.getBoundingClientRect().height;
    const parsedOpacity = Number.parseFloat(getComputedStyle(body).opacity);
    const currentOpacity = entry.open && Number.isFinite(parsedOpacity) ? parsedOpacity : 0;

    state.animation?.cancel();
    state.bodyAnimation?.cancel();
    state.animation = null;
    state.bodyAnimation = null;
    if (shouldOpen && !entry.open) entry.open = true;

    entry.style.removeProperty('height');
    const openHeight = entry.getBoundingClientRect().height;
    const entryStyle = getComputedStyle(entry);
    const closedHeight = summary.getBoundingClientRect().height
      + Number.parseFloat(entryStyle.borderTopWidth)
      + Number.parseFloat(entryStyle.borderBottomWidth);
    const targetHeight = shouldOpen ? openHeight : closedHeight;

    entry.style.height = `${currentHeight}px`;
    entry.style.overflow = 'clip';
    entry.classList.toggle('is-opening', shouldOpen);
    entry.classList.toggle('is-closing', !shouldOpen);

    state.animation = entry.animate({ height: [`${currentHeight}px`, `${targetHeight}px`] }, { duration, easing });
    state.bodyAnimation = body.animate(
      { opacity: [currentOpacity, shouldOpen ? 1 : 0] },
      { duration: Math.round(duration * .72), easing, fill: 'forwards' }
    );

    const activeAnimation = state.animation;
    activeAnimation.addEventListener('finish', () => {
      if (state.animation !== activeAnimation) return;
      if (!shouldOpen) entry.open = false;
      state.animation = null;
      state.bodyAnimation?.cancel();
      state.bodyAnimation = null;
      clearMotionStyles(entry);
    }, { once: true });
  };

  groups.forEach((group) => {
    const entries = Array.from(group.querySelectorAll(':scope > details'));
    entries.forEach((entry) => {
      const summary = entry.querySelector('summary');
      if (!summary) return;
      getState(entry);
      summary.addEventListener('click', (event) => {
        event.preventDefault();
        const state = getState(entry);
        const shouldOpen = !state.targetOpen;
        if (shouldOpen) {
          entries.forEach((other) => {
            if (other !== entry && getState(other).targetOpen) animateEntry(other, false);
          });
        }
        animateEntry(entry, shouldOpen);
      });
    });
  });

  reducedMotion.addEventListener?.('change', () => {
    if (!reducedMotion.matches) return;
    groups.forEach((group) => {
      group.querySelectorAll(':scope > details').forEach((entry) => finishImmediately(entry, getState(entry).targetOpen));
    });
  });

  section.classList.add('is-faq-animated');
})();
