const staticCache = 'currency-converter-v1';

const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/idb.js',
  '/js/requests.js',
  '/js/app.js'
];

self.oninstall = event => {
  self.skipWaiting();

  event.waitUntil(precache());
};

const precache = () => {
  return caches.open(staticCache).then(cache => {
    return cache.addAll(APP_SHELL);
  });
};
