/* NÉVOA: interface (conteúdo dinâmico, sacola, menus, verificação de idade, horário e mapa). */
(function () {
  const N = window.NEVOA;
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const G = () => (N.hasGsap ? window.gsap : null);

  // ---------- trava de rolagem (overlays podem se empilhar) ----------
  let locks = 0;
  N.lock = function (on) {
    locks = Math.max(0, locks + (on ? 1 : -1));
    document.documentElement.classList.toggle('is-locked', locks > 0);
    if (N.lenis) (locks > 0 ? N.lenis.stop() : N.lenis.start());
  };

  // ---------- conteúdo vindo do config ----------
  function fillConfig() {
    $$('[data-cfg]').forEach((el) => { const v = N.config[el.dataset.cfg]; if (v) el.textContent = v; });
    $$('[data-wa]').forEach((el) => { el.href = N.waLink(el.dataset.wa || ''); });
    const maps = $('#mapsLink'); if (maps) maps.href = N.mapsLink();
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  function buildMarquee() {
    const a = $('#marqueeA'), b = $('#marqueeB');
    if (a) {
      const set = N.flavors.map((f) => '<span class="mq-item" style="--fc:' + f.c1 + '">' + N.esc(f.name) + '<i></i></span>').join('');
      a.innerHTML = set + set; a.dataset.copies = 2;
    }
    if (b) {
      const words = ['Originais e lacrados', 'Entrega em até 60 min', 'Pix ou cartão em 3x', 'Atendimento humano', 'Só para maiores de 18'];
      const set = words.map((w, i) => '<span class="mq-item" style="--fc:' + N.flavors[(i * 3) % N.flavors.length].c1 + '">' + w + '<i></i></span>').join('');
      b.innerHTML = set + set + set + set; b.dataset.copies = 4;
    }
  }

  function buildHero() {
    const holder = $('[data-pod="hero"]');
    if (holder) holder.innerHTML = N.podSVG();
    const parts = $('#heroParts');
    if (parts) {
      const spots = [
        { x: 8, y: 22, s: 70, d: 0.7, r: -20 }, { x: 46, y: 12, s: 40, d: 0.4, r: 30 }, { x: 92, y: 18, s: 84, d: 1.2, r: 18 },
        { x: 96, y: 72, s: 60, d: 0.8, r: -12 }, { x: 54, y: 92, s: 52, d: 1, r: 40 }, { x: 4, y: 84, s: 96, d: 1.4, r: -30 }
      ];
      N.fillParts(parts, { parts: ['orb', 'drop', 'cube', 'drop', 'orb', 'cube'] }, spots);
    }
  }

  // ---------- coleção ----------
  function cardHTML(f) {
    return '' +
      '<article class="card" data-tags="' + f.tags.join(' ') + '" style="' + N.flavorVars(f) + '">' +
        '<div class="card-media" data-cursor="Ver">' +
          '<span class="card-badge">' + f.puffs + ' puffs</span>' +
          '<div class="card-pod"><div class="pod-float" style="animation-delay:-' + (Math.random() * 6).toFixed(2) + 's">' + N.podSVG() + '</div></div>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-top"><h3>' + N.esc(f.name) + '</h3><span class="price">' + N.brl(f.price) + '</span></div>' +
          '<p class="notes">' + N.esc(f.notes) + '</p>' +
          '<div class="meters"><span class="meter">Gelo ' + N.dots(f.ice) + '</span><span class="meter">Doçura ' + N.dots(f.sweet) + '</span></div>' +
          '<div class="card-actions">' +
            '<button class="btn-add" type="button" data-add="' + f.id + '" aria-label="Adicionar ' + N.esc(f.name) + ' à sacola"><svg><use href="#i-plus"/></svg><span>Adicionar</span></button>' +
            '<a class="btn-wa-sq" href="' + N.waLink(N.flavorMsg(f)) + '" target="_blank" rel="noopener" aria-label="Pedir ' + N.esc(f.name) + ' no WhatsApp"><svg><use href="#i-wa"/></svg></a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function buildGrid() {
    const grid = $('#grid');
    if (!grid) return;
    grid.innerHTML = N.flavors.map(cardHTML).join('');
    const chips = $$('.chip');
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => { const on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on); });
      filterGrid(chip.dataset.filter);
    }));
  }

  function filterGrid(tag) {
    const cards = $$('.card', $('#grid'));
    const gsap = G();
    const state = gsap && window.Flip ? window.Flip.getState(cards) : null;
    cards.forEach((c) => c.classList.toggle('is-hidden', tag !== 'all' && c.dataset.tags.split(' ').indexOf(tag) === -1));
    if (state) {
      window.Flip.from(state, {
        duration: 0.65, ease: 'power3.inOut', absolute: true, scale: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.35 }),
        onComplete: () => window.ScrollTrigger && window.ScrollTrigger.refresh()
      });
    } else if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }

  // ---------- sacola ----------
  const bag = N.store.get('nevoa-bag', {});
  const saveBag = () => N.store.set('nevoa-bag', bag);

  function bagLines() {
    return Object.keys(bag).map((id) => ({ f: N.byId(id), q: bag[id] })).filter((l) => l.f && l.q > 0);
  }

  function renderBag() {
    const lines = bagLines();
    const count = lines.reduce((s, l) => s + l.q, 0);
    const total = lines.reduce((s, l) => s + l.q * l.f.price, 0);
    const badge = $('#bagCount');
    badge.textContent = count;
    badge.classList.toggle('has-items', count > 0);
    $('#bagBtn').setAttribute('aria-label', count ? 'Abrir sacola, ' + count + (count > 1 ? ' itens' : ' item') : 'Abrir sacola');
    $('#bagItems').innerHTML = lines.map((l) =>
      '<li class="bag-item" style="' + N.flavorVars(l.f) + '">' +
        '<span class="bag-thumb">' + N.podSVG() + '</span>' +
        '<span class="bag-info"><b>' + N.esc(l.f.name) + '</b><span>' + l.f.puffs + ' puffs · ' + N.brl(l.f.price) + '</span></span>' +
        '<span class="qty">' +
          '<button type="button" data-qty="-1" data-id="' + l.f.id + '" aria-label="Remover um ' + N.esc(l.f.name) + '"><svg><use href="#i-minus"/></svg></button>' +
          '<output aria-live="polite">' + l.q + '</output>' +
          '<button type="button" data-qty="1" data-id="' + l.f.id + '" aria-label="Adicionar mais um ' + N.esc(l.f.name) + '"><svg><use href="#i-plus"/></svg></button>' +
        '</span>' +
      '</li>').join('');
    $('#bagTotal').textContent = N.brl(total);
    $('#bagEmpty').hidden = lines.length > 0;
    $('#bagItems').hidden = lines.length === 0;
    $('.drawer-foot').hidden = lines.length === 0;
    const msg = 'Olá, NÉVOA! Quero fazer este pedido:\n\n' +
      lines.map((l) => '• ' + l.q + 'x ' + l.f.name + ' (' + l.f.puffs + ') · ' + N.brl(l.q * l.f.price)).join('\n') +
      '\n\nTotal: ' + N.brl(total) + '\n\nPode me passar as opções de entrega e pagamento?';
    $('#bagCheckout').href = N.waLink(msg);
  }

  function addToBag(id, fromEl) {
    const f = N.byId(id);
    if (!f) return;
    bag[id] = (bag[id] || 0) + 1;
    saveBag();
    renderBag();
    flyToBag(fromEl, f);
    N.toast(f.name + ' foi para a sacola', f.c1);
  }

  function flyToBag(fromEl, f) {
    const gsap = G();
    const target = $('#bagBtn');
    if (!gsap || !fromEl || N.reduced) return;
    const a = fromEl.getBoundingClientRect(), b = target.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'fly-dot';
    dot.style.background = f.c1;
    dot.style.boxShadow = '0 0 24px ' + f.c1;
    document.body.appendChild(dot);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2, x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
    gsap.set(dot, { x: x0, y: y0, scale: 0.4 });
    const tl = gsap.timeline({ onComplete: () => dot.remove() });
    tl.to(dot, { x: x1, duration: 0.8, ease: 'power1.inOut' }, 0)
      .to(dot, { y: Math.min(y0, y1) - 120, duration: 0.4, ease: 'power2.out' }, 0)
      .to(dot, { y: y1, duration: 0.4, ease: 'power2.in' }, 0.4)
      .to(dot, { scale: 1.2, duration: 0.4 }, 0)
      .to(dot, { scale: 0.2, opacity: 0, duration: 0.2 }, 0.7)
      .fromTo(target, { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, 0.75);
  }

  // ---------- gaveta da sacola ----------
  let lastFocus = null;
  function openDrawer() {
    const d = $('#drawer');
    if (!d.hidden) return;
    lastFocus = document.activeElement;
    d.hidden = false;
    N.lock(true);
    $('.wa-fab').classList.add('is-hidden');
    const gsap = G();
    if (gsap) {
      gsap.fromTo('.drawer-overlay', { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo('.drawer-panel', { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: 'expo.out' });
      gsap.fromTo('.bag-item', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, stagger: 0.05, delay: 0.15, ease: 'power3.out' });
    }
    $('.drawer-panel [data-close]').focus();
  }
  function closeDrawer() {
    const d = $('#drawer');
    if (d.hidden) return;
    const done = () => { d.hidden = true; N.lock(false); $('.wa-fab').classList.remove('is-hidden'); if (lastFocus) lastFocus.focus(); };
    const gsap = G();
    if (gsap) {
      gsap.to('.drawer-overlay', { opacity: 0, duration: 0.35 });
      gsap.to('.drawer-panel', { xPercent: 100, duration: 0.45, ease: 'power3.in', onComplete: done });
    } else done();
  }

  // ---------- menu mobile ----------
  function toggleMenu(force) {
    const menu = $('#mobileMenu'), btn = $('#menuBtn');
    const open = typeof force === 'boolean' ? force : menu.hidden;
    if (open === !menu.hidden) return;
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    const gsap = G();
    if (open) {
      menu.hidden = false; N.lock(true);
      if (gsap) {
        gsap.fromTo(menu, { clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(150% at 100% 0%)', duration: 0.8, ease: 'expo.inOut' });
        gsap.fromTo('.mobile-menu-links a, .mobile-menu-foot > *', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, delay: 0.25, ease: 'power3.out' });
      }
    } else {
      const done = () => { menu.hidden = true; N.lock(false); };
      if (gsap) gsap.to(menu, { clipPath: 'circle(0% at 100% 0%)', duration: 0.6, ease: 'expo.inOut', onComplete: done });
      else done();
    }
  }

  // ---------- aviso ----------
  let toastTimer;
  N.toast = function (msg, color) {
    const t = $('#toast');
    t.innerHTML = '<i></i>' + N.esc(msg);
    t.style.setProperty('--tc', color || 'var(--c1)');
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
  };

  // ---------- verificação de idade ----------
  N.ageGate = function (done) {
    if (N.store.get('nevoa-18', false)) { done(); return; }
    const el = $('#agegate');
    el.hidden = false;
    N.lock(true);
    const gsap = G();
    if (gsap) gsap.from('.agegate-card', { y: 50, opacity: 0, duration: 1, ease: 'expo.out' });
    $('#agYes').focus();
    $('#agYes').addEventListener('click', () => {
      N.store.set('nevoa-18', true);
      const finish = () => { el.hidden = true; N.lock(false); done(); };
      if (gsap) gsap.to(el, { opacity: 0, duration: 0.6, ease: 'power2.inOut', onComplete: finish });
      else finish();
    }, { once: true });
    $('#agNo').addEventListener('click', () => { $('#agDeny').hidden = false; });
  };

  // ---------- horário de funcionamento ----------
  const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const fmtH = (h) => Math.floor(h) + 'h' + (h % 1 ? String(Math.round((h % 1) * 60)).padStart(2, '0') : '');
  function nowInStore() {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: N.config.timeZone, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')), hour: (parseInt(get('hour'), 10) % 24) + parseInt(get('minute'), 10) / 60 };
    } catch (e) {
      const d = new Date();
      return { day: d.getDay(), hour: d.getHours() + d.getMinutes() / 60 };
    }
  }
  function renderHours() {
    const now = nowInStore();
    const H = N.config.hours;
    const list = $('#hours');
    if (list) {
      list.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) =>
        '<li' + (d === now.day ? ' class="is-today"' : '') + '><span>' + DAYS[d] + '</span><span>' + fmtH(H[d][0]) + ' às ' + fmtH(H[d][1]) + '</span></li>').join('');
    }
    const pill = $('#storeStatus');
    if (!pill) return;
    const [open, close] = H[now.day];
    const isOpen = now.hour >= open && now.hour < close;
    let text;
    if (isOpen) text = 'Aberto agora · fecha às ' + fmtH(close);
    else if (now.hour < open) text = 'Fechado agora · abre hoje às ' + fmtH(open);
    else text = 'Fechado agora · abre amanhã às ' + fmtH(H[(now.day + 1) % 7][0]);
    pill.classList.toggle('is-open', isOpen);
    pill.classList.toggle('is-closed', !isOpen);
    pill.querySelector('span').textContent = text;
  }

  // ---------- copiar número ----------
  function bindCopy() {
    const btn = $('#copyWa');
    if (!btn) return;
    const label = btn.querySelector('span');
    btn.addEventListener('click', () => {
      const value = N.config.whatsappDisplay;
      const ok = () => { label.textContent = 'Copiado'; setTimeout(() => { label.textContent = 'Copiar'; }, 2000); };
      const fallback = () => {
        const range = document.createRange();
        range.selectNodeContents($('#waNumber'));
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        label.textContent = 'Selecionado';
        setTimeout(() => { label.textContent = 'Copiar'; }, 2000);
      };
      try { navigator.clipboard.writeText(value).then(ok, fallback); } catch (e) { fallback(); }
    });
  }

  // ---------- mapa estilizado ----------
  function renderMap() {
    const box = $('#map');
    if (!box) return;
    const ang = -32 * Math.PI / 180, cx = 300, cy = 300;
    const rot = (x, y) => ({ x: cx + (x - cx) * Math.cos(ang) - (y - cy) * Math.sin(ang), y: cy + (x - cx) * Math.sin(ang) + (y - cy) * Math.cos(ang) });
    const pin = rot(330, 300), metro = rot(60, 300);
    const line = (x1, y1, x2, y2, w, color, extra) => '<line class="map-street" pathLength="1" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round" ' + (extra || '') + '/>';
    let streets = '';
    [80, 190, 410, 520].forEach((y) => { streets += line(-260, y, 860, y, 9, '#1e1b28'); });
    [150, 260, 370, 480, 590].forEach((x) => { streets += line(x, -260, x, 860, 9, '#1e1b28'); });
    streets += line(60, -260, 60, 860, 18, '#2a2634');
    const label = (x, y, t, r) => '<text x="' + x + '" y="' + y + '"' + (r ? ' transform="rotate(' + r + ' ' + x + ' ' + y + ')"' : '') + ' font-family="Manrope, sans-serif" font-size="11" font-weight="700" letter-spacing="2.5" fill="#a7a1b3">' + t + '</text>';
    box.innerHTML =
      '<svg viewBox="0 0 600 600" role="img" aria-label="Mapa estilizado: boutique NÉVOA na Rua Oscar Freire, Jardins, perto do metrô Oscar Freire">' +
        '<defs>' +
          '<pattern id="mapDots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ede9f2" fill-opacity=".06"/></pattern>' +
          '<linearGradient id="mapMain" x1="0" x2="1"><stop offset="0" stop-color="#e7d3a8"/><stop offset="1" style="stop-color:var(--c1)"/></linearGradient>' +
          '<radialGradient id="mapGlow"><stop offset="0" style="stop-color:var(--c1);stop-opacity:.45"/><stop offset="1" style="stop-color:var(--c1);stop-opacity:0"/></radialGradient>' +
        '</defs>' +
        '<rect width="600" height="600" fill="#0c0b11"/><rect width="600" height="600" fill="url(#mapDots)"/>' +
        '<g transform="rotate(-32 300 300)">' +
          '<rect x="400" y="320" width="160" height="70" rx="10" fill="#11241b"/>' +
          streets +
          line(-260, 300, 860, 300, 14, 'url(#mapMain)') +
          '<line class="map-route" x1="60" y1="300" x2="330" y2="300" stroke="#ede9f2" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/>' +
          label(150, 290, 'R. OSCAR FREIRE') + label(400, 182, 'AL. LORENA') + label(400, 402, 'AL. SANTOS') +
          label(254, 560, 'R. HADDOCK LOBO', -90) + label(364, 560, 'R. BELA CINTRA', -90) + label(474, 560, 'R. AUGUSTA', -90) + label(52, 560, 'AV. REBOUÇAS', -90) +
          label(418, 360, 'PRAÇA') +
        '</g>' +
        '<circle cx="' + metro.x.toFixed(1) + '" cy="' + metro.y.toFixed(1) + '" r="13" fill="#ffd400"/>' +
        '<text x="' + metro.x.toFixed(1) + '" y="' + (metro.y + 4.5).toFixed(1) + '" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="800" font-size="13" fill="#09080d">M</text>' +
        '<text x="' + (metro.x + 20).toFixed(1) + '" y="' + (metro.y + 30).toFixed(1) + '" font-family="Manrope, sans-serif" font-weight="700" font-size="12" fill="#ede9f2">Metrô Oscar Freire</text>' +
        '<text x="' + (metro.x + 20).toFixed(1) + '" y="' + (metro.y + 46).toFixed(1) + '" font-family="Manrope, sans-serif" font-size="11" fill="#a7a1b3">Linha 4 · 7 min a pé</text>' +
        '<circle cx="' + pin.x.toFixed(1) + '" cy="' + pin.y.toFixed(1) + '" r="90" fill="url(#mapGlow)"/>' +
        '<circle class="map-pulse" cx="' + pin.x.toFixed(1) + '" cy="' + pin.y.toFixed(1) + '" r="12" style="fill:var(--c1)" opacity=".5"/>' +
        '<circle class="map-pulse map-pulse--2" cx="' + pin.x.toFixed(1) + '" cy="' + pin.y.toFixed(1) + '" r="12" style="fill:var(--c1)" opacity=".5"/>' +
        '<g class="map-pin" transform="translate(' + pin.x.toFixed(1) + ' ' + pin.y.toFixed(1) + ')">' +
          '<path d="M0 0C-4-10-16-16-16-30a16 16 0 0 1 32 0C16-16 4-10 0 0z" fill="#ede9f2"/>' +
          '<circle cx="0" cy="-30" r="6" fill="#09080d"/>' +
        '</g>' +
      '</svg>' +
      '<div class="map-card" style="left:' + (pin.x / 6).toFixed(1) + '%;top:' + (pin.y / 6 - 27).toFixed(1) + '%"><b>NÉVOA</b><span>' + N.esc(N.config.street) + '</span></div>';
  }

  // ---------- eventos globais ----------
  function bindEvents() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add]');
      if (add) { addToBag(add.dataset.add, add); return; }
      const q = e.target.closest('[data-qty]');
      if (q) {
        const id = q.dataset.id;
        bag[id] = (bag[id] || 0) + parseInt(q.dataset.qty, 10);
        if (bag[id] <= 0) delete bag[id];
        saveBag(); renderBag();
        if (!bagLines().length) $('#bagEmpty .btn').focus();
        return;
      }
      if (e.target.closest('[data-close]')) { closeDrawer(); }
    });
    $('#bagBtn').addEventListener('click', openDrawer);
    $('#menuBtn').addEventListener('click', () => toggleMenu());
    $$('#mobileMenu a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('#drawer').hidden) closeDrawer();
      else if (!$('#mobileMenu').hidden) toggleMenu(false);
    });
  }

  N.ui = {
    init() {
      fillConfig();
      buildMarquee();
      buildHero();
      buildGrid();
      renderBag();
      renderHours();
      setInterval(renderHours, 60000);
      renderMap();
      bindCopy();
      bindEvents();
    }
  };
})();
