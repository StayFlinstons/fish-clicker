// Álbum de Peixes (enciclopédia).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { BUFF_CONFIG, RARITIES } from '../fishData.js';
import { sound } from '../sound.js';
import { formatDepth, getDepthLayer } from '../depthData.js';

export class AlbumMethods {
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
    const activeList = this.getFishCatalog();
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
        badge.className = 'min-w-[58px] text-center text-[8px] font-bold text-red-300 bg-red-950 px-1.5 py-0.5 border border-red-800/80 animate-pulse shrink-0 whitespace-nowrap';
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
        badge.className = 'min-w-[58px] text-center text-[8px] font-bold text-cyan-300 bg-cyan-950 px-1.5 py-0.5 border border-cyan-800/80 shrink-0 whitespace-nowrap';
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

  // Aba "Buffs" do álbum: a tabela de chances é gerada do BUFF_CONFIG para nunca sair de sincronia.
  renderAlbumBuffs() {
    const c = document.getElementById('album-buff-chances');
    if (!c) return;
    const styles = {
      COMUM:    ['bg-slate-900 border-slate-700', 'text-slate-400', 'text-slate-300'],
      INCOMUM:  ['bg-cyan-950/40 border-cyan-800', 'text-cyan-400', 'text-slate-300'],
      RARO:     ['bg-purple-950/40 border-purple-800', 'text-purple-400', 'text-slate-300'],
      EPICO:    ['bg-amber-950/40 border-amber-800', 'text-amber-400', 'text-slate-300'],
      LENDARIO: ['bg-red-950/40 border-red-800', 'text-red-400', 'text-slate-300'],
      MITICO:   ['bg-pink-950/40 border-pink-700', 'text-pink-400', 'text-pink-300 font-bold'],
      SECRETO:  ['bg-rose-950/50 border-red-600', 'text-red-400', 'text-red-300 font-bold']
    };
    const pct = v => Math.round(v * 100) + '%';
    const order = ['COMUM', 'INCOMUM', 'RARO', 'EPICO', 'LENDARIO', 'MITICO', 'SECRETO'];
    c.innerHTML = order.filter(r => BUFF_CONFIG[r]).map(r => {
      const conf = BUFF_CONFIG[r];
      const [box, labelCls, textCls] = styles[r] || styles.COMUM;
      let text;
      if (conf.tripleBuff) {
        text = '100% garantido SEMPRE com 3 buffs (Buff Triplo)!';
      } else if (conf.chance >= 1 && conf.doubleChance >= 1) {
        text = '100% garantido SEMPRE com 2 buffs (Buff Duplo)!';
      } else {
        text = conf.chance >= 1
          ? '<strong class="text-emerald-400">100% garantido</strong>'
          : `${pct(conf.chance)} chance de buff`;
        if (conf.doubleChance > 0) text += ` · <strong class="text-amber-400">${pct(conf.doubleChance)} Buff Duplo</strong>`;
      }
      return `
        <div class="p-1.5 ${box} border flex items-center justify-between gap-2">
          <span class="${labelCls} font-bold">${(RARITIES[r] || {}).label || r}</span>
          <span class="${textCls} text-right">${text}</span>
        </div>`;
    }).join('');
  }

  renderAlbum() {
    const grid = document.getElementById('album-grid');
    if (!grid) return;

    this.updateAlbumBadge();

    const activeList = this.getFishCatalog();
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

    const maxLayer = this.getMaxLayer();
    let lastLayer = 0;
    grid.innerHTML = visibleList.map(fish => {
      // Cabeçalho de cada camada de profundidade
      let header = '';
      if (fish.layer !== lastLayer) {
        lastLayer = fish.layer;
        const L = getDepthLayer(fish.layer);
        const inLayer = activeList.filter(f => f.layer === fish.layer && !f.secret);
        const found = inLayer.filter(f => this.discoveredFish[f.id]).length;
        const locked = fish.layer > maxLayer;
        header = `
          <div class="col-span-full flex items-center justify-between gap-2 px-2 py-1.5 border-b-2 mt-1" style="border-color:${L.themeColor}; font-family:var(--font-pixel);">
            <span class="text-[10px] font-bold" style="color:${L.themeColor};">${L.icon} ${L.name} <span class="text-slate-400 font-normal">${formatDepth(L.minDepth)}–${formatDepth(L.maxDepth)}</span></span>
            <span class="text-[8px] text-slate-400 whitespace-nowrap">${locked ? '🔒 ' : ''}${found}/${inLayer.length}</span>
          </div>`;
      }
      const isDiscovered = !!this.discoveredFish[fish.id];
      const data = this.discoveredFish[fish.id] || { maxWeight: 0, count: 0, caughtBloodMoon: false, caughtEclipse: false };
      const r = RARITIES[fish.rarity] || RARITIES.COMUM;
      const spriteURL = isDiscovered ? this.getFishSpriteURL(fish.icon) : this.getFishSilhouetteURL(fish.icon);

      let timeBadge = '';
      if (fish.timeExclusive === 'day') {
        timeBadge = '<span class="text-[8px] font-bold px-1.5 py-0.5 border text-amber-300 border-amber-500/80 bg-amber-950/80 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">☀️ DIA</span>';
      } else if (fish.timeExclusive === 'sunset') {
        timeBadge = '<span class="text-[8px] font-bold px-1.5 py-0.5 border text-orange-300 border-orange-500/80 bg-orange-950/80 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">🌅 PÔR DO SOL</span>';
      } else if (fish.timeExclusive === 'night') {
        timeBadge = '<span class="text-[8px] font-bold px-1.5 py-0.5 border text-indigo-300 border-indigo-500/80 bg-indigo-950/80 shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);">🌙 NOITE</span>';
      }


      const isSecretCard = fish.secret && isDiscovered;

      return header + `
        <div class="p-2.5 sm:p-3 border-2 ${isDiscovered ? 'bg-slate-900/90' : 'bg-slate-950/70 border-slate-800 opacity-60'} flex items-start gap-3 pixel-border-thin min-w-0 ${isSecretCard ? 'shadow-[0_0_16px_rgba(220,38,38,0.45)]' : ''}" style="${isDiscovered ? `border-color:${r.border}; background:${r.bg};` : ''}">
          <div class="w-14 h-12 shrink-0 flex items-center justify-center ${isSecretCard ? 'bg-black border-2 border-red-600/90 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : 'bg-slate-950/70 border border-slate-800'} p-1 mt-0.5">
            <img src="${spriteURL}" class="w-12 h-8 object-contain ${isDiscovered ? '' : 'brightness-0 contrast-200'} ${isSecretCard ? 'animate-pulse' : ''}" alt="${fish.name}" style="image-rendering:pixelated;">
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] sm:text-[11px] font-bold ${isDiscovered ? (isSecretCard ? 'text-red-300' : 'text-slate-100') : 'text-slate-500'} leading-tight break-words" style="font-family:var(--font-pixel);"><span class="text-slate-400 font-normal">#${fish.numId || '?'}</span> ${isDiscovered ? fish.name : '???'}</span>
              ${isSecretCard ? `
                <span class="text-[8px] font-bold px-1.5 py-0.5 border text-red-300 border-red-500/80 bg-red-950/90 shrink-0 whitespace-nowrap shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" style="font-family:var(--font-pixel);">🌌 SECRETO</span>
              ` : `
                <span class="text-[8px] font-bold px-1 py-0.5 border shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);color:${isDiscovered ? r.color : '#64748b'};border-color:${isDiscovered ? r.border : '#334155'};background:rgba(0,0,0,0.5);">${r.label}</span>
                ${timeBadge}
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
                <span class="text-[8px] font-bold px-1.5 py-0.5 border ${data.caughtBloodMoon ? 'border-red-500 bg-red-950/90 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'border-slate-800 bg-slate-950/80 text-slate-600'} shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);" title="${data.caughtBloodMoon ? 'Capturado com Aura da Lua Sangrenta (+15% Ouro, +15% Sorte)' : 'Ainda não capturado com Aura da Lua Sangrenta'}">
                  🩸 ${data.caughtBloodMoon ? 'LUA SANGRENTA' : 'LUA SANGRENTA (?)'}
                </span>
                <span class="text-[8px] font-bold px-1.5 py-0.5 border ${data.caughtEclipse ? 'border-red-700 bg-black/95 text-red-400 shadow-[0_0_8px_rgba(185,28,28,0.6)]' : 'border-slate-800 bg-slate-950/80 text-slate-600'} shrink-0 whitespace-nowrap" style="font-family:var(--font-pixel);" title="${data.caughtEclipse ? 'Capturado com Aura do Eclipse (+15% Vel. Pesca, +15% Pesca Dupla)' : 'Ainda não capturado com Aura do Eclipse'}">
                  🌑 ${data.caughtEclipse ? 'ECLIPSE' : 'ECLIPSE (?)'}
                </span>
              </div>

              ${fish.buff ? `
                <div class="text-[8px] sm:text-[8.5px] ${isSecretCard ? 'text-red-300 bg-red-950/70 border-red-700/80' : 'text-purple-300 bg-purple-950/60 border-purple-800/60'} mt-1.5 px-2 py-1 border leading-relaxed break-words" style="font-family:var(--font-pixel);">
                  ★ ${this.formatFishBuffText(fish.buff)}
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
}
