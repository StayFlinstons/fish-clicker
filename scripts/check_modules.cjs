// Verifica a ligação dos módulos do jogo (rode antes de subir: node scripts/check_modules.cjs).
// 1. Todo .js em core/, systems/, ui/ e dev/ está no pré-cache do sw.js (senão o PWA quebra offline).
// 2. Toda classe *Methods exportada pelos módulos está no applyMixins() do game.js.
// 3. Nenhum método é definido em dois módulos (o applyMixins também acusa isso, mas só no navegador).
// 4. Todo módulo (raiz + pastas) está na lista MODULES do index.html (carregamento com ?v=).
// 5. ASSET_VERSION do index.html é igual ao número do CACHE_NAME do sw.js.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const problems = [];

const modules = ['core', 'systems', 'ui', 'dev'].flatMap((dir) =>
  fs.readdirSync(path.join(root, dir))
    .filter((f) => f.endsWith('.js'))
    .map((f) => `${dir}/${f}`)
);

const sw = read('sw.js');
for (const m of modules) {
  if (!sw.includes(`'./${m}'`)) problems.push(`sw.js: falta './${m}' no ASSETS_TO_CACHE`);
}

const game = read('game.js');
const mixinList = (game.match(/applyMixins\(FishingGame, \[([\s\S]*?)\]\)/) || [])[1] || '';
const mixinNames = new Set(mixinList.match(/\w+/g) || []);
const owner = new Map();
for (const m of modules) {
  const src = read(m);
  // Só as classes *Methods viram métodos do FishingGame; outras classes (ex.: LakeBackgroundAnimator) não
  for (const [block, cls] of src.matchAll(/^export class (\w+Methods) \{[\s\S]*?^\}/gm)) {
    if (!mixinNames.has(cls)) problems.push(`game.js: ${cls} (${m}) não está no applyMixins`);
    for (const [, name] of block.matchAll(/^ {2}(?:async )?([A-Za-z_]\w*)\(.*\)\s*\{\s*$/gm)) {
      if (owner.has(name)) problems.push(`método "${name}" definido em ${owner.get(name)} e em ${m}`);
      owner.set(name, m);
    }
  }
}

const html = read('index.html');
const listed = ((html.match(/var MODULES = \[([\s\S]*?)\];/) || [])[1] || '').match(/'[^']+'/g) || [];
const listedSet = new Set(listed.map((q) => q.slice(1, -1)));
const rootModules = fs.readdirSync(root).filter((f) => f.endsWith('.js') && !['sw.js', 'tailwind.min.js'].includes(f));
for (const m of [...rootModules, ...modules]) {
  if (!listedSet.has(m)) problems.push(`index.html: falta '${m}' na lista MODULES (seria carregado sem ?v=)`);
}
const assetVersion = (html.match(/var ASSET_VERSION = '([^']+)'/) || [])[1];
const cacheVersion = (sw.match(/CACHE_NAME = 'fish-clicker-v([^']+)'/) || [])[1];
if (!assetVersion || assetVersion !== cacheVersion) {
  problems.push(`versões diferentes: ASSET_VERSION '${assetVersion}' (index.html) x CACHE_NAME v${cacheVersion} (sw.js)`);
}

if (problems.length) {
  console.error(`✗ ${problems.length} problema(s):\n  - ` + problems.join('\n  - '));
  process.exit(1);
}
console.log(`✓ ${modules.length} módulos no sw.js e no applyMixins, ${owner.size} métodos sem duplicata, versão ${assetVersion} consistente.`);
