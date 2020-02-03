let pagesToCache = [
  './index.html',
  './style.css',
  './app.min.js',
  './images/logo.svg',
  './fonts/icon-outline.woff2',
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
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(pagesToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.indexOf('http') === 0) {
    event.respondWith(caches.match(event.request).then(function(response) {
      if (response !== undefined) {
        return response;
      } else {
        return fetch(event.request).then(function (response) {
          let responseClone = response.clone();

          caches.open('v1').then(function (cache) {
            cache.put(event.request, responseClone);
          });
          return response;
        }).catch(function () {
          return caches.match('/index.html');
        });
      }
    }));
  }
});
