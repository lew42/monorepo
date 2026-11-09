import { Page, md, div, h3, h4, p, button, span, pre, code } from "/app.js";
import Item from "/framework/core/Item/Item.js";

// One item, two places. List A owns it; List B holds a Ref to it (core/Item/doc/ref.md) — a pointer, never a copy.
// Today's `add()` (List.js, flipped 2026-11-09) makes that Ref itself: `root.b.add(shared)` below needs no `.ref()` call.
const root = Item.hydrate({ id: "ref-demo", a: [{ id: "shared", title: "One source of truth" }], b: [] });
const shared = root.a.find("shared");
const ref = root.b.add(shared);

const TITLES = ["One source of truth", "Edited from List A", "Still the same item", "Changed again, still one item"];
let i = 0;

export default new Page({
	meta: import.meta,
	title: "Ref demo",
	description: "One item, two places: edit the title in List A and List B's Ref shows the change, no reload.",
	icon: "link",
	content(){
		md("**One item, two places.** List A owns the item below; List B holds a [Ref](/framework/core/Item/doc/ref.md) to it — a pointer, never a copy. Press the button and watch BOTH cards change, because List B is reading the same item, not a snapshot of it.");
		let $titleA, $titleB;
		div.c("flex gap wrap ref-demo-row", () => {
			div.c("card pad flow ref-demo-card", () => {
				h3("List A — owns the item");
				$titleA = p.c("ref-demo-title", shared.get_one("title"));
				button.c("btn prim").text("Edit the title").attr("type", "button").click(() => {
					shared.set({ title: TITLES[++i % TITLES.length] });
				});
			});
			div.c("card pad flow ref-demo-card", () => {
				h3("List B — holds a Ref");
				$titleB = p.c("ref-demo-title", shared.get_one("title"));
				p.c("muted ref-demo-source", `Ref → list A / ${shared.id}`);
			});
		});
		// Live: shared.set() emits "change" on the item itself; both titles are the same text, read fresh each time.
		shared.on("change", (key, value) => { if (key === "title"){ $titleA.text(value); $titleB.text(value); } });
		// The real Ref API too (core/Item/doc/ref.md): resolving it and listening to "target" is how a page that only
		// HOLDS the Ref (never the original item) would stay live — proven here against the same button.
		ref.resolve().catch(() => {});

		div.c("card pad flow", () => {
			h4("How it works");
			pre(() => code(`b.add(x)      // x already lives in a → b gets a Ref, a keeps x\nx.move_to(b)  // the real move`));
			md("[core/Item/doc/ref.md](/framework/core/Item/doc/ref.md) — what a Ref is and how it resolves.");
		});
	},
});
