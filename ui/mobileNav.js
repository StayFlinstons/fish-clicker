// Layout mobile (abaixo de 1024px): barra de abas Loja | Pescar | Balde e ouro no header.
// Métodos do FishingGame: aplicados via applyMixins() em game.js (o `this` é o jogo).
// O CSS em style.css mostra só o painel [data-mpanel] da aba ativa; no desktop nada disso aparece.
import { sound } from '../sound.js';

export class MobileNavMethods {
  setMobileTab(tab, silent = false) {
    if (!['loja', 'pescar', 'balde'].includes(tab)) return;
    this.mobileTab = tab;
    document.body.dataset.mobileTab = tab;
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.mtab === tab);
    });
    if (!silent) sound.playClick?.();
    // O lago e a linha de pesca se posicionam pelo tamanho do painel, que muda ao reaparecer
    if (tab === 'pescar') window.dispatchEvent(new Event('resize'));
    this.updateMobileNav();
  }

  // Ouro no header e contador do balde na aba (chamado junto com renderHeader/renderStats)
  updateMobileNav() {
    const gold = document.getElementById('header-gold');
    if (gold) gold.textContent = this.gold.toLocaleString('pt-BR');
    const bucket = document.getElementById('mobile-nav-bucket');
    if (bucket) {
      const max = this.getMaxInventory();
      bucket.textContent = `${this.inventory.length}/${max}`;
      bucket.closest('.mobile-tab-btn')?.classList.toggle('is-full', this.inventory.length >= max);
    }
  }
}
