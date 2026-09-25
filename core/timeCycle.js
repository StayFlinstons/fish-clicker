// Ciclo Dia / Pôr do Sol / Noite (fases de 5 min, persistidas por offset).
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { PIXEL_ICONS } from '../pixelArt.js';
import { sound } from '../sound.js';
import { formatDepth, getDepthLayer } from '../depthData.js';

export class TimeCycleMethods {
  getRawMsRemaining() {
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const virtualNow = Date.now() + (this.timeOffsetMs || 0);
    return PHASE_DURATION_MS - (virtualNow % PHASE_DURATION_MS);
  }

  getCycleTimeOfDay() {
    // Cada fase dura exatamente 5 minutos (300.000 ms)
    // Sincronizado globalmente via timestamp com suporte a offset de pulo: 0 = day, 1 = sunset, 2 = night
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const phases = ['day', 'sunset', 'night'];
    const virtualNow = Date.now() + (this.timeOffsetMs || 0);
    const phaseIndex = Math.floor(virtualNow / PHASE_DURATION_MS) % phases.length;
    return phases[phaseIndex];
  }

  getTimeRemainingInPhase() {
    const msRemaining = this.getRawMsRemaining();
    const min = Math.floor(msRemaining / 60000);
    const sec = Math.floor((msRemaining % 60000) / 1000);
    return {
      min,
      sec,
      text: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    };
  }

  skipTimeOfDay() {
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const msRemaining = this.getRawMsRemaining();
    // Adiciona o tempo restante da fase atual + 50ms para avançar para o início da próxima
    this.timeOffsetMs = (this.timeOffsetMs || 0) + msRemaining + 50;
    const newPhase = this.getCycleTimeOfDay();
    this.timeOfDay = newPhase;
    this.applyTimeOfDay();
    if (typeof sound !== 'undefined') {
      sound.playUpgrade?.() || sound.playClick?.();
    }
    const msgs = {
      day: 'Horário pulado para: DIA ☀️ (05:00)',
      sunset: 'Horário pulado para: PÔR DO SOL 🌅 (05:00)',
      night: 'Horário pulado para: NOITE 🌙 (05:00)'
    };
    this.showToast(msgs[newPhase] || `Horário pulado para: ${newPhase.toUpperCase()}`, 'info');
    this.saveGame();
    return newPhase;
  }

  showTimeOfDayStatus() {
    sound.playClick?.();
    const layer = getDepthLayer(this.getCurrentLayer());
    if (!layer.sunlit) {
      this.showToast(`${layer.icon} ${layer.name} (${formatDepth(layer.minDepth)} a ${formatDepth(layer.maxDepth)}): a luz do sol não chega aqui, o horário não muda os peixes.`, 'info');
      return;
    }
    const rem = this.getTimeRemainingInPhase();
    const names = { day: 'DIA ☀️', sunset: 'PÔR DO SOL 🌅', night: 'NOITE 🌙' };
    const nextNames = { day: 'Pôr do Sol 🌅', sunset: 'Noite 🌙', night: 'Dia ☀️' };
    const currName = names[this.timeOfDay] || (this.timeOfDay || 'DIA').toUpperCase();
    const nextName = nextNames[this.timeOfDay] || 'Próximo';
    this.showToast(`Horário atual: ${currName} | Muda para ${nextName} em ${rem.text} (aguarde os 5m)`, 'info');
  }

  setTimeOfDay(targetPhase) {
    const phases = ['day', 'sunset', 'night'];
    const p = (targetPhase || '').toLowerCase();
    if (!phases.includes(p)) return false;
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const currPhase = this.getCycleTimeOfDay();
    const currIdx = phases.indexOf(currPhase);
    const targetIdx = phases.indexOf(p);
    const neededSteps = (targetIdx - currIdx + phases.length) % phases.length;

    const msRemaining = this.getRawMsRemaining();
    if (neededSteps === 0) {
      // Reinicia os 5 minutos da fase atual
      const virtualNow = Date.now() + (this.timeOffsetMs || 0);
      const elapsed = virtualNow % PHASE_DURATION_MS;
      this.timeOffsetMs = (this.timeOffsetMs || 0) - elapsed;
    } else {
      this.timeOffsetMs = (this.timeOffsetMs || 0) + msRemaining + (neededSteps - 1) * PHASE_DURATION_MS + 50;
    }

    this.timeOfDay = p;
    this.applyTimeOfDay();
    if (typeof sound !== 'undefined') {
      sound.playUpgrade?.() || sound.playClick?.();
    }
    const msgs = {
      day: 'Horário definido para: DIA ☀️ (05:00)',
      sunset: 'Horário definido para: PÔR DO SOL 🌅 (05:00)',
      night: 'Horário definido para: NOITE 🌙 (05:00)'
    };
    this.showToast(msgs[p] || `Horário: ${p.toUpperCase()}`, 'info');
    this.saveGame();
    return true;
  }

  initTimeOfDay() {
    const phases = ['day', 'sunset', 'night'];
    const PHASE_DURATION_MS = 5 * 60 * 1000;
    const cycleLen = phases.length * PHASE_DURATION_MS;

    // Se temos um horário salvo válido, garantimos que ao dar F5 voltamos exatamente para ele!
    if (this.timeOfDay && phases.includes(this.timeOfDay)) {
      const targetIndex = phases.indexOf(this.timeOfDay);
      let rem = this.savedPhaseMsRemaining;

      if (typeof rem !== 'number' || isNaN(rem) || rem <= 0) {
        rem = PHASE_DURATION_MS;
      } else if (this.timeSavedAt) {
        const elapsed = Date.now() - this.timeSavedAt;
        if (elapsed > 0) {
          if (rem - elapsed > 1000) {
            rem = rem - elapsed;
          } else {
            rem = PHASE_DURATION_MS;
          }
        }
      }

      const now = Date.now();
      const currentCycleBase = Math.floor(now / cycleLen) * cycleLen;
      let targetVirtualNow = currentCycleBase + targetIndex * PHASE_DURATION_MS + (PHASE_DURATION_MS - rem);
      while (targetVirtualNow < now) {
        targetVirtualNow += cycleLen;
      }
      this.timeOffsetMs = targetVirtualNow - now;
    } else {
      this.timeOfDay = this.getCycleTimeOfDay();
    }

    this.applyTimeOfDay();
    this.startTimeCycleLoop();
  }

  startTimeCycleLoop() {
    if (this._timeCycleTimer) clearInterval(this._timeCycleTimer);

    // Checa a cada segundo se o horário deve virar
    this._timeCycleTimer = setInterval(() => {
      const newTime = this.getCycleTimeOfDay();
      const remaining = this.getTimeRemainingInPhase();
      this.updateTimeIndicatorTooltip(remaining);

      if (newTime !== this.timeOfDay) {
        this.timeOfDay = newTime;
        this.applyTimeOfDay();
        this.resetSonar();
        this.saveGame();
        const msgs = {
          day: 'O sol nasceu! Agora é DIA ☀️',
          sunset: 'O entardecer chegou! Agora é PÔR DO SOL 🌅',
          night: 'A noite caiu! Agora é NOITE 🌙'
        };
        if (getDepthLayer(this.getCurrentLayer()).sunlit) {
          this.showToast(msgs[newTime] || `Horário: ${newTime.toUpperCase()}`, 'info');
        }
      }
    }, 1000);

    this.updateTimeIndicatorTooltip(this.getTimeRemainingInPhase());
  }

  updateTimeIndicatorTooltip(remaining) {
    const btn = document.getElementById('btn-toggle-time');
    if (!btn || !getDepthLayer(this.getCurrentLayer()).sunlit) return;
    const names = { day: 'DIA', sunset: 'PÔR DO SOL', night: 'NOITE' };
    const nextNames = { day: 'Pôr do Sol', sunset: 'Noite', night: 'Dia' };
    const currName = names[this.timeOfDay] || this.timeOfDay;
    const nextName = nextNames[this.timeOfDay] || 'Próximo';
    btn.title = `Horário do Jogo: ${currName} (Muda para ${nextName} em ${remaining.text} - ciclo de 5m)`;
  }

  applyTimeOfDay() {
    const btn = document.getElementById('btn-toggle-time');
    const lakeArea = document.getElementById('fishing-lake-area');

    // Camadas do mar usam o cenário próprio; o horário só aparece onde há sol
    if (this.applyLayerScenery()) {
      const layer = getDepthLayer(this.getCurrentLayer());
      if (btn) {
        if (layer.sunlit) {
          btn.innerHTML = this.timeOfDay === 'day' ? (PIXEL_ICONS.day || PIXEL_ICONS.sun) :
                          this.timeOfDay === 'sunset' ? PIXEL_ICONS.sunset : (PIXEL_ICONS.night || PIXEL_ICONS.moon);
          this.updateTimeIndicatorTooltip(this.getTimeRemainingInPhase());
        } else {
          btn.innerHTML = `<span class="text-sm select-none">${layer.icon}</span>`;
          btn.title = `${layer.name}: sem luz do sol`;
        }
      }
      this.waterRenderer?.setTimeOfDay(this.timeOfDay);
      return;
    }

    if (btn) {
      const icon = this.timeOfDay === 'day' ? (PIXEL_ICONS.day || PIXEL_ICONS.sun) :
                   this.timeOfDay === 'sunset' ? PIXEL_ICONS.sunset :
                   (PIXEL_ICONS.night || PIXEL_ICONS.moon);
      btn.innerHTML = icon;
      this.updateTimeIndicatorTooltip(this.getTimeRemainingInPhase());
    }

    if (this.waterRenderer) {
      this.waterRenderer.setTimeOfDay(this.timeOfDay);
    }

    // Alterna suavemente os fundos temáticos em pixel art do Mundo 1 (Dia, Pôr do Sol, Noite, Eclipse)
    const bgDia = document.getElementById('world1-bg-dia');
    const bgSunset = document.getElementById('world1-bg-sunset');
    const bgNoite = document.getElementById('world1-bg-noite');
    const bgEclipse = document.getElementById('world1-bg-eclipse');
    const isEclipse = Boolean(this.bloodMoonActive || this.bloodMoonEventActive);

    if (bgDia && bgSunset && bgNoite) {
      if (isEclipse && bgEclipse) {
        bgDia.style.opacity = '0';
        bgSunset.style.opacity = '0';
        bgNoite.style.opacity = '0';
        bgEclipse.style.opacity = '1';
      } else {
        if (bgEclipse) bgEclipse.style.opacity = '0';
        bgDia.style.opacity = this.timeOfDay === 'day' ? '1' : '0';
        bgSunset.style.opacity = this.timeOfDay === 'sunset' ? '1' : '0';
        bgNoite.style.opacity = this.timeOfDay === 'night' ? '1' : '0';
      }
    }

    const timeOverlay = document.getElementById('world1-time-overlay');
    if (timeOverlay) {
      if (isEclipse) {
        timeOverlay.style.background = 'rgba(185, 28, 28, 0.08)';
      } else {
        timeOverlay.style.background = 'transparent';
      }
    }

    if (lakeArea) {
      lakeArea.classList.remove('from-[#0a1628]', 'via-[#0c2040]', 'to-[#0e3a5f]',
                               'from-[#38bdf8]', 'via-[#0284c7]', 'to-[#0369a1]',
                               'from-[#ea580c]', 'via-[#9333ea]', 'to-[#1e1b4b]',
                               'bg-gradient-to-b');
      if (isEclipse) {
        lakeArea.style.background = 'linear-gradient(to bottom, #2a0303, #450a0a 40%, #150202)';
      } else if (this.timeOfDay === 'day') {
        lakeArea.style.background = 'linear-gradient(to bottom, #7dd3fc, #38bdf8 35%, #0284c7 65%, #0369a1)';
      } else if (this.timeOfDay === 'sunset') {
        lakeArea.style.background = 'linear-gradient(to bottom, #fdba74, #f97316 30%, #7e22ce 65%, #1e1b4b)';
      } else {
        lakeArea.style.background = 'linear-gradient(to bottom, #0a1628, #0c2040 40%, #0e3a5f)';
      }
    }
  }
}
