"use strict";

const cache = 'v7';

const coreAssets = [
  './index.html',
  './style.css',
  './app.min.js',
  './images/logo.svg',
  './fonts/icon-outline.woff2',
];

const pagesToCache = [
  {{ with .Site.Pages }}
    {{ range  (where . "Type" "page") }}
      '{{ .RelPermalink }}',
    {{ end }}
    {{ range (where . "Kind" "taxonomyTerm") }}
      '{{ .RelPermalink }}',
    {{ end }}
    {{ range (where . "Kind" "taxonomy") }}
      '{{ .RelPermalink }}',
    {{ end }}
    {{ range (where . "Type" "post") }}
      '{{ .RelPermalink }}',
    {{ end }}
  {{ end }}
];

let update = true;

self.addEventListener('install', e => {
  // Assets as dependency for install, the rest as non-blocking
  e.waitUntil(
    caches.open(cache)
    .then(cache => {
      update = false;
      cache.addAll(pagesToCache);
      return cache.addAll(coreAssets);
    })
  );
});

self.addEventListener('activate', e => {
  // Delete old caches
  e.waitUntil(
    caches.keys()
    .then(keys => {
      Promise.all(
        keys.map(key => {
          if (key !== cache) {
            return caches.delete(key);
          }
        })
      )
    })
  );
});

self.addEventListener('message', e => {
  if (e.data === 'update-cache' && e.ports) {
    update = true;
    e.ports[0].postMessage('done');
  }
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  url.search = '';

  const navigation = e.request.mode === 'navigate';
  const origin = url.origin === location.origin;
  const homepage = url.href === location.origin + '/';

  if (homepage && navigation && update) {
    e.respondWith(
      networkThenUpdate(url)
    );
  } else if (origin && navigation) {
    e.respondWith(
      cacheThenUpdate(url)
    );
  } else if (origin) {
    e.respondWith(
      cacheWithFallback(url)
    );
  }
});

function networkThenUpdate(url) {
  return caches.open(cache)
  .then(cache => {
    return fetch(url)
    .then(networkResponse => {
      cache.put(url, networkResponse.clone());
      update = false;
      return networkResponse;
    }).catch(() => {
      return cache.match(url);
    });
  });
}

function cacheThenUpdate(url) {
  return caches.open(cache)
  .then(cache => {
    return cache.match(url)
    .then(cacheResponse => {
      let fetchPromise = fetch(url).
      then(networkResponse => {
        cache.put(url, networkResponse.clone());
        return networkResponse;
      });
      return cacheResponse || fetchPromise;
    });
  });
}

function cacheWithFallback(url) {
  return caches.match(url)
  .then(cacheResponse => {
    return cacheResponse || fetch(url);
  })
}