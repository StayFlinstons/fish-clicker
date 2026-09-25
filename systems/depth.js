// Camadas de profundidade: escolha da camada, cenário de cada uma e liberação por vara.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
import { DEPTH_LAYERS, formatDepth, getDepthLayer } from '../depthData.js';
import { sound } from '../sound.js';

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
    this.applyLayerScenery();
    this.updateFisherman();
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

  // Fundo do lago da camada atual (uma imagem por camada) e o visual do Eclipse Vermelho por cima.
  applyLayerScenery() {
    const layer = getDepthLayer(this.getCurrentLayer());
    const bgImg = document.getElementById('lake-bg-img');
    const bgEclipse = document.getElementById('lake-bg-eclipse');
    const overlay = document.getElementById('lake-bg-overlay');
    const lakeArea = document.getElementById('fishing-lake-area');
    const isEclipse = Boolean(this.bloodMoonEventActive);
    // O rio tem um fundo próprio para o Eclipse; nas outras camadas só a água fica vermelha
    const riverEclipse = isEclipse && !layer.scenery;

    if (bgImg) {
      if (bgImg.getAttribute('src') !== layer.image) bgImg.setAttribute('src', layer.image);
      bgImg.style.opacity = riverEclipse ? '0' : '1';
    }
    if (bgEclipse) bgEclipse.style.opacity = riverEclipse ? '1' : '0';
    if (overlay) overlay.style.background = isEclipse ? 'rgba(185, 28, 28, 0.12)' : 'transparent';
    if (lakeArea) {
      lakeArea.style.background = isEclipse
        ? 'linear-gradient(to bottom, #2a0303, #450a0a 40%, #150202)'
        : (layer.gradient || 'linear-gradient(to bottom, #7dd3fc, #38bdf8 35%, #0284c7 65%, #0369a1)');
    }

    this.waterRenderer?.setWorldMode(Boolean(layer.scenery), layer.scenery, this.getSwimmingFishIcons(), layer.id);
    this.waterRenderer?.setFishStyle(layer.fishStyle);
  }

  // Peixes comuns e incomuns da camada que nadam de enfeite no cenário (até 4).
  getSwimmingFishIcons() {
    const icons = this.getLayerFish()
      .filter(f => f.rarity === 'COMUM' || f.rarity === 'INCOMUM')
      .map(f => f.icon);
    return [...new Set(icons)].slice(0, 4);
  }
}
