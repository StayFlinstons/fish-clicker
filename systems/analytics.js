// Estatísticas anônimas de uso (GoatCounter): quantas pessoas abrem o jogo e até onde chegam.
// Sem cookies e sem dados do save: só o caminho/nome do evento, título e tamanho da tela.
// Usa o pixel /count do GoatCounter (nenhum script externo). Offline o envio falha em silêncio.
// Painel: https://<GOATCOUNTER_CODE>.goatcounter.com
import { GAME_VERSION } from '../core/constants.js';

// Código do site criado em goatcounter.com. Vazio = estatísticas desligadas.
export const GOATCOUNTER_CODE = '';

export class AnalyticsMethods {
  analyticsEnabled() {
    if (!GOATCOUNTER_CODE) return false;
    // Não conta quem roda o jogo localmente (desenvolvimento)
    const host = location.hostname;
    if (location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1') return false;
    try {
      if (localStorage.getItem('fishclicker_sem_estatisticas')) return false;
    } catch (e) { /* segue */ }
    return true;
  }

  sendAnalyticsHit(path, isEvent, title) {
    if (!this.analyticsEnabled()) return;
    const params = new URLSearchParams({
      p: path,
      t: title || `Fish Clicker v${GAME_VERSION}`,
      s: `${screen.width},${screen.height},${window.devicePixelRatio || 1}`,
      rnd: Math.random().toString(36).slice(2)
    });
    if (isEvent) params.set('e', 'true');
    else if (document.referrer) params.set('r', document.referrer);
    const img = new Image();
    img.src = `https://${GOATCOUNTER_CODE}.goatcounter.com/count?${params}`;
  }

  // Chamado no init(): conta a visita (separando app instalado de navegador) e o jogador novo
  initAnalytics() {
    if (!Array.isArray(this.analyticsSent)) this.analyticsSent = [];
    const installed = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
    this.sendAnalyticsHit(installed ? '/app' : '/', false);
    if (!this.totalCatches && !this.playTimeSeconds) this.trackAnalyticsOnce('novo-jogador');
  }

  // Marco de progresso contado uma vez por save (ex.: 'mundo-2')
  trackAnalyticsOnce(name) {
    if (!this.analyticsEnabled()) return;
    if (!Array.isArray(this.analyticsSent)) this.analyticsSent = [];
    if (this.analyticsSent.includes(name)) return;
    this.analyticsSent.push(name);
    this.sendAnalyticsHit(name, true, name);
  }
}
