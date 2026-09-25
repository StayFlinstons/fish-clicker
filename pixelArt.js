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
  lampreia_negra: { body:'#09090b', belly:'#18181b', eye:'#ff1a1a', fin:'#7f1d1d', outline:'#450a0a' },
  // ═══════════════════════════════════════════
  // PEIXES DAS CAMADAS FUNDAS (antigo Mundo 2)
  // ═══════════════════════════════════════════
  camarao_neon:         { body:'#06b6d4', belly:'#cffafe', eye:'#38bdf8', fin:'#0891b2', outline:'#164e63' },
  peixe_lanterna:       { body:'#0284c7', belly:'#bae6fd', eye:'#fde047', fin:'#0369a1', outline:'#0c4a6e' },
  agua_viva_aurora:     { body:'#818cf8', belly:'#e0e7ff', eye:'#c084fc', fin:'#6366f1', outline:'#3730a3' },
  polvo_cintilante:     { body:'#a855f7', belly:'#f3e8ff', eye:'#38bdf8', fin:'#9333ea', outline:'#581c87' },
  caranguejo_obsidiana: { body:'#18181b', belly:'#3f3f46', eye:'#ef4444', fin:'#27272a', outline:'#09090b' },
  carpa_magmatica:      { body:'#ea580c', belly:'#fed7aa', eye:'#facc15', fin:'#c2410c', outline:'#7c2d12' },
  moreia_brasa:         { body:'#dc2626', belly:'#fecaca', eye:'#fef08a', fin:'#b91c1c', outline:'#7f1d1d' },
  dragao_hidrotermico:  { body:'#991b1b', belly:'#fca5a5', eye:'#fbbf24', fin:'#7f1d1d', outline:'#450a0a' },
  arenque_fantasma:     { body:'#64748b', belly:'#f1f5f9', eye:'#38bdf8', fin:'#475569', outline:'#1e293b' },
  enguia_espectral:     { body:'#0d9488', belly:'#ccfbf1', eye:'#2dd4bf', fin:'#0f766e', outline:'#134e4a' },
  peixe_cofre:          { body:'#d97706', belly:'#fef3c7', eye:'#fbbf24', fin:'#b45309', outline:'#78350f' },
  tubarao_espectro:     { body:'#334155', belly:'#cbd5e1', eye:'#f43f5e', fin:'#1e293b', outline:'#0f172a' },
  peixe_diabo:          { body:'#1e1b4b', belly:'#c7d2fe', eye:'#fb7185', fin:'#312e81', outline:'#0f0d24' },
  tubarao_duende:       { body:'#831843', belly:'#fce7f3', eye:'#f43f5e', fin:'#9d174d', outline:'#500724' },
  quimera_abissal:      { body:'#3b0764', belly:'#e9d5ff', eye:'#e879f9', fin:'#581c87', outline:'#2e1065' },
  leviata_nucleo:       { body:'#450a0a', belly:'#fca5a5', eye:'#facc15', fin:'#7f1d1d', outline:'#1c0404' },
  arraia_coral:         { body:'#f43f5e', belly:'#ffe4e6', eye:'#38bdf8', fin:'#e11d48', outline:'#881337' },
  serpente_coral:       { body:'#06b6d4', belly:'#fbcfe8', eye:'#fde047', fin:'#0891b2', outline:'#0e7490' },
  tubarao_basaltico:    { body:'#292524', belly:'#ea580c', eye:'#facc15', fin:'#1c1917', outline:'#0c0a09' },
  fenix_magma:          { body:'#ea580c', belly:'#fef08a', eye:'#ffffff', fin:'#dc2626', outline:'#7f1d1d' },
  espadarte_fantasma:   { body:'#10b981', belly:'#ecfdf5', eye:'#38bdf8', fin:'#059669', outline:'#064e3b' },
  kraken_galeoes:       { body:'#064e3b', belly:'#fef08a', eye:'#34d399', fin:'#047857', outline:'#022c22' },
  isopode_hadal:        { body:'#6b21a8', belly:'#e9d5ff', eye:'#c084fc', fin:'#581c87', outline:'#3b0764' },
  polvo_vampiro:        { body:'#4c1d95', belly:'#f43f5e', eye:'#38bdf8', fin:'#6d28d9', outline:'#1e0538' },
  olho_vazio:           { body:'#1e0836', belly:'#ea580c', eye:'#fef08a', fin:'#dc2626', outline:'#010003' },
  // ═══════════════════════════════════════════
  // PEIXES NOVOS DAS CAMADAS DE PROFUNDIDADE
  // ═══════════════════════════════════════════
  traira:               { body:'#5b6b3a', belly:'#c9c79a', eye:'#fde047', fin:'#3f4a27', outline:'#262d17' },
  tucunare:             { body:'#a3b82c', belly:'#fef3c7', eye:'#dc2626', fin:'#ea580c', outline:'#3f4a12' },
  tambaqui:             { body:'#374151', belly:'#1f2937', eye:'#fbbf24', fin:'#111827', outline:'#030712' },
  poraque:              { body:'#4a3b2b', belly:'#f59e0b', eye:'#fef08a', fin:'#2e2419', outline:'#1c150d' },
  boiuna:               { body:'#14532d', belly:'#a3e635', eye:'#facc15', fin:'#052e16', outline:'#021a0c' },
  cavala:               { body:'#0f766e', belly:'#e2e8f0', eye:'#1a1a2e', fin:'#115e59', outline:'#134e4a' },
  dourado_mar:          { body:'#22c55e', belly:'#fde047', eye:'#1a1a2e', fin:'#2563eb', outline:'#14532d' },
  atum:                 { body:'#1e3a8a', belly:'#e2e8f0', eye:'#1a1a2e', fin:'#facc15', outline:'#172554' },
  peixe_lua:            { body:'#94a3b8', belly:'#e2e8f0', eye:'#1a1a2e', fin:'#64748b', outline:'#334155' },
  peixe_machado:        { body:'#cbd5e1', belly:'#f8fafc', eye:'#0f172a', fin:'#94a3b8', outline:'#475569' },
  lula_humboldt:        { body:'#b91c1c', belly:'#fecaca', eye:'#fde047', fin:'#991b1b', outline:'#450a0a' },
  peixe_bolha:          { body:'#f9a8d4', belly:'#fce7f3', eye:'#1a1a2e', fin:'#f472b6', outline:'#9d174d' },
  peixe_vibora:         { body:'#111827', belly:'#1e3a8a', eye:'#38bdf8', fin:'#1f2937', outline:'#030712' },
  tubarao_groenlandia:  { body:'#57534e', belly:'#a8a29e', eye:'#e0f2fe', fin:'#44403c', outline:'#1c1917' },
  granadeiro:           { body:'#71717a', belly:'#d4d4d8', eye:'#38bdf8', fin:'#52525b', outline:'#27272a' },
  peixe_tripe:          { body:'#a8a29e', belly:'#e7e5e4', eye:'#1a1a2e', fin:'#78716c', outline:'#44403c' },
  anfipode:             { body:'#fda4af', belly:'#ffe4e6', eye:'#1a1a2e', fin:'#fb7185', outline:'#9f1239' },
  peixe_caracol:        { body:'#fbcfe8', belly:'#fdf2f8', eye:'#1a1a2e', fin:'#f9a8d4', outline:'#be185d' },
  holoturia:            { body:'#e879f9', belly:'#fae8ff', eye:'#1a1a2e', fin:'#d946ef', outline:'#86198f' },
  polvo_dumbo:          { body:'#fb923c', belly:'#ffedd5', eye:'#1a1a2e', fin:'#f97316', outline:'#9a3412' }
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

// Serpente Marinha Cósmica (Corpo ondulante místico com barbelas e cauda etérea)
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

// Peixe-Dragão da Fenda (Chifres pontiagudos, crista espinhosa dorsal, mandíbula de chamas azuis e barbatana farpada)
const SPRITE_DRAGON = [
  [0,6,0,0,1,1,0,0,1,1,0,0,1,1,0,0], // Espinhos dorsais de dragão
  [0,1,6,1,2,5,1,1,2,5,1,1,2,5,1,0], // Dorso serrilhado
  [1,1,2,2,4,1,2,2,2,2,2,2,2,2,1,1], // Olho dourado (4) e ponta da cauda
  [1,6,2,2,2,2,2,2,2,2,2,2,2,2,2,1], // Focinho com presa e corpo voraz
  [6,1,6,1,3,3,3,3,2,2,2,2,2,2,1,5], // Chama azul expelida (6) e farpa caudal (5)
  [0,1,6,1,1,3,3,3,3,3,2,2,2,2,1,1], // Barbelas místicas e ventre
  [0,0,6,0,1,1,5,5,3,3,2,2,2,1,1,0], // Barbatana de garra peitoral
  [0,0,0,0,0,1,5,5,1,1,1,1,1,1,0,0], // Nadadeira ventral
  [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Leviatã Bioluminescente (Colosso abissal com antena de luz, fotóforos brilhantes e cauda caudal dupla)
const SPRITE_LEVIATHAN = [
  [0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0], // Antena de bioluminescência
  [0,0,1,6,1,0,0,1,1,1,0,0,0,0,1,1], // Haste e topo da cauda
  [0,1,1,1,1,1,1,2,2,2,1,1,0,1,5,1], // Dorso e barbatana caudal superior
  [1,2,2,4,2,2,6,2,2,6,2,2,1,1,5,1], // Olho verde néon (4) e fotóforos brilhantes (6)
  [1,6,2,2,2,2,2,2,2,2,2,2,2,2,1,0], // Focinho com fotóforo e corpo imponente
  [1,1,3,3,3,3,6,3,3,6,2,2,2,2,1,0], // Ventre abissal com fotóforos ventrais
  [0,1,3,3,3,3,3,3,3,2,2,2,2,1,5,1], // Quilha e barbatana caudal inferior
  [0,0,1,1,5,5,5,1,1,1,1,1,1,0,1,1], // Grande nadadeira peitoral abissal
  [0,0,0,1,5,5,1,0,0,0,0,0,0,0,0,0], // Ponta da nadadeira
  [0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0],
];

// Leviatã do Prisma Solar (Colosso celestial com chifres e espinhos de cristal prismático)
const SPRITE_PRISMA_LEVIATHAN = [
  [0,6,6,0,0,0,0,6,0,0,6,0,0,6,0,0], // Cristais prismáticos dorsais
  [6,1,1,1,1,0,1,6,1,1,6,1,1,6,1,0], // Dorso cristalino
  [1,2,2,2,4,1,2,2,2,2,2,2,2,2,1,6], // Olho prismático e lâmina caudal
  [1,6,2,2,2,2,2,2,2,2,2,2,2,2,1,6], // Presas cristalinas e corpo serpentino
  [1,1,6,3,3,3,3,2,2,2,2,2,2,2,1,6], // Ventre radiante solar
  [0,1,1,3,3,3,3,3,2,2,2,2,2,1,6,0], // Quilha ventral
  [0,0,1,1,5,5,3,3,3,2,2,2,1,1,0,0], // Barbatana peitoral de luz
  [0,0,0,1,5,6,5,1,1,1,1,1,1,0,0,0], // Espinho da barbatana
  [0,0,0,0,1,6,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
];

// Fênix do Ocaso Eterno (Ave-peixe alada com crista e plumas de fogo em cauda tripla)
const SPRITE_PHOENIX = [
  [0,0,0,6,0,0,1,5,6,0,0,0,0,0,0,0], // Topo da asa flamejante
  [0,0,6,1,1,1,5,5,5,1,0,0,0,6,0,0], // Crista de fogo e brasa
  [0,6,1,2,4,1,2,5,5,1,1,0,1,5,6,0], // Bico de rapina e pluma superior
  [6,1,2,2,2,2,2,2,2,2,2,1,1,5,6,0], // Ponta do bico e corpo alado
  [0,1,1,3,3,3,2,2,2,2,2,2,2,1,5,6], // Peito plumado e pluma central
  [0,0,1,3,3,3,3,2,2,2,2,2,1,1,5,6], // Asa ventral e pluma inferior
  [0,0,0,1,5,5,5,1,1,2,2,1,1,6,1,0], // Envergadura da asa de chamas
  [0,0,0,1,5,6,5,1,0,1,1,0,1,5,6,0], // Penugem ardente
  [0,0,0,0,1,6,1,0,0,0,0,0,0,1,6,1], // Brasas cadentes
  [0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0],
];

// Kraken do Abismo Estelar (Manto cósmico com olhos astrais e múltiplos tentáculos com ventosas)
const SPRITE_KRAKEN = [
  [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0], // Cúpula do manto estelar
  [0,1,2,2,6,2,1,0,0,0,0,0,1,1,0,0], // Estrela no manto e tentáculo superior
  [1,5,2,2,2,2,2,1,0,0,0,1,2,6,1,0], // Barbatana cefálica e ventosa astral
  [1,5,5,4,4,2,2,1,1,1,1,2,2,1,0,0], // Olhos cósmicos penetrantes (4)
  [0,1,1,4,4,3,3,2,6,2,2,2,1,1,1,1], // Ventosas e tentáculo estendido
  [0,1,2,3,3,1,1,2,1,1,2,2,6,2,2,1], // Sifão e braços abissais
  [1,2,6,1,1,2,6,1,0,1,1,2,1,1,1,0], // Tentáculos ondulantes inferiores
  [1,6,2,1,2,6,1,0,1,2,6,1,0,0,0,0], // Espirais de tentáculos com estrelas
  [0,1,6,2,6,1,0,0,1,6,2,1,0,0,0,0], // Ventosas bioluminescentes
  [0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,0], // Pontas dos tentáculos
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
// ── Formatos dos peixes novos das camadas (v1.7) ──
// Peixe-lua (disco alto, nadadeiras em cima e embaixo, sem cauda)
const SPRITE_SUNFISH = [
  [0,0,0,0,0,0,0,1,5,1,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,5,5,1,1,1,0,0,0,0],
  [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
  [0,1,2,4,2,2,2,2,2,2,2,2,2,5,1,0],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,5,5,1],
  [1,3,3,3,3,3,3,3,3,3,3,3,2,5,5,1],
  [0,1,3,3,3,3,3,3,3,3,3,3,2,5,1,0],
  [0,0,1,1,3,3,3,3,3,3,3,1,1,1,0,0],
  [0,0,0,0,1,1,1,5,5,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,1,5,1,0,0,0,0,0,0],
];

// Peixe-bolha (corpo mole, nariz caído)
const SPRITE_BLOB = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,2,1,1,0,0,0,0],
  [0,0,1,2,4,2,2,2,2,2,2,2,1,0,0,0],
  [0,1,6,6,2,2,2,2,2,2,2,2,2,1,1,0],
  [1,6,6,6,6,2,2,2,2,2,2,2,2,5,5,1],
  [1,6,6,6,3,3,3,3,3,2,2,2,2,1,5,1],
  [0,1,1,3,3,3,3,3,3,3,2,2,1,0,1,0],
  [0,0,0,1,1,3,3,3,3,1,1,1,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0],
];

// Polvo-dumbo (nadadeiras de orelha e tentáculos)
const SPRITE_DUMBO = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,0,0,1,1,1,1,1,1,0,0,1,1,0],
  [1,5,5,1,1,2,2,2,2,2,2,1,1,5,5,1],
  [1,5,5,5,1,2,2,2,2,2,2,1,5,5,5,1],
  [0,1,1,1,2,2,4,2,2,4,2,2,1,1,1,0],
  [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
  [0,0,0,1,3,3,3,3,3,3,3,3,1,0,0,0],
  [0,0,1,3,1,3,1,3,3,1,3,1,3,1,0,0],
  [0,1,3,1,0,1,3,1,1,3,1,0,1,3,1,0],
  [0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0],
];

// Peixe-tripé (apoiado em nadadeiras compridas)
const SPRITE_TRIPOD = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,1,1,1,2,2,2,2,1,1,1,0,0,0],
  [0,1,1,2,4,2,2,2,2,2,2,2,2,1,1,1],
  [1,2,2,3,3,3,3,3,2,2,2,2,2,2,5,1],
  [0,1,1,1,3,3,3,1,1,1,1,1,1,1,1,0],
  [0,0,0,6,0,0,0,0,6,0,0,0,0,6,0,0],
  [0,0,6,0,0,0,0,0,6,0,0,0,0,0,6,0],
  [0,0,6,0,0,0,0,0,6,0,0,0,0,0,6,0],
  [0,6,6,0,0,0,0,6,6,0,0,0,0,0,6,6],
];

// Peixe-machado (alto e fino, fotóforos na barriga)
const SPRITE_HATCHET = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
  [0,0,0,1,2,2,2,2,2,1,1,0,0,0,0,0],
  [0,0,1,4,2,2,2,2,2,2,2,1,0,1,1,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,1,5,5,1],
  [0,1,3,3,3,3,3,3,3,3,3,2,1,5,5,1],
  [0,1,3,3,3,3,3,3,3,3,3,1,0,1,1,0],
  [0,0,1,6,3,6,3,6,3,6,1,0,0,0,0,0],
  [0,0,0,1,6,1,6,1,6,1,0,0,0,0,0,0],
  [0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0],
];

// Cabeça grande e cauda afinando (granadeiro, peixe-caracol)
const SPRITE_TADPOLE = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
  [0,1,2,2,2,2,1,1,0,0,0,0,0,0,0,0],
  [1,2,4,2,2,2,2,2,1,1,0,0,0,0,0,0],
  [1,2,2,2,2,2,2,2,2,2,1,1,1,0,0,0],
  [1,3,3,3,3,3,2,2,2,2,2,2,2,1,1,0],
  [0,1,3,3,3,3,3,3,2,2,2,2,2,2,5,1],
  [0,0,1,1,5,1,5,3,3,3,1,1,1,1,1,0],
  [0,0,0,0,1,0,0,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Holotúria (tubo com pezinhos)
const SPRITE_CUCUMBER = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,6,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,1,2,2,2,2,2,2,2,2,2,2,2,1,1,0],
  [1,2,4,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
  [0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0],
  [0,0,0,1,6,1,6,1,6,1,6,1,6,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Anfípode (crustáceo segmentado com patas)
const SPRITE_AMPHIPOD = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,6,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,6,1,1,2,1,2,1,2,2,1,1,0,0,0],
  [0,0,1,4,2,2,1,2,1,2,1,2,2,1,0,0],
  [0,1,2,2,2,2,1,2,1,2,1,2,2,2,1,0],
  [0,1,3,3,3,3,1,3,1,3,1,3,3,2,5,1],
  [0,0,1,1,1,1,1,1,1,1,1,3,1,5,1,0],
  [0,0,0,6,0,6,0,6,0,6,0,1,5,1,0,0],
  [0,0,6,0,6,0,6,0,6,0,6,0,1,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

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
  dragao:    SPRITE_DRAGON,
  celacanto:      SPRITE_ANCIENT,
  leviata:        SPRITE_LEVIATHAN,
  serpente:       SPRITE_SERPENT,
  peixe_sol:      SPRITE_CLASSIC,
  prisma_solar:   SPRITE_PRISMA_LEVIATHAN,
  crepusculo:     SPRITE_RAY,
  fenix_ocaso:    SPRITE_PHOENIX,
  tubarao_lunar:  SPRITE_SHARK,
  kraken_estelar: SPRITE_KRAKEN,
  lampreia_negra: SPRITE_LAMPREY,
  // Camadas fundas (antigo Mundo 2)
  camarao_neon:         SPRITE_SLENDER,
  peixe_lanterna:       SPRITE_CLASSIC,
  agua_viva_aurora:     SPRITE_RAY,
  polvo_cintilante:     SPRITE_PUFFER,
  caranguejo_obsidiana: SPRITE_PUFFER,
  carpa_magmatica:      SPRITE_CLASSIC,
  moreia_brasa:         SPRITE_SERPENT,
  dragao_hidrotermico:  SPRITE_DRAGON,
  arenque_fantasma:     SPRITE_SLENDER,
  enguia_espectral:     SPRITE_SERPENT,
  peixe_cofre:          SPRITE_PUFFER,
  tubarao_espectro:     SPRITE_SHARK,
  peixe_diabo:          SPRITE_PIRANHA,
  tubarao_duende:       SPRITE_SHARK,
  quimera_abissal:      SPRITE_ANCIENT,
  leviata_nucleo:       SPRITE_LEVIATHAN,
  arraia_coral:         SPRITE_RAY,
  serpente_coral:       SPRITE_SERPENT,
  tubarao_basaltico:    SPRITE_SHARK,
  fenix_magma:          SPRITE_PHOENIX,
  espadarte_fantasma:   SPRITE_SLENDER,
  kraken_galeoes:       SPRITE_KRAKEN,
  isopode_hadal:        SPRITE_PUFFER,
  polvo_vampiro:        SPRITE_RAY,
  olho_vazio:           SPRITE_LEVIATHAN,
  // Peixes novos das camadas
  traira:               SPRITE_PIRANHA,
  tucunare:             SPRITE_CLASSIC,
  tambaqui:             SPRITE_CLASSIC,
  poraque:              SPRITE_SERPENT,
  boiuna:               SPRITE_SERPENT,
  cavala:               SPRITE_SLENDER,
  dourado_mar:          SPRITE_CLASSIC,
  atum:                 SPRITE_SLENDER,
  peixe_lua:            SPRITE_SUNFISH,
  peixe_machado:        SPRITE_HATCHET,
  lula_humboldt:        SPRITE_KRAKEN,
  peixe_bolha:          SPRITE_BLOB,
  peixe_vibora:         SPRITE_PIRANHA,
  tubarao_groenlandia:  SPRITE_SHARK,
  granadeiro:           SPRITE_TADPOLE,
  peixe_tripe:          SPRITE_TRIPOD,
  anfipode:             SPRITE_AMPHIPOD,
  peixe_caracol:        SPRITE_TADPOLE,
  holoturia:            SPRITE_CUCUMBER,
  polvo_dumbo:          SPRITE_DUMBO,
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


// ═══════════════════════════════════════════════
// ESCAFANDRISTA / MERGULHADOR DO ABISMO (32x32)
// Capacete de latão clássico com visor circular iluminado,
// traje reforçado de mergulho profundo com placa de lastro e mangueira de oxigênio
// Mesmas coordenadas da vara para alinhamento milimétrico com a linha
// ═══════════════════════════════════════════════
const DIVER_WITH_ROD = [
  // Linha 0 a 3: Curvatura da ponta da vara de pesca (idêntica)
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,21,21,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,23,20,20,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,20,20,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,20,20,0,0,0,0,0,0,0,0],
  // Linha 4 a 7: Cúpula de Latão do Escafandro e válvula superior
  [0,0,0,0,0,1,1,31,31,31,31,1,1,0,0,0,0,0,0,23,20,20,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,1,31,30,30,30,30,30,30,31,1,0,0,0,20,20,20,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,30,30,32,32,32,32,32,30,30,30,1,0,20,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,30,30,32,33,33,33,33,32,30,30,30,30,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 8 a 12: Visor de Vidro Circular Central Iluminado
  [0,1,30,30,32,33,34,34,34,34,33,32,30,30,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,30,30,32,33,34,35,35,34,33,32,30,30,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,30,30,32,33,34,35,35,34,33,32,30,30,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,30,30,32,33,34,34,34,34,33,32,30,30,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,30,30,32,33,33,33,33,32,30,30,1,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 13 a 15: Colar de rebites de latão e placa de lastro
  [0,0,0,1,30,30,30,30,30,30,30,30,1,0,20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,31,32,32,32,32,32,32,31,1,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,36,36,36,30,30,30,36,36,36,1,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 16 a 21: Traje de lona pesada com lastro de peito e luvas
  [0,1,36,36,37,36,30,30,30,36,37,36,36,1,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,36,37,37,36,36,36,36,36,37,37,36,16,16,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,36,36,36,36,37,36,37,36,36,36,36,1,16,16,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,36,37,37,36,37,36,37,36,37,37,36,1,23,23,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,36,36,36,36,36,36,36,36,36,1,0,0,22,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 22 a 27: Cinto com blocos de chumbo e calça reforçada
  [0,0,1,38,39,38,39,38,39,38,39,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,36,36,36,36,36,36,36,36,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,36,37,36,36,36,36,37,36,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,36,37,36,1,1,36,37,36,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,36,36,1,0,0,1,36,36,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,36,36,1,0,0,1,36,36,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  // Linha 28 a 31: Botas pesadas de chumbo para o leito do oceano
  [0,0,1,38,38,39,1,0,1,38,38,39,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,38,38,38,39,1,0,1,38,38,38,39,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,39,39,39,39,1,0,1,39,39,39,39,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

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
  vara_arpao_basico:     { rod:'#38bdf8', handle:'#0f172a', tip:'#e0f2fe', glow:'rgba(56,189,248,0.4)' },
  vara_pneumatica:       { rod:'#f97316', handle:'#7c2d12', tip:'#fdba74', glow:'rgba(249,115,22,0.5)' },
  vara_liga_titanio:     { rod:'#10b981', handle:'#064e3b', tip:'#6ee7b7', glow:'rgba(16,185,129,0.6)' },
  vara_tridente_poseidon:{ rod:'#a855f7', handle:'#581c87', tip:'#e9d5ff', glow:'rgba(168,85,247,0.8)' },
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
  isca_kraken_ancestral: { color1:'#c084fc', color2:'#e11d48' },
  isca_plankton_neon:    { color1:'#22d3ee', color2:'#06b6d4' },
  isca_camarao_brasa:    { color1:'#f97316', color2:'#dc2626' },
  isca_alga_espectral:   { color1:'#34d399', color2:'#059669' },
  isca_cristal_hadal:    { color1:'#c084fc', color2:'#7c3aed' },
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
  ],
  isca_kraken_ancestral: [
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,5,5,5,5,5,1,1,0,0,0,0],
    [0,0,1,5,2,2,3,3,3,2,2,5,1,0,0,0],
    [0,1,5,2,3,3,4,4,4,3,3,2,5,1,0,0],
    [0,1,5,2,3,4,4,1,4,4,3,2,5,1,0,0],
    [1,5,2,3,4,4,1,1,1,4,4,3,2,5,1,0],
    [1,5,2,3,4,4,1,1,1,4,4,3,2,5,1,0],
    [1,5,2,3,4,4,1,1,1,4,4,3,2,5,1,0],
    [1,5,2,3,4,4,1,1,1,4,4,3,2,5,1,0],
    [0,1,5,2,3,4,4,1,4,4,3,2,5,1,0,0],
    [0,1,5,2,3,3,4,4,4,3,3,2,5,1,0,0],
    [0,0,1,5,2,2,3,3,3,2,2,5,1,0,0,0],
    [0,0,0,1,1,5,5,5,5,5,1,1,0,0,0,0],
    [0,0,1,6,1,0,1,6,1,0,1,6,1,0,0,0],
    [0,0,1,6,1,0,1,6,1,0,1,6,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0],
  ]
};

// Sprites de Upgrades Gerais (16x16)
const UPGRADE_SPRITES = {
  carretilha: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,2,2,2,2,2,1,1,0,0,0,0],
    [0,0,1,2,2,3,3,3,3,3,2,2,1,0,0,0],
    [0,0,1,2,3,4,4,4,4,4,3,2,1,0,0,0],
    [0,1,2,3,4,4,4,1,4,4,4,3,2,1,0,0],
    [0,1,2,3,4,4,1,1,1,4,4,3,2,1,0,0],
    [0,1,2,3,4,4,4,1,4,4,4,3,2,1,1,1],
    [0,0,1,2,3,4,4,4,4,4,3,2,1,5,5,1],
    [0,0,1,2,2,3,3,3,3,3,2,2,1,5,5,1],
    [0,0,0,1,1,2,2,2,2,2,1,1,0,1,1,1],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,2,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,2,2,2,2,2,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
  sonar: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,3,3,3,4,4,4,3,3,3,3,2,1,0],
    [0,1,2,3,3,4,3,3,3,4,3,3,3,2,1,0],
    [0,1,2,3,4,3,3,3,3,3,4,3,3,2,1,0],
    [0,1,2,3,4,3,3,5,4,3,4,3,3,2,1,0],
    [0,1,2,3,4,3,4,4,4,3,4,3,3,2,1,0],
    [0,1,2,3,3,4,3,3,3,4,3,3,3,2,1,0],
    [0,1,2,3,3,3,4,4,4,3,3,3,3,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
  ],
  encomendas: [
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,4,4,4,4,1,0,0,0,0,0],
    [0,1,1,1,1,1,4,4,4,4,1,1,1,1,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,3,5,5,3,6,6,6,6,6,3,2,1,0],
    [0,1,2,3,3,3,5,3,6,6,6,6,3,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,3,5,5,3,6,6,6,6,6,3,2,1,0],
    [0,1,2,3,3,3,5,3,6,6,6,6,3,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,3,5,5,3,6,6,6,6,6,3,2,1,0],
    [0,1,2,3,3,3,5,3,6,6,6,6,3,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  ],
  rede_espera: [
    [0,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0],
    [0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0],
    [1,1,0,0,0,0,0,0,0,0,0,3,3,3,1,1],
    [1,2,1,0,0,0,0,0,0,0,0,0,0,1,2,1],
    [1,2,2,1,0,0,0,0,0,0,0,0,1,2,2,1],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,2,4,2,4,2,4,2,4,2,4,2,2,1,0],
    [0,0,1,2,4,2,4,2,4,2,4,2,2,1,0,0],
    [0,0,1,2,2,4,2,4,2,4,2,2,1,0,0,0],
    [0,0,0,1,2,2,4,2,4,2,2,1,0,0,0,0],
    [0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  ],
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

export function renderFishermanToCanvas(canvas, scale = 4, rodId = 'vara_bambu', gender = 'male', outfitId = 'verde', hairId = 'ruivo', isWorld2 = false) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const isW2 = Boolean(isWorld2) || (canvas.id === 'fisherman-canvas' && Boolean(window.game?.isDeepLayer?.()));
  const sprite = isW2 ? DIVER_WITH_ROD : (gender === 'female' ? FISHERWOMAN_WITH_ROD : FISHERMAN_WITH_ROD);
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
    30: '#b45309', // latão escuro
    31: '#f59e0b', // latão claro
    32: '#78350f', // aro do visor
    33: '#0284c7', // vidro azul
    34: '#38bdf8', // brilho do vidro
    35: '#ffffff', // ponto de luz do escafandro
    36: '#1e293b', // traje de borracha/lona escura
    37: '#0f172a', // sombra do traje
    38: '#475569', // lastro de chumbo
    39: '#334155', // chumbo escuro
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
  } else if (baitId === 'isca_kraken_ancestral') {
    pal = { 1: '#0f172a', 2: '#1e1b4b', 3: '#4338ca', 4: '#c084fc', 5: '#f43f5e', 6: '#38bdf8' };
  } else if (baitId === 'isca_plankton_neon') {
    pal = { 1: '#083344', 2: '#06b6d4', 3: '#22d3ee', 4: '#a5f3fc', 5: '#ffffff' };
  } else if (baitId === 'isca_camarao_brasa') {
    pal = { 1: '#450a0a', 2: '#ea580c', 3: '#f97316', 4: '#fed7aa', 5: '#ef4444' };
  } else if (baitId === 'isca_alga_espectral') {
    pal = { 1: '#064e3b', 2: '#059669', 3: '#34d399', 4: '#a7f3d0', 5: '#6ee7b7' };
  } else if (baitId === 'isca_cristal_hadal') {
    pal = { 1: '#3b0764', 2: '#7c3aed', 3: '#a855f7', 4: '#e9d5ff', 5: '#c084fc' };
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
    pal = { 1: '#0f172a', 2: '#d97706', 3: '#facc15', 4: '#cbd5e1', 5: '#38bdf8', 6: '#f59e0b' };  } else if (upgradeId === 'carretilha') {
    pal = { 1: '#0f172a', 2: '#475569', 3: '#94a3b8', 4: '#e2e8f0', 5: '#f97316' };
  } else if (upgradeId === 'sonar') {
    pal = { 1: '#0f172a', 2: '#334155', 3: '#052e16', 4: '#4ade80', 5: '#ef4444' };
  } else if (upgradeId === 'encomendas') {
    pal = { 1: '#0f172a', 2: '#92400e', 3: '#f8fafc', 4: '#94a3b8', 5: '#16a34a', 6: '#cbd5e1' };
  } else if (upgradeId === 'rede_espera') {
    pal = { 1: '#0f172a', 2: '#a16207', 3: '#fde68a', 4: '#38bdf8' };
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
  else if (fishIconId === 'dragao') specialColor = '#38bdf8'; // Chamas azuis abissais e barbelas
  else if (fishIconId === 'leviata') specialColor = '#76ff03'; // Antena e fotóforos bioluminescentes verde néon
  else if (fishIconId === 'serpente') specialColor = '#fef08a'; // Chifre místico dourado celestial
  else if (fishIconId === 'prisma_solar') specialColor = '#67e8f9'; // Cristais prismáticos celestes
  else if (fishIconId === 'fenix_ocaso') specialColor = '#fef08a'; // Brasas e plumas douradas solares
  else if (fishIconId === 'kraken_estelar') specialColor = '#38bdf8'; // Ventosas astrais bioluminescentes
  else if (fishIconId === 'crepusculo') specialColor = pal.outline;
  else if (fishIconId === 'tubarao_lunar') specialColor = '#f8fafc';
  else if (fishIconId === 'peixe_sol') specialColor = '#fef08a';
  else if (fishIconId === 'pirarucu') specialColor = '#ef4444'; // escamas vermelhas lendárias do pirarucu
  else if (fishIconId === 'lampreia_negra') specialColor = '#ef4444';
  else if (fishIconId === 'serpente_coral') specialColor = '#facc15';
  else if (fishIconId === 'fenix_magma') specialColor = '#fef08a';
  else if (fishIconId === 'kraken_galeoes') specialColor = '#facc15';
  else if (fishIconId === 'olho_vazio') specialColor = '#facc15'; // aura carmesim abissal pulsante
  else if (fishIconId === 'poraque') specialColor = '#fde047'; // faíscas elétricas
  else if (fishIconId === 'boiuna') specialColor = '#facc15';
  else if (fishIconId === 'traira' || fishIconId === 'peixe_vibora') specialColor = '#f8fafc'; // dentes
  else if (fishIconId === 'peixe_machado') specialColor = '#38bdf8'; // fotóforos azuis
  else if (fishIconId === 'lula_humboldt') specialColor = '#fca5a5';
  else if (fishIconId === 'peixe_bolha') specialColor = '#f472b6'; // nariz caído
  else if (fishIconId === 'peixe_tripe') specialColor = '#e7e5e4'; // nadadeiras-tripé
  else if (fishIconId === 'anfipode') specialColor = '#fecdd3';
  else if (fishIconId === 'holoturia') specialColor = '#f0abfc';

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

export function getBloodMoonFishDataURL(scale = 3) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const sprite = SPRITE_SHARK;
  const colorMap = { 1: '#450a0a', 2: '#dc2626', 3: '#991b1b', 4: '#ffffff', 5: '#ef4444', 6: '#f87171' };
  c.width = sprite[0].length * scale;
  c.height = sprite.length * scale;
  c.style.imageRendering = 'pixelated';
  drawPixelGrid(ctx, sprite, colorMap, scale);
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

  const elLine = document.getElementById('fishing-line-path');
  if (elLine) {
    if (rodCol.glow) {
      elLine.setAttribute('stroke', rodCol.glow);
      elLine.style.filter = `drop-shadow(0 0 3px ${rodCol.glow})`;
    } else {
      elLine.setAttribute('stroke', '#e2e8f0');
      elLine.style.filter = '';
    }
  }

  // Atualiza sprite da isca / anzol pixel art de acordo com a isca equipada
  const hookImg = document.getElementById('hook-bait-img');
  if (hookImg) {
    const validBait = baitId || 'minhoca';
    const baitHookMap = {
      'minhoca': 'icons/baits/anzol_minhoca.png',
      'camarao': 'icons/baits/anzol_camarao.png',
      'isca_brilhante': 'icons/baits/anzol_glow_neon.png',
      'queijo_mistico': 'icons/baits/anzol_massa_mistica.png',
      'ouro_liquido': 'icons/baits/anzol_gota_eter_divino.png',
      'essencia_travessia': 'icons/baits/anzol_vortice_dimensional.png',
      'isca_kraken_ancestral': 'icons/baits/anzol_kraken.png'
    };
    hookImg.src = baitHookMap[validBait] || `icons/baits/hook_${validBait}.png`;
  }
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
    this.waterDrops = [];
    this.splashRipples = [];
    this.vanishingFish = [];
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
    this.bloodMoonActive = false;
    this.isWorld2 = false;
    this.world2Biome = null;
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  // fishIcons: peixes que nadam no cenário; sceneKey: troca os peixes quando muda (ex.: camada).
  setWorldMode(isW2, biomeId = null, fishIcons = null, sceneKey = biomeId) {
    const wasW2 = this.isWorld2;
    const prevKey = this.sceneKey;
    this.isWorld2 = !!isW2;
    this.world2Biome = biomeId;
    this.sceneKey = sceneKey;
    if (wasW2 !== this.isWorld2 || prevKey !== sceneKey || this.fishSprites.length === 0) {
      this.fishSprites = [];
      if (fishIcons && fishIcons.length) {
        fishIcons.forEach(f => this.addSwimmingFish(f));
      } else if (this.isWorld2) {
        ['camarao_neon', 'peixe_lanterna', 'agua_viva_aurora', 'polvo_cintilante', 'moreia_brasa', 'arenque_fantasma'].forEach(f => this.addSwimmingFish(f));
      } else {
        ['lambari', 'carpa', 'truta', 'robalo'].forEach(f => this.addSwimmingFish(f));
      }
    }
  }

  setDiverActive(active) {
    this.diverActive = !!active;
  }

  setBloodMoonActive(active) {
    this.bloodMoonActive = !!active;
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

  /**
   * Dispara uma explosão de gotas d'água, ondulações e bolhas quando um peixe é pescado/some
   */
  triggerFishSplash(x, y, fish = null) {
    const W = this.canvas.width;
    const H = this.canvas.height;
    if (x < -50 || x > W + 50 || y < -30 || y > H + 50) return;

    const originX = Math.round(x + (fish ? fish.size * 4 : 8));
    const originY = Math.round(y + (fish ? fish.size * 2 : 5));

    // Animação de flick e desvanecimento do peixinho
    if (fish) {
      this.vanishingFish.push({
        x: fish.x,
        y: fish.y,
        dir: fish.dir || -1,
        pal: fish.pal || PALETTES.lambari,
        size: fish.size || 2,
        wobble: fish.wobble || 0,
        vy: -1.2,
        frame: 0,
        maxFrames: 9
      });
    }

    // Cores das gotículas de água
    let dropColors;
    if (this.bloodMoonActive) {
      dropColors = ['#ffffff', '#fca5a5', '#ef4444', '#b91c1c', '#fee2e2'];
    } else if (this.isWorld2) {
      const biome = this.world2Biome || 'recife_bioluminescente';
      if (biome === 'fendas_vulcanicas') {
        dropColors = ['#ffffff', '#fef08a', '#fed7aa', '#f97316', '#ef4444'];
      } else if (biome === 'cemiterio_naufragios') {
        dropColors = ['#ffffff', '#d1fae5', '#a7f3d0', '#34d399', '#059669'];
      } else if (biome === 'zona_hadal') {
        dropColors = ['#ffffff', '#f3e8ff', '#e9d5ff', '#c084fc', '#9333ea'];
      } else {
        dropColors = ['#ffffff', '#cffafe', '#a5f3fc', '#22d3ee', '#0891b2'];
      }
    } else if (this.timeOfDay === 'sunset') {
      dropColors = ['#ffffff', '#fed7aa', '#fb923c', '#f472b6', '#bae6fd'];
    } else {
      dropColors = ['#ffffff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0284c7'];
    }

    // 12 a 18 Gotas d'água espirrando com física de arco parabólico
    const count = 12 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const angle = 0.35 + Math.random() * (Math.PI - 0.7);
      const speed = 2.0 + Math.random() * 3.2;
      const vx = Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1) * (speed * 0.7);
      const vy = -Math.sin(angle) * speed;
      const color = dropColors[Math.floor(Math.random() * dropColors.length)];

      this.waterDrops.push({
        x: originX + (Math.random() - 0.5) * 8,
        y: originY + (Math.random() - 0.5) * 6,
        vx,
        vy,
        gravity: 0.16 + Math.random() * 0.04,
        size: Math.random() < 0.3 ? 3 : 2,
        color,
        life: 0,
        maxLife: 24 + Math.floor(Math.random() * 12),
        sparkle: Math.random() < 0.4
      });
    }

    // Ondulação elíptica de água se expandindo
    this.splashRipples.push({
      x: originX,
      y: originY,
      r: 3,
      maxR: 14 + Math.random() * 6,
      color: dropColors[2] || '#38bdf8',
      life: 0,
      maxLife: 20
    });

    // 2 a 3 Pequenas bolhas de splash
    for (let i = 0; i < 3; i++) {
      this.bubbles.push({
        x: originX + (Math.random() - 0.5) * 12,
        y: originY + (Math.random() - 0.5) * 8,
        speed: 0.6 + Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 0.4
      });
    }
  }

  /**
   * Pega um peixinho visível no lago, dispara a animação de gotas e adiciona um novo peixe
   */
  catchAndSpawnFish(fishIconId) {
    const W = this.canvas.width;
    const H = this.canvas.height;

    const visibleIndices = [];
    this.fishSprites.forEach((f, idx) => {
      if (f.x > 20 && f.x < W - 20 && f.y > 30 && f.y < H - 30) {
        visibleIndices.push(idx);
      }
    });

    if (visibleIndices.length > 0) {
      // Prioriza peixinho mais próximo da linha/anzol central (50% x, 40% y)
      const hookX = W * 0.5;
      const hookY = H * 0.4;
      let targetIdx = visibleIndices[0];
      let bestDist = Infinity;

      for (const idx of visibleIndices) {
        const f = this.fishSprites[idx];
        const dist = Math.hypot(f.x - hookX, f.y - hookY);
        if (dist < bestDist) {
          bestDist = dist;
          targetIdx = idx;
        }
      }

      const caughtFish = this.fishSprites.splice(targetIdx, 1)[0];
      if (caughtFish) {
        this.triggerFishSplash(caughtFish.x, caughtFish.y, caughtFish);
      }
    } else if (this.fishSprites.length > 0) {
      const oldest = this.fishSprites[0];
      if (oldest && oldest.x > -40 && oldest.x < W + 40) {
        this.fishSprites.shift();
        this.triggerFishSplash(oldest.x, oldest.y, oldest);
      }
    }

    // Repõe o cardume com um novo peixe vindo da borda
    this.addSwimmingFish(fishIconId);
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

    // Se ultrapassar 10 peixes, remove o mais antigo espirrando gotas caso esteja visível
    if (this.fishSprites.length > 10) {
      const removed = this.fishSprites.shift();
      if (removed && removed.x > -20 && removed.x < this.canvas.width + 20) {
        this.triggerFishSplash(removed.x, removed.y, removed);
      }
    }
  }

  update() {
    this.time += 0.02;
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height, px = 4;
    ctx.clearRect(0, 0, W, H);

    if (this.isWorld2) {
      this._renderWorld2Ambience(ctx, W, H, px);
      return;
    }

    // Paletas por horário
    let wc, lightColor, lightAlpha, waveColor1, waveColor2;

    if (this.bloodMoonActive) {
      // Mar Sangrento — Vermelho carmesim profundo & atmosfera sinistra do Eclipse
      wc = ['#450a0a','#7f1d1d','#991b1b','#b91c1c','#7f1d1d','#450a0a','#2a0808','#140303'];
      lightColor = '#ef4444';
      lightAlpha = 0.12;
      waveColor1 = 'rgba(239, 68, 68, 0.8)';
      waveColor2 = 'rgba(185, 28, 28, 0.6)';
    } else if (this.timeOfDay === 'day') {
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

    // Fundo do Mundo 1: se houver fundo customizado no DOM, preserva a transparência
    const customBg = document.getElementById('world1-lake-bg');
    const hasCustomBg = customBg && !customBg.classList.contains('hidden');

    if (!hasCustomBg) {
      const bH = Math.ceil(H / wc.length);
      wc.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, i * bH, W, bH); });
    }

    // Raios de luz
    ctx.save(); ctx.globalAlpha = lightAlpha;
    for (let i = 0; i < 5; i++) {
      const lx = W * 0.2 + i * W * 0.15 + Math.sin(this.time + i) * 20;
      ctx.fillStyle = lightColor;
      ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + 40, H); ctx.lineTo(lx - 10, H); ctx.fill();
    }
    ctx.restore();

    if (!hasCustomBg) {
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
    }

    // Peixes
    this.fishSprites.forEach(f => {
      f.x += f.speed * f.dir; f.wobble += 0.05;
      if (f.x < -80) { f.x = W + 30; f.y = 60 + Math.random() * (H - 140); }
      this._drawMinifish(f, Math.sin(f.wobble) * 2);
    });

    // Gotas d'água, ondulações e efeitos de peixe pescado/sumindo
    this._updateAndDrawSplashEffects(ctx, px);

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
      if (this.bloodMoonActive) {
        ctx.fillStyle = 'rgba(239,68,68,0.7)'; ctx.fillRect(bx, by, px, px);
        ctx.fillStyle = 'rgba(254,202,202,0.6)'; ctx.fillRect(bx, by, 2, 2);
      } else {
        ctx.fillStyle = 'rgba(186,230,253,0.5)'; ctx.fillRect(bx, by, px, px);
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(bx, by, 2, 2);
      }
      return true;
    });
  }

  _renderWorld2Ambience(ctx, W, H, px) {
    const biome = this.world2Biome || 'recife_bioluminescente';

    // Spawn de bolhas profundas transparentes
    if (Math.random() < 0.08) {
      this.bubbles.push({
        x: 20 + Math.random() * (W - 40),
        y: H,
        speed: 0.6 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 0.4
      });
    }

    this.bubbles = this.bubbles.filter(b => {
      b.y -= b.speed;
      b.x += b.drift;
      if (b.y < 0) return false;
      const bx = Math.round(b.x / px) * px;
      const by = Math.round(b.y / px) * px;

      if (biome === 'fendas_vulcanicas') {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
        ctx.fillRect(bx, by, px, px);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.fillRect(bx, by, 2, 2);
      } else if (biome === 'cemiterio_naufragios') {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.65)';
        ctx.fillRect(bx, by, px, px);
        ctx.fillStyle = 'rgba(209, 250, 229, 0.8)';
        ctx.fillRect(bx, by, 2, 2);
      } else if (biome === 'zona_hadal') {
        ctx.fillStyle = 'rgba(192, 132, 252, 0.75)';
        ctx.fillRect(bx, by, px, px);
        ctx.fillStyle = 'rgba(243, 232, 255, 0.85)';
        ctx.fillRect(bx, by, 2, 2);
      } else {
        ctx.fillStyle = 'rgba(34, 211, 238, 0.65)';
        ctx.fillRect(bx, by, px, px);
        ctx.fillStyle = 'rgba(207, 250, 254, 0.8)';
        ctx.fillRect(bx, by, 2, 2);
      }
      return true;
    });

    // Fagulhas e partículas em suspensão sutis
    const t = this.time;
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const px_x = (Math.sin(t * 0.8 + i * 1.5) * 0.4 + 0.5) * W;
      const px_y = (Math.cos(t * 0.6 + i * 1.2) * 0.35 + 0.5) * H;
      const alpha = 0.3 + 0.4 * Math.sin(t * 2 + i);

      if (biome === 'fendas_vulcanicas') {
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
      } else if (biome === 'cemiterio_naufragios') {
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
      } else if (biome === 'zona_hadal') {
        ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
      }
      ctx.fillRect(Math.round(px_x / px) * px, Math.round(px_y / px) * px, px, px);
    }
    ctx.restore();

    // ── PEIXINHOS ABISSAIS NADANDO NA TELA NO MUNDO 2 ──
    if (this.fishSprites.length < 5) {
      const w2Icons = ['camarao_neon', 'peixe_lanterna', 'agua_viva_aurora', 'polvo_cintilante', 'moreia_brasa', 'arenque_fantasma', 'peixe_diabo'];
      const randIcon = w2Icons[Math.floor(Math.random() * w2Icons.length)];
      this.addSwimmingFish(randIcon);
    }

    this.fishSprites.forEach(f => {
      f.x += f.speed * f.dir;
      f.wobble += 0.05;
      if (f.x < -80) {
        f.x = W + 30;
        f.y = 45 + Math.random() * (H - 95);
      }
      this._drawMinifish(f, Math.sin(f.wobble) * 2);
    });

    // Gotas d'água, ondulações e efeitos de peixe pescado/sumindo
    this._updateAndDrawSplashEffects(ctx, px);

    // ── SONDA AUTÔNOMA SUBMARINA (DRONE ROV) PATRULHANDO O ABISMO ──
    if (this.diverActive) {
      const d = this.diver;
      d.x += d.speed * d.dir;
      d.wobble += 0.035;
      d.bubbleTimer++;

      // Propulsores de popa soltam bolhas periódicas
      if (d.bubbleTimer >= 22) {
        d.bubbleTimer = 0;
        const bx = d.x - 2;
        const by = d.y + Math.sin(d.wobble) * 3 + 14;
        this.bubbles.push({
          x: bx,
          y: by,
          speed: 0.4 + Math.random() * 0.4,
          drift: -0.5 - Math.random() * 0.3
        });
      }

      // Loop contínuo ao cruzar a tela
      if (d.x > W + 90) {
        d.x = -90;
        d.y = 45 + Math.random() * Math.max(40, H - 140);
      }

      this._drawAutonomousProbe(d, Math.sin(d.wobble) * 2.5);
    }
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

  _drawAutonomousProbe(d, wy) {
    const { ctx } = this;
    const s = 2.8; // Escala dos pixels do drone

    // Matriz 22 colunas x 11 linhas da Sonda Autônoma Submarina (estilo ROV retro pixel art)
    const m = [
      [0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
      [0,7,1,1,1,2,2,4,4,2,2,1,1,1,0,0,0,0,0,0,0,0],
      [7,7,1,2,2,2,2,4,4,2,2,2,2,1,1,1,0,0,0,0,0,0],
      [0,7,1,2,2,2,2,2,2,2,2,2,2,5,5,9,1,0,0,0,0,0],
      [0,0,1,2,2,2,2,2,2,2,2,2,2,5,6,9,1,0,0,0,0,0],
      [7,7,1,3,3,3,3,4,4,3,3,3,3,5,5,9,1,0,0,0,0,0],
      [0,7,1,1,1,3,3,4,4,3,3,1,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,0,0,1,8,8,1,0,1,8,8,1,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0]
    ];

    const isBeaconBlink = Math.sin(this.time * 8) > 0;
    const cm = {
      1: '#0f172a', // contorno escuro
      2: '#f59e0b', // casco amarelo submarino de pesquisa
      3: '#b45309', // sombra do casco
      4: '#f8fafc', // faixa branca de titânio
      5: '#0284c7', // visor de vidro
      6: '#38bdf8', // reflexo de vidro
      7: '#64748b', // propulsores de popa
      8: '#94a3b8', // garras mecânicas
      9: '#ffffff', // foco do farol
      10: isBeaconBlink ? '#ef4444' : '#7f1d1d' // sinalizador LED piscante no topo
    };

    const posX = Math.round(d.x);
    const posY = Math.round(d.y + wy);

    // Feixe de luz do farol projetado à frente da sonda em degraus de pixel
    const lightX = posX + 16 * s;
    const lightY = posY + 6 * s;
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    for (let step = 0; step < 9; step++) {
      const lx = Math.round(lightX + step * 7);
      const spread = Math.round(step * 3.2);
      ctx.fillRect(lx, Math.round(lightY - spread), 7, spread * 2 + 4);
    }
    // Núcleo brilhante do farol
    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    for (let step = 0; step < 4; step++) {
      const lx = Math.round(lightX + step * 6);
      const spread = Math.round(step * 1.5);
      ctx.fillRect(lx, Math.round(lightY - spread), 6, spread * 2 + 2);
    }
    ctx.restore();

    // Desenho dos blocos de pixel do corpo da sonda
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        const val = m[y][x];
        if (!val) continue;
        ctx.fillStyle = cm[val] || '#fff';
        ctx.fillRect(Math.round(posX + x * s), Math.round(posY + y * s), Math.ceil(s), Math.ceil(s));
      }
    }
  }

  _drawMinifish(f, wy) {
    const { ctx } = this; const s = f.size;
    const m = [[0,0,1,1,1,0,0,0],[0,1,2,2,2,1,0,0],[1,5,2,4,2,2,1,1],[0,1,3,3,2,2,1,1],[0,0,1,1,1,1,0,0]];
    let cm;
    if (this.bloodMoonActive) {
      // Peixinhos vermelhos brilhantes durante o Eclipse / Lua Sangrenta
      cm = {
        1: '#450a0a', // contorno vermelho escuro
        2: '#ef4444', // corpo vermelho carmesim vibrante
        3: '#991b1b', // ventre carmesim escuro
        4: '#fef08a', // olho dourado místico
        5: '#f87171'  // nadadeiras vermelho vivo
      };
    } else {
      cm = { 1: f.pal.outline, 2: f.pal.body, 3: f.pal.belly, 4: f.pal.eye, 5: f.pal.fin };
    }
    for (let y = 0; y < m.length; y++)
      for (let x = 0; x < m[y].length; x++) {
        if (!m[y][x]) continue;
        ctx.fillStyle = cm[m[y][x]] || '#fff';
        ctx.fillRect(Math.round(f.x) + x * s, Math.round(f.y + wy) + y * s, s, s);
      }
  }

  _updateAndDrawSplashEffects(ctx, px) {
    // 1. Ondulações (Ripples elípticos de água em perspectiva)
    this.splashRipples = this.splashRipples.filter(rip => {
      rip.life++;
      const progress = rip.life / rip.maxLife;
      if (progress >= 1) return false;
      const currentR = rip.r + (rip.maxR - rip.r) * progress;
      const alpha = (1 - progress) * 0.7;

      ctx.save();
      ctx.strokeStyle = rip.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(Math.round(rip.x), Math.round(rip.y), currentR, currentR * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return true;
    });

    // 2. Peixes sendo pescados (Flick para cima e Fade out)
    this.vanishingFish = this.vanishingFish.filter(vf => {
      vf.frame++;
      if (vf.frame >= vf.maxFrames) return false;
      vf.y += vf.vy;
      vf.wobble += 0.4;
      const alpha = 1 - (vf.frame / vf.maxFrames);

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      this._drawMinifish(vf, Math.sin(vf.wobble) * 2);
      ctx.restore();
      return true;
    });

    // 3. Gotas d'Água (Gotículas pixeladas com física de arco parabólico e reflexo)
    this.waterDrops = this.waterDrops.filter(drop => {
      drop.life++;
      if (drop.life >= drop.maxLife) return false;
      drop.x += drop.vx;
      drop.y += drop.vy;
      drop.vy += drop.gravity;

      const alpha = 1 - (drop.life / drop.maxLife);
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = drop.color;

      const sx = Math.round(drop.x);
      const sy = Math.round(drop.y);
      const s = drop.size;

      // Formato clássico de gota d'água pixelada:
      if (drop.vy < -0.8 && s >= 2) {
        // Gota em subida rápida (lágrima vertical com ponta fina de 1px)
        ctx.fillRect(sx, sy - 1, 1, 1);
        ctx.fillRect(sx - 1, sy, s, s);
      } else {
        // Gota arredondada
        ctx.fillRect(sx, sy, s, s);
      }

      // Brilho especular de reflexo solar/luz
      if (drop.sparkle && alpha > 0.35) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.restore();
      return true;
    });
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
  fishEye: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;" shape-rendering="crispEdges"><rect x="3" y="1" width="6" height="1" fill="#38bdf8"/><rect x="1" y="2" width="10" height="8" fill="#0284c7"/><rect x="0" y="4" width="12" height="4" fill="#0369a1"/><rect x="2" y="3" width="8" height="6" fill="#f8fafc"/><rect x="4" y="4" width="4" height="4" fill="#0f172a"/><rect x="5" y="4" width="2" height="2" fill="#38bdf8"/><rect x="6" y="5" width="1" height="1" fill="#ffffff"/><rect x="3" y="10" width="6" height="1" fill="#38bdf8"/></svg>`,
  magnet: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;" shape-rendering="crispEdges"><rect x="2" y="1" width="3" height="3" fill="#cbd5e1"/><rect x="7" y="1" width="3" height="3" fill="#38bdf8"/><rect x="2" y="4" width="3" height="4" fill="#dc2626"/><rect x="7" y="4" width="3" height="4" fill="#dc2626"/><rect x="3" y="8" width="6" height="2" fill="#dc2626"/><rect x="4" y="10" width="4" height="1" fill="#991b1b"/></svg>`,
  scenPonte: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;" shape-rendering="crispEdges"><rect x="0" y="6" width="12" height="2" fill="#64748b"/><rect x="1" y="3" width="2" height="7" fill="#334155"/><rect x="9" y="3" width="2" height="7" fill="#334155"/><rect x="3" y="4" width="6" height="1" fill="#94a3b8"/><rect x="0" y="8" width="12" height="4" fill="#0284c7"/></svg>`,
  scenPraia: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;" shape-rendering="crispEdges"><rect x="7" y="1" width="4" height="4" fill="#facc15"/><rect x="0" y="7" width="6" height="5" fill="#fde047"/><rect x="2" y="3" width="2" height="5" fill="#78350f"/><rect x="1" y="2" width="4" height="2" fill="#15803d"/><rect x="6" y="8" width="6" height="4" fill="#06b6d4"/></svg>`,
  scenFloresta: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;" shape-rendering="crispEdges"><rect x="4" y="1" width="4" height="2" fill="#15803d"/><rect x="3" y="3" width="6" height="2" fill="#16a34a"/><rect x="2" y="5" width="8" height="3" fill="#15803d"/><rect x="5" y="8" width="2" height="3" fill="#78350f"/><rect x="0" y="9" width="12" height="3" fill="#047857"/></svg>`,
  backpack: `<svg class="w-3.5 h-3.5 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;" shape-rendering="crispEdges"><rect x="2" y="2" width="8" height="9" fill="#92400e"/><rect x="3" y="1" width="6" height="2" fill="#78350f"/><rect x="4" y="4" width="4" height="3" fill="#b45309"/><rect x="5" y="5" width="2" height="2" fill="#facc15"/><rect x="2" y="8" width="8" height="1" fill="#78350f"/></svg>`,
  mysteryBox: `<svg class="w-4 h-4 inline-block align-middle shrink-0" viewBox="0 0 12 12" style="image-rendering:pixelated;" shape-rendering="crispEdges"><rect x="1" y="1" width="10" height="10" fill="#334155"/><rect x="2" y="2" width="8" height="8" fill="#1e293b"/><rect x="4" y="3" width="4" height="1" fill="#38bdf8"/><rect x="7" y="4" width="1" height="2" fill="#38bdf8"/><rect x="5" y="6" width="2" height="1" fill="#38bdf8"/><rect x="5" y="8" width="2" height="1" fill="#38bdf8"/></svg>`
};

/**
 * Retorna o SVG de visualização 100% pixel art escalonado do Ímã por Tier
 */
export function getMagnetSpriteSVG(tier = 1, size = 48) {
  switch (tier) {
    case 5: // Cósmico - 100% Pixel Art Escalonado
      return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="image-rendering:pixelated;" shape-rendering="crispEdges" class="drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">
        <!-- Núcleo de Singularidade Cósmica Pixelada -->
        <rect x="7" y="7" width="6" height="6" fill="#4c0519"/>
        <rect x="8" y="8" width="4" height="4" fill="#f43f5e"/>
        <rect x="9" y="9" width="2" height="2" fill="#ffffff" class="animate-ping"/>
        <!-- Anel de Fenda Dimensional Estelar -->
        <rect x="3" y="3" width="4" height="2" fill="#a855f7"/>
        <rect x="13" y="3" width="4" height="2" fill="#38bdf8"/>
        <rect x="2" y="5" width="2" height="10" fill="#e11d48"/>
        <rect x="16" y="5" width="2" height="10" fill="#e11d48"/>
        <rect x="4" y="15" width="4" height="2" fill="#e11d48"/>
        <rect x="12" y="15" width="4" height="2" fill="#e11d48"/>
        <rect x="7" y="17" width="6" height="2" fill="#9f1239"/>
        <!-- Pontas Cósmicas -->
        <rect x="2" y="3" width="2" height="3" fill="#38bdf8"/>
        <rect x="16" y="3" width="2" height="3" fill="#a855f7"/>
        <rect x="9" y="1" width="2" height="2" fill="#facc15"/>
      </svg>`;
    case 4: // Neodímio N52 - 100% Pixel Art Escalonado
      return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="image-rendering:pixelated;" shape-rendering="crispEdges" class="drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
        <rect x="3" y="2" width="5" height="4" fill="#ffffff"/>
        <rect x="12" y="2" width="5" height="4" fill="#0284c7"/>
        <rect x="3" y="6" width="5" height="7" fill="#ca8a04"/>
        <rect x="12" y="6" width="5" height="7" fill="#ca8a04"/>
        <rect x="4" y="6" width="3" height="6" fill="#facc15"/>
        <rect x="13" y="6" width="3" height="6" fill="#facc15"/>
        <!-- Base de ferradura em degraus de pixels -->
        <rect x="4" y="13" width="5" height="2" fill="#ca8a04"/>
        <rect x="11" y="13" width="5" height="2" fill="#ca8a04"/>
        <rect x="5" y="15" width="10" height="2" fill="#ca8a04"/>
        <rect x="6" y="17" width="8" height="2" fill="#a16207"/>
        <rect x="6" y="15" width="8" height="1" fill="#fef08a"/>
      </svg>`;
    case 3: // Eletroímã Industrial - 100% Pixel Art Escalonado
      return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="image-rendering:pixelated;" shape-rendering="crispEdges" class="drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]">
        <!-- Chassi de aço escuro -->
        <rect x="6" y="1" width="8" height="18" fill="#334155"/>
        <rect x="7" y="2" width="6" height="16" fill="#475569"/>
        <!-- Fios de cobre em bobina escalonada -->
        <rect x="5" y="4" width="10" height="2" fill="#b45309"/>
        <rect x="6" y="4" width="8" height="1" fill="#f59e0b"/>
        <rect x="5" y="7" width="10" height="2" fill="#b45309"/>
        <rect x="6" y="7" width="8" height="1" fill="#f59e0b"/>
        <rect x="5" y="10" width="10" height="2" fill="#b45309"/>
        <rect x="6" y="10" width="8" height="1" fill="#f59e0b"/>
        <rect x="5" y="13" width="10" height="2" fill="#b45309"/>
        <rect x="6" y="13" width="8" height="1" fill="#f59e0b"/>
        <!-- Terminal e indicador LED -->
        <rect x="4" y="16" width="12" height="3" fill="#7e22ce"/>
        <rect x="9" y="1" width="2" height="2" fill="#ef4444" class="animate-pulse"/>
      </svg>`;
    case 2: // Ferradura AlNiCo - 100% Pixel Art Escalonado
      return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="image-rendering:pixelated;" shape-rendering="crispEdges" class="drop-shadow-[0_0_4px_rgba(56,189,248,0.4)]">
        <!-- Pontas do ímã (Azul e Prata) -->
        <rect x="3" y="2" width="4" height="4" fill="#cbd5e1"/>
        <rect x="13" y="2" width="4" height="4" fill="#38bdf8"/>
        <!-- Pernas da ferradura em vermelho -->
        <rect x="3" y="6" width="4" height="7" fill="#dc2626"/>
        <rect x="13" y="6" width="4" height="7" fill="#dc2626"/>
        <rect x="4" y="6" width="2" height="6" fill="#ef4444"/>
        <rect x="14" y="6" width="2" height="6" fill="#ef4444"/>
        <!-- Degraus da curva inferior de pixels -->
        <rect x="4" y="13" width="4" height="2" fill="#dc2626"/>
        <rect x="12" y="13" width="4" height="2" fill="#dc2626"/>
        <rect x="5" y="15" width="10" height="2" fill="#dc2626"/>
        <rect x="6" y="17" width="8" height="2" fill="#991b1b"/>
      </svg>`;
    case 1: // Ferrite Enferrujado - 100% Pixel Art Escalonado
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" style="image-rendering:pixelated;" shape-rendering="crispEdges">
        <!-- Pontas enferrujadas -->
        <rect x="3" y="3" width="4" height="4" fill="#78350f"/>
        <rect x="4" y="3" width="2" height="3" fill="#b45309"/>
        <rect x="13" y="3" width="4" height="4" fill="#64748b"/>
        <rect x="14" y="3" width="2" height="3" fill="#94a3b8"/>
        <!-- Pernas de ferro escurecido com ferrugem -->
        <rect x="3" y="7" width="4" height="6" fill="#475569"/>
        <rect x="13" y="7" width="4" height="6" fill="#475569"/>
        <rect x="3" y="9" width="2" height="2" fill="#92400e"/>
        <rect x="15" y="8" width="2" height="2" fill="#78350f"/>
        <!-- Degraus da base de ferro em blocos -->
        <rect x="4" y="13" width="4" height="2" fill="#334155"/>
        <rect x="12" y="13" width="4" height="2" fill="#334155"/>
        <rect x="5" y="15" width="10" height="2" fill="#334155"/>
        <rect x="6" y="17" width="8" height="2" fill="#1e293b"/>
      </svg>`;
  }
}

/**
 * Retorna o SVG de cada um dos 21 Itens/Minérios da Pesca Magnética em 100% Pixel Art
 */
export function getMagnetItemSpriteSVG(itemId, size = 24) {
  const open = `<svg width="${size}" height="${size}" viewBox="0 0 16 16" style="image-rendering:pixelated;" shape-rendering="crispEdges" class="inline-block shrink-0">`;
  const close = `</svg>`;

  switch (itemId) {
    // ═══ CENÁRIO 1: PONTE ═══
    case 'lata_vintage':
      return `${open}
        <rect x="5" y="2" width="6" height="2" fill="#cbd5e1"/>
        <rect x="7" y="1" width="2" height="1" fill="#f8fafc"/>
        <rect x="4" y="4" width="8" height="9" fill="#dc2626"/>
        <rect x="4" y="4" width="1" height="9" fill="#ef4444"/>
        <rect x="11" y="4" width="1" height="9" fill="#991b1b"/>
        <rect x="4" y="7" width="8" height="2" fill="#f8fafc"/>
        <rect x="5" y="8" width="6" height="1" fill="#cbd5e1"/>
        <rect x="5" y="13" width="6" height="1" fill="#64748b"/>
        <rect x="8" y="5" width="1" height="1" fill="#78350f"/>
        <rect x="5" y="10" width="2" height="1" fill="#92400e"/>
      ${close}`;

    case 'chaveiro_antigo':
      return `${open}
        <rect x="4" y="2" width="6" height="5" fill="#b45309"/>
        <rect x="5" y="3" width="4" height="3" fill="#0f172a"/>
        <rect x="4" y="7" width="2" height="7" fill="#d97706"/>
        <rect x="2" y="11" width="2" height="1" fill="#d97706"/>
        <rect x="2" y="13" width="2" height="1" fill="#d97706"/>
        <rect x="8" y="6" width="2" height="8" fill="#f59e0b"/>
        <rect x="10" y="10" width="2" height="1" fill="#f59e0b"/>
        <rect x="10" y="12" width="3" height="1" fill="#f59e0b"/>
      ${close}`;

    case 'sinal_transito':
      return `${open}
        <rect x="4" y="1" width="8" height="10" fill="#dc2626"/>
        <rect x="3" y="2" width="10" height="8" fill="#dc2626"/>
        <rect x="2" y="3" width="12" height="6" fill="#dc2626"/>
        <rect x="4" y="2" width="8" height="1" fill="#f8fafc"/>
        <rect x="4" y="9" width="8" height="1" fill="#f8fafc"/>
        <rect x="3" y="3" width="1" height="6" fill="#f8fafc"/>
        <rect x="12" y="3" width="1" height="6" fill="#f8fafc"/>
        <rect x="5" y="5" width="6" height="2" fill="#ffffff"/>
        <rect x="7" y="11" width="2" height="4" fill="#64748b"/>
      ${close}`;

    case 'bicicleta_retro':
      return `${open}
        <rect x="1" y="8" width="4" height="4" fill="#64748b"/>
        <rect x="2" y="9" width="2" height="2" fill="#0f172a"/>
        <rect x="11" y="8" width="4" height="4" fill="#64748b"/>
        <rect x="12" y="9" width="2" height="2" fill="#0f172a"/>
        <rect x="3" y="9" width="5" height="1" fill="#ef4444"/>
        <rect x="7" y="5" width="1" height="5" fill="#ef4444"/>
        <rect x="5" y="7" width="4" height="1" fill="#ef4444"/>
        <rect x="9" y="5" width="4" height="1" fill="#ef4444"/>
        <rect x="12" y="5" width="1" height="4" fill="#ef4444"/>
        <rect x="6" y="4" width="3" height="1" fill="#1e293b"/>
        <rect x="11" y="4" width="3" height="1" fill="#cbd5e1"/>
        <rect x="13" y="3" width="1" height="2" fill="#1e293b"/>
      ${close}`;

    case 'carrinho_mercado':
      return `${open}
        <rect x="3" y="3" width="10" height="7" fill="#94a3b8"/>
        <rect x="4" y="4" width="8" height="5" fill="#0f172a"/>
        <rect x="6" y="4" width="1" height="5" fill="#64748b"/>
        <rect x="9" y="4" width="1" height="5" fill="#64748b"/>
        <rect x="4" y="6" width="8" height="1" fill="#64748b"/>
        <rect x="1" y="2" width="3" height="1" fill="#0284c7"/>
        <rect x="3" y="3" width="1" height="2" fill="#64748b"/>
        <rect x="4" y="10" width="8" height="1" fill="#64748b"/>
        <rect x="3" y="11" width="2" height="2" fill="#334155"/>
        <rect x="9" y="11" width="2" height="2" fill="#334155"/>
      ${close}`;

    case 'celular_flip':
      return `${open}
        <rect x="5" y="1" width="6" height="6" fill="#1e293b"/>
        <rect x="6" y="2" width="4" height="4" fill="#38bdf8"/>
        <rect x="5" y="7" width="6" height="1" fill="#0f172a"/>
        <rect x="5" y="8" width="6" height="7" fill="#334155"/>
        <rect x="6" y="9" width="4" height="4" fill="#64748b"/>
        <rect x="7" y="10" width="2" height="2" fill="#cbd5e1"/>
        <rect x="10" y="0" width="1" height="3" fill="#64748b"/>
      ${close}`;

    case 'cofre_trancado':
      return `${open}
        <rect x="2" y="2" width="12" height="12" fill="#1e293b"/>
        <rect x="3" y="3" width="10" height="10" fill="#334155"/>
        <rect x="4" y="4" width="8" height="8" fill="#1e293b"/>
        <rect x="6" y="6" width="4" height="4" fill="#d97706"/>
        <rect x="7" y="7" width="2" height="2" fill="#facc15"/>
        <rect x="11" y="7" width="1" height="2" fill="#cbd5e1"/>
        <rect x="3" y="4" width="1" height="2" fill="#64748b"/>
        <rect x="3" y="10" width="1" height="2" fill="#64748b"/>
      ${close}`;

    // ═══ CENÁRIO 2: PRAIA ═══
    case 'moedas_estrangeiras':
      return `${open}
        <rect x="3" y="9" width="10" height="3" fill="#ca8a04"/>
        <rect x="4" y="8" width="8" height="2" fill="#facc15"/>
        <rect x="4" y="6" width="8" height="3" fill="#ca8a04"/>
        <rect x="5" y="5" width="6" height="2" fill="#fde047"/>
        <rect x="5" y="3" width="7" height="3" fill="#eab308"/>
        <rect x="6" y="2" width="5" height="2" fill="#fef08a"/>
        <rect x="8" y="3" width="1" height="1" fill="#b45309"/>
      ${close}`;

    case 'protetor_vintage':
      return `${open}
        <rect x="6" y="2" width="4" height="2" fill="#f8fafc"/>
        <rect x="5" y="4" width="6" height="10" fill="#ea580c"/>
        <rect x="4" y="5" width="8" height="8" fill="#c2410c"/>
        <rect x="5" y="7" width="6" height="2" fill="#facc15"/>
        <rect x="5" y="10" width="6" height="1" fill="#fde047"/>
        <rect x="6" y="8" width="2" height="1" fill="#78350f"/>
      ${close}`;

    case 'oculos_sol':
      return `${open}
        <rect x="1" y="5" width="6" height="5" fill="#ca8a04"/>
        <rect x="2" y="6" width="4" height="3" fill="#090d16"/>
        <rect x="3" y="6" width="1" height="1" fill="#38bdf8"/>
        <rect x="9" y="5" width="6" height="5" fill="#ca8a04"/>
        <rect x="10" y="6" width="4" height="3" fill="#090d16"/>
        <rect x="11" y="6" width="1" height="1" fill="#38bdf8"/>
        <rect x="7" y="5" width="2" height="1" fill="#eab308"/>
        <rect x="0" y="4" width="2" height="1" fill="#a16207"/>
        <rect x="14" y="4" width="2" height="1" fill="#a16207"/>
      ${close}`;

    case 'camera_gopro':
      return `${open}
        <rect x="3" y="3" width="10" height="9" fill="#0f172a"/>
        <rect x="2" y="2" width="12" height="11" fill="none" stroke="#38bdf8" stroke-width="1"/>
        <rect x="5" y="5" width="6" height="5" fill="#334155"/>
        <rect x="6" y="6" width="4" height="3" fill="#0284c7"/>
        <rect x="7" y="7" width="2" height="1" fill="#38bdf8"/>
        <rect x="11" y="4" width="1" height="1" fill="#ef4444" class="animate-pulse"/>
      ${close}`;

    case 'relogio_ouro':
      return `${open}
        <rect x="6" y="1" width="4" height="3" fill="#ca8a04"/>
        <rect x="6" y="12" width="4" height="3" fill="#ca8a04"/>
        <rect x="4" y="4" width="8" height="8" fill="#eab308"/>
        <rect x="5" y="5" width="6" height="6" fill="#0284c7"/>
        <rect x="7" y="6" width="1" height="3" fill="#ffffff"/>
        <rect x="8" y="7" width="2" height="1" fill="#ffffff"/>
        <rect x="12" y="7" width="1" height="2" fill="#fde047"/>
      ${close}`;

    case 'alianca_diamante':
      return `${open}
        <rect x="4" y="6" width="8" height="8" fill="#e2e8f0"/>
        <rect x="6" y="8" width="4" height="4" fill="#0f172a"/>
        <rect x="6" y="4" width="4" height="2" fill="#cbd5e1"/>
        <rect x="6" y="2" width="4" height="3" fill="#38bdf8"/>
        <rect x="7" y="1" width="2" height="1" fill="#ffffff"/>
        <rect x="7" y="3" width="2" height="1" fill="#ffffff"/>
        <rect x="11" y="1" width="1" height="1" fill="#38bdf8"/>
      ${close}`;

    case 'colar_perolas':
      return `${open}
        <rect x="7" y="2" width="2" height="2" fill="#ffffff"/>
        <rect x="4" y="4" width="2" height="2" fill="#334155"/>
        <rect x="10" y="4" width="2" height="2" fill="#334155"/>
        <rect x="2" y="7" width="3" height="3" fill="#1e293b"/>
        <rect x="11" y="7" width="3" height="3" fill="#1e293b"/>
        <rect x="3" y="10" width="3" height="3" fill="#334155"/>
        <rect x="10" y="10" width="3" height="3" fill="#334155"/>
        <rect x="6" y="11" width="4" height="4" fill="#090d16"/>
        <rect x="7" y="12" width="2" height="2" fill="#a855f7"/>
      ${close}`;

    // ═══ CENÁRIO 3: FLORESTA ═══
    case 'minerio_ferro':
      return `${open}
        <rect x="3" y="4" width="10" height="9" fill="#334155"/>
        <rect x="4" y="3" width="8" height="11" fill="#475569"/>
        <rect x="2" y="6" width="12" height="5" fill="#1e293b"/>
        <rect x="5" y="5" width="2" height="2" fill="#cbd5e1"/>
        <rect x="9" y="6" width="3" height="2" fill="#f8fafc"/>
        <rect x="6" y="9" width="3" height="2" fill="#e2e8f0"/>
        <rect x="10" y="10" width="2" height="1" fill="#94a3b8"/>
      ${close}`;

    case 'pedra_pirita':
      return `${open}
        <rect x="4" y="4" width="5" height="5" fill="#ca8a04"/>
        <rect x="5" y="3" width="4" height="4" fill="#facc15"/>
        <rect x="5" y="4" width="2" height="2" fill="#fef08a"/>
        <rect x="7" y="7" width="6" height="6" fill="#b45309"/>
        <rect x="8" y="6" width="5" height="5" fill="#eab308"/>
        <rect x="9" y="7" width="2" height="2" fill="#fde047"/>
        <rect x="2" y="8" width="5" height="5" fill="#a16207"/>
        <rect x="3" y="7" width="4" height="4" fill="#facc15"/>
      ${close}`;

    case 'geodo_ametista':
      return `${open}
        <rect x="3" y="3" width="10" height="10" fill="#334155"/>
        <rect x="2" y="5" width="12" height="6" fill="#1e293b"/>
        <rect x="5" y="5" width="6" height="6" fill="#0f172a"/>
        <rect x="5" y="5" width="3" height="3" fill="#a855f7"/>
        <rect x="6" y="6" width="1" height="1" fill="#e9d5ff"/>
        <rect x="8" y="5" width="3" height="2" fill="#7e22ce"/>
        <rect x="9" y="6" width="1" height="1" fill="#c084fc"/>
        <rect x="6" y="8" width="4" height="3" fill="#9333ea"/>
        <rect x="7" y="9" width="2" height="1" fill="#f3e8ff"/>
      ${close}`;

    case 'quartzo_prismatico':
      return `${open}
        <rect x="7" y="1" width="2" height="13" fill="#38bdf8"/>
        <rect x="6" y="3" width="4" height="10" fill="#06b6d4"/>
        <rect x="7" y="2" width="2" height="3" fill="#ffffff"/>
        <rect x="4" y="5" width="3" height="8" fill="#f43f5e"/>
        <rect x="4" y="6" width="1" height="4" fill="#fbcfe8"/>
        <rect x="10" y="6" width="3" height="7" fill="#facc15"/>
        <rect x="11" y="7" width="1" height="3" fill="#fef08a"/>
        <rect x="4" y="12" width="8" height="2" fill="#475569"/>
      ${close}`;

    case 'fossil_trilobita':
      return `${open}
        <rect x="3" y="3" width="10" height="10" fill="#cbd5e1"/>
        <rect x="2" y="4" width="12" height="8" fill="#94a3b8"/>
        <rect x="4" y="2" width="8" height="12" fill="#e2e8f0"/>
        <rect x="6" y="4" width="4" height="2" fill="#78350f"/>
        <rect x="5" y="5" width="6" height="1" fill="#451a03"/>
        <rect x="6" y="6" width="4" height="1" fill="#78350f"/>
        <rect x="5" y="7" width="6" height="1" fill="#451a03"/>
        <rect x="6" y="8" width="4" height="1" fill="#78350f"/>
        <rect x="5" y="9" width="6" height="1" fill="#451a03"/>
        <rect x="7" y="10" width="2" height="1" fill="#78350f"/>
      ${close}`;

    case 'meteorito_espacial':
      return `${open}
        <rect x="3" y="3" width="10" height="10" fill="#18181b"/>
        <rect x="2" y="5" width="12" height="6" fill="#09090b"/>
        <rect x="5" y="2" width="6" height="12" fill="#27272a"/>
        <rect x="5" y="5" width="2" height="1" fill="#ef4444"/>
        <rect x="6" y="6" width="2" height="1" fill="#f97316"/>
        <rect x="9" y="8" width="2" height="2" fill="#facc15"/>
        <rect x="6" y="10" width="3" height="1" fill="#ea580c"/>
        <rect x="4" y="2" width="1" height="1" fill="#fbbf24"/>
        <rect x="11" y="4" width="1" height="1" fill="#fb923c"/>
      ${close}`;

    case 'cristal_cosmico':
      return `${open}
        <rect x="7" y="1" width="2" height="14" fill="#a855f7"/>
        <rect x="5" y="3" width="6" height="10" fill="#d946ef"/>
        <rect x="3" y="5" width="10" height="6" fill="#ec4899"/>
        <rect x="6" y="4" width="4" height="8" fill="#f472b6"/>
        <rect x="7" y="5" width="2" height="6" fill="#ffffff"/>
        <rect x="1" y="2" width="2" height="2" fill="#38bdf8"/>
        <rect x="13" y="3" width="2" height="2" fill="#facc15"/>
        <rect x="2" y="12" width="2" height="2" fill="#facc15"/>
        <rect x="13" y="11" width="2" height="2" fill="#38bdf8"/>
      ${close}`;

    // ═══ RECEITAS DA FORJA ═══
    case 'linha_reforcada':
      return `${open}
        <rect x="4" y="2" width="8" height="2" fill="#78350f"/>
        <rect x="4" y="12" width="8" height="2" fill="#78350f"/>
        <rect x="5" y="4" width="6" height="8" fill="#94a3b8"/>
        <rect x="6" y="4" width="4" height="8" fill="#cbd5e1"/>
        <line x1="5" y1="6" x2="11" y2="6" stroke="#38bdf8" stroke-width="1"/>
        <line x1="5" y1="9" x2="11" y2="9" stroke="#38bdf8" stroke-width="1"/>
      ${close}`;

    case 'carretel_precisao':
      return `${open}
        <rect x="3" y="3" width="10" height="10" fill="#ca8a04"/>
        <rect x="5" y="5" width="6" height="6" fill="#facc15"/>
        <rect x="7" y="2" width="2" height="4" fill="#475569"/>
        <rect x="9" y="2" width="3" height="2" fill="#1e293b"/>
        <rect x="7" y="7" width="2" height="2" fill="#0f172a"/>
      ${close}`;

    case 'propulsor_mergulhador':
      return `${open}
        <rect x="4" y="5" width="8" height="6" fill="#eab308"/>
        <rect x="3" y="6" width="10" height="4" fill="#facc15"/>
        <rect x="1" y="4" width="2" height="8" fill="#334155"/>
        <rect x="12" y="7" width="3" height="2" fill="#0284c7"/>
        <rect x="6" y="3" width="4" height="2" fill="#1e293b"/>
      ${close}`;

    case 'gazua_mestre':
      return `${open}
        <rect x="3" y="2" width="5" height="5" fill="#e2e8f0"/>
        <rect x="4" y="3" width="3" height="3" fill="#0f172a"/>
        <rect x="7" y="4" width="7" height="2" fill="#cbd5e1"/>
        <rect x="12" y="6" width="2" height="2" fill="#cbd5e1"/>
        <rect x="10" y="6" width="1" height="1" fill="#cbd5e1"/>
      ${close}`;

    case 'antena_ressonancia':
      return `${open}
        <rect x="2" y="8" width="6" height="6" fill="#475569"/>
        <rect x="3" y="7" width="6" height="6" fill="#94a3b8"/>
        <rect x="8" y="3" width="2" height="6" fill="#38bdf8"/>
        <rect x="9" y="2" width="2" height="2" fill="#facc15" class="animate-pulse"/>
        <rect x="11" y="1" width="2" height="2" fill="#a855f7"/>
      ${close}`;

    // Fallback padrão: Caixa surpresa retrô
    default:
      return `${open}
        <rect x="2" y="2" width="12" height="12" fill="#334155"/>
        <rect x="3" y="3" width="10" height="10" fill="#1e293b"/>
        <rect x="6" y="4" width="4" height="2" fill="#facc15"/>
        <rect x="8" y="6" width="2" height="2" fill="#facc15"/>
        <rect x="6" y="8" width="2" height="2" fill="#facc15"/>
        <rect x="6" y="11" width="2" height="1" fill="#facc15"/>
      ${close}`;
  }
}

// ═══════════════════════════════════════════════
// POSICIONAMENTO PRECISO DA LINHA DE PESCA
// ═══════════════════════════════════════════════
export function updateFishingLine() {
  const lake = document.getElementById('fishing-lake-area');
  const line = document.getElementById('fishing-line-path');
  const hookRig = document.getElementById('hook-rig-element');
  const hookImg = document.getElementById('hook-bait-img');
  const btnPescar = document.getElementById('btn-pescar-main');
  if (!lake || !line) return;

  const lakeRect = lake.getBoundingClientRect();
  if (lakeRect.width === 0 || lakeRect.height === 0) return;

  let targetX = 50;

  if (btnPescar) {
    const btnRect = btnPescar.getBoundingClientRect();
    const btnCenterX = (btnRect.left + btnRect.width / 2) - lakeRect.left;
    const btnTopY = btnRect.top - lakeRect.top;

    targetX = Math.min(Math.max((btnCenterX / lakeRect.width) * 100, 35), 65);
  }

  // Posicionamento centralizado no meio da tela aquática (solicitado pelo usuário)
  const rigHeight = hookImg && hookImg.offsetHeight > 20 ? hookImg.offsetHeight : 80;
  // O centro visual do anzol/bóia fica em 46% da altura do lago, conferindo destaque no meio da tela
  const idealCenterPx = lakeRect.height * 0.46;
  const targetTopPx = idealCenterPx - (rigHeight * 0.4);
  const targetY = Math.min(Math.max((targetTopPx / lakeRect.height) * 100, 15), 65);

  // Ondulação orgânica suave da linha descendo da superfície
  const ctrl1X = targetX - 0.4;
  const ctrl1Y = targetY * 0.35;
  const ctrl2X = targetX + 0.4;
  const ctrl2Y = targetY * 0.70;

  line.setAttribute('d', `M ${targetX.toFixed(2)} 0 C ${ctrl1X.toFixed(2)} ${ctrl1Y.toFixed(2)}, ${ctrl2X.toFixed(2)} ${ctrl2Y.toFixed(2)}, ${targetX.toFixed(2)} ${targetY.toFixed(2)}`);

  if (hookRig) {
    hookRig.style.left = `${targetX.toFixed(2)}%`;
    hookRig.style.top = `${targetY.toFixed(2)}%`;
  }
}

export { PALETTES };
