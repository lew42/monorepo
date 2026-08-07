import { Page, p, div, button } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, when, cost } from "../../compound/recipe.js";

export default new Page({
	meta: import.meta,
	title: "Shared state",

	// State lives here, on an ordinary object that outlives every child and every
	// navigation. Nothing was added to make this work — a Page is a JS object and
	// `parent` is already the lookup path.
	basket: [],

	take(item){
		this.basket.push(item);
		return this.refresh();
	},

	// The whole of "binding", written out. Explicit, at the mutation site, in the
	// file that owns the state.
	refresh(){
		this.$basket_count?.text(this.basket.length
			? `${this.basket.length} in the basket: ${this.basket.join(", ")}`
			: "The basket is empty.");
		return this;
	},

	initialize(){
		["apples", "pears", "plums"].forEach(item => this.add(item, {
			title: item,
			content(){
				p(`My parent holds the basket. I do not own it, I do not copy it, and I reach it as \`this.parent\` — the same walk \`container()\` and \`chain()\` already do.`);
				button(`add ${item}`).click(() => this.parent.take(item));
			}
		}));

		/* The other way, and it works — but look at what it costs. Assigning
		 * `activate` SHADOWS Page.prototype.activate, which is the method that
		 * mounts the page. Measured: without the explicit prototype call this
		 * page never appears, nothing throws, and the console is silent. */
		this.add("receipt", {
			title: "Receipt",
			content(){ this.$receipt_lines = div.c("receipt-lines"); this.fill(); },
			fill(){ this.$receipt_lines?.empty(() => this.parent.basket.forEach(item => p("· " + item))); },
			activate(){ Page.prototype.activate.call(this); this.fill(); return this; }
		});
	},

	content(){
		when("a subtree shares something — a basket, a filter, a selected row, a draft — and every page under it needs to read or change it.");

		this.$basket_count = p.c("note basket-count");
		this.refresh();

		p("Add a few, then walk between the pages. The count survives, because pages are built once and this object is never rebuilt. Then open Receipt: it re-reads the basket on the way in.");

		this.$pages = div.c("pages cols");

		div.c("row", () => this.children.forEach(child => child.link()));

		section("The position");

		p("Yes — the page tree is already a perfectly good state tree, and it should not be given help. It is scoped by construction, it persists for the session, and `parent` is the lookup path the framework already walks three other times.");

		code(`
scoped        state on a page is visible to its subtree and nowhere else
persistent    built once, never thrown away — it outlives navigation
addressable   this.parent, exactly like container() and chain() walk it
NOT reactive  nothing re-renders. A value read at render time is a snapshot.`);

		p("The last line is the trade and it is the right one. `built once` is what makes a half-typed input survive a round trip through two other pages; making the tree reactive would rebuild precisely what that bought. So binding is explicit: the mutator calls `refresh()`, in the file that owns the state, visible at the call site.").ac("note");

		section("The hazard, measured");

		code(`
new Page({ activate(){ … } })

own property shadows prototype   true
my activate ran                  true
was the page ever mounted?       FALSE   ← nothing threw, nothing rendered

Object.assign is the constructor, so EVERY prototype method is
assignable — including the four that are load-bearing:

  activate     mounts the page          silent blank screen
  render       builds the view          silent blank screen
  container    decides where it lands   mounts in the wrong place
  chain        walks to the root        breaks crumbs and the Router diff`);

		p("`Receipt` above does it correctly, with `Page.prototype.activate.call(this)` as its first line. That works, and it is one line you have to remember forever. The version on this page — `take()` calling `refresh()` — needs no super call, no lifecycle, and reads as a sentence. Prefer it, and keep the override for the case where the state changed while you were somewhere else entirely.").ac("note");

		section("The file");

		this_file(import.meta);

		cost("state on the tree is session state, not persisted state — a reload empties the basket, because the tree is rebuilt from the url and the url never said what was in it. If it must survive a reload it belongs in the url, and at that point it is navigation, not state.");
	}
});
