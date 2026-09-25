// Progresso offline (recompensa AFK por valor esperado).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { UPGRADES } from '../itemsData.js';
import { sound } from '../sound.js';
import { UPGRADES_WORLD_2 } from '../world2Data.js';

export class OfflineMethods {
  // Simula a ausência de forma determinística (valor esperado), sem sortear centenas de peixes:
  // - peixes que a Peixaria vende viram ouro pela média estatística da tabela de raridades;
  // - peixes que ela NÃO vende ocupam o balde; quando ele enche, o Mergulhador para;
  // - só os peixes que realmente entram no balde contam no álbum (na hora de coletar).
  checkOfflineProgress(simulatedSec = null) {
    if (this.offlinePending) return;
    const now = Date.now();
    const diffSec = simulatedSec !== null ? simulatedSec : Math.floor((now - (this.lastActiveTime || now)) / 1000);

    // Mínimo de 60 segundos de ausência para disparar recompensa
    if (diffSec < 60) return;

    const upgradeList = this.currentWorld === 2 ? UPGRADES_WORLD_2 : UPGRADES;
    const buffs = this.getActiveBuffs();

    let intervalSec = 45;
    let sourceText = 'A correnteza suave do lago fisgou peixes durante sua ausência!';
    const autoLevel = this.upgradeLevels.auto_pescador || 0;
    if (autoLevel > 0 && this.autoFisherEnabled) {
      const u = upgradeList.find(u => u.id === 'auto_pescador');
      intervalSec = (u ? u.getValue(autoLevel) : 8) * (1 - buffs.autoFishSpeedBonus);
      sourceText = 'Seu Mergulhador Amigo pescou no fundo do lago enquanto você esteve fora!';
    }

    const maxOfflineSec = 8 * 3600; // Máximo de 8 horas AFK
    const effectiveSec = Math.min(diffSec, maxOfflineSec);
    const casts = Math.floor(effectiveSec / intervalSec);
    const potentialCatches = Math.floor(casts * (1 + buffs.doubleCatchChance));
    if (potentialCatches <= 0) return;

    // Ausências de 15 min+ atravessam o ciclo inteiro: exclusivos de cada horário entram na média
    const phases = (this.currentWorld !== 2 && effectiveSec >= 15 * 60)
      ? ['day', 'sunset', 'night']
      : [this.timeOfDay];

    const chances = this.getRarityChances(buffs);
    const rodPower = this.getEquippedRodPower();
    const expectedValueByRarity = {};
    Object.keys(chances).forEach(rarity => {
      let sum = 0;
      phases.forEach(phase => {
        const pool = this.getFishPoolForRarity(rarity, phase);
        sum += pool.reduce((acc, t) => acc + this.getExpectedFishValue(t, rodPower), 0) / pool.length;
      });
      expectedValueByRarity[rarity] = sum / phases.length;
    });

    // Peixaria: raridades vendidas automaticamente não ocupam o balde
    const sellerLevel = this.upgradeLevels.auto_vendedor || 0;
    const sellerActive = sellerLevel > 0 && this.autoSellerEnabled;
    const soldRarities = sellerActive ? (this.autoSellFilter || []) : [];
    const pSell = soldRarities.reduce((acc, r) => acc + (chances[r] || 0), 0);
    const pKeep = Math.max(0, 1 - pSell);

    const freeSlots = Math.max(0, this.getMaxInventory() - this.inventory.length);
    let catches = potentialCatches;
    if (pKeep > 1e-9) catches = Math.min(catches, Math.floor(freeSlots / pKeep));
    const bucketFilled = catches < potentialCatches;

    const keptCount = Math.min(freeSlots, Math.round(catches * pKeep));
    const soldCount = catches - keptCount;
    const avgSoldValue = pSell > 0
      ? soldRarities.reduce((acc, r) => acc + (chances[r] || 0) * expectedValueByRarity[r], 0) / pSell
      : 0;
    const earnedGold = Math.round(soldCount * avgSoldValue * (1 + buffs.goldMultiplier));

    // Peixes que ficaram no balde são reais: sorteados só entre as raridades que a Peixaria não vende
    const keptRarities = Object.keys(chances).filter(r => !soldRarities.includes(r));
    const keptFish = [];
    for (let i = 0; i < keptCount; i++) {
      let rand = Math.random() * pKeep;
      let rarity = keptRarities[keptRarities.length - 1];
      for (const r of keptRarities) {
        if (rand <= chances[r]) { rarity = r; break; }
        rand -= chances[r];
      }
      const timeOfDay = phases[Math.floor(Math.random() * phases.length)];
      keptFish.push(this.rollFish(buffs, { rarity, timeOfDay }));
    }

    if (catches <= 0) {
      this.showToast('Seu balde estava cheio: nada foi pescado enquanto você esteve fora!', 'warning');
      return;
    }

    if (bucketFilled) {
      sourceText += ' O balde encheu e a pesca parou. Libere espaço ou configure a Peixaria!';
    }

    // Formatar tempo ausente
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    let timeStr = '';
    if (hours > 0) timeStr += `${hours}h `;
    timeStr += `${Math.max(1, minutes)}m`;
    if (diffSec > maxOfflineSec) timeStr += ' (máx. 8h)';

    // Atualizar e exibir modal
    const modal = document.getElementById('offline-modal');
    const timeEl = document.getElementById('offline-time-text');
    const sourceEl = document.getElementById('offline-source-text');
    const catchesEl = document.getElementById('offline-catches-text');
    const keptEl = document.getElementById('offline-kept-text');
    const goldEl = document.getElementById('offline-gold-text');
    const collectBtn = document.getElementById('btn-collect-offline');

    if (modal && timeEl && catchesEl && goldEl && collectBtn) {
      // Enquanto o modal está aberto, o autosave não avança lastActiveTime: um F5 aqui não perde a recompensa
      this.offlinePending = true;

      timeEl.textContent = `Você esteve fora por ${timeStr}!`;
      if (sourceEl) sourceEl.textContent = sourceText;
      catchesEl.textContent = catches.toLocaleString('pt-BR');
      if (keptEl) keptEl.textContent = `${keptFish.length} peixe(s)`;
      goldEl.textContent = `+${earnedGold.toLocaleString('pt-BR')}G`;

      collectBtn.onclick = () => {
        if (!this.offlinePending) return;
        this.offlinePending = false;
        this.lastActiveTime = Date.now();
        this.gold += earnedGold;
        this.totalGoldEarned += earnedGold;
        this.totalCatches += catches;
        keptFish.forEach(fish => {
          this.inventory.unshift(fish);
          this.recordDiscovery(fish);
        });
        sound.playCoin();
        sound.vibrate([40, 40, 80]);
        modal.classList.add('hidden');
        this.renderAll();
        this.saveGame();
        this.showToast(`+${earnedGold.toLocaleString('pt-BR')}G coletados!`, 'success');
      };

      modal.classList.remove('hidden');
    }
  }
}
