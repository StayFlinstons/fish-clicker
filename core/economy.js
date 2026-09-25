// Regras da economia: capacidade, buffs ativos, chances de raridade, peso/valor e sorteio de peixes.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { FISH_LIST, RARITIES, formatBuffText, generateFishBuffs } from '../fishData.js';
import { BAITS, RODS, UPGRADES } from '../itemsData.js';
import { BAITS_WORLD_2, FISH_WORLD_2, RODS_WORLD_2, UPGRADES_WORLD_2 } from '../world2Data.js';

export class EconomyMethods {
  getMaxInventory() {
    const list = this.currentWorld === 2 ? UPGRADES_WORLD_2 : UPGRADES;
    const u = list.find(u => u.id === 'balde');
    return u ? u.getValue(this.upgradeLevels.balde || 0) : 10;
  }

  getMaxAquarium() {
    const list = this.currentWorld === 2 ? UPGRADES_WORLD_2 : UPGRADES;
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

  getActiveBuffs() {
    const out = { goldMultiplier:0, luckBonus:0, fishingSpeedBonus:0, doubleCatchChance:0, autoFishSpeedBonus:0 };

    // Buffs de peixes: ativos EXCLUSIVAMENTE no aquário!
    // Peixes no balde servem para pescaria e venda de ouro.
    // Apenas os peixes guardados no aquário ativam seus bônus místicos.
    this.aquarium.forEach(fish => {
      this.getFishBuffs(fish).forEach(b => this._applyFishBuff(b, 1.0, out));
    });

    if (this.currentWorld === 2) {
      // Mundo 2: Progressão limpa baseada em equipamentos e upgrades abissais
      const rod = RODS_WORLD_2.find(r => r.id === this.selectedRodId);
      if (rod) {
        out.luckBonus += rod.luckBonus || 0;
        out.fishingSpeedBonus += rod.fishingSpeedBonus || 0;
        out.doubleCatchChance += rod.doubleCatchChance || 0;
      }

      const bait = BAITS_WORLD_2.find(b => b.id === this.selectedBaitId);
      if (bait) {
        out.luckBonus += (bait.luckMultiplier - 1.0) * 0.20;
        out.doubleCatchChance += bait.doubleCatchBonus || 0;
      }

      const boia = UPGRADES_WORLD_2.find(u => u.id === 'boia_sorte');
      if (boia) out.luckBonus += boia.getValue(this.upgradeLevels.boia_sorte || 0);
      const rede = UPGRADES_WORLD_2.find(u => u.id === 'rede_dupla');
      if (rede) out.doubleCatchChance += rede.getValue(this.upgradeLevels.rede_dupla || 0);
    } else {
      const rod = RODS.find(r => r.id === this.selectedRodId);
      if (rod) { out.luckBonus += rod.luckBonus || 0; out.fishingSpeedBonus += rod.speedBonus || 0; }

      const bait = BAITS.find(b => b.id === this.selectedBaitId);
      if (bait) {
        out.luckBonus += (bait.luckMultiplier - 1.0) * 0.15;
        out.doubleCatchChance += bait.doubleCatchBonus || 0;
      }

      const boia = UPGRADES.find(u => u.id === 'boia_sorte');
      if (boia) out.luckBonus += boia.getValue(this.upgradeLevels.boia_sorte || 0);
      const rede = UPGRADES.find(u => u.id === 'rede_dupla');
      if (rede) out.doubleCatchChance += rede.getValue(this.upgradeLevels.rede_dupla || 0);
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

    // Caps dinâmicos: Mundo 2 limite de ouro e sorte fixado em 250% (2.50) + meta-olhos
    const isW2 = this.currentWorld === 2;
    const goldCap = (isW2 ? 2.50 : 2.00) + (fe.gold || 0) * 0.01;
    const luckCap = (isW2 ? 2.50 : 2.00) + (fe.luck || 0) * 0.01;
    const speedCap = Math.min(0.95, (isW2 ? 0.85 : 0.60) + (fe.speed || 0) * 0.01);
    const doubleCap = Math.min(1.00, (isW2 ? 1.00 : 0.60) + (fe.double || 0) * 0.01);

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

  // Espécies possíveis para uma raridade no mundo/bioma/horário atual (nunca vazio).
  getFishPoolForRarity(rarity, timeOfDay = this.timeOfDay) {
    if (this.currentWorld === 2) {
      const activeBiome = this.activeWorld2Biome || 'recife_bioluminescente';
      const biomeFish = FISH_WORLD_2.filter(f => f.biome === activeBiome);
      const pool = biomeFish.filter(f => f.rarity === rarity);
      if (pool.length) return pool;
      return biomeFish.length ? biomeFish : [FISH_WORLD_2[0]];
    }
    const pool = FISH_LIST.filter(f => {
      if (f.rarity !== rarity) return false;
      // Peixes exclusivos de horário só podem ser pescados em seu período do dia
      if (f.timeExclusive && f.timeExclusive !== timeOfDay) return false;
      return true;
    });
    if (pool.length) return pool;
    return [FISH_LIST.find(f => f.rarity === rarity) || FISH_LIST[0]];
  }

  getEquippedRodPower() {
    const equippedRod = this.currentWorld === 2
      ? RODS_WORLD_2.find(r => r.id === this.selectedRodId)
      : RODS.find(r => r.id === this.selectedRodId);
    if (!equippedRod) return 1.0;
    if (typeof equippedRod.power === 'number') return equippedRod.power;
    if (typeof equippedRod.tier === 'number') return 1.0 + (equippedRod.tier - 1) * 2.0; // T1=1.0, T2=3.0, T3=5.0, T4=7.0
    return 1.0;
  }

  // Peso a partir de um sorteio uniforme u ∈ [0,1). Influência do PWR da vara:
  // viés sutil na distribuição e leve multiplicador final (+1% a +12% no topo).
  computeFishWeight(template, u, rodPower = this.getEquippedRodPower()) {
    const rollExponent = 1 / (1 + (rodPower - 1) * 0.05);
    const weightRoll = Math.pow(u, rollExponent);
    const powerWeightMultiplier = 1 + Math.min(0.12, (rodPower - 1) * 0.015);
    let weight = +((template.minWeight + weightRoll * (template.maxWeight - template.minWeight)) * powerWeightMultiplier).toFixed(2);
    if (this.forgeUpgrades && this.forgeUpgrades['linha_reforcada']) {
      weight = +(weight * 1.15).toFixed(2);
    }
    return weight;
  }

  computeFishValue(template, weight) {
    const weightFactor = weight / template.minWeight;
    return Math.round(template.baseValue * Math.pow(weightFactor, 0.7));
  }

  // Valor base médio de uma espécie (integração numérica do peso, sem aleatoriedade).
  getExpectedFishValue(template, rodPower) {
    const STEPS = 32;
    let sum = 0;
    for (let i = 0; i < STEPS; i++) {
      const u = (i + 0.5) / STEPS;
      sum += this.computeFishValue(template, this.computeFishWeight(template, u, rodPower));
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

    const pool = this.getFishPoolForRarity(selectedRarity, opts.timeOfDay || this.timeOfDay);
    const template = pool[Math.floor(Math.random() * pool.length)];

    const weight = this.computeFishWeight(template, Math.random());
    const rawValue = this.computeFishValue(template, weight);

    let generatedBuffs = [];
    if (this.currentWorld === 2) {
      generatedBuffs = template.buff ? [template.buff] : [];
    } else {
      generatedBuffs = generateFishBuffs(template.id, template.rarity);
    }

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
