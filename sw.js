const staticCache = 'currency-converter-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/idb.js',
  '/js/requests.js',
  '/js/app.js'
];

const app_only_cache = [staticCache];

self.oninstall = event => {
  self.skipWaiting();

  event.waitUntil(precache());
};

const precache = () => {
  return caches.open(staticCache).then(cache => {
    return cache.addAll(APP_SHELL);
  });
};

self.onactivate = e => {
  self.clients && clients.claim ? clients.claim() : null;

  e.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (app_only_cache.indexOf(cacheName) === -1)
            return caches.delete(cacheName);
        })
      )
    )
  );
};
