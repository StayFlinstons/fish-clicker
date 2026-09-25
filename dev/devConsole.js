// Console de desenvolvedor dentro do jogo (Ctrl+Shift+' ou a tecla ` / ~) e seus comandos.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { DEPTH_LAYERS } from '../depthData.js';
import { FISH_LIST, generateFishBuffs } from '../fishData.js';
import { BAITS, RODS, UPGRADES } from '../itemsData.js';
import { FORGE_RECIPES, MAGNET_ITEMS, MAGNET_TIERS } from '../magnetData.js';
import { sound } from '../sound.js';

export class DevConsoleMethods {
  initConsole() {
    // Container
    const div = document.createElement('div');
    div.id = 'dev-console';
    div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:100;display:none;flex-direction:column;max-height:360px;box-shadow:0 -4px 20px rgba(0,0,0,0.8);';
    div.innerHTML = `
      <div id="console-log" style="flex:1;overflow-y:auto;background:rgba(8,12,20,0.96);padding:10px 14px;font-family:monospace;font-size:11.5px;color:#e2e8f0;max-height:300px;line-height:1.45;border-top:2px solid #0284c7;"></div>
      <div style="display:flex;background:#0f172a;border-top:1px solid #1e293b;">
        <span style="padding:7px 10px;color:#38bdf8;font-family:monospace;font-size:12px;font-weight:bold;">></span>
        <input id="console-input" type="text" placeholder="Digite help para ver os comandos..." autocomplete="off"
          style="flex:1;background:transparent;border:none;outline:none;color:#f8fafc;font-family:monospace;font-size:12px;padding:7px 4px;">
      </div>
    `;
    document.body.appendChild(div);

    // Input handler
    const inputEl = document.getElementById('console-input');
    inputEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = e.target.value.trim();
        if (val) { this.execConsoleCmd(val); e.target.value = ''; }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.toggleConsole(false);
      }
    });

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
      // Ctrl + Shift + ' (ou ")
      const isQuote = e.key === "'" || e.key === '"' || e.code === 'Quote';
      if (e.ctrlKey && e.shiftKey && isQuote) {
        e.preventDefault();
        this.toggleConsole();
        return;
      }

      // Esc para fechar quando o console estiver aberto
      if (e.key === 'Escape' && this.consoleOpen) {
        e.preventDefault();
        this.toggleConsole(false);
        return;
      }

      // Mantém ` ou ~
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        this.toggleConsole();
      }
    });
  }

  toggleConsole(forceState = null) {
    this.consoleOpen = forceState !== null ? forceState : !this.consoleOpen;
    const el = document.getElementById('dev-console');
    if (el) el.style.display = this.consoleOpen ? 'flex' : 'none';
    if (this.consoleOpen) {
      setTimeout(() => document.getElementById('console-input')?.focus(), 50);
    }
  }

  consoleLog(text, color = '#a0f0a0') {
    const log = document.getElementById('console-log');
    if (!log) return;
    const line = document.createElement('div');
    line.style.color = color;
    line.style.marginBottom = '2px';
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  execConsoleCmd(raw) {
    this.consoleLog('> ' + raw, '#666');
    const parts = raw.toLowerCase().split(/\s+/);
    const cmd = parts[0];
    const arg = parts[1];

    switch (cmd) {
      case 'help':
      case 'ajuda':
      case 'comandos':
      case '?': {
        const cmdColor = '#cbd5e1';    // Cor única e nítida para todos os comandos
        const headerColor = '#38bdf8'; // Destaque para títulos de categorias

        this.consoleLog('══════════════ [ COMANDOS DO CONSOLE ] ══════════════', '#ffd700');

        this.consoleLog('🪙 RECURSOS & ECONOMIA', headerColor);
        this.consoleLog('  sumario / stats        - Abre o Sumário completo com estatísticas e recordes', cmdColor);
        this.consoleLog('  gold <qtd>             - Adiciona ouro (ex: gold 50000)', cmdColor);
        this.consoleLog('  goldset <qtd>          - Define o ouro exato (ex: goldset 0)', cmdColor);
        this.consoleLog('  fisheye [n]            - Adiciona n Olhos de Peixe (default: 1)', cmdColor);
        this.consoleLog('  midnight               - Simula virada das 00:00 (coleta de Olho)', cmdColor);

        this.consoleLog('🎣 PESCA & CAPTURAS', headerColor);
        this.consoleLog('  catch [n]              - Pesca n peixes aleatórios (default: 1)', cmdColor);
        this.consoleLog('  catchid <id> [n]       - Pesca peixe por ID (1 a 35) ou nome', cmdColor);
        this.consoleLog('  catchall               - Captura um de cada peixe do jogo', cmdColor);
        this.consoleLog('  goldenfish             - Spawna o peixe dourado especial', cmdColor);
        this.consoleLog('  bloodfish              - Spawna o peixe da Lua Sangrenta', cmdColor);
        this.consoleLog('  clearinv               - Limpa todos os peixes do balde', cmdColor);

        this.consoleLog('⭐ PROGRESSÃO & UPGRADES', headerColor);
        this.consoleLog('  maxupgrades            - Maximiza todas as melhorias da loja', cmdColor);
        this.consoleLog('  unlockall              - Desbloqueia todas as varas e iscas', cmdColor);
        this.consoleLog('  buff <tipo> [s]        - Ativa buff temporário (gold/luck/speed/double)', cmdColor);
        this.consoleLog('  offline [minutos]      - Simula tempo ausente AFK (default: 60 min)', cmdColor);

        this.consoleLog('🌍 CAMADAS, TEMPO & EVENTOS', headerColor);
        this.consoleLog('  camada <1-6>           - Desce/sobe até a camada (libera as varas)', cmdColor);
        this.consoleLog('  time [fase]            - Consulta ou define horário (day/sunset/night)', cmdColor);
        this.consoleLog('  skiptime               - Avança para o próximo horário do dia', cmdColor);
        this.consoleLog('  eclipse                - Inicia Eclipse e Mar Sangrento por 60s', cmdColor);

        this.consoleLog('🧲 PESCA MAGNÉTICA', headerColor);
        this.consoleLog('  magnet [tier]          - Ativa modo Pesca Magnética (ou "ima")', cmdColor);
        this.consoleLog('  pesca                  - Sai do ímã e volta à pesca tradicional', cmdColor);
        this.consoleLog('  magnetitem <id> [n]    - Adiciona item magnético ao inventário', cmdColor);

        this.consoleLog('✨ TESTES & ANIMAÇÕES', headerColor);
        this.consoleLog('  testlendario           - Celebração cinematográfica do 1º Lendário', cmdColor);
        this.consoleLog('  testmitico             - Celebração cinematográfica do 1º Mítico', cmdColor);
        this.consoleLog('  testsecreto            - Celebração cinematográfica do 1º Secreto', cmdColor);
        this.consoleLog('  testbuff               - Celebração do 1º Peixe com Buff (Aquário)', cmdColor);
        this.consoleLog('  testsplash             - Animação de gotas d\'água no lago', cmdColor);
        this.consoleLog('  testrepetir            - Testa captura repetida (sem duplicate overlay)', cmdColor);
        this.consoleLog('  isca <nome>            - Troca anzol e isca (minhoca, neon, ouro, kraken)', cmdColor);
        this.consoleLog('  patchnotes             - Abre Notas de Atualização com timer de 5s', cmdColor);

        this.consoleLog('🔄 RESETS & RESTAURAÇÃO', headerColor);
        this.consoleLog('  resetprogresso         - Reseta Santuário e Oferendas pro início', cmdColor);
        this.consoleLog('  resetbuff              - Reseta celebração do 1º Peixe com Buff', cmdColor);
        this.consoleLog('  resetpatchnotes        - Reseta visualização das Notas de Atualização', cmdColor);

        this.consoleLog('⚙️ SISTEMA', headerColor);
        this.consoleLog('  clear                  - Limpa o histórico de mensagens deste console', cmdColor);
        this.consoleLog('  reset                  - Reseta completamente o progresso do jogo', cmdColor);

        this.consoleLog('══════════════════════════════════════════════════════', '#ffd700');
        break;
      }

      case 'gold': {
        const amount = parseInt(arg) || 10000;
        this.gold += amount;
        this.totalGoldEarned += amount;
        this.consoleLog('+ ' + amount.toLocaleString() + ' ouro', '#ffd700');
        this.renderAll();
        break;
      }

      case 'goldset':
      case 'setgold': {
        const val = parseInt(arg);
        const amount = isNaN(val) ? 0 : Math.max(0, val);
        this.setGold(amount);
        this.consoleLog(`Ouro definido exatamente para: ${amount.toLocaleString('pt-BR')} G`, '#ffd700');
        break;
      }

      case 'skiptime':
      case 'skipday':
      case 'skip':
      case 'nexttime': {
        const validPhases = ['day', 'sunset', 'night'];
        const target = arg && validPhases.includes(arg.toLowerCase()) ? arg.toLowerCase() : null;
        const names = { day: 'DAY ☀️', sunset: 'SUNSET 🌅', night: 'NIGHT 🌙' };

        if (target) {
          this.setTimeOfDay(target);
          this.consoleLog(`Horário alterado para: ${names[this.timeOfDay]} (05:00 restantes)`, '#38bdf8');
        } else {
          const newPhase = this.skipTimeOfDay();
          this.consoleLog(`Horário pulado para: ${names[newPhase] || newPhase.toUpperCase()} (05:00 restantes)`, '#38bdf8');
        }
        break;
      }

      case 'time':
      case 'tod': {
        const validPhases = ['day', 'sunset', 'night'];
        const names = { day: 'DAY ☀️', sunset: 'SUNSET 🌅', night: 'NIGHT 🌙' };

        if (arg === 'skip' || arg === 'next') {
          const newPhase = this.skipTimeOfDay();
          this.consoleLog(`Horário pulado para: ${names[newPhase] || newPhase.toUpperCase()} (05:00 restantes)`, '#38bdf8');
        } else if (arg && validPhases.includes(arg.toLowerCase())) {
          this.setTimeOfDay(arg.toLowerCase());
          this.consoleLog(`Horário alterado para: ${names[this.timeOfDay]} (05:00 restantes)`, '#38bdf8');
        } else {
          const remaining = this.getTimeRemainingInPhase();
          this.consoleLog(`Horário atual: ${names[this.timeOfDay] || this.timeOfDay.toUpperCase()} (próxima mudança em ${remaining.text})`, '#38bdf8');
          this.consoleLog(`Uso: 'skiptime' | 'time <day|sunset|night>' | 'tod skip'`, '#888');
        }
        break;
      }

      case 'goldenfish':
        if (this.goldenFishActive) {
          this.consoleLog('Já existe um peixe dourado ativo!', '#ff6b6b');
        } else {
          clearTimeout(this.goldenFishTimer);
          this.spawnGoldenFish();
          this.consoleLog('Peixe dourado spawnado!', '#ffd700');
        }
        break;

      case 'bloodfish':
      case 'spawnblood':
        if (this.goldenFishActive) {
          this.consoleLog('Já existe um peixe ativo na tela!', '#ff6b6b');
        } else {
          clearTimeout(this.goldenFishTimer);
          this.spawnGoldenFish(true);
          this.consoleLog('Peixe da Lua Sangrenta spawnado!', '#ef4444');
        }
        break;

      case 'sumario':
      case 'summary':
      case 'stats':
      case 'relatorio': {
        this.openSummary();
        this.consoleLog('Sumário do Pescador aberto na tela!', '#38bdf8');
        break;
      }

      case 'patchnotes':
      case 'testpatchnotes':
        this.openPatchNotesModal(true);
        this.consoleLog('Notas de atualização abertas com timer de 5s!', '#38bdf8');
        break;

      case 'resetpatchnotes':
        localStorage.removeItem('fc_last_seen_patch_version');
        this.consoleLog('Status de versão vista resetado! Ao recarregar a página o modal abrirá automaticamente.', '#a855f7');
        break;

      case 'testbuff':
      case 'testbufffish':
      case 'testpeixebuff':
      case 'buffcelebration':
      case 'buffnotice':
      case 'testbuffnotice':
      case 'buff':
        this.toggleConsole(false);
        this.simulateFirstBuffCatch(true);
        this.consoleLog('🐠 Celebração épica do 1º Peixe com Buff disparada!', '#a855f7');
        break;

      case 'resetbuff':
      case 'resetbuffnotice':
        this.hasSeenBuffFishNotice = false;
        this.saveGame();
        this.consoleLog('Status de celebração do 1º peixe com buff resetado!', '#a855f7');
        break;

      case 'testsplash':
      case 'testgotas':
      case 'splash':
      case 'gotas':
        if (this.waterRenderer) {
          this.waterRenderer.catchAndSpawnFish('dourado');
          this.consoleLog('💧 Animação de gotas e splash disparada no peixinho do lago!', '#38bdf8');
          this.showToast('💧 Gotas d\'água espirradas no lago!', 'info');
        } else {
          this.consoleLog('WaterRenderer não inicializado.', '#f87171');
        }
        break;

      case 'eclipse':
      case 'bloodmoon':
        this.startBloodMoonEvent(60000);
        this.consoleLog('Eclipse Vermelho e Mar Sangrento iniciados por 60 segundos!', '#dc2626');
        break;

      case 'offline':
      case 'afk': {
        const mins = Math.max(1, parseInt(arg) || 60);
        this.consoleLog(`Simulando ${mins} minutos de ausência offline...`, '#38bdf8');
        this.checkOfflineProgress(mins * 60);
        break;
      }

      case 'catchid': {
        const query = parts[1];
        if (!query) {
          this.consoleLog('Uso: catchid <id_ou_nome> [quantidade]', '#ff6b6b');
          this.consoleLog(`IDs válidos: 1 a ${FISH_LIST.length}. Ex: catchid 28 (Lampreia) ou catchid 1 5`, '#888');
          break;
        }
        const num = parseInt(query);
        const target = FISH_LIST.find(f => (!isNaN(num) && f.numId === num) || f.id.toLowerCase() === query.toLowerCase());
        if (!target) {
          this.consoleLog(`Peixe com ID "${query}" não encontrado! IDs válidos: 1 a ${FISH_LIST.length}.`, '#ff6b6b');
          break;
        }
        const count = Math.min(Math.max(1, parseInt(parts[2]) || 1), 20);
        const freeSlots = this.getMaxInventory() - this.inventory.length;
        if (freeSlots <= 0) {
          this.consoleLog('Seu balde está cheio! Venda peixes antes.', '#ff6b6b');
          break;
        }
        const toCatch = Math.min(count, freeSlots);
        for (let i = 0; i < toCatch; i++) {
          const weight = +(target.minWeight + Math.random() * (target.maxWeight - target.minWeight)).toFixed(2);
          const weightFactor = weight / target.minWeight;
          const rawValue = Math.round(target.baseValue * Math.pow(weightFactor, 0.7));
          const generatedBuffs = generateFishBuffs(target.id, target.rarity);
          let specialAura = null;
          if (this.bloodMoonEventActive) {
            const auraRoll = Math.random();
            if (auraRoll < 0.10) {
              specialAura = 'eclipse';
              generatedBuffs.push({
                type: 'event_eclipse',
                value: 0.15,
                double: 0.15,
                text: '+15% Vel. Pesca, +15% Pesca Dupla (Eclipse)'
              });
            } else if (auraRoll < 0.20) {
              specialAura = 'lua_sangrenta';
              generatedBuffs.push({
                type: 'event_blood_moon',
                value: 0.15,
                luck: 0.15,
                text: '+15% Ouro, +15% Sorte (Lua Sangrenta)'
              });
            }
          }
          const fish = {
            uid: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            id: target.id,
            numId: target.numId,
            name: target.name,
            rarity: target.rarity,
            icon: target.icon,
            weight,
            baseValue: rawValue,
            desc: target.desc,
            buffs: generatedBuffs,
            buff: generatedBuffs[0] || null,
            isDoubleBuff: generatedBuffs.length === 2,
            isTripleBuff: generatedBuffs.length >= 3 || target.rarity === 'SECRETO',
            specialAura: specialAura,
            locked: false
          };
          this.inventory.unshift(fish);
          this.totalCatches++;
          sound.playCatch(fish.rarity);
          sound.vibrateCatch(fish.rarity);
          this.showCatchNotification(fish);
          this.recordDiscovery(fish);
          this.checkFirstBuffFishCatch(fish);
        }
        this.renderAll();
        this.consoleLog(`[#${target.numId}] ${target.name} pescado com sucesso (${toCatch}x)!`, '#38bdf8');
        break;
      }

      case 'catch': {
        const n = Math.min(parseInt(arg) || 1, 50);
        const buffs = this.getActiveBuffs();
        let caught = 0;
        for (let i = 0; i < n; i++) {
          if (this.inventory.length >= this.getMaxInventory()) break;
          this.inventory.unshift(this.rollFish(buffs));
          this.totalCatches++;
          caught++;
        }
        this.consoleLog(caught + ' peixes pescados!', '#34d399');
        this.renderAll();
        break;
      }

      case 'catchall': {
        let count = 0;
        const targetList = this.getFishCatalog();
        targetList.forEach(target => {
          const weight = +(target.minWeight + Math.random() * (target.maxWeight - target.minWeight)).toFixed(2);
          const weightFactor = weight / target.minWeight;
          const rawValue = Math.round(target.baseValue * Math.pow(weightFactor, 0.7));
          const generatedBuffs = generateFishBuffs(target.id, target.rarity);
          const fish = {
            uid: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            id: target.id,
            numId: target.numId,
            name: target.name,
            rarity: target.rarity,
            icon: target.icon,
            weight,
            baseValue: rawValue,
            desc: target.desc,
            buffs: generatedBuffs,
            buff: generatedBuffs[0] || null,
            isDoubleBuff: generatedBuffs.length === 2,
            isTripleBuff: generatedBuffs.length >= 3 || target.rarity === 'SECRETO',
            specialAura: target.rarity === 'SECRETO' ? 'void' : null,
            locked: false
          };
          this.inventory.unshift(fish);
          this.totalCatches++;
          this.recordDiscovery(fish);
          count++;
        });
        sound.playCatch('MITICO');
        this.renderAll();
        this.saveGame();
        this.consoleLog(`🎣 Sucesso! Todos os ${count} peixes do jogo foram capturados e registrados na Enciclopédia!`, '#34d399');
        this.showToast(`Capturados todos os ${count} peixes!`, 'success');
        break;
      }

      case 'maxupgrades':
        UPGRADES.forEach(u => { this.upgradeLevels[u.id] = u.maxLevel; });
        this.consoleLog('Upgrades maximizados!', '#a855f7');
        this.renderAll();
        break;

      case 'unlockall':
        RODS.forEach(r => { if (!this.unlockedRods.includes(r.id)) this.unlockedRods.push(r.id); });
        BAITS.forEach(b => { if (!this.unlockedBaits.includes(b.id)) this.unlockedBaits.push(b.id); });
        this.consoleLog('Todas varas e iscas desbloqueadas!', '#38bdf8');
        this.renderAll();
        break;

      case 'camada':
      case 'layer':
      case 'profundidade': {
        const n = parseInt(arg, 10);
        if (!(n >= 1 && n <= DEPTH_LAYERS.length)) {
          const L = DEPTH_LAYERS[this.getCurrentLayer() - 1];
          this.consoleLog(`Camada atual: ${L.id} (${L.name}), liberada até ${this.getMaxLayer()}. Uso: camada 1 a ${DEPTH_LAYERS.length}`, '#38bdf8');
          break;
        }
        if (this.gameMode === 'ima') this.setGameMode('pesca');
        // Dev: libera as varas necessárias para chegar na camada
        RODS.filter(r => r.depthLayer <= n).forEach(r => { if (!this.unlockedRods.includes(r.id)) this.unlockedRods.push(r.id); });
        this.setLayer(n);
        this.consoleLog(`🌊 Camada ${n}: ${DEPTH_LAYERS[n - 1].name}`, '#06b6d4');
        break;
      }

      case 'pesca':
      case 'pescaria':
      case 'normal':
      case 'modopesca':
        this.setGameMode('pesca');
        this.consoleLog('🎣 Retornou para o modo de Pesca tradicional!', '#38bdf8');
        break;

      case 'kraken':
        this.triggerKrakenCinematic();
        this.consoleLog('🦑 Cinemática do Kraken Ancestral iniciada!', '#a855f7');
        break;

      case 'clearinv':
        this.inventory = [];
        this.consoleLog('Inventário limpo!', '#f87171');
        this.renderAll();
        break;

      case 'buff': {
        const buffTypes = { gold: 'gold_frenzy', luck: 'luck_surge', speed: 'speed_burst', double: 'double_mania' };
        const bt = buffTypes[arg || 'gold'];
        if (!bt) { this.consoleLog('Tipo inválido! Use: gold, luck, speed, double', '#ff6b6b'); break; }
        const dur = (parseInt(parts[2]) || 60) * 1000;
        this.tempBuffs.push({ type: bt, multiplier: 2.0, endsAt: Date.now() + dur, label: (arg || 'gold').toUpperCase() });
        this.consoleLog('Buff ' + (arg || 'gold') + ' ativado por ' + (dur / 1000) + 's!', '#ffd700');
        this.renderBuffs();
        break;
      }

            case 'resetdonations':
      case 'resetdoacoes':
      case 'resetdoar':
      case 'cleardonations':
        this.resetDonations();
        break;

      case 'fisheye':
      case 'giveeye': {
        const count = Math.max(1, parseInt(arg) || 1);
        this.fishEyesCount = (this.fishEyesCount || 0) + count;
        this.fishEyesTotal = (this.fishEyesTotal || 0) + count;
        this.consoleLog(`+${count} Olho(s) de Peixe adicionado(s)! Total disponível: ${this.fishEyesCount}`, '#38bdf8');
        this.renderFishEyesBadge();
        this.renderFishEyesModal();
        this.saveGame();
        break;
      }

      case 'midnight': {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        this.lastFishEyeDate = this.getLocalDateKey(d);
        this.consoleLog('Simulando virada de meia-noite (00:00)...', '#ffd700');
        this.checkMidnightFishEye(true);
        break;
      }

      case 'magnet':
      case 'ima':
      case 'ímã':
      case 'modoima':
      case 'cheatmagnet': {
        const tier = Math.max(1, Math.min(5, parseInt(arg) || 1));
        this.magnetUnlocked = true;
        this.magnetTier = tier;
        this.renderHeader();
        this.consoleLog(`Pesca Magnética desbloqueada no Tier ${tier} (${MAGNET_TIERS[tier - 1]?.name})!`, '#f59e0b');
        this.setGameMode('ima');
        break;
      }

      case 'magnettier': {
        const tier = Math.max(1, Math.min(5, parseInt(arg) || 1));
        this.upgradeMagnetTier(tier);
        this.consoleLog(`Tier do Ímã alterado para ${tier}!`, '#f59e0b');
        break;
      }

      case 'magnetitem': {
        const itemId = parts[1];
        const qty = Math.max(1, parseInt(parts[2]) || 1);
        if (!itemId || !MAGNET_ITEMS[itemId]) {
          this.consoleLog(`Item inválido! Ex: magnetitem minerio_ferro 5. IDs: ${Object.keys(MAGNET_ITEMS).join(', ')}`, '#ff6b6b');
          break;
        }
        this.magnetInventory[itemId] = (this.magnetInventory[itemId] || 0) + qty;
        this.consoleLog(`+${qty}x ${MAGNET_ITEMS[itemId].name} adicionado à Mochila de Garimpo!`, '#f59e0b');
        if (this.gameMode === 'ima') this.renderMagnetRightPanel();
        break;
      }

      case 'magnetall': {
        this.magnetUnlocked = true;
        this.magnetTier = 5;
        Object.keys(MAGNET_ITEMS).forEach(id => {
          this.magnetInventory[id] = (this.magnetInventory[id] || 0) + 10;
          this.museumDonations[id] = true;
        });
        FORGE_RECIPES.forEach(r => {
          this.forgeUpgrades[r.id] = true;
        });
        this.consoleLog('Todos os ímãs (Tier 5), 10x de cada item, Museu e Forja desbloqueados!', '#f59e0b');
        this.renderHeader();
        this.setGameMode('ima');
        break;
      }

      case 'magnetopen':
        this.setGameMode('ima');
        break;

      case 'reset':
        this.resetProgress();
        break;

      case 'firstcatch':
      case 'celebration':
      case 'animacao':
      case 'testcatch': {
        const rMap = {
          'lendario': 'LENDARIO',
          'lendaria': 'LENDARIO',
          'lendário': 'LENDARIO',
          'leg': 'LENDARIO',
          'mitico': 'MITICO',
          'mítico': 'MITICO',
          'mythic': 'MITICO',
          'secreto': 'SECRETO',
          'secret': 'SECRETO'
        };
        const rarity = rMap[(arg || '').toLowerCase()] || 'LENDARIO';
        this.toggleConsole(false);
        this.testFirstCatchCelebration(rarity);
        this.consoleLog(`🎉 Celebração disparada para raridade ${rarity}!`, '#ffd700');
        break;
      }

      case 'resetfirstcatch':
      case 'resetcelebration':
        this.resetFirstCatchCelebrations();
        break;

      // ─── TESTES DAS NOVAS IMPLEMENTAÇÕES NO CONSOLE DO JOGO ───
      case 'testlendario':
      case 'testlegendary':
      case 'lendario':
        this.toggleConsole(false);
        this.simulateFirstCatch('LENDARIO', true);
        this.consoleLog('⭐ Captura do 1º Lendário simulada (Santuário + 1 Olho liberados)!', '#ffd700');
        break;

      case 'testmitico':
      case 'testmythic':
      case 'mitico':
        this.toggleConsole(false);
        this.simulateFirstCatch('MITICO', true);
        this.consoleLog('⭐ Captura do 1º Mítico simulada (Oferendas do Santuário liberadas)!', '#ec4899');
        break;

      case 'testsecreto':
      case 'testsecret':
      case 'secreto':
        this.toggleConsole(false);
        this.simulateFirstCatch('SECRETO', true);
        this.consoleLog('⭐ Captura do 1º Secreto simulada!', '#a855f7');
        break;

      case 'testrepetir':
      case 'repetir': {
        const targetRarity = (arg || 'LENDARIO').toUpperCase();
        this.simulateSecondCatch(targetRarity);
        this.consoleLog(`⭐ Tentativa de 2º peixe ${targetRarity} realizada (nenhuma celebração repetida)!`, '#34d399');
        break;
      }

      case 'resetprogresso':
      case 'resetolhos':
      case 'reseteyes':
        this.resetEyesProgression();
        this.consoleLog('↺ Progresso dos Olhos e Santuário resetado para o início!', '#f59e0b');
        break;

      case 'travarsantuario':
      case 'bloquearsantuario':
        this.setSanctuaryUnlocked(false);
        this.consoleLog('🔒 Santuário dos Olhos bloqueado e oculto do menu!', '#f87171');
        break;

      case 'liberarsantuario':
      case 'destravarsantuario':
        this.setSanctuaryUnlocked(true);
        this.consoleLog('🔓 Santuário dos Olhos liberado no menu!', '#34d399');
        break;

      case 'travaroferendas':
      case 'bloquearoferendas':
        this.setOfferingsUnlocked(false);
        this.consoleLog('🔒 Oferendas do Santuário e botões de doar bloqueados!', '#f87171');
        break;

      case 'liberaroferendas':
      case 'destravaroferendas':
        this.setOfferingsUnlocked(true);
        this.consoleLog('🔓 Oferendas do Santuário e botões de doar liberados!', '#34d399');
        break;

      case 'testisca':
      case 'isca':
      case 'setisca':
      case 'hook': {
        const baitKey = arg || 'minhoca';
        this.testEquipBait(baitKey);
        this.consoleLog(`🪝 Isca/Anzol alterado para: ${baitKey}`, '#38bdf8');
        break;
      }

      case 'testfisgada':
      case 'fisgada':
      case 'tug':
        this.testTug();
        this.consoleLog('🎣 Física de fisgada disparada no anzol!', '#38bdf8');
        break;

      case 'teststatus':
      case 'status':
        this.consoleLog('=== STATUS DOS SISTEMAS ===', '#ffd700');
        this.consoleLog(`• Santuário dos Olhos: ${this.firstRarityCatches?.LENDARIO ? '🔓 Desbloqueado' : '🔒 Bloqueado / Oculto'}`, this.firstRarityCatches?.LENDARIO ? '#34d399' : '#f87171');
        this.consoleLog(`• Oferendas de Espécies: ${this.firstRarityCatches?.MITICO ? '🔓 Liberadas' : '🔒 Bloqueadas'}`, this.firstRarityCatches?.MITICO ? '#34d399' : '#f87171');
        this.consoleLog(`• 1º Lendário: ${this.firstRarityCatches?.LENDARIO ? '✅ Capturado' : '❌ Não capturado'}`, '#e2e8f0');
        this.consoleLog(`• 1º Mítico: ${this.firstRarityCatches?.MITICO ? '✅ Capturado' : '❌ Não capturado'}`, '#e2e8f0');
        this.consoleLog(`• 1º Secreto: ${this.firstRarityCatches?.SECRETO ? '✅ Capturado' : '❌ Não capturado'}`, '#e2e8f0');
        this.consoleLog(`• Olhos de Peixe: ${this.fishEyesCount || 0} disponíveis (${this.fishEyesTotal || 0} totais)`, '#38bdf8');
        this.consoleLog(`• Isca / Anzol atual: ${this.selectedBaitId || 'minhoca'}`, '#f59e0b');
        break;

      case 'clear':
        document.getElementById('console-log').innerHTML = '';
        break;

      default:
        this.consoleLog('Comando desconhecido. Digite "help"', '#ff6b6b');
    }
  }

}
