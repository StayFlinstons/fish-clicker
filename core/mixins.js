// Copia os métodos de cada classe-módulo (core/, systems/, ui/, dev/) para a classe alvo.
// Assim o FishingGame fica dividido em arquivos, mas continua sendo um objeto só:
// `this` dentro de qualquer método é o jogo, e window.game.metodo() segue funcionando.
// Falha no carregamento se dois módulos definirem o mesmo método, para nenhum
// sobrescrever o outro em silêncio.
export function applyMixins(target, mixins) {
  for (const mixin of mixins) {
    for (const name of Object.getOwnPropertyNames(mixin.prototype)) {
      if (name === 'constructor') continue;
      if (Object.prototype.hasOwnProperty.call(target.prototype, name)) {
        throw new Error(`[applyMixins] Método "${name}" de ${mixin.name} já existe em ${target.name}`);
      }
      Object.defineProperty(target.prototype, name, Object.getOwnPropertyDescriptor(mixin.prototype, name));
    }
  }
}
