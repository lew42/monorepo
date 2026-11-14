// Service worker: cache static files as they are used, never /api, and answer any navigation from the cached shell when offline.
const CACHE = "lew42-app-__BUILD__";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
	caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));

self.addEventListener("fetch", e => {
	const req = e.request, url = new URL(req.url);
	if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
	e.respondWith((async () => {
		const cache = await caches.open(CACHE);
		try {
			const res = await fetch(req);
			if (res.ok) cache.put(req.mode === "navigate" ? "/index.html" : req, res.clone());
			return res;
		} catch (err){
			return (await cache.match(req.mode === "navigate" ? "/index.html" : req)) || Response.error();
		}
	})());
});

self.addEventListener("notificationclick", e => { e.notification.close(); e.waitUntil(clients.openWindow("/")); });
