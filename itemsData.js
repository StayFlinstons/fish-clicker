// Loja: varas (profundidade e força), iscas (buffs) e upgrades.

// Varas: só profundidade e força. depthLayer = camada mais funda que a vara alcança
// (DEPTH_LAYERS em depthData.js); maxWeight = kg que aguenta sem risco de a linha arrebentar.
export const RODS = [
  { id:'vara_bambu',             name:'Vara de Bambu',               price:0,        depthLayer:1, maxWeight:5,     icon:'rod', desc:'Rústica e fraca. Seu humilde começo no rio.', unlocked:true },
  { id:'vara_fibra',             name:'Vara de Fibra de Vidro',      price:300,      depthLayer:1, maxWeight:30,    icon:'rod', desc:'Mais flexível, aguenta os peixes maiores do rio.', unlocked:false },
  { id:'vara_carbono',           name:'Vara de Carbono',             price:1500,     depthLayer:2, maxWeight:80,    icon:'rod', desc:'Leve e comprida: alcança o mar aberto da Zona do Sol.', unlocked:false },
  { id:'vara_aco',               name:'Vara de Aço Temperado',       price:5000,     depthLayer:2, maxWeight:300,   icon:'rod', desc:'Muito forte, segura tubarões e espadartes.', unlocked:false },
  { id:'vara_dourada',           name:'Vara Dourada do Mestre',      price:18000,    depthLayer:3, maxWeight:500,   icon:'rod', desc:'Linha longa banhada a ouro que desce até a Zona do Crepúsculo.', unlocked:false },
  { id:'vara_titanio',           name:'Vara de Titânio Turbo',       price:65000,    depthLayer:3, maxWeight:1000,  icon:'rod', desc:'Tecnologia militar aplicada à pesca.', unlocked:false },
  { id:'vara_cosmica',           name:'Vara Cósmica Astral',         price:250000,   depthLayer:4, maxWeight:1500,  icon:'rod', desc:'Imbuída com poeira estelar, desce até a Zona da Meia-Noite.', unlocked:false },
  { id:'vara_travessia',         name:'Vara da Travessia Astral',    price:600000,   depthLayer:4, maxWeight:2500,  icon:'rod', desc:'Artefato lendário que desperta o Portal e o Altar das 15 Almas.', unlocked:false },
  { id:'vara_arpao_basico',      name:'Arpão de Mergulho',           price:1500000,  depthLayer:5, maxWeight:3500,  icon:'rod', desc:'Cabo pressurizado que chega à Planície Abissal.', unlocked:false },
  { id:'vara_pneumatica',        name:'Lança-Cabos Pneumático',      price:4000000,  depthLayer:5, maxWeight:5000,  icon:'rod', desc:'Dispara cabos de aço tensionados por gás comprimido.', unlocked:false },
  { id:'vara_liga_titanio',      name:'Vara de Titânio Hidrotermal', price:12000000, depthLayer:6, maxWeight:7000,  icon:'rod', desc:'Forjada nas fontes hidrotermais, resiste à pressão da Fossa Hadal.', unlocked:false },
  { id:'vara_tridente_poseidon', name:'Tridente do Soberano Abissal',price:35000000, depthLayer:6, maxWeight:10000, icon:'rod', desc:'Relíquia do fundo do mar que domina as criaturas titânicas.', unlocked:false }
];

export function isCosmicOrHigherRod(rodId) {
  const cosmicTierIdx = RODS.findIndex(r => r.id === 'vara_cosmica');
  if (cosmicTierIdx === -1) return false;
  const currentIdx = RODS.findIndex(r => r.id === rodId);
  return currentIdx >= cosmicTierIdx;
}

// Iscas: todos os buffs de equipamento (Sorte, Vel. Pesca, Pesca Dupla), em fração.
export const BAITS = [
  { id:'minhoca',               name:'Minhoca da Terra',               price:0,        tier:1,  luckBonus:0,    speedBonus:0,    doubleCatchBonus:0,    icon:'bait', desc:'Isca básica para peixes comuns.', unlocked:true },
  { id:'camarao',               name:'Camarão Fresco',                 price:350,      tier:2,  luckBonus:0.03, speedBonus:0.05, doubleCatchBonus:0.02, icon:'bait', desc:'Aroma que atrai peixes um pouco melhores.', unlocked:false },
  { id:'isca_brilhante',        name:'Isca Neon Glow',                 price:2000,     tier:3,  luckBonus:0.07, speedBonus:0.10, doubleCatchBonus:0.05, icon:'bait', desc:'Brilha no escuro, atraindo raros.', unlocked:false },
  { id:'queijo_mistico',        name:'Massa Mística Fermentada',       price:12000,    tier:4,  luckBonus:0.13, speedBonus:0.16, doubleCatchBonus:0.08, icon:'bait', desc:'Fórmula secreta com ervas arcanas.', unlocked:false },
  { id:'ouro_liquido',          name:'Gota de Éter Divino',            price:80000,    tier:5,  luckBonus:0.22, speedBonus:0.24, doubleCatchBonus:0.12, icon:'bait', desc:'Vibra na frequência dos deuses aquáticos.', unlocked:false },
  { id:'essencia_travessia',    name:'Essência do Vórtice Dimensional',price:250000,   tier:6,  luckBonus:0.32, speedBonus:0.32, doubleCatchBonus:0.16, icon:'bait', desc:'Exala névoa dimensional. Requisito para despertar o Portal.', unlocked:false },
  { id:'isca_plankton_neon',    name:'Plâncton Neon Luminoso',         price:700000,   tier:7,  luckBonus:0.45, speedBonus:0.40, doubleCatchBonus:0.20, icon:'bait', desc:'Bioluminescência que atrai cardumes das profundezas.', unlocked:false },
  { id:'isca_camarao_brasa',    name:'Essência de Enxofre Hidrotermal',price:2000000,  tier:8,  luckBonus:0.60, speedBonus:0.48, doubleCatchBonus:0.25, icon:'bait', desc:'Odor mineral das fontes hidrotermais.', unlocked:false },
  { id:'isca_alga_espectral',   name:'Alga Espectral Fosforescente',   price:6000000,  tier:9,  luckBonus:0.80, speedBonus:0.56, doubleCatchBonus:0.30, icon:'bait', desc:'Colhida nos mastros dos galeões naufragados.', unlocked:false },
  { id:'isca_cristal_hadal',    name:'Cristal de Pressão Hadal',       price:20000000, tier:10, luckBonus:1.05, speedBonus:0.65, doubleCatchBonus:0.36, icon:'bait', desc:'Frequências ultrassônicas que atraem os leviatãs da fossa.', unlocked:false },
  { id:'isca_kraken_ancestral', name:'Isca do Kraken Ancestral',       price:0,        tier:11, luckBonus:0.90, speedBonus:0.50, doubleCatchBonus:0.45, icon:'bait', unbuyable:true, desc:'Forjada no Altar com o sacrifício de 15 criaturas lendárias. Atrai o terror primordial.', unlocked:false }
];

export const UPGRADES = [
  {
    id: 'balde',
    name: 'Balde de Madeira Reforçado',
    basePrice: 80,
    priceMultiplier: 1.50,
    level: 0,
    maxLevel: 15,
    icon: 'balde',
    desc: 'Aumenta o espaço do balde para pescar mais antes de vender.',
    getValue: (lvl) => 10 + lvl * 3 // +3 slots por nível (10 → 55)
  },
  {
    id: 'auto_pescador',
    name: 'Mergulhador Amigo',
    basePrice: 400,
    priceMultiplier: 1.70,
    level: 0,
    maxLevel: 12,
    icon: 'auto_pescador',
    desc: 'Mergulha e pesca peixes sozinho a cada poucos segundos.',
    getValue: (lvl) => lvl > 0 ? Math.max(2.0, 8.0 - (lvl * 0.5)) : 0 // 7.5s → 2.0s
  },
  {
    id: 'aquario_cap',
    name: 'Expansão do Aquário',
    basePrice: 800,
    priceMultiplier: 1.65,
    level: 0,
    maxLevel: 12,
    icon: 'aquario_cap',
    desc: 'Aumenta vagas no aquário. Apenas peixes guardados aqui ativam seus buffs!',
    getValue: (lvl) => 3 + lvl * 2 // 3 → 27 slots
  },
  {
    id: 'auto_vendedor',
    name: 'Peixaria Automática',
    basePrice: 1200,
    priceMultiplier: 2.0,
    level: 0,
    maxLevel: 5,
    icon: 'auto_vendedor',
    desc: 'Vende peixes filtrados a cada 1 min (-10s por nível).',
    getValue: (lvl) => lvl > 0 ? Math.max(15, 70 - lvl * 10) : 0 // lvl 1: 60s, lvl 2: 50s, lvl 3: 40s, lvl 4: 30s, lvl 5: 20s
  },
  {
    id: 'ima_dourado',
    name: 'Ímã Dourado',
    basePrice: 3000,
    priceMultiplier: 2.2,
    level: 0,
    maxLevel: 5,
    icon: 'ima_dourado',
    desc: 'Coleta o Peixe Dourado automaticamente com recarga (5m no Nv.1 até 2m no Nv.5).',
    getValue: (lvl) => {
      if (lvl <= 0) return 0;
      if (lvl === 1) return 300; // 5 min
      if (lvl === 2) return 240; // 4 min
      if (lvl === 3) return 180; // 3 min
      if (lvl === 4) return 150; // 2.5 min
      return 120; // 2 min no Nv. 5
    }
  },
  {
    id: 'carretilha',
    name: 'Carretilha de Arrasto',
    basePrice: 1500,
    priceMultiplier: 1.9,
    level: 0,
    maxLevel: 10,
    icon: 'carretilha',
    desc: 'Freio de arrasto que cansa o peixe: chance de segurar os que passam do limite de kg da vara.',
    getValue: (lvl) => lvl * 0.06 // segura +6% por nível do que escaparia (máx. 60%)
  },
  {
    id: 'sonar',
    name: 'Sonar de Pesca',
    basePrice: 5000,
    priceMultiplier: 6,
    level: 0,
    maxLevel: 3,
    icon: 'sonar',
    desc: 'Mostra o que vai morder no próximo arremesso. Nv.1: raridade · Nv.2: espécie e alerta de raros · Nv.3: peso.',
    getValue: (lvl) => lvl
  },
  {
    id: 'encomendas',
    name: 'Quadro de Encomendas',
    basePrice: 3000,
    priceMultiplier: 3,
    level: 0,
    maxLevel: 5,
    icon: 'encomendas',
    desc: 'Clientes pedem peixes específicos e pagam bem mais que a peixaria. Mais níveis: mais pedidos e prêmios maiores.',
    getValue: (lvl) => lvl <= 0 ? 0 : (lvl <= 2 ? 1 : (lvl <= 4 ? 2 : 3)) // pedidos ao mesmo tempo
  },
  {
    id: 'rede_espera',
    name: 'Rede de Espera',
    basePrice: 20000,
    priceMultiplier: 4,
    level: 0,
    maxLevel: 4,
    icon: 'rede_espera',
    desc: 'Rede armada que continua pescando enquanto você está fora: aumenta o limite de ganho offline.',
    getValue: (lvl) => 8 + lvl * 4 // horas: 8 → 24
  }
];
