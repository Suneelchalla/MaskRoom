const V = 'maskroom-v2', CDN = 'maskroom-cdn';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V && k !== CDN).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.open(CDN).then(async c => {
      const hit = await c.match(r);
      if (hit) return hit;
      const res = await fetch(r);
      if (res.ok) c.put(r, res.clone());
      return res;
    }));
  } else if (u.origin === location.origin) {
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match(r, { ignoreSearch: true });
      const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit || c.match('./'));
      return hit || net;
    }));
  }
});
