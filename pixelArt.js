// pixelArt.js — Motor de Pixel Art: sprites, peixes, lago animado
// A vara/linha/bóia/isca são tratadas via SVG no HTML (controle preciso de posição)

// ═══════════════════════════════════════════════
// PALETAS DE CORES DOS PEIXES
// ═══════════════════════════════════════════════
const PALETTES = {
  lambari:   { body:'#a8d8ea', belly:'#e0f0ff', eye:'#1a1a2e', fin:'#6ba3be', outline:'#4a7c95' },
  tilapia:   { body:'#7fbc8c', belly:'#c8e6c9', eye:'#1a1a2e', fin:'#4e8a5e', outline:'#3d6b4a' },
  sardinha:  { body:'#b0c4de', belly:'#e8eef5', eye:'#1a1a2e', fin:'#8aa4c0', outline:'#5f7d9a' },
  carpa:     { body:'#e8a849', belly:'#fce4a8', eye:'#1a1a2e', fin:'#c4872c', outline:'#9e6b1f' },
  bagre:     { body:'#8b7355', belly:'#c4a882', eye:'#1a1a2e', fin:'#6b5640', outline:'#4a3b2b' },
  piranha:   { body:'#e74c3c', belly:'#f7a19a', eye:'#ffff00', fin:'#c0392b', outline:'#922b21' },
  robalo:    { body:'#95a5a6', belly:'#d5dbdb', eye:'#1a1a2e', fin:'#7f8c8d', outline:'#566573' },
  truta:     { body:'#f39c12', belly:'#fde68a', eye:'#1a1a2e', fin:'#e67e22', outline:'#b7591a' },
  salmao:    { body:'#e88e6d', belly:'#fcd5c0', eye:'#1a1a2e', fin:'#d4724a', outline:'#a85535' },
  palhaco:   { body:'#f39c12', belly:'#ffffff', eye:'#1a1a2e', fin:'#e67e22', outline:'#b7591a' },
  pescada:   { body:'#daa520', belly:'#fae3a0', eye:'#1a1a2e', fin:'#b8860b', outline:'#8b6914' },
  dourado:   { body:'#ffd700', belly:'#fff8dc', eye:'#ff4500', fin:'#daa520', outline:'#b8860b' },
  baiacu:    { body:'#00bcd4', belly:'#b2ebf2', eye:'#ffeb3b', fin:'#0097a7', outline:'#00838f' },
  espada:    { body:'#1e88e5', belly:'#bbdefb', eye:'#ffd600', fin:'#1565c0', outline:'#0d47a1' },
  pirarucu:  { body:'#6d4c41', belly:'#d7ccc8', eye:'#ff5722', fin:'#4e342e', outline:'#3e2723' },
  tubarao:   { body:'#546e7a', belly:'#eceff1', eye:'#f44336', fin:'#37474f', outline:'#263238' },
  arraia:    { body:'#7e57c2', belly:'#d1c4e9', eye:'#ffeb3b', fin:'#5e35b1', outline:'#4527a0' },
  dragao:    { body:'#d32f2f', belly:'#ef9a9a', eye:'#ffeb3b', fin:'#b71c1c', outline:'#8b0000' },
  celacanto: { body:'#1a237e', belly:'#7986cb', eye:'#ffd600', fin:'#0d47a1', outline:'#0a1647' },
  leviata:   { body:'#0d47a1', belly:'#42a5f5', eye:'#76ff03', fin:'#0b3d91', outline:'#072660' },
  serpente:  { body:'#ff6f00', belly:'#ffe082', eye:'#e040fb', fin:'#e65100', outline:'#bf360c' },
  // Exclusivos de horário
  peixe_sol:      { body:'#facc15', belly:'#fef9c3', eye:'#ea580c', fin:'#eab308', outline:'#a16207' },
  prisma_solar:   { body:'#f59e0b', belly:'#fffbeb', eye:'#06b6d4', fin:'#fbbf24', outline:'#b45309' },
  crepusculo:     { body:'#c026d3', belly:'#fbcfe8', eye:'#fde047', fin:'#9333ea', outline:'#581c87' },
  fenix_ocaso:    { body:'#ea580c', belly:'#fdf2f8', eye:'#38bdf8', fin:'#db2777', outline:'#831843' },
  tubarao_lunar:  { body:'#94a3b8', belly:'#f1f5f9', eye:'#38bdf8', fin:'#64748b', outline:'#334155' },
  kraken_estelar: { body:'#312e81', belly:'#c7d2fe', eye:'#c084fc', fin:'#4338ca', outline:'#1e1b4b' },
  lampreia_negra: { body:'#09090b', belly:'#18181b', eye:'#ff1a1a', fin:'#7f1d1d', outline:'#450a0a' }
};

// ═══════════════════════════════════════════════
// SPRITES ANATÔMICOS DEDICADOS (16x10 pixels cada)
// 1=outline, 2=body, 3=belly, 4=eye, 5=fin, 6=special (dentes/bigodes/espinhos)
// ═══════════════════════════════════════════════

const SPRITE_CLASSIC = [
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
  [1,5,2,2,2,4,2,2,2,2,2,2,2,1,1,0],
  [1,5,5,3,3,3,3,3,3,2,2,2,2,2,1,1],
  [1,5,3,3,3,3,3,3,3,2,2,2,2,2,1,1],
  [0,1,2,2,3,3,2,2,2,2,2,2,2,1,1,0],
  [0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,1,1,2,2,2,2,2,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
];

// Fino e alongado (Sardinha, Truta, Salmão, Robalo, Espada)
const SPRITE_SLENDER = [
  [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,2,2,2,1,1,0,0,0,0,0],
  [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
  [1,1,2,2,2,4,2,2,2,2,2,2,2,1,1,0],
  [1,5,5,3,3,3,3,3,3,3,2,2,2,2,1,1],
  [1,1,2,2,3,3,3,3,3,2,2,2,2,2,1,1],
  [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Bagre (Bigodes longos e corpo encorpado)
const SPRITE_CATFISH = [
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0],
  [6,6,1,2,2,2,2,2,2,2,2,2,1,0,0,0], // Bigode superior
  [0,1,2,2,2,4,2,2,2,2,2,2,2,1,1,0],
  [6,6,6,3,3,3,3,3,2,2,2,2,2,2,1,1], // Bigode longo saindo da boca
  [0,0,6,1,3,3,3,3,3,2,2,2,2,2,1,1],
  [0,0,0,1,2,3,3,2,2,2,2,2,2,1,1,0],
  [0,0,0,0,1,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,0,0,1,1,5,5,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Piranha (Boca aberta com dentes afiados)
const SPRITE_PIRANHA = [
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
  [1,2,2,2,4,2,2,2,2,2,2,2,2,1,1,0],
  [1,6,6,0,0,2,2,2,2,2,2,2,2,2,1,1], // Dentes brancos afiados
  [1,1,6,6,3,3,3,3,2,2,2,2,2,2,1,1], // Mandíbula inferior protuberante
  [0,0,1,1,3,3,3,2,2,2,2,2,2,1,1,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,0,1,1,5,5,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Baiacu (Corpo redondo balão com espinhos salientes)
const SPRITE_PUFFER = [
  [0,0,0,6,0,1,1,1,1,0,6,0,0,0,0,0], // Espinhos no topo
  [0,0,1,2,1,2,2,2,2,1,2,1,0,0,0,0],
  [6,1,2,2,2,2,2,2,2,2,2,2,1,6,0,0], // Espinhos laterais
  [0,1,2,4,2,2,2,2,2,2,2,2,1,0,0,0],
  [1,2,2,2,3,3,3,3,3,2,2,2,2,1,1,0],
  [6,1,2,3,3,3,3,3,3,3,2,2,1,6,1,1], // Cauda e espinhos
  [0,1,2,3,3,3,3,3,3,3,2,2,1,0,1,0],
  [6,0,1,2,2,2,2,2,2,2,2,1,0,6,0,0],
  [0,0,0,6,1,1,1,1,1,1,6,0,0,0,0,0], // Espinhos embaixo
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Tubarão (Barbatana dorsal alta e focinho pontudo)
const SPRITE_SHARK = [
  [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,2,5,1,0,0,0,0,0,0], // Barbatana dorsal imponente
  [0,0,0,0,0,1,2,2,5,5,1,0,0,0,0,0],
  [0,0,0,1,1,2,2,2,2,2,1,1,0,0,0,0],
  [0,1,1,2,2,4,2,2,2,2,2,2,1,1,0,1], // Cauda heterocerca (superior)
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1],
  [1,1,6,3,3,3,3,3,2,2,2,2,2,1,1,0], // Focinho com dente sutil
  [0,0,1,1,1,3,3,3,2,2,2,2,1,1,0,1], // Cauda inferior
  [0,0,0,0,0,1,5,5,1,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Arraia (Formato diamante com asas e cauda longa)
const SPRITE_RAY = [
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
  [0,0,1,1,2,2,4,2,2,4,2,2,1,1,0,0], // Dois olhos visíveis
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [1,2,2,5,2,2,3,3,3,3,2,2,5,2,2,1], // Asas abertas
  [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
  [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
  [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
  [0,0,0,0,0,0,1,6,6,1,0,0,0,0,0,0], // Início do ferrão
  [0,0,0,0,0,0,0,1,6,6,1,0,0,0,0,0], // Cauda fina
];

// Peixe Ancestral / Blindado (Pirarucu, Celacanto)
const SPRITE_ANCIENT = [
  [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
  [0,1,2,2,6,2,6,2,6,2,2,2,2,1,0,0], // Escamas blindadas
  [1,2,2,4,2,2,2,2,2,2,2,2,2,2,1,0],
  [1,1,3,3,3,3,3,3,6,2,6,2,2,2,2,1],
  [0,1,3,3,3,3,3,3,3,2,2,2,2,2,2,1],
  [0,1,2,2,3,3,3,2,2,2,2,2,2,2,1,0],
  [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
  [0,0,0,0,1,1,5,5,5,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Serpente / Dragão Mítico (Leviatã, Dragão, Serpente)
const SPRITE_SERPENT = [
  [0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0], // Chifre mítico
  [0,6,6,1,1,1,0,0,0,1,1,1,0,0,0,0],
  [0,1,2,2,2,4,1,1,1,2,2,2,1,0,0,0],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
  [1,6,6,3,3,2,2,1,1,3,3,2,2,2,1,0], // Barbelas místicas e curvas
  [0,1,1,1,3,3,1,0,0,1,3,3,2,2,2,1],
  [0,0,0,1,2,2,1,0,0,0,1,2,2,2,2,1],
  [0,0,0,0,1,1,0,0,0,0,0,1,5,5,1,0], // Cauda etérea
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Lampreia Negra do Vazio (Corpo serpentino com aura vermelha e dentes abissais)
const SPRITE_LAMPREY = [
  [0,0,6,0,0,0,6,0,0,0,0,6,0,0,0,0], // Feixes de aura carmesim
  [0,6,1,1,1,1,1,1,1,1,1,1,6,0,0,0], // Dorso sombrio
  [6,1,2,2,2,2,2,2,2,2,2,2,1,6,0,0], // Corpo negro obsidian
  [1,6,2,4,2,2,2,2,2,2,2,2,2,1,1,6], // Olho rubro penetrante (4)
  [1,6,6,2,2,2,2,2,2,2,2,2,2,2,1,1], // Focinho sugador circular com dentes (6)
  [1,6,3,3,3,3,3,3,3,2,2,2,2,2,1,1], // Ventre abissal
  [6,1,3,3,3,3,3,3,2,2,2,2,2,1,1,0], // Corpo alongado
  [0,6,1,1,1,3,3,2,2,2,2,2,1,1,6,0], // Cauda ondulante
  [0,0,6,0,1,1,5,5,5,1,1,1,6,0,0,0], // Barbatana caudal com aura
  [0,0,0,6,0,0,6,0,0,6,0,0,0,0,0,0], // Partículas inferiores de energia
];

// Mapeamento de cada espécie para sua silhueta anatômica
const FISH_ANATOMY = {
  lambari:   SPRITE_CLASSIC,
  tilapia:   SPRITE_CLASSIC,
  sardinha:  SPRITE_SLENDER,
  carpa:     SPRITE_CLASSIC,
  bagre:     SPRITE_CATFISH,
  piranha:   SPRITE_PIRANHA,
  robalo:    SPRITE_SLENDER,
  truta:     SPRITE_SLENDER,
  salmao:    SPRITE_SLENDER,
  palhaco:   SPRITE_CLASSIC,
  pescada:   SPRITE_CLASSIC,
  dourado:   SPRITE_CLASSIC,
  baiacu:    SPRITE_PUFFER,
  espada:    SPRITE_SLENDER,
  pirarucu:  SPRITE_ANCIENT,
  tubarao:   SPRITE_SHARK,
  arraia:    SPRITE_RAY,
  dragao:    SPRITE_SERPENT,
  celacanto:      SPRITE_ANCIENT,
  leviata:        SPRITE_SERPENT,
  serpente:       SPRITE_SERPENT,
  peixe_sol:      SPRITE_CLASSIC,
  prisma_solar:   SPRITE_SERPENT,
  crepusculo:     SPRITE_RAY,
  fenix_ocaso:    SPRITE_SERPENT,
  tubarao_lunar:  SPRITE_SHARK,
  kraken_estelar: SPRITE_SERPENT,
  lampreia_negra: SPRITE_LAMPREY,
};


// ═══════════════════════════════════════════════
// PESCADOR 20x28 — APENAS CORPO (sem vara, ela fica no SVG)
// ═══════════════════════════════════════════════
// 1=outline  2=pele  3=pele_sombra  4=branco_olho  5=boca
// 6=chapéu  7=chapéu_aba  8=chapéu_detalhe
// 9=camisa  10=camisa_sombra  11=gola
// 12=calça  13=calça_sombra  14=bota  15=bota_sombra  16=mão

// ═══════════════════════════════════════════════
// NOVO PESCADOR DETALHADO EM PIXEL ART (32x32)
// Pescador marinheiro com chapéu de palha, barba, colete de bolsos e vara arqueada
// 1=outline  2=pele  3=pele_sombra  4=olho  5=barba/cabelo  6=chapeu_palha  7=chapeu_sombra  8=fita_chapeu
// 9=colete  10=colete_sombra  11=camisa_gola  12=calca_jeans  13=jeans_sombra  14=bota_couro  15=bota_sombra
// 16=mao  20=haste_vara  21=ponta_vara  22=cabo_vara  23=carretel/aneis  24=anzol_chapeu
// ═══════════════════════════════════════════════

const FISHERMAN_WITH_ROD = [
  // Linha 0 a 3: Curvatura extrema da ponta da vara de pescar
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,21,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,20,20,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,20,20,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,20,20,0,0,0,0,0,0,0,0],
  // Linha 4 a 7: Topo do chapéu do pescador e descida da haste
  [0,0,0,0,0,1,1,6,6,6,6,1,1,0,0,0,0,0,0,23,20,20,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0,20,20,20,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,6,6,8,8,8,8,8,6,24,6,1,0,20,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,7,7,7,7,7,7,7,7,7,7,7,7,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 8 a 12: Rosto, olhos, bochechas, nariz e barba ruiva
  [0,1,7,1,2,2,2,2,2,2,2,2,1,7,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,2,2,4,4,2,2,4,4,2,2,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,2,2,1,4,2,2,1,4,2,2,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,2,3,2,2,2,2,2,2,3,2,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,5,5,5,5,5,5,5,5,5,5,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 13 a 15: Barba farta descendo, gola e cabo da vara
  [0,0,0,1,5,5,5,5,5,5,5,5,1,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,11,11,5,5,5,11,11,1,0,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,9,9,9,11,11,11,9,9,9,1,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 16 a 21: Colete de pesca com bolsos, mãos segurando a vara e carretel
  [0,1,9,9,10,9,9,9,9,9,10,9,9,1,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,9,10,10,9,9,9,9,9,10,10,9,16,16,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Mão esquerda
  [0,1,9,9,9,9,10,9,10,9,9,9,9,1,16,16,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Mão direita
  [0,1,9,10,10,9,10,9,10,9,10,10,9,1,23,23,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Carretel metálico
  [0,0,1,9,9,9,9,9,9,9,9,9,1,0,0,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 22 a 27: Cinto, calça jeans e bolsos
  [0,0,1,14,14,14,14,14,14,14,14,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Cinto de couro
  [0,0,1,12,12,12,12,12,12,12,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,13,12,12,12,12,13,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,13,12,1,1,12,13,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,12,1,0,0,1,12,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,12,1,0,0,1,12,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 28 a 31: Botas de pescador no píer
  [0,0,1,14,14,15,1,0,1,14,14,15,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,14,14,14,15,1,0,1,14,14,14,15,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,15,15,15,15,1,0,1,15,15,15,15,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ═══════════════════════════════════════════════
// PESCADORA FEMININA DETALHADA EM PIXEL ART (32x32)
// Cabelo comprido com mechas/tranças, sem barba, olhos expressivos, chapéu charmoso
// Mesmas coordenadas exatas da ponta da vara (col 28.2 / lin 0.8) e mãos
// ═══════════════════════════════════════════════
const FISHERWOMAN_WITH_ROD = [
  // Linha 0 a 3: Curvatura da vara (idêntica ao masculino para alinhamento milimétrico da linha)
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,21,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,20,20,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,20,20,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,20,20,0,0,0,0,0,0,0,0],
  // Linha 4 a 7: Chapéu de palha com fita e florzinha/anzol
  [0,0,0,0,0,1,1,6,6,6,6,1,1,0,0,0,0,0,0,23,20,20,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0,20,20,20,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,6,6,8,8,8,8,8,6,24,6,1,0,20,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,7,7,7,7,7,7,7,7,7,7,7,7,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 8 a 12: Rosto feminino, franja, olhos amendoados expressivos, bochechas rosadas e sorriso
  [0,1,7,1,5,5,5,2,2,5,5,5,1,7,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,5,2,4,4,2,2,4,4,2,5,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,5,2,1,4,2,2,1,4,2,5,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,5,3,2,2,2,2,2,2,3,5,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,5,2,2,3,3,3,3,2,2,5,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 13 a 15: Cabelos longos descendo nos ombros, pescoço e gola
  [0,0,1,5,5,2,2,2,2,2,2,5,5,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,5,5,1,11,11,11,11,1,5,5,1,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,5,5,1,9,11,11,11,11,9,1,5,5,1,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 16 a 21: Colete de pesca, mãos na vara e carretel
  [0,1,5,1,9,9,10,9,9,10,9,9,1,5,1,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,9,9,10,10,9,9,10,10,9,9,16,16,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Mão esquerda
  [0,0,1,9,9,9,9,10,10,9,9,9,9,1,16,16,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Mão direita
  [0,0,1,9,10,10,9,10,10,9,10,10,9,1,23,23,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Carretel
  [0,0,1,9,9,9,9,9,9,9,9,9,1,0,0,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 22 a 27: Cinto e calça
  [0,0,1,14,14,14,14,14,14,14,14,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,12,12,12,12,12,12,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,13,12,12,12,12,13,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,13,12,1,1,12,13,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,12,1,0,0,1,12,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,12,12,1,0,0,1,12,12,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 28 a 31: Botas
  [0,0,1,14,14,15,1,0,1,14,14,15,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,14,14,14,15,1,0,1,14,14,14,15,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,15,15,15,15,1,0,1,15,15,15,15,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ═══════════════════════════════════════════════
// PRESETS DE ROUPAS (RECOLORS DO COLETE E CALÇA)
// ═══════════════════════════════════════════════
export const OUTFIT_PRESETS = {
  verde: {
    id: 'verde',
    name: 'Verde Floresta',
    vest: '#15803d',
    vestShadow: '#166534',
    pants: '#1d4ed8',
    pantsShadow: '#1e3a8a',
    badgeColor: '#22c55e'
  },
  azul: {
    id: 'azul',
    name: 'Marinheiro Azul',
    vest: '#0284c7',
    vestShadow: '#0369a1',
    pants: '#b45309',
    pantsShadow: '#78350f',
    badgeColor: '#38bdf8'
  },
  rubi: {
    id: 'rubi',
    name: 'Rubi Aventureiro',
    vest: '#b91c1c',
    vestShadow: '#991b1b',
    pants: '#334155',
    pantsShadow: '#1e293b',
    badgeColor: '#ef4444'
  },
  dourado: {
    id: 'dourado',
    name: 'Pescador Dourado',
    vest: '#d97706',
    vestShadow: '#b45309',
    pants: '#1e3a8a',
    pantsShadow: '#172554',
    badgeColor: '#facc15'
  },
  abissal: {
    id: 'abissal',
    name: 'Abissal Noturno',
    vest: '#7e22ce',
    vestShadow: '#581c87',
    pants: '#3b0764',
    pantsShadow: '#2e1065',
    badgeColor: '#a855f7'
  },
  coral: {
    id: 'coral',
    name: 'Coral Rosa',
    vest: '#db2777',
    vestShadow: '#be185d',
    pants: '#e2e8f0',
    pantsShadow: '#94a3b8',
    badgeColor: '#f472b6'
  }
};

// ═══════════════════════════════════════════════
// PALETAS DE CABELO
// ═══════════════════════════════════════════════
export const HAIR_COLORS = {
  ruivo:  { id: 'ruivo',  name: 'Ruivo Rústico', color: '#c2410c' },
  moreno: { id: 'moreno', name: 'Castanho',      color: '#5c2e17' },
  loiro:  { id: 'loiro',  name: 'Loiro Dourado', color: '#eab308' },
  preto:  { id: 'preto',  name: 'Preto Carvão',  color: '#1e293b' },
  rosa:   { id: 'rosa',   name: 'Rosa Pastel',   color: '#ec4899' },
};

const BODY_PALETTE = {
  1: '#111827',  // Contorno escuro nítido
  2: '#fed7aa',  // Pele natural iluminada
  3: '#fba575',  // Bochecha corada / sombra suave
  4: '#0f172a',  // Olhos expressivos
  5: '#c2410c',  // Barba ruiva rústica / cabelo
  6: '#fde047',  // Chapéu de palha
  7: '#ca8a04',  // Aba e sombra do chapéu
  8: '#b91c1c',  // Fita vermelha no chapéu
  9: '#15803d',  // Colete de pesca verde floresta
  10:'#166534', // Sombra dos bolsos do colete
  11:'#f1f5f9', // Camisa branca/gola
  12:'#1d4ed8', // Calça jeans clássica
  13:'#1e3a8a', // Sombra jeans
  14:'#78350f', // Botas e cinto de couro rústico
  15:'#451a03', // Solado e sombra da bota
  16:'#fed7aa', // Mãos
  23:'#94a3b8', // Carretel metálico / passadores
  24:'#38bdf8'  // Anzolzinho azul preso no chapéu
};

// ═══════════════════════════════════════════════
// CORES DAS VARAS (usadas no sprite e no SVG dinâmico)
// ═══════════════════════════════════════════════
export const ROD_COLORS = {
  vara_bambu:    { rod:'#6b8e23', handle:'#8b7355', tip:'#9acd32', glow:null },
  vara_fibra:    { rod:'#b0bec5', handle:'#78909c', tip:'#eceff1', glow:null },
  vara_carbono:  { rod:'#455a64', handle:'#263238', tip:'#78909c', glow:null },
  vara_aco:      { rod:'#b0bec5', handle:'#607d8b', tip:'#e0e0e0', glow:'rgba(176,190,197,0.3)' },
  vara_dourada:  { rod:'#ffd700', handle:'#b8860b', tip:'#ffec8b', glow:'rgba(255,215,0,0.3)' },
  vara_titanio:  { rod:'#42a5f5', handle:'#1565c0', tip:'#90caf9', glow:'rgba(66,165,245,0.4)' },
  vara_cosmica:  { rod:'#ab47bc', handle:'#7b1fa2', tip:'#ce93d8', glow:'rgba(171,71,188,0.5)' },
  vara_travessia:{ rod:'#06b6d4', handle:'#0e7490', tip:'#a5f3fc', glow:'rgba(6,182,212,0.6)' },
};

// ═══════════════════════════════════════════════
// VISUAIS DAS ISCAS
// ═══════════════════════════════════════════════
export const BAIT_VISUALS = {
  minhoca:            { color1:'#cd853f', color2:'#a0522d' },
  camarao:            { color1:'#ff6b6b', color2:'#ee5a24' },
  isca_brilhante:     { color1:'#7fff00', color2:'#adff2f' },
  queijo_mistico:     { color1:'#ffd700', color2:'#b8860b' },
  ouro_liquido:       { color1:'#e040fb', color2:'#7c4dff' },
  essencia_travessia: { color1:'#06b6d4', color2:'#8b5cf6' },
};

// ═══════════════════════════════════════════════
// ÍCONES PIXEL ART DEDICADOS PARA A LOJA (16x16)
// ═══════════════════════════════════════════════

// Sprites de Iscas (16x16)
const BAIT_SPRITES = {
  minhoca: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,2,2,1,0,0,0],
    [0,0,0,0,0,0,0,0,1,2,3,3,1,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,1,1,0,0,0,0],
    [0,0,0,0,0,0,1,2,3,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,2,3,1,0,0,0,0,0,0,0,0],
    [0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0],
    [0,0,1,2,3,1,0,0,1,1,1,0,0,0,0,0],
    [0,1,2,2,1,0,0,1,2,2,2,1,0,0,0,0],
    [0,1,2,3,1,0,1,2,3,3,2,1,0,0,0,0],
    [0,0,1,2,2,1,2,2,1,1,1,0,0,0,0,0],
    [0,0,0,1,2,3,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  camarao: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,0,1,2,3,3,2,1,0,0,0,0],
    [0,0,0,0,0,1,2,2,1,1,2,1,0,0,0,0],
    [0,0,0,0,1,2,3,1,0,0,1,2,1,0,0,0],
    [0,0,0,1,2,2,1,0,0,0,1,2,1,0,0,0],
    [0,0,1,2,3,1,0,0,0,0,1,2,1,0,0,0],
    [0,1,2,2,1,0,0,0,0,0,1,2,1,0,0,0],
    [1,2,3,1,0,0,0,0,0,1,2,3,1,0,0,0],
    [1,2,2,1,0,0,0,0,1,2,2,1,0,0,0,0],
    [0,1,2,2,1,1,1,1,2,3,1,0,0,0,0,0],
    [0,0,1,2,2,2,2,2,2,1,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  isca_brilhante: [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,1,2,2,3,3,3,2,2,1,0,0,0,0],
    [0,0,1,2,3,3,3,3,3,3,2,2,1,0,0,0],
    [0,1,2,3,3,4,4,4,4,3,3,2,1,0,0,0],
    [0,1,2,3,4,4,4,4,4,4,3,2,1,0,0,0],
    [1,2,3,3,4,4,4,4,4,4,3,3,2,1,0,0],
    [1,2,3,3,4,4,4,4,4,4,3,3,2,1,0,0],
    [1,2,3,3,4,4,4,4,4,4,3,3,2,1,0,0],
    [0,1,2,3,4,4,4,4,4,4,3,2,1,0,0,0],
    [0,1,2,3,3,4,4,4,4,3,3,2,1,0,0,0],
    [0,0,1,2,3,3,3,3,3,3,2,1,0,0,0,0],
    [0,0,0,1,2,2,3,3,3,2,2,1,0,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  queijo_mistico: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,1,2,2,3,3,2,2,2,1,0,0,0,0],
    [0,0,1,2,2,3,3,3,3,2,2,2,1,0,0,0],
    [0,1,2,2,3,3,3,3,3,3,2,2,2,1,0,0],
    [1,2,2,2,2,3,3,3,3,2,2,2,2,2,1,0],
    [1,2,3,3,2,2,2,2,2,2,3,3,2,2,1,0],
    [1,2,3,3,2,2,2,2,2,2,3,3,2,2,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,1,2,2,3,3,2,2,2,2,2,1,0,0,0],
    [0,0,0,1,2,3,3,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  ouro_liquido: [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,1,2,2,3,3,3,3,2,2,1,0,0,0],
    [0,0,1,2,3,3,4,4,4,4,3,3,2,1,0,0],
    [0,0,1,2,3,4,4,4,4,4,4,3,2,1,0,0],
    [0,0,1,2,3,4,4,4,4,4,4,3,2,1,0,0],
    [0,0,1,2,3,4,4,4,4,4,4,3,2,1,0,0],
    [0,0,1,2,3,3,4,4,4,4,3,3,2,1,0,0],
    [0,0,0,1,2,2,3,3,3,3,2,2,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  essencia_travessia: [
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,2,2,3,2,2,1,1,0,0,0,0],
    [0,0,1,2,2,3,3,4,3,3,2,2,1,0,0,0],
    [0,1,2,3,3,4,4,4,4,4,3,3,2,1,0,0],
    [0,1,2,3,4,4,5,5,5,4,4,3,2,1,0,0],
    [1,2,3,4,4,5,5,5,5,5,4,4,3,2,1,0],
    [1,2,3,4,5,5,5,5,5,5,5,4,3,2,1,0],
    [1,3,4,4,5,5,5,5,5,5,5,4,4,3,1,0],
    [1,2,3,4,5,5,5,5,5,5,5,4,3,2,1,0],
    [1,2,3,4,4,5,5,5,5,5,4,4,3,2,1,0],
    [0,1,2,3,4,4,5,5,5,4,4,3,2,1,0,0],
    [0,1,2,3,3,4,4,4,4,4,3,3,2,1,0,0],
    [0,0,1,2,2,3,3,4,3,3,2,2,1,0,0,0],
    [0,0,0,1,1,2,2,3,2,2,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ]
};

// Sprites de Upgrades Gerais (16x16)
const UPGRADE_SPRITES = {
  balde: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,1,2,2,3,3,3,3,3,3,2,2,1,0,0], // Alça e boca do balde
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,0,1,2,2,3,3,3,3,2,2,1,0,0,0], // Faixa de metal
    [0,0,0,1,2,2,3,3,3,3,2,2,1,0,0,0],
    [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,2,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  auto_pescador: [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,1,4,0,0,0],
    [0,0,0,0,1,3,6,3,3,6,3,1,4,0,0,0],
    [0,0,0,0,1,3,3,7,7,3,3,1,4,0,0,0],
    [0,0,0,0,1,4,4,4,4,4,4,1,1,0,0,0],
    [0,0,0,0,0,1,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,1,1,2,2,2,2,2,2,1,1,0,0,0],
    [0,0,1,5,5,1,2,2,2,2,1,5,5,1,0,0],
    [0,1,2,5,5,1,2,2,2,2,1,5,5,2,1,0],
    [0,1,2,1,1,1,2,2,2,2,1,1,1,2,1,0],
    [0,0,1,0,0,1,2,2,2,2,1,0,0,1,0,0],
    [0,0,0,0,0,1,2,1,1,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,1,0,0,1,2,1,0,0,0,0],
    [0,0,0,1,4,4,1,0,0,1,4,4,1,0,0,0],
    [0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0],
  ],
  boia_sorte: [
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0], // Haste superior
    [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0], // Bóia vermelha
    [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
    [0,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0],
    [0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0], // Faixa branca central
    [0,1,4,4,4,4,4,4,4,4,4,4,4,4,1,0],
    [0,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0], // Base vermelha
    [0,0,1,3,3,3,3,3,3,3,3,3,3,1,0,0],
    [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,0,0,1,3,3,3,3,3,3,1,0,0,0,0],
    [0,0,0,0,0,1,1,2,2,1,1,0,0,0,0,0], // Haste inferior
    [0,0,0,0,0,0,1,2,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  ],
  rede_dupla: [
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0], // Aro da rede
    [0,1,2,2,1,1,2,2,1,1,2,2,1,2,1,0], // Malha da rede
    [0,1,2,1,0,0,1,1,0,0,1,1,0,1,1,0],
    [1,2,1,0,0,1,2,2,1,1,2,2,1,0,1,0],
    [1,2,1,0,1,2,2,1,0,0,1,2,1,0,1,0],
    [1,2,1,1,2,2,1,0,0,1,2,2,1,1,1,0],
    [0,1,2,2,2,1,0,0,1,2,2,2,1,1,0,0],
    [0,0,1,2,1,0,0,1,2,2,2,1,0,0,0,0],
    [0,0,0,1,0,0,1,2,2,1,1,0,0,0,0,0],
    [0,0,0,0,0,1,2,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,2,2,1,0,0,0,0,0,0,0,0], // Cabo de madeira
    [0,0,0,1,2,2,1,0,0,0,0,0,0,0,0,0],
    [0,0,1,2,2,1,0,0,0,0,0,0,0,0,0,0],
    [0,1,2,2,1,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  aquario_cap: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // Tampa do aquário
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,4,4,4,4,4,4,4,4,4,4,4,4,3,1], // Vidro e água
    [1,3,4,4,4,4,4,4,4,4,4,4,4,4,3,1],
    [1,3,4,4,5,5,5,4,4,4,4,4,4,3,1], // Peixinho lá dentro
    [1,3,4,5,5,6,5,5,4,4,4,4,4,4,3,1],
    [1,3,4,4,5,5,5,4,4,4,4,4,4,3,1],
    [1,3,4,4,4,4,4,4,4,4,4,4,4,4,3,1],
    [1,3,4,4,7,4,4,7,4,4,7,4,4,3,1], // Plantinhas verdes no fundo
    [1,3,4,7,7,4,4,7,7,4,7,7,4,4,3,1],
    [1,3,7,7,7,7,7,7,7,7,7,7,7,4,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0], // Base do aquário
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  ],
  auto_vendedor: [
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,2,3,2,3,2,3,2,3,2,3,2,3,1,0], // Toldo listrado da peixaria
    [0,1,2,3,2,3,2,3,2,3,2,3,2,3,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,4,0,0,0,0,0,0,0,0,0,0,4,1,0], // Suporte do balcão
    [0,1,4,0,1,1,1,0,0,1,1,1,0,4,1,0], // Peixinhos na vitrine
    [0,1,4,1,5,5,5,1,1,5,5,5,1,4,1,0],
    [0,1,4,0,1,1,1,0,0,1,1,1,0,4,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Balcão de venda
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1], // Madeira do balcão
    [1,6,6,7,7,6,6,6,6,7,7,6,6,6,6,1], // Gavetas de moedas
    [1,6,6,7,7,6,6,6,6,7,7,6,6,6,6,1],
    [1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  ima_dourado: [
    [0,0,0,5,0,0,0,0,0,0,0,0,5,0,0,0],
    [0,0,5,5,5,0,0,0,0,0,0,5,5,5,0,0], // Faíscas magnéticas
    [0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0], // Pontas
    [0,1,4,4,4,1,0,0,0,0,1,4,4,4,1,0], // Ponta metálica
    [0,1,4,4,4,1,0,0,0,0,1,4,4,4,1,0],
    [0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0],
    [0,1,2,3,3,1,0,5,5,0,1,3,3,2,1,0], // Braço dourado
    [0,1,2,3,3,1,5,6,6,5,1,3,3,2,1,0], // Peixinho dourado no centro
    [0,1,2,3,3,1,0,6,6,0,1,3,3,2,1,0],
    [0,1,2,3,3,1,0,0,0,0,1,3,3,2,1,0],
    [0,1,2,3,3,1,1,1,1,1,1,3,3,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,0], // Curva dourada brilhante
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,5,0,0,0,0,0,0,5,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ]
};

// Sprite de Vara de Pesca em Diagonal (16x16)
const ROD_ICON_SPRITE = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,2,2,1,0],
  [0,0,0,0,0,0,0,0,0,0,0,2,2,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,2,2,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,2,2,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,2,2,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,2,2,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,2,2,1,0,0,0,0,0,0,0],
  [0,0,0,0,0,2,2,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,3,3,1,0,0,0,0,0,0,0,0,0], // Carretel
  [0,0,0,3,4,4,3,0,0,0,0,0,0,0,0,0],
  [0,0,1,4,4,3,0,0,0,0,0,0,0,0,0,0], // Cabo
  [0,1,4,4,1,0,0,0,0,0,0,0,0,0,0,0],
  [1,4,4,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
];


// ═══════════════════════════════════════════════
// FUNÇÕES DE RENDERIZAÇÃO
// ═══════════════════════════════════════════════

function drawPixelGrid(ctx, sprite, palette, scale, offsetX = 0, offsetY = 0) {
  for (let y = 0; y < sprite.length; y++) {
    for (let x = 0; x < sprite[y].length; x++) {
      const val = sprite[y][x];
      if (val === 0 || !palette[val]) continue;
      ctx.fillStyle = palette[val];
      ctx.fillRect(offsetX + x * scale, offsetY + y * scale, scale, scale);
    }
  }
}

export function renderFishermanToCanvas(canvas, scale = 4, rodId = 'vara_bambu', gender = 'male', outfitId = 'verde', hairId = 'ruivo') {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const sprite = gender === 'female' ? FISHERWOMAN_WITH_ROD : FISHERMAN_WITH_ROD;
  const cols = 32;
  const rows = sprite.length;
  canvas.width = cols * scale;
  canvas.height = rows * scale;
  canvas.style.imageRendering = 'pixelated';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const rod = ROD_COLORS[rodId] || ROD_COLORS.vara_bambu;
  const outfit = OUTFIT_PRESETS[outfitId] || OUTFIT_PRESETS.verde;
  const hair = HAIR_COLORS[hairId] || HAIR_COLORS.ruivo;

  const palette = {
    ...BODY_PALETTE,
    5: hair.color,         // Cabelo / Barba
    9: outfit.vest,        // Colete
    10: outfit.vestShadow, // Sombra do colete
    12: outfit.pants,      // Calça
    13: outfit.pantsShadow,// Sombra da calça
    20: rod.rod,
    21: rod.tip,
    22: rod.handle,
  };

  drawPixelGrid(ctx, sprite, palette, scale);
}

// ═══════════════════════════════════════════════
// GERADORES DE ÍCONES PIXEL ART PARA A LOJA
// ═══════════════════════════════════════════════

export function getRodIconDataURL(rodId, scale = 2.5) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  c.width = 16 * scale;
  c.height = 16 * scale;
  c.style.imageRendering = 'pixelated';

  const rod = ROD_COLORS[rodId] || ROD_COLORS.vara_bambu;
  const palette = {
    1: '#0f172a', // outline
    2: rod.rod,   // haste
    3: '#94a3b8', // carretel metálico
    4: rod.handle // cabo
  };

  drawPixelGrid(ctx, ROD_ICON_SPRITE, palette, scale);
  return c.toDataURL();
}

export function getBaitIconDataURL(baitId, scale = 2.5) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  c.width = 16 * scale;
  c.height = 16 * scale;
  c.style.imageRendering = 'pixelated';

  const sprite = BAIT_SPRITES[baitId] || BAIT_SPRITES.minhoca;
  let pal = { 1: '#0f172a', 2: '#cd853f', 3: '#8b4513', 4: '#fde047' };

  if (baitId === 'camarao') {
    pal = { 1: '#450a0a', 2: '#f97316', 3: '#ef4444', 4: '#fed7aa' };
  } else if (baitId === 'isca_brilhante') {
    pal = { 1: '#052e16', 2: '#22c55e', 3: '#86efac', 4: '#f0fdf4' };
  } else if (baitId === 'queijo_mistico') {
    pal = { 1: '#422006', 2: '#eab308', 3: '#fde047', 4: '#ca8a04' };
  } else if (baitId === 'ouro_liquido') {
    pal = { 1: '#3b0764', 2: '#a855f7', 3: '#c084fc', 4: '#e879f9' };
  } else if (baitId === 'essencia_travessia') {
    pal = { 1: '#082f49', 2: '#0891b2', 3: '#8b5cf6', 4: '#67e8f9', 5: '#f472b6' };
  }

  drawPixelGrid(ctx, sprite, pal, scale);
  return c.toDataURL();
}

export function getUpgradeIconDataURL(upgradeId, scale = 2.5) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  c.width = 16 * scale;
  c.height = 16 * scale;
  c.style.imageRendering = 'pixelated';

  const sprite = UPGRADE_SPRITES[upgradeId] || UPGRADE_SPRITES.balde;
  let pal = { 1: '#0f172a', 2: '#78350f', 3: '#94a3b8', 4: '#38bdf8', 5: '#f97316', 6: '#000', 7: '#16a34a' };

  if (upgradeId === 'auto_pescador') {
    pal = { 1: '#0f172a', 2: '#0284c7', 3: '#38bdf8', 4: '#facc15', 5: '#f97316', 6: '#ffffff', 7: '#fed7aa' };
  } else if (upgradeId === 'boia_sorte') {
    pal = { 1: '#0f172a', 2: '#94a3b8', 3: '#ef4444', 4: '#f8fafc' };
  } else if (upgradeId === 'rede_dupla') {
    pal = { 1: '#0f172a', 2: '#78350f', 3: '#38bdf8' };
  } else if (upgradeId === 'aquario_cap') {
    pal = { 1: '#0f172a', 2: '#334155', 3: '#38bdf8', 4: '#0284c7', 5: '#f97316', 6: '#fff', 7: '#16a34a' };
  } else if (upgradeId === 'auto_vendedor') {
    pal = { 1: '#0f172a', 2: '#ef4444', 3: '#ffffff', 4: '#78350f', 5: '#38bdf8', 6: '#b45309', 7: '#fbbf24' };
  } else if (upgradeId === 'ima_dourado') {
    pal = { 1: '#0f172a', 2: '#d97706', 3: '#facc15', 4: '#cbd5e1', 5: '#38bdf8', 6: '#f59e0b' };
  }

  drawPixelGrid(ctx, sprite, pal, scale);
  return c.toDataURL();
}

export function renderFishToCanvas(canvas, fishIconId, scale = 4) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const pal = PALETTES[fishIconId] || PALETTES.lambari;
  const sprite = FISH_ANATOMY[fishIconId] || SPRITE_CLASSIC;

  // Cor especial personalizada por espécie (dentes, espinhos, bigodes, chifres)
  let specialColor = '#ffffff';
  if (fishIconId === 'bagre') specialColor = pal.fin;
  else if (fishIconId === 'baiacu') specialColor = '#e0f2fe';
  else if (['dragao', 'leviata', 'serpente', 'prisma_solar', 'fenix_ocaso', 'kraken_estelar'].includes(fishIconId)) specialColor = '#fef08a';
  else if (fishIconId === 'crepusculo') specialColor = pal.outline;
  else if (fishIconId === 'tubarao_lunar') specialColor = '#f8fafc';
  else if (fishIconId === 'peixe_sol') specialColor = '#fef08a';
  else if (fishIconId === 'pirarucu') specialColor = '#ef4444'; // escamas vermelhas lendárias do pirarucu
  else if (fishIconId === 'lampreia_negra') specialColor = '#ef4444'; // aura carmesim abissal pulsante

  const colorMap = {
    1: pal.outline,
    2: pal.body,
    3: pal.belly,
    4: pal.eye,
    5: pal.fin,
    6: specialColor
  };

  canvas.width = sprite[0].length * scale;
  canvas.height = sprite.length * scale;
  canvas.style.imageRendering = 'pixelated';
  drawPixelGrid(ctx, sprite, colorMap, scale);
}

export function getFishDataURL(fishIconId, scale = 3) {
  const c = document.createElement('canvas');
  renderFishToCanvas(c, fishIconId, scale);
  return c.toDataURL();
}

export function getFishSilhouetteDataURL(fishIconId, scale = 3) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const sprite = FISH_ANATOMY[fishIconId] || SPRITE_CLASSIC;
  const colorMap = { 1: '#0f172a', 2: '#1e293b', 3: '#0f172a', 4: '#334155', 5: '#1e293b', 6: '#1e293b' };
  c.width = sprite[0].length * scale;
  c.height = sprite.length * scale;
  c.style.imageRendering = 'pixelated';
  drawPixelGrid(ctx, sprite, colorMap, scale);
  return c.toDataURL();
}

// ═══════════════════════════════════════════════
// Atualiza SVG da vara, linha, bóia e isca
// ═══════════════════════════════════════════════
export function updateRodSVG(rodId, baitId) {
  const rodCol = ROD_COLORS[rodId] || ROD_COLORS.vara_bambu;
  const baitVis = BAIT_VISUALS[baitId] || BAIT_VISUALS.minhoca;

  // Vara (2 segmentos: cabo e vara principal)
  const elHandle = document.getElementById('svg-rod-handle');
  const elRod = document.getElementById('svg-rod-main');
  const elTip = document.getElementById('svg-rod-tip');
  const elGlow = document.getElementById('svg-rod-glow');

  if (elHandle) elHandle.setAttribute('stroke', rodCol.handle);
  if (elRod) elRod.setAttribute('stroke', rodCol.rod);
  if (elTip) elTip.setAttribute('stroke', rodCol.tip);

  if (elGlow) {
    if (rodCol.glow) {
      elGlow.setAttribute('stroke', rodCol.glow);
      elGlow.setAttribute('opacity', '1');
    } else {
      elGlow.setAttribute('opacity', '0');
    }
  }

  // Isca
  const elBait1 = document.getElementById('svg-bait-1');
  const elBait2 = document.getElementById('svg-bait-2');
  if (elBait1) elBait1.setAttribute('fill', baitVis.color1);
  if (elBait2) elBait2.setAttribute('fill', baitVis.color2);
}

// ═══════════════════════════════════════════════
// LAGO ANIMADO COM ONDAS, PEIXES E CICLO DIA/NOITE
// ═══════════════════════════════════════════════
export class PixelWaterRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.time = 0;
    this.fishSprites = [];
    this.bubbles = [];
    this.timeOfDay = 'night'; // 'day' | 'sunset' | 'night'
    this.diverActive = false;
    this.diver = {
      x: -80,
      y: 120,
      speed: 0.6,
      dir: 1,
      size: 2.5,
      wobble: 0,
      bubbleTimer: 0
    };
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  setDiverActive(active) {
    this.diverActive = !!active;
  }

  setTimeOfDay(tod) {
    if (['day', 'sunset', 'night'].includes(tod)) {
      this.timeOfDay = tod;
    }
  }

  _resize() {
    this.canvas.width = this.canvas.parentElement?.clientWidth || 600;
    this.canvas.height = this.canvas.parentElement?.clientHeight || 400;
    this.canvas.style.imageRendering = 'pixelated';
  }

  addSwimmingFish(fishIconId) {
    const pal = PALETTES[fishIconId] || PALETTES.lambari;
    this.fishSprites.push({
      x: this.canvas.width + 30,
      y: 80 + Math.random() * (this.canvas.height - 160),
      speed: 0.3 + Math.random() * 0.7,
      dir: -1, pal,
      size: 2 + Math.floor(Math.random() * 2),
      wobble: Math.random() * Math.PI * 2
    });
    if (this.fishSprites.length > 10) this.fishSprites.shift();
  }

  update() {
    this.time += 0.02;
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height, px = 4;
    ctx.clearRect(0, 0, W, H);

    // Paletas por horário
    let wc, lightColor, lightAlpha, waveColor1, waveColor2;

    if (this.timeOfDay === 'day') {
      // Dia claro e cristalino
      wc = ['#0284c7','#0369a1','#075985','#0c4a6e','#0f3b56','#103147','#0f283a','#0d202e'];
      lightColor = '#bae6fd';
      lightAlpha = 0.08;
      waveColor1 = 'rgba(255, 255, 255, 0.6)';
      waveColor2 = 'rgba(186, 230, 253, 0.45)';
    } else if (this.timeOfDay === 'sunset') {
      // Pôr do sol alaranjado/violeta
      wc = ['#7c2d12','#9a3412','#701a75','#581c87','#3b0764','#2e1065','#1e1b4b','#0f172a'];
      lightColor = '#fdba74';
      lightAlpha = 0.07;
      waveColor1 = 'rgba(254, 215, 170, 0.55)';
      waveColor2 = 'rgba(244, 114, 182, 0.35)';
    } else {
      // Noite estrelada profunda
      wc = ['#081c30','#0a2440','#0d2d50','#103760','#134170','#174b80','#1b5590','#1f5fa0'];
      lightColor = '#38bdf8';
      lightAlpha = 0.04;
      waveColor1 = 'rgba(186, 230, 253, 0.45)';
      waveColor2 = 'rgba(56, 189, 248, 0.35)';
    }

    const bH = Math.ceil(H / wc.length);
    wc.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * bH, W, bH); });

    // Raios de luz
    ctx.save(); ctx.globalAlpha = lightAlpha;
    for (let i = 0; i < 5; i++) {
      const lx = W * 0.2 + i * W * 0.15 + Math.sin(this.time + i) * 20;
      ctx.fillStyle = lightColor;
      ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + 40, H); ctx.lineTo(lx - 10, H); ctx.fill();
    }
    ctx.restore();

    // Ondas superficiais
    for (let x = 0; x < W; x += px) {
      const w1 = Math.sin(x * 0.02 + this.time * 2) * 5;
      const w2 = Math.sin(x * 0.04 + this.time * 3) * 3;
      ctx.fillStyle = waveColor1; ctx.fillRect(x, w1 + 2, px, px);
      ctx.fillStyle = waveColor2; ctx.fillRect(x, w1 + w2 + 6, px, px);
    }

    // Algas
    for (let i = 0; i < 8; i++) {
      const ax = 40 + i * (W / 8), ah = 15 + Math.sin(this.time * 1.5 + i * 2) * 5;
      ctx.fillStyle = '#166534'; ctx.fillRect(ax, H - ah, px, ah); ctx.fillRect(ax + px, H - ah + 4, px, ah - 4);
      ctx.fillStyle = '#15803d'; ctx.fillRect(ax - px, H - ah + 8, px, ah - 8);
    }

    // Peixes
    this.fishSprites.forEach(f => {
      f.x += f.speed * f.dir; f.wobble += 0.05;
      if (f.x < -80) { f.x = W + 30; f.y = 60 + Math.random() * (H - 140); }
      this._drawMinifish(f, Math.sin(f.wobble) * 2);
    });

    // Mergulhador Amigo nadando na tela (quando ativado)
    if (this.diverActive) {
      const d = this.diver;
      d.x += d.speed * d.dir;
      d.wobble += 0.04;
      d.bubbleTimer++;

      // Respiração: solta bolhas periódicas da máscara/regulador
      if (d.bubbleTimer >= 36) {
        d.bubbleTimer = 0;
        const bx = d.x + 14 * d.size;
        const by = d.y + Math.sin(d.wobble) * 3 + 2 * d.size;
        this.bubbles.push({ x: bx, y: by, speed: 0.7 + Math.random() * 0.4, drift: (Math.random() - 0.5) * 0.4 });
        this.bubbles.push({ x: bx + 3, y: by + 2, speed: 0.9 + Math.random() * 0.4, drift: (Math.random() - 0.5) * 0.4 });
      }

      // Loop ao cruzar a tela
      if (d.x > W + 80) {
        d.x = -80;
        d.y = 70 + Math.random() * Math.max(50, H - 200);
      }

      this._drawDiver(d, Math.sin(d.wobble) * 3);
    }

    // Bolhas
    if (Math.random() < 0.04) {
      this.bubbles.push({ x: 40 + Math.random() * (W - 80), y: H, speed: 0.5 + Math.random() * 0.8, drift: (Math.random() - 0.5) * 0.3 });
    }
    this.bubbles = this.bubbles.filter(b => {
      b.y -= b.speed; b.x += b.drift;
      if (b.y < 0) return false;
      const bx = Math.round(b.x / px) * px, by = Math.round(b.y / px) * px;
      ctx.fillStyle = 'rgba(186,230,253,0.5)'; ctx.fillRect(bx, by, px, px);
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(bx, by, 2, 2);
      return true;
    });
  }

  _drawDiver(d, wy) {
    const { ctx } = this;
    const s = d.size || 2.5;
    const kick = Math.sin(d.wobble * 3.5) > 0 ? 1 : 0;

    // Matriz horizontal 18x8 (cabeça à direita, pés de pato à esquerda)
    const m = [
      [0,0,0,0,0,0,1,3,3,3,3,1,0,0,0,0,0,0],
      [0,0,0,0,0,1,3,7,3,3,3,1,1,1,0,0,0,0],
      [0,0,0,1,2,2,2,2,2,2,2,2,1,6,6,1,0,0],
      [5,5,1,2,2,2,2,2,2,2,2,2,1,4,4,7,1,0],
      [5,5,5,1,2,2,2,2,2,2,2,2,1,4,4,4,1,0],
      [0,1,5,5,1,2,2,2,2,2,2,2,1,6,1,1,0,0],
      [0,0,1,1,0,1,2,2,2,2,2,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0]
    ];

    const cm = {
      1: '#0f172a',
      2: '#0284c7', // roupa de mergulho azul
      3: '#ea580c', // cilindro de oxigênio
      4: '#38bdf8', // visor da máscara
      5: '#facc15', // nadadeiras amarelas
      6: '#fed7aa', // pele / rosto
      7: '#ffffff'  // reflexo de luz
    };

    const posX = Math.round(d.x);
    const posY = Math.round(d.y + wy);

    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        const val = m[y][x];
        if (!val) continue;
        let actualY = y;
        // Pés de pato batendo com o nado
        if (x <= 3) {
          actualY = y + (kick ? 1 : -1);
        }
        ctx.fillStyle = cm[val] || '#fff';
        ctx.fillRect(posX + x * s, posY + actualY * s, s, s);
      }
    }
  }

  _drawMinifish(f, wy) {
    const { ctx } = this; const s = f.size;
    const m = [[0,0,1,1,1,0,0,0],[0,1,2,2,2,1,0,0],[1,5,2,4,2,2,1,1],[0,1,3,3,2,2,1,1],[0,0,1,1,1,1,0,0]];
    const cm = { 1: f.pal.outline, 2: f.pal.body, 3: f.pal.belly, 4: f.pal.eye, 5: f.pal.fin };
    for (let y = 0; y < m.length; y++)
      for (let x = 0; x < m[y].length; x++) {
        if (!m[y][x]) continue;
        ctx.fillStyle = cm[m[y][x]] || '#fff';
        ctx.fillRect(Math.round(f.x) + x * s, Math.round(f.y + wy) + y * s, s, s);
      }
  }
}

// ═══════════════════════════════════════════════
// ÍCONES PIXEL ART RETRÔ (Substitutos para todos os emojis)
// ═══════════════════════════════════════════════
export const PIXEL_ICONS = {
  coin: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="2" y="1" width="6" height="8" fill="#eab308"/><rect x="1" y="2" width="8" height="6" fill="#facc15"/><rect x="3" y="3" width="4" height="4" fill="#fef08a"/><rect x="4" y="4" width="2" height="2" fill="#eab308"/></svg>`,
  rod: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;"><path d="M2 10 L10 2" stroke="#38bdf8" stroke-width="1.5"/><rect x="1" y="9" width="2" height="2" fill="#b45309"/><rect x="9" y="1" width="2" height="2" fill="#facc15"/></svg>`,
  tools: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="2" y="2" width="2" height="2" fill="#94a3b8"/><rect x="4" y="4" width="2" height="2" fill="#64748b"/><rect x="6" y="6" width="2" height="2" fill="#b45309"/><rect x="7" y="7" width="2" height="2" fill="#78350f"/></svg>`,
  soundOn: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="1" y="3" width="3" height="4" fill="#94a3b8"/><path d="M4 3 L7 1 L7 9 L4 7 Z" fill="#cbd5e1"/><rect x="8" y="3" width="1" height="4" fill="#38bdf8"/></svg>`,
  soundOff: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="1" y="3" width="3" height="4" fill="#64748b"/><path d="M4 3 L7 1 L7 9 L4 7 Z" fill="#64748b"/><rect x="8" y="2" width="1" height="6" fill="#ef4444"/></svg>`,
  gear: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;"><rect x="5" y="0" width="2" height="12" fill="#94a3b8"/><rect x="0" y="5" width="12" height="2" fill="#94a3b8"/><rect x="2" y="2" width="8" height="8" fill="#94a3b8"/><rect x="3" y="1" width="6" height="10" fill="#cbd5e1"/><rect x="1" y="3" width="10" height="6" fill="#cbd5e1"/><rect x="4" y="4" width="4" height="4" fill="#0f172a"/></svg>`,
  reset: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><path d="M2 4 A 3 3 0 1 1 5 8" fill="none" stroke="#f87171" stroke-width="1.5"/><polygon points="2,1 2,5 6,5" fill="#f87171"/></svg>`,
  console: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="1" y="1" width="8" height="6" fill="#0f172a" stroke="#22c55e" stroke-width="1"/><rect x="3" y="8" width="4" height="1" fill="#475569"/><rect x="3" y="3" width="2" height="1" fill="#22c55e"/></svg>`,
  book: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="1" y="2" width="4" height="6" fill="#0284c7"/><rect x="5" y="2" width="4" height="6" fill="#38bdf8"/><rect x="2" y="3" width="2" height="4" fill="#f8fafc"/><rect x="6" y="3" width="2" height="4" fill="#f8fafc"/></svg>`,
  bucket: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="2" y="1" width="6" height="1" fill="#94a3b8"/><rect x="1" y="2" width="8" height="2" fill="#0284c7"/><rect x="2" y="4" width="6" height="5" fill="#0369a1"/></svg>`,
  aquarium: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="1" y="2" width="8" height="6" fill="#38bdf8" fill-opacity="0.6" stroke="#9333ea" stroke-width="1"/><rect x="4" y="4" width="3" height="2" fill="#f97316"/></svg>`,
  sell: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><path d="M3 3 Q5 1 7 3 L8 8 L2 8 Z" fill="#b45309"/><rect x="4" y="4" width="2" height="3" fill="#facc15"/></svg>`,
  filter: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><circle cx="4" cy="4" r="2.5" fill="none" stroke="#38bdf8" stroke-width="1.2"/><line x1="6" y1="6" x2="9" y2="9" stroke="#38bdf8" stroke-width="1.5"/></svg>`,
  lockClosed: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 8 8" style="image-rendering:pixelated;"><rect x="2" y="1" width="4" height="3" fill="none" stroke="#f59e0b" stroke-width="1"/><rect x="1" y="3" width="6" height="4" fill="#d97706"/></svg>`,
  lockOpen: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 8 8" style="image-rendering:pixelated;"><path d="M2 3 L2 1 L5 1 L5 3" fill="none" stroke="#64748b" stroke-width="1"/><rect x="1" y="3" width="6" height="4" fill="#475569"/></svg>`,
  sun: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 8 8" style="image-rendering:pixelated;"><rect x="2" y="2" width="4" height="4" fill="#facc15"/><rect x="3" y="0" width="2" height="1" fill="#f59e0b"/><rect x="3" y="7" width="2" height="1" fill="#f59e0b"/><rect x="0" y="3" width="1" height="2" fill="#f59e0b"/><rect x="7" y="3" width="1" height="2" fill="#f59e0b"/></svg>`,
  day: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 8 8" style="image-rendering:pixelated;"><rect x="2" y="2" width="4" height="4" fill="#facc15"/><rect x="3" y="0" width="2" height="1" fill="#f59e0b"/><rect x="3" y="7" width="2" height="1" fill="#f59e0b"/><rect x="0" y="3" width="1" height="2" fill="#f59e0b"/><rect x="7" y="3" width="1" height="2" fill="#f59e0b"/></svg>`,
  sunset: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 8 8" style="image-rendering:pixelated;"><rect x="1" y="2" width="6" height="3" fill="#fb923c"/><line x1="0" y1="5" x2="8" y2="5" stroke="#7e22ce" stroke-width="1"/><line x1="0" y1="6" x2="8" y2="6" stroke="#4c1d95" stroke-width="1"/></svg>`,
  moon: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 8 8" style="image-rendering:pixelated;"><path d="M2 1 A3 3 0 0 0 6 7 A4 4 0 1 1 2 1 Z" fill="#fef08a"/></svg>`,
  night: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 8 8" style="image-rendering:pixelated;"><path d="M2 1 A3 3 0 0 0 6 7 A4 4 0 1 1 2 1 Z" fill="#fef08a"/></svg>`,
  fish: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 8" style="image-rendering:pixelated;"><rect x="2" y="2" width="7" height="4" fill="#38bdf8"/><polygon points="9,4 12,1 12,7" fill="#0284c7"/><rect x="1" y="3" width="2" height="2" fill="#0284c7"/><rect x="3" y="2" width="2" height="2" fill="#fff"/><rect x="4" y="3" width="1" height="1" fill="#000"/></svg>`,
  sleep: `<svg class="w-8 h-8 inline-block align-middle shrink-0" viewBox="0 0 16 16" style="image-rendering:pixelated;"><rect x="2" y="2" width="4" height="1" fill="#38bdf8"/><rect x="5" y="3" width="1" height="1" fill="#38bdf8"/><rect x="4" y="4" width="1" height="1" fill="#38bdf8"/><rect x="2" y="5" width="4" height="1" fill="#38bdf8"/><rect x="8" y="5" width="5" height="1" fill="#a855f7"/><rect x="12" y="6" width="1" height="1" fill="#a855f7"/><rect x="10" y="7" width="1" height="1" fill="#a855f7"/><rect x="8" y="8" width="5" height="1" fill="#a855f7"/></svg>`,
  sparkle: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 8 8" style="image-rendering:pixelated;"><rect x="3" y="1" width="2" height="6" fill="#fde047"/><rect x="1" y="3" width="6" height="2" fill="#fde047"/><rect x="3" y="3" width="2" height="2" fill="#ffffff"/></svg>`,
  profile: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;"><rect x="3" y="1" width="6" height="5" fill="#fed7aa" stroke="#0f172a" stroke-width="0.8"/><rect x="2" y="2" width="8" height="2" fill="#fde047"/><rect x="1" y="6" width="10" height="5" fill="#15803d" stroke="#0f172a" stroke-width="0.8"/><rect x="4" y="3" width="1" height="1" fill="#0f172a"/><rect x="7" y="3" width="1" height="1" fill="#0f172a"/><rect x="5" y="5" width="2" height="1" fill="#c2410c"/></svg>`,
  trophy: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;"><rect x="3" y="1" width="6" height="5" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/><rect x="1" y="2" width="2" height="3" fill="#f59e0b"/><rect x="9" y="2" width="2" height="3" fill="#f59e0b"/><rect x="5" y="6" width="2" height="2" fill="#ca8a04"/><rect x="3" y="8" width="6" height="2" fill="#b45309"/><rect x="4" y="2" width="4" height="2" fill="#fef08a"/></svg>`,
  lockedTrophy: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;"><rect x="3" y="1" width="6" height="5" fill="#334155" stroke="#1e293b" stroke-width="0.8"/><rect x="1" y="2" width="2" height="3" fill="#1e293b"/><rect x="9" y="2" width="2" height="3" fill="#1e293b"/><rect x="5" y="6" width="2" height="2" fill="#1e293b"/><rect x="3" y="8" width="6" height="2" fill="#0f172a"/><rect x="4" y="2" width="4" height="2" fill="#475569"/></svg>`,
  bait: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="2" y="2" width="6" height="2" fill="#cd853f"/><rect x="4" y="4" width="4" height="2" fill="#8b4513"/><rect x="2" y="6" width="4" height="2" fill="#cd853f"/></svg>`,
  portal: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;"><rect x="4" y="1" width="4" height="1" fill="#a855f7"/><rect x="2" y="2" width="8" height="1" fill="#06b6d4"/><rect x="1" y="3" width="10" height="6" fill="#8b5cf6"/><rect x="3" y="4" width="6" height="4" fill="#0891b2"/><rect x="4" y="5" width="4" height="2" fill="#67e8f9"/><rect x="5" y="5" width="2" height="2" fill="#ffffff"/><rect x="2" y="9" width="8" height="1" fill="#06b6d4"/><rect x="4" y="10" width="4" height="1" fill="#a855f7"/></svg>`,
  fishEye: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;"><rect x="3" y="1" width="6" height="1" fill="#38bdf8"/><rect x="1" y="2" width="10" height="8" fill="#0284c7"/><rect x="0" y="4" width="12" height="4" fill="#0369a1"/><rect x="2" y="3" width="8" height="6" fill="#f8fafc"/><rect x="4" y="4" width="4" height="4" fill="#0f172a"/><rect x="5" y="4" width="2" height="2" fill="#38bdf8"/><rect x="6" y="5" width="1" height="1" fill="#ffffff"/><rect x="3" y="10" width="6" height="1" fill="#38bdf8"/></svg>`
};

// ═══════════════════════════════════════════════
// POSICIONAMENTO PRECISO DA LINHA DE PESCA
// ═══════════════════════════════════════════════
export function updateFishingLine() {
  const lake = document.getElementById('fishing-lake-area');
  const canvas = document.getElementById('fisherman-canvas');
  const line = document.getElementById('fishing-line-path');
  const buoyGroup = document.getElementById('svg-buoy-group');
  if (!lake || !canvas || !line) return;

  const lakeRect = lake.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  if (lakeRect.width === 0 || lakeRect.height === 0) return;

  // Ponta da vara calculada diretamente pelo rect do canvas no viewport
  // Na matriz 32x32: Coluna 28 de 32 (X: 28.2 / 32), Linha 0.8 de 32 (Y: 0.8 / 32)
  const tipX = (canvasRect.left - lakeRect.left) + (canvasRect.width * (28.2 / 32));
  const tipY = (canvasRect.top - lakeRect.top) + (canvasRect.height * (0.8 / 32));

  // Converte para percentual de 0 a 100 (mesmo viewBox 0 0 100 100 do SVG)
  const tipXPercent = (tipX / lakeRect.width) * 100;
  const tipYPercent = (tipY / lakeRect.height) * 100;

  // Posição de destino da bóia na água
  const buoyX = Math.min(Math.max(tipXPercent + 26, 46), 62);
  const buoyY = Math.min(Math.max(tipYPercent + 14, 68), 75);

  // Ponto de controle da curva Bezier com curvatura gravitacional natural
  const ctrlX = tipXPercent + (buoyX - tipXPercent) * 0.45;
  const ctrlY = Math.min(tipYPercent + (buoyY - tipYPercent) * 0.85 + 2, 73);

  line.setAttribute('d', `M ${tipXPercent.toFixed(2)} ${tipYPercent.toFixed(2)} Q ${ctrlX.toFixed(2)} ${ctrlY.toFixed(2)}, ${buoyX.toFixed(2)} ${buoyY.toFixed(2)}`);

  // Reposiciona a bóia para que ela fique conectada no fim da linha
  if (buoyGroup) {
    const dx = buoyX - 55.2;
    const dy = buoyY - 70.5;
    buoyGroup.setAttribute('transform', `translate(${dx.toFixed(2)}, ${dy.toFixed(2)})`);
  }
}

export { PALETTES };
