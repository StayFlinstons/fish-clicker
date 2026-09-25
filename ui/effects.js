// Efeitos visuais efêmeros: ondulação, notificação de captura, texto flutuante e toasts.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { RARITIES } from '../fishData.js';

export class EffectMethods {
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
}
