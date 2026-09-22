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

  // Fanfarra épica para a celebração de primeira captura rara
  playFirstCatchFanfare(rarity = 'LENDARIO') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const chords = {
      LENDARIO: [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50],
      MITICO: [293.66, 369.99, 440.00, 587.33, 739.99, 880.00, 1174.66, 1479.98],
      SECRETO: [220.00, 277.18, 329.63, 440.00, 554.37, 659.25, 880.00, 1108.73, 1318.51]
    };
    const notes = chords[rarity] || chords.LENDARIO;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx >= notes.length - 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.7);
    });

    this.vibrateCatch(rarity);
  }

  // Som místico de Sacrifício no Altar Ancestral
  playSacrifice() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Acorde ressonante cósmico
    [220, 277.18, 329.63, 440, 659.25].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.2);

      gain.gain.setValueAtTime(0.01, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.04 + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + 1.7);
    });
  }

  // Rugido colossal do Kraken Ancestral (sub-graves profundos e tremor abissal)
  playKrakenRoar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Oscilador de sub-grave monstruoso
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(32, now + 2.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);
    filter.frequency.linearRampToValueAtTime(450, now + 0.8);
    filter.frequency.exponentialRampToValueAtTime(80, now + 2.8);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 3.1);

    // Tremor tátil
    this.vibrate([100, 50, 200, 50, 400, 80, 500]);
  }

  // Som do píer de madeira quebrando e colapsando na água
  playPierCrash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Estalos de madeira rachando
    for (let i = 0; i < 4; i++) {
      const snapOsc = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snapOsc.type = 'square';
      snapOsc.frequency.setValueAtTime(800 - i * 150, now + i * 0.12);
      snapOsc.frequency.exponentialRampToValueAtTime(120, now + i * 0.12 + 0.08);

      snapGain.gain.setValueAtTime(0.2, now + i * 0.12);
      snapGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.08);

      snapOsc.connect(snapGain);
      snapGain.connect(this.ctx.destination);
      snapOsc.start(now + i * 0.12);
      snapOsc.stop(now + i * 0.12 + 0.09);
    }

    // 2. Impacto estrondoso de água e queda
    const splashOsc = this.ctx.createOscillator();
    const splashGain = this.ctx.createGain();
    splashOsc.type = 'triangle';
    splashOsc.frequency.setValueAtTime(140, now + 0.3);
    splashOsc.frequency.exponentialRampToValueAtTime(35, now + 1.5);

    splashGain.gain.setValueAtTime(0.3, now + 0.3);
    splashGain.gain.exponentialRampToValueAtTime(0.01, now + 1.8);

    splashOsc.connect(splashGain);
    splashGain.connect(this.ctx.destination);
    splashOsc.start(now + 0.3);
    splashOsc.stop(now + 1.9);
  }

  // Fanfarra triunfante para Primeira Captura de Raridade Alta (Lendário, Mítico, Secreto)
  playFirstCatchFanfare(rarity = 'LENDARIO') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    let notes = [];
    let wave = 'triangle';

    if (rarity === 'SECRETO') {
      notes = [
        { f: 220, t: 0, d: 0.6 },
        { f: 329.63, t: 0.1, d: 0.6 },
        { f: 440, t: 0.22, d: 0.7 },
        { f: 554.37, t: 0.35, d: 0.7 },
        { f: 659.25, t: 0.5, d: 0.8 },
        { f: 880, t: 0.65, d: 1.2 },
        { f: 1108.73, t: 0.8, d: 1.4 }
      ];
      wave = 'sawtooth';
    } else if (rarity === 'MITICO') {
      notes = [
        { f: 261.63, t: 0, d: 0.4 },
        { f: 329.63, t: 0.08, d: 0.4 },
        { f: 392.00, t: 0.16, d: 0.5 },
        { f: 523.25, t: 0.26, d: 0.6 },
        { f: 659.25, t: 0.38, d: 0.7 },
        { f: 783.99, t: 0.52, d: 0.9 },
        { f: 1046.50, t: 0.68, d: 1.3 }
      ];
      wave = 'triangle';
    } else {
      notes = [
        { f: 329.63, t: 0, d: 0.35 },
        { f: 440.00, t: 0.1, d: 0.35 },
        { f: 554.37, t: 0.22, d: 0.45 },
        { f: 659.25, t: 0.35, d: 0.6 },
        { f: 880.00, t: 0.52, d: 1.1 }
      ];
      wave = 'triangle';
    }

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + n.t;

      osc.type = wave;
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + n.d + 0.05);
    });

    // Chimes cintilantes agudos no topo da fanfarra
    [0.75, 0.92, 1.1].forEach((delay, i) => {
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      const st = now + delay;
      chime.type = 'sine';
      chime.frequency.setValueAtTime(1760 + i * 220, st);
      chimeGain.gain.setValueAtTime(0.08, st);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, st + 0.4);
      chime.connect(chimeGain);
      chimeGain.connect(this.ctx.destination);
      chime.start(st);
      chime.stop(st + 0.45);
    });
  }

}

export const sound = new SoundManager();
