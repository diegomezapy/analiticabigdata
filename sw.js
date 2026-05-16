const CACHE_NAME = 'analitica-bigdata-v8';

const APP_SHELL = [
  './',
  'index.html',
  'dashboard.html',
  'documentos.html',
  'manifest.json',
  'css/styles.css',
  'css/documentos.css',
  'data/usuarios.json',
  'data/quizzes/quiz_u1.json',
  'data/quizzes/quiz_u2.json',
  'data/quizzes/quiz_u3.json',
  'data/quizzes/quiz_u4.json',
  'data/datasets/clientes_compras.csv',
  'data/datasets/estudiantes_ead.csv',
  'data/datasets/modelos_credito.csv',
  'guia_didactica/index.html',
  'practicas/index.html',
  'laboratorio/index.html',
  'icons/icon.svg',
  'assets/academic/facen-header.png',
  'assets/academic/facen-footer.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('index.html'))
    )
  );
});
