// Service Worker - SHFMU "Emin Duraku" (aplikacioni i instalueshëm)
// • index.html merret GJITHMONË fillimisht nga interneti (që përditësimet në GitHub të
//   dalin menjëherë); kopja e ruajtur përdoret vetëm kur s'ka internet.
// • Firebase dhe shërbimet e jashtme NUK kalojnë këtu - sinkronizimi punon si më parë.
var CACHE = 'emin-duraku-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(FILES); }).then(function() { return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e) {
    var req = e.request;
    if (req.method !== 'GET') return;
    var url = new URL(req.url);
    if (url.origin !== self.location.origin) return; // Firebase, fontet etj. - pa ndërhyrje
    var isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
    if (isPage) {
        e.respondWith(fetch(req).then(function(res) {
            var copy = res.clone();
            caches.open(CACHE).then(function(c) { c.put('./index.html', copy); });
            return res;
        }).catch(function() {
            return caches.match('./index.html').then(function(r) { return r || caches.match('./'); });
        }));
        return;
    }
    e.respondWith(caches.match(req).then(function(r) { return r || fetch(req); }));
});
