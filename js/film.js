/* NÉVOA: o "filme" da campanha, uma animação de 18 s feita com uma timeline GSAP e controles de player. */
(function () {
  const N = window.NEVOA;
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const DURATION = 18;
  const CHAPTERS = [0, 4.5, 11.1, 15.2];
  const SHOT = 1.1;
  const C = -50;
  // partículas longe do nome (canto inferior esquerdo) e do contador (canto inferior direito)
  const SPOTS = [
    { x: 14, y: 16, s: 64, d: 0.6, r: -20 }, { x: 86, y: 18, s: 52, d: 0.9, r: 25 }, { x: 84, y: 56, s: 84, d: 1.4, r: 12 },
    { x: 14, y: 46, s: 92, d: 1.5, r: -35 }, { x: 66, y: 28, s: 30, d: 0.4, r: 0 }, { x: 36, y: 24, s: 44, d: 0.5, r: 40 }, { x: 68, y: 72, s: 54, d: 1.1, r: 15 }
  ];

  function build(stage) {
    const shots = N.filmIds.map(N.byId);
    const lineup = N.lineupIds.map(N.byId);
    stage.innerHTML =
      '<div class="sc sc-intro">' +
        '<div class="sc-center sc-word">Respire.</div>' +
        '<div class="sc-center sc-word">Sinta.</div>' +
        '<div class="sc-center sc-word">Escolha <em>a sua.</em></div>' +
        '<div class="sc-sweep"></div>' +
        '<div class="sc-center sc-logo">NÉVOA</div>' +
        '<div class="sc-center sc-tag">Pod Boutique</div>' +
      '</div>' +
      '<div class="sc sc-flavors" style="--fc1:' + shots[0].c1 + ';--fdeep:' + shots[0].deep + '">' +
        '<div class="sc-fbg"></div>' +
        shots.map((f, i) =>
          '<div class="sc-shot" style="' + N.flavorVars(f) + ';--fc1:' + f.c1 + '">' +
            '<div class="sc-center sc-name">' + N.esc(f.name) + '</div>' +
            '<div class="sc-parts"></div>' +
            '<div class="sc-center sc-pod"><div class="pod-float">' + N.podSVG() + '</div></div>' +
            '<div class="sc-label"><b>' + N.esc(f.name) + '</b><span>' + N.esc(f.notes) + '</span></div>' +
            '<div class="sc-index">' + String(i + 1).padStart(2, '0') + ' / ' + String(shots.length).padStart(2, '0') + '</div>' +
          '</div>').join('') +
      '</div>' +
      '<div class="sc sc-lineup">' +
        '<div class="sc-center sc-rays"></div>' +
        '<div class="sc-center sc-line-title">12 sabores. <em>Uma só obsessão.</em></div>' +
        '<div class="sc-center sc-row">' +
          lineup.map((f) => '<div class="sc-lpod" style="' + N.flavorVars(f) + '">' + N.podSVG() + '</div>').join('') +
        '</div>' +
      '</div>' +
      '<div class="sc sc-end">' +
        '<div class="sc-end-logo">NÉVOA</div>' +
        '<div class="sc-end-line">Sinta cada nota.</div>' +
        '<a class="sc-end-cta" href="' + N.waLink() + '" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Peça pelo WhatsApp</a>' +
        '<div class="sc-end-legal">+18 · Contém nicotina</div>' +
      '</div>' +
      '<div class="sc-flash"></div>';
    $$('.sc-shot', stage).forEach((el, i) => N.fillParts($('.sc-parts', el), shots[i], SPOTS));
    return shots;
  }

  function timeline(stage, shots) {
    const gsap = window.gsap;
    const tl = gsap.timeline({ paused: true });
    const intro = $('.sc-intro', stage), flavors = $('.sc-flavors', stage), line = $('.sc-lineup', stage), end = $('.sc-end', stage);
    const flash = $('.sc-flash', stage);
    const words = $$('.sc-word', intro);
    const blink = (t, peak) => tl.fromTo(flash, { opacity: 0 }, { opacity: peak || 0.85, duration: 0.08, yoyo: true, repeat: 1, ease: 'none', immediateRender: false }, t);

    // Cena 1: abertura
    tl.set(intro, { autoAlpha: 1 }, 0);
    words.forEach((w, i) => {
      const t = 0.2 + i * 1.05;
      tl.fromTo(w, { autoAlpha: 0, y: 40, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' }, t);
      tl.to(w, i === 2 ? { autoAlpha: 0, scale: 1.35, duration: 0.45, ease: 'power2.in' } : { autoAlpha: 0, y: -30, duration: 0.4, ease: 'power2.in' }, t + 0.8);
    });
    tl.fromTo('.sc-sweep', { xPercent: 0 }, { xPercent: 720, duration: 1, ease: 'power2.inOut' }, 3.1);
    tl.fromTo('.sc-logo', { autoAlpha: 0, letterSpacing: '.9em', scale: 0.92 }, { autoAlpha: 1, letterSpacing: '.3em', scale: 1, duration: 1.1, ease: 'expo.out' }, 3.2);
    tl.fromTo('.sc-tag', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 3.6);
    blink(4.4);
    tl.set(intro, { autoAlpha: 0 }, 4.5);

    // Cena 2: cortes rápidos por sabor
    tl.set(flavors, { autoAlpha: 1 }, 4.5);
    const shotEls = $$('.sc-shot', flavors);
    shotEls.forEach((el, k) => {
      const f = shots[k], s = 4.5 + k * SHOT, dir = k % 2 ? -1 : 1;
      if (k > 0) { tl.set(shotEls[k - 1], { autoAlpha: 0 }, s); blink(s - 0.04, 0.3); }
      tl.set(el, { autoAlpha: 1 }, s);
      tl.to(flavors, { '--fc1': f.c1, '--fdeep': f.deep, duration: 0.25, ease: 'none' }, s);
      // xPercent parte de -50 porque o GSAP incorpora o "translate: -50% -50%" do CSS que centraliza o elemento
      tl.fromTo($('.sc-name', el), { xPercent: C + dir * 18, scale: 1.3, autoAlpha: 0 }, { xPercent: C, scale: 1, autoAlpha: 1, duration: 0.5, ease: 'expo.out' }, s);
      tl.to($('.sc-name', el), { xPercent: C - dir * 5, duration: SHOT - 0.5, ease: 'none' }, s + 0.5);
      tl.fromTo($('.sc-pod', el), { xPercent: C + dir * 260, rotation: dir * 28, scale: 0.8, autoAlpha: 0 }, { xPercent: C, rotation: -dir * 5, scale: 1, autoAlpha: 1, duration: 0.6, ease: 'expo.out' }, s);
      tl.to($('.sc-pod', el), { rotation: dir * 3, scale: 1.05, duration: SHOT - 0.6, ease: 'none' }, s + 0.6);
      tl.fromTo($$('.part', el), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, stagger: 0.03, ease: 'back.out(2)' }, s + 0.08);
      tl.to($$('.part', el), { y: (i, p) => -50 * parseFloat(p.dataset.depth), duration: SHOT, ease: 'none' }, s);
      tl.fromTo([$('.sc-label', el), $('.sc-index', el)], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06 }, s + 0.15);
    });
    const lineStart = 4.5 + shots.length * SHOT;
    blink(lineStart - 0.05);
    tl.set(flavors, { autoAlpha: 0 }, lineStart);

    // Cena 3: a coleção lado a lado
    const pods = $$('.sc-lpod', line);
    const mid = (pods.length - 1) / 2;
    tl.set(line, { autoAlpha: 1 }, lineStart);
    tl.fromTo('.sc-rays', { rotation: 0, autoAlpha: 0 }, { rotation: 50, autoAlpha: 1, duration: 4, ease: 'none' }, lineStart);
    tl.fromTo(pods, { yPercent: 130, autoAlpha: 0, rotation: 0 }, {
      yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', stagger: { each: 0.08, from: 'center' },
      rotation: (i) => (i - mid) * 6, transformOrigin: '50% 100%'
    }, lineStart + 0.1);
    tl.fromTo('.sc-line-title', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, lineStart + 0.5);
    tl.fromTo('.sc-row', { scale: 0.96 }, { scale: 1.06, duration: 3.4, ease: 'none' }, lineStart + 0.3);
    tl.to(pods, { yPercent: -30, autoAlpha: 0, duration: 0.45, stagger: { each: 0.04, from: 'edges' }, ease: 'power2.in' }, 14.6);
    tl.to('.sc-line-title', { autoAlpha: 0, y: -20, duration: 0.4 }, 14.7);
    blink(15.1);
    tl.set(line, { autoAlpha: 0 }, 15.2);

    // Cena 4: assinatura
    tl.set(end, { autoAlpha: 1 }, 15.2);
    tl.fromTo('.sc-end-logo', { autoAlpha: 0, scale: 1.25, filter: 'blur(14px)' }, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out' }, 15.25);
    tl.fromTo('.sc-end-line', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 15.7);
    tl.fromTo('.sc-end-cta', { autoAlpha: 0, y: 20, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)' }, 16);
    tl.fromTo('.sc-end-legal', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 16.4);
    tl.to({}, { duration: DURATION - tl.duration() });
    return tl;
  }

  function controls(player, tl) {
    const gsap = window.gsap;
    const toggle = $('#filmToggle'), big = $('#filmBig'), restart = $('#filmRestart');
    const bar = $('#filmProgress'), fill = $('#filmFill'), time = $('#filmTime'), tc = $('#filmTc');
    let poster = true, userPaused = false, scrubbing = false, wasPlaying = false;
    const fmt = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

    $('#filmMarks').innerHTML = CHAPTERS.slice(1).map((c) => '<i style="left:' + (c / DURATION * 100).toFixed(2) + '%"></i>').join('');

    function sync() {
      const t = tl.time();
      fill.style.width = (t / DURATION * 100).toFixed(2) + '%';
      time.textContent = fmt(poster ? 0 : t) + ' / ' + fmt(DURATION);
      const frames = Math.floor((t % 1) * 24);
      tc.textContent = '00:' + String(Math.floor(t)).padStart(2, '0') + ':' + String(frames).padStart(2, '0');
      bar.setAttribute('aria-valuenow', Math.round(t / DURATION * 100));
    }
    function setPlaying(on) {
      player.classList.toggle('is-playing', on);
      toggle.querySelector('use').setAttribute('href', on ? '#i-pause' : '#i-play');
      toggle.setAttribute('aria-label', on ? 'Pausar' : 'Reproduzir');
    }
    function play() {
      if (poster || tl.progress() >= 1) { poster = false; tl.restart(); } else tl.play();
      setPlaying(true);
    }
    function pause() { tl.pause(); setPlaying(false); }

    tl.eventCallback('onUpdate', sync);
    tl.eventCallback('onComplete', () => {
      gsap.delayedCall(1.4, () => { if (player.classList.contains('is-playing')) tl.restart(); });
    });

    // quadro de capa: a coleção lado a lado
    tl.seek(13.4, false);
    sync();
    time.textContent = '0:00 / ' + fmt(DURATION);

    toggle.addEventListener('click', () => { if (tl.isActive()) { userPaused = true; pause(); } else { userPaused = false; play(); } });
    big.addEventListener('click', () => { userPaused = false; play(); });
    restart.addEventListener('click', () => { poster = false; userPaused = false; tl.restart(); setPlaying(true); });
    $('#filmStage').addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      if (tl.isActive()) { userPaused = true; pause(); } else { userPaused = false; play(); }
    });

    function seekFromPointer(e) {
      const r = bar.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      poster = false;
      tl.progress(p);
    }
    bar.addEventListener('pointerdown', (e) => {
      scrubbing = true; wasPlaying = tl.isActive(); tl.pause();
      bar.setPointerCapture(e.pointerId); seekFromPointer(e);
    });
    bar.addEventListener('pointermove', (e) => { if (scrubbing) seekFromPointer(e); });
    const endScrub = () => { if (!scrubbing) return; scrubbing = false; if (wasPlaying) { tl.play(); setPlaying(true); } else setPlaying(false); };
    bar.addEventListener('pointerup', endScrub);
    bar.addEventListener('pointercancel', endScrub);
    bar.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      poster = false;
      tl.time(Math.min(DURATION, Math.max(0, tl.time() + (e.key === 'ArrowRight' ? 1 : -1))));
    });

    // toca sozinho quando o player aparece na tela e pausa quando sai
    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: player, start: 'top 75%', end: 'bottom 25%',
        onToggle: (self) => {
          if (self.isActive && !userPaused && !N.reduced) play();
          else if (!self.isActive && tl.isActive()) pause();
        }
      });
    }
  }

  N.film = {
    init() {
      const stage = $('#filmStage'), player = $('#player');
      if (!stage || !player) return;
      const shots = build(stage);
      if (!N.hasGsap) { $('.sc-end', stage).style.visibility = 'visible'; return; }
      const tl = timeline(stage, shots);
      N.film.tl = tl;
      controls(player, tl);
    }
  };
})();
