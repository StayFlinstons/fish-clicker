/**
 * magnetData.js - Fish Clicker
 * Dados da Pesca Magnética: Tiers de Ímãs, Cenários, Itens/Minérios, Forja e Museu
 */

const MAGNET_TIERS = [
  {
    tier: 1,
    id: 'magnet_t1',
    name: 'Ímã de Ferrite Enferrujado',
    subtitle: 'Ferrugem Antiga',
    power: 1.0,
    pullSpeedSec: 2.8,
    findChance: 0.008, // 0.8% de chance do Mergulhador achar
    color: '#94a3b8',
    borderColor: '#64748b',
    desc: 'Um bloco magnético resgatado do lodo. Consegue puxar pequenas latinhas, moedas e arames.',
    icon: '🧲'
  },
  {
    tier: 2,
    id: 'magnet_t2',
    name: 'Ímã de Ferradura AlNiCo',
    subtitle: 'Aço & Cobalto',
    power: 2.2,
    pullSpeedSec: 2.2,
    findChance: 0.004,
    color: '#38bdf8',
    borderColor: '#0284c7',
    desc: 'Ímã clássico de ferradura polido. Seu campo atrai ferramentas pesadas, óculos e engrenagens.',
    icon: '🧲'
  },
  {
    tier: 3,
    id: 'magnet_t3',
    name: 'Eletroímã Industrial Blindado',
    subtitle: 'Bobina de Cobre 12V',
    power: 4.5,
    pullSpeedSec: 1.8,
    findChance: 0.002,
    color: '#a855f7',
    borderColor: '#7e22ce',
    desc: 'Alimentado por uma bateria compacta. Capaz de arrancar bicicletas e cofres presos na lama.',
    icon: '⚡'
  },
  {
    tier: 4,
    id: 'magnet_t4',
    name: 'Superímã de Neodímio N52',
    subtitle: 'Grau Militar de Terras Raras',
    power: 8.0,
    pullSpeedSec: 1.4,
    findChance: 0.001,
    color: '#facc15',
    borderColor: '#ca8a04',
    desc: 'Força magnética surreal de 400kg. Arrasta minérios densos, joias submersas e relíquias profundas.',
    icon: '🌟'
  },
  {
    tier: 5,
    id: 'magnet_t5',
    name: 'Ímã Gravitacional Cósmico',
    subtitle: 'Fenda de Singularidade',
    power: 16.0,
    pullSpeedSec: 1.0,
    findChance: 0.0005,
    color: '#f43f5e',
    borderColor: '#e11d48',
    desc: 'Forjado com matéria estelar. Distorce as águas e atrai meteoritos e artefatos lendários.',
    icon: '🌀'
  }
];

const MAGNET_SCENARIOS = {
  ponte: {
    id: 'ponte',
    name: 'Ponte da Cidade',
    icon: '🌉',
    tagline: 'Canal Urbano & Águas Profundas da Metrópole',
    description: 'Águas turvas sob a antiga ponte de ferro. O local favorito de quem joga objetos misteriosos na calada da noite.',
    bgColor: '#0f172a',
    accentColor: '#38bdf8',
    lootIds: [
      'lata_vintage',
      'chaveiro_antigo',
      'sinal_transito',
      'bicicleta_retro',
      'carrinho_mercado',
      'celular_flip',
      'cofre_trancado'
    ]
  },
  praia: {
    id: 'praia',
    name: 'Praia dos Turistas',
    icon: '🏖️',
    tagline: 'Costa Dourada & Águas Cristalinas Tropicais',
    description: 'Milhares de turistas nadam aqui todo verão... e deixam cair preciosidades na areia e no coral.',
    bgColor: '#083344',
    accentColor: '#06b6d4',
    lootIds: [
      'moedas_estrangeiras',
      'protetor_vintage',
      'oculos_sol',
      'camera_gopro',
      'relogio_ouro',
      'alianca_diamante',
      'colar_perolas'
    ]
  },
  floresta: {
    id: 'floresta',
    name: 'Rio da Floresta',
    icon: '🌲',
    tagline: 'Corredeiras Selvagens & Mina Esquecida',
    description: 'Um leito rochoso cercado por pinheiros ancestrais. As pedras escondem ricos veios minerais e fósseis.',
    bgColor: '#064e3b',
    accentColor: '#10b981',
    lootIds: [
      'minerio_ferro',
      'pedra_pirita',
      'geodo_ametista',
      'quartzo_prismatico',
      'fossil_trilobita',
      'meteorito_espacial',
      'cristal_cosmico'
    ]
  }
};

const MAGNET_ITEMS = {
  // ═══ CENÁRIO 1: PONTE DA CIDADE ═══
  lata_vintage: {
    id: 'lata_vintage',
    name: 'Lata de Refrigerante Vintage',
    scenario: 'ponte',
    rarity: 'comum',
    sellValue: 45,
    minTier: 1,
    weight: 35,
    category: 'sucata',
    icon: '🥫',
    desc: 'Lata enferrujada de guaraná dos anos 90 com anel de puxar clássico.',
    museumDesc: 'Exemplar da era pré-reciclagem. Mostra o design nostálgico das latas de alumínio.'
  },
  chaveiro_antigo: {
    id: 'chaveiro_antigo',
    name: 'Chaveiro de Bronze com Chaves',
    scenario: 'ponte',
    rarity: 'comum',
    sellValue: 80,
    minTier: 1,
    weight: 25,
    category: 'ferramenta',
    icon: '🔑',
    desc: 'Um molho de chaves antigas e pesadas. Ninguém sabe qual porta elas abriam.',
    museumDesc: 'Chaves entalhadas à mão no século passado. Pertenciam à antiga alfândega portuária.'
  },
  sinal_transito: {
    id: 'sinal_transito',
    name: 'Placa de "PARE" Amassada',
    scenario: 'ponte',
    rarity: 'incomum',
    sellValue: 180,
    minTier: 1,
    weight: 18,
    category: 'sucata',
    icon: '🛑',
    desc: 'Arrancada em alguma tempestade urbana e jogada do alto da ponte.',
    museumDesc: 'Aço galvanizado com marcas de parafusos arrancados. Um clássico da arqueologia urbana.'
  },
  bicicleta_retro: {
    id: 'bicicleta_retro',
    name: 'Bicicleta Monark Enferrujada',
    scenario: 'ponte',
    rarity: 'raro',
    sellValue: 450,
    minTier: 2,
    weight: 10,
    category: 'mecanico',
    icon: '🚲',
    desc: 'Quadro clássico de aço com corrente coberta de algas. Suas engrenagens ainda giram!',
    museumDesc: 'Meio de transporte popular dos anos 80. O dínamo do farol ainda tem cobre puro dentro.'
  },
  carrinho_mercado: {
    id: 'carrinho_mercado',
    name: 'Carrinho de Supermercado',
    scenario: 'ponte',
    rarity: 'raro',
    sellValue: 700,
    minTier: 2,
    weight: 7,
    category: 'sucata',
    icon: '🛒',
    desc: 'O clássico dos clássicos da pesca magnética! Rodinhas duras mas a grade de ferro é resistente.',
    museumDesc: 'O enigma de como carrinhos de compras vão parar no fundo dos rios permanece sem solução.'
  },
  celular_flip: {
    id: 'celular_flip',
    name: 'Celular Flip Indestrutível',
    scenario: 'ponte',
    rarity: 'epico',
    sellValue: 1500,
    minTier: 3,
    weight: 3.5,
    category: 'tecnologia',
    icon: '📱',
    desc: 'Ficou 15 anos debaixo d\'água. A bateria ainda está em 98% e a tela acende!',
    museumDesc: 'Relíquia da engenharia móvel nórdica. Sua carcaça resiste até a mordidas de tubarão.'
  },
  cofre_trancado: {
    id: 'cofre_trancado',
    name: 'Cofre Pequeno Trancado',
    scenario: 'ponte',
    rarity: 'lendario',
    sellValue: 4000,
    minTier: 3,
    weight: 1.5,
    category: 'tesouro',
    icon: '🧰',
    isChest: true,
    desc: 'Cofre de aço chumbado com segredo numérico. Pode ser aberto na Oficina se você tiver a Gazua!',
    museumDesc: 'Cofre submerso durante a grande cheia de 1974. Seu interior guarda segredos lacrados.'
  },

  // ═══ CENÁRIO 2: PRAIA DOS TURISTAS ═══
  moedas_estrangeiras: {
    id: 'moedas_estrangeiras',
    name: 'Moedas de Turistas Estrangeiros',
    scenario: 'praia',
    rarity: 'comum',
    sellValue: 50,
    minTier: 1,
    weight: 35,
    category: 'tesouro',
    icon: '🪙',
    desc: 'Punhado de moedas de iene, euro e dólares perdidas por banhistas na arrebentação.',
    museumDesc: 'Coleção numismática internacional resgatada das correntes costeiras.'
  },
  protetor_vintage: {
    id: 'protetor_vintage',
    name: 'Lata de Bronzeador dos Anos 80',
    scenario: 'praia',
    rarity: 'comum',
    sellValue: 90,
    minTier: 1,
    weight: 25,
    category: 'sucata',
    icon: '🧴',
    desc: 'Frasco metálico de óleo de urucum com cheiro de coco que resistiu décadas.',
    museumDesc: 'Aroma clássico das férias tropicais de verão da década de 1980.'
  },
  oculos_sol: {
    id: 'oculos_sol',
    name: 'Óculos Aviador Polarizado',
    scenario: 'praia',
    rarity: 'incomum',
    sellValue: 220,
    minTier: 1,
    weight: 18,
    category: 'estilo',
    icon: '🕶️',
    desc: 'Armação de metal dourado com lentes que caíram de um jet-ski.',
    museumDesc: 'Design icônico que sobreviveu à corrosão marinha sem um arranhão.'
  },
  camera_gopro: {
    id: 'camera_gopro',
    name: 'Câmera de Ação Subaquática',
    scenario: 'praia',
    rarity: 'raro',
    sellValue: 600,
    minTier: 2,
    weight: 10,
    category: 'tecnologia',
    icon: '📷',
    desc: 'Câmera lacrada na caixa estanque. O cartão de memória contém fotos incríveis de peixes!',
    museumDesc: 'Pequena maravilha ótica dos mares. Ajuda biólogos a estudar a fauna costeira.'
  },
  relogio_ouro: {
    id: 'relogio_ouro',
    name: 'Relógio Submariner de Ouro',
    scenario: 'praia',
    rarity: 'epico',
    sellValue: 1800,
    minTier: 3,
    weight: 4.0,
    category: 'joalheria',
    icon: '⌚',
    desc: 'Relógio automático suíço resistente a 300m. O ponteiro de segundos continua tiquetaqueando.',
    museumDesc: 'O pináculo da relojoaria de luxo submersa, encontrado sem danos no fundo do recife.'
  },
  alianca_diamante: {
    id: 'alianca_diamante',
    name: 'Aliança de Platina com Diamante',
    scenario: 'praia',
    rarity: 'epico',
    sellValue: 2400,
    minTier: 3,
    weight: 3.0,
    category: 'joalheria',
    icon: '💍',
    desc: 'Escorregou do dedo de alguém durante um mergulho no feriado. Brilha intensamente.',
    museumDesc: 'Símbolo eterno de compromisso que o oceano guardou por anos.'
  },
  colar_perolas: {
    id: 'colar_perolas',
    name: 'Colar de Pérolas Negras do Taiti',
    scenario: 'praia',
    rarity: 'lendario',
    sellValue: 5000,
    minTier: 4,
    weight: 1.2,
    category: 'joalheria',
    icon: '📿',
    desc: 'Pérolas raras de ostra negra com fecho em ouro branco. Uma verdadeira joia da coroa.',
    museumDesc: 'Pérolas orgânicas perfeitamente esféricas de valor incalculável.'
  },

  // ═══ CENÁRIO 3: RIO DA FLORESTA ═══
  minerio_ferro: {
    id: 'minerio_ferro',
    name: 'Nódulo de Minério de Ferro Puro',
    scenario: 'floresta',
    rarity: 'comum',
    sellValue: 60,
    minTier: 1,
    weight: 35,
    category: 'mineral',
    icon: '🪨',
    desc: 'Pedaço denso de magnetita de alto teor. É atraído pelo ímã com uma força impressionante.',
    museumDesc: 'A matéria-prima essencial que construiu as civilizações e as primeiras forjas.'
  },
  pedra_pirita: {
    id: 'pedra_pirita',
    name: 'Cristal de Pirita (Ouro de Tolo)',
    scenario: 'floresta',
    rarity: 'incomum',
    sellValue: 200,
    minTier: 1,
    weight: 22,
    category: 'mineral',
    icon: '✨',
    desc: 'Cubos dourados naturais com brilho metálico. Não é ouro real, mas é lindo e muito valioso para a forja!',
    museumDesc: 'Formação cúbica geométrica hipnotizante gerada pela pressão das montanhas.'
  },
  geodo_ametista: {
    id: 'geodo_ametista',
    name: 'Geodo de Ametista Roxa',
    scenario: 'floresta',
    rarity: 'raro',
    sellValue: 650,
    minTier: 2,
    weight: 11,
    category: 'mineral',
    icon: '🔮',
    desc: 'Pedra oca forrada com cristais roxos reluzentes. Emite uma aura relaxante e mística.',
    museumDesc: 'Cavidade vulcânica cristalizada com dióxido de silício e ferro violeta.'
  },
  quartzo_prismatico: {
    id: 'quartzo_prismatico',
    name: 'Quartzo Prismático Límpido',
    scenario: 'floresta',
    rarity: 'raro',
    sellValue: 850,
    minTier: 2,
    weight: 8,
    category: 'mineral',
    icon: '💎',
    desc: 'Ponta de cristal transparente que refrata a luz do sol em todas as cores do arco-íris.',
    museumDesc: 'Cristal de alta pureza energética utilizado em componentes de ressonância.'
  },
  fossil_trilobita: {
    id: 'fossil_trilobita',
    name: 'Fóssil de Trilobita Mineralizado',
    scenario: 'floresta',
    rarity: 'epico',
    sellValue: 2200,
    minTier: 3,
    weight: 3.5,
    category: 'fossil',
    icon: '🐚',
    desc: 'Criatura marinha pré-histórica de 400 milhões de anos fossilizada em rocha ferrosa.',
    museumDesc: 'Um dos primeiros habitantes do oceano primordial perfeitamente preservado em rocha.'
  },
  meteorito_espacial: {
    id: 'meteorito_espacial',
    name: 'Fragmento de Meteorito Sideral',
    scenario: 'floresta',
    rarity: 'lendario',
    sellValue: 5500,
    minTier: 4,
    weight: 1.2,
    category: 'mineral',
    icon: '☄️',
    desc: 'Pedra escura com crosta de fusão e padrões de Widmanstätten. Veio de além das estrelas!',
    museumDesc: 'Núcleo de ferro-níquel proveniente de um asteroide mais antigo que a própria Terra.'
  },
  cristal_cosmico: {
    id: 'cristal_cosmico',
    name: 'Cristal Cósmico Energizado',
    scenario: 'floresta',
    rarity: 'mitico',
    sellValue: 12000,
    minTier: 5,
    weight: 0.3,
    category: 'mineral',
    icon: '🌌',
    desc: 'Um mineral impossível que pulsa em sintonia com a Lua Sangrenta e o Eclipse. Energia pura.',
    museumDesc: 'Artefato mineral de origem desconhecida que desafia todas as leis da física moderna.'
  }
};

// ═══ SISTEMA DA OFICINA DE FORJA (Melhorias Permanentes) ═══
const FORGE_RECIPES = [
  {
    id: 'linha_reforcada',
    name: 'Linha de Pesca com Alma de Aço',
    icon: '🧵',
    desc: 'Aumenta o peso de TODOS os peixes pescados em +15%.',
    materials: {
      minerio_ferro: 5,
      chaveiro_antigo: 2
    },
    effect: 'fish_weight_mult',
    effectValue: 0.15
  },
  {
    id: 'carretel_precisao',
    name: 'Carretel de Precisão Monark',
    icon: '⚙️',
    desc: 'Engrenagens balanceadas reduzem o tempo de espera da fisgada em 25%.',
    materials: {
      bicicleta_retro: 1,
      pedra_pirita: 4,
      minerio_ferro: 6
    },
    effect: 'fishing_speed_boost',
    effectValue: 0.25
  },
  {
    id: 'propulsor_mergulhador',
    name: 'Propulsor Turbo do Mergulhador',
    icon: '🛴',
    desc: 'Equipa o Mergulhador Amigo com um motorzinho subaquático: ele pesca 35% mais rápido!',
    materials: {
      camera_gopro: 2,
      celular_flip: 1,
      minerio_ferro: 8
    },
    effect: 'auto_fisher_speed_boost',
    effectValue: 0.35
  },
  {
    id: 'gazua_mestre',
    name: 'Gazua Mestre de Platina',
    icon: '🗝️',
    desc: 'Permite abrir os "Cofres Pequenos Trancados" encontrados na Ponte para revelar seus tesouros!',
    materials: {
      alianca_diamante: 1,
      chaveiro_antigo: 4,
      minerio_ferro: 10
    },
    effect: 'unlock_chests',
    effectValue: 1
  },
  {
    id: 'antena_ressonancia',
    name: 'Antena de Ressonância Celestial',
    icon: '📡',
    desc: 'Aumenta em +50% a chance de Peixe Dourado e peixes da Lua Sangrenta aparecerem!',
    materials: {
      geodo_ametista: 3,
      quartzo_prismatico: 2,
      meteorito_espacial: 1
    },
    effect: 'rare_event_luck',
    effectValue: 0.50
  }
];

// ═══ SISTEMA DO MUSEU DAS CURIOSIDADES ═══
const MUSEUM_COLLECTIONS = {
  ponte: {
    id: 'ponte',
    name: 'Coleção Arqueologia Urbana (Ponte)',
    icon: '🌉',
    scenario: 'ponte',
    itemIds: ['lata_vintage', 'chaveiro_antigo', 'sinal_transito', 'bicicleta_retro', 'carrinho_mercado', 'celular_flip', 'cofre_trancado'],
    rewardDesc: 'Bônus de Conjunto: +12% no valor de venda de TODOS os peixes do balde!',
    perk: 'fish_sell_bonus',
    perkValue: 0.12
  },
  praia: {
    id: 'praia',
    name: 'Coleção Relíquias da Costa (Praia)',
    icon: '🏖️',
    scenario: 'praia',
    itemIds: ['moedas_estrangeiras', 'protetor_vintage', 'oculos_sol', 'camera_gopro', 'relogio_ouro', 'alianca_diamante', 'colar_perolas'],
    rewardDesc: 'Bônus de Conjunto: +15% de chance de Pesca Dupla (pescar 2 peixes em um único clique)!',
    perk: 'double_catch_chance',
    perkValue: 0.15
  },
  floresta: {
    id: 'floresta',
    name: 'Coleção Geológica & Espacial (Floresta)',
    icon: '🌲',
    scenario: 'floresta',
    itemIds: ['minerio_ferro', 'pedra_pirita', 'geodo_ametista', 'quartzo_prismatico', 'fossil_trilobita', 'meteorito_espacial', 'cristal_cosmico'],
    rewardDesc: 'Bônus de Conjunto: Mergulhador Amigo tem o dobro de chance de achar novos tiers de ímã e minérios raros!',
    perk: 'magnet_luck_boost',
    perkValue: 2.0
  }
};

export {
  MAGNET_TIERS,
  MAGNET_SCENARIOS,
  MAGNET_ITEMS,
  FORGE_RECIPES,
  MUSEUM_COLLECTIONS
};

