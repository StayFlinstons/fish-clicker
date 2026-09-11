// Base de dados de peixes e raridades — REBALANCEADO para progressão lenta e desafiadora
export const RARITIES = {
  SECRETO:  { id: 'SECRETO',  label: 'Secreto',  color: '#f87171', bg: 'linear-gradient(135deg,rgba(15,23,42,0.98),rgba(153,27,27,0.5))', border: '#dc2626', chance: 0.015 },
  MITICO:   { id: 'MITICO',   label: 'Mítico',   color: '#ec4899', bg: 'linear-gradient(135deg,rgba(236,72,153,0.2),rgba(168,85,247,0.2))', border: '#ec4899', chance: 0.07 },
  LENDARIO: { id: 'LENDARIO', label: 'Lendário', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: '#dc2626', chance: 0.55 },
  EPICO:    { id: 'EPICO',    label: 'Épico',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: '#d97706', chance: 1.8 },
  RARO:     { id: 'RARO',     label: 'Raro',     color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: '#9333ea', chance: 5.5 },
  INCOMUM:  { id: 'INCOMUM',  label: 'Incomum',  color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: '#0284c7', chance: 20 },
  COMUM:    { id: 'COMUM',    label: 'Comum',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: '#64748b', chance: 72 }
};

export const FISH_LIST = [
  // ── COMUNS (valores baixos, sem buffs) ──
  { numId:1,  id:'lambari',                name:'Lambari Prateado',         rarity:'COMUM',    icon:'lambari',        minWeight:0.05, maxWeight:0.3,   baseValue:2,     desc:'Minúsculo e abundante nos rios rasos.', buff:null },
  { numId:2,  id:'tilapia',                name:'Tilápia do Nilo',          rarity:'COMUM',    icon:'tilapia',        minWeight:0.3,  maxWeight:1.8,   baseValue:4,     desc:'Saborosa mas não vale muito no mercado.', buff:null },
  { numId:3,  id:'sardinha',               name:'Sardinha Costeira',        rarity:'COMUM',    icon:'sardinha',       minWeight:0.1,  maxWeight:0.5,   baseValue:3,     desc:'Nada em cardumes rápidos e superficiais.', buff:null },
  { numId:4,  id:'carpa',                  name:'Carpa Comum',              rarity:'COMUM',    icon:'carpa',          minWeight:0.6,  maxWeight:3.0,   baseValue:5,     desc:'Peixe resistente que se contenta com pouco.', buff:null },
  { numId:5,  id:'bagre',                  name:'Bagre Bigodudo',           rarity:'COMUM',    icon:'bagre',          minWeight:0.5,  maxWeight:2.5,   baseValue:6,     desc:'Mora no lodo do fundo, alimenta-se de restos.', buff:null },
  { numId:6,  id:'piranha',                name:'Piranha Vermelha',         rarity:'COMUM',    icon:'piranha',        minWeight:0.2,  maxWeight:1.2,   baseValue:5,     desc:'Perigosa em cardume, solitária é inofensiva.', buff:null },

  // ── INCOMUNS (valores modestos, sem buffs) ──
  { numId:7,  id:'robalo',                 name:'Robalo Flecha',            rarity:'INCOMUM',  icon:'robalo',         minWeight:1.0,  maxWeight:4.5,   baseValue:15,    desc:'Ágil e brigador, exige paciência.', buff:null },
  { numId:8,  id:'truta',                  name:'Truta Arco-Íris',          rarity:'INCOMUM',  icon:'truta',          minWeight:0.8,  maxWeight:3.5,   baseValue:18,    desc:'Escamas iridescentes sob águas límpidas.', buff:null },
  { numId:9,  id:'salmao',                 name:'Salmão Selvagem',          rarity:'INCOMUM',  icon:'salmao',         minWeight:1.5,  maxWeight:6.0,   baseValue:25,    desc:'Nada contra a correnteza com garra.', buff:null },
  { numId:10, id:'peixe_palhaco',          name:'Peixe-Palhaço Tropical',   rarity:'INCOMUM',  icon:'palhaco',        minWeight:0.2,  maxWeight:0.8,   baseValue:20,    desc:'Laranja vibrante com listras brancas.', buff:null },
  { numId:11, id:'pescada',                name:'Pescada Amarela',          rarity:'INCOMUM',  icon:'pescada',        minWeight:1.2,  maxWeight:5.0,   baseValue:22,    desc:'Carne apreciada mas pouco rara.', buff:null },

  // ── RAROS (buffs modestos) ──
  { numId:12, id:'dourado',                name:'Dourado Real',             rarity:'RARO',     icon:'dourado',        minWeight:3.0,  maxWeight:12.0,  baseValue:60,    desc:'Rei do Rio — seu brilho traz sorte monetária.', buff:{ type:'gold_multiplier', value:0.06, text:'+6% Ouro' } },
  { numId:13, id:'baiacu_eletrico',        name:'Baiacu Elétrico',          rarity:'RARO',     icon:'baiacu',         minWeight:0.8,  maxWeight:3.0,   baseValue:70,    desc:'Pulsos elétricos aceleram a puxada.', buff:{ type:'fishing_speed', value:0.08, text:'+8% Vel. Pesca' } },
  { numId:14, id:'peixe_espada',           name:'Peixe-Espada Azul',        rarity:'RARO',     icon:'espada',         minWeight:8.0,  maxWeight:28.0,  baseValue:90,    desc:'Velocidade cortante, às vezes fisgando dois.', buff:{ type:'double_catch_chance', value:0.05, text:'+5% Pesca Dupla' } },
  { numId:15, id:'pirarucu',               name:'Pirarucu Amazônico',       rarity:'RARO',     icon:'pirarucu',       minWeight:15.0, maxWeight:60.0,  baseValue:120,   desc:'Gigante blindado que atrai criaturas nobres.', buff:{ type:'luck_bonus', value:0.04, text:'+4% Sorte' } },

  // ── ÉPICOS (buffs bons, muito raros) ──
  { numId:16, id:'tubarao_martelo',        name:'Tubarão-Martelo Dourado',  rarity:'EPICO',    icon:'tubarao',        minWeight:25.0, maxWeight:100.0, baseValue:350,   desc:'Predador lendário do oceano profundo.', buff:{ type:'gold_multiplier', value:0.12, text:'+12% Ouro' } },
  { numId:17, id:'arraia_diamante',        name:'Arraia Diamante',          rarity:'EPICO',    icon:'arraia',         minWeight:12.0, maxWeight:50.0,  baseValue:450,   desc:'Desliza com brilho hipnotizante.', buff:{ type:'luck_bonus', value:0.10, text:'+10% Sorte' } },
  { numId:18, id:'peixe_dragao',           name:'Peixe-Dragão da Fenda',    rarity:'EPICO',    icon:'dragao',         minWeight:6.0,  maxWeight:35.0,  baseValue:550,   desc:'Cospe chamas azuis no fundo abissal.', buff:{ type:'auto_fish_speed', value:0.15, text:'+15% Vel. Auto' } },

  // ── LENDÁRIOS ──
  { numId:19, id:'celacanto_anciao',       name:'Celacanto Ancião',         rarity:'LENDARIO', icon:'celacanto',      minWeight:35.0, maxWeight:130.0, baseValue:1800,  desc:'Fóssil vivo que aprimora tudo.', buff:{ type:'all_stats', value:0.08, text:'+8% Tudo' } },
  { numId:20, id:'abissal_bioluminescente',name:'Leviatã Bioluminescente',  rarity:'LENDARIO', icon:'leviata',        minWeight:40.0, maxWeight:180.0, baseValue:2500,  desc:'Ilumina a escuridão abissal.', buff:{ type:'double_catch_chance', value:0.12, text:'+12% Pesca Dupla' } },
  // Exclusivos por horário (Lendários)
  { numId:21, id:'peixe_sol_radiante',     name:'Peixe-Sol Radiante',       rarity:'LENDARIO', icon:'peixe_sol',      timeExclusive:'day',    minWeight:30.0, maxWeight:110.0, baseValue:2200, desc:'Brilha com o calor dourado do meio-dia. Só emerge sob o sol pleno.', buff:{ type:'gold_multiplier', value:0.22, text:'+22% Ouro' } },
  { numId:22, id:'guardiao_crepusculo',    name:'Guardião do Crepúsculo',   rarity:'LENDARIO', icon:'crepusculo',      timeExclusive:'sunset', minWeight:35.0, maxWeight:140.0, baseValue:2400, desc:'Nada nas águas violeta do entardecer nos breves minutos do poente.', buff:{ type:'fishing_speed', value:0.20, text:'+20% Vel. Pesca' } },
  { numId:23, id:'tubarao_fantasma_lunar', name:'Tubarão Fantasma Lunar',   rarity:'LENDARIO', icon:'tubarao_lunar',  timeExclusive:'night',  minWeight:45.0, maxWeight:160.0, baseValue:2600, desc:'Espectro prateado fluorescente que só vaga sob o luar da meia-noite.', buff:{ type:'luck_bonus', value:0.18, text:'+18% Sorte' } },

  // ── MÍTICOS (quase impossíveis) ──
  { numId:24, id:'serpente_solar',         name:'Serpente Solar Cósmica',    rarity:'MITICO',   icon:'serpente',       minWeight:80.0, maxWeight:400.0, baseValue:8000,  desc:'Entidade celestial que nada entre estrelas.', buff:{ type:'mythic_mastery', value:0.30, text:'+25% Ouro, +15% Sorte, +10% Dupla' } },
  // Exclusivos por horário (Míticos)
  { numId:25, id:'leviata_prisma_solar',   name:'Leviatã do Prisma Solar',   rarity:'MITICO',   icon:'prisma_solar',   timeExclusive:'day',    minWeight:75.0, maxWeight:380.0, baseValue:8500, desc:'Colosso celestial que refrata a luz solar em feixes de energia pura.', buff:{ type:'mythic_mastery', value:0.30, text:'+30% Maestria Mítica' } },
  { numId:26, id:'fenix_ocaso_eterno',     name:'Fênix do Ocaso Eterno',     rarity:'MITICO',   icon:'fenix_ocaso',    timeExclusive:'sunset', minWeight:80.0, maxWeight:420.0, baseValue:9000, desc:'Manifestação astral nascida do abraço entre o fogo solar e o crepúsculo.', buff:{ type:'mythic_mastery', value:0.32, text:'+32% Maestria Mítica' } },
  { numId:27, id:'kraken_abismo_estelar',  name:'Kraken do Abismo Estelar',  rarity:'MITICO',   icon:'kraken_estelar', timeExclusive:'night',  minWeight:90.0, maxWeight:450.0, baseValue:9500, desc:'Entidade ancestral forjada no vácuo cósmico que desperta nas horas mais escuras.', buff:{ type:'mythic_mastery', value:0.34, text:'+34% Maestria Mítica' } },

  // ── SECRETO (Oculto na enciclopédia até a captura, buff triplo, qualquer horário) ──
  { numId:28, id:'lampreia_negra',         name:'Lampreia Negra do Vazio',   rarity:'SECRETO',  icon:'lampreia_negra', secret:true, minWeight:45.0, maxWeight:280.0, baseValue:18000, desc:'Criatura abissal ancestral nascida das fendas do vácuo. Seu corpo negro absorve a luz e emana uma sinistra aura carmesim.', buff:{ type:'mythic_mastery', value:0.40, text:'Tríplice Benção Sombria (+40% Cósmica, +25% Tudo, +40% Ouro)' } }
];

// Afinidades temáticas naturais dos peixes (determina preferências de buffs)
export const FISH_AFFINITIES = {
  lambari: ['fishing_speed', 'gold_multiplier'],
  tilapia: ['gold_multiplier', 'double_catch_chance'],
  sardinha: ['fishing_speed', 'double_catch_chance'],
  carpa: ['luck_bonus', 'gold_multiplier'],
  bagre: ['luck_bonus', 'auto_fish_speed'],
  piranha: ['double_catch_chance', 'fishing_speed'],
  robalo: ['fishing_speed', 'luck_bonus'],
  truta: ['fishing_speed', 'gold_multiplier'],
  salmao: ['gold_multiplier', 'double_catch_chance'],
  peixe_palhaco: ['luck_bonus', 'gold_multiplier'],
  pescada: ['auto_fish_speed', 'gold_multiplier'],
  dourado: ['gold_multiplier', 'luck_bonus'],
  baiacu_eletrico: ['fishing_speed', 'auto_fish_speed'],
  peixe_espada: ['double_catch_chance', 'fishing_speed'],
  pirarucu: ['luck_bonus', 'gold_multiplier'],
  tubarao_martelo: ['gold_multiplier', 'double_catch_chance'],
  arraia_diamante: ['luck_bonus', 'gold_multiplier'],
  peixe_dragao: ['auto_fish_speed', 'fishing_speed'],
  celacanto_anciao: ['all_stats', 'luck_bonus'],
  abissal_bioluminescente: ['double_catch_chance', 'luck_bonus', 'all_stats'],
  serpente_solar: ['mythic_mastery', 'gold_multiplier', 'all_stats'],
  peixe_sol_radiante: ['gold_multiplier', 'all_stats', 'luck_bonus'],
  leviata_prisma_solar: ['mythic_mastery', 'gold_multiplier', 'all_stats'],
  guardiao_crepusculo: ['fishing_speed', 'double_catch_chance', 'all_stats'],
  fenix_ocaso_eterno: ['mythic_mastery', 'double_catch_chance', 'all_stats'],
  tubarao_fantasma_lunar: ['luck_bonus', 'auto_fish_speed', 'all_stats'],
  kraken_abismo_estelar: ['mythic_mastery', 'auto_fish_speed', 'all_stats'],
  lampreia_negra: ['mythic_mastery', 'all_stats', 'gold_multiplier', 'luck_bonus']
};

// Configuração de probabilidades, chances de buff duplo e faixas numéricas estritas por raridade
export const BUFF_CONFIG = {
  COMUM: {
    chance: 0.05,
    doubleChance: 0.0,
    ranges: {
      gold_multiplier: [0.01, 0.02, '% Ouro'],
      luck_bonus: [0.01, 0.01, '% Sorte'],
      fishing_speed: [0.01, 0.02, '% Vel. Pesca'],
      double_catch_chance: [0.01, 0.01, '% Pesca Dupla'],
      auto_fish_speed: [0.01, 0.02, '% Vel. Auto']
    }
  },
  INCOMUM: {
    chance: 0.25,
    doubleChance: 0.03,
    ranges: {
      gold_multiplier: [0.02, 0.04, '% Ouro'],
      luck_bonus: [0.02, 0.03, '% Sorte'],
      fishing_speed: [0.02, 0.04, '% Vel. Pesca'],
      double_catch_chance: [0.02, 0.03, '% Pesca Dupla'],
      auto_fish_speed: [0.02, 0.04, '% Vel. Auto']
    }
  },
  RARO: {
    chance: 1.0,
    doubleChance: 0.08,
    ranges: {
      gold_multiplier: [0.04, 0.08, '% Ouro'],
      luck_bonus: [0.03, 0.06, '% Sorte'],
      fishing_speed: [0.05, 0.09, '% Vel. Pesca'],
      double_catch_chance: [0.03, 0.06, '% Pesca Dupla'],
      auto_fish_speed: [0.05, 0.10, '% Vel. Auto']
    }
  },
  EPICO: {
    chance: 1.0,
    doubleChance: 0.15,
    ranges: {
      gold_multiplier: [0.09, 0.16, '% Ouro'],
      luck_bonus: [0.07, 0.13, '% Sorte'],
      fishing_speed: [0.10, 0.18, '% Vel. Pesca'],
      double_catch_chance: [0.07, 0.13, '% Pesca Dupla'],
      auto_fish_speed: [0.12, 0.20, '% Vel. Auto']
    }
  },
  LENDARIO: {
    chance: 1.0,
    doubleChance: 0.25,
    ranges: {
      gold_multiplier: [0.18, 0.28, '% Ouro'],
      luck_bonus: [0.12, 0.20, '% Sorte'],
      double_catch_chance: [0.12, 0.18, '% Pesca Dupla'],
      fishing_speed: [0.15, 0.25, '% Vel. Pesca'],
      all_stats: [0.06, 0.10, '% Tudo']
    }
  },
  MITICO: {
    chance: 1.0,
    doubleChance: 1.0,
    ranges: {
      mythic_mastery: [0.25, 0.35, '% Maestria Mítica'],
      gold_multiplier: [0.20, 0.35, '% Ouro'],
      luck_bonus: [0.15, 0.25, '% Sorte'],
      all_stats: [0.10, 0.18, '% Tudo']
    }
  },
  SECRETO: {
    chance: 1.0,
    tripleBuff: true,
    ranges: {
      mythic_mastery: [0.35, 0.50, '% Maestria Cósmica'],
      all_stats: [0.15, 0.25, '% Tudo'],
      gold_multiplier: [0.35, 0.55, '% Ouro'],
      luck_bonus: [0.25, 0.40, '% Sorte'],
      fishing_speed: [0.30, 0.45, '% Vel. Pesca'],
      double_catch_chance: [0.25, 0.35, '% Pesca Dupla'],
      auto_fish_speed: [0.30, 0.45, '% Vel. Auto']
    }
  }
};

export function generateFishBuffs(fishId, rarity) {
  const conf = BUFF_CONFIG[rarity] || BUFF_CONFIG.COMUM;
  if (Math.random() > conf.chance) return [];

  const aff = FISH_AFFINITIES[fishId] || ['gold_multiplier', 'luck_bonus'];
  const allTypes = Object.keys(conf.ranges);

  let count = 1;
  if (conf.tripleBuff || rarity === 'SECRETO') {
    count = 3;
  } else if (Math.random() < conf.doubleChance) {
    count = 2;
  }

  const chosenTypes = [];

  // Primeiro buff tem 75% de chance de seguir a afinidade do peixe
  const affPool = aff.filter(t => conf.ranges[t]);
  const firstType = affPool.length > 0 && Math.random() < 0.75
    ? affPool[Math.floor(Math.random() * affPool.length)]
    : allTypes[Math.floor(Math.random() * allTypes.length)];
  chosenTypes.push(firstType);

  while (chosenTypes.length < count) {
    const remaining = allTypes.filter(t => !chosenTypes.includes(t));
    if (remaining.length === 0) break;
    chosenTypes.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return chosenTypes.map(type => {
    const [min, max, label] = conf.ranges[type];
    const val = +(min + Math.random() * (max - min)).toFixed(3);
    const pct = Math.round(val * 100);
    return {
      type,
      value: val,
      text: '+' + pct + label
    };
  });
}
