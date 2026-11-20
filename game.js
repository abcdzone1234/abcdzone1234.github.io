(() => {
  'use strict';

  const TOTAL_ROUNDS = 5;
  const ROUND_SECONDS = 120;
  const PLACES = [
    { name: 'Eiffel Tower', city: 'Paris, France', lat: 48.8584, lng: 2.2945, search: 'Eiffel Tower Paris', clue: 'This iron landmark was built for a world fair in the 19th century and was once intended to be temporary.' },
    { name: 'Colosseum', city: 'Rome, Italy', lat: 41.8902, lng: 12.4922, search: 'Colosseum Rome', clue: 'This ancient arena could hold tens of thousands of spectators and hosted public spectacles.' },
    { name: 'Taj Mahal', city: 'Agra, India', lat: 27.1751, lng: 78.0421, search: 'Taj Mahal Agra', clue: 'Built in the 17th century, this white-marble monument was commissioned as a memorial by an emperor.' },
    { name: 'Statue of Liberty', city: 'New York City, USA', lat: 40.6892, lng: -74.0445, search: 'Statue of Liberty New York', clue: 'A gift from France, this island landmark has welcomed many visitors arriving by sea.' },
    { name: 'Sydney Opera House', city: 'Sydney, Australia', lat: -33.8568, lng: 151.2153, search: 'Sydney Opera House Australia', clue: 'Its distinctive sail-like roof sits beside a famous harbor in the Southern Hemisphere.' },
    { name: 'Christ the Redeemer', city: 'Rio de Janeiro, Brazil', lat: -22.9519, lng: -43.2105, search: 'Christ the Redeemer Rio de Janeiro', clue: 'This monumental statue stands high above a coastal city, with a sweeping view of its bay.' },
    { name: 'Machu Picchu', city: 'Cusco Region, Peru', lat: -13.1631, lng: -72.5450, search: 'Machu Picchu Peru', clue: 'This historic mountain citadel was built by the Inca in the Andes.' },
    { name: 'Great Pyramid of Giza', city: 'Giza, Egypt', lat: 29.9792, lng: 31.1342, search: 'Great Pyramid of Giza Egypt', clue: 'The oldest of the Seven Wonders of the Ancient World still stands on a desert plateau.' },
    { name: 'Golden Gate Bridge', city: 'San Francisco, USA', lat: 37.8199, lng: -122.4783, search: 'Golden Gate Bridge San Francisco', clue: 'This orange-red suspension bridge crosses the entrance to a large Pacific coast bay.' },
    { name: 'Mount Fuji', city: 'Honshu, Japan', lat: 35.3606, lng: 138.7274, search: 'Mount Fuji Japan', clue: 'Japan’s highest mountain is a near-symmetrical volcano and a frequent subject of art.' },
    { name: 'Sagrada Família', city: 'Barcelona, Spain', lat: 41.4036, lng: 2.1744, search: 'Sagrada Familia Barcelona', clue: 'Construction of this elaborate basilica began in the 19th century and continued for generations.' },
    { name: 'Chichén Itzá', city: 'Yucatán, Mexico', lat: 20.6843, lng: -88.5678, search: 'Chichen Itza Mexico', clue: 'This archaeological site includes a stepped pyramid built by the Maya civilization.' },
    { name: 'Big Ben', city: 'London, United Kingdom', lat: 51.5007, lng: -0.1246, search: 'Elizabeth Tower Big Ben London', clue: 'This famous clock tower stands beside the River Thames and the UK Parliament.' },
    { name: 'Angkor Wat', city: 'Siem Reap, Cambodia', lat: 13.4125, lng: 103.8670, search: 'Angkor Wat Cambodia', clue: 'This vast temple complex began as a Hindu temple and later became a Buddhist site.' }
  ];

  const $ = (id) => document.getElementById(id);
  const ui = {
    roundTitle: $('round-title'), roundPill: $('round-pill'), photo: $('location-photo'), placeholder: $('photo-placeholder'),
    photoLabel: $('photo-label'), photoCredit: $('photo-credit'), clue: $('clue-text'), start: $('start-button'),
    guess: $('guess-button'), next: $('next-button'), hint: $('action-hint'), timer: $('timer'), timerText: $('timer-text'),
    mapMessage: $('map-message'), result: $('result-card'), resultEyebrow: $('result-eyebrow'), resultTitle: $('result-title'),
    resultDetail: $('result-detail'), resultPoints: $('result-points')
  };

  let map;
  let rounds = [];
  let roundIndex = 0;
  let secondsLeft = ROUND_SECONDS;
  let scoreTotal = 0;
  let active = false;
  let guessMarker = null;
  let answerMarker = null;
  let answerLine = null;
  let timerHandle = null;
  let photoRequest = 0;

  function initMap() {
    if (!window.L) {
      ui.mapMessage.textContent = 'The map library did not load. Check your connection and refresh the page.';
      ui.start.disabled = true;
      return;
    }
    map = L.map('map', { worldCopyJump: true, minZoom: 2 }).setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);
    map.on('click', (event) => {
      if (!active) return;
      if (!guessMarker) {
        guessMarker = L.circleMarker(event.latlng, { radius: 8, color: '#172010', weight: 2, fillColor: '#c9ef77', fillOpacity: 1 }).addTo(map);
      } else {
        guessMarker.setLatLng(event.latlng);
      }
      ui.mapMessage.textContent = `Your pin: ${event.latlng.lat.toFixed(2)}°, ${event.latlng.lng.toFixed(2)}°. Click elsewhere to move it.`;
      ui.guess.disabled = false;
    });
  }

  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function startGame() {
    if (!map) return;
    rounds = shuffle(PLACES).slice(0, TOTAL_ROUNDS);
    roundIndex = 0;
    scoreTotal = 0;
    ui.start.hidden = true;
    ui.result.hidden = true;
    showRound();
  }

  function showRound() {
    clearInterval(timerHandle);
    active = true;
    secondsLeft = ROUND_SECONDS;
    guessMarker = null;
    answerMarker = null;
    answerLine = null;
    if (map) {
      map.eachLayer((layer) => {
        if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) map.removeLayer(layer);
      });
      map.setView([20, 0], 2);
    }
    const place = rounds[roundIndex];
    ui.roundTitle.textContent = 'Where are we?';
    ui.roundPill.innerHTML = `ROUND <b>${String(roundIndex + 1).padStart(2, '0')} / ${TOTAL_ROUNDS}</b>`;
    ui.clue.textContent = place.clue;
    ui.mapMessage.textContent = 'Click or tap anywhere on the map to place your guess.';
    ui.guess.hidden = false;
    ui.guess.disabled = true;
    ui.next.hidden = true;
    ui.hint.textContent = 'You can move your pin before submitting.';
    ui.result.hidden = true;
    ui.timer.classList.remove('is-low');
    updateTimer();
    loadPhoto(place);
    timerHandle = setInterval(() => {
      secondsLeft -= 1;
      updateTimer();
      if (secondsLeft <= 0) submitGuess(true);
    }, 1000);
  }

  function updateTimer() {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    ui.timerText.textContent = `${minutes}:${seconds}`;
    ui.timer.classList.toggle('is-low', secondsLeft <= 20);
    ui.timer.setAttribute('aria-label', `${minutes} minutes ${seconds} seconds remaining`);
  }

  async function loadPhoto(place) {
    const requestId = ++photoRequest;
    ui.photo.hidden = true;
    ui.photoLabel.hidden = true;
    ui.photoCredit.hidden = true;
    ui.photoCredit.replaceChildren();
    ui.placeholder.hidden = false;
    ui.placeholder.innerHTML = '<span class="placeholder-icon" aria-hidden="true">✳</span><span>Looking for a freely licensed photo…</span>';
    try {
      const params = new URLSearchParams({
        action: 'query', generator: 'search', gsrsearch: `filetype:bitmap ${place.search}`,
        gsrnamespace: '6', gsrlimit: '12', prop: 'imageinfo', iiprop: 'url|extmetadata',
        iiurlwidth: '1400', format: 'json', origin: '*'
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
      if (!response.ok) throw new Error('Photo request failed');
      const data = await response.json();
      if (requestId !== photoRequest) return;
      const pages = Object.values(data.query?.pages || {});
      const chosen = pages.find((page) => page.imageinfo?.[0]?.thumburl && !/\.svg(?:$|\?)/i.test(page.imageinfo[0].thumburl));
      if (!chosen) throw new Error('No matching photo found');
      const info = chosen.imageinfo[0];
      ui.photo.onload = () => {
        if (requestId !== photoRequest) return;
        ui.placeholder.hidden = true;
        ui.photo.hidden = false;
        ui.photoLabel.hidden = false;
      };
      ui.photo.onerror = () => {
        if (requestId === photoRequest) showPhotoFallback();
      };
      ui.photo.alt = `Wikimedia Commons photo: ${chosen.title.replace(/^File:/, '')}`;
      ui.photo.src = info.thumburl;
      const fileUrl = info.descriptionurl || info.url;
      const metadata = info.extmetadata || {};
      const artist = stripHtml(metadata.Artist?.value || metadata.Credit?.value || 'Wikimedia Commons contributor');
      const license = stripHtml(metadata.LicenseShortName?.value || 'See source page for license');
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Photo and license';
      ui.photoCredit.append(document.createTextNode(`Photo: ${artist} · ${license} · `), link);
      ui.photoCredit.hidden = false;
    } catch (error) {
      if (requestId === photoRequest) showPhotoFallback();
    }
  }

  function stripHtml(value) {
    const node = document.createElement('div');
    node.innerHTML = value;
    return (node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function showPhotoFallback() {
    ui.photo.hidden = true;
    ui.photoLabel.hidden = true;
    ui.photoCredit.hidden = true;
    ui.placeholder.hidden = false;
    ui.placeholder.innerHTML = '<span class="placeholder-icon" aria-hidden="true">✳</span><span>Photo unavailable this round.<br>Use the clue and explore the map.</span>';
  }

  function submitGuess(timedOut = false) {
    if (!active) return;
    if (!guessMarker && !timedOut) {
      ui.mapMessage.textContent = 'Drop a pin on the map first, then submit your guess.';
      return;
    }
    active = false;
    clearInterval(timerHandle);
    const place = rounds[roundIndex];
    const target = L.latLng(place.lat, place.lng);
    let distance = null;
    let points = 0;
    if (guessMarker) {
      distance = guessMarker.getLatLng().distanceTo(target) / 1000;
      points = Math.round(5000 * Math.exp(-distance / 2000));
    }
    scoreTotal += points;
    answerMarker = L.circleMarker(target, { radius: 9, color: '#fff', weight: 2, fillColor: '#f07457', fillOpacity: 1 }).addTo(map);
    if (guessMarker) {
      answerLine = L.polyline([guessMarker.getLatLng(), target], { color: '#263b25', weight: 2, dashArray: '5 7' }).addTo(map);
      const bounds = L.latLngBounds([guessMarker.getLatLng(), target]).pad(.28);
      map.fitBounds(bounds, { maxZoom: 6 });
    } else {
      map.setView(target, 5);
    }
    ui.roundTitle.textContent = place.name;
    ui.mapMessage.textContent = `The answer was ${place.city}.`;
    ui.guess.hidden = true;
    ui.next.hidden = false;
    ui.hint.textContent = '';
    ui.result.hidden = false;
    ui.resultEyebrow.textContent = timedOut && !guessMarker ? 'TIME IS UP' : 'ROUND COMPLETE';
    ui.resultTitle.textContent = timedOut && !guessMarker ? 'No pin placed' : distance < 50 ? 'Incredible — right on target!' : distance < 300 ? 'Great sense of direction!' : distance < 1000 ? 'Not too far off!' : 'Keep exploring!';
    ui.resultDetail.textContent = guessMarker ? `${Math.round(distance).toLocaleString()} km from ${place.name} · Total: ${scoreTotal.toLocaleString()} points` : `${place.name} is in ${place.city}. Total: ${scoreTotal.toLocaleString()} points`;
    ui.resultPoints.textContent = points.toLocaleString();
    ui.next.innerHTML = roundIndex === TOTAL_ROUNDS - 1 ? 'See final score <span aria-hidden="true">→</span>' : 'Next location <span aria-hidden="true">→</span>';
  }

  function nextRound() {
    if (roundIndex < TOTAL_ROUNDS - 1) {
      roundIndex += 1;
      showRound();
      return;
    }
    finishGame();
  }

  function finishGame() {
    ui.next.hidden = true;
    ui.result.hidden = false;
    ui.roundTitle.textContent = 'Journey complete';
    ui.roundPill.innerHTML = `FINAL <b>SCORE</b>`;
    ui.clue.textContent = `You explored five places and scored ${scoreTotal.toLocaleString()} out of 25,000 points.`;
    ui.resultEyebrow.textContent = 'GAME COMPLETE';
    ui.resultTitle.textContent = scoreTotal >= 20000 ? 'World-class explorer!' : scoreTotal >= 12000 ? 'A brilliant trip around the world!' : 'Every round is a new adventure.';
    ui.resultDetail.textContent = 'Want another trip? Your next set of places will be different.';
    ui.resultPoints.textContent = scoreTotal.toLocaleString();
    ui.start.hidden = false;
    ui.start.innerHTML = 'Play again <span aria-hidden="true">↗</span>';
    ui.hint.textContent = '';
    ui.mapMessage.textContent = 'Start again to explore a fresh set of places.';
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    ui.start.addEventListener('click', startGame);
    ui.guess.addEventListener('click', () => submitGuess(false));
    ui.next.addEventListener('click', nextRound);
  });
})();
