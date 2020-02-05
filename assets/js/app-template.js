"use strict";

function setCookie(name, value, days) {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 100));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function getCookie(name) {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

let navToggle = document.getElementById('nav-toggle');
navToggle.addEventListener('click', function() {
  document.body.classList.toggle('nav-open');
});

{{ if eq hugo.Environment "production" }}

if (navigator.serviceWorker) {

  let isHomepage = location.href === location.origin + '/';
  let homepageCached = getCookie('homecached') === 'true';
  let isControlled = navigator.serviceWorker.controller;

  if (isControlled && !homepageCached) {
    navigator.serviceWorker.controller.postMessage('updateHomepageCache');
    setCookie('homecached', 'true', 1);

    if (isHomepage) {
      location.reload();
    }
  }

  // Register service worker after load to prioritize content
  window.addEventListener('load', function() {
    if (!isControlled) {
      navigator.serviceWorker.register('/service-worker.min.js', {updateViaCache: 'none'})
      .then(function(registation){
        if (!homepageCached) {
          setCookie('homecached', 'true', 1);
        }
      });
    }
  });
}

{{ else }}

// Single line so I can copy paste to phone in case of emergency
navigator.serviceWorker.getRegistrations().then(function(registrations){for(let registration of registrations){registration.unregister();}});

{{ end }}
