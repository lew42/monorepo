// Service worker (scope /join/): shows a push payload { title, body, url } and opens url on tap. It caches nothing, so /api/ is never cached.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
	let data = {};
	try { data = e.data ? e.data.json() : {}; } catch { data = { body: e.data?.text() }; }
	e.waitUntil(self.registration.showNotification(data.title || "lew42", {
		body: data.body || "",
		icon: "/app/icons/icon-192.png",
		badge: "/app/icons/icon-192.png",
		data: { url: data.url || "/join/" },
	}));
});

self.addEventListener("notificationclick", e => {
	e.notification.close();
	const url = new URL(e.notification.data?.url || "/join/", self.location.origin).href;
	e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
		const open = list.find(c => c.url.startsWith(self.location.origin + "/join/"));
		return open ? open.focus().then(c => c.navigate?.(url) ?? c) : clients.openWindow(url);
	}));
});
