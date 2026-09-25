// Sumário do Pescador (estatísticas e recordes).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { ACHIEVEMENTS } from '../achievementsData.js';
import { FISH_LIST, RARITIES } from '../fishData.js';
import { BAITS, RODS } from '../itemsData.js';
import { sound } from '../sound.js';
import { BAITS_WORLD_2, FISH_WORLD_2, RODS_WORLD_2, WORLD2_BIOMES } from '../world2Data.js';

export class SummaryMethods {
  getTotalBloodMoonCatches() {
    if (typeof this.totalBloodMoonCatches === 'number' && this.totalBloodMoonCatches > 0) {
      return this.totalBloodMoonCatches;
    }
    let count = 0;
    if (this.discoveredFish) {
      Object.values(this.discoveredFish).forEach(d => {
        if (d && (d.caughtBloodMoon || d.caughtEclipse)) {
          count += (d.count || 1);
        }
      });
    }
    return count;
  }

  formatPlayTime(totalSec) {
    const sec = Math.max(0, Math.floor(totalSec || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  }

  renderMenuQuickStats() {
    const catchesEl = document.getElementById('menu-quick-catches');
    const goldEl = document.getElementById('menu-quick-gold');
    const goldenEl = document.getElementById('menu-quick-golden');
    const bloodEl = document.getElementById('menu-quick-bloodmoon');
    const timeEl = document.getElementById('menu-quick-playtime');

    if (catchesEl) catchesEl.textContent = (this.totalCatches || 0).toLocaleString('pt-BR');
    if (goldEl) goldEl.textContent = (this.gold || 0).toLocaleString('pt-BR') + 'G';
    if (goldenEl) goldenEl.textContent = (this.goldenFishCatches || 0).toLocaleString('pt-BR');
    if (bloodEl) bloodEl.textContent = (this.bloodMoonFishCatches || 0).toLocaleString('pt-BR');
    if (timeEl) timeEl.textContent = this.formatPlayTime(this.playTimeSeconds);
  }

  openSummary() {
    sound.playClick();
    this.renderSummary();
    const modal = document.getElementById('summary-modal');
    modal?.classList.remove('hidden');
  }

  closeSummary() {
    sound.playClick();
    const modal = document.getElementById('summary-modal');
    modal?.classList.add('hidden');
  }

  renderSummary() {
    const container = document.getElementById('summary-content');
    if (!container) return;

    const timeFooter = document.getElementById('summary-footer-time');
    if (timeFooter) {
      timeFooter.textContent = `Tempo de Jornada: ${this.formatPlayTime(this.playTimeSeconds)}`;
    }

    const allFishList = [...FISH_LIST, ...FISH_WORLD_2];
    const allFishMap = {};
    allFishList.forEach(f => { allFishMap[f.id] = f; });

    let biggestFish = null;
    let mostCaughtFish = null;
    const rarityCounts = {
      COMUM: 0,
      INCOMUM: 0,
      RARO: 0,
      EPICO: 0,
      LENDARIO: 0,
      MITICO: 0,
      SECRETO: 0
    };
    let totalCatalogedSpecies = 0;

    if (this.discoveredFish) {
      Object.entries(this.discoveredFish).forEach(([id, data]) => {
        if (!data) return;
        const fishDef = allFishMap[id];
        if (!fishDef) return;
        totalCatalogedSpecies++;
        const count = data.count || 1;
        const maxWeight = data.maxWeight || 0;

        const rKey = fishDef.rarity || 'COMUM';
        if (rarityCounts[rKey] !== undefined) {
          rarityCounts[rKey] += count;
        } else {
          rarityCounts.COMUM += count;
        }

        if (!biggestFish || maxWeight > biggestFish.maxWeight) {
          biggestFish = { def: fishDef, maxWeight };
        }

        if (!mostCaughtFish || count > mostCaughtFish.count) {
          mostCaughtFish = { def: fishDef, count };
        }
      });
    }

    const totalSpeciesInGame = allFishList.length;
    const totalBloodMoon = this.getTotalBloodMoonCatches();
    const totalAchievements = ACHIEVEMENTS.length || 20;
    const unlockedAchCount = (this.unlockedAchievements || []).length;
    const avgGoldPerCatch = Math.round((this.totalGoldEarned || 0) / Math.max(1, this.totalCatches || 0));

    // Nomes de Vara e Isca
    const allRodsList = [...RODS, ...(typeof RODS_WORLD_2 !== 'undefined' ? RODS_WORLD_2 : [])];
    const currentRod = allRodsList.find(r => r.id === this.selectedRodId)?.name || this.selectedRodId;
    const allBaitsList = [...BAITS, ...(typeof BAITS_WORLD_2 !== 'undefined' ? BAITS_WORLD_2 : [])];
    const currentBait = allBaitsList.find(b => b.id === this.selectedBaitId)?.name || this.selectedBaitId;

    // Bioma / Horário
    let locationDetail = '';
    if (this.currentWorld === 2) {
      const bInfo = WORLD2_BIOMES?.find(b => b.id === this.activeWorld2Biome);
      locationDetail = bInfo ? `${bInfo.name}` : 'Mundo 2: Abismo';
    } else {
      const timeNames = { day: 'Dia Claro', sunset: 'Pôr do Sol', night: 'Noite' };
      locationDetail = `Mundo 1: Lago Sagrado (${timeNames[this.timeOfDay] || 'Dia'})`;
    }

    // Ícones Pixel Art para o Sumário
    const pxlRod = `<svg class="w-4 h-4 inline-block" viewBox="0 0 16 16" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="2" y="13" width="2" height="2" fill="#78350f"/><rect x="3" y="12" width="2" height="2" fill="#92400e"/><rect x="4" y="11" width="2" height="2" fill="#b45309"/><rect x="2" y="11" width="2" height="2" fill="#cbd5e1"/><rect x="5" y="10" width="2" height="2" fill="#0284c7"/><rect x="6" y="9" width="2" height="2" fill="#0284c7"/><rect x="7" y="8" width="2" height="2" fill="#38bdf8"/><rect x="8" y="7" width="2" height="2" fill="#38bdf8"/><rect x="9" y="6" width="2" height="2" fill="#38bdf8"/><rect x="10" y="5" width="2" height="2" fill="#7dd3fc"/><rect x="11" y="4" width="2" height="2" fill="#7dd3fc"/><rect x="12" y="3" width="2" height="2" fill="#bae6fd"/><rect x="13" y="2" width="1" height="2" fill="#ffffff"/><rect x="13" y="4" width="1" height="6" fill="#94a3b8"/><rect x="12" y="10" width="2" height="1" fill="#facc15"/><rect x="11" y="9" width="1" height="2" fill="#facc15"/></svg>`;
    const pxlCoin = `<svg class="w-4 h-4 inline-block" viewBox="0 0 14 14" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="4" y="1" width="6" height="1" fill="#78350f"/><rect x="2" y="2" width="2" height="2" fill="#78350f"/><rect x="10" y="2" width="2" height="2" fill="#78350f"/><rect x="1" y="4" width="1" height="6" fill="#78350f"/><rect x="12" y="4" width="1" height="6" fill="#78350f"/><rect x="2" y="10" width="2" height="2" fill="#78350f"/><rect x="10" y="10" width="2" height="2" fill="#78350f"/><rect x="4" y="12" width="6" height="1" fill="#78350f"/><rect x="4" y="2" width="6" height="1" fill="#fde047"/><rect x="2" y="4" width="10" height="6" fill="#facc15"/><rect x="4" y="10" width="6" height="2" fill="#ca8a04"/><rect x="3" y="3" width="2" height="2" fill="#fef08a"/><rect x="6" y="4" width="2" height="6" fill="#92400e"/><rect x="5" y="5" width="4" height="1.5" fill="#92400e"/><rect x="5" y="7.5" width="4" height="1.5" fill="#92400e"/></svg>`;
    const pxlSparkle = `<svg class="w-4 h-4 inline-block" viewBox="0 0 14 14" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="6" y="1" width="2" height="12" fill="#facc15"/><rect x="1" y="6" width="12" height="2" fill="#facc15"/><rect x="5" y="3" width="4" height="8" fill="#fde047"/><rect x="3" y="5" width="8" height="4" fill="#fde047"/><rect x="6" y="5" width="2" height="4" fill="#ffffff"/><rect x="5" y="6" width="4" height="2" fill="#ffffff"/><rect x="2" y="2" width="2" height="2" fill="#fef08a"/><rect x="10" y="2" width="2" height="2" fill="#fef08a"/><rect x="2" y="10" width="2" height="2" fill="#fef08a"/><rect x="10" y="10" width="2" height="2" fill="#fef08a"/></svg>`;
    const pxlBloodFish = `<svg class="w-4 h-4 inline-block" viewBox="0 0 16 16" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="3" y="5" width="9" height="6" fill="#dc2626"/><rect x="4" y="4" width="7" height="8" fill="#b91c1c"/><rect x="11" y="7" width="2" height="2" fill="#ef4444"/><rect x="13" y="6" width="2" height="4" fill="#991b1b"/><rect x="2" y="7" width="2" height="2" fill="#ef4444"/><rect x="4" y="6" width="2" height="2" fill="#fef08a"/><rect x="5" y="6.5" width="1" height="1" fill="#7f1d1d"/><rect x="7" y="3" width="2" height="2" fill="#991b1b"/><rect x="7" y="11" width="2" height="2" fill="#991b1b"/><rect x="5" y="5" width="4" height="1" fill="#f87171"/></svg>`;
    const pxlFish = `<svg class="w-3.5 h-3.5 inline-block shrink-0" viewBox="0 0 14 14" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="3" y="5" width="7" height="4" fill="#38bdf8"/><rect x="5" y="4" width="4" height="6" fill="#0284c7"/><rect x="10" y="6" width="2" height="2" fill="#38bdf8"/><rect x="1" y="4" width="2" height="2" fill="#0284c7"/><rect x="1" y="8" width="2" height="2" fill="#0284c7"/><rect x="8" y="5" width="1.5" height="1.5" fill="#ffffff"/><rect x="8.5" y="5.5" width="1" height="1" fill="#0f172a"/></svg>`;
    const pxlChart = `<svg class="w-3.5 h-3.5 inline-block shrink-0" viewBox="0 0 14 14" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="1" y="12" width="12" height="1.5" fill="#475569"/><rect x="2" y="8" width="2" height="4" fill="#06b6d4"/><rect x="2" y="8" width="2" height="1" fill="#67e8f9"/><rect x="5" y="5" width="2" height="7" fill="#10b981"/><rect x="5" y="5" width="2" height="1" fill="#6ee7b7"/><rect x="8" y="3" width="2" height="9" fill="#f59e0b"/><rect x="8" y="3" width="2" height="1" fill="#fde68a"/><rect x="11" y="1" width="2" height="11" fill="#ec4899"/><rect x="11" y="1" width="2" height="1" fill="#fbcfe8"/></svg>`;
    const pxlFinances = `<svg class="w-3.5 h-3.5 inline-block shrink-0" viewBox="0 0 14 14" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="3" y="2" width="8" height="10" fill="#15803d"/><rect x="4" y="3" width="6" height="8" fill="#22c55e"/><rect x="6" y="5" width="2" height="4" fill="#fef08a"/><rect x="2" y="4" width="10" height="1" fill="#166534"/><rect x="2" y="9" width="10" height="1" fill="#166534"/></svg>`;
    const pxlTrophy = `<svg class="w-3.5 h-3.5 inline-block shrink-0" viewBox="0 0 14 14" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="3" y="2" width="8" height="2" fill="#facc15"/><rect x="4" y="4" width="6" height="3" fill="#eab308"/><rect x="5" y="7" width="4" height="2" fill="#ca8a04"/><rect x="1" y="3" width="2" height="3" fill="#ca8a04"/><rect x="11" y="3" width="2" height="3" fill="#ca8a04"/><rect x="6" y="9" width="2" height="2" fill="#a16207"/><rect x="4" y="11" width="6" height="2" fill="#713f12"/><rect x="4" y="3" width="2" height="2" fill="#fef08a"/><rect x="5" y="11" width="4" height="1" fill="#eab308"/></svg>`;
    const pxlCompass = `<svg class="w-3.5 h-3.5 inline-block shrink-0" viewBox="0 0 14 14" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="4" y="1" width="6" height="1" fill="#0284c7"/><rect x="2" y="2" width="2" height="2" fill="#0284c7"/><rect x="10" y="2" width="2" height="2" fill="#0284c7"/><rect x="1" y="4" width="1" height="6" fill="#0284c7"/><rect x="12" y="4" width="1" height="6" fill="#0284c7"/><rect x="2" y="10" width="2" height="2" fill="#0284c7"/><rect x="10" y="10" width="2" height="2" fill="#0284c7"/><rect x="4" y="12" width="6" height="1" fill="#0284c7"/><rect x="6" y="3" width="2" height="4" fill="#ef4444"/><rect x="6" y="7" width="2" height="4" fill="#f1f5f9"/><rect x="6" y="6" width="2" height="2" fill="#facc15"/></svg>`;
    const pxlHook = `<svg class="w-3.5 h-3.5 inline-block shrink-0" viewBox="0 0 14 14" fill="none" style="image-rendering:pixelated; shape-rendering:crispEdges;"><rect x="6" y="1" width="2" height="2" fill="#94a3b8"/><rect x="7" y="3" width="1.5" height="6" fill="#cbd5e1"/><rect x="4" y="9" width="4.5" height="1.5" fill="#e2e8f0"/><rect x="3" y="6" width="1.5" height="4" fill="#e2e8f0"/><rect x="4" y="6" width="1.5" height="1.5" fill="#f59e0b"/></svg>`;

    container.innerHTML = `
      <!-- TOP KPI CARDS -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div class="bg-cyan-950/40 border-2 border-cyan-500/80 p-2 shadow-[2px_2px_0_#000] flex flex-col justify-between">
          <div class="flex items-center justify-between text-cyan-400">
            <span class="text-[8px] font-bold" style="font-family:var(--font-pixel);">TOTAL PESCADO</span>
            ${pxlRod}
          </div>
          <div class="text-base sm:text-lg font-bold text-white font-mono my-1 tracking-tight">
            ${(this.totalCatches || 0).toLocaleString('pt-BR')}
          </div>
          <div class="text-[8px] text-cyan-300/80" style="font-family:var(--font-pixel);">
            ${totalCatalogedSpecies}/${totalSpeciesInGame} espécies descobertas
          </div>
        </div>

        <div class="bg-amber-950/40 border-2 border-amber-500/80 p-2 shadow-[2px_2px_0_#000] flex flex-col justify-between">
          <div class="flex items-center justify-between text-amber-400">
            <span class="text-[8px] font-bold" style="font-family:var(--font-pixel);">OURO TOTAL</span>
            ${pxlCoin}
          </div>
          <div class="text-base sm:text-lg font-bold text-amber-300 font-mono my-1 tracking-tight">
            ${(this.totalGoldEarned || 0).toLocaleString('pt-BR')}G
          </div>
          <div class="text-[8px] text-amber-200/80" style="font-family:var(--font-pixel);">
            No bolso: ${(this.gold || 0).toLocaleString('pt-BR')}G
          </div>
        </div>

        <div class="bg-yellow-950/40 border-2 border-yellow-500/80 p-2 shadow-[2px_2px_0_#000] flex flex-col justify-between">
          <div class="flex items-center justify-between text-yellow-400">
            <span class="text-[8px] font-bold" style="font-family:var(--font-pixel);">PEIXES DOURADOS</span>
            ${pxlSparkle}
          </div>
          <div class="text-base sm:text-lg font-bold text-yellow-300 font-mono my-1 tracking-tight">
            ${(this.goldenFishCatches || 0).toLocaleString('pt-BR')}
          </div>
          <div class="text-[8px] text-yellow-200/80" style="font-family:var(--font-pixel);">
            Frenesis de ouro ativados
          </div>
        </div>

        <div class="bg-red-950/40 border-2 border-red-500/80 p-2 shadow-[2px_2px_0_#000] flex flex-col justify-between">
          <div class="flex items-center justify-between text-red-400">
            <span class="text-[8px] font-bold" style="font-family:var(--font-pixel);">LUA SANGRENTA</span>
            ${pxlBloodFish}
          </div>
          <div class="text-base sm:text-lg font-bold text-red-400 font-mono my-1 tracking-tight">
            ${(this.bloodMoonFishCatches || 0).toLocaleString('pt-BR')}
          </div>
          <div class="text-[8px] text-red-300/80" style="font-family:var(--font-pixel);">
            Peixes da Lua Sangrenta fisgados
          </div>
        </div>
      </div>

      <!-- SEÇÃO 1: RECORDES & CAPTURAS NOTÁVEIS -->
      <div class="bg-slate-950/80 border-2 border-slate-700 p-2.5 space-y-2" style="box-shadow:2px 2px 0 #000;">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span class="text-[8.5px] font-bold text-cyan-300 flex items-center gap-1.5" style="font-family:var(--font-pixel);">
            ${pxlFish} RECORDES DE CAPTURA
          </span>
          <span class="text-[8px] text-slate-400" style="font-family:var(--font-pixel);">Maior peso e espécies mais pescadas</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <!-- Card Maior Peixe -->
          <div class="bg-slate-900 border border-slate-800 p-2 flex items-center gap-2.5">
            <div class="w-12 h-12 bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
              ${biggestFish ? `<img src="${this.getFishSpriteURL(biggestFish.def.icon)}" class="w-10 h-10 object-contain" style="image-rendering:pixelated;" alt="${biggestFish.def.name}">` : '<span class="text-slate-600 text-lg">?</span>'}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[8px] text-slate-400 uppercase tracking-wider" style="font-family:var(--font-pixel);">MAIOR PEIXE FISGADO</div>
              <div class="text-[8.5px] font-bold text-slate-200 truncate" style="font-family:var(--font-pixel);">
                ${biggestFish ? biggestFish.def.name : 'Nenhum peixe ainda'}
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[8.5px] font-mono font-bold text-amber-300">${biggestFish ? biggestFish.maxWeight.toFixed(2) + ' kg' : '0.00 kg'}</span>
                ${biggestFish ? `<span class="text-[8px] font-bold px-1 py-0.2" style="font-family:var(--font-pixel); background-color:${(RARITIES[biggestFish.def.rarity] || RARITIES.COMUM).color}22; color:${(RARITIES[biggestFish.def.rarity] || RARITIES.COMUM).color}; border:1px solid ${(RARITIES[biggestFish.def.rarity] || RARITIES.COMUM).color}66;">${(RARITIES[biggestFish.def.rarity] || RARITIES.COMUM).label}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Card Peixe Mais Pescado -->
          <div class="bg-slate-900 border border-slate-800 p-2 flex items-center gap-2.5">
            <div class="w-12 h-12 bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
              ${mostCaughtFish ? `<img src="${this.getFishSpriteURL(mostCaughtFish.def.icon)}" class="w-10 h-10 object-contain" style="image-rendering:pixelated;" alt="${mostCaughtFish.def.name}">` : '<span class="text-slate-600 text-lg">?</span>'}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[8px] text-slate-400 uppercase tracking-wider" style="font-family:var(--font-pixel);">ESPÉCIE MAIS FREQUENTE</div>
              <div class="text-[8.5px] font-bold text-slate-200 truncate" style="font-family:var(--font-pixel);">
                ${mostCaughtFish ? mostCaughtFish.def.name : 'Nenhum peixe ainda'}
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[8.5px] font-mono font-bold text-cyan-300">${mostCaughtFish ? mostCaughtFish.count.toLocaleString('pt-BR') + ' capturas' : '0'}</span>
                ${mostCaughtFish ? `<span class="text-[8px] font-bold px-1 py-0.2" style="font-family:var(--font-pixel); background-color:${(RARITIES[mostCaughtFish.def.rarity] || RARITIES.COMUM).color}22; color:${(RARITIES[mostCaughtFish.def.rarity] || RARITIES.COMUM).color}; border:1px solid ${(RARITIES[mostCaughtFish.def.rarity] || RARITIES.COMUM).color}66;">${(RARITIES[mostCaughtFish.def.rarity] || RARITIES.COMUM).label}</span>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Capacidade de Armazenamento -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[8px]" style="font-family:var(--font-pixel);">
          <div class="bg-slate-900/60 p-1.5 border border-slate-800 flex items-center justify-between">
            <span class="text-slate-400">Balde Atual:</span>
            <span class="font-mono text-cyan-300 font-bold">${this.inventory.length} / ${this.getMaxInventory()}</span>
          </div>
          <div class="bg-slate-900/60 p-1.5 border border-slate-800 flex items-center justify-between">
            <span class="text-slate-400">Aquário:</span>
            <span class="font-mono text-cyan-300 font-bold">${this.aquarium.length} / ${this.getMaxAquarium()}</span>
          </div>
          <div class="col-span-2 sm:col-span-1 bg-slate-900/60 p-1.5 border border-slate-800 flex items-center justify-between">
            <span class="text-slate-400">Progresso Álbum:</span>
            <span class="font-mono text-emerald-400 font-bold">${Math.round((totalCatalogedSpecies / totalSpeciesInGame) * 100)}%</span>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 2: PEIXES POR RARIDADE -->
      <div class="bg-slate-950/80 border-2 border-slate-700 p-2.5 space-y-2" style="box-shadow:2px 2px 0 #000;">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span class="text-[8.5px] font-bold text-amber-300 flex items-center gap-1.5" style="font-family:var(--font-pixel);">
            ${pxlChart} DISTRIBUIÇÃO POR RARIDADE
          </span>
          <span class="text-[8px] text-slate-400" style="font-family:var(--font-pixel);">Total de capturas por escalão</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
          ${Object.entries(RARITIES).map(([key, r]) => {
            const count = rarityCounts[key] || 0;
            return `
              <div class="bg-slate-900 border p-1.5 flex flex-col justify-between" style="border-color:${r.color}55;">
                <div class="text-[8px] font-bold uppercase truncate" style="font-family:var(--font-pixel); color:${r.color};">
                  ${r.label}
                </div>
                <div class="text-[10px] font-mono font-bold text-white my-0.5">
                  ${count.toLocaleString('pt-BR')}
                </div>
                <div class="text-[8px] text-slate-500" style="font-family:var(--font-pixel);">
                  ${this.totalCatches > 0 ? Math.round((count / this.totalCatches) * 100) : 0}% do total
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- SEÇÃO 3: ECONOMIA & METAS -->
      <div class="bg-slate-950/80 border-2 border-slate-700 p-2.5 space-y-2" style="box-shadow:2px 2px 0 #000;">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span class="text-[8.5px] font-bold text-emerald-300 flex items-center gap-1.5" style="font-family:var(--font-pixel);">
            ${pxlFinances} RENDIMENTO & FINANÇAS
          </span>
          <span class="text-[8px] text-slate-400" style="font-family:var(--font-pixel);">Fluxo de caixa e automações</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[8px]" style="font-family:var(--font-pixel);">
          <div class="bg-slate-900 border border-slate-800 p-2">
            <div class="text-slate-400 text-[8px]">MÉDIA POR CAPTURA</div>
            <div class="text-[11px] font-mono font-bold text-amber-300 mt-1">${avgGoldPerCatch.toLocaleString('pt-BR')}G</div>
            <div class="text-[8px] text-slate-500 mt-0.5">Considerando bônus & auras</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2">
            <div class="text-slate-400 text-[8px]">PESCA AUTOMÁTICA</div>
            <div class="text-[10px] font-bold ${this.autoFisherEnabled ? 'text-emerald-400' : 'text-red-400'} mt-1">
              ${this.autoFisherEnabled ? '● HABILITADA' : '○ DESATIVADA'}
            </div>
            <div class="text-[8px] text-slate-500 mt-0.5">Nível ${this.upgradeLevels?.auto_pescador || 0}</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2">
            <div class="text-slate-400 text-[8px]">VENDA AUTOMÁTICA</div>
            <div class="text-[10px] font-bold ${this.autoSellerEnabled ? 'text-emerald-400' : 'text-red-400'} mt-1">
              ${this.autoSellerEnabled ? '● HABILITADA' : '○ DESATIVADA'}
            </div>
            <div class="text-[8px] text-slate-500 mt-0.5">${(this.autoSellFilter || []).join(', ') || 'Nenhum'}</div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 4: PROGRESSÃO, SANTUÁRIO & EXPEDIÇÃO -->
      <div class="bg-slate-950/80 border-2 border-slate-700 p-2.5 space-y-2" style="box-shadow:2px 2px 0 #000;">
        <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span class="text-[8.5px] font-bold text-purple-300 flex items-center gap-1.5" style="font-family:var(--font-pixel);">
            ${pxlTrophy} PROGRESSÃO & SANTUÁRIO MÍSTICO
          </span>
          <span class="text-[8px] text-slate-400" style="font-family:var(--font-pixel);">Metas permanentes</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[8px]" style="font-family:var(--font-pixel);">
          <div class="bg-slate-900 border border-slate-800 p-2">
            <div class="text-slate-400 text-[8px]">SALA DE TROFÉUS</div>
            <div class="text-[10px] font-mono font-bold text-amber-300 mt-0.5">${unlockedAchCount} / ${totalAchievements}</div>
            <div class="text-[8px] text-slate-500">${Math.round((unlockedAchCount / totalAchievements) * 100)}% concluído</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2">
            <div class="text-slate-400 text-[8px]">OLHOS DE PEIXE</div>
            <div class="text-[10px] font-mono font-bold text-cyan-300 mt-0.5">${this.fishEyesCount || 0} / ${this.fishEyesTotal || 0}</div>
            <div class="text-[8px] text-slate-500">Disponíveis / Despertados</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2">
            <div class="text-slate-400 text-[8px]">OFERENDAS SANTUÁRIO</div>
            <div class="text-[10px] font-mono font-bold text-purple-300 mt-0.5">Ciclo ${this.offeringCycle || 1}</div>
            <div class="text-[8px] text-slate-500">${Object.keys(this.speciesDonations || {}).length} espécies doadas</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 p-2">
            <div class="text-slate-400 text-[8px]">ALTAR DAS ALMAS</div>
            <div class="text-[10px] font-mono font-bold text-red-400 mt-0.5">${this.sacrificedFishCount || 0} / 15</div>
            <div class="text-[8px] text-slate-500">${this.chapter1Completed ? 'Portal Ativado!' : 'Em andamento'}</div>
          </div>
        </div>

        <!-- Linha de Expedição Atual -->
        <div class="bg-slate-900/90 border border-slate-800 p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[8px]" style="font-family:var(--font-pixel);">
          <div class="flex items-center gap-2">
            <span class="text-cyan-400 flex items-center gap-1">${pxlCompass} LOCALIZAÇÃO:</span>
            <span class="text-slate-200">${locationDetail}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-amber-400 flex items-center gap-1">${pxlHook} EQUIPE:</span>
            <span class="text-slate-300 truncate">${currentRod} & ${currentBait}</span>
          </div>
        </div>
      </div>
    `;
  }
}
