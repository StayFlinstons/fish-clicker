// Mundo 2 (Abismo): ciclo de biomas, Batiscafo e viagem entre mundos.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { sound } from '../sound.js';
import { ASCENSION_PARTS, WORLD2_BIOMES } from '../world2Data.js';

export class World2Methods {
  getCycleWorld2Biome() {
    const BIOME_DURATION_MS = 5 * 60 * 1000;
    const biomeIds = ['recife_bioluminescente', 'fendas_vulcanicas', 'cemiterio_naufragios', 'zona_hadal'];
    const virtualNow = Date.now() + (this.world2BiomeOffsetMs || 0);
    const index = Math.floor(virtualNow / BIOME_DURATION_MS) % biomeIds.length;
    return biomeIds[index];
  }

  getWorld2BiomeRemaining() {
    const BIOME_DURATION_MS = 5 * 60 * 1000;
    const virtualNow = Date.now() + (this.world2BiomeOffsetMs || 0);
    const ms = BIOME_DURATION_MS - (virtualNow % BIOME_DURATION_MS);
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return {
      ms,
      min,
      sec,
      text: `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    };
  }

  skipWorld2Biome() {
    const BIOME_DURATION_MS = 5 * 60 * 1000;
    const rem = this.getWorld2BiomeRemaining();
    this.world2BiomeOffsetMs = (this.world2BiomeOffsetMs || 0) + rem.ms + 50;
    const newBiomeId = this.getCycleWorld2Biome();
    this.activeWorld2Biome = newBiomeId;
    this.applyWorld2BiomeScenery(newBiomeId);
    const b = WORLD2_BIOMES.find(x => x.id === newBiomeId);
    sound.playUpgrade?.() || sound.playClick?.();
    this.showToast(`Bioma avançado para: ${b?.icon || '🌊'} ${b?.name || newBiomeId} (05:00)`, 'info');
    this.saveGame();
    this.renderAll();
  }

  setWorld2Biome(biomeId) {
    const biomeIds = ['recife_bioluminescente', 'fendas_vulcanicas', 'cemiterio_naufragios', 'zona_hadal'];
    const idx = biomeIds.indexOf(biomeId);
    if (idx === -1) return;
    const BIOME_DURATION_MS = 5 * 60 * 1000;
    const currBiome = this.getCycleWorld2Biome();
    const currIdx = biomeIds.indexOf(currBiome);
    const neededSteps = (idx - currIdx + biomeIds.length) % biomeIds.length;
    const rem = this.getWorld2BiomeRemaining();
    if (neededSteps === 0) {
      const virtualNow = Date.now() + (this.world2BiomeOffsetMs || 0);
      const elapsed = virtualNow % BIOME_DURATION_MS;
      this.world2BiomeOffsetMs = (this.world2BiomeOffsetMs || 0) - elapsed;
    } else {
      this.world2BiomeOffsetMs = (this.world2BiomeOffsetMs || 0) + rem.ms + (neededSteps - 1) * BIOME_DURATION_MS + 50;
    }
    this.activeWorld2Biome = biomeId;
    this.applyWorld2BiomeScenery(biomeId);
    this.saveGame();
    this.renderAll();
  }

  applyWorld2BiomeScenery(biomeId) {
    const sceneryContainer = document.getElementById('world2-lake-scenery');
    const lakeArea = document.getElementById('fishing-lake-area');
    if (!sceneryContainer) return;

    if (this.currentWorld !== 2) {
      sceneryContainer.classList.add('hidden');
      document.getElementById('world1-lake-bg')?.classList.remove('hidden');
      return;
    }

    sceneryContainer.classList.remove('hidden');
    document.getElementById('world1-lake-bg')?.classList.add('hidden');

    const sceneryMap = {
      'recife_bioluminescente': 'scenery-recife',
      'fendas_vulcanicas': 'scenery-vulcanicas',
      'cemiterio_naufragios': 'scenery-naufragios',
      'zona_hadal': 'scenery-hadal'
    };

    const bgGradients = {
      'recife_bioluminescente': 'linear-gradient(to bottom, #011424 0%, #032b47 25%, #064a6d 60%, #086185 85%, #022538 100%)',
      'fendas_vulcanicas': 'linear-gradient(to bottom, #080302 0%, #1f0804 25%, #3d0c05 60%, #5c1407 85%, #120402 100%)',
      'cemiterio_naufragios': 'linear-gradient(to bottom, #01110d 0%, #02241b 30%, #043e30 65%, #065441 85%, #011c14 100%)',
      'zona_hadal': 'linear-gradient(to bottom, #010003 0%, #0c0117 25%, #1a0333 60%, #290452 85%, #040008 100%)'
    };

    Object.entries(sceneryMap).forEach(([bId, elemId]) => {
      const el = document.getElementById(elemId);
      if (el) {
        if (bId === biomeId) {
          el.classList.remove('hidden');
          el.style.opacity = '1';
        } else {
          el.classList.add('hidden');
          el.style.opacity = '0';
        }
      }
    });

    if (lakeArea && bgGradients[biomeId]) {
      lakeArea.style.background = bgGradients[biomeId];
    }
    this.waterRenderer?.setWorldMode(true, biomeId);
  }

  initWorld2BiomeCycle() {
    if (this._world2BiomeTimer) clearInterval(this._world2BiomeTimer);

    this._world2BiomeTimer = setInterval(() => {
      if (this.currentWorld === 2) {
        const rem = this.getWorld2BiomeRemaining();
        const autoBiome = this.getCycleWorld2Biome();
        const curBiome = WORLD2_BIOMES.find(x => x.id === this.activeWorld2Biome) || WORLD2_BIOMES[0];

        const btnTime = document.getElementById('btn-toggle-time');
        if (btnTime) {
          btnTime.title = `Região Atual: ${curBiome.name} (${curBiome.depth} · ${curBiome.pressure})\nPróxima região em ${rem.text} (Ciclo de 5 min)`;
        }

        if (autoBiome !== this.activeWorld2Biome) {
          this.activeWorld2Biome = autoBiome;
          this.syncWorld2UI();
          this.saveGame();
          const b = WORLD2_BIOMES.find(x => x.id === autoBiome);
          this.showToast(`🌊 O Batiscafo adentrou a região: ${b?.icon || ''} ${b?.name || autoBiome}!`, 'special');
        }
      }
    }, 1000);
  }

  // Sem chamadas no momento: troca manual de bioma com aviso. Hoje o bioma muda pelo ciclo
  // automático (initWorld2BiomeCycle) ou pelo console, ambos via setWorld2Biome().
  switchWorld2Biome(biomeId) {
    const biome = WORLD2_BIOMES.find(b => b.id === biomeId);
    if (!biome) return;
    this.setWorld2Biome(biomeId);
    sound.playClick?.();
    sound.playWaterSplash?.();
    this.showToast(`🌊 Submergiu em: ${biome.name} (${biome.depth})`, 'special');
  }

  syncWorld2UI() {
    const isW2 = this.currentWorld === 2;
    const btnSubmarine = document.getElementById('btn-open-submarine');
    const btnChapter1 = document.getElementById('btn-open-chapter1');
    const fishermanPier = document.getElementById('fisherman-pier');
    const world2SubPier = document.getElementById('world2-sub-pier');
    const world1Stars = document.getElementById('world1-sky-stars');

    // Botão de ir para Mundo 3: Ocultado a pedido do usuário
    if (btnSubmarine) {
      btnSubmarine.classList.add('hidden');
      btnSubmarine.style.display = 'none';
    }

    if (isW2) {
      if (btnChapter1) btnChapter1.classList.add('hidden');
      if (fishermanPier) fishermanPier.classList.add('hidden');
      if (world2SubPier) world2SubPier.classList.remove('hidden');
      if (world1Stars) world1Stars.classList.add('hidden');

      this.waterRenderer?.setWorldMode(true, this.activeWorld2Biome);
      this.updateFisherman();
      this.updateDiverVisual();
      this.applyTimeOfDay();
      this.applyWorld2BiomeScenery(this.activeWorld2Biome);
    } else {
      if (fishermanPier) fishermanPier.classList.remove('hidden');
      if (world2SubPier) world2SubPier.classList.add('hidden');
      if (world1Stars) world1Stars.classList.remove('hidden');
      document.getElementById('world2-lake-scenery')?.classList.add('hidden');
      this.waterRenderer?.setWorldMode(false);
      this.updateFisherman();
      this.updateDiverVisual();
      this.applyTimeOfDay();
    }
  }

  checkSubmarinePartDrop(biomeId) {
    const part = ASCENSION_PARTS.find(p => p.biome === biomeId);
    if (!part || this.ascensionParts[part.id]) return;

    // 4% de chance por captura no bioma
    if (Math.random() < 0.04) {
      this.ascensionParts[part.id] = true;
      this.saveGame();
      setTimeout(() => {
        sound.playUpgrade?.();
        this.showToast(`★ PEÇA DO BATISCAFO RESGATADA: ${part.name}! ★`, 'legendary');
        this.syncWorld2UI();
      }, 400);
    }
  }

  // Sem chamadas no momento: o botão #btn-open-submarine (Batiscafo -> Mundo 3) está oculto
  // a pedido em index.html. Reexibir o botão reativa todo o fluxo. Não remover.
  openSubmarineModal() {
    sound.playClick?.();
    this.renderSubmarineModal();
    const modal = document.getElementById('submarine-modal');
    modal?.classList.remove('hidden');
  }

  closeSubmarineModal() {
    sound.playClick?.();
    const modal = document.getElementById('submarine-modal');
    modal?.classList.add('hidden');
  }

  renderSubmarineModal() {
    const grid = document.getElementById('submarine-parts-grid');
    const progEl = document.getElementById('submarine-parts-progress');
    const btnAssemble = document.getElementById('btn-assemble-submarine');

    const total = ASCENSION_PARTS.length;
    const foundCount = ASCENSION_PARTS.filter(p => this.ascensionParts[p.id]).length;

    if (progEl) {
      progEl.textContent = `PEÇAS COLETADAS: ${foundCount} / ${total}`;
    }

    if (grid) {
      grid.innerHTML = ASCENSION_PARTS.map(part => {
        const found = Boolean(this.ascensionParts[part.id]);
        const biome = WORLD2_BIOMES.find(b => b.id === part.biome);
        return `
          <div class="p-2.5 border-2 ${found ? 'bg-cyan-950/40 border-cyan-500/80' : 'bg-slate-950/80 border-slate-800 opacity-60'} flex items-center gap-2.5">
            <div class="w-9 h-9 flex items-center justify-center text-xl bg-slate-900 border border-slate-700 shrink-0">
              ${part.icon}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <h4 class="text-[8.5px] font-bold ${found ? 'text-cyan-300' : 'text-slate-400'} leading-tight truncate" style="font-family:var(--font-pixel);">${part.name}</h4>
                <span class="text-[8px] font-bold px-1 py-0.5 border shrink-0 ${found ? 'bg-emerald-950 text-emerald-300 border-emerald-600' : 'bg-red-950 text-red-400 border-red-800'}" style="font-family:var(--font-pixel);">
                  ${found ? 'RESGATADO' : 'PERDIDO'}
                </span>
              </div>
              <p class="text-[8px] text-slate-500 mt-1 leading-normal" style="font-family:var(--font-pixel);">${part.desc}</p>
              <div class="text-[8px] text-amber-400/90 mt-1 font-mono">Bioma: ${biome ? biome.shortName : '--'}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    if (btnAssemble) {
      if (this.submarineAssembled) {
        btnAssemble.disabled = false;
        btnAssemble.className = 'pixel-btn w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-[9.5px] border border-emerald-400 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.7)]';
        btnAssemble.textContent = '🌌 EXPEDIÇÃO AO MUNDO 3 PRONTA (EM BREVE)';
        btnAssemble.onclick = () => {
          sound.playUpgrade?.();
          this.showToast('🚀 O Batiscafo está 100% equipado para o MUNDO 3! A nova dimensão será liberada na próxima grande expansão!', 'legendary');
        };
      } else if (foundCount >= total) {
        btnAssemble.disabled = false;
        btnAssemble.className = 'pixel-btn w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-[9.5px] border border-cyan-400 cursor-pointer animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.8)]';
        btnAssemble.textContent = '🚀 MONTAR BATISCAFO & PREPARAR ASCENSÃO AO MUNDO 3!';
        btnAssemble.onclick = () => this.assembleSubmarine();
      } else {
        btnAssemble.disabled = true;
        btnAssemble.className = 'pixel-btn w-full py-2.5 bg-slate-800 text-slate-500 font-bold text-[9px] border border-slate-700 cursor-not-allowed';
        btnAssemble.textContent = `COLETE AS ${total - foundCount} PEÇAS RESTANTES`;
        btnAssemble.onclick = null;
      }
    }
  }

  assembleSubmarine() {
    sound.playUpgrade?.();
    this.submarineAssembled = true;
    this.saveGame();
    this.showToast('★ O BATISCAFO FOI CONSTRUÍDO! PREPARANDO ROTA PARA O MUNDO 3! ★', 'legendary');
    this.renderSubmarineModal();
    this.syncWorld2UI();
  }

  travelBetweenWorlds(targetWorld) {
    // Se estava no modo ímã, sempre restaura para o modo de pesca tradicional
    if (this.gameMode === 'ima') {
      this.gameMode = 'pesca';
      this.syncGameModeUI();
    }

    if (targetWorld === this.currentWorld) {
      this.renderAll();
      return;
    }
    sound.playUpgrade?.();

    if (this.currentWorld === 2 && targetWorld === 1) {
      // Salva snapshot do Mundo 2
      this.world2SavedData = {
        gold: this.gold,
        inventory: [...this.inventory],
        aquarium: [...this.aquarium],
        selectedRodId: this.selectedRodId,
        unlockedRods: [...this.unlockedRods],
        selectedBaitId: this.selectedBaitId,
        unlockedBaits: [...this.unlockedBaits],
        upgradeLevels: { ...this.upgradeLevels },
        activeWorld2Biome: this.activeWorld2Biome
      };

      // Restaura dados do Mundo 1
      if (!this.world1Data) {
        this.world1Data = {
          gold: 0,
          inventory: [],
          aquarium: [],
          selectedRodId: 'vara_bambu',
          unlockedRods: ['vara_bambu'],
          selectedBaitId: 'minhoca',
          unlockedBaits: ['minhoca'],
          upgradeLevels: { balde: 0, auto_pescador: 0, boia_sorte: 0, rede_dupla: 0, aquario_cap: 0, auto_vendedor: 0, ima_dourado: 0 }
        };
      }
      this.gold = this.world1Data.gold || 0;
      this.inventory = [...(this.world1Data.inventory || [])];
      this.aquarium = [...(this.world1Data.aquarium || [])];
      this.selectedRodId = this.world1Data.selectedRodId || 'vara_bambu';
      this.unlockedRods = [...(this.world1Data.unlockedRods || ['vara_bambu'])];
      this.selectedBaitId = this.world1Data.selectedBaitId || 'minhoca';
      this.unlockedBaits = [...(this.world1Data.unlockedBaits || ['minhoca'])];
      this.upgradeLevels = { ...this.world1Data.upgradeLevels };
      this.currentWorld = 1;
    } else if (this.currentWorld === 1 && targetWorld === 2) {
      // Salva snapshot do Mundo 1
      this.world1Data = {
        gold: this.gold,
        inventory: [...this.inventory],
        aquarium: [...this.aquarium],
        selectedRodId: this.selectedRodId,
        unlockedRods: [...this.unlockedRods],
        selectedBaitId: this.selectedBaitId,
        unlockedBaits: [...this.unlockedBaits],
        upgradeLevels: { ...this.upgradeLevels }
      };

      // Restaura ou inicializa dados do Mundo 2
      if (!this.world2SavedData) {
        this.world2SavedData = {
          gold: 0,
          inventory: [],
          aquarium: [],
          selectedRodId: 'vara_arpao_basico',
          unlockedRods: ['vara_arpao_basico'],
          selectedBaitId: 'isca_plankton_neon',
          unlockedBaits: ['isca_plankton_neon'],
          upgradeLevels: { balde: 0, auto_pescador: 0, boia_sorte: 0, rede_dupla: 0, aquario_cap: 0, auto_vendedor: 0, ima_dourado: 0 },
          activeWorld2Biome: 'recife_bioluminescente'
        };
      }
      this.gold = this.world2SavedData.gold || 0;
      this.inventory = [...(this.world2SavedData.inventory || [])];
      this.aquarium = [...(this.world2SavedData.aquarium || [])];
      this.selectedRodId = this.world2SavedData.selectedRodId || 'vara_arpao_basico';
      this.unlockedRods = [...(this.world2SavedData.unlockedRods || ['vara_arpao_basico'])];
      this.selectedBaitId = this.world2SavedData.selectedBaitId || 'isca_plankton_neon';
      this.unlockedBaits = [...(this.world2SavedData.unlockedBaits || ['isca_plankton_neon'])];
      this.upgradeLevels = { ...this.world2SavedData.upgradeLevels };
      this.activeWorld2Biome = this.world2SavedData.activeWorld2Biome || 'recife_bioluminescente';
      this.currentWorld = 2;
    }

    this.saveGame();
    this.closeSubmarineModal?.();
    this.showToast(targetWorld === 1 ? '☀️ Você emergiu na superfície! Bem-vindo de volta ao Mundo 1!' : '🌊 O Batiscafo afundou suavemente no Abismo do Mundo 2!', 'special');
    this.updateFisherman();
    this.renderAll();
  }
}
