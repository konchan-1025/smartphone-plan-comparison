const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
    "index.html",
    "style.css",
    "script.js",
    "manifest.json",
    "icon.png"
];

// インストール時にキャッシュ
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// ネットワークが使えないときはキャッシュを返す
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// 更新時にキャッシュをクリア
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME).map(cache => caches.delete(cache))
            );
        })
    );
});