import { Page, Sidebar, View, div, p, pre, span, md, h1, h2, a } from "/app.js";
import { stats } from "./stats.js";
import sprawl from "/framework/ext/sprawl/sprawl.js";
import { weight } from "/framework/core/Page/weight/weight.js";

// A card's size follows its WEIGHT (core/Page/weight/weight.js — 1, plus distinct
// referencing pages, plus a manual bump; never guessed here, law 6/7). Past this same
// threshold core/Page/weight's own demo already uses to make an item "not just first, but
// bigger," a card here shows the first lines of its own readme's "## Architecture" section —
// read live over fetch, never retyped (law 7). Every other card is icon + name only, no
// description — the owner's own words, 2026-10-02: "small modules are icon plus name only."
const BIG_WEIGHT = 10;
const ARCHITECTURE_LINES = 6;

// Reads a module's OWN readme.md live and pulls the first few lines of its fenced
// "## Architecture" code block. Fails soft — no readme, no such section, offline, any of it —
// by returning null, same as a module with no `description` today: nothing to show, not an
// error. Never caches, never retypes: the next edit to a readme is the next fetch's answer.
async function architecture_excerpt(url){
	const text = await fetch(new URL("readme.md", location.origin + url).href)
		.then(r => r.ok ? r.text() : null).catch(() => null);
	if (!text) return null;

	const after = text.split(/^## Architecture\s*$/m)[1];
	if (!after) return null;

	const section = after.split(/^## /m)[0];
	const fenced = section.match(/```[a-z]*\n([\s\S]*?)```/);
	// Every readme's Architecture block (core/Page/readme.md, core/Item/readme.md, …) is a
	// shape followed by a long trailing `// comment` explaining it — right for a reader on
	// the module's own page, far too much text for a small card. Strip everything from the
	// first `//` on, so the card shows the SHAPE (`Page extends PageLog extends Item`), not
	// the essay beside it; a real `://` in a url would be cut too, but none appear in these
	// shape blocks today.
	const lines = (fenced ? fenced[1] : section).split("\n")
		.map(l => l.replace(/\/\/.*/, "").trimEnd())
		.filter(l => l.trim())
		.slice(0, ARCHITECTURE_LINES);

	return lines.length ? lines.join("\n") : null;
}

// Unread badges, rolled up (owner, 2026-10-02): a card's badge is its module's unread
// Inbox-item count; the sidebar's own "Framework" link shows the total, so a click drills
// down (Framework (3) → the modules with items → that module's inbox, newest first). The
// owner's own words: that per-module count comes from @mastermind-servex-10's card-pipeline
// MODULE cards — a different, not-yet-built thing from Servex's own ASK-card pipeline
// (ai/2026-10-02/card-pipeline/, which cards ASKS, not modules). Coordinated with them
// 2026-10-02 (task.jsonl) and no answer yet on the data's shape, so — the owner's own words
// again — "leave a 0 or hidden badge until then": this is the one function that changes once
// that data exists; nothing else in `module_card()` or the sidebar needs to.
async function unread_count_for(nav){
	return 0;   // no per-module unread source exists yet — always hidden until it does
}

// The icon + name link draws immediately (`owner.preview_link`, core/Page/Page.class.js) —
// weight is never on the critical path for first paint. The body (architecture excerpt, or a
// plain description, or nothing) fills in once weight resolves: `$card.append(promise)` is
// `core/View`'s own documented way to fill a box after an await (`View.append_promise`,
// epoch-guarded against a card that's gone by the time its fetch comes back) — not a new
// pattern, the same one `core/Page/Page.class.js`'s own async `content()` pages use.
function module_card(owner, nav){
	const $card = div.c("page-preview", () => owner.preview_link(nav))
		.ac(nav.card).ac(nav.class_card && "page-surface-dark");

	$card.append(unread_count_for(nav).then(n => n > 0
		? card_body(() => span.c("page-preview-badge", String(n)))
		: undefined));

	$card.append(weight(nav.url).then(async w => {
		// ⚠ `undefined`, never `null`: `View.append_promise` skips appending on
		// `is.def(return_value) === false`, and `is.def(null)` is TRUE (null is a real
		// answer, just not a DOM node) — appending it hit `Node.append(null)`, which
		// stringifies to the literal text "null" in every card (caught live, screenshot).
		if (w.weight <= BIG_WEIGHT) return undefined;   // icon + name only — nothing else to add

		// ⚠ `.big` only lands once there's a real excerpt to grow for (review round 1,
		// note 1) — a heavy module with no `## Architecture` section (View, today) falls
		// all the way back to the ordinary small card shape, same as a light module with a
		// description: the dark/enlarged look means "there's more to show here," not just
		// "this module scored high," so it never applies to an empty reason.
		const code = await architecture_excerpt(nav.url);
		if (!code) return nav.description ? card_body(() => p.c("page-preview-desc", nav.description)) : undefined;

		$card.ac("big");   // reuses the existing "bigger card" word (Page.css), not a new one
		return card_body(() => pre.c("page-preview-architecture", code));
	}));

	return $card;
}

// Built OUTSIDE whatever capture happens to be open by the time this promise resolves — the
// same reason `home_sections()` below saves/clears/restores `View.captor` for its own
// synchronous pass (core/View/doc/capturing.md).
function card_body(fn){
	const saved = View.captor;
	View.captor = null;
	try { return fn(); } finally { View.captor = saved; }
}

/* ONE SECTION PER SIDEBAR SECTION, every card the same shape — icon + name, weight-sized up
 * to icon + name + an architecture excerpt (`module_card()`, above) — even where a module
 * would rather show something else. This is its own small pass rather than `this.wall_rungs()`
 * (core/Page/Page.class.js) for two review findings (2026-10-02, round 3), still true now that
 * cards are built by `module_card()` instead of calling `preview_card()` directly:
 *
 *   1. A card here is ALWAYS this page's own `module_card(owner, nav)`, never
 *      `child.preview(nav)`. Several `ux/` modules (Dictate, Tree, Wizard, …) override
 *      `preview()` to show a live screenshot-style thumb instead — right for their own module
 *      page, wrong here: every OTHER section on this page is the one card shape, so UX's
 *      cards silently broke that rule the moment `wall_rungs()`'s own `page.previews()` called
 *      the module's override instead of the plain card. `module_card()` only ever calls
 *      `owner.preview_link(nav)` — the one method nothing overrides — which is what makes
 *      every card on this page agree.
 *   2. A `leaf: true` section (UI, Audit, Sandbox, AI, AI 2 — "I present myself, not my
 *      children": its own children are TABS, not a nav wall, which is exactly why
 *      `wall_rungs()` correctly skips it everywhere else) still gets its OWN one-item
 *      section here: a single card, the section's own `nav()`, same shape as every other
 *      item. The brief names sections by their sidebar heading, UI included, so "one
 *      section per sidebar section" has to hold literally even for the ones with no
 *      wall-worthy grandchild to show instead.
 *
 * `group:` isn't reproduced here (core's `previews()` supports it): no top-level section's
 * own children declare one today, so there is nothing yet for it to group.
 */
function home_sections(root){
	const saved = View.captor;
	View.captor = null;
	try {
		const rungs = [];

		root.children.forEach((page, name) => {
			if (!page?.children.size) return;   // childless (Start here, FAQ, Versus…) stays sidebar-only

			const nav = root.nav_for(name);

			rungs.push(div.c("page-wall flex v gap", () => {
				h2.c("page-wall-title", () => a.c("page-link", nav.label).href(nav.url));

				div.c("page-previews bleed", () => {
					if (page.leaf) return void module_card(page, nav);   // itself: one card

					page.children.forEach((child, child_name) => {
						const child_nav = page.nav_for(child_name);
						module_card(child ?? page, child_nav);
					});
				});
			}).style("--gap", "1em"));
		});

		return rungs;
	} finally {
		View.captor = saved;
	}
}

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",
	icon: "widgets",

	// Inert: /styles.css decides what the class means, and Router.mark() unsets it.
	classes: "hides-nav",

	children: "start ai ai2 research faq versus core styles ui ux audio ext util dev servex audit sources design code sandbox old",

	/* A LAYOUT, not a content page. Three things an override owes, all silent when
	 * missed (core/Page/readme.md): set `this.view`, carry `.page`, never nest a
	 * second `.page` inside. */
	render(){
		return this.view ??= div.c("page page--framework topic flex fill", () => {

			// Both levels are already loaded — the Router waited on `loading` before
			// activating me — so this is built once, complete, and never rebuilt.
			this.$sidebar = new Sidebar({
				app: this.app,
				header: () => this.app.brand(this.title, this.url),
				root: this,
			});

			// My children mount HERE, inside my own view, so the nav beside them
			// never moves when you navigate between them.
			this.$pages = div.c("pages", () => {

				// ⚠ `default flow`, never `page` — a second `.page` inside this one is
				// what core/Page/doc/method/activate.md says never to do.
				// The widths are in /styles.css: this block takes the region, its
				// `.flow` children take the measure. It used to be four inline styles.
				div.c("default flow", () => {

					div.c("flow", () => {

						h1("A no-build, native-ESM web framework");

						md("Write a page, save the file, refresh the tab.");
					});

					// ⚠ OUTSIDE the prose block: five 9em tiles are 49em with their gaps,
					// and inside a 40em reading column the fifth is stranded on a row of
					// its own. A strip of numbers is a wall, not a sentence — /styles.css
					// gives it the width its own count needs.
					stats();

					// THE SPRAWL — the whole point of this page (2026-10-02 rebuild, see
					// public/framework/ai/2026-10-02/framework-home/). `home_sections()`
					// (above) is this page's own one-rung-per-sidebar-section pass — a
					// childless child (Start here, FAQ, Versus…) still lives in the nav
					// beside this, not here; a `leaf: true` one (UI, Audit, Sandbox…) gets
					// a one-card section instead of being skipped. `sprawl()` balances those
					// rungs into columns by real height instead of stacking them in one tall
					// flex column, so a 3440 screen gets about three columns of roughly equal
					// length instead of one long scroll next to empty grey.
					sprawl(home_sections(this)).ac("wide");

					div.c("flow", () => {

						md("New here? [Start here](/framework/start/) — three files, a working site. Comparing frameworks? [Versus](/framework/versus/). Building a site, not reading the framework? [Web](/web/) is the guide.");

						md("This page used to open with a live clock and a line-by-line tutorial — both still exist, just not on the front page anymore: [Framework (old)](/framework/old/) is the exact page this replaced.");

						md.details(import.meta, "readme.md", "Readme");
					});
				});
			});
		}).ac(this.classes);   // `classes: "hides-nav"` still applies
	},
});
