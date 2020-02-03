"use strict";

const cacheName = 'v4';

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
  // Prioritize caching critical resources
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.addAll(pagesToCache);
      return cache.addAll(coreAssets);
    })
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      })
    ))
  );
});

self.addEventListener('fetch', (event) => {
  const normalizedUrl = new URL(event.request.url);
  normalizedUrl.search = '';
  // Network then cache for html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(normalizedUrl).catch(function() {
        return caches.match(normalizedUrl);
      })
    );
  // Cache then update for assets "stale-while-revalidate"
  } else if (normalizedUrl.origin === location.origin) {
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
  }
});
