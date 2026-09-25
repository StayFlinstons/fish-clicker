// Regras da economia: capacidade, buffs ativos, chances de raridade, peso/valor e sorteio de peixes.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { FISH_LIST, RARITIES, formatBuffText, generateFishBuffs } from '../fishData.js';
import { BAITS, RODS, UPGRADES } from '../itemsData.js';
import { DEPTH_LAYERS, getDepthLayer } from '../depthData.js';

export class EconomyMethods {
  // Catálogos do jogo (um só mundo, dividido em camadas de profundidade).
  getFishCatalog() {
    return FISH_LIST;
  }

  getRodCatalog() {
    return RODS;
  }

  getBaitCatalog() {
    return BAITS;
  }

  getUpgradeCatalog() {
    return UPGRADES;
  }

  // Camada mais funda liberada: a da vara mais funda que o jogador tem.
  getMaxLayer() {
    let max = 1;
    (this.unlockedRods || []).forEach(id => {
      const rod = RODS.find(r => r.id === id);
      if (rod && rod.depthLayer > max) max = rod.depthLayer;
    });
    return Math.min(max, DEPTH_LAYERS.length);
  }

  // Camada onde o jogador está pescando agora (nunca abaixo da liberada).
  getCurrentLayer() {
    const layer = Math.floor(this.currentLayer || 1);
    return Math.max(1, Math.min(layer, this.getMaxLayer()));
  }

  getEquippedRod() {
    return RODS.find(r => r.id === this.selectedRodId) || RODS[0];
  }

  // Kg que a vara equipada aguenta sem risco.
  getRodMaxWeight() {
    return this.getEquippedRod().maxWeight || 5;
  }

  // Chance (0–1) de tirar da água um peixe desse peso. Acima do limite da vara
  // a linha pode arrebentar: quanto mais pesado, menor a chance. A Carretilha segura
  // uma parte dos que escapariam.
  getLandChance(weight) {
    const limit = this.getRodMaxWeight();
    if (weight <= limit) return 1;
    const base = Math.max(0.02, Math.pow(limit / weight, 1.5));
    const reel = UPGRADES.find(u => u.id === 'carretilha');
    const hold = reel ? reel.getValue(this.upgradeLevels.carretilha || 0) : 0;
    return base + (1 - base) * hold;
  }

  getMaxInventory() {
    const list = this.getUpgradeCatalog();
    const u = list.find(u => u.id === 'balde');
    return u ? u.getValue(this.upgradeLevels.balde || 0) : 10;
  }

  getMaxAquarium() {
    const list = this.getUpgradeCatalog();
    const u = list.find(u => u.id === 'aquario_cap');
    return u ? u.getValue(this.upgradeLevels.aquario_cap || 0) : 3;
  }

  formatFishBuffText(b) {
    return formatBuffText(b);
  }

  getFishBuffs(fish) {
    if (!fish) return [];
    let list = [];
    if (Array.isArray(fish.buffs) && fish.buffs.length > 0) list = fish.buffs;
    else if (fish.buff) list = [fish.buff];

    return list.map(b => {
      if (!b) return b;
      return {
        ...b,
        text: this.formatFishBuffText(b)
      };
    });
  }

  _applyFishBuff(b, mult, out) {
    if (!b) return;
    if (b.type === 'gold_multiplier')    out.goldMultiplier += (b.value || 0) * mult;
    if (b.type === 'luck_bonus')         out.luckBonus += (b.value || 0) * mult;
    if (b.type === 'fishing_speed')      out.fishingSpeedBonus += (b.value || 0) * mult;
    if (b.type === 'double_catch_chance')out.doubleCatchChance += (b.value || 0) * mult;
    if (b.type === 'auto_fish_speed')    out.autoFishSpeedBonus += (b.value || 0) * mult;
    if (b.type === 'all_stats') {
      const v = (b.value || 0) * mult;
      out.goldMultiplier += v;
      out.luckBonus += v;
      out.fishingSpeedBonus += v * 0.7;
      out.doubleCatchChance += v * 0.7;
    }
    if (b.type === 'mythic_mastery') {
      const base = b.value || 0.25;
      out.goldMultiplier += base * mult;
      out.luckBonus += (base * 0.6) * mult;
      out.doubleCatchChance += (base * 0.4) * mult;
    }
    if (b.type === 'event_blood_moon') {
      out.goldMultiplier += (b.value || 0.15) * mult;
      out.luckBonus += (b.luck || 0.15) * mult;
    }
    if (b.type === 'event_eclipse') {
      out.fishingSpeedBonus += (b.value || 0.15) * mult;
      out.doubleCatchChance += (b.double || 0.15) * mult;
    }
  }

  // Limites base dos atributos (sem Olhos de Peixe). Camada 1: 200% ouro/sorte, 60% vel./dupla;
  // camada 6: 250% ouro/sorte, 85% vel., 100% dupla.
  getBuffCaps() {
    const step = this.getMaxLayer() - 1;
    return {
      gold: 2.00 + step * 0.10,
      luck: 2.00 + step * 0.10,
      speed: 0.60 + step * 0.05,
      double: 0.60 + step * 0.08
    };
  }

  getActiveBuffs() {
    const out = { goldMultiplier:0, luckBonus:0, fishingSpeedBonus:0, doubleCatchChance:0, autoFishSpeedBonus:0 };

    // Buffs de peixes: ativos EXCLUSIVAMENTE no aquário!
    // Peixes no balde servem para pescaria e venda de ouro.
    // Apenas os peixes guardados no aquário ativam seus bônus místicos.
    this.aquarium.forEach(fish => {
      this.getFishBuffs(fish).forEach(b => this._applyFishBuff(b, 1.0, out));
    });

    // Equipamento: todos os buffs vêm da isca (a vara só dá profundidade e força)
    const bait = BAITS.find(b => b.id === this.selectedBaitId);
    if (bait) {
      out.luckBonus += bait.luckBonus || 0;
      out.fishingSpeedBonus += bait.speedBonus || 0;
      out.doubleCatchChance += bait.doubleCatchBonus || 0;
    }

    // Buffs temporários do Peixe Dourado: somados DEPOIS dos limites (ver return), para
    // valerem mesmo com o atributo no máximo (ex.: 200% de sorte + Sorte Suprema = 300%)
    const now = Date.now();
    const golden = { gold: 0, luck: 0, speed: 0, double: 0 };
    this.tempBuffs.filter(b => b.endsAt > now).forEach(b => {
      if (b.type === 'gold_frenzy')   golden.gold += b.multiplier;
      if (b.type === 'luck_surge')    golden.luck += b.multiplier;
      if (b.type === 'speed_burst')   golden.speed += b.multiplier;
      if (b.type === 'double_mania')  golden.double += b.multiplier;
    });

    // Meta-progressão: Olhos de Peixe (+1% por olho no atributo escolhido)
    const fe = this.fishEyesAllocated || { gold: 0, luck: 0, speed: 0, double: 0 };
    out.goldMultiplier += (fe.gold || 0) * 0.01;
    out.luckBonus += (fe.luck || 0) * 0.01;
    out.fishingSpeedBonus += (fe.speed || 0) * 0.01;
    out.doubleCatchChance += (fe.double || 0) * 0.01;

    // Bônus da Pesca Magnética (Oficina de Forja & Museu)
    if (this.forgeUpgrades && this.forgeUpgrades['propulsor_mergulhador']) {
      out.autoFishSpeedBonus += 0.35;
    }
    if (this.forgeUpgrades && this.forgeUpgrades['carretel_precisao']) {
      out.fishingSpeedBonus += 0.25;
    }
    if (this.isMuseumSetCompleted('ponte')) {
      out.goldMultiplier += 0.12;
    }
    if (this.isMuseumSetCompleted('praia')) {
      out.doubleCatchChance += 0.15;
    }

    // Limites sobem com a camada mais funda liberada + Olhos de Peixe
    const caps = this.getBuffCaps();
    const goldCap = caps.gold + (fe.gold || 0) * 0.01;
    const luckCap = caps.luck + (fe.luck || 0) * 0.01;
    const speedCap = Math.min(0.95, caps.speed + (fe.speed || 0) * 0.01);
    const doubleCap = Math.min(1.00, caps.double + (fe.double || 0) * 0.01);

    return {
      goldMultiplier: Math.min(out.goldMultiplier, goldCap) + golden.gold,
      luckBonus: Math.min(out.luckBonus, luckCap) + golden.luck,
      fishingSpeedBonus: Math.min(out.fishingSpeedBonus, speedCap) + golden.speed,
      doubleCatchChance: Math.min(out.doubleCatchChance, doubleCap) + golden.double,
      autoFishSpeedBonus: Math.min(out.autoFishSpeedBonus, 0.65)
    };
  }

  // Probabilidade (0–1) de cada raridade, já com a sorte aplicada.
  // Sorte aplica-se mais fraco em raridades altas para dificultar.
  getRarityChances(buffs) {
    const luck = 1 + buffs.luckBonus;
    const chances = {
      SECRETO:  (RARITIES.SECRETO?.chance || 0.015) * (1 + (luck - 1) * 0.3),
      MITICO:   RARITIES.MITICO.chance   * (1 + (luck - 1) * 0.4),
      LENDARIO: RARITIES.LENDARIO.chance  * (1 + (luck - 1) * 0.5),
      EPICO:    RARITIES.EPICO.chance     * (1 + (luck - 1) * 0.6),
      RARO:     RARITIES.RARO.chance      * (1 + (luck - 1) * 0.7),
      INCOMUM:  RARITIES.INCOMUM.chance   * (1 + (luck - 1) * 0.3),
      COMUM:    RARITIES.COMUM.chance
    };
    const total = Object.values(chances).reduce((a, b) => a + b, 0);
    Object.keys(chances).forEach(k => { chances[k] /= total; });
    return chances;
  }

  // Espécies possíveis numa camada. Horários só valem nas camadas com sol; à noite
  // alguns bichos da Zona do Crepúsculo sobem para a Zona do Sol (migração vertical).
  getLayerFish(layer = this.getCurrentLayer(), timeOfDay = this.timeOfDay) {
    const info = getDepthLayer(layer);
    return FISH_LIST.filter(f => {
      if (f.layer === layer) {
        if (f.timeExclusive && info.sunlit && f.timeExclusive !== timeOfDay) return false;
        return true;
      }
      return layer === 2 && timeOfDay === 'night' && f.layer === 3 && f.migratesUp;
    });
  }

  // Espécies possíveis para uma raridade na camada/horário atual (nunca vazio).
  // Se a camada não tem a raridade, usa a mais próxima abaixo (ou acima).
  getFishPoolForRarity(rarity, timeOfDay = this.timeOfDay, layer = this.getCurrentLayer()) {
    const layerFish = this.getLayerFish(layer, timeOfDay);
    const order = ['COMUM', 'INCOMUM', 'RARO', 'EPICO', 'LENDARIO', 'MITICO', 'SECRETO'];
    const idx = order.indexOf(rarity);
    for (let d = 0; d < order.length; d++) {
      for (const i of [idx - d, idx + d]) {
        if (i < 0 || i >= order.length) continue;
        const pool = layerFish.filter(f => f.rarity === order[i]);
        if (pool.length) return pool;
      }
    }
    return [FISH_LIST[0]];
  }

  // Peso (kg) a partir de um sorteio uniforme u ∈ [0,1).
  computeFishWeight(template, u) {
    let weight = +(template.minWeight + u * (template.maxWeight - template.minWeight)).toFixed(2);
    if (weight <= 0) weight = 0.01;
    if (this.forgeUpgrades && this.forgeUpgrades['linha_reforcada']) {
      weight = +(weight * 1.15).toFixed(2);
    }
    return weight;
  }

  computeFishValue(template, weight) {
    const weightFactor = weight / template.minWeight;
    return Math.round(template.baseValue * Math.pow(weightFactor, 0.7));
  }

  // Valor base médio de uma espécie já contando os que escapam pela força da vara
  // (integração numérica do peso, sem aleatoriedade).
  getExpectedFishValue(template) {
    const STEPS = 32;
    let sum = 0;
    for (let i = 0; i < STEPS; i++) {
      const u = (i + 0.5) / STEPS;
      const w = this.computeFishWeight(template, u);
      sum += this.computeFishValue(template, w) * this.getLandChance(w);
    }
    return sum / STEPS;
  }

  // opts.rarity força a raridade; opts.timeOfDay sobrescreve o horário (usado pelo offline).
  rollFish(buffs, opts = {}) {
    let selectedRarity = opts.rarity;
    if (!selectedRarity) {
      const chances = this.getRarityChances(buffs);
      let rand = Math.random();
      selectedRarity = 'COMUM';
      for (const [key, weight] of Object.entries(chances)) {
        if (rand <= weight) { selectedRarity = key; break; }
        rand -= weight;
      }
    }

    const layer = opts.layer || this.getCurrentLayer();
    const pool = this.getFishPoolForRarity(selectedRarity, opts.timeOfDay || this.timeOfDay, layer);
    const template = pool[Math.floor(Math.random() * pool.length)];

    const weight = this.computeFishWeight(template, Math.random());
    const rawValue = this.computeFishValue(template, weight);

    // Buffs sorteados; peixes de camadas mais fundas dão buffs mais fortes (+15% por camada)
    const generatedBuffs = generateFishBuffs(template.id, template.rarity, 1 + (template.layer - 1) * 0.15);

    let specialAura = null;
    if (this.bloodMoonEventActive) {
      const auraRoll = Math.random();
      if (auraRoll < 0.10) {
        specialAura = 'eclipse';
        generatedBuffs.push({
          type: 'event_eclipse',
          value: 0.15,
          double: 0.15,
          text: '+15% Vel. Pesca, +15% Pesca Dupla (Eclipse)'
        });
      } else if (auraRoll < 0.20) {
        specialAura = 'lua_sangrenta';
        generatedBuffs.push({
          type: 'event_blood_moon',
          value: 0.15,
          luck: 0.15,
          text: '+15% Ouro, +15% Sorte (Lua Sangrenta)'
        });
      }
    }

    return {
      uid: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      id: template.id,
      numId: template.numId,
      name: template.name,
      layer: template.layer,
      rarity: template.rarity,
      icon: template.icon,
      weight,
      baseValue: rawValue,
      desc: template.desc,
      buffs: generatedBuffs,
      buff: generatedBuffs[0] || null,
      isDoubleBuff: generatedBuffs.length === 2,
      isTripleBuff: generatedBuffs.length >= 3,
      specialAura: specialAura,
      locked: false
    };
  }
}
