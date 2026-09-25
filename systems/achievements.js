// Conquistas (Sala de Troféus).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { ACHIEVEMENTS } from '../achievementsData.js';
import { PIXEL_ICONS } from '../pixelArt.js';
import { sound } from '../sound.js';

export class AchievementMethods {
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
}
