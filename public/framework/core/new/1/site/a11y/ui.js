import app, { div, p, span, button, View } from "/app.js";
import { source } from "/framework/util/source/source.js";
import { code } from "../ui.js";

/* Every page in this section shows the code that produced it, and the whole
 * section navigates the way the report asks the site to navigate.
 *
 *   demo(fn)          ext/demo — stringifies the function AND runs it
 *   js(fn, label)     stringifies it and NEVER runs it: a proposed diff
 *   announce(text)    the live region, for what focus cannot say
 *
 * There is no per-page mixin any more. `Router.activate()` now ends with
 * `this.app.navigated?.(page)`, so the one installer below does for nine pages
 * what nine copies of an `activate()` override could not do for any of them —
 * it fires on Back, which enters nothing and which no page hook can reach.
 */

// A proposed diff is a real function object, so the IDE checks it — and nothing
// calls it. `source()` is the same stringifier demo() uses, so the two can't drift.
export function js(fn, label){ return code(source(fn), label); }

/* Focusing an unnamed element makes a screen reader read its entire text, and a
 * page's text is the whole page — measured: "new/1three classesApp boot, the ONE
 * flat container, and nothing els…". So whatever we focus, we name first.
 *
 * Idempotent: View.attr() compares before it writes.
 */
export function name_page(page){
	page.view?.attr("tabindex", "-1").attr("role", "region").attr("aria-label", page.title ?? page.name);
	return page;
}

/* On boot `$app` is still detached — App.inject() has not run — so the first
 * activation is exactly the case where `el.isConnected` is false. That is not a
 * flag in disguise: it is the real precondition, because focus() on a detached
 * element does nothing. It also happens to be the behaviour we want, since
 * moving focus on load would skip the skip link past a user who has not yet
 * pressed a key.
 */
export function focus_page(page){
	if (page.view?.el.isConnected) page.view.el.focus();
	return page;
}

/* What a successful navigation announces: NOTHING. Three channels, and only one
 * of them is an announcement.
 *
 *   document.title    silent. Screen readers do not announce it on a soft
 *                     navigation — that is the whole reason this problem
 *                     exists. It is for the tab, history and bookmarks.
 *   the focus move    THE announcement. Says "<title>, region", and puts the
 *                     user's cursor where the words are.
 *   this live region  silent on success: it would say the same string twice.
 *                     Measured — document.title and the focused region's
 *                     accessible name are character-identical.
 *
 * So double-announcement is avoided by construction rather than by a guard: the
 * two channels never describe the same event. The region speaks only for what
 * focus cannot — a load still in flight, and a load that failed — and neither of
 * those has anywhere to put focus.
 *
 * The rule that follows, and it is the one to write down: a live region and a
 * focus move are ALTERNATIVES, not a pair. A site that wants the region to speak
 * on success has to stop moving focus.
 */
export function announce_route(){ return; }

/* Installed here, chained, until site/app.js owns navigated().
 *
 * CHAINED and not assigned, because the chrome seat wants this same hook and a
 * plain assignment means whichever module imported last silently wins. Chaining
 * still cannot fix ORDER — that is the finding, not the fix. The report asks for
 * one navigated() in site/app.js calling named methods in a stated order.
 *
 * The microtask is how this section guarantees its focus move lands last
 * whatever position it holds in the chain: a microtask runs after the whole
 * synchronous navigated() chain has finished mutating the DOM. Anything that
 * rebuilds chrome after focus moves can destroy it, and a drawer that returns
 * focus to its trigger is the measured case.
 *
 * Scoped to this section deliberately. A focus move is the most disruptive
 * thing you can land under six seats who are mid-flight and cannot see this
 * file. The canonical version drops this one condition — that is the entire
 * difference between what runs here and what the report asks for.
 */
export function navigated(page){
	if (!page.url?.startsWith("/a11y/")) return;   // ← the one line the canonical version drops

	page.chain().forEach(name_page);               // name every page that is on screen
	announce_route(page);                          // deliberately silent — see above
	queueMicrotask(() => focus_page(page));        // last, whatever else is in the chain
}

// the chaining itself, which is the symptom and not the fix
const previously = app.navigated;
app.navigated = function(page){ previously?.call(this, page); navigated.call(this, page); };

/* One live region for the section, created at import time — a region built and
 * filled in the same task is not announced, so it has to pre-exist by a lot.
 *
 * Raw DOM, deliberately: an element factory auto-appends to View.captor, and
 * this belongs on <body>, outside .app. `.app` is display:flex, so a stray child
 * there would become a column.
 */
const region = document.body.appendChild(document.createElement("div"));
region.className = "announcer";
region.setAttribute("role", "status");   // implies aria-live=polite + aria-atomic

export function announce(text){ region.textContent = text ?? ""; return text; }

/* A visible mirror of that region, so a sighted reader can see what a screen
 * reader would hear. The mirror is aria-hidden: it must not be announced twice. */
export function announcer_mirror(){
	return div.c("mirror", $m => {
		$m.attr("aria-hidden", "true");
		span.c("mirror-label", "role=status");
		const $text = span.c("mirror-text", "(silent)");
		new MutationObserver(() => $text.text(region.textContent || "(silent)"))
			.observe(region, { childList: true, characterData: true, subtree: true });
	});
}

/* A running read-out of document.activeElement. A page that argues about focus
 * should be able to show you where focus is. */
export function focus_log(){
	return div.c("focus-log", $log => {
		$log.attr("aria-hidden", "true");   // it mirrors focus; announcing it would fight the thing it watches
		span.c("focus-log-label", "document.activeElement");
		const $now = span.c("focus-log-now", describe(document.activeElement));
		document.addEventListener("focusin", () => $now.text(describe(document.activeElement)));
		document.addEventListener("focusout", () => setTimeout(() => $now.text(describe(document.activeElement))));
	});
}

// tag, classes, and an accessible-name approximation — label, then text
export function describe(el){
	if (!el || el === document.body) return "body  (nothing is focused)";
	const name = el.getAttribute?.("aria-label") ?? (el.textContent ?? "").replace(/\s+/g, " ").trim();
	const cls = el.className ? "." + String(el.className).trim().split(/\s+/).join(".") : "";
	return `${el.tagName.toLowerCase()}${cls}  "${name.length > 34 ? name.slice(0, 33) + "…" : name}"`;
}

// a labelled button that isn't a link — used where a demo drives something
export function press(label, fn){ return button.c("press", label).click(fn); }

// a measured transcript. Never hand-typed prose about what happened — this is
// the Playwright output, pasted, and it says so.
export function transcript(text, label){ return code(text, label ?? "measured — Playwright 1.62, Chromium, 1400×800"); }

export { code, p, div, View, app };
export { section } from "../ui.js";
