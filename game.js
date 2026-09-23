import { WORLD2_BIOMES, FISH_WORLD_2, RODS_WORLD_2, BAITS_WORLD_2, UPGRADES_WORLD_2, ASCENSION_PARTS } from './world2Data.js';
import { RARITIES, FISH_LIST, generateFishBuffs } from './fishData.js';
import { RODS, BAITS, UPGRADES, isCosmicOrHigherRod } from './itemsData.js';
import { sound } from './sound.js';
import { ACHIEVEMENTS } from './achievementsData.js';
import {
  MAGNET_TIERS,
  MAGNET_SCENARIOS,
  MAGNET_ITEMS,
  FORGE_RECIPES,
  MUSEUM_COLLECTIONS
} from './magnetData.js';
import {
  renderFishermanToCanvas,
  getFishDataURL,
  getBloodMoonFishDataURL,
  getFishSilhouetteDataURL,
  PixelWaterRenderer,
  updateRodSVG,
  updateFishingLine,
  PIXEL_ICONS,
  getRodIconDataURL,
  getBaitIconDataURL,
  getUpgradeIconDataURL,
  getMagnetSpriteSVG,
  getMagnetItemSpriteSVG,
  OUTFIT_PRESETS,
  HAIR_COLORS
} from './pixelArt.js';

// ══════════════════════════════════════════════════════════════════════════════
// VERSÃO DO JOGO & NOTAS DE ATUALIZAÇÃO AUTOMÁTICAS
// Incremente esta versão (ex: '1.4.0' -> '1.4.1') a cada atualização no GitHub.
// O jogo detecta automaticamente e abre o modal de Notas de Atualização
// APENAS na primeira vez que o usuário abrir o jogo após a atualização, com timer de 5s!
// ══════════════════════════════════════════════════════════════════════════════
export const GAME_VERSION = '1.4.9';

class FishingGame {
  constructor() {
    window.game = this;
    this.gameVersion = GAME_VERSION;
    this.patchNotesCooldownActive = false;
    this.patchNotesTimerInterval = null;
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
    this.autoFisherEnabled = true;
    this.autoSellerEnabled = true;

    // Configurações do Jogo (Áudio, Visual, etc.)
    this.settings = {
      sound: true,
      fishGlow: true,
      fishAnimations: true,
      waterParticles: true,
      scanlines: true,
      fishNotifications: true
    };

    // Álbum de Peixes (Enciclopédia)
    this.discoveredFish = {}; // { [id]: { maxWeight, count } }

    // Ciclo Dia / Pôr do Sol / Noite
    this.timeOfDay = 'day'; // 'day' | 'sunset' | 'night'
    this.timeOffsetMs = 0;
    this.savedPhaseMsRemaining = null;
    this.timeSavedAt = null;
    this.lastActiveTime = Date.now();

    // Meta-progressão: Olhos de Peixe (Santuário Místico - 00:00)
    this.speciesDonations = {}; // { [fishId]: true }
    this.donatedSpeciesHistory = {}; // { [fishId]: true } registro permanente para nunca mais exibir botao doar
    this.offeringCycle = 1;
    this.activeFishEyesTab = 'attributes'; // 'attributes' | 'offering'
    this.world2BiomeOffsetMs = 0;
    this.fishEyesCount = 0;
    this.fishEyesTotal = 0;
    this.fishEyesAllocated = { gold: 0, luck: 0, speed: 0, double: 0 };
    this.lastFishEyeDate = null;

    // Evento Mar Sangrento & Eclipse Vermelho (Vara Cósmica+)
    this.bloodMoonEventActive = false;
    this.bloodMoonEndsAt = 0;
    this.bloodMoonInterval = null;
    this.goldenFishCountSinceBlood = 0;

    // Fim do Capítulo 1 / Portal Dimensional & Altar das 15 Almas
    this.chapter1Completed = false;
    this.sacrificedFishCount = 0;
    this.currentWorld = 1; // 1 = Superfície, 2 = Abismo
    this.activeWorld2Biome = 'recife_bioluminescente';
    this.ascensionParts = {
      bateria_neon: false,
      casco_titanio: false,
      helice_galeao: false,
      sistema_lastro_hadal: false
    };
    this.submarineAssembled = false; // 1 = Neo-Píer (Superfície), 2 = O Abismo (Fundo do Mar)
    this.world1Data = null;
    this.world2SavedData = null;
    this.isResetting = false;

    this.isFishing = false;
    this.autoFishTimer = null;
    this.lastAutoFishTime = 0;
    this.activeTab = 'varas';
    this.invTab = 'inventory';
    this.waterRenderer = null;

    // Peixe Dourado (Evento Rápido)
    this.goldenFishActive = false;
    this.goldenFishTimer = null;
    this.tempBuffs = []; // { type, multiplier, endsAt, label }
    this.consoleOpen = false;
    this.consoleHistory = [];

    // Pesca Magnética (Desbloqueada pelo Mergulhador Amigo)
    this.gameMode = 'pesca'; // 'pesca' | 'ima'
    this.magnetUnlocked = false;
    this.magnetTier = 1;
    this.magnetScenario = 'ponte'; // 'ponte' | 'praia' | 'floresta'
    this.magnetLeftTab = 'forge'; // 'forge' | 'museum' | 'tiers'
    this.magnetInventory = {}; // { itemId: count }
    this.magnetSelectedItemId = null;
    this.museumDonations = {}; // { itemId: true }
    this.forgeUpgrades = {}; // { recipeId: true }
    this.isCastingMagnet = false;
    this.magnetCatches = 0;
    this.magnetGoldEarned = 0;

    // Celebração de primeira captura por raridade (1x por raridade permanentemente)
    this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    this.hasSeenBuffFishNotice = false;

    // Cache fish sprites data URLs
    this._fishSpriteCache = {};
    this._fishSilhouetteCache = {};

    this.init();
  }

  init() {
    this.loadGame();
    this.applySettings();
    this.initPixelArt();
    this.initTimeOfDay();
    this.initWorld2BiomeCycle();
    this.setupEventListeners();
    this.renderAll();
    this.startAutoFisher();
    this.startAutoSeller();
    this.initGoldenFish();
    this.initConsole();
    this.startTempBuffLoop();
    this.checkOfflineProgress();
    this.checkAchievements(false);
    this.updateAchievementsBadge();
    this.checkChapter1Completion(false);
    this.updateChapter1Badge();
    this.checkMidnightFishEye(false);
    this.startMidnightTimerLoop();
    this.renderFishEyesBadge();
    this.initPWA();
    this.checkPatchNotesOnStartup();
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
      this.waterRenderer.setTimeOfDay(this.timeOfDay);
      ['lambari','carpa','truta','robalo'].forEach(f => this.waterRenderer.addSwimmingFish(f));
      this.updateDiverVisual();
      const animLoop = () => {
        if (this.gameMode !== 'ima' && this.waterRenderer) {
          this.waterRenderer.update();
        }
        requestAnimationFrame(animLoop);
      };
      animLoop();
    }

    window.addEventListener('resize', () => updateFishingLine());
    requestAnimationFrame(() => updateFishingLine());
    setTimeout(() => updateFishingLine(), 150);
  }

  updateFisherman() {
    // Atualiza cores da linha, brilhos e a isca no anzol submerso
    updateRodSVG(this.selectedRodId, this.selectedBaitId);
    // Posiciona e alinha a linha de pesca descendo verticalmente da superfície até a isca
    updateFishingLine();
  }

  renderPlayerName() {
    // Mantido por compatibilidade
  }

  // ═══════════════════════════════════════════
  // CICLO DIA / TARDE / NOITE (AUTOMÁTICO 5 MIN)
  // ═══════════════════════════════════════════
  getRawMsRemaining() {
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const virtualNow = Date.now() + (this.timeOffsetMs || 0);
    return PHASE_DURATION_MS - (virtualNow % PHASE_DURATION_MS);
  }

  getCycleTimeOfDay() {
    // Cada fase dura exatamente 5 minutos (300.000 ms)
    // Sincronizado globalmente via timestamp com suporte a offset de pulo: 0 = day, 1 = sunset, 2 = night
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const phases = ['day', 'sunset', 'night'];
    const virtualNow = Date.now() + (this.timeOffsetMs || 0);
    const phaseIndex = Math.floor(virtualNow / PHASE_DURATION_MS) % phases.length;
    return phases[phaseIndex];
  }

  getTimeRemainingInPhase() {
    const msRemaining = this.getRawMsRemaining();
    const min = Math.floor(msRemaining / 60000);
    const sec = Math.floor((msRemaining % 60000) / 1000);
    return {
      min,
      sec,
      text: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    };
  }

  skipTimeOfDay() {
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const msRemaining = this.getRawMsRemaining();
    // Adiciona o tempo restante da fase atual + 50ms para avançar para o início da próxima
    this.timeOffsetMs = (this.timeOffsetMs || 0) + msRemaining + 50;
    const newPhase = this.getCycleTimeOfDay();
    this.timeOfDay = newPhase;
    this.applyTimeOfDay();
    if (typeof sound !== 'undefined') {
      sound.playUpgrade?.() || sound.playClick?.();
    }
    const msgs = {
      day: 'Horário pulado para: DIA ☀️ (05:00)',
      sunset: 'Horário pulado para: PÔR DO SOL 🌅 (05:00)',
      night: 'Horário pulado para: NOITE 🌙 (05:00)'
    };
    this.showToast(msgs[newPhase] || `Horário pulado para: ${newPhase.toUpperCase()}`, 'info');
    this.saveGame();
    return newPhase;
  }

  showTimeOfDayStatus() {
    sound.playClick?.();
    if (this.currentWorld === 2) {
      const curBiome = WORLD2_BIOMES.find(b => b.id === this.activeWorld2Biome) || WORLD2_BIOMES[0];
      const rem = this.getWorld2BiomeRemaining();
      const biomeIds = ['recife_bioluminescente', 'fendas_vulcanicas', 'cemiterio_naufragios', 'zona_hadal'];
      const nextIdx = (biomeIds.indexOf(this.activeWorld2Biome) + 1) % biomeIds.length;
      const nextBiome = WORLD2_BIOMES.find(b => b.id === biomeIds[nextIdx]) || WORLD2_BIOMES[0];
      this.showToast(`Região: ${curBiome.icon} ${curBiome.name} (${curBiome.depth} · ${curBiome.pressure}) | Muda para ${nextBiome.name} em ${rem.text} (5m)`, 'info');
      return;
    }
    const rem = this.getTimeRemainingInPhase();
    const names = { day: 'DIA ☀️', sunset: 'PÔR DO SOL 🌅', night: 'NOITE 🌙' };
    const nextNames = { day: 'Pôr do Sol 🌅', sunset: 'Noite 🌙', night: 'Dia ☀️' };
    const currName = names[this.timeOfDay] || (this.timeOfDay || 'DIA').toUpperCase();
    const nextName = nextNames[this.timeOfDay] || 'Próximo';
    this.showToast(`Horário atual: ${currName} | Muda para ${nextName} em ${rem.text} (aguarde os 5m)`, 'info');
  }

  updateDiverVisual() {
    const isDiverActive = (this.upgradeLevels?.auto_pescador || 0) > 0 && !!this.autoFisherEnabled;
    this.waterRenderer?.setDiverActive(isDiverActive);
  }

  setTimeOfDay(targetPhase) {
    const phases = ['day', 'sunset', 'night'];
    const p = (targetPhase || '').toLowerCase();
    if (!phases.includes(p)) return false;
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const currPhase = this.getCycleTimeOfDay();
    const currIdx = phases.indexOf(currPhase);
    const targetIdx = phases.indexOf(p);
    const neededSteps = (targetIdx - currIdx + phases.length) % phases.length;

    const msRemaining = this.getRawMsRemaining();
    if (neededSteps === 0) {
      // Reinicia os 5 minutos da fase atual
      const virtualNow = Date.now() + (this.timeOffsetMs || 0);
      const elapsed = virtualNow % PHASE_DURATION_MS;
      this.timeOffsetMs = (this.timeOffsetMs || 0) - elapsed;
    } else {
      this.timeOffsetMs = (this.timeOffsetMs || 0) + msRemaining + (neededSteps - 1) * PHASE_DURATION_MS + 50;
    }

    this.timeOfDay = p;
    this.applyTimeOfDay();
    if (typeof sound !== 'undefined') {
      sound.playUpgrade?.() || sound.playClick?.();
    }
    const msgs = {
      day: 'Horário definido para: DIA ☀️ (05:00)',
      sunset: 'Horário definido para: PÔR DO SOL 🌅 (05:00)',
      night: 'Horário definido para: NOITE 🌙 (05:00)'
    };
    this.showToast(msgs[p] || `Horário: ${p.toUpperCase()}`, 'info');
    this.saveGame();
    return true;
  }

  initTimeOfDay() {
    const phases = ['day', 'sunset', 'night'];
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const cycleLen = phases.length * PHASE_DURATION_MS;

    // Se temos um horário salvo válido, garantimos que ao dar F5 voltamos exatamente para ele!
    if (this.timeOfDay && phases.includes(this.timeOfDay)) {
      const targetIndex = phases.indexOf(this.timeOfDay);
      let rem = this.savedPhaseMsRemaining;

      if (typeof rem !== 'number' || isNaN(rem) || rem <= 0) {
        rem = PHASE_DURATION_MS;
      } else if (this.timeSavedAt) {
        const elapsed = Date.now() - this.timeSavedAt;
        if (elapsed > 0) {
          if (rem - elapsed > 1000) {
            rem = rem - elapsed;
          } else {
            rem = PHASE_DURATION_MS;
          }
        }
      }

      const now = Date.now();
      const currentCycleBase = Math.floor(now / cycleLen) * cycleLen;
      let targetVirtualNow = currentCycleBase + targetIndex * PHASE_DURATION_MS + (PHASE_DURATION_MS - rem);
      while (targetVirtualNow < now) {
        targetVirtualNow += cycleLen;
      }
      this.timeOffsetMs = targetVirtualNow - now;
    } else {
      this.timeOfDay = this.getCycleTimeOfDay();
    }

    this.applyTimeOfDay();
    this.startTimeCycleLoop();
  }

  startTimeCycleLoop() {
    if (this._timeCycleTimer) clearInterval(this._timeCycleTimer);

    // Checa a cada segundo se o horário deve virar
    this._timeCycleTimer = setInterval(() => {
      if (this.currentWorld === 2) return;
      const newTime = this.getCycleTimeOfDay();
      const remaining = this.getTimeRemainingInPhase();
      this.updateTimeIndicatorTooltip(remaining);

      if (newTime !== this.timeOfDay) {
        this.timeOfDay = newTime;
        this.applyTimeOfDay();
        this.saveGame();
        const msgs = {
          day: 'O sol nasceu! Agora é DIA ☀️',
          sunset: 'O entardecer chegou! Agora é PÔR DO SOL 🌅',
          night: 'A noite caiu! Agora é NOITE 🌙'
        };
        this.showToast(msgs[newTime] || `Horário: ${newTime.toUpperCase()}`, 'info');
      }
    }, 1000);

    this.updateTimeIndicatorTooltip(this.getTimeRemainingInPhase());
  }

  updateTimeIndicatorTooltip(remaining) {
    const btn = document.getElementById('btn-toggle-time');
    if (!btn) return;
    const names = { day: 'DIA', sunset: 'PÔR DO SOL', night: 'NOITE' };
    const nextNames = { day: 'Pôr do Sol', sunset: 'Noite', night: 'Dia' };
    const currName = names[this.timeOfDay] || this.timeOfDay;
    const nextName = nextNames[this.timeOfDay] || 'Próximo';
    btn.title = `Horário do Jogo: ${currName} (Muda para ${nextName} em ${remaining.text} - ciclo de 5m)`;
  }

  applyTimeOfDay() {
    const btn = document.getElementById('btn-toggle-time');
    const lakeArea = document.getElementById('fishing-lake-area');

    if (this.currentWorld === 2) {
      this.applyWorld2BiomeScenery(this.activeWorld2Biome);
      if (btn) {
        const curBiome = WORLD2_BIOMES.find(b => b.id === this.activeWorld2Biome) || WORLD2_BIOMES[0];
        btn.innerHTML = `<span class="text-sm select-none" style="image-rendering:pixelated;">${curBiome.icon || '🌊'}</span>`;
        const rem = this.getWorld2BiomeRemaining();
        btn.title = `Região Atual: ${curBiome.name} (${curBiome.depth} · ${curBiome.pressure})\nPróxima região em ${rem.text} (Ciclo de 5 min)`;
      }
      return;
    } else {
      document.getElementById('world2-lake-scenery')?.classList.add('hidden');
    }

    if (btn) {
      const icon = this.timeOfDay === 'day' ? (PIXEL_ICONS.day || PIXEL_ICONS.sun) :
                   this.timeOfDay === 'sunset' ? PIXEL_ICONS.sunset :
                   (PIXEL_ICONS.night || PIXEL_ICONS.moon);
      btn.innerHTML = icon;
      this.updateTimeIndicatorTooltip(this.getTimeRemainingInPhase());
    }

    if (this.waterRenderer) {
      this.waterRenderer.setTimeOfDay(this.timeOfDay);
    }

    if (lakeArea) {
      lakeArea.classList.remove('from-[#0a1628]', 'via-[#0c2040]', 'to-[#0e3a5f]',
                               'from-[#38bdf8]', 'via-[#0284c7]', 'to-[#0369a1]',
                               'from-[#ea580c]', 'via-[#9333ea]', 'to-[#1e1b4b]',
                               'bg-gradient-to-b');
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
  checkOfflineProgress(simulatedSec = null) {
    const autoLevel = this.upgradeLevels.auto_pescador || 0;
    const now = Date.now();
    const diffSec = simulatedSec !== null ? simulatedSec : Math.floor((now - (this.lastActiveTime || now)) / 1000);

    // Mínimo de 60 segundos de ausência para disparar recompensa
    if (diffSec < 60) return;

    let intervalSec = 45;
    let sourceText = 'A correnteza suave do lago fisgou peixes durante sua ausência!';

    if (autoLevel > 0 && this.autoFisherEnabled) {
      const u = UPGRADES.find(u => u.id === 'auto_pescador');
      intervalSec = u ? u.getValue(autoLevel) : 8;
      sourceText = 'Seu Mergulhador Amigo pescou no fundo do lago enquanto você esteve fora!';
    }

    const maxOfflineSec = 8 * 3600; // Máximo de 8 horas AFK
    const effectiveSec = Math.min(diffSec, maxOfflineSec);
    const totalCatchesSim = Math.floor(effectiveSec / intervalSec);
    if (totalCatchesSim <= 0) return;

    // Calcular ouro com amostragem inteligente para evitar travamento em longos períodos
    const buffs = this.getActiveBuffs();
    const sampleSize = Math.min(totalCatchesSim, 30);
    let sampleGold = 0;
    for (let i = 0; i < sampleSize; i++) {
      const f = this.rollFish(buffs);
      this.recordDiscovery(f);
      sampleGold += Math.round(f.baseValue * (1 + buffs.goldMultiplier));
    }

    let earnedGold = 0;
    if (totalCatchesSim <= sampleSize) {
      earnedGold = sampleGold;
    } else {
      const avgGold = sampleGold / sampleSize;
      earnedGold = Math.round(avgGold * totalCatchesSim);
    }

    // Formatar tempo ausente
    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    let timeStr = '';
    if (hours > 0) timeStr += `${hours}h `;
    timeStr += `${Math.max(1, minutes)}m`;

    // Atualizar e exibir modal
    const modal = document.getElementById('offline-modal');
    const timeEl = document.getElementById('offline-time-text');
    const sourceEl = document.getElementById('offline-source-text');
    const catchesEl = document.getElementById('offline-catches-text');
    const goldEl = document.getElementById('offline-gold-text');
    const collectBtn = document.getElementById('btn-collect-offline');

    if (modal && timeEl && catchesEl && goldEl && collectBtn) {
      timeEl.textContent = `Você esteve fora por ${timeStr}!`;
      if (sourceEl) sourceEl.textContent = sourceText;
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

  // Métodos de perfil desativados a pedido do usuário
  openProfile() {}
  closeProfile() {}
  renderProfileCustomizationOptions() {}
  updateProfilePreview() {}
  saveProfile() {}

  // ═══════════════════════════════════════════
  // SISTEMA DE OLHOS DE PEIXE (META-PROGRESSÃO 00:00)
  // ═══════════════════════════════════════════
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

  checkPatchNotesOnStartup() {
    try {
      const storageKey = 'fc_last_seen_patch_version';
      const lastSeen = localStorage.getItem(storageKey);
      if (lastSeen !== this.gameVersion) {
        // Registra a nova versão para que só exiba uma única vez após o update
        localStorage.setItem(storageKey, this.gameVersion);
        setTimeout(() => {
          this.openPatchNotesModal(true); // true = ativa o timer obrigatório de 5s para fechar
        }, 600);
      }
    } catch (e) {
      console.warn('Erro ao verificar notas de atualização:', e);
    }
  }

  openPatchNotesModal(withCooldown = false) {
    sound.playClick?.();
    const modal = document.getElementById('patch-notes-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    const btnClose = document.getElementById('btn-close-patch-notes');
    const btnCloseX = document.getElementById('btn-close-patch-notes-x');

    if (this.patchNotesTimerInterval) {
      clearInterval(this.patchNotesTimerInterval);
      this.patchNotesTimerInterval = null;
    }

    if (withCooldown) {
      this.patchNotesCooldownActive = true;
      let secondsLeft = 5;

      if (btnCloseX) {
        btnCloseX.style.display = 'none';
      }

      if (btnClose) {
        btnClose.disabled = true;
        btnClose.textContent = `ENTENDIDO (${secondsLeft}s)`;
        btnClose.style.opacity = '0.5';
        btnClose.style.cursor = 'not-allowed';
        btnClose.style.pointerEvents = 'none';
        btnClose.classList.remove('animate-pulse');
      }

      this.patchNotesTimerInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
          if (btnClose) btnClose.textContent = `ENTENDIDO (${secondsLeft}s)`;
        } else {
          clearInterval(this.patchNotesTimerInterval);
          this.patchNotesTimerInterval = null;
          this.patchNotesCooldownActive = false;

          if (btnClose) {
            btnClose.disabled = false;
            btnClose.textContent = 'ENTENDIDO';
            btnClose.style.opacity = '1';
            btnClose.style.cursor = 'pointer';
            btnClose.style.pointerEvents = 'auto';
            btnClose.classList.add('animate-pulse');
          }
          if (btnCloseX) {
            btnCloseX.style.display = '';
          }
          sound.playCatch?.();
        }
      }, 1000);
    } else {
      this.patchNotesCooldownActive = false;
      if (btnClose) {
        btnClose.disabled = false;
        btnClose.textContent = 'ENTENDIDO';
        btnClose.style.opacity = '1';
        btnClose.style.cursor = 'pointer';
        btnClose.style.pointerEvents = 'auto';
        btnClose.classList.remove('animate-pulse');
      }
      if (btnCloseX) {
        btnCloseX.style.display = '';
      }
    }
  }

  closePatchNotesModal() {
    if (this.patchNotesCooldownActive) return;
    if (this.patchNotesTimerInterval) {
      clearInterval(this.patchNotesTimerInterval);
      this.patchNotesTimerInterval = null;
    }
    sound.playClick?.();
    const modal = document.getElementById('patch-notes-modal');
    modal?.classList.add('hidden');
  }

  // ═══════════════════════════════════════════════
  // PESCA MAGNÉTICA (MAGNET FISHING)
  // ═══════════════════════════════════════════════

  checkDiverMagnetDiscovery() {
    return; // Desativado temporariamente
    const lvl = this.upgradeLevels.auto_pescador || 0;
    if (lvl <= 0 || !this.autoFisherEnabled) return;

    if (!this.magnetUnlocked) {
      // Chance do mergulhador achar o primeiro ímã (0.8%)
      const chance = 0.008;
      if (Math.random() < chance) {
        this.unlockMagnet(1);
      }
    } else if (this.magnetTier < 5) {
      // Chance de encontrar o próximo tier
      const nextTierData = MAGNET_TIERS.find(t => t.tier === this.magnetTier + 1);
      if (nextTierData) {
        let chance = nextTierData.findChance;
        if (this.isMuseumSetCompleted('floresta')) {
          chance *= 2.0; // Bônus da coleção da floresta
        }
        if (Math.random() < chance) {
          this.upgradeMagnetTier(this.magnetTier + 1);
        }
      }
    }
  }

  // ── MODOS DE JOGO (PESCARIA vs ÍMÃ) & NAVEGAÇÃO ──

  setGameMode(mode) {
    if (mode === 'ima' && !this.magnetUnlocked) {
      this.showToast('O Mergulhador Amigo ainda não achou um ímã nas profundezas!', 'warning');
      return;
    }
    this.gameMode = (mode === 'ima') ? 'ima' : 'pesca';
    sound.playClick?.();

    this.syncGameModeUI();

    if (this.gameMode === 'ima') {
      this.renderMagnetAll();
    } else {
      this.renderAll();
    }

    this.saveGame();
  }

  openMagnetModal() {
    this.setGameMode('ima');
  }

  closeMagnetModal() {
    this.setGameMode('pesca');
  }

  syncGameModeUI() {
    const isPesca = this.gameMode === 'pesca';

    // Barra de alternância desativada temporariamente para usuários
    const modeBar = document.getElementById('mode-switch-bar');
    if (modeBar) {
      modeBar.classList.add('hidden');
      modeBar.classList.remove('flex');
    }

    // Seletor de Cenários do Ímã
    const scenBar = document.getElementById('magnet-scenario-bar');
    if (scenBar) {
      scenBar.classList.toggle('hidden', isPesca);
    }

    // Centro: Lagos
    const fishLake = document.getElementById('fishing-lake-area');
    const magLake = document.getElementById('magnet-lake-area');
    if (fishLake) fishLake.classList.toggle('hidden', !isPesca);
    if (magLake) magLake.classList.toggle('hidden', isPesca);

    // Centro: Barras de Estatísticas
    const statsFish = document.getElementById('stats-bar-fishing');
    const statsMag = document.getElementById('stats-bar-magnet');
    if (statsFish) statsFish.classList.toggle('hidden', !isPesca);
    if (statsMag) statsMag.classList.toggle('hidden', isPesca);

    // Coluna Esquerda: Upgrades
    const pUpFish = document.getElementById('panel-upgrades-fishing');
    const pUpMag = document.getElementById('panel-upgrades-magnet');
    if (pUpFish) pUpFish.classList.toggle('hidden', !isPesca);
    if (pUpMag) pUpMag.classList.toggle('hidden', isPesca);

    // Coluna Direita: Inventário
    const pInvFish = document.getElementById('panel-inventory-fishing');
    const pInvMag = document.getElementById('panel-inventory-magnet');
    if (pInvFish) pInvFish.classList.toggle('hidden', !isPesca);
    if (pInvMag) pInvMag.classList.toggle('hidden', isPesca);
  }

  unlockMagnet(tier = 1) {
    this.magnetUnlocked = true;
    this.magnetTier = tier;
    sound.playRare?.();
    const tData = MAGNET_TIERS.find(t => t.tier === tier) || MAGNET_TIERS[0];
    this.showToast(`🧲 Pesca Magnética pronta: ${tData.name}!`, 'success');
    this.renderHeader();
    this.syncGameModeUI();
    this.saveGame();
  }

  upgradeMagnetTier(newTier) {
    if (newTier <= this.magnetTier) return;
    this.magnetTier = Math.min(5, newTier);
    sound.playRare?.();
    const tData = MAGNET_TIERS.find(t => t.tier === this.magnetTier) || MAGNET_TIERS[0];
    this.showToast(`🌟 O Mergulhador Amigo achou um ímã superior: ${tData.name} (${tData.power}x poder magnético)!`, 'success');
    this.renderHeader();
    if (this.gameMode === 'ima') {
      this.renderMagnetAll();
    }
    this.saveGame();
  }

  switchMagnetScenario(scenarioId) {
    if (this.isCastingMagnet) return;
    if (!MAGNET_SCENARIOS[scenarioId]) return;
    this.magnetScenario = scenarioId;
    sound.playClick?.();
    this.renderMagnetCenter();
    this.saveGame();
  }

  setMagnetLeftTab(tabName) {
    this.magnetLeftTab = tabName;
    sound.playClick?.();
    this.renderMagnetLeftPanel();
    this.saveGame();
  }

  switchMagnetSubTab(tabName) {
    this.setMagnetLeftTab(tabName);
  }

  renderMagnetAll() {
    this.renderMagnetCenter();
    this.renderMagnetLeftPanel();
    this.renderMagnetRightPanel();
    this.renderMagnetStatsBar();
  }

  renderMagnetCenter() {
    const tierData = MAGNET_TIERS.find(t => t.tier === this.magnetTier) || MAGNET_TIERS[0];
    const scen = MAGNET_SCENARIOS[this.magnetScenario] || MAGNET_SCENARIOS.ponte;

    const lake = document.getElementById('magnet-lake-area');
    if (lake) {
      if (this.magnetScenario === 'praia') {
        lake.style.background = 'linear-gradient(to bottom, #0284c7 0%, #06b6d4 50%, #065f46 100%)';
      } else if (this.magnetScenario === 'floresta') {
        lake.style.background = 'linear-gradient(to bottom, #022c22 0%, #064e3b 45%, #0f172a 100%)';
      } else {
        lake.style.background = 'linear-gradient(to bottom, #090d16 0%, #0369a1 60%, #021f2f 100%)';
      }
    }

    // Alternar as camadas de fundo pixel art
    ['ponte', 'praia', 'floresta'].forEach(id => {
      const bg = document.getElementById(`magnet-bg-${id}`);
      if (bg) {
        if (this.magnetScenario === id) {
          bg.classList.remove('hidden');
        } else {
          bg.classList.add('hidden');
        }
      }
    });

    const tagline = document.getElementById('magnet-scene-tagline');
    if (tagline) {
      const iconSVG = this.magnetScenario === 'praia' ? PIXEL_ICONS.scenPraia : this.magnetScenario === 'floresta' ? PIXEL_ICONS.scenFloresta : PIXEL_ICONS.scenPonte;
      tagline.innerHTML = `<span class="inline-flex items-center gap-1.5">${iconSVG} <span>${scen.name}: ${scen.tagline}</span></span>`;
    }

    const tierInfo = document.getElementById('magnet-scene-tier-info');
    if (tierInfo) tierInfo.textContent = `Ímã T${this.magnetTier} (${tierData.power.toFixed(1)}x Poder)`;

    const hangingSprite = document.getElementById('magnet-hanging-sprite');
    if (hangingSprite) {
      hangingSprite.innerHTML = getMagnetSpriteSVG(this.magnetTier, 48);
    }

    ['ponte', 'praia', 'floresta'].forEach(id => {
      const btn = document.getElementById(`btn-scenario-${id}`);
      if (!btn) return;
      if (this.magnetScenario === id) {
        btn.className = 'inline-flex items-center gap-1 px-2 py-0.5 text-[7px] sm:text-[7.5px] font-bold border transition-all cursor-pointer bg-slate-800 text-cyan-300 border-cyan-400 shadow-[1px_1px_0_#000]';
      } else {
        btn.className = 'inline-flex items-center gap-1 px-2 py-0.5 text-[7px] sm:text-[7.5px] font-bold border transition-all cursor-pointer bg-slate-900 text-slate-400 border-transparent hover:text-slate-200';
      }
    });
  }

  renderMagnetLeftPanel() {
    const tierData = MAGNET_TIERS.find(t => t.tier === this.magnetTier) || MAGNET_TIERS[0];
    const subEl = document.getElementById('magnet-left-tier-subtitle');
    const badgeEl = document.getElementById('magnet-left-tier-badge');
    if (subEl) subEl.textContent = `${tierData.name} (${tierData.power.toFixed(1)}x Poder)`;
    if (badgeEl) {
      badgeEl.textContent = `TIER ${this.magnetTier}`;
      badgeEl.style.borderColor = tierData.borderColor;
      badgeEl.style.color = tierData.color;
    }

    ['forge', 'museum', 'tiers'].forEach(t => {
      const btn = document.getElementById(`btn-mag-tab-${t}`);
      if (!btn) return;
      if (this.magnetLeftTab === t) {
        btn.className = 'tab-btn py-1.5 text-[8px] sm:text-[8.5px] font-bold bg-slate-700 text-amber-300 border border-amber-500/60 shadow-[1px_1px_0_#000]';
      } else {
        btn.className = 'tab-btn py-1.5 text-[8px] sm:text-[8.5px] font-bold text-slate-500 border border-transparent hover:text-slate-300';
      }
    });

    if (this.magnetLeftTab === 'forge') {
      this.renderMagnetForgeContent();
    } else if (this.magnetLeftTab === 'museum') {
      this.renderMagnetMuseumContent();
    } else if (this.magnetLeftTab === 'tiers') {
      this.renderMagnetTiersContent();
    }
  }

  renderMagnetForgeContent() {
    const container = document.getElementById('magnet-left-content');
    if (!container) return;

    let html = `
      <div class="bg-slate-950/80 p-2 border border-slate-800 text-[7.5px] text-slate-300 mb-2 flex items-center gap-1.5" style="font-family:var(--font-pixel);">
        ${PIXEL_ICONS.gear} <span>Use sucatas e minérios resgatados pelo ímã para forjar upgrades tecnológicos permanentes!</span>
      </div>
    `;

    FORGE_RECIPES.forEach(recipe => {
      const isCrafted = Boolean(this.forgeUpgrades[recipe.id]);
      let canCraft = !isCrafted;

      const matPills = Object.entries(recipe.materials).map(([matId, reqQty]) => {
        const curQty = this.magnetInventory[matId] || 0;
        const hasEnough = curQty >= reqQty;
        if (!hasEnough) canCraft = false;
        const item = MAGNET_ITEMS[matId];
        return `
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 border text-[7px] font-bold ${hasEnough ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-red-950 text-red-300 border-red-800'}" style="font-family:var(--font-pixel);">
            ${item ? getMagnetItemSpriteSVG(matId, 12) : ''} <span>${item ? item.name : matId}: ${curQty}/${reqQty}</span>
          </span>
        `;
      }).join(' ');

      html += `
        <div class="bg-slate-950/90 border-2 ${isCrafted ? 'border-emerald-500/80 bg-emerald-950/15' : 'border-slate-800'} p-2.5 space-y-2">
          <div class="flex items-start gap-2">
            <div class="w-8 h-8 bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
              ${getMagnetItemSpriteSVG(recipe.id, 24)}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <h4 class="text-[8.5px] font-bold ${isCrafted ? 'text-emerald-300' : 'text-slate-200'} truncate" style="font-family:var(--font-pixel);">${recipe.name}</h4>
                ${isCrafted ? '<span class="text-[6px] px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold shrink-0" style="font-family:var(--font-pixel);">ATIVO</span>' : ''}
              </div>
              <p class="text-[7px] text-slate-400 mt-0.5 leading-snug" style="font-family:var(--font-pixel);">${recipe.desc}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-1">
            ${matPills}
          </div>

          <div class="pt-1 border-t border-slate-800/80 flex justify-end">
            ${isCrafted
              ? '<span class="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-600 text-[7.5px] font-bold" style="font-family:var(--font-pixel);">✓ FORJADO</span>'
              : `<button onclick="window.game.craftForgeUpgrade('${recipe.id}')"
                  ${canCraft ? '' : 'disabled'}
                  class="pixel-btn w-full py-1.5 text-[7.5px] font-bold uppercase transition-all ${
                    canCraft
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[1px_1px_0_#000] cursor-pointer animate-pulse'
                      : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                  }" style="font-family:var(--font-pixel);">
                  FORJAR MELHORIA
                </button>`
            }
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderMagnetMuseumContent() {
    const container = document.getElementById('magnet-left-content');
    if (!container) return;

    let totalDonated = 0;
    Object.keys(MAGNET_ITEMS).forEach(id => {
      if (this.museumDonations[id]) totalDonated++;
    });

    let html = `
      <div class="bg-slate-950/80 p-2 border border-slate-800 text-[7.5px] text-slate-300 flex items-center justify-between mb-2" style="font-family:var(--font-pixel);">
        <span class="inline-flex items-center gap-1.5">${PIXEL_ICONS.book} <span>Doe relíquias para bônus permanentes!</span></span>
        <span class="text-amber-300 font-bold bg-amber-950 px-1.5 py-0.5 border border-amber-600/60">${totalDonated}/21 Doadas</span>
      </div>
    `;

    ['ponte', 'praia', 'floresta'].forEach(scenId => {
      const col = MUSEUM_COLLECTIONS[scenId];
      if (!col) return;

      const donatedCount = col.itemIds.filter(id => Boolean(this.museumDonations[id])).length;
      const isComplete = donatedCount === col.itemIds.length;
      const scenIcon = scenId === 'praia' ? PIXEL_ICONS.scenPraia : scenId === 'floresta' ? PIXEL_ICONS.scenFloresta : PIXEL_ICONS.scenPonte;

      html += `
        <div class="bg-slate-950/90 border-2 ${isComplete ? 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' : 'border-slate-800'} p-2.5 space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 flex items-center justify-center shrink-0">${scenIcon}</span>
              <div>
                <h4 class="text-[8.5px] font-bold ${isComplete ? 'text-amber-300' : 'text-slate-200'}" style="font-family:var(--font-pixel);">${col.name}</h4>
                <p class="text-[6.5px] text-slate-400" style="font-family:var(--font-pixel);">${col.rewardDesc}</p>
              </div>
            </div>
            <span class="px-1.5 py-0.5 text-[7px] font-bold border ${isComplete ? 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse' : 'bg-slate-900 text-slate-400 border-slate-700'}" style="font-family:var(--font-pixel);">
              ${donatedCount}/${col.itemIds.length} ${isComplete ? '★ ATIVO' : ''}
            </span>
          </div>

          <div class="grid grid-cols-7 gap-1 pt-1">
            ${col.itemIds.map(id => {
              const item = MAGNET_ITEMS[id];
              const isDone = Boolean(this.museumDonations[id]);
              return `
                <div title="${item.name} ${isDone ? '(Doado)' : '(Não doado)'}"
                  class="aspect-square bg-slate-900 border ${isDone ? 'border-amber-500 bg-amber-950/30' : 'border-slate-800 opacity-40'} flex items-center justify-center p-0.5 select-none">
                  ${isDone ? getMagnetItemSpriteSVG(id, 20) : PIXEL_ICONS.mysteryBox}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderMagnetTiersContent() {
    const container = document.getElementById('magnet-left-content');
    if (!container) return;

    let html = `
      <div class="bg-slate-950/80 p-2 border border-slate-800 text-[7.5px] text-slate-300 mb-2 flex items-center gap-1.5" style="font-family:var(--font-pixel);">
        ${PIXEL_ICONS.magnet} <span>Tiers superiores são encontrados exclusivamente com chances raras pelo Mergulhador Amigo!</span>
      </div>
    `;

    MAGNET_TIERS.forEach(t => {
      const isCurrent = this.magnetTier === t.tier;
      const isUnlocked = this.magnetTier >= t.tier;

      html += `
        <div class="bg-slate-950/90 border-2 ${isCurrent ? 'border-amber-400 bg-amber-950/20' : isUnlocked ? 'border-slate-700' : 'border-slate-800 opacity-60'} p-2.5 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
              ${getMagnetSpriteSVG(t.tier, 32)}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="text-[8.5px] font-bold" style="font-family:var(--font-pixel); color:${t.color};">${t.name}</h4>
                <span class="text-[6.5px] px-1 bg-slate-900 border text-slate-400" style="border-color:${t.borderColor}; font-family:var(--font-pixel);">T${t.tier}</span>
              </div>
              <p class="text-[7px] text-slate-400 mt-0.5" style="font-family:var(--font-pixel);">Poder: <b class="text-amber-300">${t.power.toFixed(1)}x</b> | Puxada: ${t.pullSpeedSec}s</p>
              <p class="text-[6.5px] text-slate-500 mt-0.5" style="font-family:var(--font-pixel);">${t.desc}</p>
            </div>
          </div>

          <div class="shrink-0 text-right">
            ${isCurrent
              ? '<span class="px-2 py-1 bg-amber-950 text-amber-300 border border-amber-500 text-[7px] font-bold animate-pulse" style="font-family:var(--font-pixel);">★ EQUIPADO</span>'
              : isUnlocked
                ? '<span class="px-2 py-1 bg-slate-900 text-slate-400 border border-slate-700 text-[7px] font-bold" style="font-family:var(--font-pixel);">DESBLOQUEADO</span>'
                : '<span class="px-1.5 py-0.5 bg-slate-950 text-slate-600 border border-slate-800 text-[6.5px]" style="font-family:var(--font-pixel);">BLOQUEADO</span>'
            }
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderMagnetRightPanel() {
    this.renderMagnetGrid();
    this.renderMagnetInspector();
  }

  renderMagnetStatsBar() {
    const catchEl = document.getElementById('stat-magnet-catches');
    const goldEl = document.getElementById('stat-magnet-gold');
    if (catchEl) catchEl.textContent = (this.magnetCatches || 0).toLocaleString('pt-BR');
    if (goldEl) goldEl.textContent = `${(this.magnetGoldEarned || 0).toLocaleString('pt-BR')} G`;
  }
  castMagnet() {
    if (this.isCastingMagnet) return;
    this.isCastingMagnet = true;
    sound.playClick?.();

    const tierData = MAGNET_TIERS.find(t => t.tier === this.magnetTier) || MAGNET_TIERS[0];
    const scen = MAGNET_SCENARIOS[this.magnetScenario] || MAGNET_SCENARIOS.ponte;
    const rope = document.getElementById('magnet-rope');
    const castBtn = document.getElementById('btn-cast-magnet');
    const castBtnText = document.getElementById('btn-cast-magnet-text');
    const statusBar = document.getElementById('magnet-status-bar');
    const catchToast = document.getElementById('magnet-catch-toast');

    if (catchToast) catchToast.classList.add('hidden');
    if (rope) rope.style.height = '120px';
    if (castBtn) {
      castBtn.classList.add('opacity-75', 'cursor-not-allowed');
      castBtn.disabled = true;
    }
    if (castBtnText) castBtnText.textContent = 'PUXANDO O ÍMÃ...';
    if (statusBar) {
      statusBar.textContent = `Ímã na água da ${scen.name}... Atraindo sucatas e minérios com ${tierData.power}x de poder!`;
    }

    let pullSec = tierData.pullSpeedSec;
    if (this.forgeUpgrades && this.forgeUpgrades['carretel_precisao']) {
      pullSec *= 0.75; // 25% mais rápido
    }

    setTimeout(() => {
      // Sorteia o item baseado no cenário e no poder do ímã
      const possibleItems = scen.lootIds
        .map(id => MAGNET_ITEMS[id])
        .filter(item => item && this.magnetTier >= item.minTier);

      // Pesos com bias do poder do ímã
      const weighted = possibleItems.map(it => {
        let w = it.weight;
        if (it.rarity === 'raro' || it.rarity === 'epico' || it.rarity === 'lendario' || it.rarity === 'mitico') {
          w = w * (1 + (tierData.power - 1) * 0.40);
        }
        return { item: it, weight: w };
      });

      const totalW = weighted.reduce((acc, x) => acc + x.weight, 0);
      let r = Math.random() * totalW;
      let caught = possibleItems[0];
      for (const entry of weighted) {
        if (r <= entry.weight) {
          caught = entry.item;
          break;
        }
        r -= entry.weight;
      }

      // Adiciona ao inventário da Pesca Magnética
      this.magnetInventory[caught.id] = (this.magnetInventory[caught.id] || 0) + 1;
      this.magnetSelectedItemId = caught.id;
      this.magnetCatches = (this.magnetCatches || 0) + 1;

      // Animação de volta
      if (rope) rope.style.height = '48px';
      if (castBtn) {
        castBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        castBtn.disabled = false;
      }
      if (castBtnText) castBtnText.textContent = 'LANÇAR ÍMÃ';
      if (statusBar) {
        statusBar.textContent = `Resgatado com sucesso: ${caught.name}!`;
      }

      // Toast no topo do lago
      if (catchToast && this.settings.fishNotifications !== false) {
        const title = document.getElementById('magnet-catch-title');
        const desc = document.getElementById('magnet-catch-desc');
        if (title) title.innerHTML = `<span class="inline-flex items-center gap-1.5 justify-center">${getMagnetItemSpriteSVG(caught.id, 18)} <span>${caught.name}</span> <span class="text-[7px] text-amber-400">(${caught.rarity.toUpperCase()})</span></span>`;
        if (desc) desc.textContent = `${caught.desc} | Venda: ${caught.sellValue}G`;
        catchToast.classList.remove('hidden');
        setTimeout(() => catchToast.classList.add('hidden'), 3500);
      }

      sound.playRare?.();
      this.isCastingMagnet = false;
      this.renderMagnetRightPanel();
      this.renderMagnetLeftPanel();
      this.renderMagnetStatsBar();
      this.saveGame();
    }, pullSec * 1000);
  }

  renderMagnetGrid() {
    const container = document.getElementById('magnet-grid-slots');
    if (!container) return;

    let totalItems = 0;
    const itemIds = Object.keys(this.magnetInventory).filter(id => (this.magnetInventory[id] || 0) > 0);
    itemIds.forEach(id => {
      totalItems += this.magnetInventory[id];
    });

    const badge = document.getElementById('magnet-inv-badge');
    if (badge) {
      badge.textContent = `${totalItems} Itens`;
    }

    const minSlots = Math.max(16, Math.ceil((itemIds.length + 1) / 4) * 4);
    let html = '';

    itemIds.forEach(id => {
      const count = this.magnetInventory[id];
      const item = MAGNET_ITEMS[id];
      if (!item) return;

      const isSelected = this.magnetSelectedItemId === id;
      const rarityColors = {
        comum: '#64748b',
        incomum: '#10b981',
        raro: '#06b6d4',
        epico: '#a855f7',
        lendario: '#facc15',
        mitico: '#f43f5e'
      };
      const borderColor = rarityColors[item.rarity] || '#64748b';
      const isDonated = Boolean(this.museumDonations[id]);

      html += `
        <button onclick="window.game.selectMagnetItem('${id}')" title="${item.name} (${count}x)"
          class="relative aspect-square bg-slate-900 border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all hover:scale-105 select-none ${isSelected ? 'ring-2 ring-amber-400 bg-amber-950/40' : ''}"
          style="border-color: ${borderColor}; box-shadow: 2px 2px 0 #000;">
          <div class="flex items-center justify-center">${getMagnetItemSpriteSVG(item.id, 28)}</div>
          <span class="absolute bottom-0.5 right-1 text-[7px] font-bold text-white bg-slate-950/90 px-1 border border-slate-700" style="font-family:var(--font-pixel);">
            x${count}
          </span>
          ${isDonated ? '<span class="absolute top-0.5 left-1 text-[6.5px] leading-none text-amber-400" title="Já doado ao Museu">★</span>' : ''}
        </button>
      `;
    });

    // Slots vazios preenchedores
    const emptySlots = Math.max(0, minSlots - itemIds.length);
    for (let i = 0; i < emptySlots; i++) {
      html += `
        <div class="aspect-square bg-slate-950/60 border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-700 text-xs">
          ·
        </div>
      `;
    }

    container.innerHTML = html;
  }

  selectMagnetItem(itemId) {
    this.magnetSelectedItemId = itemId;
    sound.playClick?.();
    this.renderMagnetGrid();
    this.renderMagnetInspector();
  }

  renderMagnetInspector() {
    const item = MAGNET_ITEMS[this.magnetSelectedItemId];
    const iconEl = document.getElementById('magnet-inspector-icon');
    const nameEl = document.getElementById('magnet-inspector-name');
    const rarityEl = document.getElementById('magnet-inspector-rarity');
    const descEl = document.getElementById('magnet-inspector-desc');
    const actionsEl = document.getElementById('magnet-inspector-actions');

    if (!item || !this.magnetInventory[item.id]) {
      if (iconEl) iconEl.innerHTML = PIXEL_ICONS.mysteryBox;
      if (nameEl) nameEl.textContent = 'Selecione um item';
      if (rarityEl) rarityEl.textContent = '--';
      if (descEl) descEl.textContent = 'Clique em um slot do grid acima.';
      if (actionsEl) actionsEl.classList.add('hidden');
      return;
    }

    const count = this.magnetInventory[item.id] || 0;
    const isDonated = Boolean(this.museumDonations[item.id]);

    if (iconEl) iconEl.innerHTML = getMagnetItemSpriteSVG(item.id, 28);
    if (nameEl) nameEl.textContent = `${item.name} (${count}x)`;
    if (rarityEl) {
      rarityEl.textContent = item.rarity.toUpperCase();
      rarityEl.className = `text-[6px] px-1 py-0.2 border font-bold uppercase ${
        item.rarity === 'lendario' ? 'bg-amber-950 text-amber-300 border-amber-500' :
        item.rarity === 'epico' ? 'bg-purple-950 text-purple-300 border-purple-500' :
        item.rarity === 'raro' ? 'bg-cyan-950 text-cyan-300 border-cyan-500' :
        item.rarity === 'incomum' ? 'bg-emerald-950 text-emerald-300 border-emerald-500' :
        'bg-slate-800 text-slate-300 border-slate-600'
      }`;
    }
    if (descEl) {
      descEl.textContent = `${item.desc} | Venda: ${item.sellValue}G`;
    }

    if (actionsEl) {
      actionsEl.classList.remove('hidden');
      let actHtml = '';

      // Botão Doar ao Museu
      if (!isDonated && count >= 1) {
        actHtml += `
          <button onclick="window.game.donateToMuseum('${item.id}')" class="pixel-btn px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-slate-950 font-bold text-[7px]" style="font-family:var(--font-pixel);">
            🏛 DOAR (+500G +1 Olho)
          </button>
        `;
      } else if (isDonated) {
        actHtml += `
          <span class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-[6.5px]" style="font-family:var(--font-pixel);">
            ✓ DOADO
          </span>
        `;
      }

      // Se for cofre trancado
      if (item.isChest && count >= 1) {
        const hasGazua = Boolean(this.forgeUpgrades['gazua_mestre']);
        if (hasGazua) {
          actHtml += `
            <button onclick="window.game.openMagnetChest()" class="pixel-btn px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[7px] animate-pulse" style="font-family:var(--font-pixel);">
              🗝️ ABRIR COFRE
            </button>
          `;
        } else {
          actHtml += `
            <span class="px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-300 text-[6.5px]" style="font-family:var(--font-pixel);">
              🔒 REQUER GAZUA
            </span>
          `;
        }
      }

      // Botão Vender 1x
      if (count >= 1) {
        actHtml += `
          <button onclick="window.game.sellMagnetItem('${item.id}', 1)" class="pixel-btn px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[7px]" style="font-family:var(--font-pixel);">
            VENDER (+${item.sellValue}G)
          </button>
        `;
      }

      actionsEl.innerHTML = actHtml;
    }
  }

  donateToMuseum(itemId) {
    if ((this.magnetInventory[itemId] || 0) < 1) return;
    if (this.museumDonations[itemId]) {
      this.showToast('Este item já foi doado ao Museu!', 'info');
      return;
    }
    const item = MAGNET_ITEMS[itemId];
    if (!item) return;

    this.magnetInventory[itemId]--;
    this.museumDonations[itemId] = true;
    this.gold += 500;
    this.fishEyesCount = (this.fishEyesCount || 0) + 1;
    sound.playRare?.();
    this.showToast(`🏛️ Relíquia doada ao Museu! +500G e +1 Olho de Peixe!`, 'success');

    if (this.isMuseumSetCompleted(item.scenario)) {
      const col = MUSEUM_COLLECTIONS[item.scenario];
      sound.playLegendary?.();
      this.showToast(`🏆 CONJUNTO COMPLETO: ${col.name}! ${col.rewardDesc}`, 'success');
    }

    this.renderHeader();
    this.renderFishEyesBadge();
    this.renderMagnetRightPanel();
    this.renderMagnetLeftPanel();
    this.saveGame();
  }

  sellMagnetItem(itemId, count = 1) {
    const have = this.magnetInventory[itemId] || 0;
    if (have < count) return;
    const item = MAGNET_ITEMS[itemId];
    if (!item) return;

    const earned = item.sellValue * count;
    this.magnetInventory[itemId] -= count;
    this.gold += earned;
    this.totalGoldEarned += earned;
    this.magnetGoldEarned = (this.magnetGoldEarned || 0) + earned;
    sound.playCoin?.();
    this.showToast(`${count}x ${item.name} vendido(s) por +${earned.toLocaleString('pt-BR')}G!`, 'success');

    this.renderHeader();
    this.renderMagnetRightPanel();
    this.renderMagnetStatsBar();
    this.saveGame();
  }

  sellAllMagnetDuplicates() {
    let totalEarned = 0;
    let totalSold = 0;

    Object.keys(this.magnetInventory).forEach(id => {
      const count = this.magnetInventory[id] || 0;
      const item = MAGNET_ITEMS[id];
      if (!item || count <= 1) return;

      const isDonated = Boolean(this.museumDonations[id]);
      const toSell = isDonated ? count : count - 1;

      if (toSell > 0) {
        const earned = item.sellValue * toSell;
        totalEarned += earned;
        totalSold += toSell;
        this.magnetInventory[id] -= toSell;
      }
    });

    if (totalSold === 0) {
      this.showToast('Nenhuma sucata repetida para vender! (Itens únicos guardados para o Museu)', 'info');
      return;
    }

    this.gold += totalEarned;
    this.totalGoldEarned += totalEarned;
    this.magnetGoldEarned = (this.magnetGoldEarned || 0) + totalEarned;
    sound.playCoin?.();
    this.showToast(`💰 ${totalSold} sucatas repetidas vendidas por +${totalEarned.toLocaleString('pt-BR')}G!`, 'success');

    this.renderHeader();
    this.renderMagnetRightPanel();
    this.renderMagnetStatsBar();
    this.saveGame();
  }

  openMagnetChest() {
    if (!this.forgeUpgrades['gazua_mestre']) {
      this.showToast('Você precisa forjar a Gazua Mestre na Oficina para arrombar cofres!', 'warning');
      return;
    }
    if ((this.magnetInventory['cofre_trancado'] || 0) < 1) return;

    this.magnetInventory['cofre_trancado']--;

    const goldReward = Math.floor(6000 + Math.random() * 14000);
    const eyesReward = Math.floor(2 + Math.random() * 4);
    this.gold += goldReward;
    this.fishEyesCount = (this.fishEyesCount || 0) + eyesReward;

    const rareDrops = ['geodo_ametista', 'quartzo_prismatico', 'meteorito_espacial'];
    const bonusItem = rareDrops[Math.floor(Math.random() * rareDrops.length)];
    this.magnetInventory[bonusItem] = (this.magnetInventory[bonusItem] || 0) + 1;

    sound.playLegendary?.();
    this.showToast(`🔓 COFRE ARROMBADO! +${goldReward.toLocaleString('pt-BR')}G, +${eyesReward} Olhos e 1x ${MAGNET_ITEMS[bonusItem].name}!`, 'success');

    this.renderHeader();
    this.renderFishEyesBadge();
    this.renderMagnetRightPanel();
    this.renderMagnetLeftPanel();
    this.saveGame();
  }

  isMuseumSetCompleted(scenarioId) {
    const col = MUSEUM_COLLECTIONS[scenarioId];
    if (!col) return false;
    return col.itemIds.every(id => Boolean(this.museumDonations[id]));
  }

  craftForgeUpgrade(recipeId) {
    const recipe = FORGE_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;
    if (this.forgeUpgrades[recipeId]) {
      this.showToast('Esta melhoria já foi forjada e está ativa!', 'info');
      return;
    }

    for (const [matId, reqQty] of Object.entries(recipe.materials)) {
      const curQty = this.magnetInventory[matId] || 0;
      if (curQty < reqQty) {
        this.showToast(`Faltam materiais! Você precisa de ${reqQty}x ${MAGNET_ITEMS[matId]?.name || matId}.`, 'warning');
        return;
      }
    }

    for (const [matId, reqQty] of Object.entries(recipe.materials)) {
      this.magnetInventory[matId] -= reqQty;
    }

    this.forgeUpgrades[recipeId] = true;
    sound.playLegendary?.();
    this.showToast(`⚙️ SUCESSO! Você forjou: ${recipe.name}!`, 'success');

    this.renderHeader();
    this.renderBuffs();
    this.renderMagnetLeftPanel();
    this.renderMagnetRightPanel();
    this.saveGame();
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
        badge.className = 'min-w-[58px] text-center text-[7px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.5 border border-amber-800/80 animate-pulse shrink-0 whitespace-nowrap';
      } else {
        badge.className = 'min-w-[58px] text-center text-[7px] font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 border border-cyan-800/80 shrink-0 whitespace-nowrap';
      }
    }
  }

  renderFishEyesModal() {
    const availEl = document.getElementById('fe-available-count');
    if (availEl) availEl.textContent = this.fishEyesCount || 0;

    const alloc = this.fishEyesAllocated || { gold: 0, luck: 0, speed: 0, double: 0 };

    // Ouro: Base cap 200% no Mundo 1 e 250% no Mundo 2 + 1% por olho investido
    const isW2 = this.currentWorld === 2;
    const baseGold = isW2 ? 250 : 200;
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

    // Sorte: Base cap 200% no Mundo 1 e 250% no Mundo 2 + 1% por olho investido
    const baseLuck = isW2 ? 250 : 200;
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

    // Velocidade: Base cap 60% + 1% por olho
    const speedLvl = alloc.speed || 0;
    const speedBonus = speedLvl * 1;
    const speedCap = Math.min(85, 60 + speedBonus);
    const lvlSpeed = document.getElementById('fe-lvl-speed');
    if (lvlSpeed) lvlSpeed.textContent = `${speedLvl} Olho(s)`;
    const bonusSpeed = document.getElementById('fe-bonus-speed');
    if (bonusSpeed) bonusSpeed.textContent = `+${speedBonus}%`;
    const capSpeed = document.getElementById('fe-cap-speed');
    if (capSpeed) capSpeed.textContent = `${speedCap}%`;

    // Dupla: Base cap 60% + 1% por olho
    const doubleLvl = alloc.double || 0;
    const doubleBonus = doubleLvl * 1;
    const doubleCap = Math.min(90, 60 + doubleBonus);
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
  // ═════════════════════════════════════════════════════════════════════
  // OFERENDA SAGRADA DE ESPÉCIES (SANTUÁRIO DOS OLHOS DE PEIXE)
  // ═════════════════════════════════════════════════════════════════════
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
    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    const total = pool.length;
    const donatedCount = pool.filter(f => (this.speciesDonations && this.speciesDonations[f.id]) || (this.donatedSpeciesHistory && this.donatedSpeciesHistory[f.id])).length;

    const isOfferingUnlocked = Boolean(this.firstRarityCatches?.MITICO);

    const tabBtn = document.getElementById('tab-btn-fe-offering');
    if (tabBtn) {
      if (isOfferingUnlocked) {
        tabBtn.innerHTML = `<span>🏺</span> OFERENDA DE ESPÉCIES <span id="fe-offering-tab-badge" class="px-1 py-0.2 bg-amber-950 text-amber-300 text-[6.5px] border border-amber-600/80 font-mono">${donatedCount}/${total}</span>`;
      } else {
        tabBtn.innerHTML = `<span>🔒</span> OFERENDAS <span class="px-1 py-0.2 bg-pink-950 text-pink-300 text-[6.5px] border border-pink-700/80 font-mono">MÍTICO</span>`;
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
                <span class="text-[6.5px] uppercase font-bold tracking-wider px-1 py-0.5 border" style="color:${r.color};border-color:${r.border};background:rgba(0,0,0,0.4);">${r.label}</span>
              </div>
            </div>
          </div>

          <!-- Lado Direito: Ação / Status -->
          <div class="shrink-0 flex items-center justify-end pl-1">
            ${isDonated 
              ? '<span class="px-2.5 py-1.5 text-[7px] sm:text-[7.5px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-400 whitespace-nowrap shadow-[0_0_8px_rgba(16,185,129,0.3)]">✓ ENTREGUE</span>' 
              : (hasInBucket 
                  ? `<button onclick="window.game.donateFish('${fish.id}')" class="pixel-btn px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-[8px] cursor-pointer whitespace-nowrap shadow-[0_0_8px_rgba(245,158,11,0.4)] transition-transform active:scale-95">DOAR</button>` 
                  : '<span class="px-2 py-1.5 text-[6.5px] sm:text-[7px] font-bold text-slate-400 bg-slate-950 border border-slate-800 whitespace-nowrap">FALTA PESCAR</span>'
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

    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
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

    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
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

  // ═════════════════════════════════════════════════════════════════════
  // CICLO AUTOMÁTICO DE BIOMAS DO MUNDO 2 (5 MINUTOS) & CENÁRIOS RETRÔ
  // ═════════════════════════════════════════════════════════════════════
  getCycleWorld2Biome() {
    const BIOME_DURATION_MS = 5 * 60 * 1000;
    const biomeIds = ['recife_bioluminescente', 'fendas_vulcanicas', 'cemiterio_naufragios', 'zona_hadal'];
    const virtualNow = Date.now() + (this.world2BiomeOffsetMs || 0);
    const index = Math.floor(virtualNow / BIOME_DURATION_MS) % biomeIds.length;
    return biomeIds[index];
  }

  getWorld2BiomeRemaining() {
    const BIOME_DURATION_MS = 5 * 60 * 1000;
    const virtualNow = Date.now() + (this.world2BiomeOffsetMs || 0);
    const ms = BIOME_DURATION_MS - (virtualNow % BIOME_DURATION_MS);
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return {
      ms,
      min,
      sec,
      text: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    };
  }

  skipWorld2Biome() {
    const BIOME_DURATION_MS = 5 * 60 * 1000;
    const rem = this.getWorld2BiomeRemaining();
    this.world2BiomeOffsetMs = (this.world2BiomeOffsetMs || 0) + rem.ms + 50;
    const newBiomeId = this.getCycleWorld2Biome();
    this.activeWorld2Biome = newBiomeId;
    this.applyWorld2BiomeScenery(newBiomeId);
    const b = WORLD2_BIOMES.find(x => x.id === newBiomeId);
    sound.playUpgrade?.() || sound.playClick?.();
    this.showToast(`Bioma avançado para: ${b?.icon || '🌊'} ${b?.name || newBiomeId} (05:00)`, 'info');
    this.saveGame();
    this.renderAll();
  }

  setWorld2Biome(biomeId) {
    const biomeIds = ['recife_bioluminescente', 'fendas_vulcanicas', 'cemiterio_naufragios', 'zona_hadal'];
    const idx = biomeIds.indexOf(biomeId);
    if (idx === -1) return;
    const BIOME_DURATION_MS = 5 * 60 * 1000;
    const currBiome = this.getCycleWorld2Biome();
    const currIdx = biomeIds.indexOf(currBiome);
    const neededSteps = (idx - currIdx + biomeIds.length) % biomeIds.length;
    const rem = this.getWorld2BiomeRemaining();
    if (neededSteps === 0) {
      const virtualNow = Date.now() + (this.world2BiomeOffsetMs || 0);
      const elapsed = virtualNow % BIOME_DURATION_MS;
      this.world2BiomeOffsetMs = (this.world2BiomeOffsetMs || 0) - elapsed;
    } else {
      this.world2BiomeOffsetMs = (this.world2BiomeOffsetMs || 0) + rem.ms + (neededSteps - 1) * BIOME_DURATION_MS + 50;
    }
    this.activeWorld2Biome = biomeId;
    this.applyWorld2BiomeScenery(biomeId);
    this.saveGame();
    this.renderAll();
  }

  applyWorld2BiomeScenery(biomeId) {
    const sceneryContainer = document.getElementById('world2-lake-scenery');
    const lakeArea = document.getElementById('fishing-lake-area');
    if (!sceneryContainer) return;

    if (this.currentWorld !== 2) {
      sceneryContainer.classList.add('hidden');
      return;
    }

    sceneryContainer.classList.remove('hidden');

    const sceneryMap = {
      'recife_bioluminescente': 'scenery-recife',
      'fendas_vulcanicas': 'scenery-vulcanicas',
      'cemiterio_naufragios': 'scenery-naufragios',
      'zona_hadal': 'scenery-hadal'
    };

    const bgGradients = {
      'recife_bioluminescente': 'linear-gradient(to bottom, #011424 0%, #032b47 25%, #064a6d 60%, #086185 85%, #022538 100%)',
      'fendas_vulcanicas': 'linear-gradient(to bottom, #080302 0%, #1f0804 25%, #3d0c05 60%, #5c1407 85%, #120402 100%)',
      'cemiterio_naufragios': 'linear-gradient(to bottom, #01110d 0%, #02241b 30%, #043e30 65%, #065441 85%, #011c14 100%)',
      'zona_hadal': 'linear-gradient(to bottom, #010003 0%, #0c0117 25%, #1a0333 60%, #290452 85%, #040008 100%)'
    };

    Object.entries(sceneryMap).forEach(([bId, elemId]) => {
      const el = document.getElementById(elemId);
      if (el) {
        if (bId === biomeId) {
          el.classList.remove('hidden');
          el.style.opacity = '1';
        } else {
          el.classList.add('hidden');
          el.style.opacity = '0';
        }
      }
    });

    if (lakeArea && bgGradients[biomeId]) {
      lakeArea.style.background = bgGradients[biomeId];
    }
    this.waterRenderer?.setWorldMode(true, biomeId);
  }

  initWorld2BiomeCycle() {
    if (this._world2BiomeTimer) clearInterval(this._world2BiomeTimer);

    this._world2BiomeTimer = setInterval(() => {
      if (this.currentWorld === 2) {
        const rem = this.getWorld2BiomeRemaining();
        const autoBiome = this.getCycleWorld2Biome();
        const curBiome = WORLD2_BIOMES.find(x => x.id === this.activeWorld2Biome) || WORLD2_BIOMES[0];

        const btnTime = document.getElementById('btn-toggle-time');
        if (btnTime) {
          btnTime.title = `Região Atual: ${curBiome.name} (${curBiome.depth} · ${curBiome.pressure})\nPróxima região em ${rem.text} (Ciclo de 5 min)`;
        }

        if (autoBiome !== this.activeWorld2Biome) {
          this.activeWorld2Biome = autoBiome;
          this.syncWorld2UI();
          this.saveGame();
          const b = WORLD2_BIOMES.find(x => x.id === autoBiome);
          this.showToast(`🌊 O Batiscafo adentrou a região: ${b?.icon || ''} ${b?.name || autoBiome}!`, 'special');
        }
      }
    }, 1000);
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
      gold: 'Multiplicador de Ouro (+1% & +1% Cap)',
      luck: 'Bônus de Sorte (+1% & +1% Cap)',
      speed: 'Velocidade de Pesca (+1% & +1% Cap)',
      double: 'Pesca Dupla (+1% & +1% Cap)'
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

  // ═══════════════════════════════════════════
  // CONFIGURAÇÕES DO JOGO (MODAL)
  // ═══════════════════════════════════════════
  openSettings() {
    sound.playClick();
    this.renderSettingsModal();
    const m = document.getElementById('settings-modal');
    if (m) {
      m.classList.remove('hidden');
    }
  }

  closeSettings() {
    sound.playClick();
    const m = document.getElementById('settings-modal');
    if (m) {
      m.classList.add('hidden');
    }
  }

  toggleMainMenu(forceState) {
    const menu = document.getElementById('main-dropdown-menu');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    const shouldShow = forceState !== undefined ? forceState : isHidden;
    if (shouldShow) {
      sound.playClick();
      menu.classList.remove('hidden');
    } else {
      menu.classList.add('hidden');
    }
  }

  toggleSetting(key) {
    if (this.settings[key] === undefined) return;
    this.settings[key] = !this.settings[key];
    sound.playClick();
    this.applySettings();
    this.saveGame();
  }

  applySettings() {
    // Áudio
    sound.muted = !this.settings.sound;

    // Auras & Brilhos dos Peixes
    document.body.classList.toggle('disable-fish-glow', !this.settings.fishGlow);

    // Animações & Pulsação
    document.body.classList.toggle('disable-fish-animations', !this.settings.fishAnimations);

    // Partículas de Água
    const waterCanvas = document.getElementById('water-particles-canvas');
    if (waterCanvas) {
      waterCanvas.style.display = this.settings.waterParticles ? 'block' : 'none';
    }

    // Scanlines
    const lakeArea = document.getElementById('fishing-lake-area');
    if (lakeArea) {
      lakeArea.classList.toggle('scanlines', Boolean(this.settings.scanlines));
    }

    this.renderSettingsModal();
  }

  renderSettingsModal() {
    const updateBtn = (id, active) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.textContent = active ? '● ON' : '○ OFF';
      btn.className = `px-2.5 py-1 text-[8.5px] font-bold border transition-colors cursor-pointer shrink-0 ${
        active 
          ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
          : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-700'
      }`;
    };

    updateBtn('btn-setting-sound', this.settings.sound);
    updateBtn('btn-setting-fishGlow', this.settings.fishGlow);
    updateBtn('btn-setting-fishAnimations', this.settings.fishAnimations);
    updateBtn('btn-setting-waterParticles', this.settings.waterParticles);
    updateBtn('btn-setting-scanlines', this.settings.scanlines);
    updateBtn('btn-setting-fishNotifications', this.settings.fishNotifications !== false);
  }

  openConsoleFromSettings() {
    this.closeSettings();
    setTimeout(() => this.toggleConsole(true), 120);
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
      badge.className = 'min-w-[58px] text-center text-[7px] font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 border border-cyan-800/80 animate-pulse shrink-0 whitespace-nowrap';
    } else {
      const hasRod = this.unlockedRods.includes('vara_travessia');
      const hasBait = this.unlockedBaits.includes('essencia_travessia');
      const progress = (hasRod ? 1 : 0) + (hasBait ? 1 : 0);
      badge.textContent = progress > 0 ? `CAP. 1 (${progress}/2)` : 'CAP. 1';
      badge.className = 'min-w-[58px] text-center text-[7px] font-bold text-purple-300 bg-purple-950 px-1.5 py-0.5 border border-purple-800/80 shrink-0 whitespace-nowrap';
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
              : `<span class="text-[7px] text-slate-600 font-bold">✧</span>`
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

  // ═══════════════════════════════════════════
  // ÁLBUM DE PEIXES (ENCICLOPÉDIA)
  // ═══════════════════════════════════════════
  openAlbum() {
    sound.playClick();
    this.switchAlbumTab('fish');
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
    const activeList = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    const normalFish = activeList.filter(f => !f.secret);
    const secretFish = activeList.filter(f => f.secret);
    const discoveredNormal = normalFish.filter(f => this.discoveredFish[f.id]).length;
    const discoveredSecret = secretFish.filter(f => this.discoveredFish[f.id]).length;

    const baseTotal = normalFish.length;
    const totalDiscovered = discoveredNormal + discoveredSecret;
    const badge = document.getElementById('album-badge');
    const progText = document.getElementById('album-progress-text');
    const progBar = document.getElementById('album-progress-bar');

    if (discoveredSecret > 0) {
      if (badge) {
        badge.textContent = `${totalDiscovered}/${baseTotal}+`;
        badge.className = 'min-w-[58px] text-center text-[7px] font-bold text-red-300 bg-red-950 px-1.5 py-0.5 border border-red-800/80 animate-pulse shrink-0 whitespace-nowrap';
      }
      if (progText) {
        progText.innerHTML = `<span class="text-red-400 font-bold">🌌 ${totalDiscovered}/${baseTotal} (+${discoveredSecret} SECRETO)</span>`;
      }
      if (progBar) {
        progBar.style.width = '100%';
        progBar.className = 'h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-500';
      }
    } else {
      const str = `${discoveredNormal}/${baseTotal}`;
      if (badge) {
        badge.textContent = str;
        badge.className = 'min-w-[58px] text-center text-[7px] font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 border border-cyan-800/80 shrink-0 whitespace-nowrap';
      }
      if (progText) progText.textContent = `${str} (${Math.round((discoveredNormal/baseTotal)*100)}%)`;
      if (progBar) {
        progBar.style.width = `${(discoveredNormal/baseTotal)*100}%`;
        progBar.className = 'h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500';
      }
    }
  }

  switchAlbumTab(tab) {
    const tabFish = document.getElementById('tab-album-fish');
    const tabBuffs = document.getElementById('tab-album-buffs');
    const viewFish = document.getElementById('album-view-fish');
    const viewBuffs = document.getElementById('album-view-buffs');

    if (tab === 'fish') {
      tabFish?.classList.add('bg-cyan-950', 'text-cyan-300', 'border-cyan-500');
      tabFish?.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
      tabBuffs?.classList.remove('bg-cyan-950', 'text-cyan-300', 'border-cyan-500');
      tabBuffs?.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
      viewFish?.classList.remove('hidden');
      viewBuffs?.classList.add('hidden');
    } else {
      tabBuffs?.classList.add('bg-cyan-950', 'text-cyan-300', 'border-cyan-500');
      tabBuffs?.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
      tabFish?.classList.remove('bg-cyan-950', 'text-cyan-300', 'border-cyan-500');
      tabFish?.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
      viewBuffs?.classList.remove('hidden');
      viewFish?.classList.add('hidden');
      this.renderAlbumBuffs();
    }
    sound.playClick?.();
  }

  renderAlbum() {
    const grid = document.getElementById('album-grid');
    if (!grid) return;

    this.updateAlbumBadge();

    const activeList = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    const visibleList = activeList.filter(fish => !fish.secret || this.discoveredFish[fish.id]);

    let totalCatchesCount = 0;
    let unlockedAurasCount = 0;
    const totalSpecies = activeList.length;
    const discoveredCount = visibleList.filter(f => this.discoveredFish[f.id]).length;

    Object.values(this.discoveredFish || {}).forEach(d => {
      if (d) {
        totalCatchesCount += (d.count || 0);
        if (d.caughtBloodMoon) unlockedAurasCount++;
        if (d.caughtEclipse) unlockedAurasCount++;
      }
    });

    const statSpeciesEl = document.getElementById('album-stat-species');
    if (statSpeciesEl) statSpeciesEl.textContent = `${discoveredCount}/${totalSpecies}`;

    const statCatchesEl = document.getElementById('album-stat-catches');
    if (statCatchesEl) statCatchesEl.textContent = totalCatchesCount.toLocaleString('pt-BR');

    const statAurasEl = document.getElementById('album-stat-auras');
    if (statAurasEl) statAurasEl.textContent = `${unlockedAurasCount}/${totalSpecies * 2}`;

    grid.innerHTML = visibleList.map(fish => {
      const isDiscovered = !!this.discoveredFish[fish.id];
      const data = this.discoveredFish[fish.id] || { maxWeight: 0, count: 0, caughtBloodMoon: false, caughtEclipse: false };
      const r = RARITIES[fish.rarity] || RARITIES.COMUM;
      const spriteURL = isDiscovered ? this.getFishSpriteURL(fish.icon) : this.getFishSilhouetteURL(fish.icon);

      let timeBadge = '';
      if (fish.timeExclusive === 'day') {
        timeBadge = '<span class="text-[7.5px] sm:text-[8px] font-bold px-1.5 py-0.5 border text-amber-300 border-amber-500/80 bg-amber-950/80 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">☀️ DIA</span>';
      } else if (fish.timeExclusive === 'sunset') {
        timeBadge = '<span class="text-[7.5px] sm:text-[8px] font-bold px-1.5 py-0.5 border text-orange-300 border-orange-500/80 bg-orange-950/80 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">🌅 PÔR DO SOL</span>';
      } else if (fish.timeExclusive === 'night') {
        timeBadge = '<span class="text-[7.5px] sm:text-[8px] font-bold px-1.5 py-0.5 border text-indigo-300 border-indigo-500/80 bg-indigo-950/80 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">🌙 NOITE</span>';
      }

      let biomeBadge = '';
      if (fish.biome) {
        const bInfo = WORLD2_BIOMES.find(b => b.id === fish.biome);
        if (bInfo) {
          biomeBadge = `<span class="text-[7.5px] sm:text-[8px] font-bold px-1.5 py-0.5 border text-cyan-300 border-cyan-500/80 bg-cyan-950/80 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">${bInfo.icon} ${bInfo.shortName}</span>`;
        }
      }

      const isSecretCard = fish.secret && isDiscovered;

      return `
        <div class="p-2.5 sm:p-3 border-2 ${isDiscovered ? 'bg-slate-900/90' : 'bg-slate-950/70 border-slate-800 opacity-60'} flex items-start gap-3 pixel-border-thin min-w-0 ${isSecretCard ? 'shadow-[0_0_16px_rgba(220,38,38,0.45)]' : ''}" style="${isDiscovered ? `border-color:${r.border}; background:${r.bg};` : ''}">
          <div class="w-14 h-12 shrink-0 flex items-center justify-center ${isSecretCard ? 'bg-black border-2 border-red-600/90 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-slate-950/70 border border-slate-800'} p-1 mt-0.5">
            <img src="${spriteURL}" class="w-12 h-8 object-contain ${isDiscovered ? '' : 'brightness-0 contrast-200'} ${isSecretCard ? 'animate-pulse' : ''}" alt="${fish.name}" style="image-rendering:pixelated;">
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] sm:text-[11px] font-bold ${isDiscovered ? (isSecretCard ? 'text-red-300' : 'text-slate-100') : 'text-slate-500'} leading-tight break-words" style="font-family:var(--font-pixel);"><span class="text-slate-400 font-normal">#${fish.numId || '?'}</span> ${isDiscovered ? fish.name : '???'}</span>
              ${isSecretCard ? `
                <span class="text-[7.5px] sm:text-[8px] font-bold px-1.5 py-0.5 border text-red-300 border-red-500/80 bg-red-950/90 shrink-0 whitespace-nowrap shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" style="font-family:var(--font-pixel);">🌌 SECRETO</span>
              ` : `
                <span class="text-[7.5px] sm:text-[8px] font-bold px-1 py-0.5 border shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);color:${isDiscovered ? r.color : '#64748b'};border-color:${isDiscovered ? r.border : '#334155'};background:rgba(0,0,0,0.5);">${r.label}</span>
                ${timeBadge}
                ${biomeBadge}
              `}
            </div>
            ${isDiscovered ? `
              <div class="flex items-center justify-between text-[8px] sm:text-[8.5px] text-slate-300 mt-2 bg-slate-950/70 px-2 py-1 border border-slate-800/80" style="font-family:var(--font-pixel);">
                <div title="Maior peso capturado: ${data.maxWeight || 0}kg">
                  <span class="text-amber-400">★ Recorde:</span> <strong class="text-amber-300">${data.maxWeight || 0}kg</strong>
                </div>
                <div title="Total pescado: ${data.count || 1}">
                  <span class="text-cyan-400"># Pescados:</span> <strong class="text-cyan-300">${data.count || 1}x</strong>
                </div>
              </div>

              <!-- Registro de Auras Místicas Descobertas -->
              <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span class="text-[7px] sm:text-[7.5px] font-bold px-1.5 py-0.5 border ${data.caughtBloodMoon ? 'border-red-500 bg-red-950/90 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'border-slate-800 bg-slate-950/80 text-slate-600'} shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);" title="${data.caughtBloodMoon ? 'Capturado com Aura da Lua Sangrenta (+15% Ouro, +15% Sorte)' : 'Ainda não capturado com Aura da Lua Sangrenta'}">
                  🩸 ${data.caughtBloodMoon ? 'LUA SANGRENTA' : 'LUA SANGRENTA (?)'}
                </span>
                <span class="text-[7px] sm:text-[7.5px] font-bold px-1.5 py-0.5 border ${data.caughtEclipse ? 'border-red-700 bg-black/95 text-red-400 shadow-[0_0_8px_rgba(185,28,28,0.6)]' : 'border-slate-800 bg-slate-950/80 text-slate-600'} shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);" title="${data.caughtEclipse ? 'Capturado com Aura do Eclipse (+15% Vel., +15% Dupla)' : 'Ainda não capturado com Aura do Eclipse'}">
                  🌑 ${data.caughtEclipse ? 'ECLIPSE' : 'ECLIPSE (?)'}
                </span>
              </div>

              ${fish.buff ? `
                <div class="text-[8px] sm:text-[8.5px] ${isSecretCard ? 'text-red-300 bg-red-950/70 border-red-700/80' : 'text-purple-300 bg-purple-950/60 border-purple-800/60'} mt-1.5 px-2 py-1 border leading-relaxed break-words" style="font-family:var(--font-pixel);">
                  ★ ${fish.buff.text}
                </div>
              ` : ''}
              ${fish.desc ? `
                <p class="text-[8px] sm:text-[8.5px] text-slate-400 mt-1.5 leading-relaxed italic" style="font-family:var(--font-pixel);">${fish.desc}</p>
              ` : ''}
            ` : `
              <p class="text-[8px] text-slate-600 mt-2 font-mono" style="font-family:var(--font-pixel);">Espécie não descoberta</p>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  getFishSpriteURL(iconId) {
    if (!this._fishSpriteCache) this._fishSpriteCache = {};
    if (!this._fishSpriteCache[iconId]) {
      this._fishSpriteCache[iconId] = getFishDataURL(iconId, 3);
    }
    return this._fishSpriteCache[iconId];
  }

  getFishSilhouetteURL(iconId) {
    if (!this._fishSilhouetteCache) this._fishSilhouetteCache = {};
    if (!this._fishSilhouetteCache[iconId]) {
      this._fishSilhouetteCache[iconId] = getFishSilhouetteDataURL(iconId, 3);
    }
    return this._fishSilhouetteCache[iconId];
  }

  getBloodMoonSpriteURL(scale = 3.5) {
    if (!this._fishSpriteCache) this._fishSpriteCache = {};
    const key = `blood_moon_${scale}`;
    if (!this._fishSpriteCache[key]) {
      this._fishSpriteCache[key] = getBloodMoonFishDataURL(scale);
    }
    return this._fishSpriteCache[key];
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
        sacrificedFishCount: this.sacrificedFishCount || 0,
        currentWorld: this.currentWorld || 1,
        world1Data: this.world1Data || null,
        world2SavedData: this.world2SavedData || null,
        activeWorld2Biome: this.activeWorld2Biome || 'recife_bioluminescente',
        ascensionParts: this.ascensionParts || { bateria_neon: false, casco_titanio: false, helice_galeao: false, sistema_lastro_hadal: false },
        submarineAssembled: Boolean(this.submarineAssembled),
        timeOfDay: this.timeOfDay,
        timeOffsetMs: this.timeOffsetMs || 0,
        phaseMsRemaining: this.getRawMsRemaining(),
        timeSavedAt: Date.now(),
        speciesDonations: this.speciesDonations || {},
      donatedSpeciesHistory: this.donatedSpeciesHistory || {},
        offeringCycle: this.offeringCycle || 1,
        activeFishEyesTab: this.activeFishEyesTab || 'attributes',
        world2BiomeOffsetMs: this.world2BiomeOffsetMs || 0,
        fishEyesCount: this.fishEyesCount || 0,
        fishEyesTotal: this.fishEyesTotal || 0,
        fishEyesAllocated: this.fishEyesAllocated || { gold: 0, luck: 0, speed: 0, double: 0 },
        lastFishEyeDate: this.lastFishEyeDate || null,
        autoFisherEnabled: this.autoFisherEnabled,
        autoSellerEnabled: this.autoSellerEnabled,
        gameMode: this.gameMode || 'pesca',
        magnetLeftTab: this.magnetLeftTab || 'forge',
        magnetUnlocked: Boolean(this.magnetUnlocked),
        magnetTier: this.magnetTier || 1,
        magnetScenario: this.magnetScenario || 'ponte',
        magnetInventory: this.magnetInventory || {},
        museumDonations: this.museumDonations || {},
        forgeUpgrades: this.forgeUpgrades || {},
        magnetCatches: this.magnetCatches || 0,
        magnetGoldEarned: this.magnetGoldEarned || 0,
        firstRarityCatches: this.firstRarityCatches || { LENDARIO: false, MITICO: false, SECRETO: false },
        hasSeenBuffFishNotice: Boolean(this.hasSeenBuffFishNotice),
        settings: this.settings,
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
        this.sacrificedFishCount = typeof d.sacrificedFishCount === 'number' ? d.sacrificedFishCount : 0;
        this.currentWorld = typeof d.currentWorld === 'number' ? d.currentWorld : 1;
        this.world1Data = d.world1Data || null;
        this.world2SavedData = d.world2SavedData || null;
        this.activeWorld2Biome = d.activeWorld2Biome || 'recife_bioluminescente';
        this.ascensionParts = d.ascensionParts || { bateria_neon: false, casco_titanio: false, helice_galeao: false, sistema_lastro_hadal: false };
        this.submarineAssembled = Boolean(d.submarineAssembled);
        this.timeOfDay = d.timeOfDay || 'day';
        this.timeOffsetMs = d.timeOffsetMs || 0;
        this.savedPhaseMsRemaining = typeof d.phaseMsRemaining === 'number' ? d.phaseMsRemaining : null;
        this.timeSavedAt = typeof d.timeSavedAt === 'number' ? d.timeSavedAt : null;
        this.speciesDonations = (d.speciesDonations && typeof d.speciesDonations === 'object') ? d.speciesDonations : {};
        this.donatedSpeciesHistory = (d.donatedSpeciesHistory && typeof d.donatedSpeciesHistory === 'object') ? d.donatedSpeciesHistory : {};
        Object.keys(this.speciesDonations).forEach(k => { if (this.speciesDonations[k]) this.donatedSpeciesHistory[k] = true; });
        this.offeringCycle = typeof d.offeringCycle === 'number' ? d.offeringCycle : 1;
        this.activeFishEyesTab = d.activeFishEyesTab || 'attributes';
        this.world2BiomeOffsetMs = typeof d.world2BiomeOffsetMs === 'number' ? d.world2BiomeOffsetMs : 0;
        this.fishEyesCount = typeof d.fishEyesCount === 'number' ? d.fishEyesCount : 0;
        this.fishEyesTotal = typeof d.fishEyesTotal === 'number' ? d.fishEyesTotal : 0;
        this.fishEyesAllocated = d.fishEyesAllocated && typeof d.fishEyesAllocated === 'object'
          ? { gold: d.fishEyesAllocated.gold || 0, luck: d.fishEyesAllocated.luck || 0, speed: d.fishEyesAllocated.speed || 0, double: d.fishEyesAllocated.double || 0 }
          : { gold: 0, luck: 0, speed: 0, double: 0 };
        this.lastFishEyeDate = d.lastFishEyeDate || null;
        this.autoFisherEnabled = d.autoFisherEnabled !== undefined ? Boolean(d.autoFisherEnabled) : true;
        this.autoSellerEnabled = d.autoSellerEnabled !== undefined ? Boolean(d.autoSellerEnabled) : true;
        this.gameMode = d.gameMode || 'pesca';
        this.magnetLeftTab = d.magnetLeftTab || 'forge';
        this.magnetUnlocked = Boolean(d.magnetUnlocked);
        this.magnetTier = typeof d.magnetTier === 'number' ? Math.max(1, Math.min(5, d.magnetTier)) : 1;
        this.magnetScenario = d.magnetScenario || 'ponte';
        this.magnetInventory = (d.magnetInventory && typeof d.magnetInventory === 'object') ? d.magnetInventory : {};
        this.museumDonations = (d.museumDonations && typeof d.museumDonations === 'object') ? d.museumDonations : {};
        this.forgeUpgrades = (d.forgeUpgrades && typeof d.forgeUpgrades === 'object') ? d.forgeUpgrades : {};
        this.magnetCatches = typeof d.magnetCatches === 'number' ? d.magnetCatches : 0;
        this.magnetGoldEarned = typeof d.magnetGoldEarned === 'number' ? d.magnetGoldEarned : 0;
        this.firstRarityCatches = (d.firstRarityCatches && typeof d.firstRarityCatches === 'object')
          ? { LENDARIO: Boolean(d.firstRarityCatches.LENDARIO), MITICO: Boolean(d.firstRarityCatches.MITICO), SECRETO: Boolean(d.firstRarityCatches.SECRETO) }
          : { LENDARIO: false, MITICO: false, SECRETO: false };
        this.hasSeenBuffFishNotice = Boolean(d.hasSeenBuffFishNotice);

        // Retro-compatibilidade: se o save antigo não tinha firstRarityCatches ou se peixes dessas raridades já foram descobertos
        if (this.discoveredFish) {
          try {
            const allFishDefs = [...(typeof FISH_LIST !== 'undefined' ? FISH_LIST : []), ...(typeof FISH_WORLD_2 !== 'undefined' ? FISH_WORLD_2 : [])];
            allFishDefs.forEach(f => {
              if (['LENDARIO', 'MITICO', 'SECRETO'].includes(f.rarity) && this.discoveredFish[f.id]) {
                this.firstRarityCatches[f.rarity] = true;
              }
            });
          } catch(e) {}
        }

        // Retro-compatibilidade adicional: se o save legado já possuía Olhos de Peixe ou doações registradas
        if (((this.fishEyesTotal && this.fishEyesTotal > 0) || (this.fishEyesCount && this.fishEyesCount > 0)) && !this.firstRarityCatches.LENDARIO) {
          this.firstRarityCatches.LENDARIO = true;
        }
        if (this.donatedSpeciesHistory && Object.keys(this.donatedSpeciesHistory).length > 0 && !this.firstRarityCatches.MITICO) {
          this.firstRarityCatches.MITICO = true;
        }

        if (d.settings) {
          this.settings = { ...this.settings, ...d.settings };
        }
        this.lastActiveTime = d.lastActiveTime || Date.now();

        // Limpeza de chaves de versões legadas para liberar espaço do localStorage
        ['pescaria_clicker_save_v3', 'pescaria_clicker_save_v2', 'pescaria_clicker_save_v1'].forEach(k => {
          try { localStorage.removeItem(k); } catch (_) {}
        });

        // Retro-compatibilidade e sanitização das estatísticas do álbum
        Object.keys(this.discoveredFish).forEach(id => {
          const entry = this.discoveredFish[id];
          if (!entry || typeof entry !== 'object') {
            this.discoveredFish[id] = { maxWeight: 0, count: 1, caughtBloodMoon: false, caughtEclipse: false };
          } else {
            if (typeof entry.maxWeight !== 'number') entry.maxWeight = 0;
            if (typeof entry.count !== 'number') entry.count = 1;
            entry.caughtBloodMoon = Boolean(entry.caughtBloodMoon);
            entry.caughtEclipse = Boolean(entry.caughtEclipse);
          }
        });

        // Registrar auras já presentes nos peixes do inventário e aquário
        const currentFish = [...this.inventory, ...this.aquarium];
        currentFish.forEach(f => {
          if (f && f.id && this.discoveredFish[f.id]) {
            if (f.specialAura === 'lua_sangrenta') this.discoveredFish[f.id].caughtBloodMoon = true;
            if (f.specialAura === 'eclipse') this.discoveredFish[f.id].caughtEclipse = true;
          }
        });
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
    if (!b) return '';
    const cleanMap = {
      luck_bonus: 'Sorte',
      gold_multiplier: 'Ouro',
      fishing_speed: 'Vel. Pesca',
      double_catch_chance: 'Pesca Dupla',
      auto_fish_speed: 'Vel. Auto',
      all_stats: 'Todos Atributos'
    };
    if (b.type === 'mythic_mastery') {
      const base = b.value || 0.25;
      return `+${Math.round(base * 100)}% Ouro, +${Math.round(base * 0.6 * 100)}% Sorte, +${Math.round(base * 0.4 * 100)}% Pesca Dupla`;
    }
    if (cleanMap[b.type]) {
      const pct = Math.round((b.value || 0) * 100);
      return `+${pct}% ${cleanMap[b.type]}`;
    }
    let txt = b.text || '';
    txt = txt.replace(/Sorte\s+(Abissal|no Abismo|no Vazio|Pirata|nas Trevas)/gi, 'Sorte')
             .replace(/Ouro\s+(no Abismo|dos Corais|Abissal|de Naufrágio|de Naufrágios)/gi, 'Ouro')
             .replace(/Velocidade\s+Subaquática/gi, 'Vel. Pesca')
             .replace(/Velocidade\s+de\s+Isca/gi, 'Vel. Pesca')
             .replace(/Agilidade\s+Hadal/gi, 'Vel. Pesca')
             .replace(/Captura\s+Dupla/gi, 'Pesca Dupla')
             .replace(/Pesca\s+Automática/gi, 'Vel. Auto')
             .replace(/Todos\s+os\s+Atributos\s+Submarinos/gi, 'Todos Atributos');
    return txt;
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

    // Buffs temporários (golden fish)
    const now = Date.now();
    this.tempBuffs.filter(b => b.endsAt > now).forEach(b => {
      if (b.type === 'gold_frenzy')   out.goldMultiplier += b.multiplier;
      if (b.type === 'luck_surge')    out.luckBonus += b.multiplier;
      if (b.type === 'speed_burst')   out.fishingSpeedBonus += b.multiplier;
      if (b.type === 'double_mania')  out.doubleCatchChance += b.multiplier;
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
      goldMultiplier: Math.min(out.goldMultiplier, goldCap),
      luckBonus: Math.min(out.luckBonus, luckCap),
      fishingSpeedBonus: Math.min(out.fishingSpeedBonus, speedCap),
      doubleCatchChance: Math.min(out.doubleCatchChance, doubleCap),
      autoFishSpeedBonus: Math.min(out.autoFishSpeedBonus, 0.65)
    };
  }

  // ── MECÂNICA DE PESCA ──
  fish(isAuto = false) {
    if (this.isFishing && !isAuto) return;

    // Se estiver usando a Isca do Kraken Ancestral, dispara o evento cinemático de transição
    if (this.selectedBaitId === 'isca_kraken_ancestral' && !isAuto) {
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
        this.checkFirstRarityCatch(fish);
        this.checkFirstBuffFishCatch(fish);
        if (this.currentWorld === 2) {
          this.checkSubmarinePartDrop(this.activeWorld2Biome || 'recife_bioluminescente');
        }
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
    this.checkAchievements();
  }

  rollFish(buffs) {
    const luck = 1 + buffs.luckBonus;
    // Sorte aplica-se mais fraco em raridades altas para dificultar
    const chances = {
      SECRETO:  (RARITIES.SECRETO?.chance || 0.015) * (1 + (luck - 1) * 0.3),
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

    let template;
    if (this.currentWorld === 2) {
      const activeBiome = this.activeWorld2Biome || 'recife_bioluminescente';
      const biomeFish = FISH_WORLD_2.filter(f => f.biome === activeBiome);
      const pool = biomeFish.filter(f => f.rarity === selectedRarity);
      template = pool[Math.floor(Math.random() * pool.length)] ||
                 biomeFish[Math.floor(Math.random() * biomeFish.length)] ||
                 FISH_WORLD_2[0];
    } else {
      const pool = FISH_LIST.filter(f => {
        if (f.rarity !== selectedRarity) return false;
        // Peixes exclusivos de horário só podem ser pescados em seu período do dia
        if (f.timeExclusive && f.timeExclusive !== this.timeOfDay) return false;
        return true;
      });
      template = pool[Math.floor(Math.random() * pool.length)] || FISH_LIST.find(f => f.rarity === selectedRarity) || FISH_LIST[0];
    }

    let weight = +(template.minWeight + Math.random() * (template.maxWeight - template.minWeight)).toFixed(2);
    if (this.forgeUpgrades && this.forgeUpgrades['linha_reforcada']) {
      weight = +(weight * 1.15).toFixed(2);
    }
    const weightFactor = weight / template.minWeight;
    const rawValue = Math.round(template.baseValue * Math.pow(weightFactor, 0.7));

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
          text: '+15% Vel. Pesca & +15% Dupla (Eclipse)'
        });
      } else if (auraRoll < 0.20) {
        specialAura = 'lua_sangrenta';
        generatedBuffs.push({
          type: 'event_blood_moon',
          value: 0.15,
          luck: 0.15,
          text: '+15% Ouro & +15% Sorte (Lua Sangrenta)'
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

  // ── AUTO FISH ──
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
          btn.className = 'px-1.5 py-0.5 border text-[7.5px] font-bold cursor-pointer transition-colors bg-red-950/90 text-red-300 border-red-700 hover:bg-red-900';
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
        btn.className = 'px-1.5 py-0.5 border text-[7.5px] font-bold cursor-pointer transition-colors bg-emerald-600 text-slate-950 border-emerald-400 hover:bg-emerald-500';
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

  // ── VENDA AUTOMÁTICA (PEIXARIA) ──
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
          btn.className = 'px-1.5 py-0.5 border text-[7.5px] font-bold cursor-pointer transition-colors bg-red-950/90 text-red-300 border-red-700 hover:bg-red-900';
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
        btn.className = 'px-1.5 py-0.5 border text-[7.5px] font-bold cursor-pointer transition-colors bg-emerald-600 text-slate-950 border-emerald-400 hover:bg-emerald-500';
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


  // ═══════════════════════════════════════════
  // MUNDO 2: SISTEMA DE BIOMAS & BATISCAFO
  // ═══════════════════════════════════════════
  switchWorld2Biome(biomeId) {
    const biome = WORLD2_BIOMES.find(b => b.id === biomeId);
    if (!biome) return;
    this.setWorld2Biome(biomeId);
    sound.playClick?.();
    sound.playWaterSplash?.();
    this.showToast(`🌊 Submergiu em: ${biome.name} (${biome.depth})`, 'special');
  }

  syncWorld2UI() {
    const isW2 = this.currentWorld === 2;
    const btnSubmarine = document.getElementById('btn-open-submarine');
    const btnChapter1 = document.getElementById('btn-open-chapter1');
    const fishermanPier = document.getElementById('fisherman-pier');
    const world2SubPier = document.getElementById('world2-sub-pier');
    const world1Stars = document.getElementById('world1-sky-stars');

    // Botão de ir para Mundo 3: Ocultado a pedido do usuário
    if (btnSubmarine) {
      btnSubmarine.classList.add('hidden');
      btnSubmarine.style.display = 'none';
    }

    if (isW2) {
      if (btnChapter1) btnChapter1.classList.add('hidden');
      if (fishermanPier) fishermanPier.classList.add('hidden');
      if (world2SubPier) world2SubPier.classList.remove('hidden');
      if (world1Stars) world1Stars.classList.add('hidden');

      this.waterRenderer?.setWorldMode(true, this.activeWorld2Biome);
      this.updateFisherman();
      this.updateDiverVisual();
      this.applyTimeOfDay();
      this.applyWorld2BiomeScenery(this.activeWorld2Biome);
    } else {
      if (fishermanPier) fishermanPier.classList.remove('hidden');
      if (world2SubPier) world2SubPier.classList.add('hidden');
      if (world1Stars) world1Stars.classList.remove('hidden');
      document.getElementById('world2-lake-scenery')?.classList.add('hidden');
      this.waterRenderer?.setWorldMode(false);
      this.updateFisherman();
      this.updateDiverVisual();
      this.applyTimeOfDay();
    }
  }

  renderWorld2BiomesTabs() {
    const container = document.getElementById('world2-biomes-tabs');
    if (!container) return;

    container.innerHTML = WORLD2_BIOMES.map(b => {
      const isActive = this.activeWorld2Biome === b.id;
      return `
        <button onclick="window.game.switchWorld2Biome('${b.id}')" 
          title="${b.name} (${b.depth} · ${b.pressure})\n${b.desc}" 
          class="pixel-btn px-2 py-1 text-[7px] sm:text-[7.5px] font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
            isActive 
              ? 'bg-cyan-950/90 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]' 
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200'
          }" style="font-family:var(--font-pixel);">
          <span>${b.icon}</span>
          <span>${b.shortName}</span>
        </button>
      `;
    }).join('');
  }

  checkSubmarinePartDrop(biomeId) {
    const part = ASCENSION_PARTS.find(p => p.biome === biomeId);
    if (!part || this.ascensionParts[part.id]) return;

    // 4% de chance por captura no bioma
    if (Math.random() < 0.04) {
      this.ascensionParts[part.id] = true;
      this.saveGame();
      setTimeout(() => {
        sound.playUpgrade?.();
        this.showToast(`★ PEÇA DO BATISCAFO RESGATADA: ${part.name}! ★`, 'legendary');
        this.syncWorld2UI();
      }, 400);
    }
  }

  openSubmarineModal() {
    sound.playClick?.();
    this.renderSubmarineModal();
    const modal = document.getElementById('submarine-modal');
    modal?.classList.remove('hidden');
  }

  closeSubmarineModal() {
    sound.playClick?.();
    const modal = document.getElementById('submarine-modal');
    modal?.classList.add('hidden');
  }

  renderSubmarineModal() {
    const grid = document.getElementById('submarine-parts-grid');
    const progEl = document.getElementById('submarine-parts-progress');
    const btnAssemble = document.getElementById('btn-assemble-submarine');

    const total = ASCENSION_PARTS.length;
    const foundCount = ASCENSION_PARTS.filter(p => this.ascensionParts[p.id]).length;

    if (progEl) {
      progEl.textContent = `PEÇAS COLETADAS: ${foundCount} / ${total}`;
    }

    if (grid) {
      grid.innerHTML = ASCENSION_PARTS.map(part => {
        const found = Boolean(this.ascensionParts[part.id]);
        const biome = WORLD2_BIOMES.find(b => b.id === part.biome);
        return `
          <div class="p-2.5 border-2 ${found ? 'bg-cyan-950/40 border-cyan-500/80' : 'bg-slate-950/80 border-slate-800 opacity-60'} flex items-center gap-2.5">
            <div class="w-9 h-9 flex items-center justify-center text-xl bg-slate-900 border border-slate-700 shrink-0">
              ${part.icon}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <h4 class="text-[8.5px] font-bold ${found ? 'text-cyan-300' : 'text-slate-400'} leading-tight truncate" style="font-family:var(--font-pixel);">${part.name}</h4>
                <span class="text-[6.5px] font-bold px-1 py-0.5 border shrink-0 ${found ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-red-950 text-red-400 border-red-800'}" style="font-family:var(--font-pixel);">
                  ${found ? 'RESGATADO' : 'PERDIDO'}
                </span>
              </div>
              <p class="text-[7.5px] text-slate-500 mt-1 leading-normal" style="font-family:var(--font-pixel);">${part.desc}</p>
              <div class="text-[6.5px] text-amber-400/90 mt-1 font-mono">Bioma: ${biome ? biome.shortName : '--'}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    if (btnAssemble) {
      if (this.submarineAssembled) {
        btnAssemble.disabled = false;
        btnAssemble.className = 'pixel-btn w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-[9.5px] border border-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.7)]';
        btnAssemble.textContent = '🌌 EXPEDIÇÃO AO MUNDO 3 PRONTA (EM BREVE)';
        btnAssemble.onclick = () => {
          sound.playUpgrade?.();
          this.showToast('🚀 O Batiscafo está 100% equipado para o MUNDO 3! A nova dimensão será liberada na próxima grande expansão!', 'legendary');
        };
      } else if (foundCount >= total) {
        btnAssemble.disabled = false;
        btnAssemble.className = 'pixel-btn w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-[9.5px] border border-cyan-400 cursor-pointer animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.8)]';
        btnAssemble.textContent = '🚀 MONTAR BATISCAFO & PREPARAR ASCENSÃO AO MUNDO 3!';
        btnAssemble.onclick = () => this.assembleSubmarine();
      } else {
        btnAssemble.disabled = true;
        btnAssemble.className = 'pixel-btn w-full py-2.5 bg-slate-800 text-slate-500 font-bold text-[9px] border border-slate-700 cursor-not-allowed';
        btnAssemble.textContent = `COLETE AS ${total - foundCount} PEÇAS RESTANTES`;
        btnAssemble.onclick = null;
      }
    }
  }

  assembleSubmarine() {
    sound.playUpgrade?.();
    this.submarineAssembled = true;
    this.saveGame();
    this.showToast('★ O BATISCAFO FOI CONSTRUÍDO! PREPARANDO ROTA PARA O MUNDO 3! ★', 'legendary');
    this.renderSubmarineModal();
    this.syncWorld2UI();
  }

  travelBetweenWorlds(targetWorld) {
    // Se estava no modo ímã, sempre restaura para o modo de pesca tradicional
    if (this.gameMode === 'ima') {
      this.gameMode = 'pesca';
      this.syncGameModeUI();
    }

    if (targetWorld === this.currentWorld) {
      this.renderAll();
      return;
    }
    sound.playUpgrade?.();

    if (this.currentWorld === 2 && targetWorld === 1) {
      // Salva snapshot do Mundo 2
      this.world2SavedData = {
        gold: this.gold,
        inventory: [...this.inventory],
        aquarium: [...this.aquarium],
        selectedRodId: this.selectedRodId,
        unlockedRods: [...this.unlockedRods],
        selectedBaitId: this.selectedBaitId,
        unlockedBaits: [...this.unlockedBaits],
        upgradeLevels: { ...this.upgradeLevels },
        activeWorld2Biome: this.activeWorld2Biome
      };

      // Restaura dados do Mundo 1
      if (!this.world1Data) {
        this.world1Data = {
          gold: 0,
          inventory: [],
          aquarium: [],
          selectedRodId: 'vara_bambu',
          unlockedRods: ['vara_bambu'],
          selectedBaitId: 'minhoca',
          unlockedBaits: ['minhoca'],
          upgradeLevels: { balde: 0, auto_pescador: 0, boia_sorte: 0, rede_dupla: 0, aquario_cap: 0, auto_vendedor: 0, ima_dourado: 0 }
        };
      }
      this.gold = this.world1Data.gold || 0;
      this.inventory = [...(this.world1Data.inventory || [])];
      this.aquarium = [...(this.world1Data.aquarium || [])];
      this.selectedRodId = this.world1Data.selectedRodId || 'vara_bambu';
      this.unlockedRods = [...(this.world1Data.unlockedRods || ['vara_bambu'])];
      this.selectedBaitId = this.world1Data.selectedBaitId || 'minhoca';
      this.unlockedBaits = [...(this.world1Data.unlockedBaits || ['minhoca'])];
      this.upgradeLevels = { ...this.world1Data.upgradeLevels };
      this.currentWorld = 1;
    } else if (this.currentWorld === 1 && targetWorld === 2) {
      // Salva snapshot do Mundo 1
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

      // Restaura ou inicializa dados do Mundo 2
      if (!this.world2SavedData) {
        this.world2SavedData = {
          gold: 0,
          inventory: [],
          aquarium: [],
          selectedRodId: 'vara_arpao_basico',
          unlockedRods: ['vara_arpao_basico'],
          selectedBaitId: 'isca_plankton_neon',
          unlockedBaits: ['isca_plankton_neon'],
          upgradeLevels: { balde: 0, auto_pescador: 0, boia_sorte: 0, rede_dupla: 0, aquario_cap: 0, auto_vendedor: 0, ima_dourado: 0 },
          activeWorld2Biome: 'recife_bioluminescente'
        };
      }
      this.gold = this.world2SavedData.gold || 0;
      this.inventory = [...(this.world2SavedData.inventory || [])];
      this.aquarium = [...(this.world2SavedData.aquarium || [])];
      this.selectedRodId = this.world2SavedData.selectedRodId || 'vara_arpao_basico';
      this.unlockedRods = [...(this.world2SavedData.unlockedRods || ['vara_arpao_basico'])];
      this.selectedBaitId = this.world2SavedData.selectedBaitId || 'isca_plankton_neon';
      this.unlockedBaits = [...(this.world2SavedData.unlockedBaits || ['isca_plankton_neon'])];
      this.upgradeLevels = { ...this.world2SavedData.upgradeLevels };
      this.activeWorld2Biome = this.world2SavedData.activeWorld2Biome || 'recife_bioluminescente';
      this.currentWorld = 2;
    }

    this.saveGame();
    this.closeSubmarineModal?.();
    this.showToast(targetWorld === 1 ? '☀️ Você emergiu na superfície! Bem-vindo de volta ao Mundo 1!' : '🌊 O Batiscafo afundou suavemente no Abismo do Mundo 2!', 'special');
    this.updateFisherman();
    this.renderAll();
  }

  // ── RENDER ──
  renderAll() {
    this.renderHeader();
    this.syncGameModeUI();
    this.syncWorld2UI();
    if (this.gameMode === 'ima') {
      this.renderMagnetAll();
    } else {
      this.renderUpgrades();
      this.renderInventory();
      this.renderAquarium();
      this.renderBuffs();
      this.renderStats();
    }
    this.updateAlbumBadge();
    this.updateChapter1Badge();
  }

  renderHeader() {
    const el = document.getElementById('player-gold');
    if (el) el.textContent = this.gold.toLocaleString('pt-BR') + ' G';
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

    if (b.goldMultiplier > 0)     pills.push(`<span class="buff-pill px-1.5 py-0.5 border border-amber-700 text-amber-300 text-[8px] font-bold" style="font-family:var(--font-pixel);">+${Math.round(b.goldMultiplier*100)}% OURO</span>`);
    if (b.luckBonus > 0)          pills.push(`<span class="buff-pill px-1.5 py-0.5 border border-purple-700 text-purple-300 text-[8px] font-bold" style="font-family:var(--font-pixel);">+${Math.round(b.luckBonus*100)}% SORTE</span>`);
    if (b.fishingSpeedBonus > 0)  pills.push(`<span class="buff-pill px-1.5 py-0.5 border border-cyan-700 text-cyan-300 text-[8px] font-bold" style="font-family:var(--font-pixel);">+${Math.round(b.fishingSpeedBonus*100)}% VEL</span>`);
    if (b.doubleCatchChance > 0)  pills.push(`<span class="buff-pill px-1.5 py-0.5 border border-emerald-700 text-emerald-300 text-[8px] font-bold" style="font-family:var(--font-pixel);">+${Math.round(b.doubleCatchChance*100)}% DUPLA</span>`);
    c.innerHTML = pills.length
      ? pills.join('')
      : '<span class="text-[8px] text-slate-600 italic" style="font-family:var(--font-pixel);">Nenhum buff ativo</span>';
  }

  renderUpgrades() {
    if (this.gameMode === 'ima') return;
    const list = document.getElementById('upgrades-content-list');
    if (!list) return;
    let html = '';

    if (this.activeTab === 'varas') {
      const rodList = this.currentWorld === 2 ? RODS_WORLD_2 : RODS;
      html = rodList.map(rod => {
        const owned = this.unlockedRods.includes(rod.id);
        const equipped = this.selectedRodId === rod.id;
        const afford = this.gold >= rod.price;
        const iconURL = getRodIconDataURL(rod.id, 2);
        const powerDisplay = rod.power ? `${rod.power}x` : `T${rod.tier || 1}`;
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
                  <span class="text-[8px] text-cyan-400" style="font-family:var(--font-pixel);">PWR:${powerDisplay}</span>
                  ${rod.luckBonus > 0 ? `<span class="text-[8px] text-purple-400" style="font-family:var(--font-pixel);">+${Math.round(rod.luckBonus*100)}%SRT</span>` : ''}
                  ${(rod.fishingSpeedBonus || rod.speedBonus) > 0 ? `<span class="text-[8px] text-cyan-300" style="font-family:var(--font-pixel);">+${Math.round((rod.fishingSpeedBonus || rod.speedBonus)*100)}%VEL</span>` : ''}
                  ${rod.doubleCatchChance > 0 ? `<span class="text-[8px] text-emerald-400" style="font-family:var(--font-pixel);">+${Math.round(rod.doubleCatchChance*100)}%DUP</span>` : ''}
                </div>
              </div>
            </div>
            <div class="mt-2">
              ${owned
                ? (equipped
                  ? `<button disabled class="pixel-btn w-full py-1 bg-amber-950/80 text-amber-300 text-[10px] border-amber-600 cursor-default" style="font-family:var(--font-pixel);">EM USO</button>`
                  : `<button onclick="window.game.equipRod('${rod.id}')" class="pixel-btn w-full py-1 bg-slate-700 text-slate-200 text-[10px] border-slate-600" style="font-family:var(--font-pixel);">EQUIPAR</button>`)
                : `<button onclick="window.game.buyRod('${rod.id}')" class="pixel-btn w-full py-1 ${afford ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-600 cursor-not-allowed'} text-[10px]" style="font-family:var(--font-pixel);">COMPRAR ${rod.price.toLocaleString('pt-BR')}G</button>`
              }
            </div>
          </div>`;
      }).join('');
    } else if (this.activeTab === 'iscas') {
      const baitList = this.currentWorld === 2 ? BAITS_WORLD_2 : BAITS.filter(bait => !bait.unbuyable || this.unlockedBaits.includes(bait.id));
      html = baitList.map(bait => {
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
                  ? `<button disabled class="pixel-btn w-full py-1 bg-cyan-950/80 text-cyan-300 text-[10px] border-cyan-600 cursor-default" style="font-family:var(--font-pixel);">EM USO</button>`
                  : `<button onclick="window.game.equipBait('${bait.id}')" class="pixel-btn w-full py-1 bg-slate-700 text-slate-200 text-[10px] border-slate-600" style="font-family:var(--font-pixel);">EQUIPAR</button>`)
                : `<button onclick="window.game.buyBait('${bait.id}')" class="pixel-btn w-full py-1 ${afford ? 'bg-cyan-600 text-slate-950' : 'bg-slate-800 text-slate-600 cursor-not-allowed'} text-[10px]" style="font-family:var(--font-pixel);">COMPRAR ${bait.price.toLocaleString('pt-BR')}G</button>`
              }
            </div>
          </div>`;
      }).join('');
    } else {
      const upgradeList = this.currentWorld === 2 ? UPGRADES_WORLD_2 : UPGRADES;
      html = upgradeList.map(u => {
        const lvl = this.upgradeLevels[u.id] || 0;
        const isMax = lvl >= u.maxLevel;
        const price = Math.round(u.basePrice * Math.pow(u.priceMultiplier, lvl));
        const afford = this.gold >= price;
        const iconURL = getUpgradeIconDataURL(u.id, 2);

        let toggleHtml = '';
        if (u.id === 'auto_pescador' && lvl > 0) {
          const isOn = this.autoFisherEnabled;
          toggleHtml = `
            <button onclick="window.game.toggleAutoFisher(event)" title="Ligar / Desligar Mergulhador Amigo" class="px-1.5 py-0.5 text-[7.5px] font-bold border transition-colors cursor-pointer shrink-0 ${isOn ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-700'}" style="font-family:var(--font-pixel);">
              ${isOn ? '● ON' : '○ OFF'}
            </button>`;
        } else if (u.id === 'auto_vendedor' && lvl > 0) {
          const isOn = this.autoSellerEnabled;
          toggleHtml = `
            <button onclick="window.game.toggleAutoSeller(event)" title="Ligar / Desligar Peixaria Automática" class="px-1.5 py-0.5 text-[7.5px] font-bold border transition-colors cursor-pointer shrink-0 ${isOn ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]' : 'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-700'}" style="font-family:var(--font-pixel);">
              ${isOn ? '● ON' : '○ OFF'}
            </button>`;
        }

        return `
          <div class="p-2.5 border-2 border-slate-800 bg-slate-900/80 pixel-border-thin">
            <div class="flex items-start gap-2">
              <div class="w-9 h-9 bg-slate-950 border border-slate-700 flex items-center justify-center p-1 shrink-0">
                <img src="${iconURL}" class="w-7 h-7 object-contain" alt="${u.name}" style="image-rendering:pixelated;">
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-1.5">
                  <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                    <h4 class="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-200 leading-snug break-words" style="font-family:var(--font-pixel);">${u.name}</h4>
                    ${toggleHtml}
                  </div>
                  <span class="text-[8px] text-cyan-400 bg-cyan-950/60 px-1 py-0.5 border border-cyan-800 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">LV.${lvl}/${u.maxLevel}</span>
                </div>
                <p class="text-[9px] sm:text-[10px] text-slate-500 mt-1 leading-normal" style="font-family:var(--font-pixel);">${u.desc}</p>
                ${lvl > 0 && u.id === 'ima_dourado' ? `<div class="text-[8px] text-amber-400 mt-1" style="font-family:var(--font-pixel);">⚡ Recarga: ${u.getValue(lvl)}s</div>` : ''}
              </div>
            </div>
            <div class="mt-2">
              ${isMax
                ? `<button disabled class="pixel-btn w-full py-1 bg-slate-900 text-slate-500 text-[10px] border-slate-800 cursor-default" style="font-family:var(--font-pixel);">MAX ★</button>`
                : `<button onclick="window.game.buyUpgrade('${u.id}')" class="pixel-btn w-full py-1 ${afford ? 'bg-emerald-600 text-slate-950' : 'bg-slate-800 text-slate-600 cursor-not-allowed'} text-[10px]" style="font-family:var(--font-pixel);">LV.${lvl+1} = ${price.toLocaleString('pt-BR')}G</button>`
              }
            </div>
          </div>`;
      }).join('');
    }

    list.innerHTML = html;
  }

  renderInventory() {
    if (this.gameMode === 'ima') return;
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
    const canSacrifice = this.unlockedRods.includes('vara_travessia') && 
                         this.unlockedBaits.includes('essencia_travessia') && 
                         (this.sacrificedFishCount || 0) < 15;

    // Ordenação configurável
    const rarityRank = { SECRETO: 7, MITICO: 6, LENDARIO: 5, EPICO: 4, RARO: 3, INCOMUM: 2, COMUM: 1 };
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
      const isTriple = buffsList.length >= 3;
      const isDouble = buffsList.length === 2;
      const auraClass = fish.specialAura === 'lua_sangrenta' ? 'aura-lua-sangrenta' : (fish.specialAura === 'eclipse' ? 'aura-eclipse' : '');
      const auraBadge = fish.specialAura === 'lua_sangrenta' 
        ? '<span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border border-red-500 bg-red-950/90 text-red-300 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel); box-shadow: 0 0 8px rgba(239,68,68,0.7);">🩸 LUA SANGRENTA</span>'
        : (fish.specialAura === 'eclipse'
          ? '<span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border border-red-700 bg-black/90 text-red-400 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel); box-shadow: 0 0 10px rgba(185,28,28,0.8);">🌑 ECLIPSE</span>'
          : '');

      return `
        <div class="group p-2 border-2 bg-slate-900/95 flex flex-col gap-1.5 rarity-${fish.rarity} ${auraClass} ${isTriple ? 'border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]' : (isDouble ? 'border-amber-400/80' : '')}" style="background:${r.bg};">
          <!-- Linha Superior: Ícone do Peixe + Nome + Raridade + Peso + Valor -->
          <div class="flex items-start gap-2.5 min-w-0 w-full">
            <div class="w-12 h-10 sm:w-13 sm:h-10 bg-black/40 border border-slate-700/60 flex items-center justify-center p-0.5 shrink-0">
              <img src="${spriteURL}" class="fish-icon-canvas max-w-full max-h-full object-contain ${isTriple ? 'animate-pulse' : ''}" alt="${fish.name}" style="image-rendering:pixelated;">
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[9.5px] sm:text-[10.5px] font-bold ${isTriple ? 'text-red-300' : 'text-slate-100'} leading-snug break-words" style="font-family:var(--font-pixel);">${fish.name}</span>
                <span class="text-[6.5px] sm:text-[7px] font-bold px-1 py-0.2 border shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);color:${r.color};border-color:${r.border};background:rgba(0,0,0,0.4);">${r.label}</span>
                ${auraBadge}
                ${isTriple ? '<span class="text-[6.5px] sm:text-[7px] font-bold px-1 py-0.2 border border-red-500 bg-red-950/80 text-red-300 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel);">🔥 TRIPLO</span>' : (isDouble ? '<span class="text-[6.5px] sm:text-[7px] font-bold px-1 py-0.2 border border-amber-400 bg-amber-950/80 text-amber-300 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel);">★ DUPLO</span>' : '')}
              </div>
              <div class="flex items-center gap-2.5 text-[8px] sm:text-[9px] text-slate-400 mt-1" style="font-family:var(--font-pixel);">
                <span>⚖️ ${fish.weight}kg</span>
                <span class="text-amber-300 font-bold">💰 ${sell.toLocaleString('pt-BR')} G</span>
              </div>
            </div>
          </div>

          <!-- Linha do Meio: Bônus e Atributos (se houver) -->
          ${hasBuff ? `
            <div class="bg-black/35 border border-slate-800/80 px-2 py-1 flex flex-col gap-0.5 text-[7.5px] sm:text-[8px]" style="font-family:var(--font-pixel);">
              ${buffsList.map(b => `<span class="${isTriple ? 'text-red-300' : 'text-purple-300'} leading-tight whitespace-normal">★ ${b.text} <span class="text-slate-500 text-[7px] font-normal">(Mova ao Aquário p/ ativar)</span></span>`).join('')}
            </div>
          ` : ''}

          <!-- Linha Inferior: Barra de Ações com largura total (sem colisão com o texto) -->
          <div class="flex items-center justify-end gap-1.5 w-full pt-1 border-t border-slate-800/80 flex-wrap">
            ${(Boolean(this.firstRarityCatches?.MITICO) && !this.speciesDonations?.[fish.id] && !this.donatedSpeciesHistory?.[fish.id]) ? `
              <button onclick="window.game.donateFish('${fish.id}', '${fish.uid}')" ${fish.locked ? 'disabled' : ''} title="Doar 1 exemplar desta espécie para o Santuário dos Olhos de Peixe" class="pixel-btn px-2 py-1 ${fish.locked ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 'bg-amber-950 border border-amber-500 text-amber-300 hover:bg-amber-900'} text-[7.5px] sm:text-[8px] font-bold shrink-0 flex items-center gap-1 cursor-pointer" style="font-family:var(--font-pixel);">
                <span>🏺</span><span>DOAR</span>
              </button>
            ` : ''}
            ${canSacrifice && (fish.rarity === 'LENDARIO' || fish.rarity === 'MITICO') ? `
              <button onclick="window.game.sacrificeSpecificFish('${fish.uid}')" ${fish.locked ? 'disabled' : ''} title="Sacrificar no Altar das Almas" class="pixel-btn px-2 py-1 ${fish.locked ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 'bg-purple-950 border border-rose-500 text-rose-300 hover:bg-rose-900'} text-[7.5px] sm:text-[8px] font-bold shrink-0 cursor-pointer" style="font-family:var(--font-pixel);">SACRIFICAR</button>
            ` : ''}
            ${hasBuff ? `<button onclick="window.game.moveToAquarium('${fish.uid}')" title="Mover ao Aquário para ativar os buffs" class="pixel-btn px-2 py-1 text-[7.5px] sm:text-[8px] font-bold bg-purple-950/80 border border-purple-500 text-purple-300 hover:bg-purple-900 shrink-0 cursor-pointer flex items-center gap-1" style="font-family:var(--font-pixel);"><span>🐠</span><span>AQUÁRIO</span></button>` : ''}
            <button onclick="window.game.toggleLockFish('${fish.uid}')" title="${fish.locked ? 'Destravar peixe' : 'Travar peixe'}" class="pixel-btn px-2 py-1 text-[10px] ${fish.locked ? 'bg-amber-950/90 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'} shrink-0 cursor-pointer">${fish.locked ? PIXEL_ICONS.lockClosed : PIXEL_ICONS.lockOpen}</button>
            <button onclick="window.game.sellFish('${fish.uid}')" ${fish.locked ? 'disabled' : ''} class="pixel-btn px-3 py-1 ${fish.locked ? 'bg-slate-800 text-slate-600 cursor-not-allowed border-slate-800' : 'bg-emerald-800 text-emerald-200 border-emerald-600 hover:bg-emerald-700'} text-[9px] sm:text-[10px] font-bold shrink-0 cursor-pointer" style="font-family:var(--font-pixel);">SELL</button>
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
          <p class="text-[10.5px] text-purple-300 font-bold" style="font-family:var(--font-pixel);">AQUÁRIO VAZIO</p>
          <p class="text-[8px] text-slate-400 mt-1" style="font-family:var(--font-pixel);">${maxAq} vagas · Buffs ativos apenas aqui</p>
          <p class="text-[7.5px] text-purple-400 mt-2" style="font-family:var(--font-pixel);">Mova seus melhores peixes do balde para ativar seus bônus!</p>
        </div>`;
      return;
    }

    const filter = this.aquariumFilterMode;
    const rarityRank = { SECRETO: 7, MITICO: 6, LENDARIO: 5, EPICO: 4, RARO: 3, INCOMUM: 2, COMUM: 1 };
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
      const isTriple = buffsList.length >= 3;
      const isDouble = buffsList.length === 2;
      const auraClass = fish.specialAura === 'lua_sangrenta' ? 'aura-lua-sangrenta' : (fish.specialAura === 'eclipse' ? 'aura-eclipse' : '');
      const auraBadge = fish.specialAura === 'lua_sangrenta' 
        ? '<span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border border-red-500 bg-red-950/90 text-red-300 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel); box-shadow: 0 0 8px rgba(239,68,68,0.7);">🩸 LUA SANGRENTA</span>'
        : (fish.specialAura === 'eclipse'
          ? '<span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border border-red-700 bg-black/90 text-red-400 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel); box-shadow: 0 0 10px rgba(185,28,28,0.8);">🌑 ECLIPSE</span>'
          : '');

      return `
        <div class="group p-2 border-2 bg-slate-900/90 flex items-center justify-between gap-1.5 sm:gap-2 rarity-${fish.rarity} ${auraClass} ${isTriple ? 'border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]' : (isDouble ? 'border-amber-400/80' : '')}" style="background:${r.bg};">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <img src="${spriteURL}" class="fish-icon-canvas w-11 h-7 sm:w-12 sm:h-8 object-contain shrink-0 ${isTriple ? 'animate-pulse' : ''}" alt="${fish.name}" style="image-rendering:pixelated;">
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline gap-1.5 flex-wrap">
                <span class="text-[9px] sm:text-[10px] font-bold ${isTriple ? 'text-red-300' : 'text-slate-100'} leading-snug break-words" style="font-family:var(--font-pixel);">${fish.name}</span>
                <span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);color:${r.color};border-color:${r.border};background:rgba(0,0,0,0.4);">${r.label}</span>
                ${auraBadge}
                ${isTriple ? '<span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border border-red-500 bg-red-950/80 text-red-300 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel);">🔥 TRIPLO</span>' : (isDouble ? '<span class="text-[7px] sm:text-[8px] font-bold px-1 py-0.5 border border-amber-400 bg-amber-950/80 text-amber-300 animate-pulse whitespace-nowrap shrink-0" style="font-family:var(--font-pixel);">★ DUPLO</span>' : '')}
                <span class="text-[7px] sm:text-[7.5px] font-bold px-1 py-0.2 border border-purple-500/80 bg-purple-950/80 text-purple-200 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">BUFF ATIVO</span>
              </div>
              <div class="flex items-center gap-1.5 text-[8px] text-slate-400 mt-1" style="font-family:var(--font-pixel);">
                <span>${fish.weight}kg</span>
              </div>
              <div class="flex flex-col gap-0.5 mt-1">
                ${buffsList.map(b => `<span class="text-[8px] ${isTriple ? 'text-red-300' : 'text-emerald-300'} leading-snug break-words" style="font-family:var(--font-pixel);">★ ${b.text}</span>`).join('')}
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
    const g = document.getElementById('player-gold') || document.getElementById('stat-total-gold');
    if (g) g.textContent = this.gold.toLocaleString('pt-BR') + ' G';
  }

  // ── EFEITOS VISUAIS ──
  createWaterRipple() {
    if (this.gameMode === 'ima') return;
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
    if (this.settings.fishNotifications === false) return;
    if (this.gameMode === 'ima') return;
    const c = document.getElementById('catch-toast-container');
    if (!c) return;
    const r = RARITIES[fish.rarity] || RARITIES.COMUM;
    const spriteURL = this.getFishSpriteURL(fish.icon);
    const buffsList = this.getFishBuffs(fish);
    const isTriple = buffsList.length >= 3;
    const isDouble = buffsList.length === 2;
    const auraClass = fish.specialAura === 'lua_sangrenta' ? 'aura-lua-sangrenta' : (fish.specialAura === 'eclipse' ? 'aura-eclipse' : '');
    const auraBadge = fish.specialAura === 'lua_sangrenta' 
      ? '<span class="text-[7px] font-bold px-1 py-0.5 border border-red-500 bg-red-950/90 text-red-300 animate-pulse whitespace-nowrap" style="font-family:var(--font-pixel); box-shadow: 0 0 8px rgba(239,68,68,0.7);">🩸 LUA SANGRENTA</span>'
      : (fish.specialAura === 'eclipse' 
        ? '<span class="text-[7px] font-bold px-1 py-0.5 border border-red-700 bg-black/90 text-red-400 animate-pulse whitespace-nowrap" style="font-family:var(--font-pixel); box-shadow: 0 0 10px rgba(185,28,28,0.8);">🌑 ECLIPSE</span>' 
        : '');

    const card = document.createElement('div');
    const borderClass = isTriple 
      ? 'ring-2 ring-red-600 shadow-[0_0_16px_rgba(220,38,38,0.7)]' 
      : (isDouble ? 'ring-2 ring-amber-400' : '');
    card.className = `catch-popup p-2.5 border-2 flex items-center gap-2 rarity-${fish.rarity} ${auraClass} ${borderClass}`;
    card.style.background = isTriple ? 'rgba(10,10,18,0.98)' : 'rgba(15,23,42,0.95)';
    card.style.borderColor = isTriple ? '#dc2626' : (isDouble ? '#f59e0b' : r.border);
    card.innerHTML = `
      <img src="${spriteURL}" class="fish-icon-canvas w-12 h-8 shrink-0 ${isTriple ? 'animate-pulse' : ''}" style="image-rendering:pixelated;">
      <div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-[8px] font-bold px-1 py-0.5 border" style="font-family:var(--font-pixel);color:${r.color};border-color:${r.border};background:rgba(0,0,0,0.4);">${r.label}</span>
          ${auraBadge}
          ${isTriple ? '<span class="text-[7px] font-bold px-1 py-0.5 border border-red-500 bg-red-950/90 text-red-300 animate-pulse whitespace-nowrap" style="font-family:var(--font-pixel);">🔥 BUFF TRIPLO!</span>' : (isDouble ? '<span class="text-[7px] font-bold px-1 py-0.5 border border-amber-400 bg-amber-950/80 text-amber-300 animate-pulse whitespace-nowrap" style="font-family:var(--font-pixel);">★ BUFF DUPLO!</span>' : '')}
          <span class="text-[8px] text-slate-400" style="font-family:var(--font-pixel);">${fish.weight}kg</span>
        </div>
        <h3 class="text-[11px] font-bold ${isTriple ? 'text-red-300' : 'text-slate-100'} mt-0.5" style="font-family:var(--font-pixel);">${fish.name}</h3>
        ${buffsList.map(b => `<p class="text-[8px] ${isTriple ? 'text-red-300' : 'text-purple-300'}" style="font-family:var(--font-pixel);">★ ${b.text}</p>`).join('')}
      </div>`;
    c.appendChild(card);
    setTimeout(() => card.remove(), isTriple ? 3000 : 2200);
  }

  showFloatingText(text, color = '#38bdf8', offY = 0) {
    const lake = document.getElementById(this.gameMode === 'ima' ? 'magnet-lake-area' : 'fishing-lake-area');
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
  // PEIXE DOURADO (Evento Rápido de Sorte)
  // ═══════════════════════════════════════════
  initGoldenFish() {
    this.scheduleNextGoldenFish();
  }

  scheduleNextGoldenFish() {
    const delay = (45 + Math.random() * 75) * 1000; // 45-120 segundos
    this.goldenFishTimer = setTimeout(() => this.spawnGoldenFish(), delay);
  }

  spawnGoldenFish(forceBloodMoon = false) {
    if (this.goldenFishActive) return;
    this.goldenFishActive = true;

    const lake = document.getElementById(this.gameMode === 'ima' ? 'magnet-lake-area' : 'fishing-lake-area');
    if (!lake) { this.goldenFishActive = false; this.scheduleNextGoldenFish(); return; }

    const isCosmic = isCosmicOrHigherRod(this.selectedRodId);
    let isBloodMoon = false;
    if (isCosmic || forceBloodMoon) {
      this.goldenFishCountSinceBlood = (this.goldenFishCountSinceBlood || 0) + 1;
      if (forceBloodMoon || this.goldenFishCountSinceBlood >= 10 || Math.random() < 0.10) {
        isBloodMoon = true;
        this.goldenFishCountSinceBlood = 0;
      }
    }

    const el = document.createElement('div');
    if (isBloodMoon) {
      el.id = 'blood-moon-fish-event';
      el.innerHTML = `<img src="${this.getBloodMoonSpriteURL(3.5)}" alt="Peixe da Lua Sangrenta" style="width:56px;height:38px;image-rendering:pixelated;filter:drop-shadow(0 0 14px #dc2626) drop-shadow(0 0 6px #7f1d1d);pointer-events:none;">`;
      el.style.cssText = `
        position:absolute; z-index:35; cursor:pointer; user-select:none;
        animation: goldenFishFloat 1.8s ease-in-out infinite, goldenFishShimmer 0.5s ease-in-out infinite alternate;
        transition: transform 0.15s, opacity 0.3s;
      `;
    } else {
      el.id = 'golden-fish-event';
      el.innerHTML = `<img src="${getFishDataURL('dourado', 3)}" alt="Golden Fish" style="width:48px;height:32px;image-rendering:pixelated;filter:drop-shadow(0 0 10px gold) drop-shadow(0 0 4px #ffd700);pointer-events:none;">`;
      el.style.cssText = `
        position:absolute; z-index:35; cursor:pointer; user-select:none;
        animation: goldenFishFloat 2s ease-in-out infinite, goldenFishShimmer 0.6s ease-in-out infinite alternate;
        transition: transform 0.15s, opacity 0.3s;
      `;
    }

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
      if (isBloodMoon) {
        this.triggerBloodMoonEclipse();
      } else {
        this.onGoldenFishClick();
      }
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
            if (isBloodMoon) {
              this.showFloatingText('🩸 LUA SANGRENTA!', '#ef4444', -40);
              this.showToast(`Ímã Dourado capturou o Peixe da Lua Sangrenta!`, 'error');
            } else {
              this.showFloatingText('★ ÍMÃ DOURADO!', '#ffd700', -40);
              this.showToast(`Ímã Dourado capturou o Peixe Dourado! (Recarga: ${cdSec}s)`, 'success');
            }
            handleCatch(true);
          }
        }, 1200);
      }
    }

    // Desaparece após 14s (se sangrento) ou 12s se não clicado
    const despawnTime = isBloodMoon ? 14000 : 12000;
    setTimeout(() => {
      if (el.parentNode && this.goldenFishActive) {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
        this.goldenFishActive = false;
        this.scheduleNextGoldenFish();
      }
    }, despawnTime);
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

  // ── EVENTO ECLIPSE SANGRENTO (Berserk) ──
  triggerBloodMoonEclipse() {
    try {
      sound.playCatch('SECRETO');
      sound.vibrateCatch('SECRETO');
    } catch (e) {
      console.warn('Erro ao tocar efeito sonoro:', e);
    }
    this.goldenFishCatches = (this.goldenFishCatches || 0) + 1;
    this.checkAchievements();

    this.showBloodMoonEclipseModal();
    this.startBloodMoonEvent(60000);
  }

  showBloodMoonEclipseModal() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:70; display:flex; align-items:center; justify-content:center;
      pointer-events:none; animation: goldenRewardIn 0.4s ease-out;
    `;
    overlay.innerHTML = `
      <div style="
        background:radial-gradient(circle at center, rgba(30,0,0,0.98), rgba(10,2,2,0.98));
        border:3px solid #dc2626; padding:22px 32px; text-align:center;
        box-shadow:0 0 50px rgba(220,38,38,0.85), inset 0 0 30px rgba(185,28,28,0.5), 4px 4px 0 #000;
        animation: goldenRewardPulse 0.5s ease-in-out; max-width:440px;
      ">
        <div style="display:flex; justify-content:center; margin-bottom:10px;">
          <img src="${this.getBloodMoonSpriteURL(3.5)}" alt="Peixe da Lua Sangrenta" style="width:64px;height:42px;image-rendering:pixelated;filter:drop-shadow(0 0 16px #ef4444);">
        </div>
        <div style="font-family:var(--font-pixel); font-size:13px; color:#ef4444; font-weight:bold; letter-spacing:2px; text-shadow:0 0 12px #dc2626;">
          🌑 ECLIPSE VERMELHO! 🌑
        </div>
        <div style="font-family:var(--font-pixel); font-size:9px; color:#fca5a5; margin-top:8px; line-height:1.6;">
          O Mar se transformou em Sangue por <span style="color:#ffffff; font-weight:bold;">60 segundos</span>!<br>
          Peixes capturados têm chance de receber <span style="color:#ef4444; font-weight:bold;">Aura da Lua Sangrenta (10% de chance)</span> (+15% Ouro, +15% Sorte) ou <span style="color:#f87171; font-weight:bold;">Aura do Eclipse (10% de chance)</span> (+15% Vel., +15% Dupla)!
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.6s';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 600);
    }, 4000);
  }

  startBloodMoonEvent(durationMs = 60000) {
    this.bloodMoonEventActive = true;
    this.bloodMoonEndsAt = Date.now() + durationMs;

    if (this.waterRenderer && typeof this.waterRenderer.setBloodMoonActive === 'function') {
      this.waterRenderer.setBloodMoonActive(true);
    }

    const skyEl = document.getElementById('blood-eclipse-sky');
    if (skyEl) {
      skyEl.classList.remove('hidden');
      skyEl.style.display = 'flex';
    }

    const bannerEl = document.getElementById('blood-eclipse-banner');
    if (bannerEl) {
      bannerEl.classList.remove('hidden');
      bannerEl.style.display = 'flex';
    }

    if (this.bloodMoonInterval) clearInterval(this.bloodMoonInterval);
    this.bloodMoonInterval = setInterval(() => {
      const remainingMs = Math.max(0, this.bloodMoonEndsAt - Date.now());
      const timerSpan = document.getElementById('blood-eclipse-timer');
      if (timerSpan) {
        timerSpan.textContent = Math.ceil(remainingMs / 1000) + 's';
      }
      if (remainingMs <= 0) {
        this.endBloodMoonEvent();
      }
    }, 500);

    this.showToast('🌑 O Eclipse Vermelho começou! O Mar Sangrento despertou por 60s!', 'error');
  }

  endBloodMoonEvent() {
    this.bloodMoonEventActive = false;
    this.bloodMoonEndsAt = 0;
    if (this.bloodMoonInterval) {
      clearInterval(this.bloodMoonInterval);
      this.bloodMoonInterval = null;
    }

    if (this.waterRenderer && typeof this.waterRenderer.setBloodMoonActive === 'function') {
      this.waterRenderer.setBloodMoonActive(false);
    }

    const skyEl = document.getElementById('blood-eclipse-sky');
    if (skyEl) {
      skyEl.classList.add('hidden');
      skyEl.style.display = 'none';
    }

    const bannerEl = document.getElementById('blood-eclipse-banner');
    if (bannerEl) {
      bannerEl.classList.add('hidden');
      bannerEl.style.display = 'none';
    }

    this.showToast('O Eclipse Vermelho se dissipou e o mar voltou ao normal.', 'info');
  }

  startTempBuffLoop() {
    if (this._tempBuffTimer) clearInterval(this._tempBuffTimer);
    this._tempBuffTimer = setInterval(() => {
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
    div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100;display:none;flex-direction:column;max-height:360px;box-shadow:0 -4px 20px rgba(0,0,0,0.8);';
    div.innerHTML = `
      <div id="console-log" style="flex:1;overflow-y:auto;background:rgba(8,12,20,0.96);padding:10px 14px;font-family:monospace;font-size:11.5px;color:#e2e8f0;max-height:300px;line-height:1.45;border-top:2px solid #0284c7;"></div>
      <div style="display:flex;background:#0f172a;border-top:1px solid #1e293b;">
        <span style="padding:7px 10px;color:#38bdf8;font-family:monospace;font-size:12px;font-weight:bold;">></span>
        <input id="console-input" type="text" placeholder="Digite help para ver os comandos..." autocomplete="off"
          style="flex:1;background:transparent;border:none;outline:none;color:#f8fafc;font-family:monospace;font-size:12px;padding:7px 4px;">
      </div>
    `;
    document.body.appendChild(div);

    // Input handler
    const inputEl = document.getElementById('console-input');
    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) { this.execConsoleCmd(val); e.target.value = ''; }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.toggleConsole(false);
      }
    });

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
      // Ctrl + Shift + ' (ou ")
      const isQuote = e.key === "'" || e.key === '"' || e.code === 'Quote';
      if (e.ctrlKey && e.shiftKey && isQuote) {
        e.preventDefault();
        this.toggleConsole();
        return;
      }

      // Esc para fechar quando o console estiver aberto
      if (e.key === 'Escape' && this.consoleOpen) {
        e.preventDefault();
        this.toggleConsole(false);
        return;
      }

      // Mantém ` ou ~
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        this.toggleConsole();
      }
    });
  }

  toggleConsole(forceState = null) {
    this.consoleOpen = forceState !== null ? forceState : !this.consoleOpen;
    const el = document.getElementById('dev-console');
    if (el) el.style.display = this.consoleOpen ? 'flex' : 'none';
    if (this.consoleOpen) {
      setTimeout(() => document.getElementById('console-input')?.focus(), 50);
    }
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
      case 'ajuda':
      case 'comandos':
      case '?': {
        const cmdColor = '#cbd5e1';    // Cor única e nítida para todos os comandos
        const headerColor = '#38bdf8'; // Destaque para títulos de categorias

        this.consoleLog('══════════════ [ COMANDOS DO CONSOLE ] ══════════════', '#ffd700');

        this.consoleLog('🪙 RECURSOS & ECONOMIA', headerColor);
        this.consoleLog('  gold <qtd>             - Adiciona ouro (ex: gold 50000)', cmdColor);
        this.consoleLog('  goldset <qtd>          - Define o ouro exato (ex: goldset 0)', cmdColor);
        this.consoleLog('  fisheye [n]            - Adiciona n Olhos de Peixe (default: 1)', cmdColor);
        this.consoleLog('  midnight               - Simula virada das 00:00 (coleta de Olho)', cmdColor);

        this.consoleLog('🎣 PESCA & CAPTURAS', headerColor);
        this.consoleLog('  catch [n]              - Pesca n peixes aleatórios (default: 1)', cmdColor);
        this.consoleLog('  catchid <id> [n]       - Pesca peixe por ID (1 a 35) ou nome', cmdColor);
        this.consoleLog('  catchall               - Captura todos os peixes do mundo atual', cmdColor);
        this.consoleLog('  goldenfish             - Spawna o peixe dourado especial', cmdColor);
        this.consoleLog('  bloodfish              - Spawna o peixe da Lua Sangrenta', cmdColor);
        this.consoleLog('  clearinv               - Limpa todos os peixes do balde', cmdColor);

        this.consoleLog('⭐ PROGRESSÃO & UPGRADES', headerColor);
        this.consoleLog('  maxupgrades            - Maximiza todas as melhorias da loja', cmdColor);
        this.consoleLog('  unlockall              - Desbloqueia todas as varas e iscas', cmdColor);
        this.consoleLog('  buff <tipo> [s]        - Ativa buff temporário (gold/luck/speed/double)', cmdColor);
        this.consoleLog('  offline [minutos]      - Simula tempo ausente AFK (default: 60 min)', cmdColor);

        this.consoleLog('🌍 MUNDOS, TEMPO & EVENTOS', headerColor);
        this.consoleLog('  world [1|2]            - Alterna entre Mundo 1 (Lago) e Mundo 2 (Abismo)', cmdColor);
        this.consoleLog('  m1 / m2                - Atalhos rápidos para viajar entre Mundos', cmdColor);
        this.consoleLog('  time [fase]            - Consulta ou define horário (day/sunset/night)', cmdColor);
        this.consoleLog('  skiptime               - Avança para o próximo horário do dia', cmdColor);
        this.consoleLog('  biome <id>             - Alterna o bioma abissal do Mundo 2', cmdColor);
        this.consoleLog('  eclipse                - Inicia Eclipse e Mar Sangrento por 60s', cmdColor);

        this.consoleLog('🧲 PESCA MAGNÉTICA', headerColor);
        this.consoleLog('  magnet [tier]          - Ativa modo Pesca Magnética (ou "ima")', cmdColor);
        this.consoleLog('  pesca                  - Sai do ímã e volta à pesca tradicional', cmdColor);
        this.consoleLog('  magnetitem <id> [n]    - Adiciona item magnético ao inventário', cmdColor);

        this.consoleLog('✨ TESTES & ANIMAÇÕES', headerColor);
        this.consoleLog('  testlendario           - Celebração cinematográfica do 1º Lendário', cmdColor);
        this.consoleLog('  testmitico             - Celebração cinematográfica do 1º Mítico', cmdColor);
        this.consoleLog('  testsecreto            - Celebração cinematográfica do 1º Secreto', cmdColor);
        this.consoleLog('  testbuff               - Celebração do 1º Peixe com Buff (Aquário)', cmdColor);
        this.consoleLog('  testsplash             - Animação de gotas d\'água no lago', cmdColor);
        this.consoleLog('  testrepetir            - Testa captura repetida (sem duplicate overlay)', cmdColor);
        this.consoleLog('  isca <nome>            - Troca anzol e isca (minhoca, neon, ouro, kraken)', cmdColor);
        this.consoleLog('  patchnotes             - Abre Notas de Atualização com timer de 5s', cmdColor);

        this.consoleLog('🔄 RESETS & RESTAURAÇÃO', headerColor);
        this.consoleLog('  resetprogresso         - Reseta Santuário e Oferendas pro início', cmdColor);
        this.consoleLog('  resetbuff              - Reseta celebração do 1º Peixe com Buff', cmdColor);
        this.consoleLog('  resetpatchnotes        - Reseta visualização das Notas de Atualização', cmdColor);

        this.consoleLog('⚙️ SISTEMA', headerColor);
        this.consoleLog('  clear                  - Limpa o histórico de mensagens deste console', cmdColor);
        this.consoleLog('  reset                  - Reseta completamente o progresso do jogo', cmdColor);

        this.consoleLog('══════════════════════════════════════════════════════', '#ffd700');
        break;
      }

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

      case 'skiptime':
      case 'skipday':
      case 'skip':
      case 'nexttime': {
        const validPhases = ['day', 'sunset', 'night'];
        const target = arg && validPhases.includes(arg.toLowerCase()) ? arg.toLowerCase() : null;
        const names = { day: 'DAY ☀️', sunset: 'SUNSET 🌅', night: 'NIGHT 🌙' };

        if (target) {
          this.setTimeOfDay(target);
          this.consoleLog(`Horário alterado para: ${names[this.timeOfDay]} (05:00 restantes)`, '#38bdf8');
        } else {
          const newPhase = this.skipTimeOfDay();
          this.consoleLog(`Horário pulado para: ${names[newPhase] || newPhase.toUpperCase()} (05:00 restantes)`, '#38bdf8');
        }
        break;
      }

      case 'time':
      case 'tod': {
        const validPhases = ['day', 'sunset', 'night'];
        const names = { day: 'DAY ☀️', sunset: 'SUNSET 🌅', night: 'NIGHT 🌙' };

        if (arg === 'skip' || arg === 'next') {
          const newPhase = this.skipTimeOfDay();
          this.consoleLog(`Horário pulado para: ${names[newPhase] || newPhase.toUpperCase()} (05:00 restantes)`, '#38bdf8');
        } else if (arg && validPhases.includes(arg.toLowerCase())) {
          this.setTimeOfDay(arg.toLowerCase());
          this.consoleLog(`Horário alterado para: ${names[this.timeOfDay]} (05:00 restantes)`, '#38bdf8');
        } else {
          const remaining = this.getTimeRemainingInPhase();
          this.consoleLog(`Horário atual: ${names[this.timeOfDay] || this.timeOfDay.toUpperCase()} (próxima mudança em ${remaining.text})`, '#38bdf8');
          this.consoleLog(`Uso: 'skiptime' | 'time <day|sunset|night>' | 'tod skip'`, '#888');
        }
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

      case 'bloodfish':
      case 'spawnblood':
        if (this.goldenFishActive) {
          this.consoleLog('Já existe um peixe ativo na tela!', '#ff6b6b');
        } else {
          clearTimeout(this.goldenFishTimer);
          this.spawnGoldenFish(true);
          this.consoleLog('Peixe da Lua Sangrenta spawnado!', '#ef4444');
        }
        break;

      case 'patchnotes':
      case 'testpatchnotes':
        this.openPatchNotesModal(true);
        this.consoleLog('Notas de atualização abertas com timer de 5s!', '#38bdf8');
        break;

      case 'resetpatchnotes':
        localStorage.removeItem('fc_last_seen_patch_version');
        this.consoleLog('Status de versão vista resetado! Ao recarregar a página o modal abrirá automaticamente.', '#a855f7');
        break;

      case 'testbuff':
      case 'testbufffish':
      case 'testpeixebuff':
      case 'buffcelebration':
      case 'buffnotice':
      case 'testbuffnotice':
      case 'buff':
        this.toggleConsole(false);
        this.simulateFirstBuffCatch(true);
        this.consoleLog('🐠 Celebração épica do 1º Peixe com Buff disparada!', '#a855f7');
        break;

      case 'resetbuff':
      case 'resetbuffnotice':
        this.hasSeenBuffFishNotice = false;
        this.saveGame();
        this.consoleLog('Status de celebração do 1º peixe com buff resetado!', '#a855f7');
        break;

      case 'testsplash':
      case 'testgotas':
      case 'splash':
      case 'gotas':
        if (this.waterRenderer) {
          this.waterRenderer.catchAndSpawnFish('dourado');
          this.consoleLog('💧 Animação de gotas e splash disparada no peixinho do lago!', '#38bdf8');
          this.showToast('💧 Gotas d\'água espirradas no lago!', 'info');
        } else {
          this.consoleLog('WaterRenderer não inicializado.', '#f87171');
        }
        break;

      case 'eclipse':
      case 'bloodmoon':
        this.startBloodMoonEvent(60000);
        this.consoleLog('Eclipse Vermelho e Mar Sangrento iniciados por 60 segundos!', '#dc2626');
        break;

      case 'offline':
      case 'afk': {
        const mins = Math.max(1, parseInt(arg) || 60);
        this.consoleLog(`Simulando ${mins} minutos de ausência offline...`, '#38bdf8');
        this.checkOfflineProgress(mins * 60);
        break;
      }

      case 'catchid': {
        const query = parts[1];
        if (!query) {
          this.consoleLog('Uso: catchid <id_ou_nome> [quantidade]', '#ff6b6b');
          this.consoleLog(`IDs válidos: 1 a ${FISH_LIST.length}. Ex: catchid 28 (Lampreia) ou catchid 1 5`, '#888');
          break;
        }
        const num = parseInt(query);
        const target = FISH_LIST.find(f => (!isNaN(num) && f.numId === num) || f.id.toLowerCase() === query.toLowerCase());
        if (!target) {
          this.consoleLog(`Peixe com ID "${query}" não encontrado! IDs válidos: 1 a ${FISH_LIST.length}.`, '#ff6b6b');
          break;
        }
        const count = Math.min(Math.max(1, parseInt(parts[2]) || 1), 20);
        const freeSlots = this.getMaxInventory() - this.inventory.length;
        if (freeSlots <= 0) {
          this.consoleLog('Seu balde está cheio! Venda peixes antes.', '#ff6b6b');
          break;
        }
        const toCatch = Math.min(count, freeSlots);
        for (let i = 0; i < toCatch; i++) {
          const weight = +(target.minWeight + Math.random() * (target.maxWeight - target.minWeight)).toFixed(2);
          const weightFactor = weight / target.minWeight;
          const rawValue = Math.round(target.baseValue * Math.pow(weightFactor, 0.7));
          const generatedBuffs = generateFishBuffs(target.id, target.rarity);
          let specialAura = null;
          if (this.bloodMoonEventActive) {
            const auraRoll = Math.random();
            if (auraRoll < 0.10) {
              specialAura = 'eclipse';
              generatedBuffs.push({
                type: 'event_eclipse',
                value: 0.15,
                double: 0.15,
                text: '+15% Vel. Pesca & +15% Dupla (Eclipse)'
              });
            } else if (auraRoll < 0.20) {
              specialAura = 'lua_sangrenta';
              generatedBuffs.push({
                type: 'event_blood_moon',
                value: 0.15,
                luck: 0.15,
                text: '+15% Ouro & +15% Sorte (Lua Sangrenta)'
              });
            }
          }
          const fish = {
            uid: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            id: target.id,
            numId: target.numId,
            name: target.name,
            rarity: target.rarity,
            icon: target.icon,
            weight,
            baseValue: rawValue,
            desc: target.desc,
            buffs: generatedBuffs,
            buff: generatedBuffs[0] || null,
            isDoubleBuff: generatedBuffs.length === 2,
            isTripleBuff: generatedBuffs.length >= 3 || target.rarity === 'SECRETO',
            specialAura: specialAura,
            locked: false
          };
          this.inventory.unshift(fish);
          this.totalCatches++;
          sound.playCatch(fish.rarity);
          sound.vibrateCatch(fish.rarity);
          this.showCatchNotification(fish);
          this.recordDiscovery(fish);
          this.checkFirstBuffFishCatch(fish);
        }
        this.renderAll();
        this.consoleLog(`[#${target.numId}] ${target.name} pescado com sucesso (${toCatch}x)!`, '#38bdf8');
        break;
      }

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

      case 'catchall': {
        let count = 0;
        const targetList = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
        targetList.forEach(target => {
          const weight = +(target.minWeight + Math.random() * (target.maxWeight - target.minWeight)).toFixed(2);
          const weightFactor = weight / target.minWeight;
          const rawValue = Math.round(target.baseValue * Math.pow(weightFactor, 0.7));
          const generatedBuffs = generateFishBuffs(target.id, target.rarity);
          const fish = {
            uid: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            id: target.id,
            numId: target.numId,
            name: target.name,
            rarity: target.rarity,
            icon: target.icon,
            weight,
            baseValue: rawValue,
            desc: target.desc,
            buffs: generatedBuffs,
            buff: generatedBuffs[0] || null,
            isDoubleBuff: generatedBuffs.length === 2,
            isTripleBuff: generatedBuffs.length >= 3 || target.rarity === 'SECRETO',
            specialAura: target.rarity === 'SECRETO' ? 'void' : null,
            locked: false
          };
          this.inventory.unshift(fish);
          this.totalCatches++;
          this.recordDiscovery(fish);
          count++;
        });
        sound.playCatch('MITICO');
        this.renderAll();
        this.saveGame();
        this.consoleLog(`🎣 Sucesso! Todos os ${count} peixes do jogo foram capturados e registrados na Enciclopédia!`, '#34d399');
        this.showToast(`Capturados todos os ${count} peixes!`, 'success');
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

      case 'world':
      case 'mundo':
      case 'm':
      case 'w': {
        const target = (arg || '').trim();
        if (target === '1') {
          if (this.gameMode === 'ima') this.setGameMode('pesca');
          this.travelBetweenWorlds(1);
          this.consoleLog('☀️ Viajou para o Mundo 1 (Superfície)!', '#fbbf24');
        } else if (target === '2') {
          if (this.gameMode === 'ima') this.setGameMode('pesca');
          if (this.currentWorld === 2) {
            this.consoleLog('Você já está no Mundo 2!', '#06b6d4');
            this.renderAll();
          } else if (this.world2SavedData) {
            this.travelBetweenWorlds(2);
            this.consoleLog('🌊 Viajou para o Mundo 2 via Batiscafo!', '#06b6d4');
          } else {
            this.enterWorld2Reset();
            this.consoleLog('🌊 Entrou no Mundo 2 (Reset de Prestígio)!', '#06b6d4');
          }
        } else {
          this.consoleLog(`Mundo atual: Mundo ${this.currentWorld} (Modo: ${this.gameMode}). Uso: world 1 ou world 2 (ou m1 / m2)`, '#38bdf8');
        }
        break;
      }

      case 'world1':
      case 'mundo1':
      case 'm1':
      case 'w1':
        if (this.gameMode === 'ima') this.setGameMode('pesca');
        this.travelBetweenWorlds(1);
        this.consoleLog('☀️ Retornou ao Mundo 1 via Batiscafo!', '#fbbf24');
        break;

      case 'world2':
      case 'mundo2':
      case 'm2':
      case 'w2':
        if (this.gameMode === 'ima') this.setGameMode('pesca');
        if (this.currentWorld === 2) {
          this.consoleLog('Você já está no Mundo 2!', '#06b6d4');
          this.renderAll();
        } else if (this.world2SavedData) {
          this.travelBetweenWorlds(2);
          this.consoleLog('🌊 Retornou ao Mundo 2 via Batiscafo!', '#06b6d4');
        } else {
          this.enterWorld2Reset();
          this.consoleLog('🌊 Entrou no Mundo 2 (Reset de Prestígio com Herança M1)!', '#06b6d4');
        }
        break;

      case 'pesca':
      case 'pescaria':
      case 'normal':
      case 'modopesca':
        this.setGameMode('pesca');
        this.consoleLog(`🎣 Retornou para o modo de Pesca tradicional (Mundo ${this.currentWorld})!`, '#38bdf8');
        break;

      case 'skipbiome':
      case 'nextbiome':
        this.skipWorld2Biome();
        this.consoleLog('Bioma avançado para a próxima rotação de 5 minutos!', '#38bdf8');
        break;

      case 'biome':
      case 'bioma': {
        const bArg = (arg || '').toLowerCase();
        const bMap = {
          'recife': 'recife_bioluminescente',
          'neon': 'recife_bioluminescente',
          'fenda': 'fendas_vulcanicas',
          'fendas': 'fendas_vulcanicas',
          'vulcao': 'fendas_vulcanicas',
          'vulcanicas': 'fendas_vulcanicas',
          'naufragio': 'cemiterio_naufragios',
          'naufragios': 'cemiterio_naufragios',
          'cemiterio': 'cemiterio_naufragios',
          'hadal': 'zona_hadal',
          'abissal': 'zona_hadal'
        };
        const targetBiome = bMap[bArg] || (['recife_bioluminescente', 'fendas_vulcanicas', 'cemiterio_naufragios', 'zona_hadal'].includes(bArg) ? bArg : null);
        if (targetBiome) {
          this.setWorld2Biome(targetBiome);
          this.consoleLog(`Bioma alterado para: ${targetBiome} (05:00 restantes)`, '#38bdf8');
        } else {
          const rem = this.getWorld2BiomeRemaining();
          this.consoleLog(`Bioma atual: ${this.activeWorld2Biome} (${rem.text} restantes). Opções: recife, fendas, naufragios, hadal`, '#38bdf8');
        }
        break;
      }

      case 'kraken':
        this.triggerKrakenCinematic();
        this.consoleLog('🦑 Cinemática do Kraken Ancestral iniciada!', '#a855f7');
        break;

      case 'parts':
      case 'unlockparts':
        this.ascensionParts = { bateria_neon: true, casco_titanio: true, helice_galeao: true, sistema_lastro_hadal: true };
        this.saveGame();
        this.consoleLog('🚀 Todas as 4 peças do Batiscafo foram desbloqueadas!', '#10b981');
        this.renderSubmarineModal();
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

            case 'resetdonations':
      case 'resetdoacoes':
      case 'resetdoar':
      case 'cleardonations':
        this.resetDonations();
        break;

      case 'fisheye':
      case 'giveeye': {
        const count = Math.max(1, parseInt(arg) || 1);
        this.fishEyesCount = (this.fishEyesCount || 0) + count;
        this.fishEyesTotal = (this.fishEyesTotal || 0) + count;
        this.consoleLog(`+${count} Olho(s) de Peixe adicionado(s)! Total disponível: ${this.fishEyesCount}`, '#38bdf8');
        this.renderFishEyesBadge();
        this.renderFishEyesModal();
        this.saveGame();
        break;
      }

      case 'midnight': {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        this.lastFishEyeDate = this.getLocalDateKey(d);
        this.consoleLog('Simulando virada de meia-noite (00:00)...', '#ffd700');
        this.checkMidnightFishEye(true);
        break;
      }

      case 'magnet':
      case 'ima':
      case 'ímã':
      case 'modoima':
      case 'cheatmagnet': {
        const tier = Math.max(1, Math.min(5, parseInt(arg) || 1));
        this.magnetUnlocked = true;
        this.magnetTier = tier;
        this.renderHeader();
        this.consoleLog(`Pesca Magnética desbloqueada no Tier ${tier} (${MAGNET_TIERS[tier - 1]?.name})!`, '#f59e0b');
        this.setGameMode('ima');
        break;
      }

      case 'magnettier': {
        const tier = Math.max(1, Math.min(5, parseInt(arg) || 1));
        this.upgradeMagnetTier(tier);
        this.consoleLog(`Tier do Ímã alterado para ${tier}!`, '#f59e0b');
        break;
      }

      case 'magnetitem': {
        const itemId = parts[1];
        const qty = Math.max(1, parseInt(parts[2]) || 1);
        if (!itemId || !MAGNET_ITEMS[itemId]) {
          this.consoleLog(`Item inválido! Ex: magnetitem minerio_ferro 5. IDs: ${Object.keys(MAGNET_ITEMS).join(', ')}`, '#ff6b6b');
          break;
        }
        this.magnetInventory[itemId] = (this.magnetInventory[itemId] || 0) + qty;
        this.consoleLog(`+${qty}x ${MAGNET_ITEMS[itemId].name} adicionado à Mochila de Garimpo!`, '#f59e0b');
        if (this.gameMode === 'ima') this.renderMagnetRightPanel();
        break;
      }

      case 'magnetall': {
        this.magnetUnlocked = true;
        this.magnetTier = 5;
        Object.keys(MAGNET_ITEMS).forEach(id => {
          this.magnetInventory[id] = (this.magnetInventory[id] || 0) + 10;
          this.museumDonations[id] = true;
        });
        FORGE_RECIPES.forEach(r => {
          this.forgeUpgrades[r.id] = true;
        });
        this.consoleLog('Todos os ímãs (Tier 5), 10x de cada item, Museu e Forja desbloqueados!', '#f59e0b');
        this.renderHeader();
        this.setGameMode('ima');
        break;
      }

      case 'magnetopen':
        this.setGameMode('ima');
        break;

      case 'reset':
        this.resetProgress();
        break;

      case 'firstcatch':
      case 'celebration':
      case 'animacao':
      case 'testcatch': {
        const rMap = {
          'lendario': 'LENDARIO',
          'lendaria': 'LENDARIO',
          'lendário': 'LENDARIO',
          'leg': 'LENDARIO',
          'mitico': 'MITICO',
          'mítico': 'MITICO',
          'mythic': 'MITICO',
          'secreto': 'SECRETO',
          'secret': 'SECRETO'
        };
        const rarity = rMap[(arg || '').toLowerCase()] || 'LENDARIO';
        this.toggleConsole(false);
        this.testFirstCatchCelebration(rarity);
        this.consoleLog(`🎉 Celebração disparada para raridade ${rarity}!`, '#ffd700');
        break;
      }

      case 'resetfirstcatch':
      case 'resetcelebration':
        this.resetFirstCatchCelebrations();
        break;

      // ─── TESTES DAS NOVAS IMPLEMENTAÇÕES NO CONSOLE DO JOGO ───
      case 'testlendario':
      case 'testlegendary':
      case 'lendario':
        this.toggleConsole(false);
        this.simulateFirstCatch('LENDARIO', true);
        this.consoleLog('⭐ Captura do 1º Lendário simulada (Santuário + 1 Olho liberados)!', '#ffd700');
        break;

      case 'testmitico':
      case 'testmythic':
      case 'mitico':
        this.toggleConsole(false);
        this.simulateFirstCatch('MITICO', true);
        this.consoleLog('⭐ Captura do 1º Mítico simulada (Oferendas do Santuário liberadas)!', '#ec4899');
        break;

      case 'testsecreto':
      case 'testsecret':
      case 'secreto':
        this.toggleConsole(false);
        this.simulateFirstCatch('SECRETO', true);
        this.consoleLog('⭐ Captura do 1º Secreto simulada!', '#a855f7');
        break;

      case 'testrepetir':
      case 'repetir': {
        const targetRarity = (arg || 'LENDARIO').toUpperCase();
        this.simulateSecondCatch(targetRarity);
        this.consoleLog(`⭐ Tentativa de 2º peixe ${targetRarity} realizada (nenhuma celebração repetida)!`, '#34d399');
        break;
      }

      case 'resetprogresso':
      case 'resetolhos':
      case 'reseteyes':
        this.resetEyesProgression();
        this.consoleLog('↺ Progresso dos Olhos e Santuário resetado para o início!', '#f59e0b');
        break;

      case 'travarsantuario':
      case 'bloquearsantuario':
        this.setSanctuaryUnlocked(false);
        this.consoleLog('🔒 Santuário dos Olhos bloqueado e oculto do menu!', '#f87171');
        break;

      case 'liberarsantuario':
      case 'destravarsantuario':
        this.setSanctuaryUnlocked(true);
        this.consoleLog('🔓 Santuário dos Olhos liberado no menu!', '#34d399');
        break;

      case 'travaroferendas':
      case 'bloquearoferendas':
        this.setOfferingsUnlocked(false);
        this.consoleLog('🔒 Oferendas do Santuário e botões de doar bloqueados!', '#f87171');
        break;

      case 'liberaroferendas':
      case 'destravaroferendas':
        this.setOfferingsUnlocked(true);
        this.consoleLog('🔓 Oferendas do Santuário e botões de doar liberados!', '#34d399');
        break;

      case 'testisca':
      case 'isca':
      case 'setisca':
      case 'hook': {
        const baitKey = arg || 'minhoca';
        this.testEquipBait(baitKey);
        this.consoleLog(`🪝 Isca/Anzol alterado para: ${baitKey}`, '#38bdf8');
        break;
      }

      case 'testfisgada':
      case 'fisgada':
      case 'tug':
        this.testTug();
        this.consoleLog('🎣 Física de fisgada disparada no anzol!', '#38bdf8');
        break;

      case 'teststatus':
      case 'status':
        this.consoleLog('=== STATUS DOS SISTEMAS ===', '#ffd700');
        this.consoleLog(`• Santuário dos Olhos: ${this.firstRarityCatches?.LENDARIO ? '🔓 Desbloqueado' : '🔒 Bloqueado / Oculto'}`, this.firstRarityCatches?.LENDARIO ? '#34d399' : '#f87171');
        this.consoleLog(`• Oferendas de Espécies: ${this.firstRarityCatches?.MITICO ? '🔓 Liberadas' : '🔒 Bloqueadas'}`, this.firstRarityCatches?.MITICO ? '#34d399' : '#f87171');
        this.consoleLog(`• 1º Lendário: ${this.firstRarityCatches?.LENDARIO ? '✅ Capturado' : '❌ Não capturado'}`, '#e2e8f0');
        this.consoleLog(`• 1º Mítico: ${this.firstRarityCatches?.MITICO ? '✅ Capturado' : '❌ Não capturado'}`, '#e2e8f0');
        this.consoleLog(`• 1º Secreto: ${this.firstRarityCatches?.SECRETO ? '✅ Capturado' : '❌ Não capturado'}`, '#e2e8f0');
        this.consoleLog(`• Olhos de Peixe: ${this.fishEyesCount || 0} disponíveis (${this.fishEyesTotal || 0} totais)`, '#38bdf8');
        this.consoleLog(`• Isca / Anzol atual: ${this.selectedBaitId || 'minhoca'}`, '#f59e0b');
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

    // Configurações
    document.getElementById('btn-open-settings')?.addEventListener('click', () => this.openSettings());

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

    // Capítulo 1 / Portal Dimensional & Altar de Sacrifício
    document.getElementById('btn-open-chapter1')?.addEventListener('click', () => this.openChapter1Modal());
    document.getElementById('btn-close-chapter1')?.addEventListener('click', () => this.closeChapter1Modal());
    document.getElementById('btn-chapter1-confirm')?.addEventListener('click', () => this.closeChapter1Modal());
    document.getElementById('btn-sacrifice-fish')?.addEventListener('click', () => this.sacrificeFish());
    document.getElementById('btn-summon-kraken')?.addEventListener('click', () => this.triggerKrakenCinematic());

    document.getElementById('btn-open-album')?.addEventListener('click', () => this.openAlbum());
    document.getElementById('btn-close-album')?.addEventListener('click', () => this.closeAlbum());
    document.getElementById('btn-open-fish-eyes')?.addEventListener('click', () => this.openFishEyesModal());
    document.getElementById('btn-open-patch-notes')?.addEventListener('click', () => this.openPatchNotesModal());
    document.getElementById('btn-toggle-time')?.addEventListener('click', () => this.showTimeOfDayStatus());

    // Fechar dropdown de menu ao clicar fora dele
    document.addEventListener('click', (e) => {
      const container = document.getElementById('main-menu-container');
      if (container && !container.contains(e.target)) {
        this.toggleMainMenu(false);
      }
    });

    // Fechar modais ao clicar fora (backdrop click) e via tecla Escape
    const allModals = ['sell-filter-modal', 'album-modal', 'offline-modal', 'achievements-modal', 'chapter1-modal', 'settings-modal', 'fish-eyes-modal', 'patch-notes-modal'];
    allModals.forEach(id => {
      const m = document.getElementById(id);
      if (m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) {
            if (id === 'patch-notes-modal' && this.patchNotesCooldownActive) return;
            m.classList.add('hidden');
            sound.playClick();
          }
        });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleMainMenu(false);
        if (this.consoleOpen) {
          this.toggleConsole(false);
        }
        allModals.forEach(id => {
          if (id === 'patch-notes-modal' && this.patchNotesCooldownActive) return;
          const m = document.getElementById(id);
          if (m && !m.classList.contains('hidden')) {
            m.classList.add('hidden');
          }
        });
      }
    });
  }

  // ── SISTEMA DE CELEBRAÇÃO: PRIMEIRO PEIXE LENDÁRIO, MÍTICO OU SECRETO ──
  checkFirstRarityCatch(fish) {
    if (!fish || !fish.rarity) return;
    const targetRarities = ['LENDARIO', 'MITICO', 'SECRETO'];
    if (!targetRarities.includes(fish.rarity)) return;

    if (!this.firstRarityCatches) {
      this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    }

    // Se já capturou QUALQUER peixe dessa raridade, não repete
    if (this.firstRarityCatches[fish.rarity]) return;

    this.firstRarityCatches[fish.rarity] = true;

    // Se capturou o 1º Lendário, desbloqueia o Santuário e concede o 1º Olho de Peixe místico
    if (fish.rarity === 'LENDARIO') {
      this.fishEyesCount = (this.fishEyesCount || 0) + 1;
      this.fishEyesTotal = (this.fishEyesTotal || 0) + 1;
      this.renderFishEyesBadge();
    }

    // Se capturou o 1º Mítico, desbloqueia as Oferendas e atualiza os botões de doar no balde
    if (fish.rarity === 'MITICO') {
      this.renderInventory();
    }

    this.saveGame();

    // Pequeno delay para a notificação inicial não conflitar
    setTimeout(() => {
      this.triggerFirstCatchCelebration(fish);
    }, 350);
  }

  triggerFirstCatchCelebration(fish, celebrationType = null) {
    const overlay = document.getElementById('first-catch-celebration-overlay');
    if (!overlay) return;

    const rarity = fish.rarity;
    const configMap = {
      BUFF: {
        badgeText: '★ ATRIBUTO MÍSTICO DESCOBERTO! ★',
        mainTitle: 'PARABÉNS! VOCÊ FISGOU SEU PRIMEIRO PEIXE COM BUFF!',
        accentColor: '#c084fc',
        borderColor: '#a855f7',
        haloClass: 'bg-purple-600/50',
        radialGlow: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.55) 0%, rgba(107, 33, 168, 0.3) 50%, transparent 75%)',
        badgeClass: 'text-purple-300 bg-purple-950/90 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.7)]'
      },
      LENDARIO: {
        badgeText: '★ PRIMEIRO PEIXE LENDÁRIO! ★',
        mainTitle: 'PARABÉNS! VOCÊ CAPTUROU SEU PRIMEIRO PEIXE LENDÁRIO!',
        accentColor: '#ef4444',
        borderColor: '#dc2626',
        haloClass: 'bg-red-600/50',
        radialGlow: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.45) 0%, rgba(185, 28, 28, 0.2) 50%, transparent 75%)',
        badgeClass: 'text-red-300 bg-red-950/80 border-red-500'
      },
      MITICO: {
        badgeText: '★ FEITO EXTRAORDINÁRIO: MÍTICO! ★',
        mainTitle: 'INCRÍVEL! VOCÊ CAPTUROU SEU PRIMEIRO PEIXE MÍTICO!',
        accentColor: '#ec4899',
        borderColor: '#ec4899',
        haloClass: 'bg-pink-600/50',
        radialGlow: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.5) 0%, rgba(147, 51, 234, 0.25) 50%, transparent 75%)',
        badgeClass: 'text-pink-300 bg-pink-950/80 border-pink-500'
      },
      SECRETO: {
        badgeText: '★ ANOMALIA CÓSMICA: SECRETO! ★',
        mainTitle: 'INACREDITÁVEL! VOCÊ DESCOBRIU SEU PRIMEIRO PEIXE SECRETO!',
        accentColor: '#f87171',
        borderColor: '#dc2626',
        haloClass: 'bg-red-800/70',
        radialGlow: 'radial-gradient(circle at center, rgba(220, 38, 38, 0.6) 0%, rgba(76, 5, 25, 0.4) 50%, transparent 75%)',
        badgeClass: 'text-rose-300 bg-black/90 border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.8)]'
      }
    };

    const activeType = celebrationType || rarity;
    const cfg = configMap[activeType] || configMap.BUFF || configMap.LENDARIO;

    // Atualiza Textos
    const badgeEl = document.getElementById('fc-badge-rarity');
    if (badgeEl) {
      badgeEl.textContent = cfg.badgeText;
      badgeEl.className = `px-3.5 py-1 text-[8.5px] sm:text-[10px] font-bold tracking-widest uppercase border-2 shadow-[0_0_15px_rgba(0,0,0,0.8)] ${cfg.badgeClass}`;
    }

    const titleEl = document.getElementById('fc-main-title');
    if (titleEl) {
      titleEl.textContent = cfg.mainTitle;
      titleEl.style.color = cfg.accentColor;
    }

    // Atualiza Brilho Radial e Halo
    const radialGlow = document.getElementById('fc-radial-glow');
    if (radialGlow) {
      radialGlow.style.background = cfg.radialGlow;
    }

    const halo = document.getElementById('fc-fish-halo');
    if (halo) {
      halo.className = `absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full blur-2xl opacity-75 animate-pulse pointer-events-none ${cfg.haloClass}`;
    }

    const frame = document.getElementById('fc-fish-frame');
    if (frame) {
      frame.style.borderColor = cfg.borderColor;
      frame.style.boxShadow = `0 0 25px ${cfg.accentColor}66, 6px 6px 0 #000`;
    }

    // Imagem do Peixe
    const spriteURL = this.getFishSpriteURL ? this.getFishSpriteURL(fish.icon) : '';
    const imgEl = document.getElementById('fc-fish-img');
    if (imgEl) {
      imgEl.src = spriteURL;
      imgEl.alt = fish.name;
    }

    // Nome, Peso e Valor
    const nameEl = document.getElementById('fc-fish-name');
    if (nameEl) nameEl.textContent = fish.name;

    const weightEl = document.getElementById('fc-fish-weight');
    if (weightEl) weightEl.textContent = `⚖️ ${Number(fish.weight || 1).toFixed(2)}kg`;

    const valueEl = document.getElementById('fc-fish-value');
    const goldMultiplier = (this.getActiveBuffs ? this.getActiveBuffs().goldMultiplier : 0) || 0;
    const sellValue = Math.round((fish.baseValue || 100) * (1 + goldMultiplier));
    if (valueEl) valueEl.textContent = `💰 ${sellValue.toLocaleString('pt-BR')} G`;

    // Buff
    const buffEl = document.getElementById('fc-fish-buff');
    const buffsList = this.getFishBuffs ? this.getFishBuffs(fish) : [];
    if (buffEl) {
      if (buffsList.length > 0) {
        buffEl.textContent = `★ ${buffsList.map(b => b.text).join(' | ')}`;
        buffEl.classList.remove('hidden');
      } else {
        buffEl.classList.add('hidden');
      }
    }

    // Banner Especial de Desbloqueio de Mecânica (Lendário: Santuário / Mítico: Oferendas / Buff: Aquário)
    const cardEl = document.getElementById('fc-mechanic-card');
    const mTitleEl = document.getElementById('fc-mechanic-title');
    const mDescEl = document.getElementById('fc-mechanic-desc');

    if (cardEl && mTitleEl && mDescEl) {
      if (activeType === 'BUFF') {
        cardEl.className = 'w-full max-w-sm p-2.5 border-2 text-left space-y-1 shadow-[3px_3px_0_#000] border-purple-400 bg-purple-950/90 text-purple-200';
        mTitleEl.className = 'flex items-center gap-1.5 font-bold text-[8.5px] sm:text-[9.5px] text-purple-300 uppercase tracking-wider';
        mTitleEl.innerHTML = '<span>🐠</span> BUFFS ATIVOS APENAS NO AQUÁRIO!';
        mDescEl.innerHTML = 'Peixes no balde <b class="text-amber-300">NÃO</b> ativam bônus (servem para pescar e vender). Para usufruir dos atributos deste peixe, mova-o ao <b class="text-cyan-300">Aquário</b> clicando no botão <b class="text-purple-300 border border-purple-500 px-1 py-0.5 bg-purple-950/80 inline-flex items-center gap-0.5"><span>🐠</span>AQUÁRIO</b>!';
        cardEl.classList.remove('hidden');
      } else if (rarity === 'LENDARIO') {
        cardEl.className = 'w-full max-w-sm p-2.5 border-2 text-left space-y-1 shadow-[3px_3px_0_#000] border-cyan-400 bg-cyan-950/90 text-cyan-200';
        mTitleEl.className = 'flex items-center gap-1.5 font-bold text-[8.5px] sm:text-[9.5px] text-cyan-300 uppercase tracking-wider';
        mTitleEl.innerHTML = '<span>👁️</span> SANTUÁRIO DOS OLHOS DESBLOQUEADO!';
        mDescEl.textContent = 'Você pescou um peixe muito raro e conseguiu o olho místico dele (+1 Olho de Peixe concedido)! Agora você liberou o Santuário dos Olhos no Menu para fortalecer seus atributos permanentes.';
        cardEl.classList.remove('hidden');
      } else if (rarity === 'MITICO') {
        cardEl.className = 'w-full max-w-sm p-2.5 border-2 text-left space-y-1 shadow-[3px_3px_0_#000] border-amber-400 bg-amber-950/90 text-amber-200';
        mTitleEl.className = 'flex items-center gap-1.5 font-bold text-[8.5px] sm:text-[9.5px] text-amber-300 uppercase tracking-wider';
        mTitleEl.innerHTML = '<span>🏺</span> OFERENDAS DO SANTUÁRIO LIBERADAS!';
        mDescEl.textContent = 'Você conseguiu um dos peixes mais raros do oceano! Agora você liberou as Oferendas no Santuário dos Olhos: doe um exemplar de cada espécie para conseguir mais Olhos de Peixe!';
        cardEl.classList.remove('hidden');
      } else {
        cardEl.classList.add('hidden');
      }
    }

    // Dispara Confetes e Partículas
    this.spawnCelebrationParticles(cfg.accentColor);

    // Toca som triunfante
    if (activeType === 'BUFF') {
      sound.playUpgrade();
      if (sound.playFirstCatchFanfare) sound.playFirstCatchFanfare('LENDARIO');
    } else if (sound.playFirstCatchFanfare) {
      sound.playFirstCatchFanfare(rarity);
    } else if (sound.playCatch) {
      sound.playCatch(rarity);
    }

    // Cancela timer anterior de fechamento se houver
    if (this._fcCloseTimer) {
      clearTimeout(this._fcCloseTimer);
      this._fcCloseTimer = null;
    }

    // Cooldown de 2s para fechar a tela (evita fechamento acidental)
    this._fcCanCloseAt = Date.now() + 2000;
    if (this._fcCooldownInterval) {
      clearInterval(this._fcCooldownInterval);
      this._fcCooldownInterval = null;
    }

    const btnClose = document.getElementById('btn-fc-close');
    if (btnClose) {
      btnClose.disabled = true;
      btnClose.classList.remove('text-slate-950');
      btnClose.classList.add('opacity-60', 'cursor-not-allowed', 'text-white');
      btnClose.style.color = '#ffffff';
      btnClose.style.textShadow = '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 6px rgba(255,255,255,0.4)';
      btnClose.classList.remove('cursor-pointer', 'hover:from-amber-400', 'hover:to-yellow-400', 'active:scale-95');
      
      const updateCooldownBtn = () => {
        const remaining = Math.max(0, this._fcCanCloseAt - Date.now());
        const sec = Math.ceil(remaining / 1000);
        const btn = document.getElementById('btn-fc-close');
        if (!btn) return;
        if (remaining > 0) {
          btn.disabled = true;
          btn.innerHTML = `<span>⏳</span> AGUARDE (${sec}s)...`;
        } else {
          if (this._fcCooldownInterval) {
            clearInterval(this._fcCooldownInterval);
            this._fcCooldownInterval = null;
          }
          btn.disabled = false;
          btn.classList.remove('opacity-60', 'cursor-not-allowed');
          btn.classList.add('cursor-pointer', 'active:scale-95');
          btn.innerHTML = `<span>🎣</span> CONTINUAR PESCARIA`;
        }
      };
      updateCooldownBtn();
      this._fcCooldownInterval = setInterval(updateCooldownBtn, 100);
    }

    // Exibe Overlay com animação
    overlay.classList.remove('hidden');
    // Força reflow para garantir a transição suave
    void overlay.offsetWidth;
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');
    const box = document.getElementById('fc-content-box');
    if (box) {
      box.classList.remove('scale-90', 'opacity-0');
      box.classList.add('scale-100', 'opacity-100');
    }

    // Tecla de atalho para fechar (Espaço ou Enter ou Escape) respeitando cooldown de 2s
    if (this._fcKeyHandler) {
      window.removeEventListener('keydown', this._fcKeyHandler);
    }
    this._fcKeyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        if (this._fcCanCloseAt && Date.now() < this._fcCanCloseAt) return;
        this.closeFirstCatchCelebration();
      }
    };
    window.addEventListener('keydown', this._fcKeyHandler);
  }

  spawnCelebrationParticles(accentColor) {
    const container = document.getElementById('fc-particles-container');
    if (!container) return;
    container.innerHTML = '';

    const colors = [accentColor, '#facc15', '#38bdf8', '#f8fafc', '#a855f7', '#fb923c'];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fc-particle';
      const size = Math.floor(Math.random() * 8) + 6;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.boxShadow = `0 0 6px ${p.style.backgroundColor}`;

      // Ângulo aleatório e distância de explosão
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.floor(Math.random() * 260) + 120;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.animationDelay = `${Math.random() * 0.25}s`;

      container.appendChild(p);
    }
  }

  closeFirstCatchCelebration() {
    // Bloqueia fechamento antes dos 2 segundos
    if (this._fcCanCloseAt && Date.now() < this._fcCanCloseAt) return;

    if (this._fcCooldownInterval) {
      clearInterval(this._fcCooldownInterval);
      this._fcCooldownInterval = null;
    }

    const overlay = document.getElementById('first-catch-celebration-overlay');
    if (!overlay) return;

    if (this._fcKeyHandler) {
      window.removeEventListener('keydown', this._fcKeyHandler);
      this._fcKeyHandler = null;
    }

    if (this._fcCloseTimer) {
      clearTimeout(this._fcCloseTimer);
      this._fcCloseTimer = null;
    }

    const box = document.getElementById('fc-content-box');
    if (box) {
      box.classList.remove('scale-100', 'opacity-100');
      box.classList.add('scale-95', 'opacity-0');
    }

    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');

    const cardEl = document.getElementById('fc-mechanic-card');
    if (cardEl) cardEl.classList.add('hidden');

    this._fcCloseTimer = setTimeout(() => {
      overlay.classList.add('hidden');
      this._fcCloseTimer = null;
      if (this._pendingBuffCelebration) {
        const pendingFish = this._pendingBuffCelebration;
        this._pendingBuffCelebration = null;
        setTimeout(() => {
          this.triggerFirstCatchCelebration(pendingFish, 'BUFF');
        }, 350);
      }
    }, 300);
  }

  // ── CELEBRAÇÃO DO 1º PEIXE COM BUFF (ANIMAÇÃO NO ESTILO TESTLENDARIO) ──
  checkFirstBuffFishCatch(fish) {
    if (!fish) return;
    const buffs = this.getFishBuffs(fish);
    if (!buffs || buffs.length === 0) return;

    if (this.hasSeenBuffFishNotice) return;
    this.hasSeenBuffFishNotice = true;
    this.saveGame();

    // Se já houver overlay aberto ou celebração de raridade para este mesmo peixe, aguarda o fechamento
    const overlay = document.getElementById('first-catch-celebration-overlay');
    const isOverlayActive = overlay && !overlay.classList.contains('hidden');
    const isTargetRarityFirst = ['LENDARIO', 'MITICO', 'SECRETO'].includes(fish.rarity) &&
      this.firstRarityCatches && this.firstRarityCatches[fish.rarity];

    if (isOverlayActive || isTargetRarityFirst) {
      this._pendingBuffCelebration = fish;
    } else {
      setTimeout(() => {
        this.triggerFirstCatchCelebration(fish, 'BUFF');
      }, 450);
    }
  }

  /**
   * Simula a captura do 1º peixe com buff, disparando a tela de celebração épica
   */
  simulateFirstBuffCatch(force = true) {
    if (force) {
      this.hasSeenBuffFishNotice = false;
    }
    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    let sample = pool.find(f => {
      const b = this.getFishBuffs(f);
      return b && b.length > 0;
    });
    if (!sample) {
      sample = {
        id: 'peixe_lua_crepusculo',
        name: 'Peixe-Lua Crepúsculo',
        rarity: 'EPICO',
        icon: 'peixe_lua',
        weight: 18.5,
        baseValue: 800,
        buffs: [
          { type: 'gold_multiplier', value: 0.20, text: '+20% Ouro' },
          { type: 'luck_bonus', value: 0.15, text: '+15% Sorte' }
        ]
      };
    } else {
      sample = {
        ...sample,
        buffs: this.getFishBuffs(sample)
      };
    }
    console.log(`%c[TESTE] Disparando animação do 1º peixe com buff: ${sample.name}`, 'color: #a855f7; font-weight: bold;');
    this.checkFirstBuffFishCatch(sample);
  }

  // ═══════════════════════════════════════════════
  // COMANDOS DE TESTE DAS NOVAS IMPLEMENTAÇÕES
  // ═══════════════════════════════════════════════

  /**
   * Simula a captura real do 1º peixe de uma raridade específica
   * Passa pelo fluxo completo de checkFirstRarityCatch (concessão de olho, desbloqueio e tela comemorativa)
   */
  simulateFirstCatch(rarity = 'LENDARIO', force = true) {
    if (!this.firstRarityCatches) {
      this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    }
    if (force) {
      this.firstRarityCatches[rarity] = false;
    }
    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    let sample = pool.find(f => f.rarity === rarity) || FISH_LIST.find(f => f.rarity === rarity) || FISH_WORLD_2.find(f => f.rarity === rarity);
    if (!sample) {
      sample = { id: `test_${rarity.toLowerCase()}`, name: `Peixe ${rarity}`, rarity: rarity, icon: 'celacanto', weight: 150 };
    }
    console.log(`%c[TESTE] Capturando 1º peixe da raridade ${rarity}: ${sample.name}`, 'color: #38bdf8; font-weight: bold;');
    this.checkFirstRarityCatch(sample);
  }

  /**
   * Simula pescar um SEGUNDO peixe da mesma raridade
   * Comprova que a celebração NÃO se repete e não duplica bônus
   */
  simulateSecondCatch(rarity = 'LENDARIO') {
    if (!this.firstRarityCatches) {
      this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    }
    this.firstRarityCatches[rarity] = true;
    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    let sample = pool.filter(f => f.rarity === rarity)[1] || pool.find(f => f.rarity === rarity);
    console.log(`%c[TESTE] Pescando 2º peixe ${rarity} (${sample?.name || rarity})...`, 'color: #f59e0b;');
    const beforeEyes = this.fishEyesCount || 0;
    this.checkFirstRarityCatch(sample);
    console.log(`%c[TESTE] Concluído! Celebração NÃO disparada (já foi capturado anteriormente). Olhos mantidos: ${beforeEyes}`, 'color: #10b981; font-weight: bold;');
    this.showToast(`[TESTE] 2º peixe ${rarity} pescado: nenhuma celebração duplicada (correto)!`, 'info');
  }

  /**
   * Reseta todo o progresso dos Olhos de Peixe e Santuário para o estado inicial
   */
  resetEyesProgression() {
    this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    this.fishEyesCount = 0;
    this.fishEyesTotal = 0;
    this.renderFishEyesBadge();
    if (this.currentFishEyesTab === 'offering') {
      this.renderOfferingContent();
    }
    this.renderInventory();
    this.saveGame();
    this.showToast('↺ Progresso dos Olhos e Santuário resetado para o início!', 'info');
    console.log('%c[TESTE] Progresso resetado! Santuário e Oferendas agora estão bloqueados.', 'color: #f59e0b; font-weight: bold;');
  }

  /**
   * Força o bloqueio ou desbloqueio manual do Santuário
   */
  setSanctuaryUnlocked(unlocked = true) {
    if (!this.firstRarityCatches) this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    this.firstRarityCatches.LENDARIO = Boolean(unlocked);
    this.renderFishEyesBadge();
    this.saveGame();
    const msg = unlocked ? '🔓 Santuário dos Olhos liberado no menu!' : '🔒 Santuário dos Olhos bloqueado/oculto!';
    this.showToast(msg, 'info');
    console.log(`[TESTE] ${msg}`);
  }

  /**
   * Força o bloqueio ou desbloqueio manual da aba de Oferendas
   */
  setOfferingsUnlocked(unlocked = true) {
    if (!this.firstRarityCatches) this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    this.firstRarityCatches.MITICO = Boolean(unlocked);
    if (this.currentFishEyesTab === 'offering') {
      this.renderOfferingContent();
    }
    this.renderInventory();
    this.saveGame();
    const msg = unlocked ? '🔓 Oferendas do Santuário liberadas para doação!' : '🔒 Oferendas do Santuário bloqueadas!';
    this.showToast(msg, 'info');
    console.log(`[TESTE] ${msg}`);
  }

  /**
   * Equipa uma isca para testar o recolor dinâmico do sprite da bóia e anzol
   */
  testEquipBait(nameOrId = 'minhoca') {
    const aliasMap = {
      'minhoca': 'minhoca',
      'camarao': 'camarao',
      'camarão': 'camarao',
      'neon': 'isca_brilhante',
      'brilhante': 'isca_brilhante',
      'isca_brilhante': 'isca_brilhante',
      'queijo': 'queijo_mistico',
      'mistico': 'queijo_mistico',
      'místico': 'queijo_mistico',
      'queijo_mistico': 'queijo_mistico',
      'ouro': 'ouro_liquido',
      'liquido': 'ouro_liquido',
      'líquido': 'ouro_liquido',
      'ouro_liquido': 'ouro_liquido',
      'vortice': 'essencia_travessia',
      'vórtice': 'essencia_travessia',
      'essencia': 'essencia_travessia',
      'essencia_travessia': 'essencia_travessia',
      'kraken': 'isca_kraken_ancestral',
      'ancestral': 'isca_kraken_ancestral',
      'isca_kraken_ancestral': 'isca_kraken_ancestral'
    };
    const key = String(nameOrId).toLowerCase().trim();
    const targetId = aliasMap[key] || nameOrId;
    this.selectedBaitId = targetId;
    updateRodSVG(this.selectedRodId, this.selectedBaitId);
    this.saveGame();
    this.showToast(`🪝 Isca de teste equipada: ${targetId}`, 'success');
    console.log(`%c[TESTE] Anzol atualizado para isca: ${targetId} (sprite: icons/baits/hook_${targetId}.png)`, 'color: #38bdf8;');
  }

  /**
   * Simula a animação de puxão/fisgada no anzol
   */
  testTug() {
    const hookContainer = document.getElementById('vertical-fishing-rig');
    if (hookContainer) {
      hookContainer.classList.remove('hook-tug-active');
      void hookContainer.offsetWidth; // trigger reflow
      hookContainer.classList.add('hook-tug-active');
      setTimeout(() => hookContainer.classList.remove('hook-tug-active'), 500);
    }
    this.showToast('🎣 Fisgada no anzol simulada!', 'info');
    console.log('[TESTE] Animação física de fisgada disparada.');
  }

  /**
   * Exibe o status atual de todos os novos sistemas no console
   */
  printStatus() {
    console.group('%c🎣 [Pescaria Clicker] Status dos Sistemas', 'color: #38bdf8; font-weight: bold; font-size: 13px;');
    console.table({
      'Santuário dos Olhos (Menu)': { Status: this.firstRarityCatches?.LENDARIO ? '🔓 Desbloqueado' : '🔒 Bloqueado / Oculto' },
      'Oferendas de Espécies': { Status: this.firstRarityCatches?.MITICO ? '🔓 Desbloqueadas' : '🔒 Bloqueadas' },
      '1º Lendário Capturado': { Status: this.firstRarityCatches?.LENDARIO ? '✅ Sim' : '❌ Não' },
      '1º Mítico Capturado': { Status: this.firstRarityCatches?.MITICO ? '✅ Sim' : '❌ Não' },
      '1º Secreto Capturado': { Status: this.firstRarityCatches?.SECRETO ? '✅ Sim' : '❌ Não' },
      'Olhos de Peixe (Disponíveis)': { Status: this.fishEyesCount || 0 },
      'Olhos de Peixe (Total)': { Status: this.fishEyesTotal || 0 },
      'Isca Atual (Cor do Anzol)': { Status: this.selectedBaitId || 'minhoca' }
    });
    console.groupEnd();
  }

  /**
   * Lista todos os comandos de teste disponíveis
   */
  printHelp() {
    console.log(`%c══════════════════════════════════════════════════════════════════
🎮 COMANDOS DE TESTE DISPONÍVEIS NO CONSOLE
══════════════════════════════════════════════════════════════════%c
⭐ CELEBRAÇÕES & ANIMAÇÕES:
  • testLendario()         -> 1º Lendário (desbloqueia Santuário + 1 Olho)
  • testMitico()           -> 1º Mítico (desbloqueia Oferendas no Santuário)
  • testSecreto()          -> 1º Secreto (Celebração Mística)
  • testBuff()             -> 1º Peixe com Buff (tutorial Aquário)
  • testSplash()           -> Gotas d'água e splash no lago
  • testRepetir('LENDARIO')-> 2º Peixe (comprova que não duplica overlay)
  • testPatchNotes()       -> Notas de Atualização com timer

🔒 TRAVAS & CONTROLE (SANTUÁRIO / OFERENDAS):
  • testLiberarSantuario() / testTravarSantuario()
  • testLiberarOferendas() / testTravarOferendas()

🪝 ANZOL, BÓIA & ISCA:
  • testIsca('nome')       -> Troca isca ('minhoca', 'neon', 'ouro', 'kraken')
  • testFisgada()          -> Animação física de puxão no anzol

🔄 RESTAURAÇÃO DE PROGRESSO:
  • resetProgresso()       -> Reseta Santuário e Oferendas pro início
  • resetBuff()            -> Reseta celebração do 1º Peixe com Buff
  • resetPatchNotes()      -> Reseta visualização do patch notes

📊 INFORMAÇÕES:
  • testStatus()           -> Exibe tabela com status dos desbloqueios
  • testAjuda()            -> Exibe esta lista de ajuda
══════════════════════════════════════════════════════════════════`,
    'color: #38bdf8; font-weight: bold; font-size: 12px;',
    'color: #e2e8f0; font-family: monospace; font-size: 11px;'
    );
  }

  // Comandos de teste legados preservados
  testFirstCatchCelebration(rarity = 'LENDARIO') {
    this.simulateFirstCatch(rarity, true);
  }

  resetFirstCatchCelebrations() {
    this.resetEyesProgression();
  }
}

function initGame() {
  if (window.game) return;
  window.game = new FishingGame();
  
  // Aliases globais no window para digitação rápida no console
  window.testLendario = (force = true) => window.game?.simulateFirstCatch('LENDARIO', force);
  window.testLegendary = (force = true) => window.game?.simulateFirstCatch('LENDARIO', force);
  window.testMitico = (force = true) => window.game?.simulateFirstCatch('MITICO', force);
  window.testMythic = (force = true) => window.game?.simulateFirstCatch('MITICO', force);
  window.testSecreto = (force = true) => window.game?.simulateFirstCatch('SECRETO', force);
  window.testSecret = (force = true) => window.game?.simulateFirstCatch('SECRETO', force);
  window.testCatch = (rarity) => window.game?.simulateFirstCatch(rarity, true);
  window.testRepetir = (rarity = 'LENDARIO') => window.game?.simulateSecondCatch(rarity);

  window.resetProgresso = () => window.game?.resetEyesProgression();
  window.resetProgression = () => window.game?.resetEyesProgression();
  window.resetFirstCatch = () => window.game?.resetEyesProgression();
  window.resetDonations = () => window.game?.resetDonations();

  window.testTravarSantuario = () => window.game?.setSanctuaryUnlocked(false);
  window.testLiberarSantuario = () => window.game?.setSanctuaryUnlocked(true);
  window.testTravarOferendas = () => window.game?.setOfferingsUnlocked(false);
  window.testLiberarOferendas = () => window.game?.setOfferingsUnlocked(true);

  window.testIsca = (name) => window.game?.testEquipBait(name);
  window.testFisgada = () => window.game?.testTug();

  window.testStatus = () => window.game?.printStatus();
  window.testAjuda = () => window.game?.printHelp();
  window.testHelp = () => window.game?.printHelp();
  window.testPatchNotes = (withCooldown = true) => window.game?.openPatchNotesModal(withCooldown);
  window.resetPatchNotes = () => {
    localStorage.removeItem('fc_last_seen_patch_version');
    console.log('[Pescaria Clicker] Versão vista resetada! Ao recarregar a página, as notas abrirão com timer de 5s.');
  };
  window.testBuff = (force = true) => window.game?.simulateFirstBuffCatch(force);
  window.testBuffFish = (force = true) => window.game?.simulateFirstBuffCatch(force);
  window.testPeixeBuff = (force = true) => window.game?.simulateFirstBuffCatch(force);
  window.resetBuff = () => {
    if (window.game) {
      window.game.hasSeenBuffFishNotice = false;
      window.game.saveGame();
      console.log('[Pescaria Clicker] Celebração do 1º peixe com buff resetada!');
    }
  };
  window.testSplash = () => window.game?.execConsoleCmd('testsplash');
  window.testGotas = () => window.game?.execConsoleCmd('testsplash');

  // Navegação entre Mundos & Modos de Jogo
  window.world = (w) => window.game?.travelBetweenWorlds(Number(w) || 1);
  window.travelBetweenWorlds = (w) => window.game?.travelBetweenWorlds(Number(w) || 1);
  window.m1 = () => window.game?.travelBetweenWorlds(1);
  window.m2 = () => {
    if (window.game) {
      if (window.game.gameMode === 'ima') window.game.setGameMode('pesca');
      if (window.game.currentWorld === 2) {
        window.game.renderAll();
      } else if (window.game.world2SavedData) {
        window.game.travelBetweenWorlds(2);
      } else {
        window.game.enterWorld2Reset();
      }
    }
  };
  window.modoPesca = () => window.game?.setGameMode('pesca');
  window.modoIma = () => {
    if (window.game) {
      window.game.magnetUnlocked = true;
      window.game.setGameMode('ima');
    }
  };

  // Banner informativo no console
  setTimeout(() => {
    console.log('%c[Pescaria Clicker] 🛠️ Comandos de teste ativos! Digite %ctestAjuda()%c no console para ver a lista.', 
      'color: #38bdf8; font-weight: bold;', 
      'color: #f59e0b; font-weight: bold; background: #1e293b; padding: 1px 4px; border-radius: 3px;', 
      'color: #38bdf8; font-weight: bold;'
    );
  }, 500);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
