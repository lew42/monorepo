/* Prefetch on hover — a prototype, opt-in, and entirely outside the framework.
 *
 *     import { prefetch_on_hover } from "/perf/prefetch.js";
 *     prefetch_on_hover(app);
 *
 * One delegated listener on $app. Pointing at an in-app link starts fetching the
 * page module for that url, so the click that follows finds it in the module map
 * instead of on the network.
 *
 * It uses <link rel="modulepreload">, NOT import(). The difference is the whole
 * reason this is safe to propose:
 *
 *   import(url)   fetches, parses AND RUNS the module — so hovering a link
 *                 executes `export default new Page(…)` and every side effect
 *                 in that file, for a page you may never open.
 *   modulepreload fetches and parses into the module map and stops. The later
 *                 import() still runs the module, exactly once, on the click.
 *
 * Both remove the same network wait. Only one of them is free of consequences
 * for a page the user merely pointed at.
 */

const asked = new Set();
const wired = new WeakSet();

export function prefetch_on_hover(app){
	if (wired.has(app)) return app;
	wired.add(app);

	app.$app.el.addEventListener("pointerover", event => {
		const link = event.target.closest?.("a[href]");
		if (link && worth_prefetching(link)) preload(link.pathname);
	});

	return app;
}

/* The same shape as Router.link_clicked's filter, minus the event-specific
 * parts. A first-class version belongs on Router, which already owns this
 * predicate — a second copy here is the prototype's one real flaw, and the
 * report says so.
 */
function worth_prefetching(link){
	return link.origin === location.origin
		&& !link.target
		&& !link.hasAttribute("download")
		&& !/\.\w+$/.test(link.pathname);
}

/* Warm a url — and EVERY ANCESTOR of it, which is the part that is easy to get
 * wrong. load_segments() imports the chain one segment at a time, so a hover
 * that warmed only the leaf would leave every module above it on the network and
 * save almost nothing. /a/b/c/ asks for /a/, /a/b/ and /a/b/c/.
 *
 * They go out in parallel, because here the guess is already made: the user
 * pointed at a url, and every prefix of a url that resolves also resolves.
 */
export function preload(url){
	let path = "/", warmed = 0;

	for (const segment of url.split("/").filter(Boolean)){
		path += segment + "/";
		if (module_link(path + "page.js")) warmed++;
	}

	return warmed;
}

function module_link(module_url){
	if (asked.has(module_url)) return false;
	asked.add(module_url);

	const link = document.createElement("link");
	link.rel = "modulepreload";
	link.href = module_url;
	document.head.appendChild(link);

	return true;
}

export function prefetched(){ return [...asked]; }
