// Base de dados de peixes e raridades — REBALANCEADO para progressão lenta e desafiadora
export const RARITIES = {
  COMUM:    { id: 'COMUM',    label: 'Comum',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: '#64748b', chance: 72 },
  INCOMUM:  { id: 'INCOMUM',  label: 'Incomum',  color: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: '#0284c7', chance: 20 },
  RARO:     { id: 'RARO',     label: 'Raro',     color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: '#9333ea', chance: 5.5 },
  EPICO:    { id: 'EPICO',    label: 'Épico',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: '#d97706', chance: 1.8 },
  LENDARIO: { id: 'LENDARIO', label: 'Lendário', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: '#dc2626', chance: 0.55 },
  MITICO:   { id: 'MITICO',   label: 'Mítico',   color: '#ec4899', bg: 'linear-gradient(135deg,rgba(236,72,153,0.2),rgba(168,85,247,0.2))', border: '#ec4899', chance: 0.07 }
};

export const FISH_LIST = [
  // ── COMUNS (valores baixos, sem buffs) ──
  { id:'lambari',  name:'Lambari Prateado',     rarity:'COMUM', icon:'lambari',  minWeight:0.05, maxWeight:0.3,  baseValue:2,  desc:'Minúsculo e abundante nos rios rasos.', buff:null },
  { id:'tilapia',  name:'Tilápia do Nilo',      rarity:'COMUM', icon:'tilapia',  minWeight:0.3,  maxWeight:1.8,  baseValue:4,  desc:'Saborosa mas não vale muito no mercado.', buff:null },
  { id:'sardinha', name:'Sardinha Costeira',     rarity:'COMUM', icon:'sardinha', minWeight:0.1,  maxWeight:0.5,  baseValue:3,  desc:'Nada em cardumes rápidos e superficiais.', buff:null },
  { id:'carpa',    name:'Carpa Comum',           rarity:'COMUM', icon:'carpa',    minWeight:0.6,  maxWeight:3.0,  baseValue:5,  desc:'Peixe resistente que se contenta com pouco.', buff:null },
  { id:'bagre',    name:'Bagre Bigodudo',        rarity:'COMUM', icon:'bagre',    minWeight:0.5,  maxWeight:2.5,  baseValue:6,  desc:'Mora no lodo do fundo, alimenta-se de restos.', buff:null },
  { id:'piranha',  name:'Piranha Vermelha',      rarity:'COMUM', icon:'piranha',  minWeight:0.2,  maxWeight:1.2,  baseValue:5,  desc:'Perigosa em cardume, solitária é inofensiva.', buff:null },

  // ── INCOMUNS (valores modestos, sem buffs) ──
  { id:'robalo',       name:'Robalo Flecha',         rarity:'INCOMUM', icon:'robalo',       minWeight:1.0,  maxWeight:4.5,  baseValue:15,  desc:'Ágil e brigador, exige paciência.', buff:null },
  { id:'truta',        name:'Truta Arco-Íris',       rarity:'INCOMUM', icon:'truta',        minWeight:0.8,  maxWeight:3.5,  baseValue:18,  desc:'Escamas iridescentes sob águas límpidas.', buff:null },
  { id:'salmao',       name:'Salmão Selvagem',       rarity:'INCOMUM', icon:'salmao',       minWeight:1.5,  maxWeight:6.0,  baseValue:25,  desc:'Nada contra a correnteza com garra.', buff:null },
  { id:'peixe_palhaco',name:'Peixe-Palhaço Tropical', rarity:'INCOMUM', icon:'palhaco',      minWeight:0.2,  maxWeight:0.8,  baseValue:20,  desc:'Laranja vibrante com listras brancas.', buff:null },
  { id:'pescada',      name:'Pescada Amarela',        rarity:'INCOMUM', icon:'pescada',      minWeight:1.2,  maxWeight:5.0,  baseValue:22,  desc:'Carne apreciada mas pouco rara.', buff:null },

  // ── RAROS (buffs modestos) ──
  { id:'dourado',       name:'Dourado Real',         rarity:'RARO', icon:'dourado',       minWeight:3.0,  maxWeight:12.0, baseValue:60,  desc:'Rei do Rio — seu brilho traz sorte monetária.', buff:{ type:'gold_multiplier', value:0.06, text:'+6% Ouro' } },
  { id:'baiacu_eletrico',name:'Baiacu Elétrico',     rarity:'RARO', icon:'baiacu',        minWeight:0.8,  maxWeight:3.0,  baseValue:70,  desc:'Pulsos elétricos aceleram a puxada.', buff:{ type:'fishing_speed', value:0.08, text:'+8% Vel. Pesca' } },
  { id:'peixe_espada',  name:'Peixe-Espada Azul',    rarity:'RARO', icon:'espada',        minWeight:8.0,  maxWeight:28.0, baseValue:90,  desc:'Velocidade cortante, às vezes fisgando dois.', buff:{ type:'double_catch_chance', value:0.05, text:'+5% Pesca Dupla' } },
  { id:'pirarucu',      name:'Pirarucu Amazônico',   rarity:'RARO', icon:'pirarucu',      minWeight:15.0, maxWeight:60.0, baseValue:120, desc:'Gigante blindado que atrai criaturas nobres.', buff:{ type:'luck_bonus', value:0.04, text:'+4% Sorte' } },

  // ── ÉPICOS (buffs bons, muito raros) ──
  { id:'tubarao_martelo', name:'Tubarão-Martelo Dourado', rarity:'EPICO', icon:'tubarao',  minWeight:25.0, maxWeight:100.0, baseValue:350, desc:'Predador lendário do oceano profundo.', buff:{ type:'gold_multiplier', value:0.12, text:'+12% Ouro' } },
  { id:'arraia_diamante', name:'Arraia Diamante',         rarity:'EPICO', icon:'arraia',   minWeight:12.0, maxWeight:50.0,  baseValue:450, desc:'Desliza com brilho hipnotizante.', buff:{ type:'luck_bonus', value:0.10, text:'+10% Sorte' } },
  { id:'peixe_dragao',   name:'Peixe-Dragão da Fenda',   rarity:'EPICO', icon:'dragao',   minWeight:6.0,  maxWeight:35.0,  baseValue:550, desc:'Cospe chamas azuis no fundo abissal.', buff:{ type:'auto_fish_speed', value:0.15, text:'+15% Vel. Auto' } },

  // ── LENDÁRIOS ──
  { id:'celacanto_anciao',        name:'Celacanto Ancião',        rarity:'LENDARIO', icon:'celacanto', minWeight:35.0,  maxWeight:130.0, baseValue:1800, desc:'Fóssil vivo que aprimora tudo.', buff:{ type:'all_stats', value:0.08, text:'+8% Tudo' } },
  { id:'abissal_bioluminescente', name:'Leviatã Bioluminescente', rarity:'LENDARIO', icon:'leviata',   minWeight:40.0,  maxWeight:180.0, baseValue:2500, desc:'Ilumina a escuridão abissal.', buff:{ type:'double_catch_chance', value:0.12, text:'+12% Pesca Dupla' } },

  // ── MÍTICOS (quase impossíveis) ──
  { id:'serpente_solar', name:'Serpente Solar Cósmica', rarity:'MITICO', icon:'serpente', minWeight:80.0, maxWeight:400.0, baseValue:8000, desc:'Entidade celestial que nada entre estrelas.', buff:{ type:'mythic_mastery', value:0.30, text:'+25% Ouro, +15% Sorte, +10% Dupla' } }
];
