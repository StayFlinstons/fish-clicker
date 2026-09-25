const CACHE_NAME = 'fish-clicker-v55';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './tailwind.min.js',
  './game.js',
  './core/constants.js',
  './core/economy.js',
  './core/mixins.js',
  './core/save.js',
  './dev/devConsole.js',
  './dev/testCommands.js',
  './systems/achievements.js',
  './systems/analytics.js',
  './systems/automation.js',
  './systems/events.js',
  './systems/fishEyes.js',
  './systems/fishing.js',
  './systems/magnet.js',
  './systems/offline.js',
  './systems/shop.js',
  './systems/depth.js',
  './systems/tools.js',
  './ui/album.js',
  './ui/celebrations.js',
  './ui/effects.js',
  './ui/lakeBackground.js',
  './ui/pixelEmoji.js',
  './ui/mobileNav.js',
  './ui/patchNotes.js',
  './ui/render.js',
  './ui/settings.js',
  './ui/sprites.js',
  './ui/summary.js',
  './itemsData.js',
  './fishData.js',
  './depthData.js',
  './achievementsData.js',
  './magnetData.js',
  './pixelArt.js',
  './sound.js',
  './manifest.json',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/btn_pescar.png',
  './icons/fishing_hook.png',
  './zonas/zona_1.png',
  './zonas/zona_2.png',
  './zonas/zona_3.png',
  './zonas/zona_4.png',
  './zonas/zona_5.png',
  './zonas/zona_6.png',
  './fundo-lago-eclipse.png',
  './icons/baits/hook_minhoca.png',
  './icons/baits/hook_camarao.png',
  './icons/baits/hook_isca_brilhante.png',
  './icons/baits/hook_queijo_mistico.png',
  './icons/baits/hook_ouro_liquido.png',
  './icons/baits/hook_essencia_travessia.png',
  './icons/baits/anzol_minhoca.png',
  './icons/baits/anzol_camarao.png',
  './icons/baits/anzol_glow_neon.png',
  './icons/baits/anzol_massa_mistica.png',
  './icons/baits/anzol_gota_eter_divino.png',
  './icons/baits/anzol_vortice_dimensional.png'
];

// Instalação: pré-cacheia todos os assets do jogo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Ativação: remove caches de versões antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: estratégia Network First com fallback transparente para o Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') return;
  // Estatísticas (GoatCounter) vão direto para a rede, sem cache; offline só falham em silêncio
  if (new URL(event.request.url).hostname.endsWith('.goatcounter.com')) return;

  // Revalida com o servidor em vez de aceitar o cache HTTP do navegador (o GitHub Pages
  // manda guardar por 10 min). Com o jogo dividido em módulos, um game.js novo com um
  // módulo antigo do cache quebraria o carregamento. Sem mudanças, o servidor responde 304.
  // Requisições de navegação não aceitam RequestInit, então seguem como estão.
  const request = event.request.mode === 'navigate'
    ? event.request
    : new Request(event.request, { cache: 'no-cache' });

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Atualiza o cache dinamicamente para requisições bem-sucedidas do mesmo domínio
        if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Quando offline, busca no cache local. ignoreSearch: o pré-cache guarda os arquivos sem
        // ?v=, mas o index.html pede os módulos com ?v=ASSET_VERSION
        return caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback para index.html se for navegação
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
