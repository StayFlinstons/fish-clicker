// Emojis em pixel art: troca cada emoji do texto da página por um ícone SVG 8x8 no mesmo tamanho da
// fonte (1em). Um MutationObserver converte também o que os módulos escrevem depois via innerHTML,
// então o texto do jogo (toasts, cards, modais, dados em *Data.js) continua usando emojis normais.
// Não mexe em <option>, <select>, <textarea>, <script> e <style>, nem em atributos (title etc.).
//
// Cada ícone: p = paleta (letra → cor; 'currentColor' herda a cor do texto), r = 8 linhas de 8
// caracteres ('.' = transparente). Emoji sem desenho aqui continua como emoji.

const STAR = {
  p: { a: '#d97706', b: '#fde047' },
  r: ['...aa...', '..abba..', 'aabbbbaa', '.abbbba.', '..abba..', '.abaaba.', '.aa..aa.', '........']
};
const SPARKLE = {
  p: { a: '#fde047', b: '#ffffff', c: '#fef9c3' },
  r: ['...a....', '...a....', '..aba...', 'aabbbaa.', '..aba...', '...a..c.', '...a.ccc', '......c.']
};
const FISH = color => ({
  p: { a: color, c: '#0f172a' },
  r: ['........', '..aaa...', '.aaaaa.a', 'acaaaaaa', 'aaaaaaaa', '.aaaaa.a', '..aaa...', '........']
});
const DROP = (a, b, c) => ({
  p: { a, b, c },
  r: ['...aa...', '...aa...', '..abba..', '..abba..', '.abbbba.', '.abbcba.', '.abbbba.', '..aaaa..']
});
const CLOCK = {
  p: { a: '#475569', b: '#f1f5f9', c: '#0f172a' },
  r: ['..aaaa..', '.abbbba.', 'abbcbbba', 'abbcbbba', 'abbccbba', 'abbbbbba', '.abbbba.', '..aaaa..']
};
const GLOBE = {
  p: { a: '#0284c7', b: '#22c55e' },
  r: ['..aaaa..', '.abbaaa.', 'abbbaaba', 'aabbaaba', 'aaabbaaa', 'aaaabbaa', '.aaabba.', '..aaaa..']
};
const MOON = {
  p: { a: '#fef08a', b: '#eab308' },
  r: ['..aaa...', '.aab....', 'aab.....', 'aa......', 'aa......', 'aab.....', '.aab....', '..aaa...']
};
const KEY = color => ({
  p: { a: color },
  r: ['........', 'aaa.....', 'a.a.....', 'aaaaaaaa', 'a.a..a.a', 'aaa..a.a', '........', '........']
});

const ICONS = {
  '★': STAR, '⭐': STAR, '🌟': STAR,
  '✦': SPARKLE, '✧': SPARKLE, '✨': SPARKLE,
  '🔒': {
    p: { a: '#94a3b8', b: '#facc15', c: '#a16207', d: '#422006' },
    r: ['..aaaa..', '.a....a.', '.a....a.', 'cbbbbbbc', 'cbbddbbc', 'cbbddbbc', 'cbbbbbbc', 'cccccccc']
  },
  '🔓': {
    p: { a: '#94a3b8', b: '#facc15', c: '#a16207', d: '#422006' },
    r: ['..aaaa..', '.a....a.', '.a......', 'cbbbbbbc', 'cbbddbbc', 'cbbddbbc', 'cbbbbbbc', 'cccccccc']
  },
  '🎣': {
    p: { a: '#b45309', b: '#e2e8f0', c: '#94a3b8', d: '#1e293b' },
    r: ['......aa', '.....a.b', '....a..b', '...a...b', '..a....b', '.d.....b', 'dd....cb', 'd.....cc']
  },
  '✕': {
    p: { a: 'currentColor' },
    r: ['a......a', '.a....a.', '..a..a..', '...aa...', '...aa...', '..a..a..', '.a....a.', 'a......a']
  },
  '❌': {
    p: { a: '#ef4444' },
    r: ['aa....aa', 'aaa..aaa', '.aaaaaa.', '..aaaa..', '..aaaa..', '.aaaaaa.', 'aaa..aaa', 'aa....aa']
  },
  '✓': {
    p: { a: 'currentColor' },
    r: ['........', '.......a', '......aa', '.....aa.', 'aa..aa..', '.aaaa...', '..aa....', '........']
  },
  '✅': {
    p: { a: '#15803d', b: '#22c55e', c: '#ffffff' },
    r: ['aaaaaaaa', 'abbbbbca', 'abbbbcba', 'abbbcbba', 'acbcbbba', 'abcbbbba', 'abbbbbba', 'aaaaaaaa']
  },
  '🏺': {
    p: { a: '#7c2d12', b: '#c2410c', c: '#fdba74' },
    r: ['..aaaa..', '...bb...', '..abba..', '.abbbba.', '.abccba.', '.abbbba.', '..abba..', '...aa...']
  },
  '🌑': {
    p: { a: '#dc2626', b: '#0a0a0a' },
    r: ['..aaaa..', '.abbbba.', 'abbbbbba', 'abbbbbba', 'abbbbbba', 'abbbbbba', '.abbbba.', '..aaaa..']
  },
  '👁': {
    p: { a: '#581c87', b: '#f5f3ff', c: '#a855f7', d: '#0f172a' },
    r: ['........', '..aaaa..', '.abccba.', 'abcddcba', 'abcddcba', '.abccba.', '..aaaa..', '........']
  },
  '⚡': {
    p: { a: '#facc15' },
    r: ['....aa..', '...aa...', '..aa....', '.aaaaaa.', '....aa..', '...aa...', '..aa....', '.a......']
  },
  '🪙': {
    p: { a: '#a16207', b: '#facc15', c: '#fef08a' },
    r: ['..aaaa..', '.abbbba.', 'abbcbbba', 'abbcbbba', 'abbcbbba', 'abbcbbba', '.abbbba.', '..aaaa..']
  },
  '💰': {
    p: { a: '#a16207', b: '#b45309', c: '#facc15' },
    r: ['...aa...', '..a..a..', '...bb...', '..bbbb..', '.bbccbb.', '.bbccbb.', '.bbbbbb.', '..bbbb..']
  },
  '🌊': {
    p: { a: '#e0f2fe', b: '#38bdf8', c: '#0369a1' },
    r: ['........', '...aaa..', '..abbba.', '.ab..cb.', '.b...cb.', 'ab..bbbb', 'bbbbbbbb', 'cccccccc']
  },
  '⚙': {
    p: { a: '#94a3b8', b: '#1e293b' },
    r: ['...aa...', '.a.aa.a.', '..aaaa..', 'aaabbaaa', 'aaabbaaa', '..aaaa..', '.a.aa.a.', '...aa...']
  },
  '🧲': {
    p: { a: '#e2e8f0', b: '#ef4444' },
    r: ['aa....aa', 'aa....aa', 'bb....bb', 'bb....bb', 'bb....bb', 'bbb..bbb', '.bbbbbb.', '..bbbb..']
  },
  '🐙': {
    p: { a: '#d946ef', b: '#1e1b4b' },
    r: ['..aaaa..', '.aaaaaa.', '.abaaba.', '.aaaaaa.', '..aaaa..', '.a.aa.a.', 'a.a..a.a', '........']
  },
  '🦑': {
    p: { a: '#f87171', b: '#0f172a' },
    r: ['...aa...', '..aaaa..', '.aaaaaa.', '.abaaba.', '.aaaaaa.', '.a.aa.a.', '.a.a..a.', 'a..a...a']
  },
  '🐠': FISH('#fb923c'),
  '🐟': FISH('#38bdf8'),
  '🩸': DROP('#7f1d1d', '#dc2626', '#fca5a5'),
  '💧': DROP('#0369a1', '#38bdf8', '#e0f2fe'),
  '🌌': {
    p: { a: '#1e1b4b', b: '#312e81', c: '#ffffff', d: '#a855f7' },
    r: ['aaaaaaaa', 'abbbbcba', 'abcbbbba', 'abbddbba', 'abbddbca', 'abcbbbba', 'abbbbbba', 'aaaaaaaa']
  },
  '🔮': {
    p: { a: '#6b21a8', b: '#a855f7', c: '#f5d0fe', d: '#78350f' },
    r: ['..aaaa..', '.abbcba.', 'abbbbcba', 'abbbbbba', '.abbbba.', '..aaaa..', '.dddddd.', 'dddddddd']
  },
  '🪝': {
    p: { a: '#cbd5e1' },
    r: ['...aa...', '...aa...', '....a...', '....a...', '.a..a...', '.a..a...', '.a..a...', '..aa....']
  },
  '🍀': {
    p: { a: '#15803d', b: '#4ade80', c: '#166534' },
    r: ['.aa.aa..', 'abbabba.', 'abbabba.', '.aa.aa..', 'abbabba.', 'abbabba.', '.aa.aa..', '....c...']
  },
  '🏆': {
    p: { a: '#ca8a04', b: '#facc15', c: '#78350f' },
    r: ['aaaaaaaa', 'abbbbbba', '.abbbba.', '..abba..', '...aa...', '...aa...', '..aaaa..', '.cccccc.']
  },
  '⚖': {
    p: { a: '#94a3b8', b: '#facc15' },
    r: ['...aa...', 'aaaaaaaa', 'b..aa..b', 'b..aa..b', 'bb.aa.bb', '...aa...', '..aaaa..', '.aaaaaa.']
  },
  '🌉': {
    p: { a: '#94a3b8', b: '#64748b', c: '#1d4ed8' },
    r: ['........', 'aaaaaaaa', 'b.b..b.b', 'bb....bb', 'b......b', 'b......b', 'cccccccc', 'cccccccc']
  },
  '🔥': {
    p: { a: '#dc2626', b: '#f97316', c: '#fde047' },
    r: ['...a....', '..aa..a.', '..aba.a.', '.abba.aa', '.abbbaba', 'abbcbbba', 'abbccbba', '.abbbba.']
  },
  '📡': {
    p: { a: '#cbd5e1', b: '#22d3ee', c: '#475569' },
    r: ['a.......', '.a...b..', 'aaa.b...', 'aaaa....', '.aaaa...', '..aaaa..', '...ccc..', '..ccccc.']
  },
  '📊': {
    p: { a: '#22c55e', b: '#38bdf8', c: '#f59e0b', d: '#94a3b8' },
    r: ['......aa', '......aa', '...bb.aa', '...bb.aa', 'cc.bb.aa', 'cc.bb.aa', 'cc.bb.aa', 'dddddddd']
  },
  '🛠': {
    p: { a: '#94a3b8', b: '#b45309', c: '#78350f' },
    r: ['aa......', 'aab.....', '.bbb....', '..bbb...', '...bbb..', '....bbb.', '.....bbc', '......cc']
  },
  '🧰': {
    p: { a: '#475569', b: '#dc2626', c: '#facc15' },
    r: ['........', '..aaaa..', '..a..a..', 'bbbbbbbb', 'bbbccbbb', 'bbbbbbbb', 'bbbbbbbb', '........']
  },
  '📱': {
    p: { a: '#1e293b', b: '#38bdf8', c: '#94a3b8' },
    r: ['.aaaaaa.', '.abbbba.', '.abbbba.', '.abbbba.', '.abbbba.', '.abbbba.', '.aaaaaa.', '.aacaaa.']
  },
  '☀': {
    p: { a: '#f59e0b', b: '#facc15' },
    r: ['...aa...', '.a....a.', '..bbbb..', 'a.bbbb.a', 'a.bbbb.a', '..bbbb..', '.a....a.', '...aa...']
  },
  '🔑': KEY('#facc15'),
  '🗝': KEY('#a16207'),
  '🌲': {
    p: { a: '#15803d', b: '#78350f' },
    r: ['...aa...', '..aaaa..', '...aa...', '..aaaa..', '.aaaaaa.', 'aaaaaaaa', '...bb...', '...bb...']
  },
  '🏞': {
    p: { a: '#7dd3fc', b: '#15803d', c: '#0284c7', d: '#e0f2fe' },
    r: ['aaaaaaaa', 'aaabaaaa', 'aabbbaba', 'abbbbbbb', 'bbbbbbbb', 'cccccccc', 'cdcccdcc', 'cccccccc']
  },
  '🌅': {
    p: { a: '#fb923c', b: '#fde047', c: '#7e22ce', d: '#c084fc' },
    r: ['aaaaaaaa', 'aaabbaaa', 'aabbbbaa', 'abbbbbba', 'cccccccc', 'dcdcdcdc', 'cccccccc', 'cdcdcdcd']
  },
  '🏖': {
    p: { a: '#7dd3fc', b: '#ef4444', c: '#fde68a', d: '#78350f', e: '#38bdf8' },
    r: ['aaaaaaaa', 'abbbbaaa', 'bbbbbbaa', 'aaadaaaa', 'aaadaaaa', 'eeeeeeee', 'cccccccc', 'cccccccc']
  },
  '🤿': {
    p: { a: '#1e293b', b: '#38bdf8', c: '#f97316' },
    r: ['........', 'aaaaaaaa', 'abbaabba', 'abbaabba', 'aaaaaaaa', '......c.', '......c.', '......cc']
  },
  '🏛': {
    p: { a: '#cbd5e1', b: '#94a3b8' },
    r: ['...aa...', '..aaaa..', 'aaaaaaaa', '.b.bb.b.', '.b.bb.b.', '.b.bb.b.', 'aaaaaaaa', 'aaaaaaaa']
  },
  '🔄': {
    p: { a: '#38bdf8' },
    r: ['..aaaa..', '.a....aa', 'a....aaa', 'a.......', '.......a', 'aaa....a', 'aa....a.', '..aaaa..']
  },
  '🕶': {
    p: { a: '#0f172a', b: '#475569' },
    r: ['........', '........', 'aaaaaaaa', 'abbaabba', 'abbaabba', '.aa..aa.', '........', '........']
  },
  '🛑': {
    p: { a: '#7f1d1d', b: '#dc2626', c: '#ffffff' },
    r: ['..aaaa..', '.abbbba.', 'abbbbbba', 'abccccba', 'abccccba', 'abbbbbba', '.abbbba.', '..aaaa..']
  },
  '🪨': {
    p: { a: '#44403c', b: '#78716c', c: '#a8a29e' },
    r: ['........', '...aaa..', '..abbba.', '.abbcbba', 'abbbbbba', 'abbbbbba', '.aaaaaa.', '........']
  },
  '💎': {
    p: { a: '#0e7490', b: '#22d3ee', c: '#ffffff' },
    r: ['........', '.aaaaaa.', 'abbcbbba', '.abbbba.', '..abba..', '...aa...', '........', '........']
  },
  '🧵': {
    p: { a: '#a16207', b: '#ef4444', c: '#fca5a5' },
    r: ['aaaaaaaa', '.bbbbbb.', '.cbcbcb.', '.bbbbbb.', '.cbcbcb.', '.bbbbbb.', 'aaaaaaaa', '........']
  },
  '🛒': {
    p: { a: '#94a3b8', b: '#38bdf8', c: '#1e293b' },
    r: ['aa......', '.abbbbbb', '.abbbbb.', '.abbbbb.', '.aaaaaa.', '.a......', '.aaaaaaa', '..c..c..']
  },
  '🌒': MOON, '🌙': MOON,
  '🧴': {
    p: { a: '#64748b', b: '#e2e8f0', c: '#5eead4' },
    r: ['...aa...', '...bb...', '..aaaa..', '.acccca.', '.acbbca.', '.acccca.', '.acccca.', '..aaaa..']
  },
  '💍': {
    p: { a: '#0891b2', b: '#a5f3fc', c: '#facc15' },
    r: ['...aa...', '..abba..', '...aa...', '..c..c..', '.c....c.', '.c....c.', '..c..c..', '...cc...']
  },
  '🌀': {
    p: { a: '#38bdf8' },
    r: ['..aaaa..', '.a....a.', 'a..aa..a', 'a.a..a.a', 'a.a.aa.a', 'a..a...a', '.a....a.', '..aaaa..']
  },
  '🕒': CLOCK, '⌚': CLOCK,
  '⏳': {
    p: { a: '#a16207', b: '#e0f2fe', c: '#facc15' },
    r: ['aaaaaaaa', '.bbbbbb.', '..bbbb..', '...cc...', '...cc...', '..b..b..', '.bccccb.', 'aaaaaaaa']
  },
  '⚠': {
    p: { a: '#facc15', b: '#0f172a' },
    r: ['...aa...', '...aa...', '..abba..', '..abba..', '.aabbaa.', '.aaaaaa.', 'aaabbaaa', 'aaaaaaaa']
  },
  '📋': {
    p: { a: '#94a3b8', b: '#92400e', c: '#f8fafc', d: '#94a3b8' },
    r: ['..aaaa..', 'bbbaabbb', 'bccccccb', 'bcddddcb', 'bccccccb', 'bcddddcb', 'bccccccb', 'bbbbbbbb']
  },
  '🛴': {
    p: { a: '#94a3b8', b: '#ef4444', c: '#0f172a' },
    r: ['.....aa.', '......a.', '......a.', '......a.', '......a.', 'bbbbbbb.', 'c.....c.', '........']
  },
  '🚲': {
    p: { a: '#ef4444', b: '#94a3b8', c: '#0f172a' },
    r: ['........', '....a...', '..aaab..', '.a..a.b.', 'ccc..ccc', 'c.c..c.c', 'ccc..ccc', '........']
  },
  '📿': {
    p: { a: '#a16207', b: '#dc2626' },
    r: ['..a.a...', '.a...a..', 'a.....a.', '.a...a..', '..a.a...', '...b....', '...b....', '........']
  },
  '📷': {
    p: { a: '#1e293b', b: '#475569', c: '#38bdf8' },
    r: ['........', '.aa.....', 'aaaaaaaa', 'abbbbbba', 'abbccbba', 'abbccbba', 'abbbbbba', 'aaaaaaaa']
  },
  '🌐': GLOBE, '🌍': GLOBE,
  '☄': {
    p: { a: '#f97316', b: '#fde047', c: '#fed7aa' },
    r: ['......aa', '.....abb', '....abbb', '...cabba', '..c.aa..', '.c......', 'c.......', '........']
  },
  '🐚': {
    p: { a: '#c2410c', b: '#fed7aa', c: '#fb923c' },
    r: ['...aa...', '..abba..', '.abcbba.', 'abcbcbba', 'abcbcbba', '.abbbba.', '..aaaa..', '........']
  },
  '🎮': {
    p: { a: '#475569', b: '#e2e8f0', c: '#ef4444' },
    r: ['........', '.aaaaaa.', 'aabaaaca', 'abbbaaaa', 'aabaacaa', 'aaaaaaaa', 'aa....aa', '........']
  },
  '👑': {
    p: { a: '#facc15', b: '#dc2626' },
    r: ['........', 'a..aa..a', 'aa.aa.aa', 'aaaaaaaa', 'abaaaaba', 'aaaaaaaa', 'aaaaaaaa', '........']
  },
  '🥫': {
    p: { a: '#64748b', b: '#94a3b8', c: '#dc2626', d: '#fef3c7' },
    r: ['.aaaaaa.', 'abbbbbba', 'acccccca', 'acddddca', 'acddddca', 'acccccca', 'abbbbbba', '.aaaaaa.']
  },
  '⚓': {
    p: { a: '#94a3b8' },
    r: ['...aa...', '...aa...', '.aaaaaa.', '...aa...', '...aa...', 'a..aa..a', 'aa.aa.aa', '.aaaaaa.']
  },
  '🎉': {
    p: { a: '#ef4444', b: '#22c55e', c: '#38bdf8', d: '#facc15' },
    r: ['.....a.b', '..c.....', '......a.', '....dd..', '...ddd.c', '..dddd..', '.dddd...', 'dddd....']
  },
  '🌋': {
    p: { a: '#9ca3af', b: '#f97316', c: '#78350f' },
    r: ['..a.a...', '...a....', '...bb...', '..cbbc..', '..cccc..', '.cccccc.', 'cccccccc', 'cccccccc']
  }
};

// Desenho → <svg>, juntando pixels vizinhos da mesma cor numa linha em um só <rect>
function buildSvg({ p, r }) {
  let rects = '';
  r.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const ch = row[x];
      let w = 1;
      while (row[x + w] === ch) w++;
      if (ch !== '.' && p[ch]) rects += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="${p[ch]}"/>`;
      x += w;
    }
  });
  return `<svg class="pixel-emoji" viewBox="0 0 8 8" aria-hidden="true" shape-rendering="crispEdges">${rects}</svg>`;
}

const SVG_BY_EMOJI = Object.fromEntries(Object.entries(ICONS).map(([emoji, icon]) => [emoji, buildSvg(icon)]));
const EMOJI_RE = new RegExp(`(${Object.keys(ICONS).sort((a, b) => b.length - a.length).join('|')})️?`, 'g');
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION', 'SELECT', 'TITLE', 'svg']);

function convertTextNode(node) {
  const text = node.nodeValue;
  EMOJI_RE.lastIndex = 0;
  if (!EMOJI_RE.test(text)) return;
  const parent = node.parentNode;
  if (!parent || SKIP_TAGS.has(parent.nodeName) || parent.closest?.('select, textarea, svg')) return;
  const frag = document.createDocumentFragment();
  let last = 0;
  text.replace(EMOJI_RE, (match, emoji, offset) => {
    if (offset > last) frag.appendChild(document.createTextNode(text.slice(last, offset)));
    const span = document.createElement('span');
    span.className = 'pixel-emoji-wrap';
    span.setAttribute('role', 'img');
    span.setAttribute('aria-label', emoji);
    span.innerHTML = SVG_BY_EMOJI[emoji];
    frag.appendChild(span);
    last = offset + match.length;
    return match;
  });
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  parent.replaceChild(frag, node);
}

function convertTree(root) {
  if (root.nodeType === Node.TEXT_NODE) { convertTextNode(root); return; }
  if (root.nodeType !== Node.ELEMENT_NODE || SKIP_TAGS.has(root.nodeName)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(convertTextNode);
}

// Converte a página inteira e passa a converter tudo o que for escrito depois.
export function startPixelEmoji(root = document.body) {
  convertTree(root);
  new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'characterData') convertTextNode(m.target);
      else m.addedNodes.forEach(convertTree);
    }
  }).observe(root, { childList: true, subtree: true, characterData: true });
}
