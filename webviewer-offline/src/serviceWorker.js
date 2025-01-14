var CACHE_NAME = 'v2';

// This file is cached only because we are using this library in this sample
var localforage = '/scripts/localforage.min.js';

var assets = [
  '/',
  '/style.css',
  '/index.js',
  '/index.html',
  `/scripts/pwacompat.min.js`,
  `/manifest.json`,
  '/images/ic_launcher-48.png',
  '/images/ic_launcher-72.png',
  '/images/ic_launcher-96.png',
  '/images/ic_launcher-144.png',
  '/images/ic_launcher-192.png',
  '/images/ic_launcher-512.png',
  'https://fonts.googleapis.com/css?family=Roboto',
  'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600',
  'https://fonts.gstatic.com/s/roboto/v19/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
  '/public/lib/webviewer.min.js',
];

async function getWorkersList() {
  try {
    const response = await fetch('/service-worker-list.json');
    const jsonData = await response.json();

    return jsonData;
  } catch(err) {
    console.error('Error fetching workers list');
  }
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async function(cache) {
        const { core, ui } = await getWorkersList();
        return cache.addAll([localforage].concat(
          core,
          ui,
          assets,
        ));
      }),
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});
