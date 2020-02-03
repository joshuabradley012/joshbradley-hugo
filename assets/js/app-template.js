let navToggle = document.getElementById('nav-toggle');
navToggle.addEventListener('click', function() {
  document.body.classList.toggle('nav-open');
});

{{ if eq $.Hugo.Environment "production" }}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.min.js')
  .then((reg) => {

  }).catch((error) => {
    console.log('Service worker registration failed with ' + error);
  });
}
{{ end }}
