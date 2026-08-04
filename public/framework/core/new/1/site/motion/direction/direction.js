/* Which way you moved through the tree, written where CSS can read it.
 *
 * Router.activate() already computes `from`, `to` and `shared` — it needs them to
 * decide which pages to touch — and then drops all three on the floor. This patch
 * computes them a SECOND time to recover one word.
 *
 * That duplication is the whole cost argument. An ext can have directional motion
 * today with no framework change; it just re-derives a diff that was already
 * derived one stack frame down. One line inside activate() removes the second
 * derivation. See the page for the exact proposed diff.
 */
const originals = new WeakMap();

export function install(router, $pages){
	if (installed(router)) return false;

	originals.set(router, router.activate);

	router.activate = function(page){
		const from = this.chain(), to = page.chain();

		$pages.attr("data-direction", direction(from, to, this.shared_depth(from, to)));

		return originals.get(router).call(this, page);
	};

	return true;
}

export function remove(router, $pages){
	if (!installed(router)) return false;

	router.activate = originals.get(router);
	originals.delete(router);
	$pages.el.removeAttribute("data-direction");

	return true;
}

export function installed(router){ return originals.has(router); }

/* Three words and a fourth for the cold case. Subtraction, not bookkeeping:
 * nothing is remembered between navigations, so nothing can go stale.
 *
 *   from.length === shared   I only added segments      -> deeper
 *   to.length   === shared   I only removed segments    -> back
 *   both differ              I swapped a branch         -> across
 *   from is empty            first paint                -> cold, don't move
 */
export function direction(from, to, shared){
	if (!from.length) return "cold";
	if (from.length === shared) return "deeper";
	if (to.length === shared) return "back";
	return "across";
}
