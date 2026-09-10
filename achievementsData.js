// Base de dados das Conquistas (Sala de Troféus)

export const ACHIEVEMENTS = [
  // ── VARAS (7 individuais + 1 mestre) ──
  {
    id: 'rod_vara_bambu',
    category: 'rods',
    title: 'Primeiro Arremesso',
    desc: 'Comece sua jornada com a humilde Vara de Bambu.',
    icon: 'rod',
    check: (g) => g.unlockedRods.includes('vara_bambu')
  },
  {
    id: 'rod_vara_fibra',
    category: 'rods',
    title: 'Flexibilidade Moderna',
    desc: 'Desbloqueie a Vara de Fibra de Vidro.',
    icon: 'rod',
    check: (g) => g.unlockedRods.includes('vara_fibra')
  },
  {
    id: 'rod_vara_carbono',
    category: 'rods',
    title: 'Leveza e Firmeza',
    desc: 'Desbloqueie a Vara de Carbono.',
    icon: 'rod',
    check: (g) => g.unlockedRods.includes('vara_carbono')
  },
  {
    id: 'rod_vara_aco',
    category: 'rods',
    title: 'Resistência de Aço',
    desc: 'Desbloqueie a Vara de Aço Temperado.',
    icon: 'rod',
    check: (g) => g.unlockedRods.includes('vara_aco')
  },
  {
    id: 'rod_vara_dourada',
    category: 'rods',
    title: 'Toque de Midas',
    desc: 'Desbloqueie a lendária Vara Dourada do Mestre.',
    icon: 'rod',
    check: (g) => g.unlockedRods.includes('vara_dourada')
  },
  {
    id: 'rod_vara_titanio',
    category: 'rods',
    title: 'Engenharia Turbo',
    desc: 'Desbloqueie a avançada Vara de Titânio Turbo.',
    icon: 'rod',
    check: (g) => g.unlockedRods.includes('vara_titanio')
  },
  {
    id: 'rod_vara_cosmica',
    category: 'rods',
    title: 'Poder Astral',
    desc: 'Desbloqueie a suprema Vara Cósmica Astral.',
    icon: 'rod',
    check: (g) => g.unlockedRods.includes('vara_cosmica')
  },
  {
    id: 'rod_vara_travessia',
    category: 'rods',
    title: 'Fenda Dimensional',
    desc: 'Desbloqueie a lendária Vara da Travessia Astral.',
    icon: 'rod',
    check: (g) => g.unlockedRods.includes('vara_travessia')
  },
  {
    id: 'all_rods',
    category: 'rods',
    title: 'Arsenal Completo',
    desc: 'Possua todas as 8 varas de pesca disponíveis.',
    icon: 'trophy',
    check: (g) => ['vara_bambu', 'vara_fibra', 'vara_carbono', 'vara_aco', 'vara_dourada', 'vara_titanio', 'vara_cosmica', 'vara_travessia']
      .every(r => g.unlockedRods.includes(r))
  },

  // ── ISCAS (5 individuais + 1 mestre) ──
  {
    id: 'bait_minhoca',
    category: 'baits',
    title: 'Isca Clássica',
    desc: 'Comece sua pescaria com a tradicional Minhoca da Terra.',
    icon: 'bait',
    check: (g) => g.unlockedBaits.includes('minhoca')
  },
  {
    id: 'bait_camarao',
    category: 'baits',
    title: 'Sabor Marinho',
    desc: 'Desbloqueie a apetitosa Isca de Camarão Fresco.',
    icon: 'bait',
    check: (g) => g.unlockedBaits.includes('camarao')
  },
  {
    id: 'bait_isca_brilhante',
    category: 'baits',
    title: 'Farol Subaquático',
    desc: 'Desbloqueie a reluzente Isca Neon Glow.',
    icon: 'bait',
    check: (g) => g.unlockedBaits.includes('isca_brilhante')
  },
  {
    id: 'bait_queijo_mistico',
    category: 'baits',
    title: 'Receita Secreta',
    desc: 'Desbloqueie a aromática Massa Mística Fermentada.',
    icon: 'bait',
    check: (g) => g.unlockedBaits.includes('queijo_mistico')
  },
  {
    id: 'bait_ouro_liquido',
    category: 'baits',
    title: 'Bênção Divina',
    desc: 'Desbloqueie a preciosa Gota de Éter Divino.',
    icon: 'bait',
    check: (g) => g.unlockedBaits.includes('ouro_liquido')
  },
  {
    id: 'bait_essencia_travessia',
    category: 'baits',
    title: 'Rasgo no Espaço',
    desc: 'Desbloqueie a lendária Essência do Vórtice Dimensional.',
    icon: 'bait',
    check: (g) => g.unlockedBaits.includes('essencia_travessia')
  },
  {
    id: 'all_baits',
    category: 'baits',
    title: 'Mestre dos Aromas',
    desc: 'Possua todas as 6 iscas especiais de pescaria.',
    icon: 'trophy',
    check: (g) => ['minhoca', 'camarao', 'isca_brilhante', 'queijo_mistico', 'ouro_liquido', 'essencia_travessia']
      .every(b => g.unlockedBaits.includes(b))
  },

  // ── UPGRADES (Todos os upgrades comprados) ──
  {
    id: 'all_upgrades_level1',
    category: 'upgrades',
    title: 'Oficina Completa',
    desc: 'Adquira pelo menos 1 nível de todos os 7 upgrades da loja.',
    icon: 'tools',
    check: (g) => {
      const required = ['balde', 'auto_pescador', 'boia_sorte', 'rede_dupla', 'aquario_cap', 'auto_vendedor', 'ima_dourado'];
      return required.every(uId => (g.upgradeLevels[uId] || 0) >= 1);
    }
  },

  // ── PEIXES E METAS ──
  {
    id: 'first_catch',
    category: 'fish',
    title: 'Primeira Fisgada',
    desc: 'Pesque com sucesso o seu primeiro peixe!',
    icon: 'fish',
    check: (g) => g.totalCatches >= 1
  },
  {
    id: 'catch_100',
    category: 'fish',
    title: 'Pescador Dedicado',
    desc: 'Capture 100 peixes em sua carreira.',
    icon: 'fish',
    check: (g) => g.totalCatches >= 100
  },
  {
    id: 'all_fish_discovered',
    category: 'fish',
    title: 'Mestre dos Mares',
    desc: 'Descubra todas as 21 espécies de peixes na Enciclopédia!',
    icon: 'trophy',
    check: (g) => Object.keys(g.discoveredFish || {}).length >= 21
  },
  {
    id: 'golden_fish_caught',
    category: 'fish',
    title: 'Sorte Dourada',
    desc: 'Colete ou atraia um raro Peixe Dourado (Golden Fish).',
    icon: 'sparkle',
    check: (g) => (g.goldenFishCatches || 0) >= 1
  },
  {
    id: 'first_aquarium',
    category: 'fish',
    title: 'Novo Lar',
    desc: 'Coloque o seu primeiro peixe com buff para viver no aquário.',
    icon: 'aquarium',
    check: (g) => (g.aquarium || []).length >= 1
  },
  {
    id: 'chapter1_complete',
    category: 'fish',
    title: 'Fim do Capítulo 1: O Portal',
    desc: 'Obtenha a Vara da Travessia e a Essência do Vórtice para despertar o Portal Dimensional!',
    icon: 'portal',
    check: (g) => g.unlockedRods.includes('vara_travessia') && g.unlockedBaits.includes('essencia_travessia')
  }
];
