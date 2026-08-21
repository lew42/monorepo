import { Page, demo, md, div, span, button } from "/app.js";

const live = (el, fn) => new ResizeObserver(fn).observe(el);

/* label · which box it takes over · the one line: mechanism, what nav it costs, Back.
   Two of the five are the same mechanism, which is the point of listing them apart. */
const OPTIONS = [
	["viewport", "viewport", "`.page.layout-full` — `position: fixed; inset: 0; z-index: 20` (layouts.css:18-28). Costs the site sidebar, the framework rail and the tabs; `.layout-close` is the only way out. Back works: it is a ROUTE, not a state. **Site sidebar: gone.**"],
	["app.$pages", "app", "Mount at the top level and wear `fill`. Costs the framework rail — that rail lives in `/framework/page.js`'s own `$pages`, so a top-level page is beside it, not inside it. Back works. **Site sidebar: kept.**"],
	["Doc tab panel", "panel", "`.tab-panel` is `padding-top: 3em` and **no height** — a page in it can be wide but never tall. Costs no nav at all. Back works. **Site sidebar: kept** — and this is where a Workspace already lives."],
	["catalog $pages", "catalog", "`.page-catalog-pages` becomes a scrollport only when an ancestor has a definite height (catalog.css:119-123). Costs nothing: the rail stays beside it by design. Back works. **Site sidebar: kept.**"],
	["Panel workspace", "viewport", "`ext/Panel/playground/page.js:62` takes that same `layout-full` and then hand-draws a copy of the sidebar it just left. Back works. **Site sidebar: gone, then rebuilt.**"],
];

/* The site's regions, nested the way they really nest. A strip is chrome; a box is a
   region. Which chrome a takeover costs is then DERIVED — `lit.contains(strip)` — rather
   than typed next to each button. */
const mock = (slots, strips) => {
	const strip = text => strips.push(div.c("wash", text)
		.style({ padding: "0.35em 0.5em", fontSize: "0.75em", borderRadius: "var(--radius)", flex: "0 0 6em" }).el);

	const box = (key, label, fn) => {
		const $box = div.c("surface flex-1 flex v gap pad", () => { span.c("h4", label); fn(); })
			.style({ "--pad": "0.4em", "--gap": "0.35em" });

		slots.set(key, $box.el);
	};

	const row = fn => div.c("flex gap").style("--gap", "0.4em").append(fn);

	box("viewport", "viewport", () => row(() => {
		strip("site sidebar");
		box("app", "app.$pages", () => row(() => {
			strip("framework rail");
			box("framework", "framework $pages", () => {
				strip("Doc tab bar");
				box("panel", "Doc tab panel", () => row(() => {
					strip("catalog rail");
					box("catalog", "catalog $pages", () => strip("the page"));
				}));
			});
		}));
	}));
};

const board = () => {
	const slots = new Map(), strips = [];
	let $bar, $note, current = 0;

	const show = i => {
		current = i;
		const [label, key, note] = OPTIONS[i], lit = slots.get(key);

		slots.forEach((el, k) => el.style.outline = k === key ? "2px solid var(--prim)" : "");
		strips.forEach(el => el.style.opacity = lit.contains(el) ? "0.2" : "1");
		$bar.el.querySelectorAll("button").forEach((b, n) => b.classList.toggle("prim", n === i));

		$note.empty(() => md("**" + label + "** — " + lit.offsetWidth + " × " + lit.offsetHeight
			+ "px in this box. " + note));
	};

	$bar = div.c("flex gap wrap").style("--gap", "0.4em")
		.append(() => OPTIONS.forEach(([label], i) => button(label).click(() => show(i))));

	mock(slots, strips);
	$note = div.c("muted");

	live(slots.get("viewport"), () => show(current));
};

export default new Page({
	meta: import.meta,
	title: "Full",
	group: "The box",
	description: "The five regions a page could take over, and what each one costs.",

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50", board)); },

	content(){
		md("Four words exist today and none of them is fullscreen: **`full`** collapses the gutters to 0, **`fill`** is height + scrolling, **`solo`** is `fill` again with 0 call sites, and only **`layout-full`** leaves the document with `position: fixed`.");

		md("**Press each button.** The chrome that goes dim is the chrome inside the region being taken over — that is read from the boxes, not written beside the buttons. The site sidebar survives `app.$pages`, the Doc tab panel and a catalog's `$pages`; it does not survive the two that are `position: fixed`.");

		md("So a Workspace that cannot go fullscreen has a **height** problem, not a `position` one: a tab panel is `padding-top: 3em` and no height. `.solo`'s three declarations — `align-self: stretch; overflow: auto; min-height: 100%` — on the page *and* on the panel between them is the whole fix, and it costs no nav. This card describes; it ships nothing.");

		demo.stage(() => board()).ac("bleed");
		demo.source(board, "Source");
	},
});
