import { Page, p, div, a, button } from "/app.js";
import { code, section } from "../../ui.js";
import { store, pick } from "../store.js";

/* Two inline children, in two different places in the tree, reading one module.
 * Neither is the other's parent, and the sharing is visible in both files
 * because both files import it. */
const panel = name => ({
	content(){
		p(`I am \`/state/shared/${name}/\`. My sibling is not my parent and I am not hers.`);

		const $picked = div.c("picked async-landed ok", "");

		this.paint = () => $picked.text(`store.picked → [${store.picked.join(", ")}]`);

		div.c("row", () => ["red", "green", "blue"].forEach(colour =>
			button.c("async-btn", colour).click(() => { pick(colour); this.paint(); })));

		this.paint();

		div.c("row", () => {
			a.c("page-link", "sibling: left").href("/state/shared/left/");
			a.c("page-link", "sibling: right").href("/state/shared/right/");
			a.c("page-link", "far away: /async/trap/").href("/async/trap/");
		});
	},

	/* content() ran once, and the value it painted can change while this page is
	 * off screen — which is exactly what "shared" means. So repaint on entry.
	 * Without this the sibling shows a stale list and the demo lies. */
	activate(){ Page.prototype.activate.call(this); this.paint?.(); return this; },
});

export default new Page({
	meta: import.meta,
	title: "Shared state",

	initialize(){
		this.add("left", panel("left"));
		this.add("right", panel("right"));
	},

	content(){
		p("State that belongs to two pages, where neither owns the other. Pick some colours on one, then open the other.");

		div.c("row", () => {
			a.c("page-link", "left").href("/state/shared/left/");
			a.c("page-link", "right").href("/state/shared/right/");
		});

		section("The module is the answer");

		code(`
// site/state/store.js
export const store = { picked: [] };
export function pick(name){ … }

// both pages, in their own files
import { store, pick } from "../store.js";`, "store.js — the whole thing");

		p("It survives every soft navigation and Back, dies on reload, and — the part that matters — it is `import`ed by both readers, so the sharing is greppable from either end. Nothing is hidden in a parent that neither file mentions.").ac("note");

		section("Why not the common ancestor");

		code(`
this.parent.parent.filters = …          ← works, and is a trap

  · invisible from either child's file — the reader sees \`parent\` and has to
    go find out what that is today
  · breaks the moment someone moves a page: the number of \`.parent\` hops is
    a hard-coded fact about the tree's SHAPE
  · two pages in different subtrees share only the ROOT, so "the common
    ancestor" is app.root — which is just module scope with extra steps`);

		p("The last line is the one that settles it. `/state/shared/left/` and `/async/trap/` have exactly one ancestor in common, and hanging their shared state on it would put unrelated site state on the root page. A module they both import says the same thing honestly.").ac("note");

		section("Shared state needs a repaint, and there is no hook for it");

		code(`
activate(){ Page.prototype.activate.call(this); this.paint?.(); return this; }`,
			"on both panels — without it the sibling shows a stale list");

		p("This is the cost of the memoized view, arriving from the other direction. `content()` painted a value that something else can change while this page is off screen, so every page reading shared state owes a repaint on entry — and gets it by shadowing a core method. The async seat asked for `Page.mount()` to be split out of `activate()` for the same reason; this is a second, independent case for it.").ac("note");

		section("It really is not scoped to the subtree");

		p("The counter below is bumped by both siblings AND by nothing else — but the module is reachable from anywhere. Visit `/async/trap/` and come back; the value is untouched, because sharing is by import, not by position in the tree.");

		code(`
                        soft nav   Back   reload
module scope               ✓        ✓       ✗

so: shared state is session state. If it must outlive a reload it has to be
    in the url, or in storage — and if it must be shareable with a PERSON,
    the url is the only option.`);

		section("When to reach for storage instead");

		code(`
sessionStorage   a draft you would be sorry to lose to an accidental reload
localStorage     a preference: theme, density, "don't show this again"
the url          anything a second person should be able to see

Everything else is a module.`);

		p("The framework has no opinion about any of these — they are ordinary web APIs, and that is the right amount of opinion for it to have.").ac("note");

		a.c("page-link", "stale →").href("/state/stale/");
	}
});
