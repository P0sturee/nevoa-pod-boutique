/* NÉVOA: degustação guiada. Seção fixada em que cada trecho de rolagem revela um pod com um efeito diferente. */
(function () {
  const N = window.NEVOA;
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, '0');
  const FX = ['flip', 'rise', 'zoom', 'swing', 'tumble'];

  // Divide um texto em letras, com máscara por palavra
  N.splitChars = function (el) {
    const text = el.textContent.trim();
    el.innerHTML = '<span class="sr-only">' + N.esc(text) + '</span>' + text.split(/\s+/).map((w) =>
      '<span class="split-word is-mask" aria-hidden="true">' + Array.from(w).map((c) => '<span class="split-char">' + N.esc(c) + '</span>').join('') + '</span>'
    ).join(' ');
    return $$('.split-char', el);
  };

  function build(stage, texts, list) {
    stage.innerHTML = list.map((f, i) =>
      '<div class="jr-slide" style="' + N.flavorVars(f) + '">' +
        '<div class="jr-parts"></div>' +
        '<div class="jr-pod"><div class="pod-float" style="animation-delay:-' + (i * 1.3).toFixed(1) + 's">' + N.podSVG() + '</div><div class="pod-shadow"></div></div>' +
      '</div>').join('');
    texts.innerHTML = list.map((f, i) =>
      '<div class="jr-text' + (i === 0 ? ' is-active' : '') + '" style="' + N.flavorVars(f) + '">' +
        '<span class="jr-idx">' + pad(i + 1) + ' · ' + N.esc(f.cat) + '</span>' +
        '<h3 class="jr-name">' + N.esc(f.name) + '</h3>' +
        '<p class="jr-notes">' + N.esc(f.notes) + '</p>' +
        '<p class="jr-desc">' + N.esc(f.desc) + '</p>' +
        '<div class="jr-stats">' +
          '<div class="jr-stat"><span>Puffs</span><b>' + f.puffs + '</b></div>' +
          '<div class="jr-stat"><span>Gelo</span>' + N.dots(f.ice) + '</div>' +
          '<div class="jr-stat"><span>Doçura</span>' + N.dots(f.sweet) + '</div>' +
        '</div>' +
        '<div class="jr-cta">' +
          '<span class="jr-price">' + N.brl(f.price) + '</span>' +
          '<button class="btn btn-solid" type="button" data-add="' + f.id + '"><svg><use href="#i-plus"/></svg>Adicionar à sacola</button>' +
          '<a class="btn-wa-sq" href="' + N.waLink(N.flavorMsg(f)) + '" target="_blank" rel="noopener" aria-label="Pedir ' + N.esc(f.name) + ' no WhatsApp"><svg><use href="#i-wa"/></svg></a>' +
        '</div>' +
      '</div>').join('');
    $$('.jr-slide', stage).forEach((s, i) => N.fillParts($('.jr-parts', s), list[i]));
  }

  function podFx(tl, fx, pa, pb, T) {
    const out = { duration: 0.5, ease: 'power2.in' };
    const inn = { duration: 0.6, ease: 'power3.out' };
    switch (fx) {
      case 'flip':
        tl.to(pa, Object.assign({ rotationY: 90 }, out), T);
        tl.fromTo(pb, { rotationY: -90, autoAlpha: 0 }, Object.assign({ rotationY: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out' }), T + 0.5);
        break;
      case 'rise':
        tl.to(pa, Object.assign({ yPercent: -120, rotation: -14, autoAlpha: 0 }, out), T);
        tl.fromTo(pb, { yPercent: 120, rotation: 14, autoAlpha: 0 }, Object.assign({ yPercent: 0, rotation: 0, autoAlpha: 1 }, inn), T + 0.4);
        break;
      case 'zoom':
        tl.to(pa, Object.assign({ scale: 1.8, autoAlpha: 0 }, out), T);
        tl.fromTo(pb, { scale: 0.3, autoAlpha: 0 }, Object.assign({ scale: 1, autoAlpha: 1 }, inn), T + 0.4);
        break;
      case 'swing':
        tl.to(pa, Object.assign({ xPercent: -220, rotation: -35, autoAlpha: 0 }, out), T);
        tl.fromTo(pb, { xPercent: 220, rotation: 35, autoAlpha: 0 }, Object.assign({ xPercent: 0, rotation: 0, autoAlpha: 1 }, inn), T + 0.4);
        break;
      default: // tumble
        tl.to(pa, Object.assign({ rotationX: 80, yPercent: 40, autoAlpha: 0 }, out), T);
        tl.fromTo(pb, { rotationX: -80, yPercent: -40, autoAlpha: 0 }, Object.assign({ rotationX: 0, yPercent: 0, autoAlpha: 1 }, inn), T + 0.4);
    }
  }

  N.journey = {
    init() {
      const pin = $('#jrPin'), stage = $('#jrStage'), texts = $('#jrTexts');
      if (!pin || !stage) return;
      const list = N.journeyIds.map(N.byId);
      const n = list.length;
      build(stage, texts, list);
      $('#jrTotal').textContent = pad(n);
      pin.style.setProperty('--c1', list[0].c1);
      pin.style.setProperty('--c2', list[0].c2);
      pin.style.setProperty('--deep', list[0].deep);

      const gsap = window.gsap;
      const slides = $$('.jr-slide', stage), textEls = $$('.jr-text', texts);
      if (!N.hasGsap || !window.ScrollTrigger) {
        slides.slice(1).forEach((s) => { s.hidden = true; });
        textEls.slice(1).forEach((t) => { t.hidden = true; });
        return;
      }

      const chars = textEls.map((t) => N.splitChars($('.jr-name', t)));
      const metas = textEls.map((t) => $$('.jr-idx, .jr-notes, .jr-desc, .jr-stats, .jr-cta', t));
      const pods = slides.map((s) => $('.jr-pod', s));
      const parts = slides.map((s) => $$('.part', s));
      const depth = (el) => parseFloat(el.dataset.depth) || 1;
      const restAlpha = (i, el) => (depth(el) < 0.6 ? 0.6 : 1);

      gsap.set(slides.slice(1), { autoAlpha: 0 });
      gsap.set(textEls.slice(1), { autoAlpha: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => '+=' + Math.round(window.innerHeight * n * 0.9),
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          // no celular o botão flutuante cobriria o "Adicionar à sacola"
          onToggle: (self) => $('.wa-fab').classList.toggle('is-tucked', self.isActive && window.matchMedia('(max-width: 860px)').matches)
        }
      });

      // parallax das partículas: cada camada anda numa velocidade conforme a profundidade
      slides.forEach((s, i) => {
        const start = Math.max(0, i * 2 - 1);
        tl.fromTo(parts[i], { y: (k, p) => 70 * depth(p) }, { y: (k, p) => -110 * depth(p), duration: i === 0 ? 2 : 3 }, start);
      });

      for (let i = 0; i < n - 1; i++) {
        const T = i * 2 + 1, a = i, b = i + 1, fb = list[b];
        tl.to(pin, { '--c1': fb.c1, '--c2': fb.c2, '--deep': fb.deep, duration: 1 }, T);
        tl.set(slides[b], { autoAlpha: 1 }, T);
        tl.set(slides[a], { autoAlpha: 0 }, T + 1);

        tl.to(chars[a], { yPercent: -110, stagger: 0.012, duration: 0.35, ease: 'power2.in' }, T);
        tl.to(metas[a], { autoAlpha: 0, y: -16, stagger: 0.03, duration: 0.3, ease: 'power2.in' }, T);
        tl.set(textEls[a], { autoAlpha: 0 }, T + 0.5);
        tl.set(textEls[b], { autoAlpha: 1 }, T + 0.5);
        tl.fromTo(chars[b], { yPercent: 110 }, { yPercent: 0, stagger: 0.012, duration: 0.4, ease: 'power3.out' }, T + 0.5);
        tl.fromTo(metas[b], { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.35, ease: 'power3.out' }, T + 0.58);

        tl.to(parts[a], { scale: 0.3, autoAlpha: 0, stagger: 0.02, duration: 0.4, ease: 'power2.in' }, T);
        tl.fromTo(parts[b], { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: restAlpha, stagger: 0.03, duration: 0.5, ease: 'back.out(1.7)' }, T + 0.45);

        podFx(tl, FX[i % FX.length], pods[a], pods[b], T);
      }
      tl.to({}, { duration: 1 }, (n - 1) * 2);

      // progresso, número grande e slide ativo
      const bar = $('#jrBar'), cur = $('#jrCur'), big = $('#jrBignum'), hint = $('#jrHint');
      let active = 0, hintGone = false;
      tl.eventCallback('onUpdate', () => {
        const t = tl.time();
        bar.style.transform = 'scaleX(' + tl.progress().toFixed(4) + ')';
        if (!hintGone && t > 0.25) { hintGone = true; gsap.to(hint, { autoAlpha: 0, duration: 0.4 }); }
        const idx = Math.min(n - 1, Math.max(0, Math.floor((t + 0.5) / 2)));
        if (idx === active) return;
        active = idx;
        cur.textContent = pad(idx + 1);
        big.textContent = pad(idx + 1);
        gsap.fromTo(big, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out', overwrite: true });
        textEls.forEach((el, k) => el.classList.toggle('is-active', k === idx));
      });
    }
  };
})();
