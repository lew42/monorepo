import { div, p, is } from "/app.js";

/**
 * Cross-page imports — borrowing any `page.js` from anywhere.
 *
 * Three calls, and between them they are the whole answer the gallery demonstrates:
 * `load()` fetches a page, `wall()` shows a row of them as cards you can re-address,
 * `body()` draws one page's content inside another. The measured findings are in
 * [core/Page/doc/previews.md](/framework/core/Page/doc/previews/).
 */

/**
 * One foreign page.
 *
 * ⚠ The module cache makes this the SAME object the Router uses when someone walks to
 *   that url — never a copy. So anything you do to it, you do to the real page: read
 *   it, never re-parent it. `add()` rewrites its `url` and its whole subtree's.
 */
export const load = path => import(path + "page.js").then(m => m.default ?? null).catch(() => null);

export const all = paths => Promise.all(paths.map(load));

/**
 * A wall of foreign cards, filled after the import.
 *
 * `address(page)` says where each card points: leave it out and every card goes to the
 * page's real home (which is the Router's answer, and it leaves your gallery). Return
 * a url of your own and the card is nav for YOUR arrangement. Return `undefined` and
 * the card has no `href` at all, so nothing navigates.
 *
 * `plain` draws every card with core's own `preview_card()` instead of the page's
 * `preview()` — a title and a description, whatever the page would rather show.
 *
 * ⚠ The box is built SYNCHRONOUSLY and filled in a callback — there is no DOM after an
 *   await, and `content()` has already returned by the time the imports land.
 */
export function wall(paths, { address, plain } = {}){
	const $wall = div.c("page-previews");

	all(paths).then(pages => $wall.empty(() => pages.forEach((page, i) => {
		if (!page) return missing(paths[i]);

		const nav = page.nav();
		const addressed = address ? { ...nav, url: address(page) } : nav;

		// A page may override preview() with a live render that wants a parent or an
		// app it does not have out here. The plain card is always drawable.
		if (plain) return page.preview_card(addressed);

		try { page.preview(addressed); }
		catch { page.preview_card(addressed); }
	})));

	return $wall;
}

/**
 * The foreign page's own body, drawn HERE.
 *
 * Its `content()` is called with the foreign page as `this` — the same move ext/catalog
 * makes when it turns a page's content into a child — so `this.children`, `this.parent`
 * and `this.previews()` inside it still mean what its author typed.
 *
 * ⚠ Never `render()`: that caches `page.view`, and the original page would then find its
 *   own body parented inside yours the next time someone navigated to it.
 */
export function body(path){
	const $box = div.c("gal-borrowed");

	load(path).then(page => $box.empty(() => {
		if (!page) return p.c("muted", path + " did not load.");
		return is.fn(page.content) ? page.content.call(page) : page.content;
	}));

	return $box;
}

// A path that did not resolve still gets a card, so a typo in a list is visible.
const missing = path => div.c("page-preview", () => {
	p.c("page-preview-title", path);
	p.c("page-preview-desc muted", "No page.js at this path.");
});
