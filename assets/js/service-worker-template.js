"use strict";

const cacheName = 'v5';

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

self.addEventListener('install', (event) => {
  // Assets as dependency for install, the rest as non-blocking
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
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

self.addEventListener('fetch', (event) => {
  const normalizedUrl = new URL(event.request.url);
  normalizedUrl.search = '';
  // Network then update for homepage
  if (normalizedUrl.href === location.origin + '/' && event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(cacheName).then(function(cache) {
        return fetch(normalizedUrl).then(function(networkResponse) {
          cache.put(normalizedUrl, networkResponse.clone());
          return networkResponse;
        }).catch(function() {
          return cache.match(normalizedUrl);
        });
      })
    );
  // Cache then update for pages "stale-while-revalidate"
  } else if (normalizedUrl.origin === location.origin && event.request.mode === 'navigate') {
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
  } else if (normalizedUrl.origin === location.origin) {
    event.respondWith(
      caches.match(normalizedUrl).then(function(response) {
        return response || fetch(event.request);
      })
    );
  }
});
