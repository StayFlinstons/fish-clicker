// Ponto de entrada do jogo. A classe FishingGame guarda todo o estado (constructor), a
// inicialização e a ligação dos eventos do DOM. O restante dos métodos mora nos módulos de
// core/, systems/, ui/ e dev/, aplicados na classe por applyMixins() no fim deste arquivo.
// Ao criar um módulo novo: importe-o aqui, inclua-o no applyMixins e no ASSETS_TO_CACHE do
// sw.js, e confira com: node scripts/check_modules.cjs
import { PixelWaterRenderer, updateFishingLine, updateRodSVG } from './pixelArt.js';
import { sound } from './sound.js';
import { GAME_VERSION } from './core/constants.js';
import { applyMixins } from './core/mixins.js';

// Cada arquivo abaixo guarda um grupo de métodos do FishingGame (veja applyMixins no fim do arquivo)
import { SaveMethods } from './core/save.js';
import { EconomyMethods } from './core/economy.js';
import { TimeCycleMethods } from './core/timeCycle.js';
import { FishingMethods } from './systems/fishing.js';
import { ShopMethods } from './systems/shop.js';
import { AutomationMethods } from './systems/automation.js';
import { OfflineMethods } from './systems/offline.js';
import { FishEyesMethods } from './systems/fishEyes.js';
import { MagnetMethods } from './systems/magnet.js';
import { World2Methods } from './systems/world2.js';
import { Chapter1Methods } from './systems/chapter1.js';
import { AchievementMethods } from './systems/achievements.js';
import { EventMethods } from './systems/events.js';
import { RenderMethods } from './ui/render.js';
import { SpriteMethods } from './ui/sprites.js';
import { EffectMethods } from './ui/effects.js';
import { CelebrationMethods } from './ui/celebrations.js';
import { AlbumMethods } from './ui/album.js';
import { SummaryMethods } from './ui/summary.js';
import { SettingsMethods } from './ui/settings.js';
import { PatchNotesMethods } from './ui/patchNotes.js';
import { DevConsoleMethods } from './dev/devConsole.js';
import { TestCommandMethods, installDevGlobals } from './dev/testCommands.js';

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

    // Conquistas (Sala de Troféus) & Estatísticas Gerais
    this.unlockedAchievements = [];
    this.achTab = 'all';
    this.goldenFishCatches = 0;
    this.bloodMoonFishCatches = 0;
    this.playTimeSeconds = 0;
    this.totalBloodMoonCatches = 0;

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

    // Meta-progressão: Olhos de Peixe (Santuário Místico - 00:00) & Oferenda de Espécies
    this.speciesDonations = {}; // { [fishId]: true }
    this.donatedSpeciesHistory = {}; // { [fishId]: true } registro permanente para nunca mais exibir botao doar
    this.offeringCycle = 1;
    this.activeFishEyesTab = 'attributes'; // 'attributes' | 'offering'
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

    // Mundos (1 = Superfície/Neo-Píer, 2 = O Abismo), biomas do Mundo 2 e Batiscafo
    this.currentWorld = 1;
    this.activeWorld2Biome = 'recife_bioluminescente';
    this.world2BiomeOffsetMs = 0;
    this.ascensionParts = {
      bateria_neon: false,
      casco_titanio: false,
      helice_galeao: false,
      sistema_lastro_hadal: false
    };
    this.submarineAssembled = false;
    this.world1Data = null; // snapshot do Mundo 1 para voltar a ele
    this.world2SavedData = null; // snapshot do Mundo 2 para voltar a ele

    // Estado de execução (não salvo): pesca manual/automática, abas abertas e renderizador do lago
    this.isResetting = false; // true bloqueia o autosave (reset/import em andamento)
    this.isFishing = false;
    this.autoFishTimer = null;
    this.lastAutoFishTime = 0;
    this.activeTab = 'varas';
    this.invTab = 'inventory';
    this.waterRenderer = null;

    // Peixe Dourado (Evento Rápido) & buffs temporários
    this.goldenFishActive = false;
    this.goldenFishTimer = null;
    this.tempBuffs = []; // { type, multiplier, endsAt, label }

    // Console de desenvolvedor
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

    // Cache de sprites (ui/sprites.js)
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
    this.renderMenuQuickStats();
    setInterval(() => {
      this.playTimeSeconds = (this.playTimeSeconds || 0) + 1;
      const ptEl = document.getElementById('menu-quick-playtime');
      if (ptEl) ptEl.textContent = this.formatPlayTime(this.playTimeSeconds);
    }, 1000);
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
    const allModals = ['sell-filter-modal', 'album-modal', 'offline-modal', 'achievements-modal', 'chapter1-modal', 'settings-modal', 'fish-eyes-modal', 'patch-notes-modal', 'summary-modal'];
    allModals.forEach(id => {
      const m = document.getElementById(id);
      if (m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) {
            if (id === 'patch-notes-modal' && this.patchNotesCooldownActive) return;
            // Fechar o modal offline equivale a coletar (senão a recompensa se perdia)
            if (id === 'offline-modal') { document.getElementById('btn-collect-offline')?.click(); return; }
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
            if (id === 'offline-modal') { document.getElementById('btn-collect-offline')?.click(); return; }
            m.classList.add('hidden');
          }
        });
      }
    });
  }
}

applyMixins(FishingGame, [
  SaveMethods,
  EconomyMethods,
  TimeCycleMethods,
  FishingMethods,
  ShopMethods,
  AutomationMethods,
  OfflineMethods,
  FishEyesMethods,
  MagnetMethods,
  World2Methods,
  Chapter1Methods,
  AchievementMethods,
  EventMethods,
  RenderMethods,
  SpriteMethods,
  EffectMethods,
  CelebrationMethods,
  AlbumMethods,
  SummaryMethods,
  SettingsMethods,
  PatchNotesMethods,
  DevConsoleMethods,
  TestCommandMethods,
]);

function initGame() {
  if (window.game) return;
  window.game = new FishingGame();
  installDevGlobals();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
