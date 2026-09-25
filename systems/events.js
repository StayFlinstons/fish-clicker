// Eventos temporários: Peixe Dourado, Eclipse Sangrento e buffs temporários.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { UPGRADES, isCosmicOrHigherRod } from '../itemsData.js';
import { getFishDataURL } from '../pixelArt.js';
import { sound } from '../sound.js';

export class EventMethods {
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
        type: 'gold_frenzy', label: 'FRENESI DE OURO!', desc: '+200% ouro por 30s (acima do limite)',
        duration: 30000, multiplier: 2.0, color: '#ffd700'
      },
      {
        type: 'luck_surge', label: 'SORTE SUPREMA!', desc: '+100% sorte por 25s (acima do limite)',
        duration: 25000, multiplier: 1.0, color: '#a855f7'
      },
      {
        type: 'speed_burst', label: 'VELOCIDADE EXTREMA!', desc: '+50% velocidade por 20s (acima do limite)',
        duration: 20000, multiplier: 0.50, color: '#38bdf8'
      },
      {
        type: 'double_mania', label: 'MANIA DUPLA!', desc: '+50% chance dupla por 25s (acima do limite)',
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
      // Só Incomum ou melhor, mantendo a proporção natural entre essas raridades
      const count = 3 + Math.floor(Math.random() * 5);
      const buffs = this.getActiveBuffs();
      const chances = Object.entries(this.getRarityChances(buffs)).filter(([r]) => r !== 'COMUM');
      const total = chances.reduce((acc, [, p]) => acc + p, 0);
      let added = 0;
      for (let i = 0; i < count; i++) {
        if (this.inventory.length >= this.getMaxInventory()) break;
        let rand = Math.random() * total;
        let rarity = chances[chances.length - 1][0];
        for (const [r, p] of chances) {
          if (rand <= p) { rarity = r; break; }
          rand -= p;
        }
        const fish = this.rollFish(buffs, { rarity });
        this.inventory.unshift(fish);
        this.totalCatches++;
        added++;
      }
      reward.desc = added === 0
        ? 'Balde cheio: nenhum peixe coube!'
        : added < count
          ? `${added} de ${count} peixes (Incomum+) — o balde encheu!`
          : `${added} peixes Incomuns ou melhores!`;
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

  triggerBloodMoonEclipse() {
    try {
      sound.playCatch('SECRETO');
      sound.vibrateCatch('SECRETO');
    } catch (e) {
      console.warn('Erro ao tocar efeito sonoro:', e);
    }
    this.goldenFishCatches = (this.goldenFishCatches || 0) + 1;
    this.bloodMoonFishCatches = (this.bloodMoonFishCatches || 0) + 1;
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
          Peixes capturados têm chance de receber <span style="color:#ef4444; font-weight:bold;">Aura da Lua Sangrenta (10% de chance)</span> (+15% Ouro, +15% Sorte) ou <span style="color:#f87171; font-weight:bold;">Aura do Eclipse (10% de chance)</span> (+15% Vel. Pesca, +15% Pesca Dupla)!
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
      // Com o novo fundo pixel art dedicado do Eclipse com o sol negro centralizado, oculta o sol procedural extra
      const hasEclipseBg = !!document.getElementById('world1-bg-eclipse');
      if (hasEclipseBg) {
        skyEl.classList.add('hidden');
        skyEl.style.display = 'none';
      } else {
        skyEl.classList.remove('hidden');
        skyEl.style.display = 'flex';
      }
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

    this.applyTimeOfDay();
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

    this.applyTimeOfDay();
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

  // Os cronômetros dos buffs dourados são pílulas dentro da lista de buffs (renderBuffs).
  // Chamado a cada 1s: só redesenha enquanto há buff temporário ativo (ou logo após expirar).
  renderTempBuffIndicator() {
    const hasActive = this.tempBuffs.some(b => b.endsAt > Date.now());
    if (hasActive || this._hadTempBuffs) this.renderBuffs();
    this._hadTempBuffs = hasActive;
  }
}
