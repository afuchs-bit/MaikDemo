// Privatkunden – dynamische Gartenanfrage mit vier Abschnitten und Akutpfad
(function () {
  'use strict';

  const form = document.getElementById('contactForm');
  if (!form?.classList.contains('private-form')) return;

  const workspace = form.querySelector('.b2b-form-workspace');
  const acutePanel = form.querySelector('[data-acute-panel]');
  const standardPanels = Array.from(form.querySelectorAll('[data-stage-panel]'));
  const routeElements = Array.from(form.querySelectorAll('[data-route]'));
  const subrouteElements = Array.from(form.querySelectorAll('[data-subroute]'));
  const pathInputs = Array.from(form.querySelectorAll('[name="hauptpfad"]'));
  const progress = form.querySelector('[data-form-progress]');
  const progressStep = form.querySelector('[data-progress-step]');
  const progressLabel = form.querySelector('[data-progress-label]');
  const progressPercent = form.querySelector('[data-progress-percent]');
  const progressFill = form.querySelector('[data-progress-fill]');
  const progressSelection = form.querySelector('[data-progress-selection]');
  const formHeadKicker = form.querySelector('[data-form-head-kicker]');
  const formHeadTitle = form.querySelector('[data-form-head-title]');
  const formHeadSubtitle = form.querySelector('[data-form-head-subtitle]');
  const formHeadEmergency = form.querySelector('[data-form-head-emergency]');
  const statusBox = document.getElementById('formStatus');
  const confirmation = document.getElementById('anfrage-erfolg');
  const confirmationSummary = document.getElementById('privateConfirmationSummary');
  const standardFiles = document.getElementById('unterlagen');
  const acuteFiles = document.getElementById('akutUnterlagen');
  const optionalDetails = Array.from(form.querySelectorAll('[data-optional-details]'));
  const whatsappLinks = document.querySelectorAll('[data-whatsapp-link]');
  const jsEnabled = form.querySelector('[data-js-enabled]');
  const descriptionGroup = form.querySelector('[data-description-standard]');
  const descriptionLabel = form.querySelector('[data-description-label]');
  const planningDetails = form.querySelector('[data-planning-details]');
  const uploadDetails = form.querySelector('[data-upload-details]');
  const uploadLabel = form.querySelector('[data-upload-label]');
  const propertyDetails = form.querySelector('[data-property-details]');
  const careFrequency = form.querySelector('[data-care-frequency]');
  const writtenAssessment = form.querySelector('[data-written-assessment]');
  let activeStage = 1;
  let previousPath = '';
  let autoAdvanceTimer = 0;
  let pointerPathInput = null;
  const desktopScrollQuery = window.matchMedia('(min-width: 1161px) and (min-height: 700px)');

  const pathLabels = {
    garten: 'Garten neu anlegen & umgestalten',
    vorgarten: 'Vorgarten neu gestalten',
    baulich: 'Terrassen, Wege, Einfahrten, Mauern & Zäune',
    bepflanzung_pflege: 'Bepflanzung & Gartenpflege',
    baeume: 'Bäume schneiden, fällen & kontrollieren',
    wasser: 'Teiche, Wasserspiele & Poolumfeld',
    weitere: 'Weitere Leistungen',
    unsicher: 'Noch nicht sicher',
    sturmschaden: 'Akuter Sturm- oder Baumschaden'
  };

  const submitLabels = {
    garten: 'Gartenprojekt anfragen',
    vorgarten: 'Vorgartenprojekt anfragen',
    baulich: 'Bauprojekt anfragen',
    bepflanzung_pflege: 'Bepflanzung & Pflege anfragen',
    baeume: 'Baumanfrage senden',
    wasser: 'Wasser- & Poolumfeld anfragen',
    unsicher: 'Anfrage senden',
    sturmschaden: 'Sturm- oder Baumschaden melden'
  };

  const subrouteSubmitLabels = {
    dach: 'Dachbegrünung anfragen',
    holz: 'Verfügbarkeit anfragen',
    anderes: 'Anfrage senden'
  };

  const subrouteLabels = {
    dach: 'Dachbegrünung',
    holz: 'Brennholz & Stammholz',
    anderes: 'Anderes Anliegen'
  };

  const timeframeLabels = {
    bald: 'so bald wie möglich', drei_monate: 'innerhalb von drei Monaten',
    sechs_monate: 'innerhalb von sechs Monaten', zwoelf_monate: 'innerhalb von zwölf Monaten',
    spaeter: 'später', offen: 'noch offen',
    pflege_bald: 'möglichst bald', pflege_wochen: 'innerhalb der nächsten Wochen',
    pflege_monate: 'innerhalb der nächsten Monate', pflege_regelmaessig: 'regelmäßige Pflege gesucht',
    pflege_saisonal: 'saisonal', pflege_offen: 'noch offen',
    baum_bald: 'so bald wie möglich', baum_wochen: 'innerhalb der nächsten Wochen',
    baum_monate: 'innerhalb der nächsten Monate', baum_flexibel: 'Termin flexibel',
    baum_offen: 'noch offen', dach_bald: 'möglichst bald',
    dach_drei_monate: 'innerhalb von drei Monaten', dach_sechs_monate: 'innerhalb von sechs Monaten',
    dach_spaeter: 'später', dach_offen: 'noch offen',
    holz_bald: 'möglichst bald', holz_wochen: 'in den nächsten Wochen',
    holz_spaeter: 'später', holz_flexibel: 'flexibel',
    allgemein_bald: 'möglichst bald', allgemein_wochen: 'innerhalb der nächsten Wochen',
    allgemein_monate: 'innerhalb der nächsten Monate', allgemein_spaeter: 'später',
    allgemein_offen: 'noch offen'
  };

  const stageThreeCopy = {
    garten: ['Was sollten wir über Ihr Gartenprojekt wissen?', 'Eine kurze Beschreibung genügt. Weitere Arbeiten können Sie hier ebenfalls ergänzen.'],
    vorgarten: ['Wie soll Ihr Vorgarten künftig wirken?', 'Beschreiben Sie kurz Ihre Wünsche und die heutige Situation.'],
    baulich: ['Was sollten wir über das Bauvorhaben wissen?', 'Ein paar Sätze zu Fläche, Materialwünschen oder Bestand genügen.'],
    bepflanzung_pflege: ['Was sollten wir über Bepflanzung oder Pflege wissen?', 'Schreiben Sie kurz, ob es um eine neue Bepflanzung oder um einmalige beziehungsweise regelmäßige Pflege geht.'],
    baeume: ['Was sollten wir über die Baumsituation wissen?', 'Ein paar Sätze zu Rückschnitt, Fällung oder fachlicher Kontrolle genügen. Fotos können bei der Einordnung helfen.'],
    wasser: ['Was möchten Sie am Wasser- oder Poolumfeld verändern?', 'Beschreiben Sie kurz, ob es um einen Teich, ein Wasserspiel oder das Pool- beziehungsweise Whirlpool-Umfeld geht.'],
    weitere: ['Was sollten wir über Ihr Anliegen wissen?', 'Je nach Auswahl benötigen wir nur wenige ergänzende Angaben.'],
    unsicher: ['Was möchten Sie verändern, lösen oder prüfen lassen?', 'Beschreiben Sie Ihr Anliegen in eigenen Worten. Wir ordnen es gemeinsam ein.']
  };

  const subrouteStageThreeCopy = {
    dach: ['Was sollten wir über die Dachbegrünung wissen?', 'Beschreiben Sie kurz die Dachfläche, den heutigen Zustand und Ihre Vorstellungen.'],
    holz: ['Wann und wo benötigen Sie das Holz?', 'Eine ungefähre Mengenangabe und der gewünschte Zeitraum genügen für die erste Einordnung.'],
    anderes: ['Was sollten wir über Ihr Anliegen wissen?', 'Beschreiben Sie kurz, was Sie verändern, lösen oder prüfen lassen möchten.']
  };

  const descriptions = {
    garten: 'Kurze Beschreibung des Gartenprojekts',
    vorgarten: 'Kurze Beschreibung des gewünschten Vorgartens',
    baulich: 'Kurze Beschreibung des Vorhabens',
    bepflanzung_pflege: 'Kurze Beschreibung der gewünschten Bepflanzung oder Pflege',
    baeume: 'Kurze Beschreibung der Baumsituation',
    wasser: 'Kurze Beschreibung des Vorhabens',
    unsicher: 'Beschreiben Sie kurz, was Sie verändern, lösen oder prüfen lassen möchten',
    dach: 'Kurze Beschreibung der Dachbegrünung',
    anderes: 'Kurze Beschreibung des Anliegens'
  };

  const uploadLabels = {
    garten: 'Fotos, Skizzen, Pläne oder sonstige Unterlagen',
    vorgarten: 'Fotos, Skizzen, Pläne oder sonstige Unterlagen',
    baulich: 'Fotos, Pläne oder sonstige Unterlagen',
    bepflanzung_pflege: 'Fotos des Gartens, Pflanzplan oder andere Unterlagen',
    baeume: 'Fotos der Bäume und Umgebung oder vorhandene Unterlagen',
    wasser: 'Fotos, Skizzen, Pläne oder sonstige Unterlagen',
    unsicher: 'Fotos, Skizzen oder sonstige Unterlagen',
    dach: 'Fotos, Pläne oder sonstige Unterlagen',
    anderes: 'Fotos oder Unterlagen'
  };

  const pathValue = () => form.querySelector('[name="hauptpfad"]:checked')?.value || '';
  const subrouteValue = () => form.querySelector('[name="weitere_art"]:checked:not(:disabled)')?.value || '';
  const checkedValue = (name, root = form) => root.querySelector(`[name="${name}"]:checked:not(:disabled)`)?.value || '';
  const activeControl = (name) => Array.from(form.querySelectorAll(`[name="${name}"]:not(:disabled)`));
  const contactPreferenceValue = () => form.querySelector('[name="kontaktpraeferenz"]:not(:disabled)')?.value || '';
  const isActive = (field) => !field.disabled && !field.closest('[hidden]');
  const controlsIn = (element) => Array.from(element?.querySelectorAll('input, select, textarea, button') || []);
  const setControlsEnabled = (element, enabled) => controlsIn(element).forEach((control) => {
    if (control.matches('[name="hauptpfad"]')) return;
    control.disabled = !enabled;
    if (!enabled) control.setCustomValidity?.('');
  });
  const routesFor = (element) => String(element.dataset.route || '').split(/\s+/).filter(Boolean);
  const subroutesFor = (element) => String(element.dataset.subroute || '').split(/\s+/).filter(Boolean);

  const setElementVisible = (element, visible) => {
    element.hidden = !visible;
    setControlsEnabled(element, visible);
  };

  const syncCareFields = () => {
    const careSelected = pathValue() === 'bepflanzung_pflege'
      && Array.from(form.querySelectorAll('[data-care-choice]')).some((input) => input.checked && !input.disabled);
    if (careFrequency) setElementVisible(careFrequency, careSelected);
    form.querySelectorAll('[data-care-time-option]').forEach((element) => setElementVisible(element, careSelected));
    return careSelected;
  };

  const syncAssessmentFields = () => {
    const assessmentSelected = pathValue() === 'baeume'
      && Array.from(form.querySelectorAll('[data-assessment-choice]')).some((input) => input.checked && !input.disabled);
    if (writtenAssessment) setElementVisible(writtenAssessment, assessmentSelected);
  };

  const syncConditionalFields = () => {
    const path = pathValue();
    const subroute = subrouteValue();

    subrouteElements.forEach((element) => {
      const visible = path === 'weitere' && Boolean(subroute) && subroutesFor(element).includes(subroute);
      setElementVisible(element, visible);
    });

    const needsDescription = Boolean(path)
      && path !== 'sturmschaden'
      && !(path === 'weitere' && (!subroute || subroute === 'holz'));
    if (descriptionGroup) setElementVisible(descriptionGroup, needsDescription);
    if (descriptionLabel) descriptionLabel.textContent = descriptions[path === 'weitere' ? subroute : path] || 'Beschreiben Sie Ihr Vorhaben kurz';

    const planningVisible = ['garten', 'vorgarten', 'baulich', 'wasser'].includes(path);
    if (planningDetails) setElementVisible(planningDetails, planningVisible);
    const planStandard = form.querySelector('[data-plan-standard]');
    const planConstruction = form.querySelector('[data-plan-construction]');
    if (planStandard) setElementVisible(planStandard, planningVisible && path !== 'baulich');
    if (planConstruction) setElementVisible(planConstruction, path === 'baulich');

    const uploadKey = path === 'weitere' ? subroute : path;
    const uploadVisible = ['garten', 'vorgarten', 'baulich', 'bepflanzung_pflege', 'baeume', 'wasser', 'unsicher', 'dach', 'anderes'].includes(uploadKey);
    if (uploadDetails) setElementVisible(uploadDetails, uploadVisible);
    if (uploadLabel) uploadLabel.textContent = uploadLabels[uploadKey] || 'Fotos oder Unterlagen';

    syncCareFields();
    syncAssessmentFields();
  };

  const setRouteVisibility = (path) => {
    routeElements.filter((element) => !element.hasAttribute('data-subroute')).forEach((element) => {
      setElementVisible(element, Boolean(path) && routesFor(element).includes(path));
    });
    syncConditionalFields();
  };

  const updateDynamicCopy = (path) => {
    const head = form.querySelector('[data-dynamic-stage-head="3"]');
    const copy = path === 'weitere'
      ? subrouteStageThreeCopy[subrouteValue()] || stageThreeCopy.weitere
      : stageThreeCopy[path] || ['Was sollten wir über Ihr Anliegen wissen?', 'Ein kurzer Überblick reicht. Details klären wir anschließend persönlich mit Ihnen.'];
    if (!head) return;
    head.querySelector('h4').textContent = copy[0];
    head.querySelector('p').textContent = copy[1];
  };

  const updateOptionalSummaries = () => {
    optionalDetails.forEach((details) => {
      const output = details.querySelector('[data-optional-count]');
      if (!output) return;
      const controls = Array.from(details.querySelectorAll('input, select, textarea')).filter((field) => !field.disabled);
      const fileInput = controls.find((field) => field.type === 'file');
      const fileCount = fileInput?.files?.length || 0;
      const filled = new Set();
      controls.forEach((field) => {
        if (field.type === 'file') return;
        if ((field.type === 'checkbox' || field.type === 'radio') && field.checked) filled.add(field.name);
        else if (!['checkbox', 'radio'].includes(field.type) && field.value.trim()) filled.add(field.name);
      });
      if (fileInput && controls.length === 1) {
        output.textContent = fileCount ? `${fileCount} Datei${fileCount === 1 ? '' : 'en'} ausgewählt` : 'Keine Dateien ausgewählt';
        return;
      }
      const count = filled.size + fileCount;
      output.textContent = count ? `${count} Angabe${count === 1 ? '' : 'n'} ergänzt` : 'Keine Angaben ergänzt';
    });
  };

  const setRequired = (name, required) => {
    activeControl(name).forEach((input) => {
      input.required = required;
      if (!required) input.setCustomValidity('');
    });
  };

  const setCheckboxGroupValidity = (name, required, message) => {
    const controls = activeControl(name);
    controls.forEach((input) => input.setCustomValidity(''));
    if (!controls.length || !required) return true;
    const valid = controls.some((input) => input.checked);
    controls[0].setCustomValidity(valid ? '' : message);
    const group = controls[0].closest('.b2b-form-group');
    const panel = group?.closest('[data-stage-panel], [data-acute-panel]');
    group?.classList.toggle('is-invalid', !valid && Boolean(panel?.classList.contains('is-attempted')));
    return valid;
  };

  const syncRouteRequirements = () => {
    const path = pathValue();
    const subroute = subrouteValue();
    const careSelected = syncCareFields();
    syncAssessmentFields();
    setRequired('weitere_art', path === 'weitere');
    setRequired('pflegeturnus', careSelected);
    setRequired('baumerreichbarkeit', path === 'baeume');
    setRequired('dachobjekt', path === 'weitere' && subroute === 'dach');
    setRequired('dachform', path === 'weitere' && subroute === 'dach');
    setRequired('holzart', path === 'weitere' && subroute === 'holz');
    setRequired('holzuebergabe', path === 'weitere' && subroute === 'holz');
    setRequired('beschreibung', Boolean(descriptionGroup && !descriptionGroup.hidden));
    setRequired('zeitrahmen', Boolean(path) && path !== 'sturmschaden' && !(path === 'weitere' && !subroute));

    setCheckboxGroupValidity('schaden[]', path === 'sturmschaden', 'Bitte wählen Sie aus, was betroffen ist.');

    const activeTimeframes = activeControl('zeitrahmen');
    activeTimeframes.forEach((input) => input.setCustomValidity(''));
    if (activeTimeframes.length && path !== 'sturmschaden' && !activeTimeframes.some((input) => input.checked)) {
      activeTimeframes[0].setCustomValidity('Bitte wählen Sie einen ungefähren Zeitpunkt aus.');
    }
  };

  const standardRoot = form.querySelector('.b2b-form-workspace');
  const findStandard = (name) => {
    const controls = Array.from(standardRoot?.querySelectorAll(`[data-stage-panel] [name="${name}"]`) || []);
    return controls.find((field) => !field.disabled) || controls[0];
  };
  const findAcute = (name) => acutePanel?.querySelector(`[name="${name}"]`);

  const copySharedValues = (fromAcute) => {
    ['strasse', 'plz', 'ort', 'beschreibung', 'name', 'telefon'].forEach((name) => {
      const source = fromAcute ? findAcute(name) : findStandard(name);
      const target = fromAcute ? findStandard(name) : findAcute(name);
      if (source && target && source.value.trim() && !target.value.trim()) target.value = source.value;
    });
  };

  const updateSubmitLabels = () => {
    const path = pathValue();
    const label = path === 'weitere' ? (subrouteSubmitLabels[subrouteValue()] || 'Anfrage senden') : (submitLabels[path] || 'Anfrage senden');
    form.querySelectorAll('[data-submit-label]').forEach((element) => { element.textContent = label; });
  };

  const progressStates = {
    1: { label: 'Anliegen auswählen' },
    2: { label: 'Standort & Eckdaten' },
    3: { label: 'Angaben & Zeitpunkt' },
    4: { label: 'Kontakt & absenden' }
  };

  const updateProgress = (complete = false) => {
    if (!progress) return;
    const acute = pathValue() === 'sturmschaden';
    progress.hidden = acute;
    if (acute) return;
    const state = complete ? { label: 'Anfrage vollständig übermittelt' } : progressStates[activeStage];
    const stepNumber = complete ? 4 : activeStage;
    const percentage = complete ? 100 : stepNumber * 25;
    const stepText = complete ? 'Anfrage abgeschlossen' : `Schritt ${stepNumber} von 4`;
    const path = pathValue();
    const subroute = subrouteValue();
    const selection = path
      ? `${pathLabels[path] || path}${path === 'weitere' && subrouteLabels[subroute] ? ` · ${subrouteLabels[subroute]}` : ''}`
      : 'noch nicht ausgewählt';
    progress.setAttribute('aria-valuenow', String(stepNumber));
    progress.setAttribute('aria-valuetext', complete
      ? state.label
      : `${stepText}: ${state.label}. ${path ? `Gewählter Schwerpunkt: ${selection}.` : 'Schwerpunkt noch nicht ausgewählt.'}`);
    if (progressStep) progressStep.textContent = stepText;
    if (progressLabel) progressLabel.textContent = state.label;
    if (progressPercent) progressPercent.textContent = `${percentage} %`;
    if (progressFill) {
      Array.from(progressFill.children).forEach((segment, index) => {
        segment.classList.toggle('is-complete', complete || index < stepNumber - 1);
        segment.classList.toggle('is-current', !complete && index === stepNumber - 1);
      });
    }
    if (progressSelection) progressSelection.textContent = selection;
  };

  const updateFormHead = (acute) => {
    if (formHeadKicker) formHeadKicker.textContent = acute ? 'Dringender Sonderfall' : 'Ihre Anfrage in wenigen Schritten';
    if (formHeadTitle) formHeadTitle.textContent = acute ? 'Sturmschaden schnell melden.' : 'Wir machen es Ihnen einfach.';
    if (formHeadSubtitle) formHeadSubtitle.hidden = acute;
    if (formHeadEmergency) formHeadEmergency.hidden = !acute;
  };

  const scrollFrames = [];
  const updateScrollCue = (entry) => {
    if (!entry) return;
    const { frame, scroller, cue } = entry;
    const scrollable = desktopScrollQuery.matches && scroller.scrollHeight > scroller.clientHeight + 4;
    const atTop = scroller.scrollTop <= 4;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8;
    frame.classList.toggle('has-scroll-above', scrollable && !atTop);
    frame.classList.toggle('has-scroll-below', scrollable && !atBottom);
    cue.hidden = !scrollable || atBottom;
  };
  const updateAllScrollCues = () => scrollFrames.forEach(updateScrollCue);

  const setupScrollFrames = () => {
    form.querySelectorAll('.b2b-stage-scroll, .private-acute-scroll').forEach((scroller, index) => {
      if (scroller.parentElement?.matches('[data-scroll-frame]')) return;
      const frame = document.createElement('div');
      frame.className = 'private-scroll-frame';
      frame.dataset.scrollFrame = '';
      scroller.parentNode.insertBefore(frame, scroller);
      frame.append(scroller);
      scroller.tabIndex = 0;
      scroller.setAttribute('aria-label', scroller.classList.contains('private-acute-scroll') ? 'Angaben zum Sturm- oder Baumschaden' : `Fragenbereich ${index + 1}`);
      const cue = document.createElement('button');
      cue.type = 'button';
      cue.className = 'private-scroll-cue';
      cue.dataset.scrollCue = '';
      cue.setAttribute('aria-label', 'Weitere Angaben im Formular anzeigen');
      cue.innerHTML = '<span>Weitere Angaben</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 9 5 5 5-5"/></svg>';
      frame.append(cue);
      const entry = { frame, scroller, cue };
      scrollFrames.push(entry);
      scroller.addEventListener('scroll', () => updateScrollCue(entry), { passive: true });
      cue.addEventListener('click', () => scroller.scrollBy({ top: Math.max(180, scroller.clientHeight * .7), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    });
    requestAnimationFrame(updateAllScrollCues);
  };

  const activateAcutePath = (active) => {
    form.classList.toggle('is-acute', active);
    workspace?.classList.toggle('is-acute', active);
    standardPanels.forEach((panel) => {
      panel.hidden = active ? true : Number(panel.dataset.stagePanel) !== activeStage;
      setControlsEnabled(panel, !active);
    });
    if (acutePanel) {
      acutePanel.hidden = !active;
      setControlsEnabled(acutePanel, active);
      acutePanel.querySelectorAll('[data-acute-required]').forEach((field) => { field.required = active; });
      if (active) acutePanel.querySelector('.private-acute-scroll')?.scrollTo({ top: 0, behavior: 'auto' });
    }
    if (!active) setRouteVisibility(pathValue());
    updateFormHead(active);
    updateProgress();
    requestAnimationFrame(updateAllScrollCues);
  };

  const applyPath = (path, options = {}) => {
    const oldPath = previousPath;
    const viewportPosition = path === 'sturmschaden' && oldPath !== 'sturmschaden'
      ? { x: window.scrollX, y: window.scrollY }
      : null;
    if (path === 'sturmschaden' && oldPath !== 'sturmschaden') copySharedValues(false);
    if (oldPath === 'sturmschaden' && path !== 'sturmschaden') copySharedValues(true);
    setRouteVisibility(path);
    activateAcutePath(path === 'sturmschaden');
    updateDynamicCopy(path);
    syncRouteRequirements();
    syncContactRequirements();
    updateSubmitLabels();
    updateStageStates();
    updateWhatsappLink();
    updateOptionalSummaries();
    previousPath = path;
    standardPanels.slice(1).forEach((panel) => {
      panel.classList.remove('is-attempted');
      panel.querySelectorAll('.b2b-form-group.is-invalid').forEach((group) => group.classList.remove('is-invalid'));
    });
    if (path === 'sturmschaden' && options.focus !== false) {
      requestAnimationFrame(() => {
        document.getElementById('private-acute-title')?.focus?.({ preventScroll: true });
        if (viewportPosition) window.scrollTo({ left: viewportPosition.x, top: viewportPosition.y, behavior: 'auto' });
        requestAnimationFrame(() => {
          if (viewportPosition) window.scrollTo({ left: viewportPosition.x, top: viewportPosition.y, behavior: 'auto' });
        });
      });
    }
  };

  const applySubroute = (subroute) => {
    syncConditionalFields();
    syncRouteRequirements();
    updateDynamicCopy(pathValue());
    updateSubmitLabels();
    updateOptionalSummaries();
    updateProgress();
    requestAnimationFrame(updateAllScrollCues);
  };

  const emailField = form.querySelector('[data-stage-panel="4"] [name="email"]');
  const phoneField = form.querySelector('[data-stage-panel="4"] [name="telefon"]');
  const contactError = document.getElementById('kontaktFehler');
  const emailMarker = form.querySelector('[data-required-marker="email"]');
  const phoneMarker = form.querySelector('[data-required-marker="telefon"]');
  const emailOptional = form.querySelector('[data-contact-optional="email"]');
  const phoneOptional = form.querySelector('[data-contact-optional="telefon"]');

  function syncContactRequirements() {
    if (pathValue() === 'sturmschaden') return;
    const preference = contactPreferenceValue();
    const needsEmail = preference === 'email';
    const needsPhone = preference === 'telefon' || preference === 'whatsapp';
    const hasEmail = Boolean(emailField?.value.trim());
    const hasPhone = Boolean(phoneField?.value.trim());
    const hasOne = hasEmail || hasPhone;
    if (emailField) {
      emailField.required = needsEmail;
      emailField.setCustomValidity(needsEmail && !hasEmail ? 'Bitte geben Sie Ihre E-Mail-Adresse ein.' : '');
    }
    if (phoneField) {
      phoneField.required = needsPhone;
      const message = needsPhone && !hasPhone
        ? 'Bitte geben Sie eine Telefonnummer an, unter der wir Sie erreichen können.'
        : (!needsEmail && !needsPhone && !hasOne ? 'Bitte geben Sie eine Telefonnummer oder E-Mail-Adresse an.' : '');
      phoneField.setCustomValidity(message);
    }
    if (emailMarker) emailMarker.hidden = !needsEmail;
    if (phoneMarker) phoneMarker.hidden = !needsPhone;
    if (emailOptional) emailOptional.hidden = needsEmail;
    if (phoneOptional) phoneOptional.hidden = needsPhone;
    const contactPanel = form.querySelector('[data-stage-panel="4"]');
    if (contactError) contactError.hidden = hasOne || needsEmail || needsPhone || !contactPanel?.classList.contains('is-attempted');
  }

  const updateStageStates = () => {
    updateProgress();
    requestAnimationFrame(updateAllScrollCues);
  };

  const openStage = (stage, options = {}) => {
    if (pathValue() === 'sturmschaden') return;
    const target = Number(stage);
    if (target < 1 || target > 4) return;
    activeStage = target;
    standardPanels.forEach((panel) => { panel.hidden = Number(panel.dataset.stagePanel) !== target; });
    form.querySelector(`[data-stage-panel="${target}"] .b2b-stage-scroll`)?.scrollTo({ top: 0, behavior: 'auto' });
    updateStageStates();
    const title = form.querySelector(`#private-stage-title-${target}`);
    if (options.focus) title?.focus({ preventScroll: true });
    if (options.scroll && window.matchMedia('(max-width: 900px)').matches) title?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeFileInputs = () => [standardFiles, acuteFiles].filter((input) => input && !input.disabled);
  const fileSelectionFor = (input) => input === acuteFiles ? document.getElementById('akutUploadSelection') : document.getElementById('uploadSelection');

  const validateFileInput = (input) => {
    if (!input || input.disabled) return true;
    const upload = input.closest('.b2b-upload');
    const output = fileSelectionFor(input);
    input.setCustomValidity('');
    upload?.classList.remove('is-invalid');
    const selected = Array.from(input.files || []);
    if (!selected.length) {
      if (output) output.textContent = 'Noch keine Datei ausgewählt';
      return true;
    }
    const allowed = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']);
    const total = selected.reduce((sum, file) => sum + file.size, 0);
    const invalidType = selected.some((file) => {
      const parts = file.name.toLowerCase().split('.');
      return parts.length < 2 || !allowed.has(parts.pop());
    });
    let message = '';
    if (selected.length > 5) message = 'Bitte wählen Sie höchstens 5 Dateien aus.';
    else if (total > 12 * 1024 * 1024) message = 'Die Dateien dürfen zusammen höchstens 12 MB groß sein.';
    else if (invalidType) message = 'Bitte verwenden Sie nur PDF, JPG/JPEG, PNG, WebP oder HEIC/HEIF.';
    input.setCustomValidity(message);
    upload?.classList.toggle('is-invalid', Boolean(message));
    if (output) {
      if (message) output.textContent = message;
      else {
        const size = total >= 1024 * 1024 ? `${(total / (1024 * 1024)).toFixed(1)} MB` : `${Math.ceil(total / 1024)} KB`;
        output.textContent = `${selected.map((file) => file.name).join(', ')} · ${size}`;
      }
    }
    return !message;
  };

  const validateFiles = () => activeFileInputs().every(validateFileInput);
  const setFieldMessage = (field) => {
    if (!field?.dataset.errorMessage) return;
    field.setCustomValidity('');
    if (!field.checkValidity()) field.setCustomValidity(field.dataset.errorMessage);
  };
  const firstInvalid = (root) => Array.from(root.querySelectorAll('input,select,textarea')).find((field) => isActive(field) && !field.checkValidity());
  const focusInvalid = (field) => {
    if (!field) return;
    field.closest('.b2b-form-group')?.classList.add('is-invalid');
    field.reportValidity();
    field.focus({ preventScroll: true });
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const validateStage = (stage) => {
    const panel = form.querySelector(`[data-stage-panel="${stage}"]`);
    panel?.classList.add('is-attempted');
    syncConditionalFields();
    syncRouteRequirements();
    syncContactRequirements();
    validateFiles();
    Array.from(panel?.querySelectorAll('[data-error-message]') || []).filter(isActive).forEach(setFieldMessage);
    const invalid = panel ? firstInvalid(panel) : null;
    if (invalid) {
      focusInvalid(invalid);
      return false;
    }
    updateStageStates();
    return true;
  };

  const validateActiveForm = () => {
    const acute = pathValue() === 'sturmschaden';
    if (acute) acutePanel?.classList.add('is-attempted');
    else standardPanels.forEach((panel) => panel.classList.add('is-attempted'));
    syncConditionalFields();
    syncRouteRequirements();
    syncContactRequirements();
    const filesValid = validateFiles();
    const root = acute ? acutePanel : workspace;
    Array.from(root?.querySelectorAll('[data-error-message]') || []).filter(isActive).forEach(setFieldMessage);
    const invalid = root ? firstInvalid(root) : null;
    if (invalid || !filesValid) {
      const target = invalid || activeFileInputs().find((input) => !input.checkValidity());
      const panel = target?.closest('[data-stage-panel]');
      if (panel) openStage(panel.dataset.stagePanel);
      focusInvalid(target);
      return false;
    }
    return true;
  };

  const updateWhatsappLink = () => {
    const path = pathLabels[pathValue()] || 'ein Gartenprojekt';
    const name = (pathValue() === 'sturmschaden' ? findAcute('name') : findStandard('name'))?.value.trim();
    const place = (pathValue() === 'sturmschaden' ? findAcute('ort') : findStandard('ort'))?.value.trim();
    let message = `Hallo Herr Rohdich, ich interessiere mich für ${path}.`;
    if (name) message += ` Mein Name ist ${name}.`;
    if (place) message += ` Der Standort liegt in ${place}.`;
    message += ' Bitte melden Sie sich zur kurzen Abstimmung.';
    const href = `https://wa.me/491711738943?text=${encodeURIComponent(message)}`;
    whatsappLinks.forEach((link) => link.setAttribute('href', href));
  };

  const showStatus = (message, state = 'error') => {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.dataset.state = state;
    statusBox.hidden = false;
    statusBox.focus({ preventScroll: true });
    statusBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const renderConfirmationSummary = () => {
    if (!confirmationSummary) return;
    const path = pathValue();
    const place = (path === 'sturmschaden' ? findAcute('ort') : findStandard('ort'))?.value.trim() || '–';
    const timeframe = path === 'sturmschaden' ? 'Akute Meldung' : (timeframeLabels[checkedValue('zeitrahmen')] || '–');
    const label = path === 'weitere' ? `${pathLabels[path]} – ${subrouteValue() || 'Anliegen'}` : (pathLabels[path] || 'Anfrage');
    const rows = [['Anliegen', label], ['Standort', place], ['Zeitrahmen', timeframe]];
    confirmationSummary.replaceChildren();
    rows.forEach(([term, value]) => {
      const wrapper = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = term;
      dd.textContent = value;
      wrapper.append(dt, dd);
      confirmationSummary.append(wrapper);
    });
    confirmationSummary.hidden = false;
  };

  const showConfirmation = () => {
    updateProgress(true);
    confirmation?.classList.add('is-visible');
    confirmation?.focus({ preventScroll: true });
    confirmation?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState({}, '', `${location.pathname}?status=success#anfrage-erfolg`);
  };

  const prefillMap = {
    gartengestaltung: ['garten', 'komplett'], garten: ['garten', 'komplett'],
    vorgarten: ['vorgarten', 'komplett'],
    terrasse: ['baulich', 'terrasse'], 'terrasse / pflasterarbeiten': ['baulich', 'pflaster'],
    terrasse_pflaster: ['baulich', 'pflaster'],
    bepflanzung: ['bepflanzung_pflege', 'neupflanzung'], gartenpflege: ['bepflanzung_pflege', 'allgemein'],
    allgemein: ['bepflanzung_pflege', 'allgemein'],
    palmen: ['bepflanzung_pflege', 'palmen'], 'palmen / winterfeste bepflanzung': ['bepflanzung_pflege', 'palmen'],
    baumarbeiten: ['baeume', 'faellung'], 'baumarbeiten / baumfällung': ['baeume', 'faellung'],
    baumkontrolle: ['baeume', 'verkehrssicherheit'],
    teichbau: ['wasser', 'teich_neu'], teich: ['wasser', 'teich_neu'], teich_wasser: ['wasser', 'teich_neu'],
    'teich / wasser im garten': ['wasser', 'teich_neu'],
    'pool- / whirlpool-umfeld': ['wasser', 'poolumfeld'], pool_whirlpool: ['wasser', 'poolumfeld'],
    dachbegruenung: ['weitere', 'dach'], holzverkauf: ['weitere', 'holz'], brennholz: ['weitere', 'holz'],
    sturmnotdienst: ['sturmschaden', ''], sturmschaden: ['sturmschaden', ''],
    unsicher: ['unsicher', ''], sonstiges: ['weitere', 'anderes'],
    gestaltung: ['garten', ''], pflege: ['bepflanzung_pflege', ''],
    baumkontrolle_alt: ['baeume', 'verkehrssicherheit'], holz: ['weitere', 'holz'],
    // AP-100: Taxonomie-Slugs mit Bindestrich, damit jeder Slug aus
    // content/taxonomie.json als ?leistung=-Wert funktioniert (Galerie-CTA).
    'terrasse-pflasterarbeiten': ['baulich', 'pflaster'],
    'palmen-winterfest': ['bepflanzung_pflege', 'palmen'],
    'pool-whirlpool-umfeld': ['wasser', 'poolumfeld']
  };

  const prefill = (path, service) => {
    let resolvedPath = String(path || '').trim().toLowerCase();
    let resolvedService = String(service || '').trim().toLowerCase();
    const serviceMapped = resolvedService ? prefillMap[resolvedService] : null;
    if (serviceMapped) [resolvedPath, resolvedService] = serviceMapped;
    else if (!pathLabels[resolvedPath]) {
      const legacy = prefillMap[resolvedPath];
      if (legacy) [resolvedPath, resolvedService] = legacy;
    }
    if (!pathLabels[resolvedPath]) return;
    const pathInput = form.querySelector(`[name="hauptpfad"][value="${CSS.escape(resolvedPath)}"]`);
    if (pathInput) pathInput.checked = true;
    applyPath(resolvedPath, { focus: resolvedPath === 'sturmschaden' });

    if (resolvedPath === 'weitere' && ['dach', 'holz', 'anderes'].includes(resolvedService)) {
      const subroute = form.querySelector(`[name="weitere_art"][value="${resolvedService}"]`);
      if (subroute) subroute.checked = true;
      applySubroute(resolvedService);
    } else {
      const names = {
        garten: 'gartenprojekt[]', vorgarten: 'vorgartenprojekt[]', baulich: 'bauprojekt[]',
        bepflanzung_pflege: 'pflegeprojekt[]', baeume: 'baumleistung[]', wasser: 'wasserprojekt[]'
      };
      const name = names[resolvedPath];
      if (name && resolvedService) {
        const input = form.querySelector(`[name="${name}"][value="${CSS.escape(resolvedService)}"]`);
        if (input) input.checked = true;
      }
    }
    syncConditionalFields();
    syncRouteRequirements();
    updateStageStates();
  };

  form.classList.add('is-enhanced');
  form.noValidate = true;
  if (jsEnabled) jsEnabled.value = '1';
  setupScrollFrames();
  standardPanels.forEach((panel) => setControlsEnabled(panel, true));
  setRouteVisibility('');
  setControlsEnabled(acutePanel, false);
  openStage(1);

  optionalDetails.forEach((details, index) => {
    const summary = details.querySelector(':scope > summary');
    const content = details.querySelector(':scope > .private-optional-content');
    if (summary && content) {
      const id = content.id || `private-optional-content-${index + 1}`;
      content.id = id;
      summary.setAttribute('aria-controls', id);
      summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
    }
    details.addEventListener('toggle', () => {
      summary?.setAttribute('aria-expanded', details.open ? 'true' : 'false');
      updateOptionalSummaries();
      requestAnimationFrame(updateAllScrollCues);
    });
  });

  form.querySelectorAll('[data-stage-next]').forEach((button) => button.addEventListener('click', () => {
    window.clearTimeout(autoAdvanceTimer);
    if (!validateStage(activeStage)) return;
    if (activeStage === 1) {
      const path = pathValue();
      applyPath(path, { focus: path === 'sturmschaden' });
      if (path === 'sturmschaden') return;
    }
    openStage(button.dataset.stageNext, { focus: true, scroll: true });
  }));
  form.querySelectorAll('[data-stage-back]').forEach((button) => button.addEventListener('click', () => openStage(button.dataset.stageBack, { focus: true, scroll: true })));

  form.querySelectorAll('[data-return-path]').forEach((button) => button.addEventListener('click', () => {
    copySharedValues(true);
    const storm = form.querySelector('[name="hauptpfad"][value="sturmschaden"]');
    if (storm) {
      storm.checked = false;
      storm.blur();
    }
    previousPath = 'sturmschaden';
    applyPath('', { focus: false });
    openStage(1, { scroll: true });
    document.getElementById('private-stage-title-1')?.focus({ preventScroll: true });
  }));

  form.querySelectorAll('[data-private-emergency-shortcut]').forEach((shortcut) => {
    shortcut.addEventListener('click', (event) => {
      event.preventDefault();
      const viewportPosition = { x: window.scrollX, y: window.scrollY };
      window.clearTimeout(autoAdvanceTimer);
      const storm = form.querySelector('[name="hauptpfad"][value="sturmschaden"]');
      if (!storm) return;
      storm.checked = true;
      applyPath('sturmschaden', { focus: false });
      requestAnimationFrame(() => {
        window.scrollTo({ left: viewportPosition.x, top: viewportPosition.y, behavior: 'auto' });
        requestAnimationFrame(() => window.scrollTo({ left: viewportPosition.x, top: viewportPosition.y, behavior: 'auto' }));
      });
    });
  });

  pathInputs.forEach((input) => {
    const choice = input.closest('label');
    const rememberPointerChoice = () => { pointerPathInput = input; };
    const releasePointerChoice = () => window.setTimeout(() => {
      if (pointerPathInput === input) pointerPathInput = null;
    }, 0);
    choice?.addEventListener('pointerdown', rememberPointerChoice);
    choice?.addEventListener('pointerup', releasePointerChoice);
    choice?.addEventListener('pointercancel', releasePointerChoice);
    input.addEventListener('change', () => {
      window.clearTimeout(autoAdvanceTimer);
      const triggeredByPointer = pointerPathInput === input;
      pointerPathInput = null;
      if (!triggeredByPointer) {
        applyPath(input.value, { focus: false });
        return;
      }
      autoAdvanceTimer = window.setTimeout(() => {
        if (!input.checked || pathValue() !== input.value) return;
        applyPath(input.value, { focus: input.value === 'sturmschaden' });
        if (input.value !== 'sturmschaden') openStage(2, { focus: false, scroll: false });
      }, 350);
    });
  });

  form.addEventListener('change', (event) => {
    const input = event.target;
    if (input.matches('[name="weitere_art"]')) {
      applySubroute(input.value);
      return;
    }
    if (input instanceof HTMLInputElement && input.type === 'checkbox' && input.checked && input.name) {
      const group = Array.from(form.querySelectorAll(`[name="${CSS.escape(input.name)}"]`)).filter((other) => !other.disabled);
      if (input.matches('[data-exclusive-choice]')) group.filter((other) => other !== input).forEach((other) => { other.checked = false; });
      else group.filter((other) => other.matches('[data-exclusive-choice]')).forEach((other) => { other.checked = false; });
    }
    syncConditionalFields();
  });

  form.addEventListener('input', (event) => {
    if (event.target.matches('[data-error-message]')) event.target.setCustomValidity('');
    form.querySelectorAll('.b2b-form-group.is-invalid').forEach((group) => group.classList.remove('is-invalid'));
    syncContactRequirements();
    updateStageStates();
    updateWhatsappLink();
    updateOptionalSummaries();
  });
  form.addEventListener('change', () => {
    syncConditionalFields();
    syncRouteRequirements();
    syncContactRequirements();
    updateStageStates();
    updateWhatsappLink();
    updateOptionalSummaries();
    requestAnimationFrame(updateAllScrollCues);
  });

  window.addEventListener('resize', () => requestAnimationFrame(updateAllScrollCues), { passive: true });
  desktopScrollQuery.addEventListener?.('change', () => requestAnimationFrame(updateAllScrollCues));
  [standardFiles, acuteFiles].filter(Boolean).forEach((input) => input.addEventListener('change', () => {
    validateFileInput(input);
    updateStageStates();
    updateOptionalSummaries();
  }));

  document.querySelectorAll('[data-prefill-bereich]').forEach((link) => link.addEventListener('click', () => {
    prefill('', link.getAttribute('data-prefill-bereich'));
    if (pathValue() !== 'sturmschaden') openStage(1);
  }));

  const scrollToRequestForm = (behavior = 'smooth') => {
    const target = document.getElementById('anfrage');
    if (!target) return;
    // Unterhalb 1161px wird .private-form-main fuer die responsive Reihenfolge
    // zu display:contents. Der Anker hat dann keine eigene Box und
    // scrollIntoView() springt wirkungslos an den Dokumentanfang. In diesem
    // Layout ist der sichtbare Formularkopf das semantisch gleiche Ziel.
    const scrollTarget = target.querySelector('.b2b-form-head, [data-form-progress], [data-stage-panel="1"]') || target;
    if (!scrollTarget) return;
    // Pfadwechsel (insbesondere der Akutpfad) verändern die Formularhöhe und
    // stellen den bisherigen Viewport über zwei Frames wieder her. Erst danach
    // darf der gemeinsame Anfrage-Anker seine endgültige Position anfahren.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      scrollTarget.scrollIntoView({ behavior, block: 'start' });
    }));
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || (link.target && link.target !== '_self')) return;
    const targetUrl = new URL(link.href, location.href);
    const isLocalRequestAnchor = targetUrl.origin === location.origin
      && targetUrl.pathname === location.pathname
      && targetUrl.search === location.search
      && targetUrl.hash === '#anfrage';
    if (!isLocalRequestAnchor) return;
    event.preventDefault();
    if (location.hash !== '#anfrage') history.pushState({}, '', targetUrl.href);
    scrollToRequestForm(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  });

  const query = new URLSearchParams(location.search);
  const queryPath = query.get('pfad');
  const queryService = query.get('leistung') || query.get('bereich');
  if (queryPath || queryService) prefill(queryPath, queryService);

  if (location.hash === '#anfrage' || location.hash === '#anfrage-erfolg') {
    const projectGrid = document.querySelector('[data-projekte-privat]');
    const anchorTarget = document.querySelector(location.hash);
    if (location.hash === '#anfrage') scrollToRequestForm('auto');
    if (projectGrid && anchorTarget && 'MutationObserver' in window) {
      const observer = new MutationObserver(() => {
        if (location.hash === '#anfrage') scrollToRequestForm('auto');
        else requestAnimationFrame(() => anchorTarget.scrollIntoView({ block: 'start' }));
        observer.disconnect();
      });
      observer.observe(projectGrid, { childList: true });
      window.setTimeout(() => observer.disconnect(), 5000);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateActiveForm()) return;
    // Auf dem statischen Hosting wird nur dann gesendet, wenn später bewusst ein
    // Backend über data-endpoint angebunden wird. Ohne Endpoint bleiben die Daten
    // im Browser und es wird keine erfolgreiche Übermittlung vorgetäuscht.
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      showStatus('Ihre Angaben sind vollständig, das Formular ist aber noch nicht angebunden – es wird nichts versendet. Bitte schicken Sie uns Ihre Anfrage per E-Mail an maik@rohdich.de oder melden Sie sich telefonisch oder per WhatsApp.');
      return;
    }
    const submitButton = Array.from(form.querySelectorAll('button[type="submit"]:not(:disabled)')).find(isActive);
    const submitLabel = submitButton?.querySelector('[data-submit-label]');
    const originalLabel = submitLabel?.textContent || 'Anfrage senden';
    if (submitButton) submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Anfrage wird übermittelt …';
    if (statusBox) statusBox.hidden = true;
    try {
      const response = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
      const result = await response.json().catch(() => ({ ok: false, state: 'send' }));
      if (!response.ok || !result.ok) throw new Error(result.state || 'send');
      renderConfirmationSummary();
      form.reset();
      showConfirmation();
    } catch (error) {
      const messages = {
        validation: 'Bitte prüfen Sie die markierten Angaben. Ihre bisherigen Eingaben bleiben erhalten.',
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

  applyPath(pathValue(), { focus: false });
  updateWhatsappLink();
  updateOptionalSummaries();
})();

// Privatkunden-Leistungskarten: zugängliche Flip-Interaktion mit nur einer offenen Karte.
(() => {
  'use strict';

  const section = document.querySelector('.private-request-paths');
  const cards = Array.from(section?.querySelectorAll('[data-service-flip]') || []);
  if (!section || !cards.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const focusDelay = 580;
  let activeCard = null;

  const scheduleFocus = (card, target) => {
    window.clearTimeout(card._privateFlipFocusTimer);
    card._privateFlipFocusTimer = window.setTimeout(() => {
      target?.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : focusDelay);
  };

  const updateCard = (card, expanded, { moveFocus = true } = {}) => {
    const front = card.querySelector('[data-service-front]');
    const back = card.querySelector('[data-service-back]');
    const openButton = card.querySelector('[data-service-open]');
    const closeButton = card.querySelector('[data-service-close]');
    if (!front || !back || !openButton || !closeButton) return;

    card.classList.toggle('is-flipped', expanded);
    openButton.setAttribute('aria-expanded', String(expanded));
    front.setAttribute('aria-hidden', String(expanded));
    back.setAttribute('aria-hidden', String(!expanded));
    front.inert = expanded;
    back.inert = !expanded;

    if (moveFocus) scheduleFocus(card, expanded ? closeButton : openButton);
  };

  const closeCard = (card, options) => {
    if (!card) return;
    updateCard(card, false, options);
    if (activeCard === card) activeCard = null;
  };

  const openCard = (card) => {
    if (activeCard && activeCard !== card) closeCard(activeCard, { moveFocus: false });
    activeCard = card;
    updateCard(card, true);
  };

  cards.forEach((card) => {
    const openButton = card.querySelector('[data-service-open]');
    const closeButton = card.querySelector('[data-service-close]');
    const front = card.querySelector('[data-service-front]');
    const back = card.querySelector('[data-service-back]');
    if (!openButton || !closeButton || !front || !back) return;

    front.inert = false;
    back.inert = true;
    openButton.addEventListener('click', () => openCard(card));
    closeButton.addEventListener('click', () => closeCard(card));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !activeCard) return;
    event.preventDefault();
    closeCard(activeCard);
  });
})();

// Mobile Vertrauensliste: kompakte Einzelausklapper mit sicherem Volltext-Fallback.
(() => {
  'use strict';

  const section = document.querySelector('[data-private-partner-disclosures]');
  const entries = Array.from(section?.querySelectorAll('[data-private-partner-benefit]') || []);
  if (!section || !entries.length) return;

  const mobile = window.matchMedia('(max-width: 767px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 260;
  const easing = 'cubic-bezier(.22,.61,.36,1)';
  const states = new WeakMap();

  const getState = (entry) => {
    if (!states.has(entry)) {
      states.set(entry, {
        animation: null,
        detailAnimations: [],
        targetExpanded: false
      });
    }
    return states.get(entry);
  };

  const getToggle = (entry) => entry.querySelector('[data-private-partner-toggle]');
  const getTitle = (entry) => entry.querySelector('h3')?.textContent.trim() || '';
  const getDetails = (entry) => [
    entry.querySelector('.b2b-partner-label'),
    entry.querySelector('p')
  ].filter(Boolean);

  const setToggleState = (entry, expanded) => {
    const toggle = getToggle(entry);
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', `${expanded ? 'Weniger anzeigen' : 'Mehr erfahren'}: ${getTitle(entry)}`);
  };

  const applyState = (entry, expanded) => {
    entry.classList.toggle('is-expanded', expanded);
    setToggleState(entry, expanded);
    getState(entry).targetExpanded = expanded;
  };

  const clearMotionStyles = (entry) => {
    entry.classList.remove('is-opening', 'is-closing');
    entry.style.removeProperty('height');
    entry.style.removeProperty('overflow');
  };

  const stopAnimations = (entry) => {
    const state = getState(entry);
    state.animation?.cancel();
    state.detailAnimations.forEach((animation) => animation.cancel());
    state.animation = null;
    state.detailAnimations = [];
  };

  const finishImmediately = (entry, expanded) => {
    stopAnimations(entry);
    applyState(entry, expanded);
    clearMotionStyles(entry);
  };

  const measureTargetHeight = (entry, expanded) => {
    const wasExpanded = entry.classList.contains('is-expanded');
    entry.style.removeProperty('height');
    entry.classList.toggle('is-expanded', expanded);
    const targetHeight = entry.getBoundingClientRect().height;
    entry.classList.toggle('is-expanded', wasExpanded);
    return targetHeight;
  };

  const animateEntry = (entry, expanded) => {
    const state = getState(entry);
    if (state.animation) finishImmediately(entry, state.targetExpanded);

    state.targetExpanded = expanded;
    if (reducedMotion.matches || typeof entry.animate !== 'function') {
      finishImmediately(entry, expanded);
      return;
    }

    const currentHeight = entry.getBoundingClientRect().height;
    const targetHeight = measureTargetHeight(entry, expanded);

    if (expanded) entry.classList.add('is-expanded');
    setToggleState(entry, expanded);
    entry.style.height = `${currentHeight}px`;
    entry.style.overflow = 'clip';
    entry.classList.toggle('is-opening', expanded);
    entry.classList.toggle('is-closing', !expanded);

    state.animation = entry.animate(
      { height: [`${currentHeight}px`, `${targetHeight}px`] },
      { duration, easing }
    );
    state.detailAnimations = getDetails(entry).map((detail) => detail.animate(
      { opacity: expanded ? [0,1] : [1,0] },
      { duration: Math.round(duration * .72), easing, fill: 'both' }
    ));

    const activeAnimation = state.animation;
    activeAnimation.addEventListener('finish', () => {
      if (state.animation !== activeAnimation) return;
      state.animation = null;
      state.detailAnimations.forEach((animation) => animation.cancel());
      state.detailAnimations = [];
      applyState(entry, expanded);
      clearMotionStyles(entry);
    }, { once: true });
  };

  const syncMode = () => {
    entries.forEach((entry) => finishImmediately(entry, false));
    section.classList.toggle('has-partner-disclosures', mobile.matches);
  };

  entries.forEach((entry) => {
    const toggle = getToggle(entry);
    if (!toggle) return;
    getState(entry);
    setToggleState(entry, false);

    toggle.addEventListener('click', () => {
      if (!mobile.matches) return;
      const state = getState(entry);
      const shouldExpand = !state.targetExpanded;

      if (shouldExpand) {
        entries.forEach((other) => {
          if (other === entry) return;
          const otherState = getState(other);
          if (otherState.targetExpanded || other.classList.contains('is-expanded')) {
            animateEntry(other, false);
          }
        });
      }

      animateEntry(entry, shouldExpand);
    });
  });

  syncMode();
  mobile.addEventListener?.('change', syncMode);
  reducedMotion.addEventListener?.('change', () => {
    if (!reducedMotion.matches) return;
    entries.forEach((entry) => finishImmediately(entry, getState(entry).targetExpanded));
  });
})();

// Privatkunden-FAQ: weich animierte, voneinander unabhängige Akkordeon-Gruppen.
(() => {
  'use strict';

  const section = document.querySelector('.private-faq');
  const groups = Array.from(document.querySelectorAll('[data-private-faq-group]'));
  if (!section || !groups.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 280;
  const easing = 'cubic-bezier(.22,.61,.36,1)';
  const states = new WeakMap();

  const getState = (entry) => {
    if (!states.has(entry)) {
      states.set(entry, {
        animation: null,
        bodyAnimation: null,
        targetOpen: entry.open
      });
    }
    return states.get(entry);
  };

  const clearMotionStyles = (entry) => {
    entry.classList.remove('is-opening', 'is-closing');
    entry.style.removeProperty('height');
    entry.style.removeProperty('overflow');
    const body = entry.querySelector('.faq-body');
    body?.style.removeProperty('opacity');
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

    state.animation = entry.animate(
      { height: [`${currentHeight}px`, `${targetHeight}px`] },
      { duration, easing }
    );
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
            if (other === entry) return;
            const otherState = getState(other);
            if (otherState.targetOpen || other.open) animateEntry(other, false);
          });
        }

        animateEntry(entry, shouldOpen);
      });
    });
  });

  reducedMotion.addEventListener?.('change', () => {
    if (!reducedMotion.matches) return;
    groups.forEach((group) => {
      group.querySelectorAll(':scope > details').forEach((entry) => {
        finishImmediately(entry, getState(entry).targetOpen);
      });
    });
  });

  section.classList.add('is-faq-animated');
})();
