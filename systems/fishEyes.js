// Olhos de Peixe (meta-progressão diária à meia-noite), Santuário e Oferenda de Espécies.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { BUFF_LABELS, RARITIES } from '../fishData.js';
import { sound } from '../sound.js';

export class FishEyesMethods {
  getLocalDateKey(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msRemaining = Math.max(0, midnight.getTime() - now.getTime());
    const h = Math.floor(msRemaining / (1000 * 60 * 60));
    const m = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((msRemaining % (1000 * 60)) / 1000);
    return {
      msRemaining,
      h, m, s,
      text: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    };
  }

  checkMidnightFishEye(notify = true) {
    // A mecânica de Olhos de Peixe só é ativada após capturar o primeiro peixe Lendário
    if (!this.firstRarityCatches?.LENDARIO) return;

    const todayKey = this.getLocalDateKey();
    if (!this.lastFishEyeDate) {
      this.lastFishEyeDate = todayKey;
      this.fishEyesCount = (this.fishEyesCount || 0) + 1;
      this.fishEyesTotal = (this.fishEyesTotal || 0) + 1;
      this.saveGame();
      this.renderFishEyesBadge();
      if (notify) {
        sound.playCatch?.('MITICO') || sound.playUpgrade?.();
        this.showToast('👁️ Você recebeu seu 1º Olho de Peixe de boas-vindas!', 'success');
      }
      return;
    }

    if (this.lastFishEyeDate !== todayKey) {
      const last = new Date(this.lastFishEyeDate + 'T00:00:00');
      const curr = new Date(todayKey + 'T00:00:00');
      const diffMs = curr.getTime() - last.getTime();
      const daysPassed = Math.max(1, Math.floor(diffMs / (24 * 60 * 60 * 1000)));

      this.lastFishEyeDate = todayKey;
      this.fishEyesCount = (this.fishEyesCount || 0) + daysPassed;
      this.fishEyesTotal = (this.fishEyesTotal || 0) + daysPassed;
      this.saveGame();
      this.renderFishEyesBadge();
      this.renderFishEyesModal();

      sound.playCatch?.('MITICO') || sound.playUpgrade?.();
      const msg = daysPassed === 1
        ? '👁️ A meia-noite chegou! Você ganhou 1 Olho de Peixe!'
        : `👁️ Você esteve ausente por ${daysPassed} dias e recebeu ${daysPassed} Olhos de Peixe!`;
      this.showToast(msg, 'success');
    }
  }

  startMidnightTimerLoop() {
    if (this._midnightTimer) clearInterval(this._midnightTimer);
    this._midnightTimer = setInterval(() => {
      const remaining = this.getTimeUntilMidnight();
      const timerEl = document.getElementById('fe-next-timer');
      if (timerEl) timerEl.textContent = remaining.text;

      const todayKey = this.getLocalDateKey();
      if (this.lastFishEyeDate && this.lastFishEyeDate !== todayKey) {
        this.checkMidnightFishEye(true);
      }
    }, 1000);
  }

  openFishEyesModal() {
    if (!this.firstRarityCatches?.LENDARIO) {
      this.showToast('🔒 Capture seu 1º Peixe Lendário para despertar o Santuário dos Olhos!', 'warning');
      return;
    }
    try {
      sound.playClick?.();
      this.checkMidnightFishEye(false);
      this.renderFishEyesBadge();
      this.renderFishEyesModal();
    } catch (e) {
      console.error('Erro ao renderizar Santuário dos Olhos:', e);
    }
    const modal = document.getElementById('fish-eyes-modal');
    modal?.classList.remove('hidden');
  }

  closeFishEyesModal() {
    sound.playClick();
    const modal = document.getElementById('fish-eyes-modal');
    modal?.classList.add('hidden');
  }

  renderFishEyesBadge() {
    const btn = document.getElementById('btn-open-fish-eyes');
    const isUnlocked = Boolean(this.firstRarityCatches?.LENDARIO);
    if (btn) {
      if (isUnlocked) {
        btn.classList.remove('hidden');
      } else {
        btn.classList.add('hidden');
      }
    }

    const badge = document.getElementById('fish-eyes-badge');
    if (badge) {
      const count = this.fishEyesCount || 0;
      badge.textContent = `${count} ${count === 1 ? 'OLHO' : 'OLHOS'}`;
      if (count > 0) {
        badge.className = 'min-w-[58px] text-center text-[8px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 border border-amber-800/80 animate-pulse shrink-0 whitespace-nowrap';
      } else {
        badge.className = 'min-w-[58px] text-center text-[8px] font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 border border-cyan-800/80 shrink-0 whitespace-nowrap';
      }
    }
  }

  renderFishEyesModal() {
    const availEl = document.getElementById('fe-available-count');
    if (availEl) availEl.textContent = this.fishEyesCount || 0;

    const alloc = this.fishEyesAllocated || { gold: 0, luck: 0, speed: 0, double: 0 };

    // Limites base sobem com a camada mais funda liberada (getBuffCaps) + 1% por olho investido
    const caps = this.getBuffCaps();
    const baseGold = Math.round(caps.gold * 100);
    const goldLvl = alloc.gold || 0;
    const goldBonus = goldLvl * 1;
    const goldCap = baseGold + goldBonus;
    const lvlGold = document.getElementById('fe-lvl-gold');
    if (lvlGold) lvlGold.textContent = `${goldLvl} Olho(s)`;
    const bonusGold = document.getElementById('fe-bonus-gold');
    if (bonusGold) bonusGold.textContent = `+${goldBonus}%`;
    const capGold = document.getElementById('fe-cap-gold');
    if (capGold) capGold.textContent = `${goldCap}%`;
    const baseGoldEl = document.getElementById('fe-base-gold-label');
    if (baseGoldEl) baseGoldEl.textContent = `(Base: ${baseGold}%)`;

    const baseLuck = Math.round(caps.luck * 100);
    const luckLvl = alloc.luck || 0;
    const luckBonus = luckLvl * 1;
    const luckCap = baseLuck + luckBonus;
    const lvlLuck = document.getElementById('fe-lvl-luck');
    if (lvlLuck) lvlLuck.textContent = `${luckLvl} Olho(s)`;
    const bonusLuck = document.getElementById('fe-bonus-luck');
    if (bonusLuck) bonusLuck.textContent = `+${luckBonus}%`;
    const capLuck = document.getElementById('fe-cap-luck');
    if (capLuck) capLuck.textContent = `${luckCap}%`;
    const baseLuckEl = document.getElementById('fe-base-luck-label');
    if (baseLuckEl) baseLuckEl.textContent = `(Base: ${baseLuck}%)`;

    const speedLvl = alloc.speed || 0;
    const speedBonus = speedLvl * 1;
    const speedCap = Math.min(95, Math.round(caps.speed * 100) + speedBonus);
    const lvlSpeed = document.getElementById('fe-lvl-speed');
    if (lvlSpeed) lvlSpeed.textContent = `${speedLvl} Olho(s)`;
    const bonusSpeed = document.getElementById('fe-bonus-speed');
    if (bonusSpeed) bonusSpeed.textContent = `+${speedBonus}%`;
    const capSpeed = document.getElementById('fe-cap-speed');
    if (capSpeed) capSpeed.textContent = `${speedCap}%`;

    const doubleLvl = alloc.double || 0;
    const doubleBonus = doubleLvl * 1;
    const doubleCap = Math.min(100, Math.round(caps.double * 100) + doubleBonus);
    const lvlDouble = document.getElementById('fe-lvl-double');
    if (lvlDouble) lvlDouble.textContent = `${doubleLvl} Olho(s)`;
    const bonusDouble = document.getElementById('fe-bonus-double');
    if (bonusDouble) bonusDouble.textContent = `+${doubleBonus}%`;
    const capDouble = document.getElementById('fe-cap-double');
    if (capDouble) capDouble.textContent = `${doubleCap}%`;

    const timerEl = document.getElementById('fe-next-timer');
    if (timerEl) timerEl.textContent = this.getTimeUntilMidnight().text;

    this.renderOfferingContent();
  }

  switchFishEyesTab(tab) {
    this.activeFishEyesTab = tab;
    const btnAttr = document.getElementById('tab-btn-fe-attributes');
    const btnOff = document.getElementById('tab-btn-fe-offering');
    const panelAttr = document.getElementById('fe-tab-attributes-content');
    const panelOff = document.getElementById('fe-tab-offering-content');

    if (tab === 'offering') {
      btnAttr?.classList.remove('bg-slate-800', 'text-cyan-300', 'border-cyan-500');
      btnAttr?.classList.add('bg-slate-950', 'text-slate-400', 'border-transparent');
      btnOff?.classList.remove('bg-slate-950', 'text-slate-400', 'border-transparent');
      btnOff?.classList.add('bg-slate-800', 'text-amber-300', 'border-amber-500');
      panelAttr?.classList.add('hidden');
      panelOff?.classList.remove('hidden');
    } else {
      btnOff?.classList.remove('bg-slate-800', 'text-amber-300', 'border-amber-500');
      btnOff?.classList.add('bg-slate-950', 'text-slate-400', 'border-transparent');
      btnAttr?.classList.remove('bg-slate-950', 'text-slate-400', 'border-transparent');
      btnAttr?.classList.add('bg-slate-800', 'text-cyan-300', 'border-cyan-500');
      panelAttr?.classList.remove('hidden');
      panelOff?.classList.add('hidden');
    }
    sound.playClick?.();
    this.renderFishEyesModal();
  }

  renderOfferingContent() {
    const pool = this.getFishCatalog();
    const total = pool.length;
    const donatedCount = pool.filter(f => (this.speciesDonations && this.speciesDonations[f.id]) || (this.donatedSpeciesHistory && this.donatedSpeciesHistory[f.id])).length;

    const isOfferingUnlocked = Boolean(this.firstRarityCatches?.MITICO);

    const tabBtn = document.getElementById('tab-btn-fe-offering');
    if (tabBtn) {
      if (isOfferingUnlocked) {
        tabBtn.innerHTML = `<span>🏺</span> OFERENDA DE ESPÉCIES <span id="fe-offering-tab-badge" class="px-1 py-0.2 bg-amber-950 text-amber-300 text-[8px] border border-amber-600/80 font-mono">${donatedCount}/${total}</span>`;
      } else {
        tabBtn.innerHTML = `<span>🔒</span> OFERENDAS <span class="px-1 py-0.2 bg-pink-950 text-pink-300 text-[8px] border border-pink-700/80 font-mono">MÍTICO</span>`;
      }
    }

    const lockedView = document.getElementById('fe-offering-locked-view');
    const activeView = document.getElementById('fe-offering-active-view');
    if (!isOfferingUnlocked) {
      lockedView?.classList.remove('hidden');
      activeView?.classList.add('hidden');
      return;
    }

    lockedView?.classList.add('hidden');
    activeView?.classList.remove('hidden');

    const tabBadge = document.getElementById('fe-offering-tab-badge');
    if (tabBadge) tabBadge.textContent = `${donatedCount}/${total}`;

    const cycleLabel = document.getElementById('fe-offering-cycle-label');
    if (cycleLabel) cycleLabel.textContent = `Ciclo ${this.offeringCycle || 1}`;

    const countDisplay = document.getElementById('fe-offering-count-display');
    if (countDisplay) countDisplay.textContent = `${donatedCount} / ${total}`;

    const bar = document.getElementById('fe-offering-progress-bar');
    if (bar) {
      const pct = total > 0 ? Math.min(100, Math.round((donatedCount / total) * 100)) : 0;
      bar.style.width = `${pct}%`;
    }

    const readySpecies = pool.filter(f => !this.speciesDonations?.[f.id] && !this.donatedSpeciesHistory?.[f.id] && this.inventory.some(inv => inv.id === f.id));
    const readyHint = document.getElementById('fe-offering-ready-hint');
    if (readyHint) {
      readyHint.textContent = `${readySpecies.length} espécie(s) pronta(s) no balde`;
    }

    const grid = document.getElementById('fe-offering-species-grid');
    if (!grid) return;

    grid.innerHTML = pool.map(fish => {
      const isDonated = Boolean((this.speciesDonations && this.speciesDonations[fish.id]) || (this.donatedSpeciesHistory && this.donatedSpeciesHistory[fish.id]));
      const hasInBucket = this.inventory.some(inv => inv.id === fish.id);
      const r = RARITIES[fish.rarity] || RARITIES.COMUM || { color: '#fff', border: '#475569', label: fish.rarity, bg: 'rgba(30,41,59,0.5)' };
      const spriteURL = this.getFishSpriteURL ? this.getFishSpriteURL(fish.icon) : null;

      return `
        <div class="p-2 border-2 flex items-center justify-between gap-2.5 min-h-[56px] ${
          isDonated 
            ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[inset_0_0_8px_rgba(16,185,129,0.2)]' 
            : (hasInBucket ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50' : 'bg-slate-900/90 border-slate-800')
        }" style="font-family:var(--font-pixel); box-sizing: border-box;">
          
          <!-- Lado Esquerdo: Sprite Pixel Art Real + Nome Completo + Raridade -->
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <div class="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center bg-black/70 border border-slate-700/80 p-0.5 overflow-hidden shadow-inner">
              ${spriteURL 
                ? `<img src="${spriteURL}" class="max-w-full max-h-full object-contain select-none" alt="${fish.name}" style="image-rendering:pixelated;">` 
                : `<span class="text-base select-none">🐟</span>`
              }
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[8.5px] sm:text-[9px] font-bold text-slate-100 leading-tight line-clamp-2" title="${fish.name}">${fish.name}</div>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 border" style="color:${r.color};border-color:${r.border};background:rgba(0,0,0,0.4);">${r.label}</span>
              </div>
            </div>
          </div>

          <!-- Lado Direito: Ação / Status -->
          <div class="shrink-0 flex items-center justify-end pl-1">
            ${isDonated 
              ? '<span class="px-2.5 py-1.5 text-[8px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-400 whitespace-nowrap shadow-[0_0_8px_rgba(16,185,129,0.3)]">✓ ENTREGUE</span>' 
              : (hasInBucket 
                  ? `<button onclick="window.game.donateFish('${fish.id}')" class="pixel-btn px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[8px] cursor-pointer whitespace-nowrap shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-transform active:scale-95">DOAR</button>` 
                  : '<span class="px-2 py-1.5 text-[8px] font-bold text-slate-400 bg-slate-950 border border-slate-800 whitespace-nowrap">FALTA PESCAR</span>'
                )
            }
          </div>
        </div>
      `;
    }).join('');
  }

  resetDonations() {
    this.speciesDonations = {};
    this.donatedSpeciesHistory = {};
    this.saveGame();
    this.renderInventory();
    this.renderFishEyesBadge();
    this.renderFishEyesModal();
    this.showToast('🏺 Todas as doações de espécies foram resetadas!', 'special');
    this.consoleLog('Todas as doações de espécies foram resetadas com sucesso!', '#38bdf8');
  }

  donateFish(fishId, uid = null) {
    if (!this.firstRarityCatches?.MITICO) {
      this.showToast('🔒 Capture seu 1º Peixe Mítico para liberar as doações de espécies!', 'warning');
      return;
    }

    const pool = this.getFishCatalog();
    const targetFish = pool.find(f => f.id === fishId);
    if (!targetFish) return;

    if (!this.speciesDonations) this.speciesDonations = {};
    if (!this.donatedSpeciesHistory) this.donatedSpeciesHistory = {};

    if (this.speciesDonations[fishId] || this.donatedSpeciesHistory[fishId]) {
      this.showToast('Esta espécie já foi doada e registrada!', 'info');
      return;
    }

    let invIndex = -1;
    if (uid) {
      invIndex = this.inventory.findIndex(inv => inv.uid === uid && !inv.locked);
    }
    if (invIndex === -1) {
      invIndex = this.inventory.findIndex(inv => inv.id === fishId && !inv.locked);
    }

    if (invIndex === -1) {
      const lockedIdx = this.inventory.findIndex(inv => inv.id === fishId);
      if (lockedIdx !== -1) {
        this.showToast('O peixe está travado no balde! Destrave-o para doar.', 'warning');
      } else {
        this.showToast('Você não possui este peixe no balde!', 'warning');
      }
      return;
    }

    this.inventory.splice(invIndex, 1);
    this.speciesDonations[fishId] = true;
    this.donatedSpeciesHistory[fishId] = true;
    sound.playUpgrade?.() || sound.playClick?.();

    // Recompensa imediata: +1 Olho de Peixe para CADA peixe doado
    this.fishEyesCount = (this.fishEyesCount || 0) + 1;
    this.fishEyesTotal = (this.fishEyesTotal || 0) + 1;

    const allDonated = pool.every(f => this.speciesDonations[f.id]);
    if (allDonated) {
      // Bônus adicional de ciclo ao completar todas as 25 espécies
      this.fishEyesCount = (this.fishEyesCount || 0) + 1;
      this.fishEyesTotal = (this.fishEyesTotal || 0) + 1;
      this.offeringCycle = (this.offeringCycle || 1) + 1;
      this.speciesDonations = {};
      this.showToast('🏆 CICLO COMPLETO! +1 OLHO PELO PEIXE E +1 OLHO BÔNUS DO SANTUÁRIO!', 'legendary');
      sound.playUpgrade?.();
    } else {
      this.showToast(`🏺 ${targetFish.name} oferecido! +1 Olho de Peixe obtido!`, 'success');
    }

    this.renderFishEyesBadge();
    this.renderFishEyesModal();
    this.renderInventory();
    this.renderHeader();
    this.saveGame();
  }

  donateAllAvailableFish() {
    if (!this.firstRarityCatches?.MITICO) {
      this.showToast('🔒 Capture seu 1º Peixe Mítico para liberar as doações de espécies!', 'warning');
      return;
    }

    const pool = this.getFishCatalog();
    if (!this.speciesDonations) this.speciesDonations = {};
    let donatedCount = 0;

    for (const fish of pool) {
      if (this.speciesDonations[fish.id]) continue;
      const invIdx = this.inventory.findIndex(inv => inv.id === fish.id && !inv.locked);
      if (invIdx !== -1) {
        this.inventory.splice(invIdx, 1);
        this.speciesDonations[fish.id] = true;
        if (!this.donatedSpeciesHistory) this.donatedSpeciesHistory = {};
        this.donatedSpeciesHistory[fish.id] = true;
        donatedCount++;
      }
    }

    if (donatedCount === 0) {
      sound.playClick?.();
      this.showToast('Nenhuma nova espécie disponível para doar no balde no momento.', 'info');
      return;
    }

    sound.playUpgrade?.();
    // Recompensa imediata: +1 Olho de Peixe para CADA peixe doado no lote
    this.fishEyesCount = (this.fishEyesCount || 0) + donatedCount;
    this.fishEyesTotal = (this.fishEyesTotal || 0) + donatedCount;

    const allDonated = pool.every(f => this.speciesDonations[f.id]);
    if (allDonated) {
      // Bônus adicional de ciclo ao completar todas as 25 espécies
      this.fishEyesCount = (this.fishEyesCount || 0) + 1;
      this.fishEyesTotal = (this.fishEyesTotal || 0) + 1;
      this.offeringCycle = (this.offeringCycle || 1) + 1;
      this.speciesDonations = {};
      this.showToast(`🏆 OFERENDA SAGRADA COMPLETA! +${donatedCount} Olhos obtidos (+1 Olho Bônus pelo ciclo)!`, 'legendary');
    } else {
      this.showToast(`🏺 ${donatedCount} espécie(s) doada(s)! +${donatedCount} Olho(s) de Peixe obtido(s)!`, 'success');
    }

    this.renderFishEyesBadge();
    this.renderFishEyesModal();
    this.renderInventory();
    this.renderHeader();
    this.saveGame();
  }

  allocateFishEye(attr) {
    if (!['gold', 'luck', 'speed', 'double'].includes(attr)) return;
    if ((this.fishEyesCount || 0) <= 0) {
      sound.playClick?.();
      this.showToast('Você não possui Olhos de Peixe disponíveis! Aguarde as 00:00.', 'warning');
      return;
    }

    this.fishEyesCount--;
    if (!this.fishEyesAllocated) this.fishEyesAllocated = { gold: 0, luck: 0, speed: 0, double: 0 };
    this.fishEyesAllocated[attr] = (this.fishEyesAllocated[attr] || 0) + 1;

    sound.playUpgrade?.() || sound.playClick?.();
    const names = {
      gold: `${BUFF_LABELS.gold_multiplier} (+1% & +1% Cap)`,
      luck: `${BUFF_LABELS.luck_bonus} (+1% & +1% Cap)`,
      speed: `${BUFF_LABELS.fishing_speed} (+1% & +1% Cap)`,
      double: `${BUFF_LABELS.double_catch_chance} (+1% & +1% Cap)`
    };
    this.showToast(`👁️ +1 Olho investido em ${names[attr]}!`, 'success');
    this.renderFishEyesBadge();
    this.renderFishEyesModal();
    this.renderBuffs();
    this.renderStats();
    this.saveGame();
  }

  resetFishEyes() {
    const alloc = this.fishEyesAllocated || { gold: 0, luck: 0, speed: 0, double: 0 };
    const totalAllocated = (alloc.gold || 0) + (alloc.luck || 0) + (alloc.speed || 0) + (alloc.double || 0);
    if (totalAllocated <= 0) {
      this.showToast('Nenhum Olho de Peixe foi investido ainda.', 'info');
      return;
    }

    this.fishEyesCount = (this.fishEyesCount || 0) + totalAllocated;
    this.fishEyesAllocated = { gold: 0, luck: 0, speed: 0, double: 0 };

    sound.playClick?.();
    this.showToast(`↺ ${totalAllocated} Olho(s) de Peixe devolvido(s) para o saldo! Escolha novamente onde alocar.`, 'info');
    this.renderFishEyesBadge();
    this.renderFishEyesModal();
    this.renderBuffs();
    this.renderStats();
    this.saveGame();
  }
}
