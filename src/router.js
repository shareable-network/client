window.addEventListener('hashchange', onRouteChanged);
onRouteChanged();

async function onRouteChanged() {
  const routerView = document.querySelector('#router-view');
  await loadRoute(routerView);
  window.Alpine?.initTree(routerView);
}

async function loadRoute(routerView) {
  switch(window.location.hash) {
    case '#new':
      await import('./new.js');
      routerView.innerHTML = await fetch('./new.html').then(r => r.text());
      break;
    default:
      await import('./publications.js');
      routerView.innerHTML = await fetch('./publications.html').then(r => r.text());
  }
}
