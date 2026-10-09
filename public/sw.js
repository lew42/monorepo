// The notification lab's service worker. Thin on purpose: no caching, no fetch interception.
// Everything it does is tell the page what happened (see framework/lab/WorkerHost).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

const windows = () => self.clients.matchAll({ type: "window", includeUncontrolled: true });
const tell = async msg => (await windows()).forEach(c => c.postMessage(msg));

// A click: focus an open tab and tell it, or open a new one when no tab exists.
// A new tab can't be told (it isn't loaded yet), so the click rides in the URL.
async function clicked(e){
	const { tag, data } = e.notification, action = e.action || "";
	const all = await windows();
	const open = all.find(c => c.visibilityState === "visible") || all[0];
	const msg = { type: "click", tag, action, data, tabs: all.length, focused: !!open?.focused, visibility: open?.visibilityState || "none" };
	if (action && data?.close !== false && !data?.keep) e.notification.close();
	if (open){
		await open.focus?.();
		open.postMessage(msg);
	} else {
		const url = new URL(data?.url || "/framework/lab/notifications/", self.location.origin);
		url.searchParams.set("clicked", tag); url.searchParams.set("action", action);
		await self.clients.openWindow(url.href);
	}
}
self.addEventListener("notificationclick", e => e.waitUntil(clicked(e)));
self.addEventListener("notificationclose", e => e.waitUntil(tell({ type: "close", tag: e.notification.tag, data: e.notification.data })));

// Push (stretch): the payload is JSON { title, ...showNotification options }.
self.addEventListener("push", e => {
	const p = e.data ? e.data.json() : { title: "Push (empty)" };
	e.waitUntil(self.registration.showNotification(p.title || "Push", { tag: "push", ...p }).then(() => tell({ type: "push", tag: p.tag || "push", title: p.title })));
});

// The page can ask the worker to say hello: proves page -> worker -> page.
self.addEventListener("message", e => { if (e.data?.type === "ping") e.source?.postMessage({ type: "pong", at: Date.now() }); });
