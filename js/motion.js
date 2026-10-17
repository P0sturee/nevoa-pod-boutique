/* NÉVOA: movimento. Rolagem suave, abertura, parallax, revelações, cursor e a ordem de inicialização. */
(function () {
  const N = window.NEVOA;
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  let gsap, ST;

  // ---------- rolagem suave ----------
  function setupLenis() {
    if (N.reduced || typeof window.Lenis === 'undefined') return;
    const lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    N.lenis = lenis;
    lenis.on('scroll', ST.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function bindAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      if (N.lenis) N.lenis.scrollTo(target, { duration: 1.5, force: true });
      else target.scrollIntoView({ behavior: N.reduced ? 'auto' : 'smooth' });
    });
  }

  // ---------- divisão de títulos em palavras (mantém o <em>) ----------
  const wrapWords = (text) => text.split(/(\s+)/).map((part) =>
    /^\s+$/.test(part) ? ' ' : part ? '<span class="split-word is-mask"><span class="split-char">' + N.esc(part) + '</span></span>' : '').join('');
  function splitWords(el) {
    el.innerHTML = Array.from(el.childNodes).map((node) => {
      if (node.nodeType === 3) return wrapWords(node.textContent);
      if (node.nodeType === 1) { const tag = node.tagName.toLowerCase(); return '<' + tag + '>' + wrapWords(node.textContent) + '</' + tag + '>'; }
      return '';
    }).join('');
    return $$('.split-char', el);
  }

  // ---------- pré-carregamento ----------
  function preloader(done) {
    const el = $('#preloader');
    if (!el) { done(); return; }
    const count = $('#preloaderCount'), bar = $('#preloaderBar');
    const c = { v: 0 };
    const counting = new Promise((resolve) => {
      gsap.to(c, {
        v: 100, duration: N.reduced ? 0.3 : 1.5, ease: 'power2.inOut', onComplete: resolve,
        onUpdate: () => { count.textContent = Math.round(c.v); bar.style.transform = 'scaleX(' + (c.v / 100) + ')'; }
      });
    });
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    const timeout = new Promise((r) => setTimeout(r, 3500));
    Promise.all([counting, Promise.race([fonts, timeout])]).then(() => {
      done();
      gsap.timeline({ onComplete: () => el.remove() })
        .to('.preloader-inner', { y: -30, opacity: 0, duration: 0.45, ease: 'power2.in' })
        .fromTo(el, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'expo.inOut' }, '-=0.1');
    });
  }

  // ---------- hero ----------
  function buildIntro() {
    $$('.hero-title .line').forEach((l) => { l.innerHTML = '<span class="line-inner">' + l.innerHTML + '</span>'; });
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.from('.nav-inner', { yPercent: -100, opacity: 0, duration: 1.2 }, 0.2)
      .from('.hero-orb', { opacity: 0, scale: 0.6, duration: 2.2, stagger: 0.2 }, 0)
      .from('.hero-word', { opacity: 0, yPercent: 25, duration: 2 }, 0.1)
      .from('.hero-title .line-inner', { yPercent: 115, rotate: 3, duration: 1.4, stagger: 0.1 }, 0.15)
      .from('.hero-eyebrow', { opacity: 0, y: 14, duration: 1 }, 0.3)
      .from('.hero-pod', { yPercent: 25, opacity: 0, scale: 0.85, rotate: 8, duration: 1.8 }, 0.2)
      .from('#heroParts .part', { opacity: 0, scale: 0, duration: 1.3, stagger: 0.07, ease: 'back.out(1.6)' }, 0.6)
      .from('.hero-sub, .hero-ctas > *', { opacity: 0, y: 24, duration: 1.1, stagger: 0.08 }, 0.55)
      .from('.spec', { opacity: 0, x: -18, duration: 1.1, stagger: 0.12 }, 0.95)
      .from('.hero-feature', { opacity: 0, y: 16, duration: 1 }, 1.05)
      .from('.scroll-cue', { opacity: 0, duration: 1 }, 1.3);
    return tl;
  }

  function heroCycle() {
    const hero = $('#hero'), name = $('#heroFlavorName');
    const ids = N.heroIds;
    let i = 0, running = true;
    ST.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: (s) => { running = s.isActive; } });
    const first = N.byId(ids[0]);
    hero.style.setProperty('--c1', first.c1);
    hero.style.setProperty('--c2', first.c2);
    const next = () => {
      if (running && !document.hidden) {
        i = (i + 1) % ids.length;
        const f = N.byId(ids[i]);
        gsap.to(hero, { '--c1': f.c1, '--c2': f.c2, duration: 1.2, ease: 'power2.inOut' });
        gsap.timeline()
          .to(name, { yPercent: -70, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => { name.textContent = f.name; } })
          .fromTo(name, { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.55, ease: 'power3.out' });
        document.documentElement.style.setProperty('--c1', f.c1);
        document.documentElement.style.setProperty('--c2', f.c2);
      }
      gsap.delayedCall(3.2, next);
    };
    gsap.delayedCall(3.8, next);
  }

  function heroVapor() {
    const layer = $('#heroVapor');
    if (!layer || N.reduced) return;
    let active = true;
    ST.create({ trigger: '#hero', start: 'top bottom', end: 'bottom top', onToggle: (s) => { active = s.isActive; } });
    const rnd = gsap.utils.random;
    const puff = () => {
      if (active && !document.hidden) {
        const v = document.createElement('span');
        v.className = 'vapor';
        layer.appendChild(v);
        const d = rnd(3, 4.4);
        gsap.timeline({ onComplete: () => v.remove() })
          .fromTo(v, { x: rnd(-6, 6), y: 0, scale: 0.25 }, { x: rnd(-70, 70), y: rnd(-260, -170), scale: rnd(1.8, 2.8), duration: d, ease: 'power1.out' }, 0)
          .fromTo(v, { opacity: 0 }, { opacity: rnd(0.45, 0.75), duration: 0.7, ease: 'power1.out' }, 0)
          .to(v, { opacity: 0, duration: d - 0.9, ease: 'power1.in' }, 0.9);
      }
      gsap.delayedCall(rnd(0.35, 0.8), puff);
    };
    gsap.delayedCall(1.5, puff);
  }

  function heroPointer() {
    if (N.isTouch || N.reduced) return;
    const hero = $('#hero'), tilt = $('#heroTilt'), parts = $('#heroParts');
    gsap.set(tilt, { transformPerspective: 900 });
    const q = (el, prop) => gsap.quickTo(el, prop, { duration: 0.9, ease: 'power3' });
    const rx = q(tilt, 'rotationX'), ry = q(tilt, 'rotationY'), tx = q(tilt, 'x'), px = q(parts, 'x'), py = q(parts, 'y');
    hero.addEventListener('pointermove', (e) => {
      const nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
      ry(nx * 34); rx(-ny * 20); tx(nx * 24); px(-nx * 40); py(-ny * 30);
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); tx(0); px(0); py(0); });
  }

  // ---------- parallax ----------
  function parallax() {
    $$('[data-speed]').forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0;
      const section = el.closest('section');
      const inHero = section && section.id === 'hero';
      gsap.fromTo(el, { y: inHero ? 0 : () => speed * 140 }, {
        y: () => -speed * (inHero ? 420 : 140), ease: 'none',
        scrollTrigger: { trigger: section || el, start: inHero ? 'top top' : 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
    });
    $$('#heroParts .part').forEach((p) => {
      gsap.to(p, { y: -parseFloat(p.dataset.depth) * 300, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hero-stage', { yPercent: 16, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-copy, .hero-meta', { y: -90, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#hero', start: '25% top', end: '85% top', scrub: true } });
  }

  // ---------- revelações ----------
  function reveals() {
    $$('[data-split]').forEach((el) => {
      if (el.classList.contains('hero-title')) return;
      const words = splitWords(el);
      gsap.from(words, { yPercent: 115, duration: 1.3, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    });
    $$('[data-reveal]').forEach((el) => {
      const extra = el.hasAttribute('data-speed') ? { scale: 0.94 } : { y: 44 };
      gsap.from(el, Object.assign({ autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }, extra));
    });
    gsap.set('.card', { autoAlpha: 0, y: 60 });
    ST.batch('.card', {
      start: 'top 92%', once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
    });
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count), o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
    gsap.fromTo('.step-list', { '--lp': 0 }, { '--lp': 1, ease: 'none', scrollTrigger: { trigger: '.step-list', start: 'top 80%', end: 'bottom 55%', scrub: true } });
    const streets = $$('#map .map-street');
    if (streets.length) {
      gsap.fromTo(streets, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.04, scrollTrigger: { trigger: '#map', start: 'top 82%', once: true } });
    }
    const fw = $('.footer-word');
    if (fw) {
      const chars = N.splitChars(fw);
      fw.classList.add('is-split');
      gsap.from(chars, { yPercent: 105, duration: 1.5, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: fw, start: 'top 96%', once: true } });
    }
  }

  // ---------- faixa de sabores ----------
  function marquee() {
    const tweens = $$('.marquee-row').map((row) => {
      const track = $('.marquee-track', row), dir = parseFloat(row.dataset.dir), copies = parseFloat(track.dataset.copies) || 2;
      const t = gsap.fromTo(track, { xPercent: 0 }, { xPercent: -100 / copies, duration: dir < 0 ? 42 : 30, ease: 'none', repeat: -1 });
      t.totalTime(t.duration() * 500);
      if (dir > 0) t.timeScale(-1);
      t.vars.baseDir = dir < 0 ? 1 : -1;
      return t;
    });
    if (N.reduced) { tweens.forEach((t) => t.pause()); return; }
    ST.create({
      trigger: '.marquee', start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6);
        tweens.forEach((t) => {
          const d = t.vars.baseDir * self.direction;
          gsap.to(t, { timeScale: d * boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(t, { timeScale: d, duration: 1.2, overwrite: true }) });
        });
      }
    });
  }

  // ---------- cabeçalho ----------
  function header() {
    const nav = $('#nav'), menu = $('#mobileMenu');
    ST.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        nav.classList.toggle('is-scrolled', y > 30);
        nav.classList.toggle('is-hidden', self.direction === 1 && y > 320 && menu.hidden);
      }
    });
  }

  // ---------- cursor, botões magnéticos e cartões 3D ----------
  function pointerFx() {
    if (N.isTouch) return;
    const c = $('#cursor'), label = $('#cursorLabel');
    const xTo = gsap.quickTo(c, 'x', { duration: 0.45, ease: 'power3' }), yTo = gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' });
    let shown = false;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      if (!shown) { shown = true; gsap.to(c, { opacity: 1, duration: 0.3 }); }
      xTo(e.clientX); yTo(e.clientY);
    });
    document.documentElement.addEventListener('mouseleave', () => { shown = false; gsap.to(c, { opacity: 0, duration: 0.3 }); });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], a, button, [role="slider"]');
      if (t && t.dataset.cursor) { label.textContent = t.dataset.cursor; c.classList.add('is-label'); gsap.to(c, { scale: 2.4, duration: 0.35 }); }
      else { c.classList.remove('is-label'); gsap.to(c, { scale: t ? 1.6 : 1, duration: 0.3 }); }
    });
    if (N.reduced) return;
    $$('.magnetic').forEach((el) => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, .4)' }), my = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, .4)' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3); my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
    $$('.card').forEach((card) => {
      gsap.set(card, { transformPerspective: 900 });
      const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10); rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  // ---------- inicialização ----------
  function boot() {
    N.ui.init();
    if (!N.hasGsap || !window.ScrollTrigger) {
      const pre = $('#preloader'); if (pre) pre.remove();
      N.journey.init();
      N.film.init();
      N.ageGate(() => {});
      return;
    }
    gsap = window.gsap; ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    if (window.Flip) gsap.registerPlugin(window.Flip);
    ST.config({ ignoreMobileResize: true });

    setupLenis();
    N.lock(true);
    bindAnchors();

    // a seção fixada vem primeiro para as posições abaixo dela ficarem certas
    N.journey.init();
    N.film.init();

    const intro = buildIntro();
    parallax();
    reveals();
    marquee();
    header();
    pointerFx();
    heroPointer();
    heroCycle();
    heroVapor();

    preloader(() => {
      N.lock(false);
      N.ageGate(() => { if (N.reduced) intro.progress(1); else intro.play(); });
    });

    if (document.fonts) document.fonts.ready.then(() => ST.refresh());
    window.addEventListener('load', () => ST.refresh());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
