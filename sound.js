// Sintetizador de Áudio Procedural usando Web Audio API
// Garante som de alta fidelidade sem depender de downloads externos

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Som de Arremesso / Splash na água
  playCast() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Ruído de arremesso que desliza na frequência (whoosh)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);

    // Splash secundário
    setTimeout(() => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const noise = this.ctx.createOscillator();
      const noiseGain = this.ctx.createGain();
      noise.type = 'triangle';
      noise.frequency.setValueAtTime(180, t);
      noise.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      noiseGain.gain.setValueAtTime(0.2, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.15);
    }, 120);
  }

  // Som de Peixe Pescado (diferenciado por raridade)
  playCatch(rarity = 'COMUM') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (rarity === 'COMUM' || rarity === 'INCOMUM') {
      // Duas notas alegres subindo
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(350, now);
      osc1.frequency.exponentialRampToValueAtTime(580, now + 0.12);

      osc2.frequency.setValueAtTime(580, now + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.28);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.3);
    } else {
      // Fanfarra épica / lendária / mítica / secreta com acordes
      let notes = [440, 554.37, 659.25, 880];
      let oscType = 'triangle';
      if (rarity === 'SECRETO') {
        notes = [220, 329.63, 440, 554.37, 659.25, 880, 1108.73, 1318.51];
        oscType = 'sawtooth';
      } else if (rarity === 'MITICO') {
        notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        oscType = 'sawtooth';
      }
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const startTime = now + (idx * 0.08);

        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, startTime);

        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
        g.gain.exponentialRampToValueAtTime(0.01, startTime + 0.45);

        osc.connect(g);
        g.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    }
  }

  // Som de Venda de Peixe / Moedas
  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + (i * 0.06);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.22);
    });
  }

  // Som de Upgrade Comprado
  playUpgrade() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [330, 440, 550, 660, 880];
    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + (idx * 0.05);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.28);
    });
  }

  // Som de Clique Comum
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // ═══════════════════════════════════════════
  // HAPTIC FEEDBACK (VIBRAÇÃO MOBILE)
  // ═══════════════════════════════════════════
  vibrate(pattern = 25) {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch(e) { /* ignora se não suportado */ }
  }

  vibrateCast() {
    this.vibrate(20);
  }

  vibrateCatch(rarity = 'COMUM') {
    switch(rarity) {
      case 'SECRETO':
        this.vibrate([80, 40, 100, 40, 140, 40, 220]);
        break;
      case 'MITICO':
        this.vibrate([60, 40, 80, 40, 150]);
        break;
      case 'LENDARIO':
        this.vibrate([50, 40, 70, 40, 100]);
        break;
      case 'EPICO':
        this.vibrate([40, 30, 60]);
        break;
      case 'RARO':
        this.vibrate([35, 30, 35]);
        break;
      case 'INCOMUM':
        this.vibrate(30);
        break;
      default:
        this.vibrate(20);
        break;
    }
  }

  vibrateGoldenFish() {
    this.vibrate([40, 30, 40, 30, 80]);
  }
}

export const sound = new SoundManager();

