import { Page } from "/app.js";
import { code, section } from "../../ui.js";
import { file, pair, verdict, ledger, note } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "container() vs the alternatives",

	content(){
		verdict("container() is right, and readme Open #1 is a fair complaint about a cost that is genuinely bought. It is not a style choice — once pages are built once and never rebuilt, there is no render pass in which a parent could place a child, so the child must find its own home. The three alternatives all trade that persistence away, and persistence is what pays for the scroll retention, the DOM identity and the zero-JS navigation.");

		section("The mechanism");

		pair(() => {
			file("/framework/core/new/1/Page.class.js", "container(){");
			file("/framework/core/new/1/Page.class.js", "activate(){");
		});

		note("Two levels of claim, most specific first: `regions` places **one named child**, `$pages` claims **everything below me**. Nine lines, one walk, and it is the only walk left in the tier.");

		note("The complaint, quoted from the readme: *“it is the one place a reader of the child's file cannot see what happens to it.”* True. `/full/left/deeper/` lands in a grid it never mentions, declared by a page two levels up.");

		section("Alternative A — the parent places the child");

		pair(() => {
			code(`
// hypothetical — nothing implements this
content(){
    this.$panel = div.c("panel");
    this.children.forEach(child =>
        this.$panel.append(child.render()));
}`, "sketch — parent places");

			code(`
/full/          claims a region
/full/left/     claims nothing
/full/left/deeper/   ← must land in FULL's region

left has to forward. Every intermediate
page must forward. That is container()'s
walk, hand-written, once per page.`, "why it breaks");
		});

		note("The parent does not know **when**. A child is activated by the Router at navigation time, long after the parent rendered — so the parent would have to be re-consulted on every navigation, which is `container()` inverted with more calls. And a grandchild has no relationship with the region-owner at all, so every page in between must forward. **Rejected: strictly worse, and it fails exactly at the depth `container()` exists for.**");

		section("Alternative B — slots / portals");

		pair(() => {
			code(`
// hypothetical — Vue's <slot name>, React portals
new Page({ slot: "detail" })   // child declares
this.region("detail")          // parent publishes`, "sketch — the child declares");

			file("/framework/core/new/1/Page.class.js", "this.regions ??=");
		});

		note("This is the alternative that *does* answer Open #1: the child's file would say where it goes. Three reasons it still loses.");

		code(`
1  a second global namespace, no build step to check it — a typo'd slot
   name fails silently, which is the failure mode this repo hates most

2  it couples the child to the parent's layout vocabulary, so a page
   that says slot: "detail" can never be rendered anywhere else

3  it inverts the one decision the current design gets right`, "against slots");

		note("Point 3 is the important one. `tabs(\"what why\")` decides **at placement** which children are tabs, so one page can have several sets and a child in no set is an ordinary child. With slots the child declares *“I am a tab”* — and then it is only ever a tab. **Nothing on a Page says what role it plays, and that is a feature slots would delete.**");

		section("Alternative C — a layout component owns its children");

		pair(() => {
			file("/framework/core/Pager/ColumnPager.js", "columns(){");
			code(`
this.$pages = div.c("pages cols");`, "new/1, same result");
		});

		note("The most readable of the four: you open the layout and see exactly what it renders where, with no walk anywhere. It is ColumnPager, and it is Next's `layout.tsx`. It loses on identity.");

		code(`
a layout renders its children   →  it must resolve the chain itself
it resolves the chain           →  it re-runs on every navigation
it re-runs                      →  the DOM is rebuilt
the DOM is rebuilt              →  scroll, focus and form state are gone`, "the chain of consequences");

		note("This is not hypothetical — it is ColumnPager's own open question #3, *“navigating within a topic re-renders the whole ColumnPager”*, and `App.load_page`'s `this.$app.empty().append(...)` is where it happens. new/1's `render()` caches `this.view` and `activate()` appends only if the parent differs, so a page's DOM node is created once and never touched again.");

		section("Ranked");

		ledger(["", "reads well?", "survives depth?", "keeps DOM identity?", "call"], [
			["`container()` — current", "no, and it says so", "yes", "yes", "**best.** The cost is real and bought."],
			["C · layout owns children", "**best**", "yes", "no — rebuilds", "right answer if you re-render; this tier does not"],
			["B · slots", "yes", "yes", "yes", "silent-failure namespace; freezes a child into one role"],
			["A · parent places", "yes", "**no**", "yes", "container() with more steps"],
		]);

		section("The one change I would actually make");

		pair(() => {
			code(`
container(){
    const mine = this.parent?.regions?.get(this.name);
    if (mine) return mine;

    for (let page = this.parent; page; page = page.parent)
        if (page.$pages) return page.$pages;

    return this.app.$pages;
}`, "today — the only silent method in the tier");

			code(`
container(){
    const mine = this.parent?.regions?.get(this.name);
    if (mine) return log("region", this.parent, mine);

    for (let page = this.parent; page; page = page.parent)
        if (page.$pages) return log("subtree", page, page.$pages);

    return log("app", this.app, this.app.$pages);
}`, "proposal — say which claim won");
		});

		note("Every other method in these three classes logs what it did — `child()` logs its import, `activate()` logs the chain diff, `add()` logs the adoption. `container()` is the **only** one that is silent, and it is the one thing a reader cannot see. That is not a coincidence worth keeping.");

		note("No API, no new concept, no option: one line per branch turns the single invisible decision in the tier into the most visible thing in the console. **This is my top framework request, and it costs three lines.**");

		section("Next");

		note("`/versus/css/` — the other half of the arrangement story, and the two places it genuinely runs out.");
	}
});
