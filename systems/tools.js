// Ferramentas compradas nos upgrades: Sonar de Pesca e Quadro de Encomendas.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { FISH_LIST, RARITIES } from '../fishData.js';
import { UPGRADES } from '../itemsData.js';
import { sound } from '../sound.js';

const ORDER_COUNTS = { COMUM: [4, 7], INCOMUM: [2, 4], RARO: [1, 2] };
const SONAR_ALERT = ['LENDARIO', 'MITICO', 'SECRETO'];

export class ToolMethods {
  // ───────── Sonar ─────────
  getSonarLevel() {
    return this.upgradeLevels.sonar || 0;
  }

  // Sorteia agora o peixe do próximo arremesso manual, para o Sonar poder mostrá-lo.
  peekSonar() {
    if (this.getSonarLevel() <= 0 || this.gameMode === 'ima') {
      this.sonarNext = null;
      this.renderSonar();
      return;
    }
    if (!this.sonarNext) {
      this.sonarNext = this.rollFish(this.getActiveBuffs());
      if (this.getSonarLevel() >= 2 && SONAR_ALERT.includes(this.sonarNext.rarity)) {
        sound.playUpgrade?.();
      }
    }
    this.renderSonar();
  }

  takeSonarFish() {
    const fish = this.sonarNext || this.rollFish(this.getActiveBuffs());
    this.sonarNext = null;
    return fish;
  }

  // Camada, isca ou horário mudaram: a leitura antiga não vale mais.
  resetSonar() {
    this.sonarNext = null;
    this.peekSonar();
  }

  renderSonar() {
    const el = document.getElementById('sonar-readout');
    if (!el) return;
    const lvl = this.getSonarLevel();
    const f = this.sonarNext;
    if (lvl <= 0 || !f) {
      el.classList.add('hidden');
      return;
    }
    const r = RARITIES[f.rarity] || RARITIES.COMUM;
    const known = !!this.discoveredFish[f.id];
    const parts = [`<span style="color:${r.color}">${r.label.toUpperCase()}</span>`];
    if (lvl >= 2) parts.push(known ? f.name : '???');
    if (lvl >= 3) {
      const heavy = f.weight > this.getRodMaxWeight();
      parts.push(`<span class="${heavy ? 'text-red-400' : 'text-slate-300'}">${f.weight.toLocaleString('pt-BR')}kg${heavy ? ' ⚠' : ''}</span>`);
    }
    el.innerHTML = `📡 ${parts.join(' · ')}`;
    el.classList.remove('hidden');
    el.classList.toggle('animate-pulse', lvl >= 2 && SONAR_ALERT.includes(f.rarity));
    el.style.borderColor = r.border;
  }

  // ───────── Quadro de Encomendas ─────────
  getOrderSlots() {
    const u = UPGRADES.find(x => x.id === 'encomendas');
    return u ? u.getValue(this.upgradeLevels.encomendas || 0) : 0;
  }

  // Prêmio: várias vezes o que a peixaria pagaria pelos mesmos peixes.
  getOrderRewardMultiplier() {
    return 2.5 + 0.5 * (this.upgradeLevels.encomendas || 0);
  }

  generateOrder() {
    const maxLayer = this.getMaxLayer();
    const taken = new Set((this.orders || []).map(o => o.fishId));
    const pool = FISH_LIST.filter(f => f.layer <= maxLayer && ORDER_COUNTS[f.rarity] && !taken.has(f.id));
    if (!pool.length) return null;
    // Camadas mais fundas aparecem mais (peso = número da camada)
    const total = pool.reduce((a, f) => a + f.layer, 0);
    let roll = Math.random() * total;
    let fish = pool[0];
    for (const f of pool) {
      roll -= f.layer;
      if (roll <= 0) { fish = f; break; }
    }
    const [min, max] = ORDER_COUNTS[fish.rarity];
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const reward = Math.round(count * this.getExpectedFishValue(fish) * this.getOrderRewardMultiplier());
    return { fishId: fish.id, count, reward: Math.max(10, reward) };
  }

  ensureOrders() {
    if (!Array.isArray(this.orders)) this.orders = [];
    const slots = this.getOrderSlots();
    if (this.orders.length > slots) this.orders.length = slots;
    while (this.orders.length < slots) {
      const o = this.generateOrder();
      if (!o) break;
      this.orders.push(o);
    }
  }

  getOrderMatches(order) {
    return this.inventory.filter(f => f.id === order.fishId && !f.locked);
  }

  deliverOrder(index) {
    const order = (this.orders || [])[index];
    if (!order) return;
    const matches = this.getOrderMatches(order);
    if (matches.length < order.count) {
      this.showToast(`Faltam ${order.count - matches.length} no balde para esta encomenda.`, 'warning');
      return;
    }
    // Entrega os mais leves (os mais pesados valem mais na peixaria)
    const give = [...matches].sort((a, b) => a.weight - b.weight).slice(0, order.count);
    const uids = new Set(give.map(f => f.uid));
    this.inventory = this.inventory.filter(f => !uids.has(f.uid));
    this.gold += order.reward;
    this.totalGoldEarned += order.reward;
    this.ordersCompleted = (this.ordersCompleted || 0) + 1;
    sound.playCoin?.();
    const fish = FISH_LIST.find(f => f.id === order.fishId);
    this.showToast(`📋 Encomenda entregue: ${order.count}× ${fish?.name || order.fishId}! +${order.reward.toLocaleString('pt-BR')}G`, 'success');
    this.orders.splice(index, 1);
    this.ensureOrders();
    this.saveGame();
    this.renderAll();
  }

  swapOrder(index) {
    if (!(this.orders || [])[index]) return;
    sound.playClick?.();
    this.orders.splice(index, 1);
    this.ensureOrders();
    this.saveGame();
    this.renderUpgrades();
  }

  // Lista de pedidos mostrada dentro do card do Quadro de Encomendas.
  renderOrdersHtml() {
    this.ensureOrders();
    if (!this.orders.length) return '';
    return `<div class="mt-2 flex flex-col gap-1.5">${this.orders.map((o, i) => {
      const fish = FISH_LIST.find(f => f.id === o.fishId);
      const have = this.getOrderMatches(o).length;
      const ready = have >= o.count;
      const r = RARITIES[fish?.rarity] || RARITIES.COMUM;
      const known = !!this.discoveredFish[o.fishId];
      return `
        <div class="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-1.5 py-1" style="font-family:var(--font-pixel);">
          <img src="${known ? this.getFishSpriteURL(fish.icon) : this.getFishSilhouetteURL(fish.icon)}" class="w-7 h-5 object-contain shrink-0 ${known ? '' : 'brightness-0 contrast-200'}" style="image-rendering:pixelated;" alt="">
          <div class="flex-1 min-w-0 leading-tight">
            <div class="text-[8px] truncate" style="color:${r.color};">${o.count}× ${fish.name}</div>
            <div class="text-[8px] text-amber-300">${have}/${o.count} · +${o.reward.toLocaleString('pt-BR')}G</div>
          </div>
          <button onclick="window.game.deliverOrder(${i})" class="pixel-btn px-1.5 py-0.5 text-[8px] shrink-0 ${ready ? 'bg-emerald-600 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}">ENTREGAR</button>
          <button onclick="window.game.swapOrder(${i})" title="Trocar por outro pedido" class="pixel-btn px-1 py-0.5 text-[8px] shrink-0 bg-slate-800 text-slate-300">↻</button>
        </div>`;
    }).join('')}</div>`;
  }
}
