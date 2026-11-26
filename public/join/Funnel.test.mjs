// node, no DOM: stubs localStorage/sessionStorage and navigator/crypto the way they exist in a browser.
import { test } from "../framework/core/Test/Test.js";
import { Funnel } from "./Funnel.js";

function store(){
	const m = new Map();
	return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

test("Funnel keeps a stable 16-hex visitor id, reads utm_* from the URL, and logs instead of sending in mock mode", t => {
	globalThis.localStorage = store();
	globalThis.sessionStorage = store();
	globalThis.crypto.getRandomValues = a => { for (let i = 0; i < a.length; i++) a[i] = i; return a; };
	Object.defineProperty(globalThis, "navigator", { value: { sendBeacon: () => true }, configurable: true });

	const sent = [];
	const log = console.log; console.log = (...a) => sent.push(a);

	const f1 = new Funnel({ mock: true }, { ios: true, app: "" }, new URLSearchParams("utm_source=youtube&utm_campaign=t1"));
	t.eq(f1.os, "ios", "os read from the InAppBrowser-shaped env");
	t.eq(f1.utm.src, "youtube", "utm_source read from the URL");
	const v1 = f1.visitor;
	t.ok(/^[0-9a-f]{16}$/.test(v1), "visitor id is 16 hex chars");
	t.eq(f1.visitor, v1, "the same id comes back on a second read");

	f1.send("tap_allow");
	t.eq(sent.length, 1, "mock mode logs instead of calling the API");
	t.eq(sent[0][1], "tap_allow", "the logged event name is the one sent");

	// a second instance with no utm_* in the URL still finds the ones sessionStorage kept
	const f2 = new Funnel({ mock: true }, {}, new URLSearchParams(""));
	t.eq(f2.utm.camp, "t1", "utm_campaign survived in sessionStorage across a reload");
	t.eq(f2.visitor, v1, "the visitor id survives across instances (it is in localStorage)");

	let beaconed = null;
	navigator.sendBeacon = (url, blob) => { beaconed = url; return true; };
	const f3 = new Funnel({ mock: false }, {}, new URLSearchParams(""));
	f3.send("view");
	t.eq(beaconed, "/api/join/event", "a real backend sends a beacon to the event route");

	Funnel.reset();
	t.eq(localStorage.getItem(Funnel.VKEY), null, "reset drops the visitor id");
	t.eq(sessionStorage.getItem(Funnel.UKEY), null, "reset drops the remembered utm_*");

	console.log = log;
});
