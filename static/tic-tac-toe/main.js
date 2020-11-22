import VDOM from './modules/vdom.js';
import App from './modules/app.js';

new VDOM(
  new App(),
  document.getElementById('app')
);

