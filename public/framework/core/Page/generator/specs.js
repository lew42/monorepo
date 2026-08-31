import { div, span, a, icon, md } from "/app.js";
import { parse } from "./spec.js";
import { sketch } from "./rolls.js";

/**
 * THE SPEC GALLERY — eight page shapes worth keeping, as DATA.
 *
 * The roller draws a tree; the readme's own warning is that a seed is only an address
 * against one `MODEL`, so **keep a tree you like as its text**. Until now there was
 * nowhere to keep it. This is that place: a short list of specs that are real page
 * shapes — a docs site, an inbox, a settings rail — each one a link.
 *
 * It is a LIST, not a generator: nothing here is drawn, seeded or rolled, so nothing
 * here can move when `MODEL` does. That is the point of writing a good tree down.
 *
 * ⚠ Every spec is written in the SAME five words the roller draws and the controls
 *   edit. A gallery in its own dialect would be a second vocabulary to keep in step.
 */

/* Eight, and each one says what real thing it is. The note is the whole documentation:
   a shape you cannot name is a shape nobody reuses. */
export const SPECS = [
	{
		title: "Docs site",
		note: "A wall of modules, each with its own readme / api / docs tabs. This site's own /framework/.",
		spec: [
			"wall cols=2",
			"  tabs",
			"    prose",
			"    prose",
			"    prose",
			"  tabs",
			"    prose",
			"    prose",
			"  tabs",
			"    prose",
			"    prose",
		].join("\n"),
	},
	{
		title: "Inbox",
		note: "Folders, messages, the letter. Three columns, and the last one is where you read.",
		spec: [
			"list small",
			"  list",
			"    prose large",
			"    prose large",
			"  list",
			"    prose large",
		].join("\n"),
	},
	{
		title: "Settings",
		note: "One rail of sections beside one panel. Nothing opens a column; the row never grows.",
		spec: [
			"vtabs",
			"  prose",
			"  prose",
			"  prose",
			"  prose",
		].join("\n"),
	},
	{
		title: "Gallery",
		note: "Three cards across, each opening wide. `cols=3` is the whole difference from a list.",
		spec: [
			"wall cols=3",
			"  prose large",
			"  prose large",
			"  prose large",
			"  prose large",
			"  prose large",
			"  prose large",
		].join("\n"),
	},
	{
		title: "Dashboard",
		note: "Tabs over panels of tiles. Everything stays in one column, which is what a dashboard is.",
		spec: [
			"tabs",
			"  wall cols=2",
			"    prose",
			"    prose",
			"  wall cols=2",
			"    prose",
			"    prose",
			"  prose",
		].join("\n"),
	},
	{
		title: "Reference",
		note: "A rail of types, an inbox of members, the member. `vtabs` picks, `list` previews.",
		spec: [
			"vtabs",
			"  list",
			"    prose large",
			"    prose large",
			"  list",
			"    prose large",
		].join("\n"),
	},
	{
		title: "Shop",
		note: "Categories on a narrow rail, a grid of products, the product wide.",
		spec: [
			"list small",
			"  wall cols=3",
			"    prose large",
			"    prose large",
			"    prose large",
			"  wall cols=3",
			"    prose large",
		].join("\n"),
	},
	{
		title: "Handbook",
		note: "Miller columns all the way down — the shape this whole system is.",
		spec: [
			"list small",
			"  list small",
			"    list",
			"      prose large",
			"    prose large",
			"  list small",
			"    prose large",
		].join("\n"),
	},
];

/**
 * The gallery's page config — a stable child of the generator at `/generator/specs/`,
 * the same shape `rolls.js` builds and for the same reasons: it is addressable, it lays
 * out as one more column, and `grow()` re-adds it on every reroll because `grow()`
 * replaces `children` wholesale.
 *
 * ⚠ No `at` field, which is what keeps it out of the tree: `first()` and `place()` both
 *   filter on `at`, so a stable page is never counted as a generated one.
 */
export function gallery(host){
	return {
		name: "specs",
		title: "Spec gallery",
		label: "Spec gallery",
		icon: "bookmarks",

		// `full` — the ancestors collapse into the crumb strip and the wall gets the whole
		// host. Eight cards in a 40em column would be a list of stamps (rolls.js).
		width: "full",

		// ⚠ Every url in this module carries the generator's hash; a crumb without it
		//   reloads onto a different tree. `host.hash()` is the one place it is written.
		link(text){ return a.c("page-link", text ?? this.title).href(this.url + host.hash()); },

		column(){
			return div.c("page-gen page-gen-specs page-column-body", () => {

				div.c("page-column-head", () => {
					span.c("page-column-title", "Spec gallery");
					span.c("page-gen-rolls-count", `${SPECS.length} shapes worth keeping`);

					a.c("page-column-close", () => icon("close")).href(host.url + host.hash());
				});

				div.c("page-gen-cards", () => SPECS.forEach(entry => card(entry, host)));

				div.c("page-gen-rules", () => md("A seed is an address against one `MODEL`, and every model bump redraws every seed — so a tree worth keeping is kept as its **text**. These eight are that, written in the same five words the roller draws and the controls edit. Pick one and it becomes the tree; the address turns into `#s=<the text>`, which is a link you can send."));

			// ⚠ The width class is stamped by the `column()` this one REPLACES — core's own
			//   last line. Without it `full` is a field nobody reads and the wall renders in
			//   a 40em column (rolls.js learnt this one first).
			}).ac(this.width && "page-column-" + this.width);
		},
	};
}

/* ONE CARD — the sketch `rolls.js` already draws, plus the two things a roll cannot have:
   a name and a sentence saying what it is for.
   The href is real, so reload or middle-click lands on that spec; a click is handled here,
   because the generator is already built and only `pick()` regrows it. */
function card(entry, host){
	return a.c("page-gen-tile page-gen-card").href(host.url + "#s=" + encodeURIComponent(entry.spec))
		.click(event => { event.preventDefault(); host.pick(entry.spec); })
		.append(() => {
			div.c("page-gen-sketch", () => sketch(parse(entry.spec)));
			span.c("page-gen-card-name", entry.title);
			div.c("page-gen-card-note", () => md(entry.note));
		});
}

export default gallery;
