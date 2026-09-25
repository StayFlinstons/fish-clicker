// Persistência: save/load no localStorage, reset e backup (exportar/importar em Base64).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { FISH_LIST } from '../fishData.js';
import { BAITS, RODS, UPGRADES } from '../itemsData.js';
import { sound } from '../sound.js';
import { SAVE_KEY } from './constants.js';

export class SaveMethods {
  getSaveData() {
    return {
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
      bloodMoonFishCatches: this.bloodMoonFishCatches || 0,
      playTimeSeconds: this.playTimeSeconds || 0,
      totalBloodMoonCatches: this.getTotalBloodMoonCatches(),
      chapter1Completed: this.chapter1Completed,
      sacrificedFishCount: this.sacrificedFishCount || 0,
      depthLayersVersion: 1,
      currentLayer: this.getCurrentLayer(),
      krakenCinematicSeen: Boolean(this.krakenCinematicSeen),
      orders: Array.isArray(this.orders) ? this.orders : [],
      ordersCompleted: this.ordersCompleted || 0,
      timeOfDay: this.timeOfDay,
      timeOffsetMs: this.timeOffsetMs || 0,
      phaseMsRemaining: this.getRawMsRemaining(),
      timeSavedAt: Date.now(),
      speciesDonations: this.speciesDonations || {},
      donatedSpeciesHistory: this.donatedSpeciesHistory || {},
      offeringCycle: this.offeringCycle || 1,
      activeFishEyesTab: this.activeFishEyesTab || 'attributes',
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
      analyticsSent: this.analyticsSent || [],
      settings: this.settings,
      // Com a coleta offline pendente, mantém o horário antigo para um F5 não perder a recompensa
      lastActiveTime: this.offlinePending ? this.lastActiveTime : Date.now()
    };
  }

  saveGame() {
    if (this.isResetting) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.getSaveData()));
    } catch(e) { console.warn('Erro ao salvar:', e); }
  }

  loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('pescaria_clicker_save_v3');
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
        this.bloodMoonFishCatches = typeof d.bloodMoonFishCatches === 'number' ? d.bloodMoonFishCatches : 0;
        this.playTimeSeconds = typeof d.playTimeSeconds === 'number' ? d.playTimeSeconds : 0;
        this.totalBloodMoonCatches = typeof d.totalBloodMoonCatches === 'number' ? d.totalBloodMoonCatches : 0;
        this.chapter1Completed = Boolean(d.chapter1Completed);
        this.sacrificedFishCount = typeof d.sacrificedFishCount === 'number' ? d.sacrificedFishCount : 0;
        this.currentLayer = typeof d.currentLayer === 'number' ? d.currentLayer : 1;
        this.krakenCinematicSeen = Boolean(d.krakenCinematicSeen);
        this.orders = Array.isArray(d.orders) ? d.orders.filter(o => o && o.fishId && o.count > 0) : [];
        this.ordersCompleted = typeof d.ordersCompleted === 'number' ? d.ordersCompleted : 0;
        this.timeOfDay = d.timeOfDay || 'day';
        this.timeOffsetMs = d.timeOffsetMs || 0;
        this.savedPhaseMsRemaining = typeof d.phaseMsRemaining === 'number' ? d.phaseMsRemaining : null;
        this.timeSavedAt = typeof d.timeSavedAt === 'number' ? d.timeSavedAt : null;
        this.speciesDonations = (d.speciesDonations && typeof d.speciesDonations === 'object') ? d.speciesDonations : {};
        this.donatedSpeciesHistory = (d.donatedSpeciesHistory && typeof d.donatedSpeciesHistory === 'object') ? d.donatedSpeciesHistory : {};
        Object.keys(this.speciesDonations).forEach(k => { if (this.speciesDonations[k]) this.donatedSpeciesHistory[k] = true; });
        this.offeringCycle = typeof d.offeringCycle === 'number' ? d.offeringCycle : 1;
        this.activeFishEyesTab = d.activeFishEyesTab || 'attributes';
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
        this.analyticsSent = Array.isArray(d.analyticsSent) ? d.analyticsSent : [];

        // Retro-compatibilidade: se o save antigo não tinha firstRarityCatches ou se peixes dessas raridades já foram descobertos
        if (this.discoveredFish) {
          try {
            FISH_LIST.forEach(f => {
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

        // Saves de antes das camadas de profundidade (Mundo 1/Mundo 2 separados)
        if (d.depthLayersVersion !== 1) this.migrateToDepthLayers(d);

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
      // Remove só as chaves do jogo: no GitHub Pages a origem (usuario.github.io) é
      // compartilhada com outros projetos, então localStorage.clear() apagaria dados deles.
      [SAVE_KEY, 'pescaria_clicker_save_v3', 'pescaria_clicker_save_v2', 'pescaria_clicker_save_v1', 'fc_last_seen_patch_version']
        .forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
      location.reload();
    }
  }

  encodeSaveCode(obj) {
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  decodeSaveCode(code) {
    const bin = atob(code.replace(/\s+/g, ''));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  exportSave() {
    const code = this.encodeSaveCode({
      game: 'fish-clicker',
      version: this.gameVersion,
      exportedAt: Date.now(),
      data: this.getSaveData()
    });
    const box = document.getElementById('save-code-textarea');
    if (box) { box.value = code; box.select(); }
    sound.playClick();
    const manual = () => this.showToast('Código gerado na caixa abaixo: copie manualmente.', 'info');
    if (!navigator.clipboard) { manual(); return; }
    navigator.clipboard.writeText(code)
      .then(() => this.showToast('Código do save copiado! Guarde-o em lugar seguro.', 'success'))
      .catch(manual);
  }

  importSave() {
    const box = document.getElementById('save-code-textarea');
    const code = (box ? box.value : '').trim();
    if (!code) { this.showToast('Cole o código do save na caixa primeiro!', 'warning'); return; }

    let payload;
    try {
      payload = this.decodeSaveCode(code);
    } catch (e) {
      this.showToast('Código inválido ou incompleto!', 'error');
      return;
    }
    const d = payload && payload.game === 'fish-clicker' ? payload.data : null;
    if (!d || typeof d !== 'object' || typeof d.gold !== 'number' || !Array.isArray(d.inventory)) {
      this.showToast('Este código não é um save do Fish Clicker!', 'error');
      return;
    }

    const when = payload.exportedAt ? new Date(payload.exportedAt).toLocaleString('pt-BR') : 'data desconhecida';
    if (!confirm(`Importar save de ${when} (${d.gold.toLocaleString('pt-BR')}G)?\nSeu progresso atual será SUBSTITUÍDO.`)) return;

    // Importar restaura o estado, não conta como tempo AFK desde a exportação
    d.lastActiveTime = Date.now();
    this.isResetting = true; // impede o autosave/beforeunload de sobrescrever o save importado
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(d));
    } catch (e) {
      this.isResetting = false;
      this.showToast('Não foi possível gravar o save importado!', 'error');
      return;
    }
    location.reload();
  }

  // Migração para as camadas de profundidade (v1.7): junta o Mundo 1 e o Mundo 2 num só
  // progresso, devolve o ouro da Bóia Trevo e da Rede Dupla (removidas) e atualiza nome,
  // raridade e camada dos peixes guardados. Monta o aviso único mostrado após o carregamento.
  // d: o save antigo (currentWorld, world1Data e world2SavedData só existem lá).
  migrateToDepthLayers(d) {
    const notes = [];
    const liveIsW2 = d.currentWorld === 2;
    const other = liveIsW2 ? d.world1Data : d.world2SavedData;

    // Preços antigos dos upgrades removidos, por mundo (base, multiplicador)
    const REMOVED = {
      w1: { boia_sorte: [350, 1.75], rede_dupla: [600, 2.0] },
      w2: { boia_sorte: [1800, 1.85], rede_dupla: [3200, 2.10] }
    };
    const refundFor = (levels, world) => Object.entries(REMOVED[world]).reduce((sum, [id, [base, mult]]) => {
      const lvl = (levels && levels[id]) || 0;
      for (let i = 0; i < lvl; i++) sum += Math.round(base * Math.pow(mult, i));
      return sum;
    }, 0);

    let refund = refundFor(this.upgradeLevels, liveIsW2 ? 'w2' : 'w1');
    if (other) {
      refund += refundFor(other.upgradeLevels, liveIsW2 ? 'w1' : 'w2');
      this.gold = (this.gold || 0) + (other.gold || 0);
      this.inventory = [...this.inventory, ...(other.inventory || [])];
      this.aquarium = [...this.aquarium, ...(other.aquarium || [])];
      this.unlockedRods = [...new Set([...this.unlockedRods, ...(other.unlockedRods || [])])];
      this.unlockedBaits = [...new Set([...this.unlockedBaits, ...(other.unlockedBaits || [])])];
      Object.entries(other.upgradeLevels || {}).forEach(([id, lvl]) => {
        this.upgradeLevels[id] = Math.max(this.upgradeLevels[id] || 0, lvl || 0);
      });
      notes.push('o ouro, os peixes, as varas, as iscas e os upgrades dos dois mundos foram juntados');
    }
    delete this.upgradeLevels.boia_sorte;
    delete this.upgradeLevels.rede_dupla;
    UPGRADES.forEach(u => {
      if ((this.upgradeLevels[u.id] || 0) > u.maxLevel) this.upgradeLevels[u.id] = u.maxLevel;
    });
    if (refund > 0) {
      this.gold += refund;
      notes.push(`${refund.toLocaleString('pt-BR')}G devolvidos pela Bóia Trevo e pela Rede Dupla, que saíram do jogo`);
    }

    // Só itens que ainda existem; equipa a vara mais funda e a melhor isca
    this.unlockedRods = RODS.filter(r => r.id === 'vara_bambu' || this.unlockedRods.includes(r.id)).map(r => r.id);
    this.unlockedBaits = BAITS.filter(b => b.id === 'minhoca' || this.unlockedBaits.includes(b.id)).map(b => b.id);
    if (other || !this.unlockedRods.includes(this.selectedRodId)) {
      this.selectedRodId = this.unlockedRods[this.unlockedRods.length - 1];
    }
    if (other || !this.unlockedBaits.includes(this.selectedBaitId)) {
      const best = BAITS.filter(b => !b.unbuyable && this.unlockedBaits.includes(b.id)).pop();
      this.selectedBaitId = best ? best.id : 'minhoca';
    }

    // Peixes guardados: nome, raridade, camada e ícone do catálogo novo
    [...this.inventory, ...this.aquarium].forEach(f => {
      const t = FISH_LIST.find(x => x.id === f?.id);
      if (!t) return;
      f.name = t.name;
      f.rarity = t.rarity;
      f.layer = t.layer;
      f.icon = t.icon;
    });

    // Aquário acima do limite: o excedente vai para o balde
    const maxAq = this.getMaxAquarium();
    if (this.aquarium.length > maxAq) {
      const extra = this.aquarium.splice(maxAq);
      this.inventory = [...extra, ...this.inventory];
      notes.push(`${extra.length} peixe(s) que não cabiam no aquário foram para o balde`);
    }

    this.currentLayer = this.getMaxLayer();
    if (liveIsW2 || other) {
      notes.unshift(`o Abismo agora são as camadas mais fundas do mesmo mundo; você está na camada ${this.currentLayer}`);
    }
    this.depthMigrationNotes = notes;
  }
}
