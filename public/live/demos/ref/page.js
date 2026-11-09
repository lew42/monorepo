import { Page, md, div, h3, h4, p, button, pre, code } from "/app.js";
import Item from "/framework/core/Item/Item.js";
import RefView from "/framework/core/Item/RefView.js";

// One item, two places. List A owns it; List B holds a Ref to it (core/Item/doc/ref.md) — a pointer, never a copy.
// Today's `add()` (List.js, flipped 2026-11-09) makes that Ref itself: `root.b.add(shared)` below needs no `.ref()` call.
const root = Item.hydrate({ id: "ref-demo", a: [{ id: "shared", title: "One source of truth" }], b: [] });
const shared = root.a.find("shared");
const ref = root.b.add(shared);
// Resolved up front, at module load (top-level await; the Router already awaits the whole module): a same-file Ref
// resolves on the very next microtask, before the page's own content() builds its DOM — RefView's own lazy resolve()
// would otherwise fire its "target" event before the row is attached to the document and never redraw (RefView.js,
// `this.drawn && !this.el.isConnected` bails and unsubscribes). Pre-resolving means `ref.target` is already known by
// the time `new RefView({ref})` runs, so its FIRST draw already shows the real row — no race, no missed event.
await ref.resolve();

const TITLES = ["One source of truth", "Edited from List A", "Still the same item", "Changed again, still one item"];
let i = 0;

export default new Page({
	meta: import.meta,
	title: "Ref demo",
	description: "One item, two places: edit the title in List A and List B's Ref shows the change, no reload.",
	icon: "link",
	content(){
		md("**One item, two places.** List A owns the item below; List B holds a [Ref](/framework/core/Item/doc/ref.md) to it — a pointer, never a copy. Press the button and watch BOTH cards change, because List B reads THROUGH the Ref to the same item, not a snapshot of it.");
		let $titleA;
		div.c("flex gap auto ref-demo-row", () => {
			div.c("card pad flow ref-demo-card", () => {
				h3("List A — owns the item");
				$titleA = p.c("ref-demo-title", shared.get_one("title"));
				button.c("btn prim").text("Edit the title").attr("type", "button").click(() => {
					shared.set({ title: TITLES[++i % TITLES.length] });
				});
			});
			div.c("card pad flow ref-demo-card", () => {
				h3("List B — holds a Ref");
				new RefView({ ref });   // already resolved (above); redraws live on the Ref's own "target" event if the target ever changes again
				const stored = ref.toJSON();
				p.c("muted ref-demo-source").text("what List B actually stores:");
				pre(() => code(JSON.stringify({ type: stored.type, ...stored.data }))).attr("style", "white-space: pre-wrap; word-break: break-word");
			});
		});
		// List A's own title redraws from the item it owns, directly; List B above redraws from the Ref, through resolve()
		// and the "target" event — two different paths to the same change, so the demo proves the Ref, not just the item.
		shared.on("change", (key, value) => { if (key === "title") $titleA.text(value); });

		div.c("card pad flow", () => {
			h4("How it works");
			pre(() => code(`b.add(x)      // x already lives in a → b gets a Ref, a keeps x\nx.move_to(b)  // the real move`)).attr("style", "white-space: pre-wrap; word-break: break-word");
			md("[core/Item/doc/ref.md](/framework/core/Item/doc/ref.md) — what a Ref is and how it resolves.");
		});
	},
});
