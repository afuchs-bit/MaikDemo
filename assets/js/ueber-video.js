// assets/js/ueber-video.js
// AP-180/AP-182 – Mustergarten-Video: Schleife, 0,6-fache Geschwindigkeit, Start im Sichtfeld.
//
// Warum ueberhaupt ein Skript: playbackRate gibt es NUR als JavaScript-Eigenschaft.
// Fuer loop und muted existieren HTML-Attribute, fuer die Geschwindigkeit nicht.
//
// Warum kein autoplay-Attribut: Der Start haengt am Sichtfeld. Die Datei ist 9 MB
// gross; mit autoplay laedt sie bei jedem Seitenaufruf, auch fuer Besucher, die den
// Ueber-uns-Block nie erreichen. Mit preload="none" und einem Beobachter laedt sie
// erst, wenn der Block tatsaechlich in den Blick kommt. Ein autoplay-Attribut
// daneben wuerde beides gegeneinander laufen lassen.

(() => {
  'use strict';

  const video = document.querySelector('.mr-ueber__video');
  if (!video) return;

  // AP-182: von 0,75 auf 0,6 gesenkt. Die Untergrenze ist nicht Geschmack, sondern
  // die Bildrate der Quelle: gemessen 24 fps (72 Bilder in 3 s bei Tempo 1). Beim
  // Verlangsamen kommen keine Bilder hinzu, sie stehen nur laenger - 0,6 ergibt
  // effektiv 14,4 fps. Unter etwa 15 fps faengt eine Kamerafahrt sichtbar an zu
  // haken; 0,5 waeren 12 fps, 0,4 nur noch 9,6. Wer weiter verlangsamen will,
  // braucht Quellmaterial mit hoeherer Bildrate.
  const TEMPO = 0.6;

  // Die Rate wird an ZWEI Stellen gesetzt. Beim Schleifendurchlauf und nach einem
  // load() setzen manche Browser sie auf 1 zurueck - einmaliges Setzen reicht nicht.
  const tempoSetzen = () => { if (video.playbackRate !== TEMPO) video.playbackRate = TEMPO; };
  video.addEventListener('loadedmetadata', tempoSetzen);
  video.addEventListener('play', tempoSetzen);
  tempoSetzen();

  // Wer Bewegung systemweit reduziert hat, bekommt keinen Autostart. Die
  // Bedienelemente bleiben - von Hand starten geht weiterhin.
  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (ruhig.matches) return;

  if (!('IntersectionObserver' in window)) return;

  let geladen = false;

  const beobachter = new IntersectionObserver((eintraege) => {
    eintraege.forEach((eintrag) => {
      if (eintrag.isIntersecting) {
        if (!geladen) { video.preload = 'auto'; video.load(); geladen = true; }
        // play() liefert ein Promise, das der Browser ablehnen darf - etwa wenn eine
        // Sparsamkeitseinstellung greift. Dann bleibt das Video mit Bedienelementen
        // stehen, statt einen unbehandelten Fehler zu werfen.
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      } else if (!video.paused) {
        // Ausserhalb des Blicks nicht weiterlaufen lassen: spart Rechenzeit und Akku.
        video.pause();
      }
    });
  }, { threshold: 0.25 });

  beobachter.observe(video);
})();
