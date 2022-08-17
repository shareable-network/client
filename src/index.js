import Alpine from 'alpinejs';
import hashFormatter from './utils/hashFormatter.js';
import M from 'materialize-css';
import './static/scss/index.scss';
import './router';

window.Alpine = Alpine;
Alpine.deferMutations();
Alpine.store('app', {
  error: null,
  profile: {balance: 0},

  load: async function () {
    M.Sidenav.init(document.querySelectorAll('.sidenav'));
    this.profile = await fetch(`${window.location.origin}/api/profile`).then(r => r.json());
  },

  hashFormatter,
});

Alpine.start();
