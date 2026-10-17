/* NÉVOA: dados da loja e dos sabores.
   Para colocar no ar, troque aqui o número de WhatsApp, o endereço, os horários e os preços. */
(function () {
  const N = (window.NEVOA = window.NEVOA || {});
  if (!document.documentElement.lang) document.documentElement.lang = 'pt-BR';

  N.config = {
    brand: 'NÉVOA',
    whatsapp: '5511987654321',               // DDI + DDD + número, só dígitos
    whatsappDisplay: '+55 (11) 98765-4321',
    street: 'Rua Oscar Freire, 1209',
    district: 'Jardins, São Paulo · SP',
    cep: 'CEP 01426-001',
    addressShort: 'Rua Oscar Freire, 1209 · Jardins, SP',
    mapsQuery: 'Rua Oscar Freire, 1209, Jardins, São Paulo, SP',
    timeZone: 'America/Sao_Paulo',
    // Horário por dia da semana (0 = domingo): [abre, fecha] em horas
    hours: [[12, 20], [10, 22], [10, 22], [10, 22], [10, 22], [10, 23], [10, 23]],
    greeting: 'Olá, NÉVOA! Vim pelo site e quero fazer um pedido.'
  };

  // parts: partículas que flutuam em volta do pod. Formato "tipo" ou "tipo:cor1:cor2".
  N.flavors = [
    { id: 'mango-ice', name: 'Mango Ice', notes: 'Manga palmer · brisa gelada', desc: 'Manga madura e suculenta com um final gelado que refresca a cada puff.', c1: '#ffb627', c2: '#ff6b1a', deep: '#1f1003', tags: ['gelados', 'frutados'], cat: 'Gelados', puffs: '10K', ice: 4, sweet: 3, price: 99.9, parts: ['orb', 'drop', 'cube', 'orb:#ffd166', 'cube', 'drop', 'orb'] },
    { id: 'blue-razz', name: 'Blue Razz Ice', notes: 'Framboesa azul · gelo polar', desc: 'Framboesa azul intensa e levemente cítrica, envolta em gelo polar.', c1: '#3d7bff', c2: '#8b5cff', deep: '#040b20', tags: ['gelados'], cat: 'Gelados', puffs: '12K', ice: 5, sweet: 3, price: 109.9, parts: ['orb', 'cube', 'drop', 'cube', 'orb:#8b5cff', 'cube', 'drop'] },
    { id: 'watermelon', name: 'Watermelon Chill', notes: 'Melancia · hortelã suave', desc: 'Melancia de verão, doce na medida, com um toque de hortelã no fim.', c1: '#ff3d5a', c2: '#2ee59d', deep: '#1f030a', tags: ['gelados', 'frutados'], cat: 'Frutados', puffs: '10K', ice: 3, sweet: 4, price: 99.9, parts: ['slice', 'drop', 'cube', 'leaf:#1f9e5a:#2ee59d', 'slice', 'drop', 'cube'] },
    { id: 'mint-glacier', name: 'Mint Glacier', notes: 'Menta · eucalipto', desc: 'Menta pura e eucalipto para quem gosta de um gelado limpo e intenso.', c1: '#2ef2c8', c2: '#b9fff0', deep: '#021a16', tags: ['gelados', 'classicos'], cat: 'Gelados', puffs: '12K', ice: 5, sweet: 1, price: 109.9, parts: ['leaf', 'cube', 'leaf', 'cube', 'drop', 'leaf', 'cube'] },
    { id: 'acai-guarana', name: 'Açaí Guaraná', notes: 'Açaí da Amazônia · guaraná', desc: 'O clássico brasileiro: açaí cremoso com a energia do guaraná.', c1: '#c0309c', c2: '#ff7ab6', deep: '#1a0414', tags: ['frutados', 'doces'], cat: 'Frutados', puffs: '15K', ice: 2, sweet: 4, price: 119.9, parts: ['orb:#5b1a6e', 'orb', 'drop', 'leaf:#2c7a3f:#59b36b', 'orb:#5b1a6e', 'drop', 'orb'] },
    { id: 'grape-frost', name: 'Grape Frost', notes: 'Uva roxa · geada fina', desc: 'Uva roxa madura com uma geada fina que deixa tudo mais leve.', c1: '#7c4dff', c2: '#c3a6ff', deep: '#0d0620', tags: ['gelados', 'doces'], cat: 'Gelados', puffs: '10K', ice: 4, sweet: 4, price: 99.9, parts: ['orb', 'orb:#5a2fd6', 'cube', 'orb', 'drop', 'cube', 'orb:#5a2fd6'] },
    { id: 'strawberry-kiwi', name: 'Strawberry Kiwi', notes: 'Morango · kiwi dourado', desc: 'Morango doce e kiwi azedinho em equilíbrio perfeito.', c1: '#ff2e6a', c2: '#9be15d', deep: '#1f0410', tags: ['frutados'], cat: 'Frutados', puffs: '10K', ice: 1, sweet: 4, price: 99.9, parts: ['slice:#8bd13f:#7a5230', 'orb', 'drop', 'leaf:#2f8f3a:#7ed957', 'orb', 'slice:#8bd13f:#7a5230', 'drop'] },
    { id: 'maracuja', name: 'Maracujá Tropical', notes: 'Maracujá · mel silvestre', desc: 'Maracujá azedinho adoçado com mel silvestre. Tropical do começo ao fim.', c1: '#ffc300', c2: '#7a3cff', deep: '#1a1302', tags: ['frutados', 'doces'], cat: 'Frutados', puffs: '10K', ice: 1, sweet: 3, price: 99.9, parts: ['slice', 'drop', 'leaf:#3d8b37:#7cc66b', 'slice', 'orb:#7a3cff', 'drop', 'slice'] },
    { id: 'peach-bellini', name: 'Peach Bellini', notes: 'Pêssego · espumante', desc: 'Pêssego aveludado com bolhas de espumante. Leve e elegante.', c1: '#ff9f7a', c2: '#ffd6a5', deep: '#1f0e07', tags: ['frutados', 'doces'], cat: 'Doces', puffs: '10K', ice: 1, sweet: 4, price: 99.9, parts: ['orb', 'drop', 'orb', 'leaf:#4f9a45:#8fd17f', 'drop', 'orb', 'drop'] },
    { id: 'banana-cream', name: 'Banana Cream', notes: 'Banana · creme de baunilha', desc: 'Banana caramelizada e creme de baunilha, macio como sobremesa.', c1: '#f2d675', c2: '#fff3c4', deep: '#1a1606', tags: ['doces'], cat: 'Doces', puffs: '8K', ice: 0, sweet: 5, price: 89.9, parts: ['drop', 'orb', 'drop', 'orb', 'drop', 'orb', 'drop'] },
    { id: 'lychee-rose', name: 'Lychee Rose', notes: 'Lichia · pétalas de rosa', desc: 'Lichia delicada com um floral de rosa que surpreende no final.', c1: '#ff8fb8', c2: '#ffe3ee', deep: '#1f0a12', tags: ['frutados', 'doces'], cat: 'Doces', puffs: '10K', ice: 2, sweet: 4, price: 109.9, parts: ['orb:#fff0f4', 'leaf', 'drop', 'leaf', 'orb:#fff0f4', 'leaf', 'drop'] },
    { id: 'tobacco-gold', name: 'Tobacco Gold', notes: 'Tabaco curado · caramelo', desc: 'Tabaco curado com notas de caramelo e baunilha. Clássico e encorpado.', c1: '#c8955a', c2: '#6b4423', deep: '#140c05', tags: ['classicos'], cat: 'Clássicos', puffs: '8K', ice: 0, sweet: 2, price: 89.9, parts: ['leaf', 'drop', 'leaf', 'drop', 'leaf', 'drop', 'leaf'] }
  ];

  N.journeyIds = ['mango-ice', 'blue-razz', 'watermelon', 'mint-glacier', 'acai-guarana', 'grape-frost'];
  N.filmIds = ['strawberry-kiwi', 'blue-razz', 'maracuja', 'acai-guarana', 'mint-glacier', 'peach-bellini'];
  N.lineupIds = ['grape-frost', 'watermelon', 'mint-glacier', 'mango-ice', 'acai-guarana', 'blue-razz', 'lychee-rose'];
  N.heroIds = ['mango-ice', 'blue-razz', 'watermelon', 'mint-glacier', 'acai-guarana', 'grape-frost', 'peach-bellini', 'tobacco-gold'];

  // ---------- utilidades ----------
  N.byId = (id) => N.flavors.find((f) => f.id === id);
  N.brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  N.waLink = (msg) => 'https://wa.me/' + N.config.whatsapp + '?text=' + encodeURIComponent(msg || N.config.greeting);
  N.flavorMsg = (f) => 'Olá, NÉVOA! Quero pedir o pod ' + f.name + ' (' + f.puffs + ' puffs, ' + N.brl(f.price) + ').';
  N.mapsLink = () => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(N.config.mapsQuery);
  N.flavorVars = (f) => '--c1:' + f.c1 + ';--c2:' + f.c2 + ';--deep:' + f.deep;
  N.dots = (n) => '<span class="dots" aria-hidden="true">' + [0, 1, 2, 3, 4].map((i) => '<i' + (i < n ? ' class="on"' : '') + '></i>').join('') + '</span>';
  N.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  N.store = {
    get(key, fallback) {
      try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
    },
    set(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* armazenamento indisponível */ }
    }
  };

  N.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  N.isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  N.hasGsap = typeof window.gsap !== 'undefined';
})();
