/* NÉVOA: desenho dos pods e das partículas de sabor em SVG.
   As cores vêm das variáveis CSS --c1 e --c2 do elemento pai, então trocar a variável troca a cor do pod. */
(function () {
  const N = window.NEVOA;
  let uid = 0;
  const mix = (c, pct, other) => 'color-mix(in srgb, ' + c + ' ' + pct + '%, ' + other + ')';
  const stop = (offset, color, opacity) =>
    '<stop offset="' + offset + '" style="stop-color:' + color + (opacity != null ? ';stop-opacity:' + opacity : '') + '"/>';

  N.podSVG = function () {
    const n = ++uid;
    const id = (k) => k + 'p' + n;
    return '' +
'<svg class="pod" viewBox="0 0 160 440" aria-hidden="true" focusable="false">' +
  '<defs>' +
    '<linearGradient id="' + id('b') + '" x1="0" x2="1">' +
      stop(0, mix('var(--c1)', 40, '#000')) + stop(0.16, 'var(--c1)') + stop(0.32, mix('var(--c1)', 55, '#fff')) +
      stop(0.5, 'var(--c1)') + stop(0.82, mix('var(--c1)', 62, '#000')) + stop(1, mix('var(--c1)', 30, '#000')) +
    '</linearGradient>' +
    '<linearGradient id="' + id('t') + '" x1="0" y1="0" x2="0" y2="1">' +
      stop(0, 'var(--c2)', 0.55) + stop(0.45, 'var(--c2)', 0) + stop(1, '#000', 0.45) +
    '</linearGradient>' +
    '<linearGradient id="' + id('m') + '" x1="0" x2="1">' +
      stop(0, '#0a0a0f') + stop(0.3, '#3d3b48') + stop(0.55, '#17161d') + stop(1, '#050507') +
    '</linearGradient>' +
    '<linearGradient id="' + id('r') + '" x1="0" x2="1">' +
      stop(0, '#5d5b66') + stop(0.35, '#f4f2f8') + stop(0.6, '#8d8a96') + stop(1, '#2a2830') +
    '</linearGradient>' +
    '<linearGradient id="' + id('l') + '" x1="0" y1="0" x2="0" y2="1">' +
      stop(0, mix('var(--c2)', 65, '#fff')) + stop(1, 'var(--c1)') +
    '</linearGradient>' +
    '<linearGradient id="' + id('g') + '" x1="0" x2="1">' +
      stop(0, '#fff', 0.38) + stop(0.28, '#fff', 0.06) + stop(0.7, '#fff', 0) + stop(1, '#fff', 0.16) +
    '</linearGradient>' +
    '<clipPath id="' + id('w') + '"><rect x="52" y="122" width="56" height="148" rx="28"/></clipPath>' +
    '<filter id="' + id('f') + '" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="3"/></filter>' +
  '</defs>' +
  // bocal
  '<path d="M60 8h40a14 14 0 0 1 14 14v66H46V22A14 14 0 0 1 60 8z" fill="url(#' + id('m') + ')"/>' +
  '<rect x="68" y="15" width="24" height="4" rx="2" fill="#000" opacity=".75"/>' +
  '<rect x="52" y="22" width="4" height="60" rx="2" fill="#fff" opacity=".12"/>' +
  // anel metálico
  '<rect x="38" y="80" width="84" height="16" rx="6" fill="url(#' + id('r') + ')"/>' +
  // corpo
  '<rect x="22" y="92" width="116" height="338" rx="42" fill="url(#' + id('b') + ')"/>' +
  '<rect x="22" y="92" width="116" height="338" rx="42" fill="url(#' + id('t') + ')"/>' +
  // janela com líquido
  '<rect x="50" y="120" width="60" height="152" rx="30" fill="#000" opacity=".5"/>' +
  '<g clip-path="url(#' + id('w') + ')">' +
    '<path class="pod-wave" d="M0 176q14-9 28 0t28 0t28 0t28 0t28 0t28 0t28 0t28 0V290H0z" fill="url(#' + id('l') + ')"/>' +
    '<circle class="pod-bub" cx="66" cy="262" r="3" fill="#fff" style="animation-delay:-.4s"/>' +
    '<circle class="pod-bub" cx="84" cy="266" r="2.2" fill="#fff" style="animation-delay:-1.6s"/>' +
    '<circle class="pod-bub" cx="95" cy="258" r="2.8" fill="#fff" style="animation-delay:-2.5s"/>' +
    '<circle class="pod-bub" cx="75" cy="270" r="1.8" fill="#fff" style="animation-delay:-3s"/>' +
  '</g>' +
  '<rect x="52" y="122" width="56" height="148" rx="28" fill="url(#' + id('g') + ')" stroke="#fff" stroke-opacity=".28"/>' +
  // gravação
  '<text x="80" y="340" text-anchor="middle" transform="rotate(-90 80 340)" font-family="Unbounded, Arial Black, sans-serif" font-weight="700" font-size="15" letter-spacing="6" fill="#fff" fill-opacity=".82">NÉVOA</text>' +
  // LED
  '<rect class="pod-led" x="60" y="402" width="40" height="7" rx="3.5" style="fill:var(--c2)" filter="url(#' + id('f') + ')"/>' +
  '<rect class="pod-led" x="64" y="404.5" width="32" height="3" rx="1.5" fill="#fff" opacity=".9"/>' +
  // brilho e borda
  '<rect x="34" y="106" width="9" height="300" rx="4.5" fill="#fff" opacity=".22"/>' +
  '<rect x="22.5" y="92.5" width="115" height="337" rx="41.5" fill="none" stroke="#fff" stroke-opacity=".16"/>' +
'</svg>';
  };

  // Partículas: "orb" (fruta redonda), "drop" (gota), "cube" (gelo), "slice" (fatia), "leaf" (folha/pétala)
  N.partSVG = function (spec) {
    const bits = spec.split(':');
    const type = bits[0];
    const a = bits[1] || 'var(--c1)';
    const b = bits[2] || 'var(--c2)';
    const g = 'q' + (++uid);
    const open = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
    switch (type) {
      case 'orb':
        return open +
          '<defs><radialGradient id="' + g + '" cx=".36" cy=".32" r=".78">' +
          stop(0, mix(a, 35, '#fff')) + stop(0.45, a) + stop(1, mix(a, 40, '#000')) + '</radialGradient></defs>' +
          '<circle cx="50" cy="50" r="44" fill="url(#' + g + ')"/>' +
          '<ellipse cx="36" cy="30" rx="12" ry="7" transform="rotate(-30 36 30)" fill="#fff" opacity=".55"/></svg>';
      case 'drop':
        return open +
          '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' +
          stop(0, mix(bits[2] || b, 55, '#fff')) + stop(1, a) + '</linearGradient></defs>' +
          '<path d="M50 4C50 4 18 44 18 64a32 32 0 0 0 64 0C82 44 50 4 50 4z" fill="url(#' + g + ')"/>' +
          '<ellipse cx="38" cy="62" rx="6" ry="12" transform="rotate(20 38 62)" fill="#fff" opacity=".5"/></svg>';
      case 'cube':
        return open +
          '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">' +
          stop(0, '#fff', 0.55) + stop(0.5, bits[1] ? a : b, 0.28) + stop(1, '#fff', 0.12) + '</linearGradient></defs>' +
          '<g transform="rotate(14 50 50)"><rect x="16" y="16" width="68" height="68" rx="16" fill="url(#' + g + ')" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>' +
          '<path d="M30 30h26" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/>' +
          '<path d="M30 40h10" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/></g></svg>';
      case 'slice': {
        let seeds = '';
        for (let i = 0; i < 8; i++) {
          const ang = (i * 45 * Math.PI) / 180;
          const x = 50 + Math.cos(ang) * 22, y = 50 + Math.sin(ang) * 22;
          seeds += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="2.2" ry="4" transform="rotate(' + (i * 45 + 90) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')" fill="#1a0d0a" opacity=".85"/>';
        }
        let segs = '';
        for (let i = 0; i < 8; i++) segs += '<path d="M50 50L50 14" transform="rotate(' + (i * 45 + 22.5) + ' 50 50)" stroke="#fff" stroke-opacity=".28" stroke-width="1.5"/>';
        return open +
          '<circle cx="50" cy="50" r="46" style="fill:' + b + '"/>' +
          '<circle cx="50" cy="50" r="41" fill="#fff" opacity=".85"/>' +
          '<circle cx="50" cy="50" r="38" style="fill:' + a + '"/>' + segs + seeds +
          '<circle cx="50" cy="50" r="7" fill="#fff" opacity=".45"/>' +
          '<path d="M22 30a34 34 0 0 1 22-14" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round" fill="none"/></svg>';
      }
      case 'leaf':
        return open +
          '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' + stop(0, b) + stop(1, a) + '</linearGradient></defs>' +
          '<path d="M50 96C22 74 12 38 50 4c38 34 28 70 0 92z" fill="url(#' + g + ')"/>' +
          '<path d="M50 90V14M50 40l-14-10M50 56l16-12M50 72l-12-9" stroke="#fff" stroke-opacity=".42" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
      default:
        return '';
    }
  };

  // Posições pré-definidas (em %) em volta do pod. d = profundidade (parallax), s = tamanho base em px.
  N.SPOTS = [
    { x: 14, y: 20, s: 74, d: 0.6, r: -20 },
    { x: 84, y: 14, s: 56, d: 0.9, r: 25 },
    { x: 88, y: 62, s: 96, d: 1.4, r: 12 },
    { x: 9, y: 70, s: 112, d: 1.6, r: -35 },
    { x: 64, y: 88, s: 46, d: 0.5, r: 40 },
    { x: 30, y: 90, s: 62, d: 1.1, r: 15 },
    { x: 72, y: 32, s: 34, d: 0.4, r: 0 }
  ];

  N.fillParts = function (el, flavor, spots) {
    const list = spots || N.SPOTS;
    el.innerHTML = list.map((p, i) => {
      const spec = flavor.parts[i % flavor.parts.length];
      const size = 'calc(' + p.s + 'px * var(--ps, 1))';
      const off = 'calc(' + (p.s / -2) + 'px * var(--ps, 1))';
      return '<span class="part" data-depth="' + p.d + '" style="left:' + p.x + '%;top:' + p.y + '%;width:' + size + ';height:' + size +
        ';margin:' + off + ' 0 0 ' + off + ';z-index:' + (p.d > 1 ? 3 : 0) + ';opacity:' + (p.d < 0.6 ? 0.6 : 1) + '">' +
        '<i style="display:block;width:100%;height:100%;transform:rotate(' + p.r + 'deg)">' + N.partSVG(spec) + '</i></span>';
    }).join('');
    return Array.from(el.children);
  };
})();
