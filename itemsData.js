// Loja — REBALANCEADO: preços muito mais altos, bônus menores, escalamento agressivo

export const RODS = [
  { id:'vara_bambu',   name:'Vara de Bambu',           price:0,      power:1,   luckBonus:0,    speedBonus:0,    icon:'rod', desc:'Rústica e fraca. Seu humilde começo.',      unlocked:true },
  { id:'vara_fibra',   name:'Vara de Fibra de Vidro',  price:200,    power:1.3, luckBonus:0.02, speedBonus:0.05, icon:'rod', desc:'Um pouco mais flexível e resistente.',       unlocked:false },
  { id:'vara_carbono',  name:'Vara de Carbono',        price:1200,   power:1.7, luckBonus:0.05, speedBonus:0.10, icon:'rod', desc:'Leve e confiável para pescadores sérios.',    unlocked:false },
  { id:'vara_aco',      name:'Vara de Aço Temperado',  price:5000,   power:2.2, luckBonus:0.08, speedBonus:0.15, icon:'rod', desc:'Muito forte, suporta grandes capturas.',     unlocked:false },
  { id:'vara_dourada',  name:'Vara Dourada do Mestre',  price:18000,  power:3.0, luckBonus:0.12, speedBonus:0.22, icon:'rod', desc:'Banhada a ouro, atrai peixes melhores.',     unlocked:false },
  { id:'vara_titanio',  name:'Vara de Titânio Turbo',   price:65000,  power:4.0, luckBonus:0.18, speedBonus:0.30, icon:'rod', desc:'Tecnologia militar aplicada à pesca.',        unlocked:false },
  { id:'vara_cosmica',  name:'Vara Cósmica Astral',     price:250000, power:6.0, luckBonus:0.30, speedBonus:0.45, icon:'rod', desc:'Imbuída com poeira estelar primordial.',     unlocked:false },
  { id:'vara_travessia',name:'Vara da Travessia Astral',price:600000, power:9.0, luckBonus:0.45, speedBonus:0.60, icon:'rod', desc:'Artefato lendário final da V1. Chave para atravessar para o próximo mundo.', unlocked:false }
];

export function isCosmicOrHigherRod(rodId) {
  const cosmicTierIdx = RODS.findIndex(r => r.id === 'vara_cosmica');
  if (cosmicTierIdx === -1) return false;
  const currentIdx = RODS.findIndex(r => r.id === rodId);
  return currentIdx >= cosmicTierIdx;
}

export const BAITS = [
  { id:'minhoca',            name:'Minhoca da Terra',            price:0,      tier:1, luckMultiplier:1.0,  doubleCatchBonus:0,    icon:'bait', desc:'Isca básica para peixes comuns.',      unlocked:true },
  { id:'camarao',            name:'Camarão Fresco',               price:350,    tier:2, luckMultiplier:1.10, doubleCatchBonus:0.02, icon:'bait', desc:'Aroma que atrai peixes um pouco melhores.', unlocked:false },
  { id:'isca_brilhante',     name:'Isca Neon Glow',               price:2000,   tier:3, luckMultiplier:1.25, doubleCatchBonus:0.05, icon:'bait', desc:'Brilha no escuro, atraindo raros.',    unlocked:false },
  { id:'queijo_mistico',     name:'Massa Mística Fermentada',     price:12000,  tier:4, luckMultiplier:1.50, doubleCatchBonus:0.08, icon:'bait', desc:'Fórmula secreta com ervas arcanas.',   unlocked:false },
  { id:'ouro_liquido',       name:'Gota de Éter Divino',          price:80000,  tier:5, luckMultiplier:2.00, doubleCatchBonus:0.15, icon:'bait', desc:'Vibra na frequência dos deuses aquáticos.', unlocked:false },
  { id:'essencia_travessia', name:'Essência do Vórtice Dimensional', price:250000, tier:6, luckMultiplier:2.50, doubleCatchBonus:0.25, icon:'bait', desc:'Exala névoa dimensional que rompe fronteiras. Requisito para o próximo mundo.', unlocked:false }
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
    desc: 'Aumenta o espaço no balde. Começa com 10.',
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
    id: 'boia_sorte',
    name: 'Bóia Trevo de 4 Folhas',
    basePrice: 350,
    priceMultiplier: 1.75,
    level: 0,
    maxLevel: 10,
    icon: 'boia_sorte',
    desc: 'Aumenta levemente a chance de peixes raros.',
    getValue: (lvl) => lvl * 0.025 // +2.5% por nível (max 25%)
  },
  {
    id: 'rede_dupla',
    name: 'Rede de Fisgada Dupla',
    basePrice: 600,
    priceMultiplier: 2.0,
    level: 0,
    maxLevel: 8,
    icon: 'rede_dupla',
    desc: 'Chance de pescar dois peixes de uma vez.',
    getValue: (lvl) => lvl * 0.03 // +3% por nível (max 24%)
  },
  {
    id: 'aquario_cap',
    name: 'Expansão do Aquário',
    basePrice: 800,
    priceMultiplier: 1.65,
    level: 0,
    maxLevel: 12,
    icon: 'aquario_cap',
    desc: 'Aumenta slots do aquário. Buffs são 1.5x mais fortes lá!',
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
  }
];
