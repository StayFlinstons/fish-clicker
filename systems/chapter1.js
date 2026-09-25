// Capítulo 1: Portal Dimensional, Altar de sacrifícios e cinemática do Kraken.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { ACHIEVEMENTS } from '../achievementsData.js';
import { FISH_LIST } from '../fishData.js';
import { getBaitIconDataURL, getRodIconDataURL } from '../pixelArt.js';
import { sound } from '../sound.js';

export class Chapter1Methods {
  checkChapter1Completion(triggerModalIfNew = false) {
    const hasRod = this.unlockedRods.includes('vara_travessia');
    const hasBait = this.unlockedBaits.includes('essencia_travessia');
    const isComplete = hasRod && hasBait;

    if (isComplete && !this.chapter1Completed) {
      this.chapter1Completed = true;
      this.saveGame();
      if (triggerModalIfNew) {
        sound.playUpgrade();
        this.showToast('★ O PORTAL DIMENSIONAL DESPERTOU! ★', 'special');
        setTimeout(() => {
          this.openChapter1Modal();
        }, 800);
      }
    }
    this.updateChapter1Badge();
  }

  updateChapter1Badge() {
    const portalBtn = document.getElementById('btn-open-chapter1');
    if (portalBtn) {
      if (this.unlockedRods && this.unlockedRods.includes('vara_travessia')) {
        portalBtn.classList.remove('hidden');
      } else {
        portalBtn.classList.add('hidden');
      }
    }

    const badge = document.getElementById('chapter1-badge');
    if (!badge) return;

    if (this.chapter1Completed) {
      badge.textContent = 'PORTAL ATIVO';
      badge.className = 'min-w-[58px] text-center text-[8px] font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 border border-cyan-800/80 animate-pulse shrink-0 whitespace-nowrap';
    } else {
      const hasRod = this.unlockedRods.includes('vara_travessia');
      const hasBait = this.unlockedBaits.includes('essencia_travessia');
      const progress = (hasRod ? 1 : 0) + (hasBait ? 1 : 0);
      badge.textContent = progress > 0 ? `CAP. 1 (${progress}/2)` : 'CAP. 1';
      badge.className = 'min-w-[58px] text-center text-[8px] font-bold text-purple-300 bg-purple-950 px-1.5 py-0.5 border border-purple-800/80 shrink-0 whitespace-nowrap';
    }
  }

  openChapter1Modal() {
    sound.playClick();
    const modal = document.getElementById('chapter1-modal');
    if (!modal) return;

    const hasRod = this.unlockedRods.includes('vara_travessia');
    const hasBait = this.unlockedBaits.includes('essencia_travessia');

    // Renderizar ícones pixel art
    const rodIconContainer = document.getElementById('req-rod-icon');
    if (rodIconContainer) {
      rodIconContainer.innerHTML = `<img src="${getRodIconDataURL('vara_travessia', 2.2)}" class="w-8 h-8" style="image-rendering:pixelated;" alt="Vara da Travessia"/>`;
    }
    const baitIconContainer = document.getElementById('req-bait-icon');
    if (baitIconContainer) {
      baitIconContainer.innerHTML = `<img src="${getBaitIconDataURL('essencia_travessia', 2.2)}" class="w-8 h-8" style="image-rendering:pixelated;" alt="Essência do Vórtice"/>`;
    }

    // Status Vara
    const reqRodCard = document.getElementById('req-card-rod');
    const reqRodStatus = document.getElementById('req-rod-status');
    if (reqRodCard && reqRodStatus) {
      if (hasRod) {
        reqRodStatus.textContent = 'CONQUISTADO';
        reqRodStatus.className = 'text-[8px] font-bold text-emerald-400';
        reqRodCard.className = 'bg-cyan-950/40 border-2 border-emerald-500/80 p-2.5 flex items-center gap-3';
      } else {
        reqRodStatus.textContent = 'PENDENTE';
        reqRodStatus.className = 'text-[8px] font-bold text-red-400';
        reqRodCard.className = 'bg-slate-950 border-2 border-slate-800 p-2.5 flex items-center gap-3';
      }
    }

    // Status Isca
    const reqBaitCard = document.getElementById('req-card-bait');
    const reqBaitStatus = document.getElementById('req-bait-status');
    if (reqBaitCard && reqBaitStatus) {
      if (hasBait) {
        reqBaitStatus.textContent = 'CONQUISTADO';
        reqBaitStatus.className = 'text-[8px] font-bold text-emerald-400';
        reqBaitCard.className = 'bg-purple-950/40 border-2 border-emerald-500/80 p-2.5 flex items-center gap-3';
      } else {
        reqBaitStatus.textContent = 'PENDENTE';
        reqBaitStatus.className = 'text-[8px] font-bold text-red-400';
        reqBaitCard.className = 'bg-slate-950 border-2 border-slate-800 p-2.5 flex items-center gap-3';
      }
    }

    // Portal Status & Altar de Sacrifício
    const portalTitle = document.getElementById('chapter1-status-title');
    const portalDesc = document.getElementById('chapter1-status-desc');
    const altarContainer = document.getElementById('chapter1-altar-container');

    if (hasRod && hasBait) {
      if (portalTitle) {
        portalTitle.textContent = '★ PORTAL DIMENSIONAL DESPERTO! ★';
        portalTitle.className = 'text-sm font-bold text-cyan-300 mt-2 tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]';
      }
      if (portalDesc) {
        portalDesc.textContent = 'A fenda espacial vibra intensamente. O Altar das 15 Almas emergiu para exigir o tributo das criaturas lendárias!';
      }
      if (altarContainer) {
        altarContainer.classList.remove('hidden');
        this.renderAltarSouls();
      }
    } else {
      if (portalTitle) {
        portalTitle.textContent = 'PORTAL DIMENSIONAL EM CARGA';
        portalTitle.className = 'text-sm font-bold text-cyan-400/80 mt-2';
      }
      if (portalDesc) {
        portalDesc.textContent = 'Para estabilizar o vórtice e selar o Capítulo 1, você precisará da lendária Vara da Travessia Astral e da Essência do Vórtice Dimensional.';
      }
      if (altarContainer) {
        altarContainer.classList.add('hidden');
      }
    }

    // Estatísticas da Jornada V1
    const statCatches = document.getElementById('chapter1-stat-catches');
    const statGold = document.getElementById('chapter1-stat-gold');
    const statFish = document.getElementById('chapter1-stat-fish');
    const statAch = document.getElementById('chapter1-stat-ach');

    if (statCatches) statCatches.textContent = this.totalCatches.toLocaleString('pt-BR');
    if (statGold) statGold.textContent = `${this.totalGoldEarned.toLocaleString('pt-BR')} G`;
    if (statFish) statFish.textContent = `${Object.keys(this.discoveredFish || {}).length} / ${FISH_LIST.length}`;
    if (statAch) statAch.textContent = `${this.unlockedAchievements.length} / ${ACHIEVEMENTS.length}`;

    modal.classList.remove('hidden');
  }

  renderAltarSouls() {
    const grid = document.getElementById('altar-slots-grid');
    const soulsCountEl = document.getElementById('altar-souls-count');
    const eligibleCountEl = document.getElementById('altar-eligible-count');
    const btnSacrifice = document.getElementById('btn-sacrifice-fish');
    const krakenReadyBox = document.getElementById('altar-kraken-ready');
    const altarActionSection = document.getElementById('altar-action-section');

    const totalNeeded = 15;
    const current = Math.min(totalNeeded, this.sacrificedFishCount || 0);

    if (soulsCountEl) {
      soulsCountEl.textContent = `${current} / ${totalNeeded} ALMAS`;
    }

    // Renderizar os 15 slots de almas com pixel art de chamas cósmicas
    if (grid) {
      let slotsHtml = '';
      for (let i = 0; i < totalNeeded; i++) {
        const isFilled = i < current;
        slotsHtml += `
          <div class="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border-2 ${isFilled ? 'bg-purple-950 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]' : 'bg-slate-950 border-slate-800 opacity-50'}">
            ${isFilled 
              ? `<svg class="w-4 h-4 drop-shadow-[0_0_4px_#f43f5e]" viewBox="0 0 10 10" style="image-rendering:pixelated;"><rect x="4" y="1" width="2" height="1" fill="#fbcfe8"/><rect x="3" y="2" width="4" height="2" fill="#f43f5e"/><rect x="2" y="4" width="6" height="3" fill="#e11d48"/><rect x="3" y="7" width="4" height="1" fill="#9f1239"/><rect x="4" y="8" width="2" height="1" fill="#881337"/><rect x="4" y="3" width="2" height="3" fill="#ffffff"/></svg>`
              : `<span class="text-[8px] text-slate-600 font-bold">✧</span>`
            }
          </div>
        `;
      }
      grid.innerHTML = slotsHtml;
    }

    // Peixes elegíveis no balde
    const eligibleFish = this.inventory.filter(f => f.rarity === 'LENDARIO' || f.rarity === 'MITICO');
    if (eligibleCountEl) {
      eligibleCountEl.textContent = eligibleFish.length;
    }

    if (current >= totalNeeded) {
      // 15/15 concluído! Isca do Kraken Ancestral desbloqueada
      if (!this.unlockedBaits.includes('isca_kraken_ancestral')) {
        this.unlockedBaits.push('isca_kraken_ancestral');
        this.selectedBaitId = 'isca_kraken_ancestral';
        this.saveGame();
      }
      if (altarActionSection) altarActionSection.classList.add('hidden');
      if (krakenReadyBox) krakenReadyBox.classList.remove('hidden');
    } else {
      if (altarActionSection) altarActionSection.classList.remove('hidden');
      if (krakenReadyBox) krakenReadyBox.classList.add('hidden');
      if (btnSacrifice) {
        btnSacrifice.disabled = eligibleFish.length === 0;
      }
    }
  }

  sacrificeFish() {
    if (!this.unlockedRods.includes('vara_travessia') || !this.unlockedBaits.includes('essencia_travessia')) {
      this.showToast('Você precisa da Vara da Travessia e da Essência do Vórtice para realizar sacrifícios!', 'warning');
      sound.playClick();
      return;
    }

    if ((this.sacrificedFishCount || 0) >= 15) {
      this.showToast('O Altar já recebeu as 15 almas necessárias!', 'info');
      sound.playClick();
      return;
    }

    // Procura peixe lendário ou mítico não travado
    let idx = this.inventory.findIndex(f => (f.rarity === 'LENDARIO' || f.rarity === 'MITICO') && !f.locked);
    
    if (idx === -1) {
      const hasLocked = this.inventory.some(f => (f.rarity === 'LENDARIO' || f.rarity === 'MITICO') && f.locked);
      if (hasLocked) {
        this.showToast('Todos os seus peixes lendários/míticos estão travados no balde! Destrave um para sacrificar.', 'warning');
      } else {
        this.showToast('Nenhum peixe Lendário ou Mítico disponível no balde.', 'warning');
      }
      sound.playClick();
      return;
    }

    const fish = this.inventory.splice(idx, 1)[0];
    this.sacrificedFishCount = (this.sacrificedFishCount || 0) + 1;
    sound.playSacrifice();

    this.showToast(`✦ Alma de ${fish.name} oferecida ao Altar! (${this.sacrificedFishCount}/15)`, 'special');

    if (this.sacrificedFishCount >= 15) {
      if (!this.unlockedBaits.includes('isca_kraken_ancestral')) {
        this.unlockedBaits.push('isca_kraken_ancestral');
        this.selectedBaitId = 'isca_kraken_ancestral';
      }
      setTimeout(() => {
        sound.playUpgrade();
        this.showToast('★ O RITUAL ESTÁ COMPLETO! A ISCA DO KRAKEN FOI FORJADA! ★', 'legendary');
      }, 500);
    }

    this.saveGame();
    this.renderInventory();
    this.renderAltarSouls();
  }

  sacrificeSpecificFish(uid) {
    if (!this.unlockedRods.includes('vara_travessia') || !this.unlockedBaits.includes('essencia_travessia')) {
      this.showToast('Você precisa da Vara da Travessia e da Essência do Vórtice para realizar sacrifícios!', 'warning');
      sound.playClick();
      return;
    }

    if ((this.sacrificedFishCount || 0) >= 15) {
      this.showToast('O Altar já recebeu as 15 almas necessárias!', 'info');
      sound.playClick();
      return;
    }

    const idx = this.inventory.findIndex(f => f.uid === uid);
    if (idx === -1) return;

    const fish = this.inventory[idx];
    if (fish.locked) {
      this.showToast('Peixe travado! Destrave-o antes de sacrificar.', 'warning');
      sound.playClick();
      return;
    }

    if (fish.rarity !== 'LENDARIO' && fish.rarity !== 'MITICO') {
      this.showToast('O Altar só aceita peixes Lendários ou Míticos!', 'warning');
      sound.playClick();
      return;
    }

    this.inventory.splice(idx, 1);
    this.sacrificedFishCount = (this.sacrificedFishCount || 0) + 1;
    sound.playSacrifice();

    this.showToast(`✦ Alma de ${fish.name} oferecida ao Altar! (${this.sacrificedFishCount}/15)`, 'special');

    if (this.sacrificedFishCount >= 15) {
      if (!this.unlockedBaits.includes('isca_kraken_ancestral')) {
        this.unlockedBaits.push('isca_kraken_ancestral');
        this.selectedBaitId = 'isca_kraken_ancestral';
      }
      setTimeout(() => {
        sound.playUpgrade();
        this.showToast('★ O RITUAL ESTÁ COMPLETO! A ISCA DO KRAKEN FOI FORJADA! ★', 'legendary');
      }, 500);
    }

    this.saveGame();
    this.renderInventory();
    this.renderAltarSouls();
  }

  triggerKrakenCinematic() {
    this.closeChapter1Modal();
    const overlay = document.getElementById('kraken-cinematic-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    overlay.style.pointerEvents = 'auto';
    sound.playCast();

    const lightning = document.getElementById('kraken-lightning-flash');
    const dialogueBox = document.getElementById('kraken-dialogue-box');
    const abyssFade = document.getElementById('kraken-abyss-fade');
    const btnEnterWorld2 = document.getElementById('btn-enter-world2');
    const shakeContainer = document.getElementById('kraken-shake-container');

    // Reset de estados para execução limpa
    if (shakeContainer) {
      shakeContainer.style.opacity = '1';
      shakeContainer.style.pointerEvents = 'auto';
      shakeContainer.classList.remove('animate-bounce');
    }
    if (dialogueBox) dialogueBox.classList.add('opacity-0');
    if (abyssFade) abyssFade.classList.add('opacity-0');
    if (btnEnterWorld2) btnEnterWorld2.classList.add('hidden');

    // 1. Início do evento: Tempestade e relâmpagos
    setTimeout(() => {
      sound.playKrakenRoar();
      if (lightning) {
        lightning.classList.remove('opacity-0');
        setTimeout(() => lightning.classList.add('opacity-0'), 80);
        setTimeout(() => lightning.classList.remove('opacity-0'), 180);
        setTimeout(() => lightning.classList.add('opacity-0'), 260);
      }
    }, 600);

    // 2. O Kraken surge e quebra o píer
    setTimeout(() => {
      sound.playPierCrash();
      if (dialogueBox) {
        dialogueBox.classList.remove('opacity-0');
      }
    }, 2000);

    // 3. Arrastado para o Abismo: Fade out suave do monstro e foco no abismo
    setTimeout(() => {
      if (shakeContainer) {
        shakeContainer.style.opacity = '0';
        shakeContainer.style.pointerEvents = 'none';
      }
      if (abyssFade) {
        abyssFade.classList.remove('opacity-0');
      }
    }, 4600);

    // 4. Botão de entrar no Mundo 2 disponível e totalmente desobstruído
    setTimeout(() => {
      if (btnEnterWorld2) {
        btnEnterWorld2.classList.remove('hidden');
        btnEnterWorld2.onclick = () => {
          sound.playClick();
          overlay.classList.add('hidden');
          overlay.style.pointerEvents = 'none';
          this.enterWorld2Reset();
          this.showToast('🌊 Você abriu os olhos na escuridão do leito abissal... Bem-vindo ao Mundo 2!', 'special');
        };
      }
    }, 5800);
  }

  enterWorld2Reset() {
    // Salva o snapshot definitivo do progresso do Mundo 1 para restauração posterior pelo Batiscafo
    if (!this.world1Data) {
      this.world1Data = {
        gold: this.gold,
        inventory: [...this.inventory],
        aquarium: [...this.aquarium],
        selectedRodId: this.selectedRodId,
        unlockedRods: [...this.unlockedRods],
        selectedBaitId: this.selectedBaitId,
        unlockedBaits: [...this.unlockedBaits],
        upgradeLevels: { ...this.upgradeLevels }
      };
    }

    // Reset de Prestígio do Mundo 2:
    // Começa com 0 ouro, inventário e aquário vazios, novos upgrades em 0
    // Progressão limpa e autêntica no Abismo com novos equipamentos e biomas
    this.currentWorld = 2;
    this.gold = 0;
    this.inventory = [];
    this.aquarium = [];
    this.unlockedRods = ['vara_arpao_basico'];
    this.selectedRodId = 'vara_arpao_basico';
    this.unlockedBaits = ['isca_plankton_neon'];
    this.selectedBaitId = 'isca_plankton_neon';
    this.upgradeLevels = { balde: 0, auto_pescador: 0, boia_sorte: 0, rede_dupla: 0, aquario_cap: 0, auto_vendedor: 0, ima_dourado: 0 };
    this.activeWorld2Biome = 'recife_bioluminescente';
    this.ascensionParts = { bateria_neon: false, casco_titanio: false, helice_galeao: false, sistema_lastro_hadal: false };
    this.submarineAssembled = false;

    this.saveGame();
    this.updateFisherman();
    this.renderAll();
  }

  closeChapter1Modal() {
    sound.playClick();
    const modal = document.getElementById('chapter1-modal');
    modal?.classList.add('hidden');
  }
}
