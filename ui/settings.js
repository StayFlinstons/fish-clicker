// Configurações e menu principal.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { sound } from '../sound.js';

export class SettingsMethods {
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
      this.renderMenuQuickStats();
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
    this.lakeBgAnimator?.setEnabled(this.settings.waterParticles);

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
}
