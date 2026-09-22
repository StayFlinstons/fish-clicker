// ═════════════════════════════════════════════════════════════════════
// MUNDO 2: O ABISMO OCEÂNICO - DADOS, BIOMAS, FAUNA & ASCENSÃO
// ═════════════════════════════════════════════════════════════════════

export const WORLD2_BIOMES = [
  {
    id: 'recife_bioluminescente',
    name: 'Recife Bioluminescente',
    shortName: 'Recife Neon',
    depth: '1.400m',
    pressure: '140 atm',
    desc: 'Florestas de corais fluorescentes e águas-vivas cósmicas que cintilam na penumbra.',
    themeColor: '#06b6d4',
    bgGradient: 'from-cyan-950/90 via-slate-950 to-blue-950',
    icon: '🪸',
    requiredDepthLevel: 1
  },
  {
    id: 'fendas_vulcanicas',
    name: 'Fendas Hidrotérmicas',
    shortName: 'Fendas Vulcânicas',
    depth: '3.800m',
    pressure: '380 atm',
    desc: 'Chaminés vulcânicas expelindo magma negro e água escaldante rica em minerais incandescentes.',
    themeColor: '#f97316',
    bgGradient: 'from-amber-950/90 via-slate-950 to-red-950',
    icon: '🌋',
    requiredDepthLevel: 1
  },
  {
    id: 'cemiterio_naufragios',
    name: 'Cemitério de Naufrágios',
    shortName: 'Naufrágios',
    depth: '5.600m',
    pressure: '560 atm',
    desc: 'Carcaças de galeões e caravelas antigas adormecidas sob o leito oceânico, guardadas por almas penadas.',
    themeColor: '#10b981',
    bgGradient: 'from-emerald-950/90 via-slate-950 to-slate-950',
    icon: '⚓',
    requiredDepthLevel: 2
  },
  {
    id: 'zona_hadal',
    name: 'Ponto Abissal (Zona Hadal)',
    shortName: 'Zona Hadal',
    depth: '9.200m',
    pressure: '920 atm',
    desc: 'A escuridão esmagadora onde a pressão desafia a física e habitam monstros ancestrais cegos.',
    themeColor: '#a855f7',
    bgGradient: 'from-purple-950/95 via-black to-slate-950',
    icon: '👁️',
    requiredDepthLevel: 3
  }
];

export const FISH_WORLD_2 = [
  // ─── 🪸 RECIFE BIOLUMINESCENTE (200m a 1000m) ───
  {
    numId: 101,
    id: 'camarao_neon',
    name: 'Camarão Neon Cristalino',
    biome: 'recife_bioluminescente',
    rarity: 'COMUM',
    icon: 'camarao_neon',
    minWeight: 0.15,
    maxWeight: 0.85,
    baseValue: 55,
    desc: 'Carapaça translúcida que emite pulsos de luz azulada para desorientar predadores.',
    buff: { type: 'luck_bonus', value: 0.08, text: '+8% Sorte' }
  },
  {
    numId: 102,
    id: 'peixe_lanterna_prisma',
    name: 'Peixe-Lanterna Prismático',
    biome: 'recife_bioluminescente',
    rarity: 'INCOMUM',
    icon: 'peixe_lanterna',
    minWeight: 1.2,
    maxWeight: 4.8,
    baseValue: 160,
    desc: 'Seu órgão luminoso frontal refrata luz em todas as cores do espectro cósmico.',
    buff: { type: 'double_catch_chance', value: 0.12, text: '+12% Pesca Dupla' }
  },
  {
    numId: 103,
    id: 'agua_viva_aurora',
    name: 'Água-Viva da Aurora Oceânica',
    biome: 'recife_bioluminescente',
    rarity: 'RARO',
    icon: 'agua_viva_aurora',
    minWeight: 3.5,
    maxWeight: 14.0,
    baseValue: 480,
    desc: 'Tentáculos elétricos que parecem faixas da aurora boreal sob as águas salgadas.',
    buff: { type: 'fishing_speed', value: 0.18, text: '+18% Vel. Pesca' }
  },
  {
    numId: 104,
    id: 'polvo_cintilante_rei',
    name: 'Polvo Cintilante Rei',
    biome: 'recife_bioluminescente',
    rarity: 'EPICO',
    icon: 'polvo_cintilante',
    minWeight: 9.0,
    maxWeight: 32.0,
    baseValue: 1400,
    desc: 'Mestre da camuflagem neon. Suas ventosas absorvem a luz da água para emitir choques energéticos.',
    buff: { type: 'gold_multiplier', value: 0.28, text: '+28% Ouro' }
  },
  {
    numId: 105,
    id: 'arraia_coral_celeste',
    name: 'Arraia Solar dos Corais',
    biome: 'recife_bioluminescente',
    rarity: 'LENDARIO',
    icon: 'arraia_coral',
    minWeight: 35.0,
    maxWeight: 140.0,
    baseValue: 4200,
    desc: 'Suas asas translúcidas absorvem a luz dos corais cósmicos, brilhando como um vitral místico no oceano.',
    buff: { type: 'gold_multiplier', value: 0.35, text: '+35% Ouro' }
  },
  {
    numId: 106,
    id: 'serpente_coral_primordial',
    name: 'Serpente-do-Mar Coralina',
    biome: 'recife_bioluminescente',
    rarity: 'MITICO',
    icon: 'serpente_coral',
    minWeight: 85.0,
    maxWeight: 380.0,
    baseValue: 14000,
    desc: 'Guardiã milenar dos recifes de luz. Seu corpo serpentino refrata bioluminescência pura entre as correntes.',
    buff: { type: 'mythic_mastery', value: 0.45, text: '+45% Ouro, +27% Sorte, +18% Pesca Dupla' }
  },

  // ─── 🌋 FENDAS HIDROTÉRMICAS (1000m a 3000m) ───
  {
    numId: 107,
    id: 'caranguejo_obsidiana',
    name: 'Caranguejo de Obsidiana',
    biome: 'fendas_vulcanicas',
    rarity: 'COMUM',
    icon: 'caranguejo_obsidiana',
    minWeight: 0.6,
    maxWeight: 2.8,
    baseValue: 95,
    desc: 'Alimenta-se do enxofre das chaminés vulcânicas. Sua carapaça é dura como vidro vulcânico.',
    buff: { type: 'all_stats', value: 0.05, text: '+5% Todos Atributos' }
  },
  {
    numId: 108,
    id: 'carpa_magmatica',
    name: 'Carpa Magmática',
    biome: 'fendas_vulcanicas',
    rarity: 'INCOMUM',
    icon: 'carpa_magmatica',
    minWeight: 3.0,
    maxWeight: 12.0,
    baseValue: 300,
    desc: 'Suas escamas retêm calor suficiente para ferver a água ao redor quando assustada.',
    buff: { type: 'gold_multiplier', value: 0.15, text: '+15% Ouro' }
  },
  {
    numId: 109,
    id: 'moreia_de_brasa',
    name: 'Moreia de Brasa Viva',
    biome: 'fendas_vulcanicas',
    rarity: 'RARO',
    icon: 'moreia_brasa',
    minWeight: 5.5,
    maxWeight: 20.0,
    baseValue: 920,
    desc: 'Corpo longo e incandescente que desliza pelas fendas rochosas fervilhantes.',
    buff: { type: 'fishing_speed', value: 0.22, text: '+22% Vel. Pesca' }
  },
  {
    numId: 110,
    id: 'tubarao_basaltico',
    name: 'Tubarão de Ferro Basáltico',
    biome: 'fendas_vulcanicas',
    rarity: 'EPICO',
    icon: 'tubarao_basaltico',
    minWeight: 28.0,
    maxWeight: 110.0,
    baseValue: 2600,
    desc: 'Carapaça mineral forjada no calor das chaminés hidrotermais. Corta a água fervente como lâmina.',
    buff: { type: 'fishing_speed', value: 0.28, text: '+28% Vel. Pesca & +15% Ouro' }
  },
  {
    numId: 111,
    id: 'dragao_hidrotermico',
    name: 'Dragão das Fumarolas Negras',
    biome: 'fendas_vulcanicas',
    rarity: 'LENDARIO',
    icon: 'dragao_hidrotermico',
    minWeight: 35.0,
    maxWeight: 125.0,
    baseValue: 5500,
    desc: 'Colosso réptil que dorme dentro das crateras ativas, protegido por escamas de ferro basáltico.',
    buff: { type: 'mythic_mastery', value: 0.45, text: '+45% Ouro, +27% Sorte, +18% Pesca Dupla' }
  },
  {
    numId: 112,
    id: 'fenix_de_magma',
    name: 'Colosso Vulcânico das Profundezas',
    biome: 'fendas_vulcanicas',
    rarity: 'MITICO',
    icon: 'fenix_magma',
    minWeight: 95.0,
    maxWeight: 420.0,
    baseValue: 18000,
    desc: 'Manifestação titânica nascida no coração da crosta terrestre. A água evapora ao redor de suas barbatanas.',
    buff: { type: 'mythic_mastery', value: 0.50, text: '+50% Ouro, +30% Sorte, +20% Pesca Dupla' }
  },

  // ─── ⚓ CEMITÉRIO DE NAUFRÁGIOS (3000m a 6000m) ───
  {
    numId: 113,
    id: 'arenque_fantasma',
    name: 'Arenque Fantasmagórico',
    biome: 'cemiterio_naufragios',
    rarity: 'COMUM',
    icon: 'arenque_fantasma',
    minWeight: 0.4,
    maxWeight: 1.8,
    baseValue: 160,
    desc: 'Nadando em cardumes espectrais por entre as cabines inundadas dos navios perdidos.',
    buff: { type: 'auto_fish_speed', value: 0.10, text: '+10% Vel. Auto' }
  },
  {
    numId: 114,
    id: 'enguia_espectral',
    name: 'Enguia dos Galeões',
    biome: 'cemiterio_naufragios',
    rarity: 'INCOMUM',
    icon: 'enguia_espectral',
    minWeight: 2.2,
    maxWeight: 9.0,
    baseValue: 520,
    desc: 'Enrosca-se nos mastros apodrecidos, atraída pelo brilho de dobrões e joias submersas.',
    buff: { type: 'luck_bonus', value: 0.14, text: '+14% Sorte' }
  },
  {
    numId: 115,
    id: 'peixe_cofre_pirata',
    name: 'Peixe-Cofre do Barba-Negra',
    biome: 'cemiterio_naufragios',
    rarity: 'RARO',
    icon: 'peixe_cofre',
    minWeight: 4.0,
    maxWeight: 16.0,
    baseValue: 1750,
    desc: 'Armadura óssea cúbica incrustada com moedas de ouro e conchas amaldiçoadas.',
    buff: { type: 'gold_multiplier', value: 0.25, text: '+25% Ouro' }
  },
  {
    numId: 116,
    id: 'tubarao_amaldicoado',
    name: 'Tubarão Espectro dos Mares',
    biome: 'cemiterio_naufragios',
    rarity: 'EPICO',
    icon: 'tubarao_espectro',
    minWeight: 35.0,
    maxWeight: 140.0,
    baseValue: 4800,
    desc: 'Vigia eterno dos tesouros perdidos. Seus olhos vazios não sentem piedade nem medo.',
    buff: { type: 'double_catch_chance', value: 0.30, text: '+30% Pesca Dupla' }
  },
  {
    numId: 117,
    id: 'espadarte_fantasma',
    name: 'Peixe-Espadachim dos Destroços',
    biome: 'cemiterio_naufragios',
    rarity: 'LENDARIO',
    icon: 'espadarte_fantasma',
    minWeight: 40.0,
    maxWeight: 160.0,
    baseValue: 8500,
    desc: 'Lâmina óssea incrustada com dobrões piratas. Corta as redes antigas com velocidade sobrenatural.',
    buff: { type: 'gold_multiplier', value: 0.38, text: '+38% Ouro & +22% Pesca Dupla' }
  },
  {
    numId: 118,
    id: 'kraken_dos_galeoes',
    name: 'Terror Espectral dos Destroços',
    biome: 'cemiterio_naufragios',
    rarity: 'MITICO',
    icon: 'kraken_galeoes',
    minWeight: 110.0,
    maxWeight: 480.0,
    baseValue: 24000,
    desc: 'O monstro lendário que arrastou frotas coloniais inteiras para o fundo. Guarda o maior tesouro do mundo.',
    buff: { type: 'mythic_mastery', value: 0.55, text: '+55% Ouro, +33% Sorte, +22% Pesca Dupla' }
  },

  // ─── 🕳️ ZONA HADAL (6000m a 11000m) ───
  {
    numId: 119,
    id: 'isopode_gigante_hadal',
    name: 'Isópode Gigante do Abismo',
    biome: 'zona_hadal',
    rarity: 'COMUM',
    icon: 'isopode_hadal',
    minWeight: 0.8,
    maxWeight: 3.5,
    baseValue: 280,
    desc: 'Blindagem quitinosa ultra-reforçada que suporta a pressão brutal de 11.000 metros no fundo da fossa.',
    buff: { type: 'luck_bonus', value: 0.12, text: '+12% Sorte' }
  },
  {
    numId: 120,
    id: 'peixe_diabo_negro',
    name: 'Peixe-Diabo do Vazio',
    biome: 'zona_hadal',
    rarity: 'INCOMUM',
    icon: 'peixe_diabo',
    minWeight: 1.8,
    maxWeight: 7.5,
    baseValue: 920,
    desc: 'Mandíbulas descomunais com dentes em agulha capazes de devorar presas maiores que seu próprio corpo.',
    buff: { type: 'luck_bonus', value: 0.16, text: '+16% Sorte' }
  },
  {
    numId: 121,
    id: 'tubarao_duende_vazio',
    name: 'Tubarão-Duende Hadal',
    biome: 'zona_hadal',
    rarity: 'RARO',
    icon: 'tubarao_duende',
    minWeight: 18.0,
    maxWeight: 70.0,
    baseValue: 3100,
    desc: 'Focinho alongado com sensores eletromagnéticos para detectar presas na escuridão sem luz.',
    buff: { type: 'fishing_speed', value: 0.26, text: '+26% Vel. Pesca' }
  },
  {
    numId: 122,
    id: 'polvo_vampiro_hadal',
    name: 'Polvo-Vampiro do Vácuo',
    biome: 'zona_hadal',
    rarity: 'EPICO',
    icon: 'polvo_vampiro',
    minWeight: 22.0,
    maxWeight: 85.0,
    baseValue: 7200,
    desc: 'Manto escarlate com espinhos biológicos que absorve a luz e hipnotiza criaturas do fundo.',
    buff: { type: 'luck_bonus', value: 0.32, text: '+32% Sorte' }
  },
  {
    numId: 123,
    id: 'quimera_das_profundezas',
    name: 'Quimera Abissal Primordial',
    biome: 'zona_hadal',
    rarity: 'LENDARIO',
    icon: 'quimera_abissal',
    minWeight: 45.0,
    maxWeight: 180.0,
    baseValue: 14000,
    desc: 'Criatura quase pré-histórica que sobreviveu isolada da luz solar por mais de 400 milhões de anos.',
    buff: { type: 'mythic_mastery', value: 0.55, text: '+55% Ouro, +33% Sorte, +22% Pesca Dupla' }
  },
  {
    numId: 124,
    id: 'leviata_do_nucleo',
    name: 'Leviatã do Núcleo da Terra',
    biome: 'zona_hadal',
    rarity: 'MITICO',
    icon: 'leviata_nucleo',
    minWeight: 180.0,
    maxWeight: 750.0,
    baseValue: 55000,
    desc: 'A entidade soberana do leito submarino terrestre. Suas barbatanas causam terremotos submersos.',
    buff: { type: 'all_stats', value: 0.80, text: '+80% Todos Atributos' }
  },
  {
    numId: 125,
    id: 'olho_do_vazio_primordial',
    name: 'O Olho Ancestral do Vazio',
    biome: 'zona_hadal',
    rarity: 'SECRETO',
    secret: true,
    icon: 'olho_vazio',
    minWeight: 250.0,
    maxWeight: 980.0,
    baseValue: 120000,
    desc: 'A própria consciência ancestral da Fossa das Marianas. Quem o contempla recebe as bênçãos do vácuo infinito.',
    buff: { type: 'mythic_mastery', value: 0.65, text: '+65% Ouro, +39% Sorte, +26% Pesca Dupla' }
  }
];

// As 4 Peças Perdidas do Batiscafo de Ascensão (Objetivo Final do Mundo 2)
export const ASCENSION_PARTS = [
  {
    id: 'bateria_neon',
    name: 'Bateria de Fusão Neon',
    biome: 'recife_bioluminescente',
    icon: '🔋',
    desc: 'Fornece energia infinita gerada pelos fluidos bioluminescentes dos corais cósmicos.',
    found: false
  },
  {
    id: 'casco_titanio',
    name: 'Casco de Liga Vulcânica',
    biome: 'fendas_vulcanicas',
    icon: '🛡️',
    desc: 'Resiste ao calor escaldante e às pressões brutais das profundezas oceânicas.',
    found: false
  },
  {
    id: 'helice_galeao',
    name: 'Hélice Pirata dos Galeões',
    biome: 'cemiterio_naufragios',
    icon: '⚙️',
    desc: 'Mecanismo de propulsão esculpido em bronze mítico encontrado nos destroços do tesouro.',
    found: false
  },
  {
    id: 'sistema_lastro_hadal',
    name: 'Sistema de Lastro Hadal',
    biome: 'zona_hadal',
    icon: '🧭',
    desc: 'Câmaras de descompressão primordiais capazes de impulsionar a cápsula até a superfície.',
    found: false
  }
];

// Varas Especiais do Mundo 2 (Valores Rebalanceados)
export const RODS_WORLD_2 = [
  {
    id: 'vara_arpao_basico',
    name: 'Arpão de Mergulho',
    price: 0,
    tier: 1,
    luckBonus: 0.15,
    doubleCatchChance: 0.05,
    fishingSpeedBonus: 0.10,
    icon: 'rod_arpao',
    desc: 'Equipamento inicial de mergulho para cortar a resistência da água.'
  },
  {
    id: 'vara_pneumatica',
    name: 'Lança-Cabos Pneumático',
    price: 25000,
    tier: 2,
    luckBonus: 0.40,
    doubleCatchChance: 0.15,
    fishingSpeedBonus: 0.25,
    icon: 'rod_pneumatica',
    desc: 'Dispara cabos de aço tensionados por gás comprimido para fisgar peixes velozes.'
  },
  {
    id: 'vara_liga_titanio',
    name: 'Vara de Titânio Hidrotermal',
    price: 150000,
    tier: 3,
    luckBonus: 0.90,
    doubleCatchChance: 0.35,
    fishingSpeedBonus: 0.45,
    icon: 'rod_titanio',
    desc: 'Forjada no calor das fendas com fibra de carbono e titânio militar.'
  },
  {
    id: 'vara_tridente_poseidon',
    name: 'Tridente do Soberano Abissal',
    price: 1200000,
    tier: 4,
    luckBonus: 1.80,
    doubleCatchChance: 0.70,
    fishingSpeedBonus: 0.75,
    icon: 'rod_tridente',
    desc: 'Relíquia sagrada do fundo do mar que comanda as correntes oceânicas e as criaturas titânicas.'
  }
];

// Iscas Subaquáticas do Mundo 2 (Valores Aumentados)
export const BAITS_WORLD_2 = [
  {
    id: 'isca_plankton_neon',
    name: 'Plâncton Neon Luminoso',
    price: 0,
    tier: 1,
    luckMultiplier: 1.15,
    doubleCatchBonus: 0.05,
    icon: 'bait',
    desc: 'Bioluminescência suave que atrai cardumes curiosos nas águas rasas do abismo.'
  },
  {
    id: 'isca_camarao_brasa',
    name: 'Essência de Enxofre Hidrotermal',
    price: 12000,
    tier: 2,
    luckMultiplier: 1.50,
    doubleCatchBonus: 0.15,
    icon: 'bait',
    desc: 'Odor mineral concentrado que atrai peixes magmáticos das fendas profundas.'
  },
  {
    id: 'isca_alga_espectral',
    name: 'Alga Espectral Fosforescente',
    price: 85000,
    tier: 3,
    luckMultiplier: 2.00,
    doubleCatchBonus: 0.25,
    icon: 'bait',
    desc: 'Colhida nos mastros dos galeões naufragados, brilha no escuro absoluto.'
  },
  {
    id: 'isca_cristal_hadal',
    name: 'Cristal de Pressão Hadal',
    price: 600000,
    tier: 4,
    luckMultiplier: 3.00,
    doubleCatchBonus: 0.45,
    icon: 'bait',
    desc: 'Irradia frequências ultra-sônicas que atraem os leviatãs soberanos do manto terrestre.'
  }
];

// Upgrades do Mundo 2 (Valores Rebalanceados)
export const UPGRADES_WORLD_2 = [
  {
    id: 'balde',
    name: 'Balde Pressurizado do Abismo',
    basePrice: 450,
    priceMultiplier: 1.60,
    level: 0,
    maxLevel: 15,
    icon: 'balde',
    desc: 'Câmara estanque para peixes abissais. Começa com 10.',
    getValue: (lvl) => 10 + lvl * 4 // +4 por nível
  },
  {
    id: 'auto_pescador',
    name: 'Sonda Autônoma Submarina',
    basePrice: 2500,
    priceMultiplier: 1.85,
    level: 0,
    maxLevel: 12,
    icon: 'auto_pescador',
    desc: 'Drone mecânico que fisga espécimes marinhos sozinho na água profunda.',
    getValue: (lvl) => lvl > 0 ? Math.max(2.0, 8.0 - (lvl * 0.5)) : 0
  },
  {
    id: 'boia_sorte',
    name: 'Sonar de Ressonância Abissal',
    basePrice: 1800,
    priceMultiplier: 1.85,
    level: 0,
    maxLevel: 10,
    icon: 'boia_sorte',
    desc: 'Detecta frequências de peixes raros e colossais no escuro.',
    getValue: (lvl) => lvl * 0.03 // +3% sorte por nível
  },
  {
    id: 'rede_dupla',
    name: 'Arpão Duplo Pneumático',
    basePrice: 3200,
    priceMultiplier: 2.10,
    level: 0,
    maxLevel: 8,
    icon: 'rede_dupla',
    desc: 'Dispara pontas duplas para capturar duas criaturas de uma vez.',
    getValue: (lvl) => lvl * 0.035 // +3.5% chance dupla por nível
  },
  {
    id: 'aquario_cap',
    name: 'Cúpula Aquário do Fundo do Mar',
    basePrice: 4000,
    priceMultiplier: 1.75,
    level: 0,
    maxLevel: 10,
    icon: 'aquario_cap',
    desc: 'Capacidade do aquário submarino. Começa com 3.',
    getValue: (lvl) => 3 + lvl * 2
  },
  {
    id: 'auto_vendedor',
    name: 'Cápsula de Venda Pneumática',
    basePrice: 8500,
    priceMultiplier: 2.20,
    level: 0,
    maxLevel: 5,
    icon: 'auto_vendedor',
    desc: 'Dispara cápsulas à superfície vendendo peixes filtrados automaticamente.',
    getValue: (lvl) => lvl > 0 ? Math.max(3.0, 10.0 - (lvl * 1.4)) : 0
  }
];
