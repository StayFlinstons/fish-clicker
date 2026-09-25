// Celebrações do 1º peixe Lendário/Mítico/Secreto e do 1º peixe com buff.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { sound } from '../sound.js';

export class CelebrationMethods {
  checkFirstRarityCatch(fish) {
    if (!fish || !fish.rarity) return;
    const targetRarities = ['LENDARIO', 'MITICO', 'SECRETO'];
    if (!targetRarities.includes(fish.rarity)) return;

    if (!this.firstRarityCatches) {
      this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    }

    // Se já capturou QUALQUER peixe dessa raridade, não repete
    if (this.firstRarityCatches[fish.rarity]) return;

    this.firstRarityCatches[fish.rarity] = true;

    // Se capturou o 1º Lendário, desbloqueia o Santuário e concede o 1º Olho de Peixe místico
    if (fish.rarity === 'LENDARIO') {
      this.fishEyesCount = (this.fishEyesCount || 0) + 1;
      this.fishEyesTotal = (this.fishEyesTotal || 0) + 1;
      this.renderFishEyesBadge();
    }

    // Se capturou o 1º Mítico, desbloqueia as Oferendas e atualiza os botões de doar no balde
    if (fish.rarity === 'MITICO') {
      this.renderInventory();
    }

    this.saveGame();

    // Pequeno delay para a notificação inicial não conflitar
    setTimeout(() => {
      this.triggerFirstCatchCelebration(fish);
    }, 350);
  }

  triggerFirstCatchCelebration(fish, celebrationType = null) {
    const overlay = document.getElementById('first-catch-celebration-overlay');
    if (!overlay) return;

    const rarity = fish.rarity;
    const configMap = {
      BUFF: {
        badgeText: '★ ATRIBUTO MÍSTICO DESCOBERTO! ★',
        mainTitle: 'PARABÉNS! VOCÊ FISGOU SEU PRIMEIRO PEIXE COM BUFF!',
        accentColor: '#c084fc',
        borderColor: '#a855f7',
        haloClass: 'bg-purple-600/50',
        radialGlow: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.55) 0%, rgba(107, 33, 168, 0.3) 50%, transparent 75%)',
        badgeClass: 'text-purple-300 bg-purple-950/90 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.7)]'
      },
      LENDARIO: {
        badgeText: '★ PRIMEIRO PEIXE LENDÁRIO! ★',
        mainTitle: 'PARABÉNS! VOCÊ CAPTUROU SEU PRIMEIRO PEIXE LENDÁRIO!',
        accentColor: '#ef4444',
        borderColor: '#dc2626',
        haloClass: 'bg-red-600/50',
        radialGlow: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.45) 0%, rgba(185, 28, 28, 0.2) 50%, transparent 75%)',
        badgeClass: 'text-red-300 bg-red-950/80 border-red-500'
      },
      MITICO: {
        badgeText: '★ FEITO EXTRAORDINÁRIO: MÍTICO! ★',
        mainTitle: 'INCRÍVEL! VOCÊ CAPTUROU SEU PRIMEIRO PEIXE MÍTICO!',
        accentColor: '#ec4899',
        borderColor: '#ec4899',
        haloClass: 'bg-pink-600/50',
        radialGlow: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.5) 0%, rgba(147, 51, 234, 0.25) 50%, transparent 75%)',
        badgeClass: 'text-pink-300 bg-pink-950/80 border-pink-500'
      },
      SECRETO: {
        badgeText: '★ ANOMALIA CÓSMICA: SECRETO! ★',
        mainTitle: 'INACREDITÁVEL! VOCÊ DESCOBRIU SEU PRIMEIRO PEIXE SECRETO!',
        accentColor: '#f87171',
        borderColor: '#dc2626',
        haloClass: 'bg-red-800/70',
        radialGlow: 'radial-gradient(circle at center, rgba(220, 38, 38, 0.6) 0%, rgba(76, 5, 25, 0.4) 50%, transparent 75%)',
        badgeClass: 'text-rose-300 bg-black/90 border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.8)]'
      }
    };

    const activeType = celebrationType || rarity;
    const cfg = configMap[activeType] || configMap.BUFF || configMap.LENDARIO;

    // Atualiza Textos
    const badgeEl = document.getElementById('fc-badge-rarity');
    if (badgeEl) {
      badgeEl.textContent = cfg.badgeText;
      badgeEl.className = `px-3.5 py-1 text-[8.5px] sm:text-[10px] font-bold tracking-widest uppercase border-2 shadow-[0_0_15px_rgba(0,0,0,0.8)] ${cfg.badgeClass}`;
    }

    const titleEl = document.getElementById('fc-main-title');
    if (titleEl) {
      titleEl.textContent = cfg.mainTitle;
      titleEl.style.color = cfg.accentColor;
    }

    // Atualiza Brilho Radial e Halo
    const radialGlow = document.getElementById('fc-radial-glow');
    if (radialGlow) {
      radialGlow.style.background = cfg.radialGlow;
    }

    const halo = document.getElementById('fc-fish-halo');
    if (halo) {
      halo.className = `absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full blur-2xl opacity-75 animate-pulse pointer-events-none ${cfg.haloClass}`;
    }

    const frame = document.getElementById('fc-fish-frame');
    if (frame) {
      frame.style.borderColor = cfg.borderColor;
      frame.style.boxShadow = `0 0 25px ${cfg.accentColor}66, 6px 6px 0 #000`;
    }

    // Imagem do Peixe
    const spriteURL = this.getFishSpriteURL ? this.getFishSpriteURL(fish.icon) : '';
    const imgEl = document.getElementById('fc-fish-img');
    if (imgEl) {
      imgEl.src = spriteURL;
      imgEl.alt = fish.name;
    }

    // Nome, Peso e Valor
    const nameEl = document.getElementById('fc-fish-name');
    if (nameEl) nameEl.textContent = fish.name;

    const weightEl = document.getElementById('fc-fish-weight');
    if (weightEl) weightEl.textContent = `⚖️ ${Number(fish.weight || 1).toFixed(2)}kg`;

    const valueEl = document.getElementById('fc-fish-value');
    const goldMultiplier = (this.getActiveBuffs ? this.getActiveBuffs().goldMultiplier : 0) || 0;
    const sellValue = Math.round((fish.baseValue || 100) * (1 + goldMultiplier));
    if (valueEl) valueEl.textContent = `💰 ${sellValue.toLocaleString('pt-BR')} G`;

    // Buff
    const buffEl = document.getElementById('fc-fish-buff');
    const buffsList = this.getFishBuffs ? this.getFishBuffs(fish) : [];
    if (buffEl) {
      if (buffsList.length > 0) {
        buffEl.textContent = `★ ${buffsList.map(b => b.text).join(' | ')}`;
        buffEl.classList.remove('hidden');
      } else {
        buffEl.classList.add('hidden');
      }
    }

    // Banner Especial de Desbloqueio de Mecânica (Lendário: Santuário / Mítico: Oferendas / Buff: Aquário)
    const cardEl = document.getElementById('fc-mechanic-card');
    const mTitleEl = document.getElementById('fc-mechanic-title');
    const mDescEl = document.getElementById('fc-mechanic-desc');

    if (cardEl && mTitleEl && mDescEl) {
      if (activeType === 'BUFF') {
        cardEl.className = 'w-full max-w-sm p-2.5 border-2 text-left space-y-1 shadow-[3px_3px_0_#000] border-purple-400 bg-purple-950/90 text-purple-200';
        mTitleEl.className = 'flex items-center gap-1.5 font-bold text-[8.5px] sm:text-[9.5px] text-purple-300 uppercase tracking-wider';
        mTitleEl.innerHTML = '<span>🐠</span> BUFFS ATIVOS APENAS NO AQUÁRIO!';
        mDescEl.innerHTML = 'Peixes no balde <b class="text-amber-300">NÃO</b> ativam bônus (servem para pescar e vender). Para usufruir dos atributos deste peixe, mova-o ao <b class="text-cyan-300">Aquário</b> clicando no botão <b class="text-purple-300 border border-purple-500 px-1 py-0.5 bg-purple-950/80 inline-flex items-center gap-0.5"><span>🐠</span>AQUÁRIO</b>!';
        cardEl.classList.remove('hidden');
      } else if (rarity === 'LENDARIO') {
        cardEl.className = 'w-full max-w-sm p-2.5 border-2 text-left space-y-1 shadow-[3px_3px_0_#000] border-cyan-400 bg-cyan-950/90 text-cyan-200';
        mTitleEl.className = 'flex items-center gap-1.5 font-bold text-[8.5px] sm:text-[9.5px] text-cyan-300 uppercase tracking-wider';
        mTitleEl.innerHTML = '<span>👁️</span> SANTUÁRIO DOS OLHOS DESBLOQUEADO!';
        mDescEl.textContent = 'Você pescou um peixe muito raro e conseguiu o olho místico dele (+1 Olho de Peixe concedido)! Agora você liberou o Santuário dos Olhos no Menu para fortalecer seus atributos permanentes.';
        cardEl.classList.remove('hidden');
      } else if (rarity === 'MITICO') {
        cardEl.className = 'w-full max-w-sm p-2.5 border-2 text-left space-y-1 shadow-[3px_3px_0_#000] border-amber-400 bg-amber-950/90 text-amber-200';
        mTitleEl.className = 'flex items-center gap-1.5 font-bold text-[8.5px] sm:text-[9.5px] text-amber-300 uppercase tracking-wider';
        mTitleEl.innerHTML = '<span>🏺</span> OFERENDAS DO SANTUÁRIO LIBERADAS!';
        mDescEl.textContent = 'Você conseguiu um dos peixes mais raros do oceano! Agora você liberou as Oferendas no Santuário dos Olhos: doe um exemplar de cada espécie para conseguir mais Olhos de Peixe!';
        cardEl.classList.remove('hidden');
      } else {
        cardEl.classList.add('hidden');
      }
    }

    // Dispara Confetes e Partículas
    this.spawnCelebrationParticles(cfg.accentColor);

    // Toca som triunfante
    if (activeType === 'BUFF') {
      sound.playUpgrade();
      if (sound.playFirstCatchFanfare) sound.playFirstCatchFanfare('LENDARIO');
    } else if (sound.playFirstCatchFanfare) {
      sound.playFirstCatchFanfare(rarity);
    } else if (sound.playCatch) {
      sound.playCatch(rarity);
    }

    // Cancela timer anterior de fechamento se houver
    if (this._fcCloseTimer) {
      clearTimeout(this._fcCloseTimer);
      this._fcCloseTimer = null;
    }

    // Cooldown de 2s para fechar a tela (evita fechamento acidental)
    this._fcCanCloseAt = Date.now() + 2000;
    if (this._fcCooldownInterval) {
      clearInterval(this._fcCooldownInterval);
      this._fcCooldownInterval = null;
    }

    const btnClose = document.getElementById('btn-fc-close');
    if (btnClose) {
      btnClose.disabled = true;
      btnClose.classList.remove('text-slate-950');
      btnClose.classList.add('opacity-60', 'cursor-not-allowed', 'text-white');
      btnClose.style.color = '#ffffff';
      btnClose.style.textShadow = '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 0 6px rgba(255,255,255,0.4)';
      btnClose.classList.remove('cursor-pointer', 'hover:from-amber-400', 'hover:to-yellow-400', 'active:scale-95');
      
      const updateCooldownBtn = () => {
        const remaining = Math.max(0, this._fcCanCloseAt - Date.now());
        const sec = Math.ceil(remaining / 1000);
        const btn = document.getElementById('btn-fc-close');
        if (!btn) return;
        if (remaining > 0) {
          btn.disabled = true;
          btn.innerHTML = `<span>⏳</span> AGUARDE (${sec}s)...`;
        } else {
          if (this._fcCooldownInterval) {
            clearInterval(this._fcCooldownInterval);
            this._fcCooldownInterval = null;
          }
          btn.disabled = false;
          btn.classList.remove('opacity-60', 'cursor-not-allowed');
          btn.classList.add('cursor-pointer', 'active:scale-95');
          btn.innerHTML = `<span>🎣</span> CONTINUAR PESCARIA`;
        }
      };
      updateCooldownBtn();
      this._fcCooldownInterval = setInterval(updateCooldownBtn, 100);
    }

    // Exibe Overlay com animação
    overlay.classList.remove('hidden');
    // Força reflow para garantir a transição suave
    void overlay.offsetWidth;
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');
    const box = document.getElementById('fc-content-box');
    if (box) {
      box.classList.remove('scale-90', 'opacity-0');
      box.classList.add('scale-100', 'opacity-100');
    }

    // Tecla de atalho para fechar (Espaço ou Enter ou Escape) respeitando cooldown de 2s
    if (this._fcKeyHandler) {
      window.removeEventListener('keydown', this._fcKeyHandler);
    }
    this._fcKeyHandler = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        if (this._fcCanCloseAt && Date.now() < this._fcCanCloseAt) return;
        this.closeFirstCatchCelebration();
      }
    };
    window.addEventListener('keydown', this._fcKeyHandler);
  }

  spawnCelebrationParticles(accentColor) {
    const container = document.getElementById('fc-particles-container');
    if (!container) return;
    container.innerHTML = '';

    const colors = [accentColor, '#facc15', '#38bdf8', '#f8fafc', '#a855f7', '#fb923c'];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'fc-particle';
      const size = Math.floor(Math.random() * 8) + 6;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.boxShadow = `0 0 6px ${p.style.backgroundColor}`;

      // Ângulo aleatório e distância de explosão
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.floor(Math.random() * 260) + 120;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      p.style.setProperty('--tx', `${tx}px`);
      p.style.setProperty('--ty', `${ty}px`);
      p.style.animationDelay = `${Math.random() * 0.25}s`;

      container.appendChild(p);
    }
  }

  closeFirstCatchCelebration() {
    // Bloqueia fechamento antes dos 2 segundos
    if (this._fcCanCloseAt && Date.now() < this._fcCanCloseAt) return;

    if (this._fcCooldownInterval) {
      clearInterval(this._fcCooldownInterval);
      this._fcCooldownInterval = null;
    }

    const overlay = document.getElementById('first-catch-celebration-overlay');
    if (!overlay) return;

    if (this._fcKeyHandler) {
      window.removeEventListener('keydown', this._fcKeyHandler);
      this._fcKeyHandler = null;
    }

    if (this._fcCloseTimer) {
      clearTimeout(this._fcCloseTimer);
      this._fcCloseTimer = null;
    }

    const box = document.getElementById('fc-content-box');
    if (box) {
      box.classList.remove('scale-100', 'opacity-100');
      box.classList.add('scale-95', 'opacity-0');
    }

    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');

    const cardEl = document.getElementById('fc-mechanic-card');
    if (cardEl) cardEl.classList.add('hidden');

    this._fcCloseTimer = setTimeout(() => {
      overlay.classList.add('hidden');
      this._fcCloseTimer = null;
      if (this._pendingBuffCelebration) {
        const pendingFish = this._pendingBuffCelebration;
        this._pendingBuffCelebration = null;
        setTimeout(() => {
          this.triggerFirstCatchCelebration(pendingFish, 'BUFF');
        }, 350);
      }
    }, 300);
  }

  checkFirstBuffFishCatch(fish) {
    if (!fish) return;
    const buffs = this.getFishBuffs(fish);
    if (!buffs || buffs.length === 0) return;

    if (this.hasSeenBuffFishNotice) return;
    this.hasSeenBuffFishNotice = true;
    this.saveGame();

    // Se já houver overlay aberto ou celebração de raridade para este mesmo peixe, aguarda o fechamento
    const overlay = document.getElementById('first-catch-celebration-overlay');
    const isOverlayActive = overlay && !overlay.classList.contains('hidden');
    const isTargetRarityFirst = ['LENDARIO', 'MITICO', 'SECRETO'].includes(fish.rarity) &&
      this.firstRarityCatches && this.firstRarityCatches[fish.rarity];

    if (isOverlayActive || isTargetRarityFirst) {
      this._pendingBuffCelebration = fish;
    } else {
      setTimeout(() => {
        this.triggerFirstCatchCelebration(fish, 'BUFF');
      }, 450);
    }
  }
}
