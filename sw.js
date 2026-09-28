// Service Worker - SHFMU "Emin Duraku" (aplikacioni i instalueshëm) - v2 (27.9.2026)
// ⚡ HAPJE E SHPEJTË: faqja hapet menjëherë nga kopja e ruajtur në pajisje, dhe NË SFOND
//   shkarkohet versioni më i ri nga GitHub - ai përdoret herën tjetër që hapet aplikacioni.
//   (Ctrl+F5 / rifreskimi i fortë e merr gjithmonë versionin më të ri menjëherë.)
// • Firebase dhe shërbimet e jashtme NUK kalojnë këtu - të dhënat vijnë gjithmonë të freskëta.
var CACHE = 'emin-duraku-v2';
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
    if (url.origin !== self.location.origin) return;
    var isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
    if (isPage) {
        var network = fetch(req, { cache: 'no-cache' }).then(function(res) {
            if (res && res.ok) {
                var copy = res.clone();
                caches.open(CACHE).then(function(c) { c.put('./index.html', copy); });
            }
            return res;
        });
        e.respondWith(caches.match('./index.html').then(function(cached) {
            if (cached) { e.waitUntil(network.catch(function() {})); return cached; }
            return network.catch(function() { return caches.match('./'); });
        }));
        return;
    }
    e.respondWith(caches.match(req).then(function(r) { return r || fetch(req); }));
});
