// Modos de jogo (pesca vs ímã) e Pesca Magnética: cenários, tiers, Forja e Museu.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { FORGE_RECIPES, MAGNET_ITEMS, MAGNET_SCENARIOS, MAGNET_TIERS, MUSEUM_COLLECTIONS } from '../magnetData.js';
import { PIXEL_ICONS, getMagnetItemSpriteSVG, getMagnetSpriteSVG } from '../pixelArt.js';
import { sound } from '../sound.js';

export class MagnetMethods {
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

  // Sem chamadas no momento: o acesso ao modo ímã foi desativado para jogadores na v1.4.9
  // (o modo continua funcionando e é ativado pelo console: modoIma()). Não remover.
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

  // Sem chamadas no momento: troca de cenário do ímã (ponte/praia/floresta), parte do modo ímã pausado.
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

  // Sem chamadas no momento: apelido antigo de setMagnetLeftTab(), mantido por compatibilidade.
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
        btn.className = 'inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold border transition-all cursor-pointer bg-slate-800 text-cyan-300 border-cyan-400 shadow-[1px_1px_0_#000]';
      } else {
        btn.className = 'inline-flex items-center gap-1 px-2 py-0.5 text-[8px] font-bold border transition-all cursor-pointer bg-slate-900 text-slate-400 border-transparent hover:text-slate-200';
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
      <div class="bg-slate-950/80 p-2 border border-slate-800 text-[8px] text-slate-300 mb-2 flex items-center gap-1.5" style="font-family:var(--font-pixel);">
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
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 border text-[8px] font-bold ${hasEnough ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-red-950 text-red-300 border-red-800'}" style="font-family:var(--font-pixel);">
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
                ${isCrafted ? '<span class="text-[8px] px-1 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold shrink-0" style="font-family:var(--font-pixel);">ATIVO</span>' : ''}
              </div>
              <p class="text-[8px] text-slate-400 mt-0.5 leading-snug" style="font-family:var(--font-pixel);">${recipe.desc}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-1">
            ${matPills}
          </div>

          <div class="pt-1 border-t border-slate-800/80 flex justify-end">
            ${isCrafted
              ? '<span class="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-600 text-[8px] font-bold" style="font-family:var(--font-pixel);">✓ FORJADO</span>'
              : `<button onclick="window.game.craftForgeUpgrade('${recipe.id}')"
                  ${canCraft ? '' : 'disabled'}
                  class="pixel-btn w-full py-1.5 text-[8px] font-bold uppercase transition-all ${
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
      <div class="bg-slate-950/80 p-2 border border-slate-800 text-[8px] text-slate-300 flex items-center justify-between mb-2" style="font-family:var(--font-pixel);">
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
                <p class="text-[8px] text-slate-400" style="font-family:var(--font-pixel);">${col.rewardDesc}</p>
              </div>
            </div>
            <span class="px-1.5 py-0.5 text-[8px] font-bold border ${isComplete ? 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse' : 'bg-slate-900 text-slate-400 border-slate-700'}" style="font-family:var(--font-pixel);">
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
      <div class="bg-slate-950/80 p-2 border border-slate-800 text-[8px] text-slate-300 mb-2 flex items-center gap-1.5" style="font-family:var(--font-pixel);">
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
                <span class="text-[8px] px-1 bg-slate-900 border text-slate-400" style="border-color:${t.borderColor}; font-family:var(--font-pixel);">T${t.tier}</span>
              </div>
              <p class="text-[8px] text-slate-400 mt-0.5" style="font-family:var(--font-pixel);">Poder: <b class="text-amber-300">${t.power.toFixed(1)}x</b> | Puxada: ${t.pullSpeedSec}s</p>
              <p class="text-[8px] text-slate-500 mt-0.5" style="font-family:var(--font-pixel);">${t.desc}</p>
            </div>
          </div>

          <div class="shrink-0 text-right">
            ${isCurrent
              ? '<span class="px-2 py-1 bg-amber-950 text-amber-300 border border-amber-500 text-[8px] font-bold animate-pulse" style="font-family:var(--font-pixel);">★ EQUIPADO</span>'
              : isUnlocked
                ? '<span class="px-2 py-1 bg-slate-900 text-slate-400 border border-slate-700 text-[8px] font-bold" style="font-family:var(--font-pixel);">DESBLOQUEADO</span>'
                : '<span class="px-1.5 py-0.5 bg-slate-950 text-slate-600 border border-slate-800 text-[8px]" style="font-family:var(--font-pixel);">BLOQUEADO</span>'
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
        if (title) title.innerHTML = `<span class="inline-flex items-center gap-1.5 justify-center">${getMagnetItemSpriteSVG(caught.id, 18)} <span>${caught.name}</span> <span class="text-[8px] text-amber-400">(${caught.rarity.toUpperCase()})</span></span>`;
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
          <span class="absolute bottom-0.5 right-1 text-[8px] font-bold text-white bg-slate-950/90 px-1 border border-slate-700" style="font-family:var(--font-pixel);">
            x${count}
          </span>
          ${isDonated ? '<span class="absolute top-0.5 left-1 text-[8px] leading-none text-amber-400" title="Já doado ao Museu">★</span>' : ''}
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
      rarityEl.className = `text-[8px] px-1 py-0.2 border font-bold uppercase ${
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
          <button onclick="window.game.donateToMuseum('${item.id}')" class="pixel-btn px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-slate-950 font-bold text-[8px]" style="font-family:var(--font-pixel);">
            🏛 DOAR (+500G +1 Olho)
          </button>
        `;
      } else if (isDonated) {
        actHtml += `
          <span class="px-1.5 py-0.5 bg-cyan-950 border border-cyan-700/60 text-cyan-300 text-[8px]" style="font-family:var(--font-pixel);">
            ✓ DOADO
          </span>
        `;
      }

      // Se for cofre trancado
      if (item.isChest && count >= 1) {
        const hasGazua = Boolean(this.forgeUpgrades['gazua_mestre']);
        if (hasGazua) {
          actHtml += `
            <button onclick="window.game.openMagnetChest()" class="pixel-btn px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[8px] animate-pulse" style="font-family:var(--font-pixel);">
              🗝️ ABRIR COFRE
            </button>
          `;
        } else {
          actHtml += `
            <span class="px-1.5 py-0.5 bg-red-950 border border-red-800 text-red-300 text-[8px]" style="font-family:var(--font-pixel);">
              🔒 REQUER GAZUA
            </span>
          `;
        }
      }

      // Botão Vender 1x
      if (count >= 1) {
        actHtml += `
          <button onclick="window.game.sellMagnetItem('${item.id}', 1)" class="pixel-btn px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[8px]" style="font-family:var(--font-pixel);">
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
}
