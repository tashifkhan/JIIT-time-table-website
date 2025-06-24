const CACHE_NAME = 'jiit-timetable-cache-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png',
  '/_creator.py',
  '/src/data/timetable-mapping.json',
  '/src/data/128-mapping.json',
  '/src/data/calendar.json',
];

// Pyodide CDN files to cache (adjust version if needed)
const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/';
const PYODIDE_FILES = [
  'pyodide.js',
  'pyodide.asm.wasm',
  'pyodide.asm.data',
  'pyodide_py.tar',
  'repodata.json',
  'packages.json',
  // Add more if needed
].map(f => PYODIDE_CDN + f);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([...APP_SHELL, ...PYODIDE_FILES]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Try cache first for app shell and pyodide files
  if (
    APP_SHELL.includes(url.pathname) ||
    (url.origin + '/' === PYODIDE_CDN && PYODIDE_FILES.includes(url.href))
  ) {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request).then(fetchRes => {
          // Cache new files
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        })
      )
    );
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
}); 