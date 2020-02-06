"use strict";

var navToggle = document.getElementById('nav-toggle');
navToggle.addEventListener('click', function() {
  document.body.classList.toggle('nav-open');
});

{{ if eq hugo.Environment "production" }}


if (navigator.serviceWorker) {

  const sw = navigator.serviceWorker;
  const channel = new MessageChannel();

  const controlled = sw.controller;
  const homepage = location.href === location.origin + '/';
  const cached = getCookie('cached') === 'true';

  if (controlled && !cached) {

    const resp = new Promise( res => channel.port1.onmessage = res );
    sw.controller.postMessage( 'update-cache', [ channel.port2 ] );
    resp.then(e => {
      if (e.data === 'done') {
        setCookie('cached', 'true', 1);
        if (homepage) {
          updateMain();
        }
      }
    });
  }

  // Register service worker after load to prioritize content
  window.addEventListener('load', function() {
    if (!controlled) {
      sw.register('/service-worker.min.js', {updateViaCache: 'none'})
      .then(function(registation){
        if (!cached) {
          getCookie('cached', 'true', 1);
        }
      });
    }
  });
}

function setCookie(name, value, days) {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 100));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function getCookie() {
  var nameEQ = name + '=';
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function updateMain() {
  var existingMain = document.querySelector('.main');
  fetch(location.href)
  .then(function(response) {
    return response.text();
  }).then(function(text) {
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(text, 'text/html');
      var fetchedMain = doc.querySelector('.main');
      var parent = existingMain.parentNode;
      parent.replaceChild(fetchedMain, existingMain);
    } catch (err) {
      console.error(err);
    }
  });
}

{{ else }}

// Single line so I can copy paste to phone in case of emergency
navigator.serviceWorker.getRegistrations().then(function(registrations){for(let registration of registrations){registration.unregister();}});

{{ end }}
