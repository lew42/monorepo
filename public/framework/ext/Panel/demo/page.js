import { Page, div, span, md } from "/app.js";
import panel, { Panel } from "../workspace.js";
import { scrubber, attach } from "../flow.js";

/* Twelve small workspaces — a guide beside a follow-along, one per UX gesture. Reuses
   Doc's OWN child-tab mechanism rather than inventing a second rail: `render()` below is
   the exact shape ext/Doc/Doc.js draws for its api/doc/files sections
   (`div.c("page doc-section", () => this.tabs().ac("vertical"))`) — a member rail, here
   listing demos instead of methods. `children:` is this page's own list, in nav order.

   Each pane is `panel(seed)` inside `pad wash` — a bounded, inset space rather than a
   workspace running edge to edge, "the page's own words" until a Workspace class (task
   B, 2026-08-19) owns this as an option. LEFT loads a recorded flow (`flow.js`'s
   `attach()`) and shows the scrubber, recording OFF; RIGHT is the same starting point,
   recording ON — `panel()`'s own `mount()` already attaches a live flow to every call, so
   the follow-along needs nothing extra. Flows recorded once, headless, into
   `flows/*.json` — doc/flow.md. */

const leaf = (data = {}) => new Panel({ data: { tone: "surface", ...data } });
const row = (...kids) => new Panel({ data: { dir: "row" } }).add(...kids);

/* ⚠ No `--panel-height` (2026-08-19). A pane HUGS — it is exactly as tall as the arrangement
   in it and grows as the reader splits, adds and rolls, instead of scrolling inside a 20em
   window. `panel.css`'s `.panel-workspace { height: var(--panel-height, auto) }` is the whole
   mechanism, and `--panel-min` keeps a blank starting leaf a box you can aim at. If one demo
   ever needs a starting height it says so on its own entry, never here. doc/sizing.md. */
const pane = seed => { let $ws; div.c("pad wash", () => { $ws = panel(seed).style("border", "1px solid var(--line)"); }); return $ws; };

function entry({ title, note, seed, file }){
	return {
		title, note, seed, file,

		content(){
			md(this.note);

			let $left;
			div.c("flex gap auto", () => {
				$left = div.c("flex v gap");
				// `Flow.mounted` is a document-wide array a busy SPA keeps rewriting from
				// every ancestor preview's own panels — this element IS the stable handle,
				// so a headless driver reads its flow straight off it rather than racing
				// that array (`.el.flow`, alongside the View's own `.flow`).
				const $r = pane(this.seed());
				$r.el.flow = $r.flow;
			}).ac("bleed").style({ "--gap": "1.5em", "--column": "24em" });

			// The box is placed now; the flow fills it once the JSON arrives. A missing
			// file (not recorded yet) is not an error — `r.ok` says so before anything
			// tries to parse the 404 page as JSON.
			fetch(new URL(`./flows/${this.file}.json`, import.meta.url)).then(r => r.ok ? r.json() : null)
				.then(steps => {
					$left.empty(() => {
						if (!steps) return void span.c("muted", "Flow not recorded yet.");
						const $guide = pane(this.seed());
						attach($guide.flow.root, $guide, { steps });
						$guide.el.flow = $guide.flow;
						scrubber($guide);
					});
				})
				.catch(error => {
					console.error(`demo ${this.file}: recorded flow failed to load`, error);
					$left.empty(() => { span.c("muted", "Flow not recorded yet."); });
				});
		},
	};
}

export default new Page({
	meta: import.meta,
	title: "Demo",
	description: "Twelve small workspaces, each a recorded guide beside a fresh one to follow along on.",
	icon: "school",

	children: [
		entry({ title: "A flex box, from scratch", file: "1-flex-scratch", seed: () => leaf(),
			note: "Open **Display** and pick `flex` — nothing changes yet, a blank leaf has one box. Open **Template** and pick `cells`: twelve boxes, direct children, now arranged by whatever `gap`, `wrap` and `justify` you pick next." }),

		entry({ title: "A grid, from scratch", file: "2-grid-scratch", seed: () => leaf(),
			note: "Open **Display** and pick `grid`. Open **Template** and pick `cells` for something to arrange. Pick a `cols` count, a `gap`, then flip `dense` on and watch the boxes repack the gaps left behind." }),

		entry({ title: "Split a panel", file: "3-split", seed: () => leaf({ template: "rail" }),
			note: "Click an **edge** of the panel — top, right, bottom or left. A ghost preview follows your pointer and flips sides at the midline. Click again anywhere to commit it, `Escape` to drop it." }),

		entry({ title: "Add a column, then a row", file: "4-column-row", seed: () => leaf({ template: "rail" }),
			note: "Split the right edge for two columns. Split that **same edge** again — the parent already runs that way, so the second click adds a third column instead of nesting. Split an edge across the grain for a row inside one." }),

		entry({ title: "Resize a seam", file: "5-resize-seam", seed: () => row(leaf({ template: "rail" }), leaf({ template: "rail" })),
			note: "Drag the **seam** between the two panels. It writes a ratio — `grow` on both sides — never a fixed width, so the split still divides evenly if the window resizes." }),

		entry({ title: "Fill, hug, fixed", file: "6-fill-hug-fixed", seed: () => row(leaf({ template: "rail" }), leaf({ template: "hero" })),
			note: "Open the left panel's **Width** trigger. Pick `hug` — it shrinks to its content and the rail's neighbour takes the rest. Pick `16em` for a fixed length instead; either way the sibling fills what remains." }),

		entry({ title: "Document mode: sections and scrolling", file: "7-document-mode", seed: () => leaf({ template: "rail" }),
			note: "Open the panel's **mode** trigger, top-left of the bar, and pick `document`: one screen becomes a scrolling stack of sections. Split an edge now and it **appends** a new section instead of halving the height." }),

		entry({ title: "Swap content", file: "8-swap-content", seed: () => leaf(),
			note: "Open **Template** and pick any name — the box redraws as that section, live. Open **tone** beside it and pick a colour; every template tints itself from the same word." }),

		entry({ title: "Roll a layout", file: "9-roll-layout", seed: () => leaf(),
			note: "Click the dashboard icon on the bar — `sow` rolls a whole arrangement of real, draggable panels from one random seed, the same seed [`space`](/framework/styles/layouts/space/) draws as a picture." }),

		entry({ title: "Drag a panel", file: "10-drag-panel", seed: () => row(leaf({ template: "rail" }), leaf({ template: "rail" }), leaf({ template: "rail" })),
			note: "Grab a panel's **handle**, top-left of its bar, and drop it near another panel's **edge** to land beside it, or in its **centre** to nest inside it — the target becomes a container holding both." }),

		entry({ title: "Close and absorb", file: "11-close-absorb", seed: () => row(leaf({ template: "rail" }), leaf({ template: "rail" }), leaf({ template: "rail" })),
			note: "Click **close** (`×`) at the end of a panel's bar. Close a second one and the parent, down to one child, **absorbs** it automatically — the split disappears and the survivor takes its place in the row." }),

		entry({ title: "The flow scrubber itself", file: "12-scrubber", seed: () => leaf({ template: "rail" }),
			note: "Split right, then right again for three columns. Step **back** to the first split, then split across the grain — building from a stepped-back frame drops the steps ahead of it and carries on from there, which is exactly how this flow was made." }),
	],

	render(){
		return this.view ??= div.c("page doc-section", () => this.tabs().ac("vertical")).ac("page-" + this.name);
	},
});
