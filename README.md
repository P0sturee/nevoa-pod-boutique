# NÉVOA Pod Boutique

Site animado de uma loja fictícia de pods, feito com HTML, CSS e JavaScript puro, animações em [GSAP](https://gsap.com) (ScrollTrigger e Flip) e rolagem suave com [Lenis](https://github.com/darkroomengineering/lenis).

## O que tem

- Abertura com pré-carregamento, verificação de idade (+18) e hero com um pod que reage ao mouse, solta vapor e troca de sabor
- Degustação guiada: seção fixada em que cada trecho de rolagem revela um pod com um efeito diferente (giro 3D, subida, zoom, balanço e cambalhota)
- Filme de campanha de 18 segundos feito com uma timeline GSAP, com play, barra de progresso e timecode; no celular vira vertical (9:16)
- Coleção com 12 sabores, filtros animados e cartões com inclinação 3D
- Sacola que monta o pedido e abre o WhatsApp com a mensagem pronta
- Mapa estilizado, horários e status "aberto agora" pelo horário de São Paulo
- Responsivo do celular ao desktop, com versão mais calma para quem ativa `prefers-reduced-motion`

## Como rodar

Abra o `index.html` no navegador, ou sirva a pasta localmente:

```bash
python -m http.server 5174
```

e acesse `http://localhost:5174`. As fontes (Google Fonts) e as bibliotecas (cdnjs e jsDelivr) carregam da internet.

## Personalizar

Os dados da loja ficam em [`js/data.js`](js/data.js): número do WhatsApp, endereço, horários, preços e sabores. O número e o endereço atuais são fictícios; troque antes de publicar.

## Estrutura

```
index.html
css/base.css        tokens, cabeçalho, hero, botões, faixa de sabores
css/sections.css    degustação, filme, coleção, diferenciais, boutique, rodapé, sacola
js/data.js          dados da loja e dos sabores
js/pod.js           desenho dos pods e das partículas em SVG
js/ui.js            sacola, menus, verificação de idade, horário e mapa
js/journey.js       degustação guiada (ScrollTrigger com pin)
js/film.js          filme de campanha e controles do player
js/motion.js        rolagem suave, abertura, parallax, revelações e inicialização
```

## Aviso

Venda proibida para menores de 18 anos. Produto com nicotina, substância que causa dependência. Marca, endereço e telefone deste projeto são fictícios.
