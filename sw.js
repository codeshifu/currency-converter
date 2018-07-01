const staticCache = 'currency-converter-v1';
const freeCurrConverterAPI = 'free-currency-converter-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/idb.js',
  '/js/requests.js',
  '/js/app.js'
];

const app_only_cache = [staticCache, freeCurrConverterAPI];

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

self.onfetch = e => {
  const requestURL = new URL(e.request.url);

  if (requestURL.hostname === location.hostname) {
    e.respondWith(cacheOrNetwork(requestURL));
  }
};

const cacheOrNetwork = request => {
  return caches.match(request).then(response => response || fetch(request));
};
