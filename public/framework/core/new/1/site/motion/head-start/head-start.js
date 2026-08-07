/* The click is the start of the transition. The load is not.
 *
 * Router.load() awaits load_segments() — a dynamic import over the network on a
 * cold child — and only then calls activate(). For the whole of that await NOTHING
 * ON SCREEN CHANGES. The reader clicked, and the app's answer is stillness, for a
 * duration nobody controls.
 *
 * The awaited walk is exactly where a transition should already be running. One
 * class, added before the await and removed after it, hands the outgoing page the
 * length of the import to leave in.
 *
 * The property that makes it worth doing: when the walk resolves in microtasks —
 * a page already imported, which is most navigations — the class is added and
 * removed inside one task and the browser never paints it. It costs nothing
 * exactly when there is nothing to hide.
 *
 * `latency` is a function rather than a number so the page can turn a simulated
 * cold import on and off. localhost has no latency to demonstrate with, and
 * pretending otherwise would make the demo a lie.
 */
const originals = new WeakMap();

export function install(router, $pages, latency = () => 0){
	if (installed(router)) return false;

	originals.set(router, router.load);

	router.load = async function(url){
		$pages.ac("navigating");

		try {
			if (latency()) await new Promise(done => setTimeout(done, latency()));
			return await originals.get(router).call(this, url);
		}
		finally { $pages.rc("navigating"); }
	};

	return true;
}

export function remove(router, $pages){
	if (!installed(router)) return false;

	router.load = originals.get(router);
	originals.delete(router);
	$pages.rc("navigating");

	return true;
}

export function installed(router){ return originals.has(router); }
