const audioEndpoint = new URL(location).searchParams.get('audioEndpoint');
const passedHeaders = JSON.parse(new URL(location).searchParams.get('headers'));

const latest = {
  cache: 'webviewer-audio-cache/v1',
};

// Immediately apply any updates to service worker if needed
self.addEventListener('install', (event) => {
  event.waitUntil(
    self.skipWaiting()
  );
});

// We want the service worker to work immediately and not on next page load
self.addEventListener('activate', (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          if (cacheName === latest.cache) {
            return false;
          }

          return true;
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only inject custom headers if audio endpoint matches audio file passed into webviewer
  if (event.request.url.includes(audioEndpoint)) {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (event.request.headers.get('range') && isSafari) {
      event.respondWith(cacheAndFetchRangeBasedRequest(event.request));
    } else {
      event.respondWith(customFetch(event.request));
    }
  }
});

// We need to handle byte range requests for audio in Safari a certain way or else audio files won't load
// See: https://philna.sh/blog/2018/10/23/service-workers-beware-safaris-range-request/
function cacheAndFetchRangeBasedRequest(request) {
  const headers = new Headers();

  Object.keys(passedHeaders).forEach((key) => {
    headers.append(key, passedHeaders[key]);
  });

  const newRequest = new Request(request, {
    withCredentials: true,
    mode: 'cors',
    headers,
  });

  return caches
    .open(latest.cache)
    .then(function(cache) {
      return cache.match(request.url);
    })
    .then(function(res) {
      if (!res) {
        return fetch(newRequest)
          .then((res) => {
            const clonedRes = res.clone();
            return caches
              .open(latest.cache)
              .then((cache) => cache.put(newRequest, clonedRes))
              .then(() => res);
          })
          .then((res) => {
            return res.arrayBuffer();
          });
      }
      return res.arrayBuffer();
    })
    .then(function(arrayBuffer) {
      const bytes = /^bytes\=(\d+)\-(\d+)?$/g.exec(
        request.headers.get('range')
      );
      if (bytes) {
        const start = Number(bytes[1]);
        const end = Number(bytes[2]) || arrayBuffer.byteLength - 1;
        return new Response(arrayBuffer.slice(start, end + 1), {
          status: 206,
          statusText: 'Partial Content',
          headers: [
            ['Content-Range', `bytes ${start}-${end}/${arrayBuffer.byteLength}`]
          ]
        });
      }
      return new Response(null, {
        status: 416,
        statusText: 'Range Not Satisfiable',
        headers: [['Content-Range', `*/${arrayBuffer.byteLength}`]]
      });
    });
}

function customFetch(request) {
  const headers = new Headers();

  Object.keys(passedHeaders).forEach((key) => {
    headers.append(key, passedHeaders[key]);
  });

  const newRequest = new Request(request, {
    withCredentials: true,
    mode: 'cors',
    headers,
  });


  return fetch(newRequest);
}