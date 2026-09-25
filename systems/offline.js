// Progresso offline (recompensa AFK por valor esperado).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { sound } from '../sound.js';

export class OfflineMethods {
  // Simula a ausência de forma determinística (valor esperado), sem sortear centenas de peixes.
  // Regra: tudo que é pescado offline é VENDIDO pela média da tabela de raridades; nada entra no
  // balde nem no álbum. Assim o farm offline nunca trava com o balde cheio, e peixes para o
  // aquário (ou para completar o álbum) exigem jogar online.
  checkOfflineProgress(simulatedSec = null) {
    if (this.offlinePending) return;
    const now = Date.now();
    const diffSec = simulatedSec !== null ? simulatedSec : Math.floor((now - (this.lastActiveTime || now)) / 1000);

    // Mínimo de 60 segundos de ausência para disparar recompensa
    if (diffSec < 60) return;

    const upgradeList = this.getUpgradeCatalog();
    const buffs = this.getActiveBuffs();

    let intervalSec = 45;
    let sourceText = 'A correnteza suave do lago fisgou peixes durante sua ausência!';
    const autoLevel = this.upgradeLevels.auto_pescador || 0;
    if (autoLevel > 0 && this.autoFisherEnabled) {
      const u = upgradeList.find(u => u.id === 'auto_pescador');
      intervalSec = (u ? u.getValue(autoLevel) : 8) * (1 - buffs.autoFishSpeedBonus);
      sourceText = 'Seu Mergulhador Amigo pescou no fundo do lago enquanto você esteve fora!';
    }

    // Limite de horas AFK: 8h, até 24h com a Rede de Espera
    const netUpgrade = upgradeList.find(u => u.id === 'rede_espera');
    const maxHours = netUpgrade ? netUpgrade.getValue(this.upgradeLevels.rede_espera || 0) : 8;
    const maxOfflineSec = maxHours * 3600;
    const effectiveSec = Math.min(diffSec, maxOfflineSec);
    const casts = Math.floor(effectiveSec / intervalSec);
    const catches = Math.floor(casts * (1 + buffs.doubleCatchChance));
    if (catches <= 0) return;

    const layer = this.getCurrentLayer();
    const chances = this.getRarityChances(buffs);
    let avgValue = 0;
    Object.keys(chances).forEach(rarity => {
      const pool = this.getFishPoolForRarity(rarity, layer);
      avgValue += chances[rarity] * pool.reduce((acc, t) => acc + this.getExpectedFishValue(t), 0) / pool.length;
    });
    const earnedGold = Math.round(catches * avgValue * (1 + buffs.goldMultiplier));

    // Formatar tempo ausente
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    let timeStr = '';
    if (hours > 0) timeStr += `${hours}h `;
    timeStr += `${hours > 0 ? minutes : Math.max(1, minutes)}m`;
    if (diffSec > maxOfflineSec) timeStr += ` (máx. ${maxHours}h)`;

    // Atualizar e exibir modal
    const modal = document.getElementById('offline-modal');
    const timeEl = document.getElementById('offline-time-text');
    const sourceEl = document.getElementById('offline-source-text');
    const catchesEl = document.getElementById('offline-catches-text');
    const goldEl = document.getElementById('offline-gold-text');
    const collectBtn = document.getElementById('btn-collect-offline');

    if (modal && timeEl && catchesEl && goldEl && collectBtn) {
      // Enquanto o modal está aberto, o autosave não avança lastActiveTime: um F5 aqui não perde a recompensa
      this.offlinePending = true;

      timeEl.textContent = `Você esteve fora por ${timeStr}!`;
      if (sourceEl) sourceEl.textContent = sourceText;
      catchesEl.textContent = catches.toLocaleString('pt-BR');
      goldEl.textContent = `+${earnedGold.toLocaleString('pt-BR')}G`;

      collectBtn.onclick = () => {
        if (!this.offlinePending) return;
        this.offlinePending = false;
        this.lastActiveTime = Date.now();
        this.gold += earnedGold;
        this.totalGoldEarned += earnedGold;
        this.totalCatches += catches;
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
