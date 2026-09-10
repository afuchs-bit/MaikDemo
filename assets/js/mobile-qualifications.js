(function () {
  'use strict';

  const qualificationGroups = document.querySelectorAll('[data-mobile-qualifications]');

  qualificationGroups.forEach((group) => {
    const buttons = Array.from(group.querySelectorAll('[data-qualification-target]'));
    const detailArea = group.querySelector('[data-qualification-details]');
    const hint = group.querySelector('[data-qualification-hint]');
    if (!buttons.length || !detailArea) return;

    const panels = Array.from(detailArea.querySelectorAll('.gate-welcome-qualification-panel'));

    const closeAll = () => {
      buttons.forEach((button) => button.setAttribute('aria-expanded', 'false'));
      panels.forEach((panel) => { panel.hidden = true; });
      detailArea.hidden = true;
      if (hint) hint.hidden = false;
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const shouldOpen = button.getAttribute('aria-expanded') !== 'true';
        closeAll();
        if (!shouldOpen) return;

        const panel = group.querySelector('#' + button.dataset.qualificationTarget);
        if (!panel) return;

        button.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
        detailArea.hidden = false;
        if (hint) hint.hidden = true;
      });
    });

    closeAll();
  });
})();
