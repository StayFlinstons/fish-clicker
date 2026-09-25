// Loop principal de pesca, álbum de descobertas, vendas e movimentação balde <-> aquário.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { sound } from '../sound.js';

export class FishingMethods {
  fish(isAuto = false) {
    if (this.isFishing && !isAuto) return;

    // Primeira pescada com a Isca do Kraken Ancestral: cinemática que termina com o Kraken fisgado
    if (this.selectedBaitId === 'isca_kraken_ancestral' && !isAuto && !this.krakenCinematicSeen) {
      this.triggerKrakenCinematic();
      return;
    }

    const maxInv = this.getMaxInventory();
    if (this.inventory.length >= maxInv) {
      this.showToast('INVENTÁRIO CHEIO!', 'warning');
      return;
    }

    if (!isAuto) {
      this.isFishing = true;
      const buffs = this.getActiveBuffs();
      const cooldown = Math.max(500, 900 * (1 - buffs.fishingSpeedBonus));
      setTimeout(() => { this.isFishing = false; }, cooldown);
      sound.vibrateCast();
    }

    sound.playCast();
    this.createWaterRipple();

    // Fisgada visual da bóia e anzol na água
    const rigInner = document.getElementById('hook-rig-inner');
    if (rigInner) {
      rigInner.classList.remove('hook-tug-active');
      void rigInner.offsetWidth;
      rigInner.classList.add('hook-tug-active');
    }

    const buffs = this.getActiveBuffs();
    const caught = [];
    // Arremesso manual com Sonar: sai o peixe que o Sonar mostrou
    caught.push(!isAuto && this.getSonarLevel() > 0 ? this.takeSonarFish() : this.rollFish(buffs));

    if (Math.random() < buffs.doubleCatchChance && this.inventory.length + caught.length < maxInv) {
      caught.push(this.rollFish(buffs));
      this.showFloatingText('DUPLA!', '#38bdf8', 100);
    }

    // Peixe mais pesado que o limite da vara pode arrebentar a linha
    const landed = caught.filter(fish => Math.random() < this.getLandChance(fish.weight));
    const escaped = caught.filter(fish => !landed.includes(fish));
    if (escaped.length) {
      const big = escaped[0];
      sound.playWaterSplash?.();
      this.showFloatingText(`ESCAPOU! ${big.weight.toLocaleString('pt-BR')}kg`, '#f87171', 60);
      if (!isAuto) {
        this.showToast(`🎣 A linha arrebentou! ${big.name} pesado demais para sua vara (aguenta ${this.getRodMaxWeight().toLocaleString('pt-BR')}kg).`, 'warning');
      }
    }

    if (!isAuto) this.peekSonar();

    landed.forEach((fish, idx) => {
      setTimeout(() => {
        this.inventory.unshift(fish);
        this.totalCatches++;
        sound.playCatch(fish.rarity);
        sound.vibrateCatch(fish.rarity);
        this.showCatchNotification(fish);
        this.recordDiscovery(fish);
        this.checkFirstRarityCatch(fish);
        this.checkFirstBuffFishCatch(fish);
        if (this.waterRenderer) {
          if (typeof this.waterRenderer.catchAndSpawnFish === 'function') {
            this.waterRenderer.catchAndSpawnFish(fish.icon);
          } else {
            this.waterRenderer.addSwimmingFish(fish.icon);
          }
        }
        this.renderHeader();
        this.renderInventory();
        this.renderStats();
        this.renderBuffs();
      }, idx * 200);
    });
  }

  recordDiscovery(fish) {
    const isNew = !this.discoveredFish[fish.id];
    const prevRecord = this.discoveredFish[fish.id]?.maxWeight || 0;
    const isNewRecord = fish.weight > prevRecord;

    if (isNew) {
      this.discoveredFish[fish.id] = {
        maxWeight: fish.weight,
        count: 1,
        caughtBloodMoon: fish.specialAura === 'lua_sangrenta',
        caughtEclipse: fish.specialAura === 'eclipse'
      };
      // Recompensa em ouro pela primeira descoberta de espécie
      const bonusMap = { COMUM: 50, INCOMUM: 120, RARO: 300, EPICO: 800, LENDARIO: 2500, MITICO: 10000, SECRETO: 25000 };
      const bonus = bonusMap[fish.rarity] || 50;
      this.gold += bonus;
      this.totalGoldEarned += bonus;
      this.showFloatingText(`+${bonus}G NOVO!`, '#38bdf8', -50);
      if (fish.rarity === 'SECRETO') {
        this.showToast(`🌌 ANOMALIA SECRETA DESCOBERTA: ${fish.name}! (+${bonus.toLocaleString('pt-BR')}G)`, 'error');
      } else {
        this.showToast(`✨ NOVA ESPÉCIE: ${fish.name}! (+${bonus}G)`, 'success');
      }
      this.updateAlbumBadge();
    } else {
      this.discoveredFish[fish.id].count = (this.discoveredFish[fish.id].count || 0) + 1;
      if (isNewRecord) {
        this.discoveredFish[fish.id].maxWeight = fish.weight;
      }
      if (fish.specialAura === 'lua_sangrenta') {
        this.discoveredFish[fish.id].caughtBloodMoon = true;
      }
      if (fish.specialAura === 'eclipse') {
        this.discoveredFish[fish.id].caughtEclipse = true;
      }
    }
    if (fish.specialAura === 'lua_sangrenta' || fish.specialAura === 'eclipse' || this.bloodMoonEventActive) {
      this.totalBloodMoonCatches = (this.totalBloodMoonCatches || 0) + 1;
    }
    this.checkAchievements();
  }

  setGold(amount = 0) {
    const val = parseInt(amount);
    this.gold = isNaN(val) ? 0 : Math.max(0, val);
    this.renderAll();
    this.saveGame();
    this.showToast(`Ouro definido para ${this.gold.toLocaleString('pt-BR')} G!`, 'info');
    return this.gold;
  }

  sellFish(uid) {
    const idx = this.inventory.findIndex(f => f.uid === uid);
    if (idx === -1) return;
    const fish = this.inventory[idx];
    if (fish.locked) return;
    const buffs = this.getActiveBuffs();
    const finalGold = Math.round(fish.baseValue * (1 + buffs.goldMultiplier));
    this.gold += finalGold;
    this.totalGoldEarned += finalGold;
    this.inventory.splice(idx, 1);
    sound.playCoin();
    this.showFloatingText('+' + finalGold, '#fbbf24');
    this.renderAll();
  }

  sellManual() {
    if (this.inventory.length === 0) {
      this.showToast('BALDE VAZIO!', 'warning');
      return;
    }
    const buffs = this.getActiveBuffs();
    let earned = 0, sold = 0;
    const remaining = [];
    this.inventory.forEach(f => {
      if (f.locked || !this.manualSellFilter.includes(f.rarity)) {
        remaining.push(f);
      } else {
        earned += Math.round(f.baseValue * (1 + buffs.goldMultiplier));
        sold++;
      }
    });

    if (sold === 0) {
      this.showToast('Nenhum peixe filtrado para vender!', 'info');
      return;
    }

    this.inventory = remaining;
    this.gold += earned;
    this.totalGoldEarned += earned;
    sound.playCoin();
    this.showFloatingText('+' + earned + 'G', '#fbbf24', 40);
    this.showToast(`${sold} peixes vendidos por +${earned.toLocaleString('pt-BR')}G!`, 'success');
    this.renderAll();
  }

  openSellFilterModal() {
    sound.playClick();
    const modal = document.getElementById('sell-filter-modal');
    if (!modal) return;

    // Sincroniza checkboxes com as preferências salvas
    document.querySelectorAll('.filter-manual-cb').forEach(cb => {
      cb.checked = this.manualSellFilter.includes(cb.value);
    });
    document.querySelectorAll('.filter-auto-cb').forEach(cb => {
      cb.checked = this.autoSellFilter.includes(cb.value);
    });

    modal.classList.remove('hidden');
  }

  saveFilterPreferences() {
    const manual = [];
    document.querySelectorAll('.filter-manual-cb:checked').forEach(cb => manual.push(cb.value));
    const auto = [];
    document.querySelectorAll('.filter-auto-cb:checked').forEach(cb => auto.push(cb.value));

    this.manualSellFilter = manual;
    this.autoSellFilter = auto;

    sound.playUpgrade();
    this.saveGame();
    this.showToast('Filtros de venda salvos!', 'success');
    document.getElementById('sell-filter-modal')?.classList.add('hidden');
  }

  toggleLockFish(uid) {
    const f = this.inventory.find(f => f.uid === uid);
    if (f) { f.locked = !f.locked; sound.playClick(); this.renderInventory(); }
  }

  moveToAquarium(uid) {
    const idx = this.inventory.findIndex(f => f.uid === uid);
    if (idx === -1) return;
    const fish = this.inventory[idx];
    const buffs = this.getFishBuffs(fish);
    if (buffs.length === 0) { this.showToast('Só peixes com buff!', 'warning'); return; }
    const maxAq = this.getMaxAquarium();
    if (this.aquarium.length >= maxAq) { this.showToast('AQUÁRIO CHEIO!', 'warning'); return; }
    this.inventory.splice(idx, 1);
    fish.locked = false;
    this.aquarium.push(fish);
    sound.playUpgrade();
    this.showToast(fish.name + ' no aquário! Buffs ativados!', 'success');
    this.renderAll();
    this.checkAchievements();
  }

  moveToInventory(uid) {
    const idx = this.aquarium.findIndex(f => f.uid === uid);
    if (idx === -1) return;
    const maxInv = this.getMaxInventory();
    if (this.inventory.length >= maxInv) { this.showToast('BALDE CHEIO!', 'warning'); return; }
    const fish = this.aquarium[idx];
    this.aquarium.splice(idx, 1);
    this.inventory.unshift(fish);
    sound.playClick();
    this.showToast(fish.name + ' voltou ao balde (buffs desativados).', 'info');
    this.renderAll();
  }
}
