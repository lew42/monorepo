/* An ext-style opt-in patch — on ONE router instance, never the prototype.
 *
 * document.startViewTransition(fn) snapshots the document, runs fn, snapshots
 * again, and animates between the two. It requires fn to mutate the DOM
 * SYNCHRONOUSLY. Router.activate() already does, and says so:
 *
 *     // no awaits past this point, so the group is guaranteed to close
 *
 * That comment is about a console group. It is also the exact precondition this
 * API needs, which is why nothing in Router has to change to get one.
 *
 * wrap() is called by the page's content(); unwrap() by its deactivate(). So the
 * patch exists only while a reader is standing on the page that explains it, and
 * the navigation that carries them away is the last one it touches.
 *
 * The original lives in a WeakMap rather than on the router, so two demo modules
 * that both wrap activate() cannot quietly overwrite each other's saved copy.
 */
const originals = new WeakMap();

export function wrap(router){
	if (wrapped(router) || !document.startViewTransition) return false;

	originals.set(router, router.activate);

	router.activate = function(page){
		return document.startViewTransition(() => originals.get(router).call(this, page));
	};

	return true;
}

export function unwrap(router){
	if (!wrapped(router)) return false;

	router.activate = originals.get(router);
	originals.delete(router);

	return true;
}

export function wrapped(router){ return originals.has(router); }
