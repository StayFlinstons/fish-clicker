// Camadas de profundidade: escolha da camada, cenário de cada uma e liberação por vara.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { DEPTH_LAYERS, formatDepth, getDepthLayer } from '../depthData.js';
import { sound } from '../sound.js';

const SCENERY_ELEMENTS = {
  recife_bioluminescente: 'scenery-recife',
  fendas_vulcanicas: 'scenery-vulcanicas',
  cemiterio_naufragios: 'scenery-naufragios',
  zona_hadal: 'scenery-hadal'
};

export class DepthMethods {
  // Da Zona do Crepúsculo para baixo o pescador vira mergulhador e a água vira abismo.
  isDeepLayer() {
    return this.getCurrentLayer() >= 3;
  }

  changeLayer(delta) {
    const target = this.getCurrentLayer() + delta;
    if (target < 1) return;
    if (target > this.getMaxLayer()) {
      const next = getDepthLayer(target);
      if (target <= DEPTH_LAYERS.length) {
        this.showToast(`🔒 ${next.name} (${formatDepth(next.minDepth)}): compre uma vara que alcance essa profundidade.`, 'warning');
      }
      return;
    }
    this.setLayer(target);
  }

  setLayer(layerId, { silent = false } = {}) {
    const target = Math.max(1, Math.min(layerId, this.getMaxLayer()));
    if (target === this.getCurrentLayer() && this.currentLayer === target) {
      this.renderDepthSelector();
      return;
    }
    this.currentLayer = target;
    const layer = getDepthLayer(target);
    if (!silent) {
      sound.playWaterSplash?.();
      this.showToast(`${layer.icon} ${layer.name} · ${formatDepth(layer.minDepth)} a ${formatDepth(layer.maxDepth)}`, 'info');
    }
    this.applyTimeOfDay();
    this.updateFisherman();
    this.resetSonar();
    this.renderDepthSelector();
    this.saveGame();
    this.renderAll();
  }

  // Chamado ao comprar uma vara: se ela libera uma camada nova, avisa e desce até lá.
  onRodUnlocked(prevMaxLayer) {
    const maxLayer = this.getMaxLayer();
    if (maxLayer <= prevMaxLayer) return;
    const layer = getDepthLayer(maxLayer);
    this.trackAnalyticsOnce?.(`camada-${maxLayer}`);
    setTimeout(() => {
      sound.playUpgrade?.();
      this.showToast(`🌊 NOVA PROFUNDIDADE: ${layer.icon} ${layer.name} (até ${formatDepth(layer.maxDepth)})!`, 'special');
    }, 400);
    this.setLayer(maxLayer, { silent: true });
  }

  // Aviso único depois de migrar um save de antes das camadas (ver migrateToDepthLayers).
  showMigrationNotice() {
    const notes = this.depthMigrationNotes;
    this.depthMigrationNotes = null;
    if (!notes || !notes.length) return;
    const el = document.createElement('div');
    el.className = 'px-4 py-2 border-2 bg-purple-950/95 border-purple-400 text-purple-100 text-[10px] text-left max-w-md';
    el.style.fontFamily = 'var(--font-pixel)';
    el.style.boxShadow = '4px 4px 0 #000';
    el.innerHTML = `<b class="text-cyan-300">🌊 O jogo agora é em camadas de profundidade!</b><ul class="mt-1 list-disc pl-4 space-y-0.5">${notes.map(n => `<li>${n.charAt(0).toUpperCase() + n.slice(1)}.</li>`).join('')}</ul>`;
    this.pushNotice(el, 20000, 'migracao-camadas');
    this.saveGame();
  }

  showLayerInfo() {
    sound.playClick?.();
    const layer = getDepthLayer(this.getCurrentLayer());
    const maxLayer = this.getMaxLayer();
    const next = maxLayer < DEPTH_LAYERS.length ? getDepthLayer(maxLayer + 1) : null;
    const nextText = next ? ` Próxima: ${next.name}, com uma vara mais funda.` : ' Você chegou ao fundo do oceano!';
    this.showToast(`${layer.icon} ${layer.name}: ${layer.desc}${nextText}`, 'info');
  }

  renderDepthSelector() {
    const label = document.getElementById('depth-label-name');
    const range = document.getElementById('depth-label-range');
    const up = document.getElementById('btn-depth-up');
    const down = document.getElementById('btn-depth-down');
    if (!label) return;
    const current = this.getCurrentLayer();
    const maxLayer = this.getMaxLayer();
    const layer = getDepthLayer(current);
    label.textContent = `${layer.icon} ${layer.name}`;
    label.style.color = layer.themeColor;
    if (range) range.textContent = `${formatDepth(layer.minDepth)}–${formatDepth(layer.maxDepth)} · ${current}/${DEPTH_LAYERS.length}`;
    if (up) up.disabled = current <= 1;
    if (down) {
      down.disabled = current >= DEPTH_LAYERS.length;
      down.classList.toggle('opacity-40', current >= maxLayer);
      down.title = current >= maxLayer
        ? (current >= DEPTH_LAYERS.length ? 'Fundo do oceano' : 'Precisa de uma vara mais funda')
        : 'Descer uma camada';
    }
  }

  // Fundo do lago da camada atual. Camada 1 usa o lago do rio (com dia/pôr do sol/noite);
  // as outras reaproveitam os cenários de pixel art do fundo do mar.
  applyLayerScenery() {
    const layer = getDepthLayer(this.getCurrentLayer());
    const sceneryContainer = document.getElementById('world2-lake-scenery');
    const lakeBg = document.getElementById('world1-lake-bg');
    const lakeArea = document.getElementById('fishing-lake-area');
    const stars = document.getElementById('world1-sky-stars');

    if (!layer.scenery) {
      sceneryContainer?.classList.add('hidden');
      lakeBg?.classList.remove('hidden');
      stars?.classList.remove('hidden');
      this.waterRenderer?.setWorldMode(false, null, this.getSwimmingFishIcons(), layer.id);
      return false;
    }

    sceneryContainer?.classList.remove('hidden');
    if (sceneryContainer) sceneryContainer.style.filter = layer.sceneryFilter || '';
    lakeBg?.classList.add('hidden');
    stars?.classList.add('hidden');
    Object.entries(SCENERY_ELEMENTS).forEach(([id, elemId]) => {
      const el = document.getElementById(elemId);
      if (!el) return;
      const on = id === layer.scenery;
      el.classList.toggle('hidden', !on);
      el.style.opacity = on ? '1' : '0';
    });
    if (lakeArea && layer.gradient) lakeArea.style.background = layer.gradient;
    this.waterRenderer?.setWorldMode(true, layer.scenery, this.getSwimmingFishIcons(), layer.id);
    return true;
  }

  // Peixes comuns e incomuns da camada que nadam de enfeite no cenário (até 4).
  getSwimmingFishIcons() {
    const icons = this.getLayerFish()
      .filter(f => f.rarity === 'COMUM' || f.rarity === 'INCOMUM')
      .map(f => f.icon);
    return [...new Set(icons)].slice(0, 4);
  }
}
