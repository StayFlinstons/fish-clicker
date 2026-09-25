// Camadas de profundidade: um só mundo que desce do rio até a fossa.
// As zonas 2 a 6 seguem as zonas reais do oceano. A vara mais funda que o jogador tem
// decide até qual camada ele pode descer (RODS[].depthLayer em itemsData.js).
// image: fundo pixel art da camada (animado por ui/lakeBackground.js).
// scenery: ambiente do mar no renderizador do lago (bolhas e partículas; null = rio).
// fishStyle: visual dos peixinhos que nadam no fundo (pixelArt.js, _drawMinifish): 'sunlit' reflexo do sol,
// 'photophores' pontinhos de luz, 'glow' aura bioluminescente, 'charred' carbonizados, 'ghost' translúcidos.

export const DEPTH_LAYERS = [
  {
    id: 1, key: 'rio', name: 'Rio e Lagoa', shortName: 'Rio',
    minDepth: 0, maxDepth: 20, scenery: null, image: 'zonas/zona_1.png',
    themeColor: '#38bdf8', icon: '🏞️',
    desc: 'Água doce e rasa, onde toda jornada começa.'
  },
  {
    id: 2, key: 'sol', name: 'Zona do Sol', shortName: 'Sol',
    minDepth: 20, maxDepth: 200, scenery: 'recife_bioluminescente', image: 'zonas/zona_2.png', fishStyle: 'sunlit',
    themeColor: '#0ea5e9', icon: '☀️',
    gradient: 'linear-gradient(to bottom, #0a4f7a 0%, #0b6a96 30%, #0f7fae 65%, #0c5f86 100%)',
    desc: 'Zona epipelágica: a luz do sol chega até aqui e os grandes nadadores caçam.'
  },
  {
    id: 3, key: 'crepusculo', name: 'Zona do Crepúsculo', shortName: 'Crepúsculo',
    minDepth: 200, maxDepth: 1000, scenery: 'recife_bioluminescente', image: 'zonas/zona_3.png', fishStyle: 'photophores',
    themeColor: '#06b6d4', icon: '🌒',
    gradient: 'linear-gradient(to bottom, #011424 0%, #032b47 25%, #064a6d 60%, #086185 85%, #022538 100%)',
    desc: 'Zona mesopelágica: penumbra azul, bioluminescência e o fóssil vivo celacanto.'
  },
  {
    id: 4, key: 'meia_noite', name: 'Zona da Meia-Noite', shortName: 'Meia-Noite',
    minDepth: 1000, maxDepth: 4000, scenery: 'cemiterio_naufragios', image: 'zonas/zona_4.png', fishStyle: 'glow',
    themeColor: '#10b981', icon: '⚓',
    gradient: 'linear-gradient(to bottom, #01110d 0%, #02241b 30%, #043e30 65%, #065441 85%, #011c14 100%)',
    desc: 'Zona batipelágica: escuro total. O Titanic descansa a 3.800 m.'
  },
  {
    id: 5, key: 'abissal', name: 'Planície Abissal', shortName: 'Abissal',
    minDepth: 4000, maxDepth: 6000, scenery: 'fendas_vulcanicas', image: 'zonas/zona_5.png', fishStyle: 'charred',
    themeColor: '#f97316', icon: '🌋',
    gradient: 'linear-gradient(to bottom, #080302 0%, #1f0804 25%, #3d0c05 60%, #5c1407 85%, #120402 100%)',
    desc: 'Zona abissopelágica, com fontes hidrotermais onde a água passa de 400 °C.'
  },
  {
    id: 6, key: 'hadal', name: 'Fossa Hadal', shortName: 'Hadal',
    minDepth: 6000, maxDepth: 11000, scenery: 'zona_hadal', image: 'zonas/zona_6.png', fishStyle: 'ghost',
    themeColor: '#a855f7', icon: '👁️',
    gradient: 'linear-gradient(to bottom, #010003 0%, #0c0117 25%, #1a0333 60%, #290452 85%, #040008 100%)',
    desc: 'As fossas mais fundas da Terra. A das Marianas chega a 10.994 m.'
  }
];

export function getDepthLayer(id) {
  return DEPTH_LAYERS.find(l => l.id === id) || DEPTH_LAYERS[0];
}

export function formatDepth(m) {
  return `${m.toLocaleString('pt-BR')} m`;
}
