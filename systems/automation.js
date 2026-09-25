// Automação: Mergulhador Amigo (auto-pesca) e Peixaria Automática (auto-venda).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { UPGRADES } from '../itemsData.js';
import { sound } from '../sound.js';
import { UPGRADES_WORLD_2 } from '../world2Data.js';

export class AutomationMethods {
  updateDiverVisual() {
    const isDiverActive = (this.upgradeLevels?.auto_pescador || 0) > 0 && !!this.autoFisherEnabled;
    this.waterRenderer?.setDiverActive(isDiverActive);
  }

  startAutoFisher() {
    if (this.autoFishTimer) clearInterval(this.autoFishTimer);
    this.updateDiverVisual();
    this.autoFishTimer = setInterval(() => {
      const lvl = this.upgradeLevels.auto_pescador || 0;
      const bar = document.getElementById('auto-fish-bar');
      const dot = document.getElementById('auto-fish-status-dot');
      const btn = document.getElementById('btn-toggle-auto-fish');
      const cd = document.getElementById('auto-fish-countdown');

      if (lvl <= 0) {
        if (bar && !bar.classList.contains('hidden')) bar.classList.add('hidden');
        return;
      }
      if (bar && bar.classList.contains('hidden')) bar.classList.remove('hidden');

      if (!this.autoFisherEnabled) {
        if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-red-500';
        if (btn) {
          btn.textContent = 'OFF';
          btn.className = 'px-1.5 py-0.5 border text-[8px] font-bold cursor-pointer transition-colors bg-red-950/90 text-red-300 border-red-700 hover:bg-red-900';
        }
        if (cd) {
          cd.textContent = 'PAUSADO';
          cd.className = 'text-red-400 font-bold bg-slate-950 px-1.5 py-0.5 border border-red-900/60';
        }
        return;
      }

      if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse';
      if (btn) {
        btn.textContent = 'ON';
        btn.className = 'px-1.5 py-0.5 border text-[8px] font-bold cursor-pointer transition-colors bg-emerald-600 text-slate-950 border-emerald-400 hover:bg-emerald-500';
      }

      const upgradeList = this.currentWorld === 2 ? UPGRADES_WORLD_2 : UPGRADES;
      const u = upgradeList.find(u => u.id === 'auto_pescador');
      const buffs = this.getActiveBuffs();
      const baseMs = (u ? u.getValue(lvl) : 8) * 1000;
      const finalMs = baseMs * (1 - buffs.autoFishSpeedBonus);
      const now = Date.now();
      const elapsed = now - (this.lastAutoFishTime || 0);
      const remainingSec = Math.max(0, (finalMs - elapsed) / 1000).toFixed(1);

      if (cd) {
        cd.textContent = remainingSec + 's';
        cd.className = 'text-cyan-300 font-bold bg-slate-950 px-1.5 py-0.5 border border-slate-700';
      }

      if (now - this.lastAutoFishTime >= finalMs) {
        this.lastAutoFishTime = now;
        if (this.inventory.length < this.getMaxInventory()) this.fish(true);
        this.checkDiverMagnetDiscovery();
      }
    }, 250);
  }

  startAutoSeller() {
    if (this.autoSellTimer) clearInterval(this.autoSellTimer);
    this.autoSellTimer = setInterval(() => {
      const lvl = this.upgradeLevels.auto_vendedor || 0;
      const bar = document.getElementById('auto-sell-bar');
      const countdownEl = document.getElementById('auto-sell-countdown');
      const dot = document.getElementById('auto-sell-status-dot');
      const btn = document.getElementById('btn-toggle-auto-sell');

      if (lvl <= 0) {
        if (bar && !bar.classList.contains('hidden')) bar.classList.add('hidden');
        return;
      }

      if (bar && bar.classList.contains('hidden')) {
        bar.classList.remove('hidden');
      }

      if (!this.autoSellerEnabled) {
        if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-red-500';
        if (btn) {
          btn.textContent = 'OFF';
          btn.className = 'px-1.5 py-0.5 border text-[8px] font-bold cursor-pointer transition-colors bg-red-950/90 text-red-300 border-red-700 hover:bg-red-900';
        }
        if (countdownEl) {
          countdownEl.textContent = 'PAUSADO';
          countdownEl.className = 'text-red-400 font-bold bg-slate-950 px-1.5 py-0.5 border border-red-900/60';
        }
        return;
      }

      if (dot) dot.className = 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse';
      if (btn) {
        btn.textContent = 'ON';
        btn.className = 'px-1.5 py-0.5 border text-[8px] font-bold cursor-pointer transition-colors bg-emerald-600 text-slate-950 border-emerald-400 hover:bg-emerald-500';
      }
      if (countdownEl) {
        countdownEl.className = 'text-emerald-300 font-bold bg-slate-950 px-1.5 py-0.5 border border-slate-700';
      }

      const sellerUpgrades = this.currentWorld === 2 ? UPGRADES_WORLD_2 : UPGRADES;
      const u = sellerUpgrades.find(up => up.id === 'auto_vendedor');
      const intervalSec = u ? u.getValue(lvl) : 60;
      const intervalMs = intervalSec * 1000;
      const now = Date.now();

      if (!this.nextAutoSellTime || this.nextAutoSellTime <= now - intervalMs) {
        this.nextAutoSellTime = now + intervalMs;
      }

      const remainingSec = Math.max(0, Math.ceil((this.nextAutoSellTime - now) / 1000));
      if (countdownEl) {
        countdownEl.textContent = remainingSec + 's';
      }

      // Dispara a venda automática quando o timer expira
      if (now >= this.nextAutoSellTime) {
        this.nextAutoSellTime = now + intervalMs;
        if (countdownEl) countdownEl.textContent = intervalSec + 's';

        // Vende TODOS os peixes filtrados que não estejam bloqueados
        if (this.inventory.length > 0 && this.autoSellFilter.length > 0) {
          const buffs = this.getActiveBuffs();
          let earned = 0, sold = 0;
          const remaining = [];
          this.inventory.forEach(f => {
            if (f.locked || !this.autoSellFilter.includes(f.rarity)) {
              remaining.push(f);
            } else {
              earned += Math.round(f.baseValue * (1 + buffs.goldMultiplier));
              sold++;
            }
          });

          if (sold > 0) {
            this.inventory = remaining;
            this.gold += earned;
            this.totalGoldEarned += earned;
            sound.playCoin();
            this.showFloatingText(`+${earned}G AUTO (${sold})`, '#34d399', 100);
            this.showToast(`Peixaria vendeu ${sold} peixe(s) por +${earned.toLocaleString('pt-BR')}G!`, 'success');
            this.renderHeader();
            this.renderInventory();
            this.renderStats();
            this.renderUpgrades(); // preços/"Faltam X G" da loja acompanham o ouro novo
          }
        }
      }
    }, 250);
  }

  toggleAutoFisher(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const lvl = this.upgradeLevels.auto_pescador || 0;
    if (lvl <= 0) {
      this.showToast('Você ainda não contratou o Mergulhador Amigo!', 'warning');
      return;
    }
    this.autoFisherEnabled = !this.autoFisherEnabled;
    sound.playClick();
    this.showToast(`Mergulhador Amigo: ${this.autoFisherEnabled ? 'LIGADO' : 'DESLIGADO'}`, this.autoFisherEnabled ? 'success' : 'warning');
    this.updateDiverVisual();
    this.renderUpgrades();
    this.saveGame();
  }

  toggleAutoSeller(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const lvl = this.upgradeLevels.auto_vendedor || 0;
    if (lvl <= 0) {
      this.showToast('Você ainda não possui a Peixaria Automática!', 'warning');
      return;
    }
    this.autoSellerEnabled = !this.autoSellerEnabled;
    sound.playClick();
    this.showToast(`Peixaria Automática: ${this.autoSellerEnabled ? 'LIGADA' : 'DESLIGADA'}`, this.autoSellerEnabled ? 'success' : 'warning');
    if (this.autoSellerEnabled) {
      const u = UPGRADES.find(up => up.id === 'auto_vendedor');
      const intervalMs = (u ? u.getValue(lvl) : 60) * 1000;
      this.nextAutoSellTime = Date.now() + intervalMs;
    }
    this.renderUpgrades();
    this.saveGame();
  }
}
