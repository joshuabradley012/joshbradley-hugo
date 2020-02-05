"use strict";

const cacheName = 'v6';

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

let updateHomepageCache = true;

self.addEventListener('install', (event) => {
  // Assets as dependency for install, the rest as non-blocking
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      updateHomepageCache = false;
      cache.addAll(pagesToCache);
      return cache.addAll(coreAssets);
    })
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then(function(keys) {
      Promise.all(
        keys.map(function(key) {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      )
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'updateHomepageCache') {
    updateHomepageCache = true;
  }
});

self.addEventListener('fetch', (event) => {
  const normalizedUrl = new URL(event.request.url);
  normalizedUrl.search = '';

  const isNavgation = event.request.mode === 'navigate';
  const isFromOrigin = normalizedUrl.origin === location.origin;
  const isHomepage = normalizedUrl.href === location.origin + '/';

  // Network then update for homepage if it needs to be updated
  if (isHomepage && isNavgation && updateHomepageCache) {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return fetch(normalizedUrl).then(function(networkResponse) {
          cache.put(normalizedUrl, networkResponse.clone());
          updateHomepageCache = false;
          return networkResponse;
        }).catch(function() {
          return cache.match(normalizedUrl);
        });
      })
    );
  // Cache then update for pages "stale-while-revalidate"
  } else if (isFromOrigin && isNavgation) {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return cache.match(normalizedUrl).then(function(response) {
          let fetchPromise = fetch(normalizedUrl).then(function(networkResponse) {
            cache.put(normalizedUrl, networkResponse.clone());
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
  // Cache first, falling back to network for static assets, no updating
  } else if (isFromOrigin) {
    event.respondWith(
      caches.match(normalizedUrl).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});

