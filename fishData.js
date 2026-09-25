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

// Catálogo único, organizado por camada de profundidade (ver DEPTH_LAYERS em depthData.js).
// Pesos em kg próximos dos reais nos comuns/incomuns; de lendário para cima é fantasia.
export const FISH_LIST = [
  // ── CAMADA 1 ──
  { numId:1, id:'lambari', name:'Lambari Prateado', layer:1, rarity:'COMUM', icon:'lambari', minWeight:0.01, maxWeight:0.05, baseValue:3, desc:'Minúsculo e abundante nos rios rasos.' },
  { numId:2, id:'tilapia', name:'Tilápia do Nilo', layer:1, rarity:'COMUM', icon:'tilapia', minWeight:0.3, maxWeight:2.5, baseValue:4, desc:'Saborosa mas não vale muito no mercado.' },
  { numId:4, id:'carpa', name:'Carpa Comum', layer:1, rarity:'COMUM', icon:'carpa', minWeight:1, maxWeight:10, baseValue:5, desc:'Peixe resistente que se contenta com pouco.' },
  { numId:6, id:'piranha', name:'Piranha Vermelha', layer:1, rarity:'COMUM', icon:'piranha', minWeight:0.2, maxWeight:1.5, baseValue:5, desc:'Perigosa em cardume, solitária é inofensiva.' },
  { numId:29, id:'traira', name:'Traíra', layer:1, rarity:'COMUM', icon:'traira', minWeight:0.3, maxWeight:3, baseValue:4, desc:'Caçadora de tocaia das lagoas, com dentes afiados. Aguenta até água com pouco oxigênio.' },
  { numId:5, id:'bagre', name:'Bagre Bigodudo', layer:1, rarity:'INCOMUM', icon:'bagre', minWeight:0.5, maxWeight:5, baseValue:26, desc:'Mora no lodo do fundo, alimenta-se de restos.' },
  { numId:8, id:'truta', name:'Truta Arco-Íris', layer:1, rarity:'INCOMUM', icon:'truta', minWeight:0.5, maxWeight:4, baseValue:18, desc:'Escamas iridescentes sob águas límpidas.' },
  { numId:30, id:'tucunare', name:'Tucunaré', layer:1, rarity:'INCOMUM', icon:'tucunare', minWeight:0.5, maxWeight:8, baseValue:22, desc:'Tem uma mancha em forma de olho na cauda para confundir os predadores. Briga muito quando fisgado.' },
  { numId:12, id:'dourado', name:'Dourado, o Rei do Rio', layer:1, rarity:'RARO', icon:'dourado', minWeight:2, maxWeight:25, baseValue:60, desc:'Predador dourado dos rios brasileiros, salta alto quando fisgado. Seu brilho traz sorte monetária.' },
  { numId:31, id:'tambaqui', name:'Tambaqui', layer:1, rarity:'RARO', icon:'tambaqui', minWeight:3, maxWeight:30, baseValue:85, desc:'Come frutas e sementes que caem na água durante a cheia da Amazônia. Tem dentes quase humanos.' },
  { numId:32, id:'poraque', name:'Poraquê Trovão', layer:1, rarity:'EPICO', icon:'poraque', minWeight:5, maxWeight:20, baseValue:450, desc:'O poraquê real dá choques de até 860 volts. Este carrega a força de uma tempestade inteira.' },
  { numId:15, id:'pirarucu', name:'Pirarucu Ancião', layer:1, rarity:'LENDARIO', icon:'pirarucu', minWeight:30, maxWeight:200, baseValue:3000, desc:'Um dos maiores peixes de água doce do mundo: passa de 2 m e sobe à superfície para respirar ar.' },
  { numId:33, id:'boiuna', name:'Boiúna, a Cobra Grande', layer:1, rarity:'MITICO', icon:'boiuna', minWeight:300, maxWeight:1500, baseValue:8800, desc:'Da lenda amazônica: a cobra gigante que vira barco e abre os leitos dos rios com o próprio corpo.' },
  // ── CAMADA 2 ──
  { numId:3, id:'sardinha', name:'Sardinha Costeira', layer:2, rarity:'COMUM', icon:'sardinha', minWeight:0.05, maxWeight:0.2, baseValue:7, desc:'Nada em cardumes rápidos e superficiais.' },
  { numId:11, id:'pescada', name:'Pescada Amarela', layer:2, rarity:'COMUM', icon:'pescada', minWeight:0.5, maxWeight:4, baseValue:11, desc:'Carne apreciada mas pouco rara.' },
  { numId:34, id:'cavala', name:'Cavala', layer:2, rarity:'COMUM', icon:'cavala', minWeight:0.3, maxWeight:2, baseValue:10, desc:'Nada em cardumes enormes e velozes perto da superfície do mar.' },
  { numId:7, id:'robalo', name:'Robalo Flecha', layer:2, rarity:'INCOMUM', icon:'robalo', minWeight:1, maxWeight:20, baseValue:38, desc:'Ágil e brigador, exige paciência.' },
  { numId:9, id:'salmao', name:'Salmão Selvagem', layer:2, rarity:'INCOMUM', icon:'salmao', minWeight:2, maxWeight:15, baseValue:63, desc:'Nada contra a correnteza com garra.' },
  { numId:10, id:'peixe_palhaco', name:'Peixe-Palhaço Tropical', layer:2, rarity:'INCOMUM', icon:'palhaco', minWeight:0.05, maxWeight:0.25, baseValue:50, desc:'Laranja vibrante com listras brancas.' },
  { numId:13, id:'baiacu_eletrico', name:'Baiacu Elétrico', layer:2, rarity:'RARO', icon:'baiacu', minWeight:0.5, maxWeight:3, baseValue:175, desc:'Pulsos elétricos aceleram a puxada.' },
  { numId:14, id:'peixe_espada', name:'Espadarte Azul', layer:2, rarity:'RARO', icon:'espada', minWeight:50, maxWeight:400, baseValue:225, desc:'Usa o bico em forma de espada para cortar cardumes. Um dos peixes mais rápidos do oceano.' },
  { numId:35, id:'dourado_mar', name:'Dourado-do-Mar', layer:2, rarity:'RARO', icon:'dourado_mar', minWeight:5, maxWeight:40, baseValue:235, desc:'O mahi-mahi muda de cor quando é fisgado, do verde-dourado ao azul.' },
  { numId:16, id:'tubarao_martelo', name:'Tubarão-Martelo Dourado', layer:2, rarity:'EPICO', icon:'tubarao', minWeight:80, maxWeight:450, baseValue:875, desc:'Predador lendário do oceano profundo.' },
  { numId:17, id:'arraia_diamante', name:'Arraia-Manta Diamante', layer:2, rarity:'EPICO', icon:'arraia', minWeight:300, maxWeight:1350, baseValue:1150, desc:'A maior arraia do mundo, com até 7 m de envergadura. Esta brilha como diamante.' },
  { numId:36, id:'atum', name:'Atum-Rabilho', layer:2, rarity:'EPICO', icon:'atum', minWeight:100, maxWeight:680, baseValue:1350, desc:'Passa de 600 kg e nada a mais de 70 km/h, cruzando oceanos inteiros.' },
  { numId:37, id:'peixe_lua', name:'Peixe-Lua', layer:2, rarity:'EPICO', icon:'peixe_lua', minWeight:250, maxWeight:2300, baseValue:1250, desc:'O maior peixe ósseo do mundo, com mais de 2 toneladas. Toma sol deitado na superfície.' },
  { numId:21, id:'peixe_sol_radiante', name:'Peixe-Sol Radiante', layer:2, rarity:'LENDARIO', icon:'peixe_sol', timeExclusive:'day', minWeight:30, maxWeight:110, baseValue:5500, desc:'Brilha com o calor dourado do meio-dia. Só emerge sob o sol pleno.' },
  { numId:22, id:'guardiao_crepusculo', name:'Guardião do Crepúsculo', layer:2, rarity:'LENDARIO', icon:'crepusculo', timeExclusive:'sunset', minWeight:35, maxWeight:140, baseValue:6000, desc:'Nada nas águas violeta do entardecer nos breves minutos do poente.' },
  { numId:23, id:'tubarao_fantasma_lunar', name:'Tubarão Fantasma Lunar', layer:2, rarity:'LENDARIO', icon:'tubarao_lunar', timeExclusive:'night', minWeight:45, maxWeight:160, baseValue:6500, desc:'Espectro prateado fluorescente que só vaga sob o luar da meia-noite.' },
  { numId:105, id:'arraia_coral_celeste', name:'Arraia Solar dos Corais', layer:2, rarity:'LENDARIO', icon:'arraia_coral', minWeight:35, maxWeight:140, baseValue:4000, desc:'Suas asas translúcidas absorvem a luz dos corais cósmicos, brilhando como um vitral místico no oceano.' },
  { numId:24, id:'serpente_solar', name:'Serpente Solar Cósmica', layer:2, rarity:'MITICO', icon:'serpente', minWeight:80, maxWeight:400, baseValue:20000, desc:'Entidade celestial que nada entre estrelas.' },
  { numId:25, id:'leviata_prisma_solar', name:'Leviatã do Prisma Solar', layer:2, rarity:'MITICO', icon:'prisma_solar', timeExclusive:'day', minWeight:75, maxWeight:380, baseValue:21500, desc:'Colosso celestial que refrata a luz solar em feixes de energia pura.' },
  { numId:26, id:'fenix_ocaso_eterno', name:'Fênix do Ocaso Eterno', layer:2, rarity:'MITICO', icon:'fenix_ocaso', timeExclusive:'sunset', minWeight:80, maxWeight:420, baseValue:22500, desc:'Manifestação astral nascida do abraço entre o fogo solar e o crepúsculo.' },
  // ── CAMADA 3 ──
  { numId:101, id:'camarao_neon', name:'Camarão Neon Cristalino', layer:3, rarity:'COMUM', icon:'camarao_neon', migratesUp:true, minWeight:0.01, maxWeight:0.05, baseValue:17, desc:'Pequeno camarão da penumbra que sobe à noite para comer perto da superfície. Carapaça translúcida que emite pulsos azulados.' },
  { numId:102, id:'peixe_lanterna_prisma', name:'Peixe-Lanterna Prismático', layer:3, rarity:'COMUM', icon:'peixe_lanterna', migratesUp:true, minWeight:0.01, maxWeight:0.05, baseValue:17, desc:'Os peixes-lanterna são os vertebrados mais numerosos do planeta e sobem toda noite para caçar. Este refrata a luz em arco-íris.' },
  { numId:103, id:'agua_viva_aurora', name:'Água-Viva da Aurora Oceânica', layer:3, rarity:'INCOMUM', icon:'agua_viva_aurora', minWeight:0.5, maxWeight:5, baseValue:84, desc:'Tentáculos elétricos que parecem faixas da aurora boreal sob as águas salgadas.' },
  { numId:38, id:'peixe_machado', name:'Peixe-Machado', layer:3, rarity:'INCOMUM', icon:'peixe_machado', minWeight:0.01, maxWeight:0.03, baseValue:120, desc:'Achatado como uma lâmina, acende luzes na barriga para sumir contra a claridade de cima.' },
  { numId:104, id:'polvo_cintilante_rei', name:'Polvo Cintilante Rei', layer:3, rarity:'RARO', icon:'polvo_cintilante', minWeight:2, maxWeight:15, baseValue:355, desc:'Mestre da camuflagem neon. Suas ventosas absorvem a luz da água para emitir choques energéticos.' },
  { numId:39, id:'lula_humboldt', name:'Lula-de-Humboldt', layer:3, rarity:'RARO', icon:'lula_humboldt', migratesUp:true, minWeight:5, maxWeight:50, baseValue:560, desc:'O diabo-vermelho: caça em bandos e pisca em vermelho e branco. Sobe à noite para caçar.' },
  { numId:18, id:'peixe_dragao', name:'Peixe-Dragão da Fenda', layer:3, rarity:'EPICO', icon:'dragao', minWeight:6, maxWeight:35, baseValue:3300, desc:'Cospe chamas azuis no fundo abissal.' },
  { numId:121, id:'tubarao_duende_vazio', name:'Tubarão-Duende', layer:3, rarity:'EPICO', icon:'tubarao_duende', minWeight:50, maxWeight:210, baseValue:3500, desc:'Fóssil vivo de focinho comprido que dispara a mandíbula para fora ao atacar. Vive entre 270 m e 1.300 m.' },
  { numId:19, id:'celacanto_anciao', name:'Celacanto Ancião', layer:3, rarity:'LENDARIO', icon:'celacanto', minWeight:40, maxWeight:90, baseValue:11000, desc:'Dado como extinto há 66 milhões de anos até ser pescado em 1938. Fóssil vivo que aprimora tudo.' },
  { numId:106, id:'serpente_coral_primordial', name:'Serpente Peixe-Remo', layer:3, rarity:'LENDARIO', icon:'serpente_coral', minWeight:50, maxWeight:270, baseValue:9650, desc:'O peixe-remo passa de 8 m e deu origem às lendas de serpente marinha. Este é coberto de corais vivos.' },
  { numId:27, id:'kraken_abismo_estelar', name:'Kraken', layer:3, rarity:'MITICO', icon:'kraken_estelar', minWeight:200, maxWeight:1200, baseValue:57500, desc:'A lula-gigante real chega a 13 m. Esta cresceu além de qualquer registro e arrasta navios para a penumbra.' },
  // ── CAMADA 4 ──
  { numId:113, id:'arenque_fantasma', name:'Arenque Fantasmagórico', layer:4, rarity:'COMUM', icon:'arenque_fantasma', minWeight:0.1, maxWeight:0.5, baseValue:65, desc:'Nadando em cardumes espectrais por entre as cabines inundadas dos navios perdidos.' },
  { numId:40, id:'peixe_bolha', name:'Peixe-Bolha', layer:4, rarity:'COMUM', icon:'peixe_bolha', minWeight:0.3, maxWeight:2, baseValue:66, desc:'No fundo tem forma de peixe; só fica “derretido” quando sai da pressão das profundezas.' },
  { numId:114, id:'enguia_espectral', name:'Enguia-Pelicano', layer:4, rarity:'INCOMUM', icon:'enguia_espectral', minWeight:1, maxWeight:3, baseValue:330, desc:'Tem uma boca enorme que abre como uma rede para engolir presas maiores que ela. Vive entre os galeões naufragados.' },
  { numId:41, id:'peixe_vibora', name:'Peixe-Víbora', layer:4, rarity:'INCOMUM', icon:'peixe_vibora', minWeight:0.05, maxWeight:0.4, baseValue:300, desc:'Tem dentes tão compridos que não cabem na boca fechada. Atrai presas com luzes no corpo.' },
  { numId:115, id:'peixe_cofre_pirata', name:'Peixe-Cofre do Barba-Negra', layer:4, rarity:'RARO', icon:'peixe_cofre', minWeight:4, maxWeight:16, baseValue:1450, desc:'Armadura óssea cúbica incrustada com moedas de ouro e conchas amaldiçoadas.' },
  { numId:120, id:'peixe_diabo_negro', name:'Tamboril Diabo-Negro', layer:4, rarity:'RARO', icon:'peixe_diabo', minWeight:2, maxWeight:10, baseValue:1650, desc:'Peixe-pescador das profundezas: atrai presas no escuro com uma isca luminosa presa à cabeça.' },
  { numId:116, id:'tubarao_amaldicoado', name:'Tubarão Espectro dos Mares', layer:4, rarity:'EPICO', icon:'tubarao_espectro', minWeight:200, maxWeight:900, baseValue:8100, desc:'Vigia eterno dos tesouros perdidos. Seus olhos vazios não sentem piedade nem medo.' },
  { numId:122, id:'polvo_vampiro_hadal', name:'Lula-Vampiro', layer:4, rarity:'EPICO', icon:'polvo_vampiro', minWeight:22, maxWeight:85, baseValue:8800, desc:'Nem lula nem polvo: vive onde quase não há oxigênio e se vira do avesso quando ameaçada.' },
  { numId:42, id:'tubarao_groenlandia', name:'Tubarão-da-Groenlândia', layer:4, rarity:'EPICO', icon:'tubarao_groenlandia', minWeight:400, maxWeight:1400, baseValue:8100, desc:'Pode viver 400 anos, o vertebrado mais longevo que se conhece. Nada devagar no escuro gelado.' },
  { numId:20, id:'abissal_bioluminescente', name:'Leviatã Bioluminescente', layer:4, rarity:'LENDARIO', icon:'leviata', minWeight:500, maxWeight:2200, baseValue:37500, desc:'Ilumina a escuridão abissal.' },
  { numId:117, id:'espadarte_fantasma', name:'Peixe-Espadachim dos Destroços', layer:4, rarity:'LENDARIO', icon:'espadarte_fantasma', minWeight:300, maxWeight:1600, baseValue:36500, desc:'Lâmina óssea incrustada com dobrões piratas. Corta as redes antigas com velocidade sobrenatural.' },
  { numId:118, id:'kraken_dos_galeoes', name:'Terror Espectral dos Destroços', layer:4, rarity:'MITICO', icon:'kraken_galeoes', minWeight:800, maxWeight:3500, baseValue:114000, desc:'O monstro lendário que arrastou frotas coloniais inteiras para o fundo. Guarda o maior tesouro do mundo.' },
  { numId:28, id:'lampreia_negra', name:'Lampreia Negra do Vazio', layer:4, rarity:'SECRETO', icon:'lampreia_negra', secret:true, minWeight:400, maxWeight:2800, baseValue:270000, desc:'Criatura abissal ancestral nascida das fendas do vácuo. Seu corpo negro absorve a luz e emana uma sinistra aura carmesim.' },
  // ── CAMADA 5 ──
  { numId:107, id:'caranguejo_obsidiana', name:'Caranguejo de Obsidiana', layer:5, rarity:'COMUM', icon:'caranguejo_obsidiana', minWeight:1, maxWeight:5, baseValue:147, desc:'Alimenta-se do enxofre das chaminés vulcânicas. Sua carapaça é dura como vidro vulcânico.' },
  { numId:43, id:'granadeiro', name:'Granadeiro', layer:5, rarity:'COMUM', icon:'granadeiro', minWeight:0.5, maxWeight:3, baseValue:210, desc:'Também chamado de peixe-rato: o peixe mais comum do fundo abissal, com cauda fina como um chicote.' },
  { numId:108, id:'carpa_magmatica', name:'Carpa Magmática', layer:5, rarity:'INCOMUM', icon:'carpa_magmatica', minWeight:3, maxWeight:12, baseValue:735, desc:'Suas escamas retêm calor suficiente para ferver a água ao redor quando assustada.' },
  { numId:44, id:'peixe_tripe', name:'Peixe-Tripé', layer:5, rarity:'INCOMUM', icon:'peixe_tripe', minWeight:0.2, maxWeight:1, baseValue:1155, desc:'Fica parado no fundo apoiado em três nadadeiras compridas, esperando a comida passar.' },
  { numId:109, id:'moreia_de_brasa', name:'Moreia de Brasa Viva', layer:5, rarity:'RARO', icon:'moreia_brasa', minWeight:10, maxWeight:40, baseValue:3150, desc:'Corpo longo e incandescente que desliza pelas fendas rochosas fervilhantes.' },
  { numId:110, id:'tubarao_basaltico', name:'Tubarão de Ferro Basáltico', layer:5, rarity:'EPICO', icon:'tubarao_basaltico', minWeight:300, maxWeight:1500, baseValue:16500, desc:'Carapaça mineral forjada no calor das chaminés hidrotermais. Corta a água fervente como lâmina.' },
  { numId:111, id:'dragao_hidrotermico', name:'Dragão das Fumarolas Negras', layer:5, rarity:'LENDARIO', icon:'dragao_hidrotermico', minWeight:800, maxWeight:3800, baseValue:84750, desc:'Colosso réptil que dorme dentro das crateras ativas, protegido por escamas de ferro basáltico.' },
  { numId:112, id:'fenix_de_magma', name:'Colosso Vulcânico das Profundezas', layer:5, rarity:'MITICO', icon:'fenix_magma', minWeight:1500, maxWeight:6000, baseValue:323250, desc:'Manifestação titânica nascida no coração da crosta terrestre. A água evapora ao redor de suas barbatanas.' },
  // ── CAMADA 6 ──
  { numId:119, id:'isopode_gigante_hadal', name:'Isópode Gigante', layer:6, rarity:'COMUM', icon:'isopode_hadal', minWeight:0.5, maxWeight:2, baseValue:415, desc:'Parente gigante do tatuzinho de jardim, pode ficar anos sem comer no fundo frio.' },
  { numId:45, id:'anfipode', name:'Anfípode Supergigante', layer:6, rarity:'COMUM', icon:'anfipode', minWeight:0.02, maxWeight:0.1, baseValue:320, desc:'Parente das pulgas-do-mar que chega a 34 cm. Vive no fundo das fossas mais profundas.' },
  { numId:46, id:'peixe_caracol', name:'Peixe-Caracol das Marianas', layer:6, rarity:'INCOMUM', icon:'peixe_caracol', minWeight:0.1, maxWeight:0.5, baseValue:1600, desc:'Translúcido e gelatinoso, foi filmado a 8.336 m: o peixe mais fundo já visto.' },
  { numId:47, id:'holoturia', name:'Holotúria de Vidro', layer:6, rarity:'RARO', icon:'holoturia', minWeight:0.3, maxWeight:2, baseValue:6800, desc:'Pepino-do-mar transparente que anda pelo fundo da fossa sobre pezinhos.' },
  { numId:48, id:'polvo_dumbo', name:'Polvo-Dumbo', layer:6, rarity:'EPICO', icon:'polvo_dumbo', minWeight:2, maxWeight:15, baseValue:36000, desc:'Vive a até 7.000 m e “voa” batendo nadadeiras que parecem orelhas de elefante.' },
  { numId:123, id:'quimera_das_profundezas', name:'Quimera Abissal Primordial', layer:6, rarity:'LENDARIO', icon:'quimera_abissal', minWeight:1500, maxWeight:6500, baseValue:239000, desc:'Criatura quase pré-histórica que sobreviveu isolada da luz solar por mais de 400 milhões de anos.' },
  { numId:124, id:'leviata_do_nucleo', name:'Leviatã do Núcleo da Terra', layer:6, rarity:'MITICO', icon:'leviata_nucleo', minWeight:3000, maxWeight:12000, baseValue:915000, desc:'A entidade soberana do leito submarino terrestre. Suas barbatanas causam terremotos submersos.' },
  { numId:125, id:'olho_do_vazio_primordial', name:'O Olho Ancestral do Vazio', layer:6, rarity:'SECRETO', icon:'olho_vazio', secret:true, minWeight:4000, maxWeight:15000, baseValue:1440000, desc:'A própria consciência ancestral da Fossa das Marianas. Quem o contempla recebe as bênçãos do vácuo infinito.' }
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
  lampreia_negra: ['mythic_mastery', 'all_stats', 'gold_multiplier', 'luck_bonus'],
  // Peixes das camadas profundas (antigo Mundo 2)
  arraia_coral_celeste: ['gold_multiplier'],
  camarao_neon: ['luck_bonus'],
  peixe_lanterna_prisma: ['double_catch_chance'],
  agua_viva_aurora: ['fishing_speed'],
  polvo_cintilante_rei: ['gold_multiplier'],
  tubarao_duende_vazio: ['fishing_speed'],
  serpente_coral_primordial: ['gold_multiplier', 'luck_bonus'],
  arenque_fantasma: ['auto_fish_speed'],
  enguia_espectral: ['luck_bonus'],
  peixe_cofre_pirata: ['gold_multiplier'],
  peixe_diabo_negro: ['luck_bonus'],
  tubarao_amaldicoado: ['double_catch_chance'],
  polvo_vampiro_hadal: ['luck_bonus'],
  espadarte_fantasma: ['gold_multiplier'],
  kraken_dos_galeoes: ['gold_multiplier', 'luck_bonus'],
  caranguejo_obsidiana: ['gold_multiplier', 'luck_bonus'],
  carpa_magmatica: ['gold_multiplier'],
  moreia_de_brasa: ['fishing_speed'],
  tubarao_basaltico: ['fishing_speed'],
  dragao_hidrotermico: ['gold_multiplier', 'luck_bonus'],
  fenix_de_magma: ['gold_multiplier', 'luck_bonus'],
  isopode_gigante_hadal: ['luck_bonus'],
  quimera_das_profundezas: ['gold_multiplier', 'luck_bonus'],
  leviata_do_nucleo: ['gold_multiplier', 'luck_bonus'],
  olho_do_vazio_primordial: ['gold_multiplier', 'luck_bonus'],
  // Peixes novos das camadas (v1.7)
  traira: ['gold_multiplier', 'fishing_speed'],
  tucunare: ['fishing_speed', 'double_catch_chance'],
  tambaqui: ['gold_multiplier', 'luck_bonus'],
  poraque: ['fishing_speed', 'auto_fish_speed'],
  boiuna: ['mythic_mastery', 'luck_bonus', 'all_stats'],
  cavala: ['fishing_speed', 'double_catch_chance'],
  dourado_mar: ['gold_multiplier', 'fishing_speed'],
  atum: ['fishing_speed', 'gold_multiplier'],
  peixe_lua: ['luck_bonus', 'gold_multiplier'],
  peixe_machado: ['luck_bonus', 'double_catch_chance'],
  lula_humboldt: ['double_catch_chance', 'fishing_speed'],
  peixe_bolha: ['luck_bonus', 'gold_multiplier'],
  peixe_vibora: ['fishing_speed', 'luck_bonus'],
  tubarao_groenlandia: ['luck_bonus', 'auto_fish_speed'],
  granadeiro: ['gold_multiplier', 'auto_fish_speed'],
  peixe_tripe: ['auto_fish_speed', 'luck_bonus'],
  anfipode: ['double_catch_chance', 'gold_multiplier'],
  peixe_caracol: ['luck_bonus', 'auto_fish_speed'],
  holoturia: ['gold_multiplier', 'luck_bonus'],
  polvo_dumbo: ['luck_bonus', 'double_catch_chance'],
};

// Nomes oficiais dos atributos. TODA tela deve exibir buffs por aqui (BUFF_LABELS / formatBuffText),
// nunca com texto próprio, para o mesmo buff não aparecer com nomes diferentes.
export const BUFF_LABELS = {
  gold_multiplier: 'Ouro',
  luck_bonus: 'Sorte',
  fishing_speed: 'Vel. Pesca',
  double_catch_chance: 'Pesca Dupla',
  auto_fish_speed: 'Vel. Auto',
  all_stats: 'Todos Atributos',
  mythic_mastery: 'Maestria Mítica'
};

const buffPct = v => Math.round((v || 0) * 100);

// Texto de exibição de um buff, derivado do tipo e do valor (o campo `text` salvo é ignorado).
// Os valores padrão dos eventos espelham _applyFishBuff() em core/economy.js.
export function formatBuffText(b) {
  if (!b) return '';
  const L = BUFF_LABELS;
  if (b.type === 'mythic_mastery') {
    const base = b.value || 0.25;
    return `+${buffPct(base)}% ${L.gold_multiplier}, +${buffPct(base * 0.6)}% ${L.luck_bonus}, +${buffPct(base * 0.4)}% ${L.double_catch_chance}`;
  }
  if (b.type === 'event_blood_moon') {
    return `+${buffPct(b.value || 0.15)}% ${L.gold_multiplier}, +${buffPct(b.luck || 0.15)}% ${L.luck_bonus} (Lua Sangrenta)`;
  }
  if (b.type === 'event_eclipse') {
    return `+${buffPct(b.value || 0.15)}% ${L.fishing_speed}, +${buffPct(b.double || 0.15)}% ${L.double_catch_chance} (Eclipse)`;
  }
  if (L[b.type]) return `+${buffPct(b.value)}% ${L[b.type]}`;
  return b.text || '';
}

// Configuração de probabilidades, chances de buff duplo e faixas numéricas estritas por raridade
export const BUFF_CONFIG = {
  COMUM: {
    chance: 0.05,
    doubleChance: 0.0,
    ranges: {
      gold_multiplier: [0.01, 0.02],
      luck_bonus: [0.01, 0.01],
      fishing_speed: [0.01, 0.02],
      double_catch_chance: [0.01, 0.01],
      auto_fish_speed: [0.01, 0.02]
    }
  },
  INCOMUM: {
    chance: 0.25,
    doubleChance: 0.03,
    ranges: {
      gold_multiplier: [0.02, 0.04],
      luck_bonus: [0.02, 0.03],
      fishing_speed: [0.02, 0.04],
      double_catch_chance: [0.02, 0.03],
      auto_fish_speed: [0.02, 0.04]
    }
  },
  RARO: {
    chance: 1.0,
    doubleChance: 0.08,
    ranges: {
      gold_multiplier: [0.04, 0.08],
      luck_bonus: [0.03, 0.06],
      fishing_speed: [0.05, 0.09],
      double_catch_chance: [0.03, 0.06],
      auto_fish_speed: [0.05, 0.10]
    }
  },
  EPICO: {
    chance: 1.0,
    doubleChance: 0.15,
    ranges: {
      gold_multiplier: [0.09, 0.16],
      luck_bonus: [0.07, 0.13],
      fishing_speed: [0.10, 0.18],
      double_catch_chance: [0.07, 0.13],
      auto_fish_speed: [0.12, 0.20]
    }
  },
  LENDARIO: {
    chance: 1.0,
    doubleChance: 0.25,
    ranges: {
      gold_multiplier: [0.18, 0.28],
      luck_bonus: [0.12, 0.20],
      double_catch_chance: [0.12, 0.18],
      fishing_speed: [0.15, 0.25],
      all_stats: [0.06, 0.10]
    }
  },
  MITICO: {
    chance: 1.0,
    doubleChance: 1.0,
    ranges: {
      mythic_mastery: [0.25, 0.35],
      gold_multiplier: [0.20, 0.35],
      luck_bonus: [0.15, 0.25],
      all_stats: [0.10, 0.18]
    }
  },
  SECRETO: {
    chance: 1.0,
    tripleBuff: true,
    ranges: {
      mythic_mastery: [0.35, 0.50],
      all_stats: [0.15, 0.25],
      gold_multiplier: [0.35, 0.55],
      luck_bonus: [0.25, 0.40],
      fishing_speed: [0.30, 0.45],
      double_catch_chance: [0.25, 0.35],
      auto_fish_speed: [0.30, 0.45]
    }
  }
};

// scale: multiplicador dos valores (camadas mais fundas dão buffs mais fortes).
export function generateFishBuffs(fishId, rarity, scale = 1) {
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
    const [min, max] = conf.ranges[type];
    const val = +((min + Math.random() * (max - min)) * scale).toFixed(3);
    return {
      type,
      value: val,
      text: formatBuffText({ type, value: val })
    };
  });
}
