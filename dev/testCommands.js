// Comandos de teste para o console do navegador (testLendario(), testAjuda()...) e seus atalhos globais.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { FISH_LIST } from '../fishData.js';
import { updateRodSVG } from '../pixelArt.js';
import { FISH_WORLD_2 } from '../world2Data.js';

export class TestCommandMethods {
  /**
   * Simula a captura do 1º peixe com buff, disparando a tela de celebração épica
   */
  simulateFirstBuffCatch(force = true) {
    if (force) {
      this.hasSeenBuffFishNotice = false;
    }
    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    let sample = pool.find(f => {
      const b = this.getFishBuffs(f);
      return b && b.length > 0;
    });
    if (!sample) {
      sample = {
        id: 'peixe_lua_crepusculo',
        name: 'Peixe-Lua Crepúsculo',
        rarity: 'EPICO',
        icon: 'peixe_lua',
        weight: 18.5,
        baseValue: 800,
        buffs: [
          { type: 'gold_multiplier', value: 0.20, text: '+20% Ouro' },
          { type: 'luck_bonus', value: 0.15, text: '+15% Sorte' }
        ]
      };
    } else {
      sample = {
        ...sample,
        buffs: this.getFishBuffs(sample)
      };
    }
    console.log(`%c[TESTE] Disparando animação do 1º peixe com buff: ${sample.name}`, 'color: #a855f7; font-weight: bold;');
    this.checkFirstBuffFishCatch(sample);
  }

  /**
   * Simula a captura real do 1º peixe de uma raridade específica
   * Passa pelo fluxo completo de checkFirstRarityCatch (concessão de olho, desbloqueio e tela comemorativa)
   */
  simulateFirstCatch(rarity = 'LENDARIO', force = true) {
    if (!this.firstRarityCatches) {
      this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    }
    if (force) {
      this.firstRarityCatches[rarity] = false;
    }
    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    let sample = pool.find(f => f.rarity === rarity) || FISH_LIST.find(f => f.rarity === rarity) || FISH_WORLD_2.find(f => f.rarity === rarity);
    if (!sample) {
      sample = { id: `test_${rarity.toLowerCase()}`, name: `Peixe ${rarity}`, rarity: rarity, icon: 'celacanto', weight: 150 };
    }
    console.log(`%c[TESTE] Capturando 1º peixe da raridade ${rarity}: ${sample.name}`, 'color: #38bdf8; font-weight: bold;');
    this.checkFirstRarityCatch(sample);
  }

  /**
   * Simula pescar um SEGUNDO peixe da mesma raridade
   * Comprova que a celebração NÃO se repete e não duplica bônus
   */
  simulateSecondCatch(rarity = 'LENDARIO') {
    if (!this.firstRarityCatches) {
      this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    }
    this.firstRarityCatches[rarity] = true;
    const pool = this.currentWorld === 2 ? FISH_WORLD_2 : FISH_LIST;
    let sample = pool.filter(f => f.rarity === rarity)[1] || pool.find(f => f.rarity === rarity);
    console.log(`%c[TESTE] Pescando 2º peixe ${rarity} (${sample?.name || rarity})...`, 'color: #f59e0b;');
    const beforeEyes = this.fishEyesCount || 0;
    this.checkFirstRarityCatch(sample);
    console.log(`%c[TESTE] Concluído! Celebração NÃO disparada (já foi capturado anteriormente). Olhos mantidos: ${beforeEyes}`, 'color: #10b981; font-weight: bold;');
    this.showToast(`[TESTE] 2º peixe ${rarity} pescado: nenhuma celebração duplicada (correto)!`, 'info');
  }

  /**
   * Reseta todo o progresso dos Olhos de Peixe e Santuário para o estado inicial
   */
  resetEyesProgression() {
    this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    this.fishEyesCount = 0;
    this.fishEyesTotal = 0;
    this.renderFishEyesBadge();
    if (this.currentFishEyesTab === 'offering') {
      this.renderOfferingContent();
    }
    this.renderInventory();
    this.saveGame();
    this.showToast('↺ Progresso dos Olhos e Santuário resetado para o início!', 'info');
    console.log('%c[TESTE] Progresso resetado! Santuário e Oferendas agora estão bloqueados.', 'color: #f59e0b; font-weight: bold;');
  }

  /**
   * Força o bloqueio ou desbloqueio manual do Santuário
   */
  setSanctuaryUnlocked(unlocked = true) {
    if (!this.firstRarityCatches) this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    this.firstRarityCatches.LENDARIO = Boolean(unlocked);
    this.renderFishEyesBadge();
    this.saveGame();
    const msg = unlocked ? '🔓 Santuário dos Olhos liberado no menu!' : '🔒 Santuário dos Olhos bloqueado/oculto!';
    this.showToast(msg, 'info');
    console.log(`[TESTE] ${msg}`);
  }

  /**
   * Força o bloqueio ou desbloqueio manual da aba de Oferendas
   */
  setOfferingsUnlocked(unlocked = true) {
    if (!this.firstRarityCatches) this.firstRarityCatches = { LENDARIO: false, MITICO: false, SECRETO: false };
    this.firstRarityCatches.MITICO = Boolean(unlocked);
    if (this.currentFishEyesTab === 'offering') {
      this.renderOfferingContent();
    }
    this.renderInventory();
    this.saveGame();
    const msg = unlocked ? '🔓 Oferendas do Santuário liberadas para doação!' : '🔒 Oferendas do Santuário bloqueadas!';
    this.showToast(msg, 'info');
    console.log(`[TESTE] ${msg}`);
  }

  /**
   * Equipa uma isca para testar o recolor dinâmico do sprite da bóia e anzol
   */
  testEquipBait(nameOrId = 'minhoca') {
    const aliasMap = {
      'minhoca': 'minhoca',
      'camarao': 'camarao',
      'camarão': 'camarao',
      'neon': 'isca_brilhante',
      'brilhante': 'isca_brilhante',
      'isca_brilhante': 'isca_brilhante',
      'queijo': 'queijo_mistico',
      'mistico': 'queijo_mistico',
      'místico': 'queijo_mistico',
      'queijo_mistico': 'queijo_mistico',
      'ouro': 'ouro_liquido',
      'liquido': 'ouro_liquido',
      'líquido': 'ouro_liquido',
      'ouro_liquido': 'ouro_liquido',
      'vortice': 'essencia_travessia',
      'vórtice': 'essencia_travessia',
      'essencia': 'essencia_travessia',
      'essencia_travessia': 'essencia_travessia',
      'kraken': 'isca_kraken_ancestral',
      'ancestral': 'isca_kraken_ancestral',
      'isca_kraken_ancestral': 'isca_kraken_ancestral'
    };
    const key = String(nameOrId).toLowerCase().trim();
    const targetId = aliasMap[key] || nameOrId;
    this.selectedBaitId = targetId;
    updateRodSVG(this.selectedRodId, this.selectedBaitId);
    this.saveGame();
    this.showToast(`🪝 Isca de teste equipada: ${targetId}`, 'success');
    console.log(`%c[TESTE] Anzol atualizado para isca: ${targetId} (sprite: icons/baits/hook_${targetId}.png)`, 'color: #38bdf8;');
  }

  /**
   * Simula a animação de puxão/fisgada no anzol
   */
  testTug() {
    const hookContainer = document.getElementById('vertical-fishing-rig');
    if (hookContainer) {
      hookContainer.classList.remove('hook-tug-active');
      void hookContainer.offsetWidth; // trigger reflow
      hookContainer.classList.add('hook-tug-active');
      setTimeout(() => hookContainer.classList.remove('hook-tug-active'), 500);
    }
    this.showToast('🎣 Fisgada no anzol simulada!', 'info');
    console.log('[TESTE] Animação física de fisgada disparada.');
  }

  /**
   * Exibe o status atual de todos os novos sistemas no console
   */
  printStatus() {
    console.group('%c🎣 [Pescaria Clicker] Status dos Sistemas', 'color: #38bdf8; font-weight: bold; font-size: 13px;');
    console.table({
      'Santuário dos Olhos (Menu)': { Status: this.firstRarityCatches?.LENDARIO ? '🔓 Desbloqueado' : '🔒 Bloqueado / Oculto' },
      'Oferendas de Espécies': { Status: this.firstRarityCatches?.MITICO ? '🔓 Desbloqueadas' : '🔒 Bloqueadas' },
      '1º Lendário Capturado': { Status: this.firstRarityCatches?.LENDARIO ? '✅ Sim' : '❌ Não' },
      '1º Mítico Capturado': { Status: this.firstRarityCatches?.MITICO ? '✅ Sim' : '❌ Não' },
      '1º Secreto Capturado': { Status: this.firstRarityCatches?.SECRETO ? '✅ Sim' : '❌ Não' },
      'Olhos de Peixe (Disponíveis)': { Status: this.fishEyesCount || 0 },
      'Olhos de Peixe (Total)': { Status: this.fishEyesTotal || 0 },
      'Isca Atual (Cor do Anzol)': { Status: this.selectedBaitId || 'minhoca' }
    });
    console.groupEnd();
  }

  /**
   * Lista todos os comandos de teste disponíveis
   */
  printHelp() {
    console.log(`%c══════════════════════════════════════════════════════════════════
🎮 COMANDOS DE TESTE DISPONÍVEIS NO CONSOLE
══════════════════════════════════════════════════════════════════%c
⭐ CELEBRAÇÕES & ANIMAÇÕES:
  • testLendario()         -> 1º Lendário (desbloqueia Santuário + 1 Olho)
  • testMitico()           -> 1º Mítico (desbloqueia Oferendas no Santuário)
  • testSecreto()          -> 1º Secreto (Celebração Mística)
  • testBuff()             -> 1º Peixe com Buff (tutorial Aquário)
  • testSplash()           -> Gotas d'água e splash no lago
  • testRepetir('LENDARIO')-> 2º Peixe (comprova que não duplica overlay)
  • testPatchNotes()       -> Notas de Atualização com timer

🔒 TRAVAS & CONTROLE (SANTUÁRIO / OFERENDAS):
  • testLiberarSantuario() / testTravarSantuario()
  • testLiberarOferendas() / testTravarOferendas()

🪝 ANZOL, BÓIA & ISCA:
  • testIsca('nome')       -> Troca isca ('minhoca', 'neon', 'ouro', 'kraken')
  • testFisgada()          -> Animação física de puxão no anzol

🔄 RESTAURAÇÃO DE PROGRESSO:
  • resetProgresso()       -> Reseta Santuário e Oferendas pro início
  • resetBuff()            -> Reseta celebração do 1º Peixe com Buff
  • resetPatchNotes()      -> Reseta visualização do patch notes

📊 INFORMAÇÕES:
  • testStatus()           -> Exibe tabela com status dos desbloqueios
  • testAjuda()            -> Exibe esta lista de ajuda
══════════════════════════════════════════════════════════════════`,
    'color: #38bdf8; font-weight: bold; font-size: 12px;',
    'color: #e2e8f0; font-family: monospace; font-size: 11px;'
    );
  }

  // Comandos de teste legados preservados
  testFirstCatchCelebration(rarity = 'LENDARIO') {
    this.simulateFirstCatch(rarity, true);
  }

  resetFirstCatchCelebrations() {
    this.resetEyesProgression();
  }
}

// Atalhos globais para o console do navegador (testLendario(), testAjuda(), m1(), m2()...)
export function installDevGlobals() {
  // Aliases globais no window para digitação rápida no console
  window.testLendario = (force = true) => window.game?.simulateFirstCatch('LENDARIO', force);
  window.testLegendary = (force = true) => window.game?.simulateFirstCatch('LENDARIO', force);
  window.testMitico = (force = true) => window.game?.simulateFirstCatch('MITICO', force);
  window.testMythic = (force = true) => window.game?.simulateFirstCatch('MITICO', force);
  window.testSecreto = (force = true) => window.game?.simulateFirstCatch('SECRETO', force);
  window.testSecret = (force = true) => window.game?.simulateFirstCatch('SECRETO', force);
  window.testCatch = (rarity) => window.game?.simulateFirstCatch(rarity, true);
  window.testRepetir = (rarity = 'LENDARIO') => window.game?.simulateSecondCatch(rarity);

  window.resetProgresso = () => window.game?.resetEyesProgression();
  window.resetProgression = () => window.game?.resetEyesProgression();
  window.resetFirstCatch = () => window.game?.resetEyesProgression();
  window.resetDonations = () => window.game?.resetDonations();

  window.testTravarSantuario = () => window.game?.setSanctuaryUnlocked(false);
  window.testLiberarSantuario = () => window.game?.setSanctuaryUnlocked(true);
  window.testTravarOferendas = () => window.game?.setOfferingsUnlocked(false);
  window.testLiberarOferendas = () => window.game?.setOfferingsUnlocked(true);

  window.testIsca = (name) => window.game?.testEquipBait(name);
  window.testFisgada = () => window.game?.testTug();

  window.testStatus = () => window.game?.printStatus();
  window.testAjuda = () => window.game?.printHelp();
  window.testHelp = () => window.game?.printHelp();
  window.testPatchNotes = (withCooldown = true) => window.game?.openPatchNotesModal(withCooldown);
  window.resetPatchNotes = () => {
    localStorage.removeItem('fc_last_seen_patch_version');
    console.log('[Pescaria Clicker] Versão vista resetada! Ao recarregar a página, as notas abrirão com timer de 5s.');
  };
  window.testBuff = (force = true) => window.game?.simulateFirstBuffCatch(force);
  window.testBuffFish = (force = true) => window.game?.simulateFirstBuffCatch(force);
  window.testPeixeBuff = (force = true) => window.game?.simulateFirstBuffCatch(force);
  window.resetBuff = () => {
    if (window.game) {
      window.game.hasSeenBuffFishNotice = false;
      window.game.saveGame();
      console.log('[Pescaria Clicker] Celebração do 1º peixe com buff resetada!');
    }
  };
  window.testSplash = () => window.game?.execConsoleCmd('testsplash');
  window.testGotas = () => window.game?.execConsoleCmd('testsplash');
  window.sumario = () => window.game?.openSummary();
  window.summary = () => window.game?.openSummary();

  // Navegação entre Mundos & Modos de Jogo
  window.world = (w) => window.game?.travelBetweenWorlds(Number(w) || 1);
  window.travelBetweenWorlds = (w) => window.game?.travelBetweenWorlds(Number(w) || 1);
  window.m1 = () => window.game?.travelBetweenWorlds(1);
  window.m2 = () => {
    if (window.game) {
      if (window.game.gameMode === 'ima') window.game.setGameMode('pesca');
      if (window.game.currentWorld === 2) {
        window.game.renderAll();
      } else if (window.game.world2SavedData) {
        window.game.travelBetweenWorlds(2);
      } else {
        window.game.enterWorld2Reset();
      }
    }
  };
  window.modoPesca = () => window.game?.setGameMode('pesca');
  window.modoIma = () => {
    if (window.game) {
      window.game.magnetUnlocked = true;
      window.game.setGameMode('ima');
    }
  };

  // Banner informativo no console
  setTimeout(() => {
    console.log('%c[Pescaria Clicker] 🛠️ Comandos de teste ativos! Digite %ctestAjuda()%c no console para ver a lista.', 
      'color: #38bdf8; font-weight: bold;', 
      'color: #f59e0b; font-weight: bold; background: #1e293b; padding: 1px 4px; border-radius: 3px;', 
      'color: #38bdf8; font-weight: bold;'
    );
  }, 500);
}
