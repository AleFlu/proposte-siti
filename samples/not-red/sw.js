// Generato da strumenti/genera_notred.py: pagine e file per usare il sito senza rete.
const CACHE = "notred-83aac326";
const FILE = [
 "./assets/anteprima.jpg",
 "./assets/favicon.svg",
 "./assets/font/atkinson-hyperlegible-mono-normal-400-700-latin-ext.woff2",
 "./assets/font/atkinson-hyperlegible-mono-normal-400-700-latin.woff2",
 "./assets/font/atkinson-hyperlegible-next-normal-400-800-latin-ext.woff2",
 "./assets/font/atkinson-hyperlegible-next-normal-400-800-latin.woff2",
 "./assets/font.css?v=6c7108fe",
 "./assets/icona-180.png",
 "./assets/icona-192.png",
 "./assets/icona-512.png",
 "./assets/icona-adattiva-512.png",
 "./assets/misura.js?v=548fe531",
 "./assets/simulatore.js?v=927b172a",
 "./assets/sito.js?v=89f40a27",
 "./assets/sito.webmanifest",
 "./assets/stile.css?v=29ebab36",
 "./assets/test.js?v=d9e1e95a",
 "./de/",
 "./de/metodo.html",
 "./de/privacy.html",
 "./de/simulatore.html",
 "./en/",
 "./en/metodo.html",
 "./en/privacy.html",
 "./en/simulatore.html",
 "./es/",
 "./es/metodo.html",
 "./es/privacy.html",
 "./es/simulatore.html",
 "./fr/",
 "./fr/metodo.html",
 "./fr/privacy.html",
 "./fr/simulatore.html",
 "./",
 "./metodo.html",
 "./privacy.html",
 "./pt/",
 "./pt/metodo.html",
 "./pt/privacy.html",
 "./pt/simulatore.html",
 "./simulatore.html"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith("notred-") && n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
// pagine: prima la rete (testi sempre aggiornati), la copia solo senza rete; file con impronta: prima la copia
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => {
      const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
