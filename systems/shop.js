// Loja: compra e equipamento de varas, iscas e melhorias.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { BAITS, RODS, UPGRADES } from '../itemsData.js';
import { sound } from '../sound.js';
import { BAITS_WORLD_2, RODS_WORLD_2, UPGRADES_WORLD_2 } from '../world2Data.js';

export class ShopMethods {
  buyRod(rodId) {
    const rodList = this.currentWorld === 2 ? RODS_WORLD_2 : RODS;
    const rod = rodList.find(r => r.id === rodId);
    if (!rod || this.unlockedRods.includes(rodId)) return;
    if (this.gold < rod.price) { this.showToast('OURO INSUFICIENTE!', 'error'); return; }
    this.gold -= rod.price;
    this.unlockedRods.push(rodId);
    this.selectedRodId = rodId;
    sound.playUpgrade();
    this.showToast('COMPROU: ' + rod.name, 'success');
    this.updateFisherman();
    this.renderAll();
    this.checkAchievements();
    this.checkChapter1Completion(true);
  }

  equipRod(rodId) {
    if (this.unlockedRods.includes(rodId)) {
      this.selectedRodId = rodId; sound.playClick(); this.updateFisherman(); this.renderAll();
    }
  }

  buyBait(baitId) {
    const baitList = this.currentWorld === 2 ? BAITS_WORLD_2 : BAITS;
    const bait = baitList.find(b => b.id === baitId);
    if (!bait || bait.unbuyable || this.unlockedBaits.includes(baitId)) return;
    if (this.gold < bait.price) { this.showToast('OURO INSUFICIENTE!', 'error'); return; }
    this.gold -= bait.price;
    this.unlockedBaits.push(baitId);
    this.selectedBaitId = baitId;
    sound.playUpgrade();
    this.showToast('COMPROU: ' + bait.name, 'success');
    this.updateFisherman();
    this.renderAll();
    this.checkAchievements();
    this.checkChapter1Completion(true);
  }

  equipBait(baitId) {
    if (this.unlockedBaits.includes(baitId)) {
      this.selectedBaitId = baitId; sound.playClick(); this.updateFisherman(); this.renderAll();
    }
  }

  buyUpgrade(upgradeId) {
    const upgradeList = this.currentWorld === 2 ? UPGRADES_WORLD_2 : UPGRADES;
    const u = upgradeList.find(u => u.id === upgradeId);
    if (!u) return;
    const lvl = this.upgradeLevels[upgradeId] || 0;
    if (lvl >= u.maxLevel) { this.showToast('NÍVEL MÁXIMO!', 'info'); return; }
    const price = Math.round(u.basePrice * Math.pow(u.priceMultiplier, lvl));
    if (this.gold < price) { this.showToast('OURO INSUFICIENTE!', 'error'); return; }
    this.gold -= price;
    this.upgradeLevels[upgradeId] = lvl + 1;

    if (upgradeId === 'auto_pescador') {
      this.lastAutoFishTime = Date.now();
      document.getElementById('auto-fish-bar')?.classList.remove('hidden');
      this.updateDiverVisual();
    }

    if (upgradeId === 'auto_vendedor') {
      const newIntervalMs = u.getValue(lvl + 1) * 1000;
      this.nextAutoSellTime = Date.now() + newIntervalMs;
      document.getElementById('auto-sell-bar')?.classList.remove('hidden');
    }

    sound.playUpgrade();
    this.showToast(u.name + ' Nv.' + (lvl + 1), 'success');
    this.renderAll();
    this.checkAchievements();
  }
}
