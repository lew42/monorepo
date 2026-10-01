import { servex_url } from "/framework/dev/servex_url.js";

/* SERVEX'S ADDRESS, AND WHETHER IT IS UP — moved here from `ai2/inbox.js` (2026-09-30,
   review #3 of inbox-ext) so the Inbox extension imports nothing from AI 2. `ai2/inbox.js`
   re-exports all three, so nothing that imported them from there had to change. */
/* ⚠ `?servex=` IS READ ONCE, when this module loads, and kept: the first click
   on a card drops the query string, and a test page pointed at a scratch Servex
   would then silently post the next sentence into the REAL one.
 *
 * The bare fallback used to be the hard-coded `http://127.0.0.1:8090` — exactly
 * right on this machine, meaningless on a phone reading the page by its LAN
 * address ("127.0.0.1" then means the phone, not the PC running Servex). Off
 * localhost `servex_url()` (`dev/servex_url.js`) points here instead at
 * `<origin>/servex`, the same-origin proxy `Server/plugins/ServexProxy.js`
 * answers (mobile-nav, 2026-09-29). */
const PINNED_SERVEX = new URLSearchParams(location.search).get("servex");
export const servex_base = () => new URLSearchParams(location.search).get("servex") || PINNED_SERVEX || servex_url();

/* SERVEX IS OPTIONAL. Everything that reads is a static file (below); Servex is
   for writes, live agents and the push. `servex_up()` asks it ONCE — and never
   on a host that is not a dev machine (production is static: no request at
   all). Every Servex call goes through `servex_fetch`, which rejects at once
   when it is down, so a caller's own `.catch` runs and nothing else hits the
   network. Chrome itself prints one line for the one refused probe. */
const dev_host = /^(localhost|127\.|192\.168\.|10\.|.*\.localhost$)/.test(location.hostname);
let up = null;
export const servex_up = () => up ??= ((PINNED_SERVEX || dev_host)
	? fetch(servex_base() + "/log/features?n=1").then(r => r.ok).catch(() => false)
	: Promise.resolve(false));
servex_up.known = false;
servex_up().then(ok => (servex_up.known = ok));
export const servex_fetch = async (url, init) => {
	if (!(await servex_up())) throw new TypeError("Servex is not running");
	return fetch(url, init);
};
