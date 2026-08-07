/* A navigation guard built ENTIRELY from outside the framework.
 *
 * Router.listen() does `document.addEventListener("click", …)` — BUBBLE phase.
 * This one is CAPTURE phase on the same node, so it runs first. And
 * Router.link_clicked()'s very first rule is:
 *
 *     if (e.defaultPrevented || e.button) return null;
 *
 * So preventDefault() here is not a trick played on the Router — it is the
 * Router's own documented way of being told "this click is not yours". The
 * ordering is measured on /forms/guard/, not assumed.
 *
 * It borrows `link_clicked` rather than re-deriving it. That predicate holds
 * five rules (modifier keys, target, download, cross-origin, #hash, file
 * extension); a guard with its own copy would refuse ctrl-click-to-new-tab,
 * which loses nothing and helps nobody. One definition of "a link I would
 * handle", shared.
 *
 * CONTAINMENT — the whole reason this is allowed to exist:
 *   · importing this file installs nothing; only calling it does
 *   · one listener, and the call returns the function that removes it
 *   · the caller is a page, and pages have deactivate() to release it
 *   · it can only ever call preventDefault() — it never navigates, never
 *     rewrites history, never touches another page
 */
export function ask_before_leaving(router, ask){
	const listener = e => {
		const link = router.link_clicked(e);   // the Router's OWN five rules
		if (!link || ask(link.pathname)) return;

		e.preventDefault();                    // …which link_clicked() checks first
	};

	document.addEventListener("click", listener, true);
	return () => document.removeEventListener("click", listener, true);
}

/* The same shape for the Back button, and it is deliberately uglier, because
 * the situation is uglier — three ways over.
 *
 * 1. popstate fires AFTER the browser has already moved, so there is nothing to
 *    prevent. The only undo is to push the old url back on.
 * 2. Router.listen() registered ITS popstate listener first, and same-target
 *    listeners run in registration order — so by the time this one is called,
 *    router.load() has already rendered the page we were trying not to go to.
 *    Undoing the url is therefore not enough; the render has to be undone too.
 * 3. `here` has to be captured at INSTALL time. At fire time both location and
 *    router.active have already moved on, so neither can say where we were.
 *
 * Fires ONCE and releases itself. A guard that refuses Back every time is a
 * trap, and a reader must always be able to leave a demo page.
 */
export function ask_before_back(router, ask){
	const here = router.active.url;

	const listener = () => {
		release();
		if (ask(location.pathname)) return;

		history.pushState({}, "", here);   // undo the url…
		router.load(here);                 // …and the render that already happened
	};

	const release = () => window.removeEventListener("popstate", listener);

	window.addEventListener("popstate", listener);
	return release;
}
