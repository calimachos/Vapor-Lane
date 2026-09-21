/* Vapor Lane service worker.

   The page is network-first and the icons are cache-first. That split is the
   point: you never have to bump CACHE to see a new build, because index.html
   is re-fetched on every launch and only falls back to the cached copy when
   the phone is offline. Bump CACHE only when you change the icons or this
   file itself.

   Shared-origin note (2026-09-20): every GitHub Pages repo under one account
   is served from the same origin (username.github.io), and Cache Storage
   belongs to the origin, not to the path. This worker therefore only ever
   deletes caches that are its own (see OWN_PREFIXES). It used to delete every
   cache that was not the current one, which would also have wiped the offline
   copy of any other game hosted under the same account (Neon Paint) each
   time this file changed. CACHE went v1 -> v2 with that change. */

const CACHE = 'vapor-lane-v2';

/* Every cache name this game has ever used starts with one of these:
   'vapor-lane-' now, 'neon-rush-' before the rename. */
const OWN_PREFIXES = ['vapor-lane-', 'neon-rush-'];

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './icon-180.png',
  './favicon-32.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      /* Individually, so one 404 cannot fail the whole install the way
         cache.addAll() would. */
      .then(function (c) {
        return Promise.all(ASSETS.map(function (u) {
          return c.add(u).catch(function () {});
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      /* Only this game's own old caches, never anything else on the origin
         (see the shared-origin note at the top). If the game is ever renamed
         again, add the old prefix to OWN_PREFIXES or its stale cache will
         live forever. */
      return Promise.all(keys.map(function (k) {
        var mine = OWN_PREFIXES.some(function (p) { return k.indexOf(p) === 0; });
        return (mine && k !== CACHE) ? caches.delete(k) : null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;

  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;   /* leave anything external alone */

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function (r) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put('./index.html', copy); });
        return r;
      }).catch(function () {
        return caches.match('./index.html').then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});
