// Animação dos fundos pixel art das camadas sem arte nova: redesenha faixas horizontais da imagem
// visível deslocadas em "blocos" da arte (o truque de raster dos jogos 16-bit para água e calor).
// A superfície ondula, as plantas balançam mais nas pontas do que no chão, a fumaça das fumarolas
// oscila e o calor da lava tremula. Desenha num canvas próprio (#lake-bg-anim), entre as <img> de
// fundo e o overlay do Eclipse, e só nas faixas animadas: o resto continua sendo a <img> por baixo.

// Faixas animadas por imagem, em coordenadas da imagem original.
//   block: tamanho aparente do "pixel" da arte (as artes geradas por IA não têm grade exata)
//   y0/y1: faixa vertical; x0/x1: recorte horizontal opcional (padrão: largura toda)
//   amp: deslocamento máximo em passos; step: tamanho do passo em px (padrão: block, menor = mais sutil)
//   speed/freq: velocidade e comprimento da onda
//   ground: linha onde o balanço é zero (base das plantas, ou o topo de cipós pendurados);
//           o balanço cresce com a distância até ela e é máximo na ponta mais longe da faixa
const RIVER_SURFACE = { y0: 0, y1: 92, amp: 1, speed: 1.6, freq: 0.09 };
const RIVER_PLANTS = { y0: 470, y1: 749, ground: 720, amp: 2, speed: 1.1, freq: 0.035 };

const BANDS_BY_IMAGE = {
  'zonas/zona_1.png': { block: 4, bands: [RIVER_SURFACE, RIVER_PLANTS] },
  // No Eclipse o topo é céu com o sol negro (não pode ondular): anima o reflexo do sol na água
  // (só a coluna central, sem mexer nas torres de pedra) e as plantas do fundo
  'fundo-lago-eclipse.png': {
    block: 4,
    bands: [
      { y0: 168, y1: 450, x0: 400, x1: 600, amp: 1, speed: 2.4, freq: 0.2 },
      { y0: 560, y1: 749, ground: 735, amp: 2, speed: 1.1, freq: 0.035 }
    ]
  },
  // Zona do Sol: superfície e algas/corais
  'zonas/zona_2.png': {
    block: 5,
    bands: [
      { y0: 0, y1: 120, amp: 1, speed: 1.6, freq: 0.07 },
      { y0: 500, y1: 1085, ground: 1070, amp: 2, speed: 1.1, freq: 0.03 }
    ]
  },
  // Zona do Crepúsculo: algas e corais bioluminescentes
  'zonas/zona_3.png': {
    block: 5,
    bands: [{ y0: 420, y1: 1085, ground: 1075, amp: 2, speed: 0.8, freq: 0.025 }]
  },
  // Zona da Meia-Noite: plantas em cima das bordas, cipós pendurados embaixo delas e o fundo
  'zonas/zona_4.png': {
    block: 5,
    bands: [
      { y0: 20, y1: 160, x0: 0, x1: 420, ground: 160, amp: 2, speed: 0.8, freq: 0.03 },
      { y0: 200, y1: 420, x0: 0, x1: 420, ground: 200, amp: 2, speed: 0.7, freq: 0.03 },
      { y0: 250, y1: 365, x0: 1180, x1: 1450, ground: 365, amp: 2, speed: 0.8, freq: 0.03 },
      { y0: 380, y1: 510, x0: 1140, x1: 1450, ground: 380, amp: 2, speed: 0.7, freq: 0.03 },
      { y0: 520, y1: 1085, ground: 1075, amp: 2, speed: 0.8, freq: 0.025 }
    ]
  },
  // Planície Abissal: fumaça das fumarolas (mexe mais no alto) e o calor da lava tremulando
  'zonas/zona_5.png': {
    block: 5,
    bands: [
      { y0: 0, y1: 330, x0: 60, x1: 340, ground: 330, amp: 2, speed: 0.6, freq: 0.04 },
      { y0: 0, y1: 250, x0: 1180, x1: 1450, ground: 250, amp: 2, speed: 0.6, freq: 0.04 },
      { y0: 620, y1: 1085, amp: 1, step: 2, speed: 1.4, freq: 0.12 }
    ]
  },
  // Fossa Hadal: o vazio do centro da fenda ondula devagar
  'zonas/zona_6.png': {
    block: 5,
    bands: [{ y0: 0, y1: 1084, x0: 560, x1: 900, amp: 1, speed: 0.7, freq: 0.02 }]
  }
};

export class LakeBackgroundAnimator {
  constructor(canvas, images) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.images = images.filter(Boolean);
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
    if (!this.enabled || this.reducedMotion || !W || !H) return; // painel oculto ou desligado
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, W, H);
    const time = performance.now() / 1000;

    for (const img of this.images) {
      const config = BANDS_BY_IMAGE[img.getAttribute('src')];
      if (!config) continue;
      // Na entrada e saída do Eclipse as <img> fazem crossfade; cada uma é desenhada com a opacidade atual
      const alpha = parseFloat(getComputedStyle(img).opacity);
      if (!(alpha > 0.01) || !img.complete || !img.naturalWidth) continue;
      // Mesmo enquadramento das <img>: object-fit: cover + object-position: center bottom
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const s = Math.max(W / iw, H / ih);
      const ox = (W - iw * s) / 2, oy = H - ih * s;
      ctx.globalAlpha = alpha;
      for (const band of config.bands) this.drawBand(img, band, config.block, time, s, ox, oy, iw);
    }
    ctx.globalAlpha = 1;
  }

  drawBand(img, band, block, time, s, ox, oy, iw) {
    const x0 = band.x0 ?? 0, x1 = band.x1 ?? iw;
    const reach = band.ground === undefined ? 0 : Math.max(Math.abs(band.y0 - band.ground), Math.abs(band.y1 - band.ground));
    for (let sy = band.y0; sy < band.y1; sy += block) {
      let amp = band.amp;
      if (reach) amp *= Math.min(1, Math.abs(sy - band.ground) / reach);
      const shift = Math.round(Math.sin(time * band.speed + sy * band.freq) * amp) * (band.step ?? block);
      if (shift === 0) continue; // linha parada: a <img> por baixo já mostra exatamente isso
      const sh = Math.min(block, band.y1 - sy);
      // Bordas arredondadas para as faixas encostarem sem vão nem sobreposição
      const top = Math.round(oy + sy * s), bottom = Math.round(oy + (sy + sh) * s);
      const left = Math.round(ox + (x0 + shift) * s), right = Math.round(ox + (x1 + shift) * s);
      if (bottom <= top) continue;
      this.ctx.drawImage(img, x0, sy, x1 - x0, sh, left, top, right - left, bottom - top);
    }
  }
}
