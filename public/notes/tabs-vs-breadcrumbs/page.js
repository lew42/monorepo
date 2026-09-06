import { md, div, span, button } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the `layout` skill's five):
   1. Container — the app's main region under /notes/, a plain page grid.
   2. Size — one reading column; the photo takes `wide`. The two frames below sit side
      by side in a `flex gap wrap` so they are a COMPARISON at 1280 and above, and
      stack at 400 rather than shrinking into two unreadable slivers.
   3. Own layout — `.md` prose, plus two `surface` boxes.
   4. Regions — two: crumbs, then content. No children.
   5. Preview — the photo, from NotesNote.

   The note draws tabs and breadcrumbs as two little frames and writes "BAD = JUMPY UX"
   beside the tabs. Built here as the two frames, sharing one position in the tree, so
   the jump the note is complaining about is the thing you actually see when you click. */

/* One three-level tree, walked by both frames. `path` is an array of indexes into it. */
const TREE = {
	name: "Root",
	kids: [
		{ name: "A", kids: [{ name: "A1" }, { name: "A2" }, { name: "A3" }] },
		{ name: "B", kids: [{ name: "B1" }, { name: "B2" }] },
		{ name: "C", kids: [] },
	],
};

const walk = path => path.reduce((node, i) => node.kids[i], TREE);

/* Both frames read ONE piece of state, so a click in either moves both. That is the
   point: the tree is the same, only the drawing differs. Nothing persists — a refresh
   is the root again (minion rules: demos do not persist). */
function tabs_vs_breadcrumbs(){
	let path = [];

	const chip = (text, on, click) => {
		const $b = button(text).on("click", click);
		$b.attr("aria-pressed", on ? "true" : "false");
		if (on) $b.style({ fontWeight: "700", borderBottom: "2px solid var(--prim)" });
		return $b;
	};

	// Filled in by the two frames below, before `draw()` is ever called.
	let $tabs, $crumbs;

	const draw = () => {

		// TABS — "show all @ 1 level". Only the current level's siblings are on screen,
		// so the WHOLE bar is replaced every time you go a level down.
		$tabs.empty(() => {
			const here = walk(path);
			const kids = here.kids || [];

			div.c("flex gap wrap", () => {
				if (!kids.length) span.c("muted", "(no children — the bar is empty)");
				kids.forEach((kid, i) => chip(kid.name, false,
					() => { path = [...path, i]; draw(); }));
			});

			div.c("muted", "showing: the children of " + here.name);

			if (path.length) button("← up").on("click",
				() => { path = path.slice(0, -1); draw(); });
		});

		// BREADCRUMBS — "show deep/path". The trail only ever GROWS, so nothing that was
		// on screen a moment ago has moved.
		$crumbs.empty(() => {
			div.c("flex gap wrap v-center", () => {
				chip("Root", path.length === 0, () => { path = []; draw(); });
				path.forEach((_, depth) => {
					span.c("muted", "›");
					const node = walk(path.slice(0, depth + 1));
					chip(node.name, depth === path.length - 1,
						() => { path = path.slice(0, depth + 1); draw(); });
				});
			});

			div.c("muted", "showing: where you are, all the way down");

			const kids = walk(path).kids || [];
			div.c("flex gap wrap", () => kids.forEach((kid, i) =>
				button(kid.name).on("click", () => { path = [...path, i]; draw(); })));
		});
	};

	/* ⚠ Both boxes are built INSIDE this capture — a view created outside one lands on
	   whatever is capturing at the time, which here would be the page itself. `draw()`
	   runs last, once both $tabs and $crumbs exist. */
	return div.c("flex gap wrap", () => {

		div.c("surface pad flex v gap", () => {
			span().style("fontWeight", "700").text("Tabs — show all @ 1 level");
			$tabs = div.c("flex v gap");
			span.c("muted", "Click down a level: every word in the bar is replaced. "
				+ "That is the jump.");
		}).style({ flex: "1 1 16em", minWidth: "0" });

		div.c("surface pad flex v gap", () => {
			span().style("fontWeight", "700").text("Breadcrumbs — show deep/path");
			$crumbs = div.c("flex v gap");
			span.c("muted", "Click down a level: the trail grows and nothing already on "
				+ "screen moves.");
		}).style({ flex: "1 1 16em", minWidth: "0" });

		draw();
	});
}

export default new NotesNote({
	meta: import.meta,
	title: "Tabs vs breadcrumbs",
	icon: "account_tree",
	description: "Show all at one level, or show the deep path — and why one of them feels jumpy.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page is about sidebars.**

> Sidebar?  Topic vs Site
>   ↓ Jump to sub-topic      ↓ Jump to another topic

drawn as a box headed **SITE** holding two boxes: *Topic A* with A1 A2 A3, and *Topic B*
with B1 B2 B3. Then:

> Many pages don't need sidenav.
>
> Global Nav is optional?
>
> **Left Sidebar(s)**
> ☑ Home Link  ☑ User/Account @ bottom?  ☑ Full Height

— with a tall narrow rail sketched beside it, a small box at its top and another at its
foot. Then:

> For Desktop Display pages?
>
> Probably better than top nav?
>   ↳ Maybe not for "display/marketing" pages → About Team Work Contact
>     as "left nav" isn't terrible, but probably less useful

**The right page is two arguments.** First, whether a page renders itself:

> \`export default page()\` ? → does not auto render…? / auto-renders?
>
> \`page("Name", () => {…});\` // auto-renders?
>
> ✳ DON'T auto-render, let the exported \`page()\` get rendered by the app?
>   → w/o \`export default\`, \`page()\` won't render…
>
> Or, use meta: \`import.meta\` to decide?
>
> This is a lot of syntax gymnastics…
>
> HashRouter needs to import all pages?

Then, under a heading, the one this note is named for:

> **TABS vs BREADCRUMBS**
>   ↓ Show all @ 1 level          ↳ Show deep/path

with a box labelled *Root* holding tabs *A B C* and the note "no bc", a **⚠ BAD = JUMPY
UX** beside it, and then:

> **BREADCRUMBS + TABS?**
> ROOT > PARENT

drawn as a *ROOT > A* trail over a tab strip, and a second strip reading
*DEFAULT | SIB | SIB | SIB*.`);

		md(`## The jump, live

Both frames show the same three-level tree and share one position in it, so clicking in
one moves the other. Watch what happens to the words already on screen when you go a
level down.`);

		tabs_vs_breadcrumbs();

		md(`The tab bar replaces every word it shows; the trail only grows. That is the
whole of "BAD = JUMPY UX" — nothing is wrong with tabs, but a tab bar that re-labels
itself as you descend gives you nothing stable to aim at. The note's own last sketch is
the answer it reached: **breadcrumbs + tabs** — the trail says where you are, the tabs
say what is beside you.`);

		md(`## What it points at

- [/imagine/paging/navigation/](/imagine/paging/navigation/) — this note's thesis,
  measured. Nine mechanisms compared, and the finding is the note's own: stable beats
  dynamic, and a nav that re-labels itself as you move is the one people lose.
- [core/Sidebar](/framework/core/Sidebar/) — the left sidebar, built with the note's
  three checkboxes: a home link at the top, a footer region at the bottom, full height.
- [\`crumbs()\`](/framework/core/Page/) — breadcrumbs, built as a Page
  method. It is the line at the top of this very page.
- [ext/tabs](/framework/ext/tabs/) — tabs, built, including the vertical form the left
  page sketches.
- [\`children:\`](/framework/core/Page/doc/declaring/) — the answer to the
  auto-render gymnastics. A page is \`export default new Page({…})\`: constructing it
  registers it and renders nothing, and the app renders it when the URL asks. No
  \`import.meta\` guessing, no two spellings.
- [The registry gate, removed](/framework/core/Router/doc/registry-gate/) — "HashRouter
  needs to import all pages?" is why there is no HashRouter: importing everything to
  know what exists is the thing lazy loading exists to avoid.`);
	}
});
