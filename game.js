import { RARITIES, FISH_LIST, generateFishBuffs } from './fishData.js';
import { RODS, BAITS, UPGRADES } from './itemsData.js';
import { sound } from './sound.js';
import { ACHIEVEMENTS } from './achievementsData.js';
import {
  renderFishermanToCanvas,
  getFishDataURL,
  getFishSilhouetteDataURL,
  PixelWaterRenderer,
  updateRodSVG,
  updateFishingLine,
  PIXEL_ICONS,
  getRodIconDataURL,
  getBaitIconDataURL,
  getUpgradeIconDataURL,
  OUTFIT_PRESETS,
  HAIR_COLORS
} from './pixelArt.js';

class FishingGame {
  constructor() {
    this.gold = 0;
    this.totalCatches = 0;
    this.totalGoldEarned = 0;
    this.inventory = [];
    this.aquarium = [];
    this.selectedRodId = 'vara_bambu';
    this.unlockedRods = ['vara_bambu'];
    this.selectedBaitId = 'minhoca';
    this.unlockedBaits = ['minhoca'];
    this.upgradeLevels = { balde:0, auto_pescador:0, boia_sorte:0, rede_dupla:0, aquario_cap:0, auto_vendedor:0, ima_dourado:0 };

    // Perfil e Customização do Pescador
    this.playerName = 'Pescador';
    this.playerGender = 'male'; // 'male' | 'female'
    this.playerOutfit = 'verde'; // 'verde' | 'azul' | 'rubi' | 'dourado' | 'abissal' | 'coral'
    this.playerHair = 'ruivo'; // 'ruivo' | 'moreno' | 'loiro' | 'preto' | 'rosa'
    this.editingProfile = { name: 'Pescador', gender: 'male', outfit: 'verde', hair: 'ruivo' };

    // Conquistas (Sala de Troféus)
    this.unlockedAchievements = [];
    this.achTab = 'all';
    this.goldenFishCatches = 0;

    // Modo de ordenação do balde e filtro do aquário
    this.invSortMode = 'recentes';
    this.aquariumFilterMode = 'todos';

    // Filtros de Venda (Manual e Automática)
    this.manualSellFilter = ['COMUM', 'INCOMUM'];
    this.autoSellFilter = ['COMUM'];
    this.autoSellTimer = null;
    this.nextAutoSellTime = 0;
    this.nextGoldenFishAutoCatchTime = 0;

    // Álbum de Peixes (Enciclopédia)
    this.discoveredFish = {}; // { [id]: { maxWeight, count } }

    // Ciclo Dia / Pôr do Sol / Noite
    this.timeOfDay = 'night'; // 'day' | 'sunset' | 'night'
    this.lastActiveTime = Date.now();

    // Fim do Capítulo 1 / Portal Dimensional
    this.chapter1Completed = false;
    this.isResetting = false;

    this.isFishing = false;
    this.autoFishTimer = null;
    this.lastAutoFishTime = 0;
    this.activeTab = 'varas';
    this.invTab = 'inventory';
    this.waterRenderer = null;

    // Golden Fish (estilo golden cookie)
    this.goldenFishActive = false;
    this.goldenFishTimer = null;
    this.tempBuffs = []; // { type, multiplier, endsAt, label }
    this.consoleOpen = false;
    this.consoleHistory = [];

    // Cache fish sprites data URLs
    this._fishSpriteCache = {};
    this._fishSilhouetteCache = {};

    this.init();
  }

  init() {
    this.loadGame();
    this.initTimeOfDay();
    this.setupEventListeners();
    this.renderAll();
    this.startAutoFisher();
    this.startAutoSeller();
    this.initPixelArt();
    this.initGoldenFish();
    this.initConsole();
    this.startTempBuffLoop();
    this.checkOfflineProgress();
    this.checkAchievements(false);
    this.updateAchievementsBadge();
    this.checkChapter1Completion(false);
    this.updateChapter1Badge();
    this.initPWA();
    setInterval(() => this.saveGame(), 5000);
    window.addEventListener('beforeunload', () => this.saveGame());
  }

  initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('PWA ServiceWorker registrado com sucesso:', reg.scope);
          })
          .catch((err) => {
            console.warn('Falha ao registrar ServiceWorker:', err);
          });
      });
    }

    let deferredPrompt = null;
    const installBtn = document.getElementById('btn-install-pwa');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) {
        installBtn.classList.remove('hidden');
        installBtn.classList.add('flex');
      }
    });

    installBtn?.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      installBtn.classList.add('hidden');
      installBtn.classList.remove('flex');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this.showToast('Fish Clicker instalado na sua tela inicial!', 'success');
      }
      deferredPrompt = null;
    });

    window.addEventListener('appinstalled', () => {
      if (installBtn) {
        installBtn.classList.add('hidden');
        installBtn.classList.remove('flex');
      }
      this.showToast('Aplicativo instalado com sucesso!', 'success');
    });
  }

  initPixelArt() {
    // Pescador pixel art com vara/isca atuais
    this.updateFisherman();

    // Lago animado pixel art
    const waterCanvas = document.getElementById('water-particles-canvas');
    if (waterCanvas) {
      this.waterRenderer = new PixelWaterRenderer(waterCanvas);
      ['lambari','carpa','truta','robalo'].forEach(f => this.waterRenderer.addSwimmingFish(f));
      const animLoop = () => {
        this.waterRenderer.update();
        requestAnimationFrame(animLoop);
      };
      animLoop();
    }

    window.addEventListener('resize', () => updateFishingLine());
    requestAnimationFrame(() => updateFishingLine());
    setTimeout(() => updateFishingLine(), 150);
  }

  updateFisherman() {
    const fishermanCanvas = document.getElementById('fisherman-canvas');
    if (fishermanCanvas) {
      renderFishermanToCanvas(
        fishermanCanvas,
        4,
        this.selectedRodId,
        this.playerGender,
        this.playerOutfit,
        this.playerHair
      );
    }
    // Atualiza cores da isca no SVG
    updateRodSVG(this.selectedRodId, this.selectedBaitId);
    // Posiciona a linha de pesca milimetricamente conectada na ponta da vara
    updateFishingLine();
    // Atualiza o nome exibido no cabeçalho e na plaquinha do píer
    this.renderPlayerName();
  }

  renderPlayerName() {
    const btnName = document.getElementById('profile-btn-name');
    if (btnName) btnName.textContent = this.playerName || 'Pescador';
    const tag = document.getElementById('fisherman-name-tag');
    if (tag) tag.textContent = this.playerName || 'Pescador';
  }

  // ═══════════════════════════════════════════
  // CICLO DIA / TARDE / NOITE
  // ═══════════════════════════════════════════
  initTimeOfDay() {
    // Se não tiver salvo, define com base na hora local do jogador
    const hour = new Date().getHours();
    if (!this.timeOfDay) {
      if (hour >= 6 && hour < 17) this.timeOfDay = 'day';
      else if (hour >= 17 && hour < 20) this.timeOfDay = 'sunset';
      else this.timeOfDay = 'night';
    }
    this.applyTimeOfDay();
  }

  toggleTimeOfDay() {
    const cycle = { day: 'sunset', sunset: 'night', night: 'day' };
    this.timeOfDay = cycle[this.timeOfDay] || 'day';
    sound.playClick();
    this.applyTimeOfDay();
    const names = { day: 'DIA', sunset: 'PÔR DO SOL', night: 'NOITE' };
    this.showToast(`Horário: ${names[this.timeOfDay]}`, 'info');
  }

  applyTimeOfDay() {
    const btn = document.getElementById('btn-toggle-time');
    const lakeArea = document.getElementById('fishing-lake-area');

    if (btn) {
      btn.innerHTML = PIXEL_ICONS[this.timeOfDay] || PIXEL_ICONS.moon;
    }

    if (this.waterRenderer) {
      this.waterRenderer.setTimeOfDay(this.timeOfDay);
    }

    if (lakeArea) {
      lakeArea.classList.remove('from-[#0a1628]', 'via-[#0c2040]', 'to-[#0e3a5f]',
                               'from-[#38bdf8]', 'via-[#0284c7]', 'to-[#0369a1]',
                               'from-[#ea580c]', 'via-[#9333ea]', 'to-[#1e1b4b]');
      if (this.timeOfDay === 'day') {
        lakeArea.style.background = 'linear-gradient(to bottom, #7dd3fc, #38bdf8 35%, #0284c7 65%, #0369a1)';
      } else if (this.timeOfDay === 'sunset') {
        lakeArea.style.background = 'linear-gradient(to bottom, #fdba74, #f97316 30%, #7e22ce 65%, #1e1b4b)';
      } else {
        lakeArea.style.background = 'linear-gradient(to bottom, #0a1628, #0c2040 40%, #0e3a5f)';
      }
    }
  }

  // ═══════════════════════════════════════════
  // PROGRESSO OFFLINE (AFK REWARD)
  // ═══════════════════════════════════════════
  checkOfflineProgress() {
    const autoLevel = this.upgradeLevels.auto_pescador || 0;
    if (autoLevel <= 0) return; // Precisa do ajudante automático

    const now = Date.now();
    const diffMs = now - (this.lastActiveTime || now);
    const diffSec = Math.floor(diffMs / 1000);

    // Só dá recompensa se esteve fora mais de 90 segundos
    if (diffSec < 90) return;

    const u = UPGRADES.find(u => u.id === 'auto_pescador');
    const intervalSec = u ? u.getValue(autoLevel) : 8;
    const maxOfflineSec = 8 * 3600; // Máximo de 8 horas AFK
    const effectiveSec = Math.min(diffSec, maxOfflineSec);

    const totalCatchesSim = Math.floor(effectiveSec / intervalSec);
    if (totalCatchesSim <= 0) return;

    // Calcular ganho médio de ouro dos peixes pescados
    const buffs = this.getActiveBuffs();
    let earnedGold = 0;
    for (let i = 0; i < totalCatchesSim; i++) {
      const f = this.rollFish(buffs);
      this.recordDiscovery(f);
      earnedGold += Math.round(f.baseValue * (1 + buffs.goldMultiplier));
    }

    // Formatar tempo ausente
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    let timeStr = '';
    if (hours > 0) timeStr += `${hours}h `;
    timeStr += `${minutes}m`;

    // Atualizar e exibir modal
    const modal = document.getElementById('offline-modal');
    const timeEl = document.getElementById('offline-time-text');
    const catchesEl = document.getElementById('offline-catches-text');
    const goldEl = document.getElementById('offline-gold-text');
    const collectBtn = document.getElementById('btn-collect-offline');

    if (modal && timeEl && catchesEl && goldEl && collectBtn) {
      timeEl.textContent = `Você esteve fora por ${timeStr}!`;
      catchesEl.textContent = totalCatchesSim.toLocaleString('pt-BR');
      goldEl.textContent = `+${earnedGold.toLocaleString('pt-BR')}G`;

      collectBtn.onclick = () => {
        this.gold += earnedGold;
        this.totalGoldEarned += earnedGold;
        this.totalCatches += totalCatchesSim;
        sound.playCoin();
        sound.vibrate([40, 40, 80]);
        modal.classList.add('hidden');
        this.renderAll();
        this.showToast(`+${earnedGold.toLocaleString('pt-BR')}G coletados!`, 'success');
      };

      modal.classList.remove('hidden');
    }
  }

  // ═══════════════════════════════════════════
  // PERFIL DO PESCADOR E CUSTOMIZAÇÃO
  // ═══════════════════════════════════════════
  openProfile() {
    sound.playClick();
    this.editingProfile = {
      name: this.playerName,
      gender: this.playerGender,
      outfit: this.playerOutfit,
      hair: this.playerHair
    };

    const nameInput = document.getElementById('profile-name-input');
    if (nameInput) nameInput.value = this.editingProfile.name;

    this.renderProfileCustomizationOptions();
    this.updateProfilePreview();

    const modal = document.getElementById('profile-modal');
    modal?.classList.remove('hidden');
  }

  closeProfile() {
    sound.playClick();
    const modal = document.getElementById('profile-modal');
    modal?.classList.add('hidden');
  }

  renderProfileCustomizationOptions() {
    // 1. Gênero
    document.querySelectorAll('.profile-gender-btn').forEach(btn => {
      const g = btn.dataset.gender;
      const isSelected = g === this.editingProfile.gender;
      btn.className = `profile-gender-btn py-1.5 px-2 text-[8px] font-bold border-2 flex items-center justify-center gap-1.5 transition-all ${
        isSelected
          ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200'
          : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
      }`;
      btn.style.fontFamily = 'var(--font-pixel)';
      btn.onclick = () => {
        this.editingProfile.gender = g;
        sound.playClick();
        this.renderProfileCustomizationOptions();
        this.updateProfilePreview();
      };
    });

    // 2. Roupas (Presets)
    const outfitsGrid = document.getElementById('profile-outfits-grid');
    if (outfitsGrid) {
      outfitsGrid.innerHTML = Object.values(OUTFIT_PRESETS).map(outfit => {
        const isSelected = outfit.id === this.editingProfile.outfit;
        return `
          <button type="button" data-outfit="${outfit.id}" class="profile-outfit-opt-btn p-1.5 text-left border-2 text-[8px] flex items-center gap-1.5 transition-all ${
            isSelected
              ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
              : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-600'
          }" style="font-family:var(--font-pixel);">
            <span class="w-3.5 h-3.5 shrink-0 border border-black/40 inline-flex flex-col" style="background:${outfit.vest};">
              <span class="w-full h-1.5" style="background:${outfit.pants};"></span>
            </span>
            <span class="break-words leading-tight">${outfit.name}</span>
          </button>`;
      }).join('');

      outfitsGrid.querySelectorAll('.profile-outfit-opt-btn').forEach(btn => {
        btn.onclick = (e) => {
          this.editingProfile.outfit = e.currentTarget.dataset.outfit;
          sound.playClick();
          this.renderProfileCustomizationOptions();
          this.updateProfilePreview();
        };
      });
    }

    // 3. Cores de Cabelo
    const hairGrid = document.getElementById('profile-hair-grid');
    if (hairGrid) {
      hairGrid.innerHTML = Object.values(HAIR_COLORS).map(hair => {
        const isSelected = hair.id === this.editingProfile.hair;
        return `
          <button type="button" data-hair="${hair.id}" class="profile-hair-opt-btn px-2 py-1 border-2 text-[8px] flex items-center gap-1.5 transition-all ${
            isSelected
              ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
              : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600'
          }" style="font-family:var(--font-pixel);">
            <span class="w-2.5 h-2.5 rounded-none shrink-0 border border-black/50 inline-block" style="background:${hair.color};"></span>
            <span>${hair.name}</span>
          </button>`;
      }).join('');

      hairGrid.querySelectorAll('.profile-hair-opt-btn').forEach(btn => {
        btn.onclick = (e) => {
          this.editingProfile.hair = e.currentTarget.dataset.hair;
          sound.playClick();
          this.renderProfileCustomizationOptions();
          this.updateProfilePreview();
        };
      });
    }
  }

  updateProfilePreview() {
    const canvas = document.getElementById('profile-preview-canvas');
    if (canvas) {
      renderFishermanToCanvas(
        canvas,
        4,
        this.selectedRodId,
        this.editingProfile.gender,
        this.editingProfile.outfit,
        this.editingProfile.hair
      );
    }
    const nameEl = document.getElementById('profile-preview-name');
    if (nameEl) nameEl.textContent = this.editingProfile.name || 'Pescador';

    const statsEl = document.getElementById('profile-preview-stats');
    if (statsEl) {
      statsEl.innerHTML = `${this.totalCatches.toLocaleString('pt-BR')} pescados · ${this.gold.toLocaleString('pt-BR')}G`;
    }
  }

  saveProfile() {
    const nameInput = document.getElementById('profile-name-input');
    let newName = (nameInput ? nameInput.value : '').trim();
    if (!newName) newName = 'Pescador';

    this.playerName = newName;
    this.playerGender = this.editingProfile.gender;
    this.playerOutfit = this.editingProfile.outfit;
    this.playerHair = this.editingProfile.hair;

    this.updateFisherman();
    this.saveGame();
    sound.playUpgrade();
    this.showToast('Perfil atualizado com sucesso!', 'success');
    this.closeProfile();
  }

  // ═══════════════════════════════════════════
  // SISTEMA DE CONQUISTAS (SALA DE TROFÉUS)
  // ═══════════════════════════════════════════
  checkAchievements(notify = true) {
    let newlyUnlocked = false;

    ACHIEVEMENTS.forEach(ach => {
      if (!this.unlockedAchievements.includes(ach.id)) {
        if (ach.check(this)) {
          this.unlockedAchievements.push(ach.id);
          newlyUnlocked = true;
          if (notify) {
            sound.playUpgrade();
            this.showAchievementToast(ach);
          }
        }
      }
    });

    if (newlyUnlocked) {
      this.updateAchievementsBadge();
      if (document.getElementById('achievements-modal') && !document.getElementById('achievements-modal').classList.contains('hidden')) {
        this.renderAchievements();
      }
    }
  }

  showAchievementToast(ach) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 p-3 bg-slate-900 border-2 border-amber-400 text-amber-300 flex items-center gap-3 transition-all duration-300 transform translate-y-[-20px] opacity-0';
    toast.style.fontFamily = 'var(--font-pixel)';
    toast.style.boxShadow = '4px 4px 0 #000';
    toast.style.maxWidth = '320px';

    toast.innerHTML = `
      <div class="w-9 h-9 bg-amber-950/60 border border-amber-500 flex items-center justify-center shrink-0">
        ${PIXEL_ICONS.trophy}
      </div>
      <div class="min-w-0">
        <div class="text-[8px] text-amber-400 uppercase tracking-widest font-bold">CONQUISTA DESBLOQUEADA!</div>
        <div class="text-[9px] sm:text-[10px] font-bold text-white leading-snug break-words mt-0.5">${ach.title}</div>
        <div class="text-[8px] text-slate-300 leading-tight break-words mt-0.5">${ach.desc}</div>
      </div>
    `;

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  updateAchievementsBadge() {
    const badge = document.getElementById('achievements-badge');
    const unlocked = this.unlockedAchievements.length;
    const total = ACHIEVEMENTS.length;
    if (badge) badge.textContent = `${unlocked}/${total}`;

    const progText = document.getElementById('achievements-progress-text');
    if (progText) progText.textContent = `${unlocked} / ${total}`;

    const progBar = document.getElementById('achievements-progress-bar');
    if (progBar) {
      const pct = Math.round((unlocked / total) * 100);
      progBar.style.width = `${pct}%`;
    }
  }

  openAchievements() {
    sound.playClick();
    this.checkAchievements(false);
    this.updateAchievementsBadge();
    this.renderAchievements();
    const modal = document.getElementById('achievements-modal');
    modal?.classList.remove('hidden');
  }

  closeAchievements() {
    sound.playClick();
    const modal = document.getElementById('achievements-modal');
    modal?.classList.add('hidden');
  }

  renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;

    const filter = this.achTab || 'all';
    const list = ACHIEVEMENTS.filter(a => filter === 'all' || a.category === filter);

    grid.innerHTML = list.map(ach => {
      const isUnlocked = this.unlockedAchievements.includes(ach.id);
      let iconHTML = isUnlocked ? PIXEL_ICONS.trophy : PIXEL_ICONS.lockedTrophy;

      if (ach.icon === 'rod' && isUnlocked) iconHTML = PIXEL_ICONS.rod;
      else if (ach.icon === 'bait' && isUnlocked) iconHTML = PIXEL_ICONS.bait;
      else if (ach.icon === 'tools' && isUnlocked) iconHTML = PIXEL_ICONS.tools;
      else if (ach.icon === 'fish' && isUnlocked) iconHTML = PIXEL_ICONS.fish;
      else if (ach.icon === 'sparkle' && isUnlocked) iconHTML = PIXEL_ICONS.sparkle;
      else if (ach.icon === 'aquarium' && isUnlocked) iconHTML = PIXEL_ICONS.aquarium;
      else if (ach.icon === 'portal' && isUnlocked) iconHTML = PIXEL_ICONS.portal;

      return `
        <div class="p-2.5 border-2 flex items-start gap-2.5 transition-all ${
          isUnlocked
            ? 'border-amber-500 bg-amber-950/25'
            : 'border-slate-800 bg-slate-950/80 opacity-60'
        }" style="box-shadow:2px 2px 0 #000;">
          <div class="w-9 h-9 border flex items-center justify-center p-1 shrink-0 ${
            isUnlocked ? 'border-amber-500 bg-amber-950/50' : 'border-slate-800 bg-slate-900'
          }">
            ${iconHTML}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-1.5">
              <h4 class="text-[9px] sm:text-[10px] font-bold ${isUnlocked ? 'text-amber-300' : 'text-slate-400'} leading-snug break-words" style="font-family:var(--font-pixel);">${ach.title}</h4>
              <span class="text-[7px] font-bold px-1 py-0.5 border shrink-0 whitespace-nowrap ${
                isUnlocked
                  ? 'border-emerald-600 bg-emerald-950 text-emerald-300'
                  : 'border-slate-800 bg-slate-900 text-slate-500'
              }" style="font-family:var(--font-pixel);">${isUnlocked ? 'CONQUISTADA' : 'BLOQUEADA'}</span>
            </div>
            <p class="text-[8px] ${isUnlocked ? 'text-slate-300' : 'text-slate-500'} mt-1 leading-relaxed break-words" style="font-family:var(--font-pixel);">${ach.desc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // ═══════════════════════════════════════════
  // CAPÍTULO 1: O DESPERTAR DO PORTAL
  // ═══════════════════════════════════════════
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
    const badge = document.getElementById('chapter1-badge');
    const btn = document.getElementById('btn-open-chapter1');
    if (!badge || !btn) return;

    if (this.chapter1Completed) {
      badge.textContent = 'PORTAL ATIVO';
      badge.className = 'text-[8px] font-bold text-cyan-300 animate-pulse';
      btn.className = 'h-9 px-2.5 bg-cyan-950/90 border-2 border-cyan-400 flex items-center gap-1.5 text-xs pixel-btn shadow-[0_0_12px_rgba(6,182,212,0.6)] hover:border-cyan-300';
    } else {
      const hasRod = this.unlockedRods.includes('vara_travessia');
      const hasBait = this.unlockedBaits.includes('essencia_travessia');
      const progress = (hasRod ? 1 : 0) + (hasBait ? 1 : 0);
      badge.textContent = `CAP. 1 (${progress}/2)`;
      badge.className = 'text-[8px] font-bold text-cyan-400';
      btn.className = 'h-9 px-2.5 bg-slate-900 border-2 border-slate-700 flex items-center gap-1.5 text-xs pixel-btn hover:border-cyan-400';
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

    // Portal Status
    const portalTitle = document.getElementById('chapter1-status-title');
    const portalDesc = document.getElementById('chapter1-status-desc');
    const completeBanner = document.getElementById('chapter1-complete-banner');

    if (hasRod && hasBait) {
      if (portalTitle) {
        portalTitle.textContent = '★ PORTAL DIMENSIONAL TOTALMENTE DESPERTO! ★';
        portalTitle.className = 'text-sm font-bold text-cyan-300 mt-2 tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]';
      }
      if (portalDesc) {
        portalDesc.textContent = 'A fenda espacial brilha intensamente sobre as águas de Neo-Píer. Você selou com perfeição todo o Capítulo 1 da sua jornada!';
      }
      completeBanner?.classList.remove('hidden');
    } else {
      if (portalTitle) {
        portalTitle.textContent = 'PORTAL DIMENSIONAL EM CARGA';
        portalTitle.className = 'text-sm font-bold text-cyan-400/80 mt-2';
      }
      if (portalDesc) {
        portalDesc.textContent = 'Para estabilizar o vórtice e selar o Capítulo 1, você precisará da lendária Vara da Travessia Astral e da Essência do Vórtice Dimensional.';
      }
      completeBanner?.classList.add('hidden');
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

  closeChapter1Modal() {
    sound.playClick();
    const modal = document.getElementById('chapter1-modal');
    modal?.classList.add('hidden');
  }

  // ═══════════════════════════════════════════
  // ÁLBUM DE PEIXES (ENCICLOPÉDIA)
  // ═══════════════════════════════════════════
  openAlbum() {
    sound.playClick();
    this.renderAlbum();
    const modal = document.getElementById('album-modal');
    modal?.classList.remove('hidden');
  }

  closeAlbum() {
    sound.playClick();
    const modal = document.getElementById('album-modal');
    modal?.classList.add('hidden');
  }

  updateAlbumBadge() {
    const discoveredCount = Object.keys(this.discoveredFish).length;
    const total = FISH_LIST.length;
    const badge = document.getElementById('album-badge');
    const progText = document.getElementById('album-progress-text');
    const progBar = document.getElementById('album-progress-bar');

    const str = `${discoveredCount}/${total}`;
    if (badge) badge.textContent = str;
    if (progText) progText.textContent = `${str} (${Math.round((discoveredCount/total)*100)}%)`;
    if (progBar) progBar.style.width = `${(discoveredCount/total)*100}%`;
  }

  renderAlbum() {
    const grid = document.getElementById('album-grid');
    if (!grid) return;

    this.updateAlbumBadge();

    grid.innerHTML = FISH_LIST.map(fish => {
      const isDiscovered = !!this.discoveredFish[fish.id];
      const data = this.discoveredFish[fish.id];
      const r = RARITIES[fish.rarity] || RARITIES.COMUM;
      const spriteURL = isDiscovered ? this.getFishSpriteURL(fish.icon) : this.getFishSilhouetteURL(fish.icon);

      return `
        <div class="p-2.5 border-2 ${isDiscovered ? 'bg-slate-900/90' : 'bg-slate-950/70 border-slate-800 opacity-60'} flex items-center gap-2.5 pixel-border-thin" style="${isDiscovered ? `border-color:${r.border}; background:${r.bg};` : ''}">
          <div class="w-12 h-9 shrink-0 flex items-center justify-center bg-slate-950/50 border border-slate-800 p-1">
            <img src="${spriteURL}" class="w-10 h-7 object-contain ${isDiscovered ? '' : 'brightness-0 contrast-200'}" alt="${fish.name}" style="image-rendering:pixelated;">
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[9px] font-bold ${isDiscovered ? 'text-slate-100' : 'text-slate-500'}" style="font-family:var(--font-pixel);">${isDiscovered ? fish.name : '???'}</span>
              <span class="text-[7px] font-bold px-1 py-0.5 border" style="font-family:var(--font-pixel);color:${isDiscovered ? r.color : '#64748b'};border-color:${isDiscovered ? r.border : '#334155'};background:rgba(0,0,0,0.5);">${r.label}</span>
            </div>
            ${isDiscovered ? `
              <div class="flex items-center gap-2 text-[8px] text-slate-300 mt-1" style="font-family:var(--font-pixel);">
                <span class="inline-flex items-center gap-1"><span class="text-amber-400">★</span> Recorde: <strong class="text-amber-300">${data.maxWeight}kg</strong></span>
                <span class="inline-flex items-center gap-1"><span class="text-cyan-400">#</span> Pescados: <strong>${data.count}</strong></span>
              </div>
              ${fish.buff ? `<div class="text-[7px] text-purple-300 mt-0.5" style="font-family:var(--font-pixel);">★ ${fish.buff.text}</div>` : ''}
            ` : `
              <p class="text-[8px] text-slate-600 mt-1 italic" style="font-family:var(--font-pixel);">Ainda não descoberto</p>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  getFishSpriteURL(iconId) {
    if (!this._fishSpriteCache[iconId]) {
      this._fishSpriteCache[iconId] = getFishDataURL(iconId, 3);
    }
    return this._fishSpriteCache[iconId];
  }

  getFishSilhouetteURL(iconId) {
    if (!this._fishSilhouetteCache[iconId]) {
      this._fishSilhouetteCache[iconId] = getFishSilhouetteDataURL(iconId, 3);
    }
    return this._fishSilhouetteCache[iconId];
  }

  // ── PERSISTÊNCIA ──
  saveGame() {
    if (this.isResetting) return;
    try {
      localStorage.setItem('pescaria_clicker_save_v4', JSON.stringify({
        gold: this.gold,
        totalCatches: this.totalCatches,
        totalGoldEarned: this.totalGoldEarned,
        inventory: this.inventory,
        aquarium: this.aquarium,
        selectedRodId: this.selectedRodId,
        unlockedRods: this.unlockedRods,
        selectedBaitId: this.selectedBaitId,
        unlockedBaits: this.unlockedBaits,
        upgradeLevels: this.upgradeLevels,
        discoveredFish: this.discoveredFish,
        manualSellFilter: this.manualSellFilter,
        autoSellFilter: this.autoSellFilter,
        aquariumFilterMode: this.aquariumFilterMode,
        playerName: this.playerName,
        playerGender: this.playerGender,
        playerOutfit: this.playerOutfit,
        playerHair: this.playerHair,
        unlockedAchievements: this.unlockedAchievements,
        goldenFishCatches: this.goldenFishCatches,
        chapter1Completed: this.chapter1Completed,
        timeOfDay: this.timeOfDay,
        lastActiveTime: Date.now()
      }));
    } catch(e) { console.warn('Erro ao salvar:', e); }
  }

  loadGame() {
    try {
      const raw = localStorage.getItem('pescaria_clicker_save_v4') || localStorage.getItem('pescaria_clicker_save_v3');
      const d = JSON.parse(raw);
      if (d) {
        this.gold = d.gold || 0;
        this.totalCatches = d.totalCatches || 0;
        this.totalGoldEarned = d.totalGoldEarned || 0;
        this.inventory = Array.isArray(d.inventory) ? d.inventory : [];
        this.aquarium = Array.isArray(d.aquarium) ? d.aquarium : [];
        this.selectedRodId = d.selectedRodId || 'vara_bambu';
        this.unlockedRods = d.unlockedRods || ['vara_bambu'];
        this.selectedBaitId = d.selectedBaitId || 'minhoca';
        this.unlockedBaits = d.unlockedBaits || ['minhoca'];
        this.upgradeLevels = { ...this.upgradeLevels, ...(d.upgradeLevels || {}) };
        this.discoveredFish = d.discoveredFish || {};
        this.manualSellFilter = Array.isArray(d.manualSellFilter) ? d.manualSellFilter : ['COMUM', 'INCOMUM'];
        this.autoSellFilter = Array.isArray(d.autoSellFilter) ? d.autoSellFilter : ['COMUM'];
        this.aquariumFilterMode = d.aquariumFilterMode || 'todos';
        this.playerName = d.playerName || 'Pescador';
        this.playerGender = d.playerGender || 'male';
        this.playerOutfit = d.playerOutfit || 'verde';
        this.playerHair = d.playerHair || 'ruivo';
        this.unlockedAchievements = Array.isArray(d.unlockedAchievements) ? d.unlockedAchievements : [];
        this.goldenFishCatches = d.goldenFishCatches || 0;
        this.chapter1Completed = Boolean(d.chapter1Completed);
        this.timeOfDay = d.timeOfDay || 'night';
        this.lastActiveTime = d.lastActiveTime || Date.now();
      }
    } catch(e) { console.error('Erro ao carregar:', e); }
  }

  resetProgress() {
    if (confirm('RESETAR TODO O PROGRESSO? Esta ação não pode ser desfeita!')) {
      this.isResetting = true;
      localStorage.removeItem('pescaria_clicker_save_v4');
      localStorage.removeItem('pescaria_clicker_save_v3');
      localStorage.removeItem('pescaria_clicker_save_v2');
      localStorage.removeItem('pescaria_clicker_save_v1');
      try { localStorage.clear(); } catch(e) {}
      location.reload();
    }
  }

  // ── CÁLCULOS ──
  getMaxInventory() {
    const u = UPGRADES.find(u => u.id === 'balde');
    return u ? u.getValue(this.upgradeLevels.balde || 0) : 10;
  }

  getMaxAquarium() {
    const u = UPGRADES.find(u => u.id === 'aquario_cap');
    return u ? u.getValue(this.upgradeLevels.aquario_cap || 0) : 3;
  }

  getFishBuffs(fish) {
    if (!fish) return [];
    if (Array.isArray(fish.buffs) && fish.buffs.length > 0) return fish.buffs;
    if (fish.buff) return [fish.buff];
    return [];
  }

  _applyFishBuff(b, mult, out) {
    if (!b) return;
    if (b.type === 'gold_multiplier')     out.goldMultiplier += b.value * mult;
    if (b.type === 'luck_bonus')          out.luckBonus += b.value * mult;
    if (b.type === 'fishing_speed')       out.fishingSpeedBonus += b.value * mult;
    if (b.type === 'double_catch_chance') out.doubleCatchChance += b.value * mult;
    if (b.type === 'auto_fish_speed')     out.autoFishSpeedBonus += b.value * mult;
    if (b.type === 'all_stats') {
      out.goldMultiplier += b.value * mult;
      out.luckBonus += b.value * mult;
      out.fishingSpeedBonus += b.value * mult;
      out.doubleCatchChance += b.value * mult;
    }
    if (b.type === 'mythic_mastery') {
      const base = b.value || 0.25;
      out.goldMultiplier += base * mult;
      out.luckBonus += (base * 0.6) * mult;
      out.doubleCatchChance += (base * 0.4) * mult;
    }
  }

  getActiveBuffs() {
    const out = { goldMultiplier:0, luckBonus:0, fishingSpeedBonus:0, doubleCatchChance:0, autoFishSpeedBonus:0 };

    // Buffs do inventário (1x)
    this.inventory.forEach(fish => {
      this.getFishBuffs(fish).forEach(b => this._applyFishBuff(b, 1.0, out));
    });

    // Buffs do aquário (1.5x!)
    this.aquarium.forEach(fish => {
      this.getFishBuffs(fish).forEach(b => this._applyFishBuff(b, 1.5, out));
    });

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

    // Buffs temporários (golden fish)
    const now = Date.now();
    this.tempBuffs.filter(b => b.endsAt > now).forEach(b => {
      if (b.type === 'gold_frenzy')   out.goldMultiplier += b.multiplier;
      if (b.type === 'luck_surge')    out.luckBonus += b.multiplier;
      if (b.type === 'speed_burst')   out.fishingSpeedBonus += b.multiplier;
      if (b.type === 'double_mania')  out.doubleCatchChance += b.multiplier;
    });

    return {
      goldMultiplier: Math.min(out.goldMultiplier, 3.0),
      luckBonus: Math.min(out.luckBonus, 2.5),
      fishingSpeedBonus: Math.min(out.fishingSpeedBonus, 0.60),
      doubleCatchChance: Math.min(out.doubleCatchChance, 0.60),
      autoFishSpeedBonus: Math.min(out.autoFishSpeedBonus, 0.50)
    };
  }

  // ── MECÂNICA DE PESCA ──
  fish(isAuto = false) {
    if (this.isFishing && !isAuto) return;

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

    const buffs = this.getActiveBuffs();
    const caught = [];
    caught.push(this.rollFish(buffs));

    if (Math.random() < buffs.doubleCatchChance && this.inventory.length + caught.length < maxInv) {
      caught.push(this.rollFish(buffs));
      this.showFloatingText('DUPLA!', '#38bdf8', 100);
    }

    caught.forEach((fish, idx) => {
      setTimeout(() => {
        this.inventory.unshift(fish);
        this.totalCatches++;
        sound.playCatch(fish.rarity);
        sound.vibrateCatch(fish.rarity);
        this.showCatchNotification(fish);
        this.recordDiscovery(fish);
        if (this.waterRenderer) this.waterRenderer.addSwimmingFish(fish.icon);
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
      this.discoveredFish[fish.id] = { maxWeight: fish.weight, count: 1 };
      // Recompensa em ouro pela primeira descoberta de espécie
      const bonusMap = { COMUM: 50, INCOMUM: 120, RARO: 300, EPICO: 800, LENDARIO: 2500, MITICO: 10000 };
      const bonus = bonusMap[fish.rarity] || 50;
      this.gold += bonus;
      this.totalGoldEarned += bonus;
      this.showFloatingText(`+${bonus}G NOVO!`, '#38bdf8', -50);
      this.showToast(`✨ NOVA ESPÉCIE: ${fish.name}! (+${bonus}G)`, 'success');
      this.updateAlbumBadge();
    } else {
      this.discoveredFish[fish.id].count = (this.discoveredFish[fish.id].count || 0) + 1;
      if (isNewRecord) {
        this.discoveredFish[fish.id].maxWeight = fish.weight;
      }
    }
    this.checkAchievements();
  }

  rollFish(buffs) {
    const luck = 1 + buffs.luckBonus;
    // Sorte aplica-se mais fraco em raridades altas para dificultar
    const chances = {
      MITICO:   RARITIES.MITICO.chance   * (1 + (luck - 1) * 0.4),
      LENDARIO: RARITIES.LENDARIO.chance  * (1 + (luck - 1) * 0.5),
      EPICO:    RARITIES.EPICO.chance     * (1 + (luck - 1) * 0.6),
      RARO:     RARITIES.RARO.chance      * (1 + (luck - 1) * 0.7),
      INCOMUM:  RARITIES.INCOMUM.chance   * (1 + (luck - 1) * 0.3),
      COMUM:    RARITIES.COMUM.chance
    };

    const totalWeight = Object.values(chances).reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let selectedRarity = 'COMUM';
    for (const [key, weight] of Object.entries(chances)) {
      if (rand <= weight) { selectedRarity = key; break; }
      rand -= weight;
    }

    const pool = FISH_LIST.filter(f => f.rarity === selectedRarity);
    const template = pool[Math.floor(Math.random() * pool.length)] || FISH_LIST[0];

    const weight = +(template.minWeight + Math.random() * (template.maxWeight - template.minWeight)).toFixed(2);
    const weightFactor = weight / template.minWeight;
    const rawValue = Math.round(template.baseValue * Math.pow(weightFactor, 0.7));

    const generatedBuffs = generateFishBuffs(template.id, template.rarity);

    return {
      uid: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      id: template.id,
      name: template.name,
      rarity: template.rarity,
      icon: template.icon,
      weight,
      baseValue: rawValue,
      desc: template.desc,
      buffs: generatedBuffs,
      buff: generatedBuffs[0] || null,
      isDoubleBuff: generatedBuffs.length >= 2,
      locked: false
    };
  }

  // ── OURO & VENDAS ──
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

  sellAll() {
    this.sellManual();
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

  // ── LOJA ──
  buyRod(rodId) {
    const rod = RODS.find(r => r.id === rodId);
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
    const bait = BAITS.find(b => b.id === baitId);
    if (!bait || this.unlockedBaits.includes(baitId)) return;
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
    const u = UPGRADES.find(u => u.id === upgradeId);
    if (!u) return;
    const lvl = this.upgradeLevels[upgradeId] || 0;
    if (lvl >= u.maxLevel) { this.showToast('NÍVEL MÁXIMO!', 'info'); return; }
    const price = Math.round(u.basePrice * Math.pow(u.priceMultiplier, lvl));
    if (this.gold < price) { this.showToast('OURO INSUFICIENTE!', 'error'); return; }
    this.gold -= price;
    this.upgradeLevels[upgradeId] = lvl + 1;

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

  // ── AUTO FISH ──
  startAutoFisher() {
    if (this.autoFishTimer) clearInterval(this.autoFishTimer);
    this.autoFishTimer = setInterval(() => {
      const lvl = this.upgradeLevels.auto_pescador || 0;
      if (lvl <= 0) return;
      const u = UPGRADES.find(u => u.id === 'auto_pescador');
      const buffs = this.getActiveBuffs();
      const baseMs = u.getValue(lvl) * 1000;
      const finalMs = baseMs * (1 - buffs.autoFishSpeedBonus);
      const now = Date.now();
      if (now - this.lastAutoFishTime >= finalMs) {
        this.lastAutoFishTime = now;
        if (this.inventory.length < this.getMaxInventory()) this.fish(true);
      }
    }, 250);
  }

  // ── VENDA AUTOMÁTICA (PEIXARIA) ──
  startAutoSeller() {
    if (this.autoSellTimer) clearInterval(this.autoSellTimer);
    this.autoSellTimer = setInterval(() => {
      const lvl = this.upgradeLevels.auto_vendedor || 0;
      const bar = document.getElementById('auto-sell-bar');
      const countdownEl = document.getElementById('auto-sell-countdown');

      if (lvl <= 0) {
        if (bar && !bar.classList.contains('hidden')) bar.classList.add('hidden');
        return;
      }

      if (bar && bar.classList.contains('hidden')) {
        bar.classList.remove('hidden');
      }

      const u = UPGRADES.find(up => up.id === 'auto_vendedor');
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
          }
        }
      }
    }, 250);
  }

  // ── AQUÁRIO ──
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
    this.showToast(fish.name + ' no aquário! Buff 1.5x!', 'success');
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
    this.showToast(fish.name + ' voltou ao balde.', 'info');
    this.renderAll();
  }

  // ── RENDER ──
  renderAll() {
    this.renderHeader();
    this.renderUpgrades();
    this.renderInventory();
    this.renderAquarium();
    this.renderBuffs();
    this.renderStats();
    this.updateAlbumBadge();
  }

  renderHeader() {
    const el = document.getElementById('player-gold');
    if (el) el.textContent = this.gold.toLocaleString('pt-BR');
    const inv = document.getElementById('inv-counter-badge');
    if (inv) {
      if (this.invTab === 'aquarium') {
        const max = this.getMaxAquarium();
        inv.textContent = this.aquarium.length + '/' + max;
        inv.className = 'px-2 py-1 border-2 text-[10px] font-bold shrink-0 ' +
          (this.aquarium.length >= max
            ? 'bg-purple-800 border-purple-500 text-purple-200 animate-pulse'
            : 'bg-slate-800 border-slate-700 text-purple-400');
      } else {
        const max = this.getMaxInventory();
        inv.textContent = this.inventory.length + '/' + max;
        inv.className = 'px-2 py-1 border-2 text-[10px] font-bold shrink-0 ' +
          (this.inventory.length >= max
            ? 'bg-red-800 border-red-500 text-red-200 animate-pulse'
            : 'bg-slate-800 border-slate-700 text-cyan-400');
      }
      inv.style.fontFamily = 'var(--font-pixel)';
    }
  }

  renderBuffs() {
    const c = document.getElementById('active-buffs-list');
    if (!c) return;
    const b = this.getActiveBuffs();
    const pills = [];
    if (b.goldMultiplier > 0)     pills.push(`<span class="buff-pill px-2 py-0.5 border border-amber-700 text-amber-300 text-[10px]" style="font-family:var(--font-pixel);">+${Math.round(b.goldMultiplier*100)}% OURO</span>`);
    if (b.luckBonus > 0)          pills.push(`<span class="buff-pill px-2 py-0.5 border border-purple-700 text-purple-300 text-[10px]" style="font-family:var(--font-pixel);">+${Math.round(b.luckBonus*100)}% SORTE</span>`);
    if (b.fishingSpeedBonus > 0)  pills.push(`<span class="buff-pill px-2 py-0.5 border border-cyan-700 text-cyan-300 text-[10px]" style="font-family:var(--font-pixel);">+${Math.round(b.fishingSpeedBonus*100)}% VEL</span>`);
    if (b.doubleCatchChance > 0)  pills.push(`<span class="buff-pill px-2 py-0.5 border border-emerald-700 text-emerald-300 text-[10px]" style="font-family:var(--font-pixel);">+${Math.round(b.doubleCatchChance*100)}% DUPLA</span>`);
    c.innerHTML = pills.length
      ? pills.join('')
      : '<span class="text-[10px] text-slate-600 italic" style="font-family:var(--font-pixel);">Nenhum buff ativo</span>';
  }

  renderUpgrades() {
    const list = document.getElementById('upgrades-content-list');
    if (!list) return;
    let html = '';

    if (this.activeTab === 'varas') {
      html = RODS.map(rod => {
        const owned = this.unlockedRods.includes(rod.id);
        const equipped = this.selectedRodId === rod.id;
        const afford = this.gold >= rod.price;
        const iconURL = getRodIconDataURL(rod.id, 2);
        return `
          <div class="p-2.5 border-2 ${equipped ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 bg-slate-900/80'} pixel-border-thin">
            <div class="flex items-start gap-2">
              <div class="w-9 h-9 bg-slate-950 border border-slate-700 flex items-center justify-center p-1 shrink-0">
                <img src="${iconURL}" class="w-7 h-7 object-contain" alt="${rod.name}" style="image-rendering:pixelated;">
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-1.5">
                  <h4 class="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-200 leading-snug break-words" style="font-family:var(--font-pixel);">${rod.name}</h4>
                  ${equipped ? '<span class="text-[7px] sm:text-[8px] text-amber-400 bg-amber-900/50 px-1 py-0.5 border border-amber-600 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">EQUIP</span>' : ''}
                </div>
                <p class="text-[9px] sm:text-[10px] text-slate-500 mt-1 leading-normal" style="font-family:var(--font-pixel);">${rod.desc}</p>
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <span class="text-[8px] text-cyan-400" style="font-family:var(--font-pixel);">PWR:${rod.power}x</span>
                  ${rod.luckBonus > 0 ? `<span class="text-[8px] text-purple-400" style="font-family:var(--font-pixel);">+${Math.round(rod.luckBonus*100)}%SRT</span>` : ''}
                </div>
              </div>
            </div>
            <div class="mt-2">
              ${owned
                ? (equipped
                  ? `<button disabled class="w-full py-1 bg-amber-900/40 text-amber-400 text-[10px] border border-amber-700 cursor-default" style="font-family:var(--font-pixel);">EM USO</button>`
                  : `<button onclick="window.game.equipRod('${rod.id}')" class="pixel-btn w-full py-1 bg-slate-700 text-slate-200 text-[10px] border-slate-600" style="font-family:var(--font-pixel);">EQUIPAR</button>`)
                : `<button onclick="window.game.buyRod('${rod.id}')" class="pixel-btn w-full py-1 ${afford ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-600 cursor-not-allowed'} text-[10px]" style="font-family:var(--font-pixel);">COMPRAR ${rod.price.toLocaleString('pt-BR')}G</button>`
              }
            </div>
          </div>`;
      }).join('');
    } else if (this.activeTab === 'iscas') {
      html = BAITS.map(bait => {
        const owned = this.unlockedBaits.includes(bait.id);
        const equipped = this.selectedBaitId === bait.id;
        const afford = this.gold >= bait.price;
        const iconURL = getBaitIconDataURL(bait.id, 2);
        return `
          <div class="p-2.5 border-2 ${equipped ? 'border-cyan-500 bg-cyan-950/30' : 'border-slate-800 bg-slate-900/80'} pixel-border-thin">
            <div class="flex items-start gap-2">
              <div class="w-9 h-9 bg-slate-950 border border-slate-700 flex items-center justify-center p-1 shrink-0">
                <img src="${iconURL}" class="w-7 h-7 object-contain" alt="${bait.name}" style="image-rendering:pixelated;">
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-1.5">
                  <h4 class="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-200 leading-snug break-words" style="font-family:var(--font-pixel);">${bait.name}</h4>
                  ${equipped ? '<span class="text-[7px] sm:text-[8px] text-cyan-400 bg-cyan-900/50 px-1 py-0.5 border border-cyan-600 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">EQUIP</span>' : ''}
                </div>
                <p class="text-[9px] sm:text-[10px] text-slate-500 mt-1 leading-normal" style="font-family:var(--font-pixel);">${bait.desc}</p>
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <span class="text-[8px] text-purple-400" style="font-family:var(--font-pixel);">SRT:${bait.luckMultiplier}x</span>
                  ${bait.doubleCatchBonus > 0 ? `<span class="text-[8px] text-emerald-400" style="font-family:var(--font-pixel);">+${Math.round(bait.doubleCatchBonus*100)}%DUP</span>` : ''}
                </div>
              </div>
            </div>
            <div class="mt-2">
              ${owned
                ? (equipped
                  ? `<button disabled class="w-full py-1 bg-cyan-900/40 text-cyan-400 text-[10px] border border-cyan-700 cursor-default" style="font-family:var(--font-pixel);">EM USO</button>`
                  : `<button onclick="window.game.equipBait('${bait.id}')" class="pixel-btn w-full py-1 bg-slate-700 text-slate-200 text-[10px] border-slate-600" style="font-family:var(--font-pixel);">EQUIPAR</button>`)
                : `<button onclick="window.game.buyBait('${bait.id}')" class="pixel-btn w-full py-1 ${afford ? 'bg-cyan-600 text-slate-950' : 'bg-slate-800 text-slate-600 cursor-not-allowed'} text-[10px]" style="font-family:var(--font-pixel);">COMPRAR ${bait.price.toLocaleString('pt-BR')}G</button>`
              }
            </div>
          </div>`;
      }).join('');
    } else {
      html = UPGRADES.map(u => {
        const lvl = this.upgradeLevels[u.id] || 0;
        const isMax = lvl >= u.maxLevel;
        const price = Math.round(u.basePrice * Math.pow(u.priceMultiplier, lvl));
        const afford = this.gold >= price;
        const iconURL = getUpgradeIconDataURL(u.id, 2);
        return `
          <div class="p-2.5 border-2 border-slate-800 bg-slate-900/80 pixel-border-thin">
            <div class="flex items-start gap-2">
              <div class="w-9 h-9 bg-slate-950 border border-slate-700 flex items-center justify-center p-1 shrink-0">
                <img src="${iconURL}" class="w-7 h-7 object-contain" alt="${u.name}" style="image-rendering:pixelated;">
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-1.5">
                  <h4 class="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-200 leading-snug break-words" style="font-family:var(--font-pixel);">${u.name}</h4>
                  <span class="text-[8px] text-cyan-400 bg-cyan-950/60 px-1 py-0.5 border border-cyan-800 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">LV.${lvl}/${u.maxLevel}</span>
                </div>
                <p class="text-[9px] sm:text-[10px] text-slate-500 mt-1 leading-normal" style="font-family:var(--font-pixel);">${u.desc}</p>
                ${lvl > 0 && u.id === 'ima_dourado' ? `<div class="text-[8px] text-amber-400 mt-1" style="font-family:var(--font-pixel);">⚡ Recarga: ${u.getValue(lvl)}s</div>` : ''}
              </div>
            </div>
            <div class="mt-2">
              ${isMax
                ? `<button disabled class="w-full py-1 bg-slate-800 text-slate-500 text-[10px] border border-slate-700 cursor-default" style="font-family:var(--font-pixel);">MAX ★</button>`
                : `<button onclick="window.game.buyUpgrade('${u.id}')" class="pixel-btn w-full py-1 ${afford ? 'bg-emerald-600 text-slate-950' : 'bg-slate-800 text-slate-600 cursor-not-allowed'} text-[10px]" style="font-family:var(--font-pixel);">LV.${lvl+1} = ${price.toLocaleString('pt-BR')}G</button>`
              }
            </div>
          </div>`;
      }).join('');
    }

    list.innerHTML = html;
  }

  renderInventory() {
    const c = document.getElementById('inventory-fish-list');
    if (!c) return;

    if (this.inventory.length === 0) {
      c.innerHTML = `
        <div class="h-48 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-slate-800">
          <div class="w-8 h-8 mb-1 opacity-40 inline-flex items-center justify-center">${PIXEL_ICONS.bucket}</div>
          <p class="text-[11px] text-slate-500" style="font-family:var(--font-pixel);">BALDE VAZIO</p>
          <p class="text-[10px] text-slate-600 mt-1" style="font-family:var(--font-pixel);">Clique PESCAR!</p>
        </div>`;
      return;
    }

    const buffs = this.getActiveBuffs();

    // Ordenação configurável
    const rarityRank = { MITICO: 6, LENDARIO: 5, EPICO: 4, RARO: 3, INCOMUM: 2, COMUM: 1 };
    let sortedFish = [...this.inventory];

    if (this.invSortMode === 'raridade_desc') {
      sortedFish.sort((a, b) => (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0));
    } else if (this.invSortMode === 'valor_desc') {
      sortedFish.sort((a, b) => b.baseValue - a.baseValue);
    } else if (this.invSortMode === 'peso_desc') {
      sortedFish.sort((a, b) => b.weight - a.weight);
    } else if (this.invSortMode === 'buffs') {
      sortedFish.sort((a, b) => this.getFishBuffs(b).length - this.getFishBuffs(a).length);
    }

    c.innerHTML = sortedFish.map(fish => {
      const r = RARITIES[fish.rarity] || RARITIES.COMUM;
      const sell = Math.round(fish.baseValue * (1 + buffs.goldMultiplier));
      const spriteURL = this.getFishSpriteURL(fish.icon);
      const buffsList = this.getFishBuffs(fish);
      const hasBuff = buffsList.length > 0;
      const isDouble = buffsList.length >= 2;

      return `
        <div class="group p-2 border-2 bg-slate-900/90 flex items-center justify-between gap-1.5 sm:gap-2 rarity-${fish.rarity} ${isDouble ? 'border-amber-400/80' : ''}" style="background:${r.bg};">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <img src="${spriteURL}" class="fish-icon-canvas w-11 h-7 sm:w-12 sm:h-8 object-contain shrink-0" alt="${fish.name}" style="image-rendering:pixelated;">
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline gap-1.5 flex-wrap">
                <span class="text-[9px] sm:text-[10px] font-bold text-slate-100 leading-snug break-words" style="font-family:var(--font-pixel);">${fish.name}</span>
                <span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);color:${r.color};border-color:${r.border};background:rgba(0,0,0,0.4);">${r.label}</span>
                ${isDouble ? '<span class="text-[7px] font-bold px-1 py-0.5 border border-amber-400 bg-amber-950/80 text-amber-300 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel);">★ DUPLO</span>' : ''}
              </div>
              <div class="flex items-center gap-1.5 text-[8px] text-slate-400 mt-1" style="font-family:var(--font-pixel);">
                <span>${fish.weight}kg</span>
                <span class="text-amber-300 font-bold">${sell}G</span>
              </div>
              ${hasBuff ? `
                <div class="flex flex-col gap-0.5 mt-1">
                  ${buffsList.map(b => `<span class="text-[8px] text-purple-300 leading-snug break-words" style="font-family:var(--font-pixel);">★ ${b.text}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            ${hasBuff ? `<button onclick="window.game.moveToAquarium('${fish.uid}')" title="Mover ao Aquário" class="px-1.5 py-1 border text-[10px] bg-purple-900/40 border-purple-600 text-purple-300 hover:bg-purple-800/60">${PIXEL_ICONS.aquarium}</button>` : ''}
            <button onclick="window.game.toggleLockFish('${fish.uid}')" class="px-1.5 py-1 border text-[10px] ${fish.locked ? 'bg-amber-900/40 border-amber-600 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-200'}">${fish.locked ? PIXEL_ICONS.lockClosed : PIXEL_ICONS.lockOpen}</button>
            <button onclick="window.game.sellFish('${fish.uid}')" ${fish.locked ? 'disabled' : ''} class="pixel-btn px-1.5 py-1 ${fish.locked ? 'bg-slate-800 text-slate-600 cursor-not-allowed border-slate-800' : 'bg-emerald-800 text-emerald-200 border-emerald-600'} text-[9px] sm:text-[10px]" style="font-family:var(--font-pixel);">SELL</button>
          </div>
        </div>`;
    }).join('');
  }

  renderAquarium() {
    const c = document.getElementById('aquarium-fish-list');
    if (!c) return;

    const selectEl = document.getElementById('select-aquarium-filter');
    if (selectEl && selectEl.value !== this.aquariumFilterMode) {
      selectEl.value = this.aquariumFilterMode;
    }

    const maxAq = this.getMaxAquarium();

    if (this.aquarium.length === 0) {
      c.innerHTML = `
        <div class="h-48 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-purple-900/50">
          <div class="w-8 h-8 mb-1 opacity-40 inline-flex items-center justify-center">${PIXEL_ICONS.aquarium}</div>
          <p class="text-[10px] text-slate-500" style="font-family:var(--font-pixel);">AQUARIO VAZIO</p>
          <p class="text-[8px] text-slate-600 mt-1" style="font-family:var(--font-pixel);">${maxAq} slots · Buffs 1.5x</p>
          <p class="text-[7px] text-purple-400 mt-2" style="font-family:var(--font-pixel);">Mova peixes com buff pelo balde</p>
        </div>`;
      return;
    }

    const filter = this.aquariumFilterMode;
    const rarityRank = { MITICO: 6, LENDARIO: 5, EPICO: 4, RARO: 3, INCOMUM: 2, COMUM: 1 };
    let displayFish = [...this.aquarium];

    if (filter === 'double_buffs') {
      displayFish = displayFish.filter(f => this.getFishBuffs(f).length >= 2);
    } else if (filter === 'gold_multiplier') {
      displayFish = displayFish.filter(f => this.getFishBuffs(f).some(b => b.type === 'gold_multiplier' || b.type === 'all_stats' || b.type === 'mythic_mastery'));
    } else if (filter === 'luck_bonus') {
      displayFish = displayFish.filter(f => this.getFishBuffs(f).some(b => b.type === 'luck_bonus' || b.type === 'all_stats' || b.type === 'mythic_mastery'));
    } else if (filter === 'fishing_speed') {
      displayFish = displayFish.filter(f => this.getFishBuffs(f).some(b => b.type === 'fishing_speed' || b.type === 'auto_fish_speed' || b.type === 'all_stats' || b.type === 'mythic_mastery'));
    } else if (filter === 'double_catch_chance') {
      displayFish = displayFish.filter(f => this.getFishBuffs(f).some(b => b.type === 'double_catch_chance' || b.type === 'all_stats' || b.type === 'mythic_mastery'));
    } else if (filter === 'raridade_desc') {
      displayFish.sort((a, b) => (rarityRank[b.rarity] || 0) - (rarityRank[a.rarity] || 0));
    } else if (filter === 'peso_desc') {
      displayFish.sort((a, b) => b.weight - a.weight);
    }

    if (displayFish.length === 0) {
      c.innerHTML = `
        <div class="h-36 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-purple-900/40">
          <p class="text-[10px] text-purple-300" style="font-family:var(--font-pixel);">NENHUM PEIXE ENCONTRADO</p>
          <p class="text-[8px] text-slate-500 mt-1" style="font-family:var(--font-pixel);">com o filtro selecionado (${filter})</p>
        </div>`;
      return;
    }

    c.innerHTML = displayFish.map(fish => {
      const r = RARITIES[fish.rarity] || RARITIES.COMUM;
      const spriteURL = this.getFishSpriteURL(fish.icon);
      const buffsList = this.getFishBuffs(fish);
      const isDouble = buffsList.length >= 2;

      return `
        <div class="group p-2 border-2 bg-purple-950/30 flex items-center justify-between gap-1.5 sm:gap-2 ${isDouble ? 'border-amber-400/80' : ''}" style="border-color:${isDouble ? '#f59e0b' : r.border};">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <img src="${spriteURL}" class="fish-icon-canvas w-11 h-7 sm:w-12 sm:h-8 object-contain shrink-0" alt="${fish.name}" style="image-rendering:pixelated;">
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline gap-1.5 flex-wrap">
                <span class="text-[9px] sm:text-[10px] font-bold text-slate-100 leading-snug break-words" style="font-family:var(--font-pixel);">${fish.name}</span>
                <span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);color:${r.color};border-color:${r.border};background:rgba(0,0,0,0.4);">${r.label}</span>
                ${isDouble ? '<span class="text-[7px] font-bold px-1 py-0.5 border border-amber-400 bg-amber-950/80 text-amber-300 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel);">★ DUPLO</span>' : ''}
              </div>
              <div class="flex flex-col gap-0.5 mt-1">
                ${buffsList.map(b => `<span class="text-[8px] text-emerald-300 leading-snug break-words" style="font-family:var(--font-pixel);">★ ${b.text} <span class="text-emerald-400 font-bold">(1.5x)</span></span>`).join('')}
              </div>
            </div>
          </div>
          <button onclick="window.game.moveToInventory('${fish.uid}')" title="Devolver ao Balde" class="pixel-btn px-1.5 sm:px-2 py-1.5 bg-slate-800 text-slate-300 border-slate-600 text-[8px] sm:text-[9px] hover:bg-slate-700 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">↩ BALDE</button>
        </div>`;
    }).join('');
  }

  renderStats() {
    const c = document.getElementById('stat-catches');
    if (c) c.textContent = this.totalCatches.toLocaleString('pt-BR');
    const g = document.getElementById('stat-total-gold');
    if (g) g.textContent = this.totalGoldEarned.toLocaleString('pt-BR');
  }

  // ── EFEITOS VISUAIS ──
  createWaterRipple() {
    const lake = document.getElementById('fishing-lake-area');
    if (!lake) return;
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.left = '58%'; r.style.top = '65%';
    r.style.borderRadius = '50%';
    lake.appendChild(r);
    setTimeout(() => r.remove(), 1100);
  }

  showCatchNotification(fish) {
    const c = document.getElementById('catch-toast-container');
    if (!c) return;
    const r = RARITIES[fish.rarity] || RARITIES.COMUM;
    const spriteURL = this.getFishSpriteURL(fish.icon);
    const buffsList = this.getFishBuffs(fish);
    const isDouble = buffsList.length >= 2;
    const card = document.createElement('div');
    card.className = `catch-popup p-2.5 border-2 flex items-center gap-2 rarity-${fish.rarity} ${isDouble ? 'ring-2 ring-amber-400' : ''}`;
    card.style.background = 'rgba(15,23,42,0.95)';
    card.style.borderColor = isDouble ? '#f59e0b' : r.border;
    card.innerHTML = `
      <img src="${spriteURL}" class="fish-icon-canvas w-12 h-8 shrink-0" style="image-rendering:pixelated;">
      <div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[8px] font-bold px-1 py-0.5 border" style="font-family:var(--font-pixel);color:${r.color};border-color:${r.border};background:rgba(0,0,0,0.4);">${r.label}</span>
          ${isDouble ? '<span class="text-[7px] font-bold px-1 py-0.5 border border-amber-400 bg-amber-950/80 text-amber-300 animate-pulse whitespace-nowrap" style="font-family:var(--font-pixel);">★ BUFF DUPLO!</span>' : ''}
          <span class="text-[8px] text-slate-400" style="font-family:var(--font-pixel);">${fish.weight}kg</span>
        </div>
        <h3 class="text-[11px] font-bold text-slate-100 mt-0.5" style="font-family:var(--font-pixel);">${fish.name}</h3>
        ${buffsList.map(b => `<p class="text-[8px] text-purple-300" style="font-family:var(--font-pixel);">★ ${b.text}</p>`).join('')}
      </div>`;
    c.appendChild(card);
    setTimeout(() => card.remove(), 2200);
  }

  showFloatingText(text, color = '#38bdf8', offY = 0) {
    const lake = document.getElementById('fishing-lake-area');
    if (!lake) return;
    const el = document.createElement('div');
    el.className = 'floating-number';
    el.style.color = color;
    el.style.fontFamily = 'var(--font-pixel)';
    el.style.fontSize = '10px';
    el.style.left = (48 + Math.random() * 10) + '%';
    el.style.top = (40 + offY / 10) + '%';
    el.textContent = text;
    lake.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  showToast(msg, type = 'info') {
    const bgMap = {
      error: 'bg-red-950/95 border-red-500 text-red-200',
      warning: 'bg-amber-950/95 border-amber-500 text-amber-200',
      success: 'bg-emerald-950/95 border-emerald-400 text-emerald-100',
      info: 'bg-slate-900/95 border-cyan-500 text-cyan-200'
    };
    const t = document.createElement('div');
    t.className = `fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 py-2 border-2 ${bgMap[type] || bgMap.info} text-[10px] transition-all duration-300 -translate-y-3 opacity-0 text-center`;
    t.style.fontFamily = 'var(--font-pixel)';
    t.style.boxShadow = '4px 4px 0 #000';
    t.style.maxWidth = '90vw';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => {
      t.style.transform = 'translate(-50%, 0)';
      t.style.opacity = '1';
    });
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translate(-50%, -10px)';
      setTimeout(() => t.remove(), 300);
    }, 2500);
  }

  // ═══════════════════════════════════════════
  // PEIXE DOURADO (Golden Cookie style)
  // ═══════════════════════════════════════════
  initGoldenFish() {
    this.scheduleNextGoldenFish();
  }

  scheduleNextGoldenFish() {
    const delay = (45 + Math.random() * 75) * 1000; // 45-120 segundos
    this.goldenFishTimer = setTimeout(() => this.spawnGoldenFish(), delay);
  }

  spawnGoldenFish() {
    if (this.goldenFishActive) return;
    this.goldenFishActive = true;

    const lake = document.getElementById('fishing-lake-area');
    if (!lake) { this.goldenFishActive = false; this.scheduleNextGoldenFish(); return; }

    const el = document.createElement('div');
    el.id = 'golden-fish-event';
    el.innerHTML = `<img src="${getFishDataURL('dourado', 3)}" alt="Golden Fish" style="width:48px;height:32px;image-rendering:pixelated;filter:drop-shadow(0 0 10px gold) drop-shadow(0 0 4px #ffd700);pointer-events:none;">`;
    el.style.cssText = `
      position:absolute; z-index:35; cursor:pointer; user-select:none;
      animation: goldenFishFloat 2s ease-in-out infinite, goldenFishShimmer 0.6s ease-in-out infinite alternate;
      transition: transform 0.15s, opacity 0.3s;
    `;

    // Posição aleatória dentro do lago
    const maxX = 60, maxY = 50;
    el.style.left = (15 + Math.random() * maxX) + '%';
    el.style.top = (10 + Math.random() * maxY) + '%';

    const handleCatch = (isAuto = false) => {
      if (!this.goldenFishActive) return;
      el.style.transform = isAuto ? 'scale(2.2)' : 'scale(1.8)';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
      this.goldenFishActive = false;
      this.onGoldenFishClick();
      this.scheduleNextGoldenFish();
    };

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCatch(false);
    });

    lake.appendChild(el);

    // Auto-captura via Ímã Dourado com verificação de cooldown
    const imaLvl = this.upgradeLevels.ima_dourado || 0;
    if (imaLvl > 0) {
      const u = UPGRADES.find(up => up.id === 'ima_dourado');
      const cdSec = u ? u.getValue(imaLvl) : 300;
      const now = Date.now();

      if (now >= this.nextGoldenFishAutoCatchTime) {
        this.nextGoldenFishAutoCatchTime = now + (cdSec * 1000);
        setTimeout(() => {
          if (this.goldenFishActive && el.parentNode) {
            this.showFloatingText('★ ÍMÃ DOURADO!', '#ffd700', -40);
            this.showToast(`Ímã Dourado capturou o Peixe Dourado! (Recarga: ${cdSec}s)`, 'success');
            handleCatch(true);
          }
        }, 1200);
      }
    }

    // Desaparece após 12 segundos se não clicado
    setTimeout(() => {
      if (el.parentNode && this.goldenFishActive) {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
        this.goldenFishActive = false;
        this.scheduleNextGoldenFish();
      }
    }, 12000);
  }

  onGoldenFishClick() {
    sound.playUpgrade();
    sound.vibrateGoldenFish();
    this.goldenFishCatches = (this.goldenFishCatches || 0) + 1;
    this.checkAchievements();

    const rewards = [
      {
        type: 'gold_frenzy', label: 'FRENESI DE OURO!', desc: '+200% ouro por 30s',
        duration: 30000, multiplier: 2.0, color: '#ffd700'
      },
      {
        type: 'luck_surge', label: 'SORTE SUPREMA!', desc: '+100% sorte por 25s',
        duration: 25000, multiplier: 1.0, color: '#a855f7'
      },
      {
        type: 'speed_burst', label: 'VELOCIDADE EXTREMA!', desc: '+50% velocidade por 20s',
        duration: 20000, multiplier: 0.50, color: '#38bdf8'
      },
      {
        type: 'double_mania', label: 'MANIA DUPLA!', desc: '+50% chance dupla por 25s',
        duration: 25000, multiplier: 0.50, color: '#34d399'
      },
      {
        type: 'instant_gold', label: 'CHUVA DE OURO!', desc: null,
        color: '#fbbf24'
      },
      {
        type: 'fish_rain', label: 'CHUVA DE PEIXES!', desc: null,
        color: '#60a5fa'
      }
    ];

    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    if (reward.type === 'instant_gold') {
      const amount = Math.max(100, Math.round(this.gold * 0.15 + this.totalCatches * 5));
      this.gold += amount;
      this.totalGoldEarned += amount;
      reward.desc = '+' + amount.toLocaleString('pt-BR') + ' ouro instantâneo!';
      this.showFloatingText('+' + amount, '#ffd700', -30);
    } else if (reward.type === 'fish_rain') {
      const count = 3 + Math.floor(Math.random() * 5);
      const buffs = this.getActiveBuffs();
      for (let i = 0; i < count; i++) {
        if (this.inventory.length >= this.getMaxInventory()) break;
        const fish = this.rollFish(buffs);
        this.inventory.unshift(fish);
        this.totalCatches++;
      }
      reward.desc = count + ' peixes pescados!';
    } else {
      // Buff temporário
      this.tempBuffs.push({
        type: reward.type,
        multiplier: reward.multiplier,
        endsAt: Date.now() + reward.duration,
        label: reward.label
      });
    }

    // Notificação grande no centro
    this.showGoldenFishReward(reward);
    this.renderAll();
  }

  showGoldenFishReward(reward) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:60; display:flex; align-items:center; justify-content:center;
      pointer-events:none; animation: goldenRewardIn 0.4s ease-out;
    `;
    overlay.innerHTML = `
      <div style="
        background:rgba(15,23,42,0.95); border:3px solid ${reward.color};
        padding:20px 32px; text-align:center; box-shadow:0 0 40px ${reward.color}44, 4px 4px 0 #000;
        animation: goldenRewardPulse 0.5s ease-in-out;
      ">
        <div style="display:flex; justify-content:center; margin-bottom:8px;">
          <img src="${getFishDataURL('dourado', 3)}" alt="Dourado" style="width:52px;height:35px;image-rendering:pixelated;filter:drop-shadow(0 0 8px gold);">
        </div>
        <div style="font-family:var(--font-pixel); font-size:12px; color:${reward.color}; font-weight:bold; letter-spacing:2px;">${reward.label}</div>
        <div style="font-family:var(--font-pixel); font-size:9px; color:#94a3b8; margin-top:6px;">${reward.desc}</div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.5s';
      setTimeout(() => overlay.remove(), 500);
    }, 2500);
  }

  startTempBuffLoop() {
    setInterval(() => {
      const now = Date.now();
      const before = this.tempBuffs.length;
      this.tempBuffs = this.tempBuffs.filter(b => b.endsAt > now);
      if (this.tempBuffs.length !== before) {
        this.renderBuffs();
      }
      // Renderiza indicador de buffs ativos
      this.renderTempBuffIndicator();
    }, 1000);
  }

  renderTempBuffIndicator() {
    let container = document.getElementById('temp-buff-bar');
    if (!container) {
      container = document.createElement('div');
      container.id = 'temp-buff-bar';
      container.style.cssText = 'position:fixed;top:52px;left:50%;transform:translateX(-50%);z-index:45;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;pointer-events:none;';
      document.body.appendChild(container);
    }

    const now = Date.now();
    const active = this.tempBuffs.filter(b => b.endsAt > now);
    if (active.length === 0) { container.innerHTML = ''; return; }

    container.innerHTML = active.map(b => {
      const secs = Math.ceil((b.endsAt - now) / 1000);
      return `<div style="font-family:var(--font-pixel);font-size:8px;padding:3px 8px;border:2px solid #ffd700;background:rgba(15,23,42,0.9);color:#ffd700;box-shadow:2px 2px 0 #000;">${b.label.split(' ')[0]} ${secs}s</div>`;
    }).join('');
  }

  // ═══════════════════════════════════════════
  // CONSOLE DE COMANDOS (DEV)
  // ═══════════════════════════════════════════
  initConsole() {
    // Container
    const div = document.createElement('div');
    div.id = 'dev-console';
    div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100;display:none;flex-direction:column;max-height:200px;';
    div.innerHTML = `
      <div id="console-log" style="flex:1;overflow-y:auto;background:rgba(0,0,0,0.92);padding:6px 10px;font-family:monospace;font-size:12px;color:#a0f0a0;max-height:150px;"></div>
      <div style="display:flex;background:#111;border-top:2px solid #333;">
        <span style="padding:6px 8px;color:#0f0;font-family:monospace;font-size:12px;">></span>
        <input id="console-input" type="text" placeholder="help" autocomplete="off"
          style="flex:1;background:transparent;border:none;outline:none;color:#0f0;font-family:monospace;font-size:12px;padding:6px 4px;">
      </div>
    `;
    document.body.appendChild(div);

    // Botão toggle no header
    const btn = document.createElement('button');
    btn.id = 'btn-console';
    btn.title = 'Console';
    btn.className = 'w-9 h-9 bg-slate-900 border-2 border-slate-700 flex items-center justify-center pixel-btn hover:border-green-600';
    btn.innerHTML = PIXEL_ICONS.console;
    btn.addEventListener('click', () => this.toggleConsole());
    document.getElementById('btn-reset-game')?.after(btn);

    // Input handler
    document.getElementById('console-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) { this.execConsoleCmd(val); e.target.value = ''; }
      }
    });

    // Tecla ` para toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === '`' || e.key === '~') { e.preventDefault(); this.toggleConsole(); }
    });
  }

  toggleConsole() {
    this.consoleOpen = !this.consoleOpen;
    const el = document.getElementById('dev-console');
    if (el) el.style.display = this.consoleOpen ? 'flex' : 'none';
    if (this.consoleOpen) document.getElementById('console-input')?.focus();
  }

  consoleLog(text, color = '#a0f0a0') {
    const log = document.getElementById('console-log');
    if (!log) return;
    const line = document.createElement('div');
    line.style.color = color;
    line.style.marginBottom = '2px';
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  execConsoleCmd(raw) {
    this.consoleLog('> ' + raw, '#666');
    const parts = raw.toLowerCase().split(/\s+/);
    const cmd = parts[0];
    const arg = parts[1];

    switch (cmd) {
      case 'help':
        this.consoleLog('=== COMANDOS ===', '#ffd700');
        this.consoleLog('gold <qtd>     - Adiciona ouro', '#ccc');
        this.consoleLog('goldset <qtd>  - Define ouro para valor exato (ex: goldset 0)', '#ccc');
        this.consoleLog('goldenfish     - Spawna peixe dourado', '#ccc');
        this.consoleLog('catch [n]      - Pesca n peixes (default: 1)', '#ccc');
        this.consoleLog('maxupgrades    - Maximiza upgrades', '#ccc');
        this.consoleLog('unlockall      - Desbloqueia varas e iscas', '#ccc');
        this.consoleLog('clearinv       - Limpa inventário', '#ccc');
        this.consoleLog('buff <tipo> [s] - Buff temporário (gold/luck/speed/double)', '#ccc');
        this.consoleLog('reset          - Reseta progresso', '#ccc');
        this.consoleLog('clear          - Limpa console', '#ccc');
        break;

      case 'gold': {
        const amount = parseInt(arg) || 10000;
        this.gold += amount;
        this.totalGoldEarned += amount;
        this.consoleLog('+ ' + amount.toLocaleString() + ' ouro', '#ffd700');
        this.renderAll();
        break;
      }

      case 'goldset':
      case 'setgold': {
        const val = parseInt(arg);
        const amount = isNaN(val) ? 0 : Math.max(0, val);
        this.setGold(amount);
        this.consoleLog(`Ouro definido exatamente para: ${amount.toLocaleString('pt-BR')} G`, '#ffd700');
        break;
      }

      case 'goldenfish':
        if (this.goldenFishActive) {
          this.consoleLog('Já existe um peixe dourado ativo!', '#ff6b6b');
        } else {
          clearTimeout(this.goldenFishTimer);
          this.spawnGoldenFish();
          this.consoleLog('Peixe dourado spawnado!', '#ffd700');
        }
        break;

      case 'catch': {
        const n = Math.min(parseInt(arg) || 1, 50);
        const buffs = this.getActiveBuffs();
        let caught = 0;
        for (let i = 0; i < n; i++) {
          if (this.inventory.length >= this.getMaxInventory()) break;
          this.inventory.unshift(this.rollFish(buffs));
          this.totalCatches++;
          caught++;
        }
        this.consoleLog(caught + ' peixes pescados!', '#34d399');
        this.renderAll();
        break;
      }

      case 'maxupgrades':
        UPGRADES.forEach(u => { this.upgradeLevels[u.id] = u.maxLevel; });
        this.consoleLog('Upgrades maximizados!', '#a855f7');
        this.renderAll();
        break;

      case 'unlockall':
        RODS.forEach(r => { if (!this.unlockedRods.includes(r.id)) this.unlockedRods.push(r.id); });
        BAITS.forEach(b => { if (!this.unlockedBaits.includes(b.id)) this.unlockedBaits.push(b.id); });
        this.consoleLog('Todas varas e iscas desbloqueadas!', '#38bdf8');
        this.renderAll();
        break;

      case 'clearinv':
        this.inventory = [];
        this.consoleLog('Inventário limpo!', '#f87171');
        this.renderAll();
        break;

      case 'buff': {
        const buffTypes = { gold: 'gold_frenzy', luck: 'luck_surge', speed: 'speed_burst', double: 'double_mania' };
        const bt = buffTypes[arg || 'gold'];
        if (!bt) { this.consoleLog('Tipo inválido! Use: gold, luck, speed, double', '#ff6b6b'); break; }
        const dur = (parseInt(parts[2]) || 60) * 1000;
        this.tempBuffs.push({ type: bt, multiplier: 2.0, endsAt: Date.now() + dur, label: (arg || 'gold').toUpperCase() });
        this.consoleLog('Buff ' + (arg || 'gold') + ' ativado por ' + (dur / 1000) + 's!', '#ffd700');
        this.renderBuffs();
        break;
      }

      case 'reset':
        this.resetProgress();
        break;

      case 'clear':
        document.getElementById('console-log').innerHTML = '';
        break;

      default:
        this.consoleLog('Comando desconhecido. Digite "help"', '#ff6b6b');
    }
  }

  switchInvTab() {
    const invList = document.getElementById('inventory-fish-list');
    const aqList = document.getElementById('aquarium-fish-list');
    const invActions = document.getElementById('inv-actions-inventory');
    const aqActions = document.getElementById('inv-actions-aquarium');
    const sortBar = document.getElementById('inv-sort-bar');
    const aqFilterBar = document.getElementById('aquarium-filter-bar');

    if (this.invTab === 'aquarium') {
      invList?.classList.add('hidden');
      aqList?.classList.remove('hidden');
      invActions?.classList.add('hidden');
      aqActions?.classList.remove('hidden');
      sortBar?.classList.add('hidden');
      aqFilterBar?.classList.remove('hidden');
    } else {
      invList?.classList.remove('hidden');
      aqList?.classList.add('hidden');
      invActions?.classList.remove('hidden');
      aqActions?.classList.add('hidden');
      sortBar?.classList.remove('hidden');
      aqFilterBar?.classList.add('hidden');
    }
    this.renderHeader();
  }

  setupEventListeners() {
    document.getElementById('btn-pescar-main')?.addEventListener('click', () => this.fish(false));

    // Seletor de ordenação do inventário
    document.getElementById('select-inv-sort')?.addEventListener('change', (e) => {
      this.invSortMode = e.target.value;
      sound.playClick();
      this.renderInventory();
    });

    // Seletor de filtro do aquário
    document.getElementById('select-aquarium-filter')?.addEventListener('change', (e) => {
      this.aquariumFilterMode = e.target.value;
      sound.playClick();
      this.renderAquarium();
    });

    // Tabs upgrades (varas/iscas/geral)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('bg-slate-700','text-white','border-cyan-500/50');
          b.classList.add('text-slate-500','border-transparent');
        });
        e.currentTarget.classList.add('bg-slate-700','text-white','border-cyan-500/50');
        e.currentTarget.style.boxShadow = '1px 1px 0 #000';
        sound.playClick();
        this.renderUpgrades();
      });
    });

    // Tabs inventário/aquário
    document.querySelectorAll('.inv-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.invTab = e.currentTarget.dataset.invTab;
        document.querySelectorAll('.inv-tab-btn').forEach(b => {
          b.classList.remove('bg-slate-700','text-white','border-cyan-500/50');
          b.classList.add('text-slate-500','border-transparent');
          b.style.boxShadow = '';
        });
        e.currentTarget.classList.add('bg-slate-700','text-white','border-cyan-500/50');
        e.currentTarget.style.boxShadow = '1px 1px 0 #000';
        sound.playClick();
        this.switchInvTab();
      });
    });

    document.getElementById('btn-sell-all')?.addEventListener('click', () => this.sellManual());

    const modal = document.getElementById('sell-filter-modal');
    document.getElementById('btn-open-sell-filter')?.addEventListener('click', () => this.openSellFilterModal());
    document.getElementById('btn-close-filter-modal')?.addEventListener('click', () => { sound.playClick(); modal?.classList.add('hidden'); });
    document.getElementById('btn-save-filter-prefs')?.addEventListener('click', () => this.saveFilterPreferences());

    // Botões de atalho no modal de filtro
    document.getElementById('btn-filter-manual-default')?.addEventListener('click', () => {
      document.querySelectorAll('.filter-manual-cb').forEach(c => c.checked = ['COMUM', 'INCOMUM'].includes(c.value));
      sound.playClick();
    });
    document.getElementById('btn-filter-manual-all')?.addEventListener('click', () => {
      document.querySelectorAll('.filter-manual-cb').forEach(c => c.checked = true);
      sound.playClick();
    });
    document.getElementById('btn-filter-auto-default')?.addEventListener('click', () => {
      document.querySelectorAll('.filter-auto-cb').forEach(c => c.checked = c.value === 'COMUM');
      sound.playClick();
    });
    document.getElementById('btn-filter-auto-all')?.addEventListener('click', () => {
      document.querySelectorAll('.filter-auto-cb').forEach(c => c.checked = true);
      sound.playClick();
    });

    document.getElementById('btn-toggle-sound')?.addEventListener('click', (e) => {
      const muted = sound.toggleMute();
      e.currentTarget.innerHTML = muted ? PIXEL_ICONS.soundOff : PIXEL_ICONS.soundOn;
    });

    // Perfil do Pescador
    document.getElementById('btn-open-profile')?.addEventListener('click', () => this.openProfile());
    document.getElementById('btn-close-profile')?.addEventListener('click', () => this.closeProfile());
    document.getElementById('btn-save-profile')?.addEventListener('click', () => this.saveProfile());
    document.getElementById('profile-name-input')?.addEventListener('input', (e) => {
      this.editingProfile.name = e.target.value.trim() || 'Pescador';
      const nameEl = document.getElementById('profile-preview-name');
      if (nameEl) nameEl.textContent = this.editingProfile.name;
    });

    // Conquistas / Sala de Troféus
    document.getElementById('btn-open-achievements')?.addEventListener('click', () => this.openAchievements());
    document.getElementById('btn-close-achievements')?.addEventListener('click', () => this.closeAchievements());
    document.querySelectorAll('.ach-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.achTab = e.currentTarget.dataset.achTab;
        document.querySelectorAll('.ach-tab-btn').forEach(b => {
          b.classList.remove('bg-slate-700', 'text-white', 'border-amber-400/60');
          b.classList.add('text-slate-500', 'border-transparent');
        });
        e.currentTarget.classList.add('bg-slate-700', 'text-white', 'border-amber-400/60');
        sound.playClick();
        this.renderAchievements();
      });
    });

    // Capítulo 1 / Portal Dimensional
    document.getElementById('btn-open-chapter1')?.addEventListener('click', () => this.openChapter1Modal());
    document.getElementById('btn-close-chapter1')?.addEventListener('click', () => this.closeChapter1Modal());
    document.getElementById('btn-chapter1-confirm')?.addEventListener('click', () => this.closeChapter1Modal());

    document.getElementById('btn-open-album')?.addEventListener('click', () => this.openAlbum());
    document.getElementById('btn-close-album')?.addEventListener('click', () => this.closeAlbum());
    document.getElementById('btn-toggle-time')?.addEventListener('click', () => this.toggleTimeOfDay());

    document.getElementById('btn-reset-game')?.addEventListener('click', () => this.resetProgress());

    // Fechar modais ao clicar fora (backdrop click) e via tecla Escape
    const allModals = ['sell-filter-modal', 'album-modal', 'offline-modal', 'profile-modal', 'achievements-modal', 'chapter1-modal'];
    allModals.forEach(id => {
      const m = document.getElementById(id);
      if (m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) {
            m.classList.add('hidden');
            sound.playClick();
          }
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        allModals.forEach(id => {
          const m = document.getElementById(id);
          if (m && !m.classList.contains('hidden')) {
            m.classList.add('hidden');
          }
        });
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => { window.game = new FishingGame(); });
