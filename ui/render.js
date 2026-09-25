// Renderização do modo pesca: header, buffs, loja, balde, aquário e cache de sprites.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { BUFF_LABELS, RARITIES } from '../fishData.js';
import { BAITS, RODS, UPGRADES } from '../itemsData.js';
import { PIXEL_ICONS, getBaitIconDataURL, getBloodMoonFishDataURL, getFishDataURL, getFishSilhouetteDataURL, getRodIconDataURL, getUpgradeIconDataURL } from '../pixelArt.js';
import { BAITS_WORLD_2, RODS_WORLD_2, UPGRADES_WORLD_2 } from '../world2Data.js';

export class RenderMethods {
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

    if (b.goldMultiplier > 0)     pills.push(`<span class="buff-pill px-1.5 py-0.5 border border-amber-700 text-amber-300 text-[8px] font-bold" style="font-family:var(--font-pixel);">+${Math.round(b.goldMultiplier*100)}% ${BUFF_LABELS.gold_multiplier.toUpperCase()}</span>`);
    if (b.luckBonus > 0)          pills.push(`<span class="buff-pill px-1.5 py-0.5 border border-purple-700 text-purple-300 text-[8px] font-bold" style="font-family:var(--font-pixel);">+${Math.round(b.luckBonus*100)}% ${BUFF_LABELS.luck_bonus.toUpperCase()}</span>`);
    if (b.fishingSpeedBonus > 0)  pills.push(`<span class="buff-pill px-1.5 py-0.5 border border-cyan-700 text-cyan-300 text-[8px] font-bold" style="font-family:var(--font-pixel);">+${Math.round(b.fishingSpeedBonus*100)}% ${BUFF_LABELS.fishing_speed.toUpperCase()}</span>`);
    if (b.doubleCatchChance > 0)  pills.push(`<span class="buff-pill px-1.5 py-0.5 border border-emerald-700 text-emerald-300 text-[8px] font-bold" style="font-family:var(--font-pixel);">+${Math.round(b.doubleCatchChance*100)}% ${BUFF_LABELS.double_catch_chance.toUpperCase()}</span>`);
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
                  <span class="text-[8px] text-cyan-400" title="Poder da vara: atrai espécimes mais pesados e favorece novos recordes de peso" style="font-family:var(--font-pixel); cursor:help;">PWR:${powerDisplay}</span>
                  ${rod.luckBonus > 0 ? `<span class="text-[8px] text-purple-400" style="font-family:var(--font-pixel);">+${Math.round(rod.luckBonus*100)}% ${BUFF_LABELS.luck_bonus}</span>` : ''}
                  ${(rod.fishingSpeedBonus || rod.speedBonus) > 0 ? `<span class="text-[8px] text-cyan-300" style="font-family:var(--font-pixel);">+${Math.round((rod.fishingSpeedBonus || rod.speedBonus)*100)}% ${BUFF_LABELS.fishing_speed}</span>` : ''}
                  ${rod.doubleCatchChance > 0 ? `<span class="text-[8px] text-emerald-400" style="font-family:var(--font-pixel);">+${Math.round(rod.doubleCatchChance*100)}% ${BUFF_LABELS.double_catch_chance}</span>` : ''}
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
                  <span class="text-[8px] text-purple-400" style="font-family:var(--font-pixel);">${BUFF_LABELS.luck_bonus}: ${bait.luckMultiplier}x</span>
                  ${bait.doubleCatchBonus > 0 ? `<span class="text-[8px] text-emerald-400" style="font-family:var(--font-pixel);">+${Math.round(bait.doubleCatchBonus*100)}% ${BUFF_LABELS.double_catch_chance}</span>` : ''}
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
      displayFish = displayFish.filter(f => this.getFishBuffs(f).some(b => b.type === 'fishing_speed' || b.type === 'auto_fish_speed' || b.type === 'all_stats'));
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
}
