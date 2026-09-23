const CACHE_NAME = 'fish-clicker-v30';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './tailwind.min.js',
  './game.js',
  './itemsData.js',
  './fishData.js',
  './achievementsData.js',
  './magnetData.js',
  './world2Data.js',
  './pixelArt.js',
  './sound.js',
  './manifest.json',
  './favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/btn_pescar.png',
  './icons/fishing_hook.png',
  './icons/baits/hook_minhoca.png',
  './icons/baits/hook_camarao.png',
  './icons/baits/hook_isca_brilhante.png',
  './icons/baits/hook_queijo_mistico.png',
  './icons/baits/hook_ouro_liquido.png',
  './icons/baits/hook_essencia_travessia.png',
  './icons/baits/hook_isca_kraken_ancestral.png'
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

  event.respondWith(
    fetch(event.request)
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
        // Quando offline, busca no cache local
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Fallback para index.html se for navegação
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
