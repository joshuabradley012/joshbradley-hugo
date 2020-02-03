"use strict";

let navToggle = document.getElementById('nav-toggle');
navToggle.addEventListener('click', function() {
  document.body.classList.toggle('nav-open');
});


if ('serviceWorker' in navigator) {
  // Register service worker after load to prioritize content
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.min.js', {updateViaCache: 'none'});
  });
  // navigator.serviceWorker.getRegistrations().then(function(registrations){for(let registration of registrations){registration.unregister();}});
}

