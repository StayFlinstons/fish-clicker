// Animação do fundo pixel art do rio (camada 1) sem arte nova: redesenha faixas horizontais da imagem
// visível deslocadas em "blocos" da arte (o truque de raster dos jogos 16-bit para água e calor).
// A superfície ondula e as plantas balançam mais nas pontas do que no chão. Desenha num canvas
// próprio (#world1-bg-anim), entre as <img> de fundo e o overlay de iluminação, e só nas faixas
// animadas: o resto da cena continua sendo a <img> original por baixo.

// Tamanho aparente do "pixel" da arte na imagem original. As artes geradas por IA não têm grade
// exata (a maioria das cores dura 1–3px), então 4px é o bloco visual usado como passo.
const BLOCK = 4;

// Faixas animadas em coordenadas da imagem original (1000x749).
//   y0/y1: faixa vertical; x0/x1: recorte horizontal opcional (padrão: largura toda)
//   amp: deslocamento máximo em blocos; speed/freq: velocidade e comprimento da onda
//   ground: se definido, o balanço cai a zero nessa linha (base das plantas) e é máximo em y0
const SURFACE = { y0: 0, y1: 92, amp: 1, speed: 1.6, freq: 0.09 };
const PLANTS = { y0: 470, y1: 749, ground: 720, amp: 2, speed: 1.1, freq: 0.035 };

const BANDS_BY_IMAGE = {
  'world1-bg-dia': [SURFACE, PLANTS],
  'world1-bg-sunset': [SURFACE, PLANTS],
  'world1-bg-noite': [SURFACE, PLANTS],
  // No Eclipse o topo é céu com o sol negro (não pode ondular): anima o reflexo do sol na água
  // (só a coluna central, sem mexer nas torres de pedra) e as plantas do fundo
  'world1-bg-eclipse': [
    { y0: 168, y1: 450, x0: 400, x1: 600, amp: 1, speed: 2.4, freq: 0.2 },
    { y0: 560, y1: 749, ground: 735, amp: 2, speed: 1.1, freq: 0.035 }
  ]
};

export class LakeBackgroundAnimator {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.images = Object.keys(BANDS_BY_IMAGE).map(id => document.getElementById(id)).filter(Boolean);
    this.enabled = true;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  }

  setEnabled(on) {
    this.enabled = Boolean(on);
    if (!this.enabled) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Chamado a cada quadro pelo loop de animação do lago (game.js)
  update() {
    const { canvas, ctx } = this;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    if (!this.enabled || this.reducedMotion || !W || !H) return; // painel oculto, camada do mar ou desligado
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    const time = performance.now() / 1000;

    for (const img of this.images) {
      // Na troca entre fases as <img> fazem crossfade; cada uma é desenhada com a opacidade atual
      const alpha = parseFloat(getComputedStyle(img).opacity);
      if (!(alpha > 0.01) || !img.complete || !img.naturalWidth) continue;
      // Mesmo enquadramento das <img>: object-fit: cover + object-position: center bottom
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(W / iw, H / ih);
      const ox = (W - iw * s) / 2, oy = H - ih * s;
      ctx.globalAlpha = alpha;
      for (const band of BANDS_BY_IMAGE[img.id]) this.drawBand(img, band, time, s, ox, oy, iw);
    }
    ctx.globalAlpha = 1;
  }

  drawBand(img, band, time, s, ox, oy, iw) {
    const x0 = band.x0 ?? 0, x1 = band.x1 ?? iw;
    for (let sy = band.y0; sy < band.y1; sy += BLOCK) {
      let amp = band.amp;
      if (band.ground !== undefined) {
        amp *= Math.max(0, Math.min(1, (band.ground - sy) / (band.ground - band.y0)));
      }
      const shift = Math.round(Math.sin(time * band.speed + sy * band.freq) * amp) * BLOCK;
      if (shift === 0) continue; // linha parada: a <img> por baixo já mostra exatamente isso
      const sh = Math.min(BLOCK, band.y1 - sy);
      // Bordas arredondadas para as faixas encostarem sem vão nem sobreposição
      const top = Math.round(oy + sy * s), bottom = Math.round(oy + (sy + sh) * s);
      const left = Math.round(ox + (x0 + shift) * s), right = Math.round(ox + (x1 + shift) * s);
      if (bottom <= top) continue;
      this.ctx.drawImage(img, x0, sy, x1 - x0, sh, left, top, right - left, bottom - top);
    }
  }
}
