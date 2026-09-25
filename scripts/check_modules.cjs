// Verifica a ligação dos módulos do jogo (rode antes de subir: node scripts/check_modules.cjs).
// 1. Todo .js em core/, systems/, ui/ e dev/ está no pré-cache do sw.js (senão o PWA quebra offline).
// 2. Toda classe *Methods exportada pelos módulos está no applyMixins() do game.js.
// 3. Nenhum método é definido em dois módulos (o applyMixins também acusa isso, mas só no navegador).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
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
const owner = {};
for (const m of modules) {
  const src = read(m);
  for (const [, cls] of src.matchAll(/^export class (\w+Methods)\b/gm)) {
    if (!new RegExp(`\\b${cls}\\b`).test(mixinList)) problems.push(`game.js: ${cls} (${m}) não está no applyMixins`);
  }
  for (const [, name] of src.matchAll(/^  (?:async )?([A-Za-z_]\w*)\(.*\)\s*\{\s*$/gm)) {
    if (owner[name]) problems.push(`método "${name}" definido em ${owner[name]} e em ${m}`);
    owner[name] = m;
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} problema(s):\n  - ` + problems.join('\n  - '));
  process.exit(1);
}
console.log(`✓ ${modules.length} módulos no sw.js e no applyMixins, ${Object.keys(owner).length} métodos sem duplicata.`);
