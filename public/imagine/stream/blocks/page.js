import { Page, div, span, input, select, option, button, label, textarea, md } from "/app.js";
import { wire } from "../stream.js";
import Socket from "/framework/dev/Socket/Socket.js";

/* STREAMING UI EDIT — one region, and everything in it arrives over the wire.

   THE CLAIM, HONESTLY SCOPED. "Anything on a page" is as true as the delta contract is
   wide, and the contract carries JSON at a path. So three kinds are demonstrated, because
   between them they are what a page is made of:

     prose      a markdown block            set  ["blocks", 2, "text"]
     a token    the accent colour           set  ["accent"]
     a word     the region's own measure    set  ["measure"]

   and the LIST itself, which is the fourth kind: `append` adds a block and `del` removes
   one, so the region's structure streams too, not only its values.

   WHAT IT CANNOT CARRY: behaviour. A delta is data, so a streamed page can change what it
   says, what colour it is and how wide it sits — but a new interaction is still a new
   `page.js` and still a reload. That line is where "anything on a page" actually stops
   (doc/decisions.md).

   ⚠ The textareas are rebuilt only when the block COUNT changes, never on a text delta —
     a control rebuilt under a caret loses the caret. The cost is that two windows editing
     the SAME block do not see each other's letters until one of them reloads. Last writer
     wins, per field, and there is no merge here (doc/decisions.md).

   Container: /imagine/'s column row. Size: `fill` — the region has to be wider than the
   widths it is offered, or the size word streams and nothing moves (`large` gave it 296px
   and two of the four options were dead). Own layout: a basis pair — a 16em control rail
   and a growing region, wrapping at 400. Regions: three. Preview: the default card. */

export default new Page({
	meta: import.meta,
	title: "Streaming blocks",
	description: "Prose, a colour token, a size word and the block list itself — all edited live over the same wire.",
	icon: "view_agenda",

	width: "fill",

	initialize(){
		this.stream = wire("blocks");
		this.who = Socket.singleton().tab();
	},

	content(){
		this.$stat = div.c("stream-stat");

		div.c("stream-panes", () => {
			this.$editor = div.c("stream-editor surface pad flex v gap");
			this.$live = div.c("stream-live surface pad");
		});

		md(`The pane on the right is a region built entirely from state. Add a block in one
window and it appears in the other; change the accent and both change. What does **not**
stream is behaviour — see [\`doc/decisions.md\`](../doc/decisions.md).`);

		this.streaming ??= this.stream.live(() => this.changed());
		this.streaming.then(() => this.draw(true));
	},

	changed(){
		this.draw();
		this.stream.mark();
		this.$stat?.empty(() => this.stat());
	},

	// ⚠ `force` on the first frame only. After that the editor is rebuilt when the number
	//   of blocks changed, which is the one case a stale control would be wrong about.
	draw(force){
		const blocks = this.stream.get(["blocks"], []);

		this.$live?.empty(() => this.region(blocks));

		if (force || blocks.length !== this.count){
			this.count = blocks.length;
			this.$editor?.empty(() => this.editor(blocks));
		}

		this.$stat?.empty(() => this.stat());
	},

	// THE REGION. Two tokens set from state, and a block per entry — no class per value.
	region(blocks){
		div.c("stream-region flex v gap")
			.style("--stream-accent", this.stream.get(["accent"], "#FF6157"))
			.style("--stream-measure", this.stream.get(["measure"], "34em"))
			.append(() => {
				if (!blocks.length) return div.c("stream-block", "No blocks. Add one.");
				blocks.forEach(block => div.c("stream-block", () => md(String(block?.text ?? ""))));
			});
	},

	editor(blocks){
		const s = this.stream;
		const edit = (...ops) => s.push(...ops, { op: "set", path: ["by"], value: this.who });

		blocks.forEach((block, i) => label.c("stream-field", () => {
			span.c("stream-key", "block " + (i + 1));

			textarea(String(block?.text ?? "")).attr("rows", "3")
				.on("input", function(){ edit({ op: "set", path: ["blocks", i, "text"], value: this.el.value }); });

			button("Remove").click(() => edit({ op: "del", path: ["blocks", i] }));
		}));

		button("Add a block").click(() => edit(
			{ op: "append", path: ["blocks"], value: { text: "A new block, appended over the wire." } }));

		div.c("stream-row flex gap", () => {
			label.c("stream-field", () => {
				span.c("stream-key", "accent");
				input().attr("type", "color").attr("value", s.get(["accent"], "#FF6157"))
					.on("input", function(){ edit({ op: "set", path: ["accent"], value: this.el.value }); });
			});

			label.c("stream-field", () => {
				span.c("stream-key", "measure");
				select(() => ["20em", "27em", "34em", "48em"].forEach(w =>
					option(w).attr("value", w).attr("selected", w === s.get(["measure"]) ? "" : null)))
					.on("change", function(){ edit({ op: "set", path: ["measure"], value: this.el.value }); });
			});
		});

		button("Clear the log").click(() => s.clear());
	},

	stat(){
		const s = this.stream;
		const cell = (key, value) => div.c("stream-cell", () => {
			span.c("stream-key", key);
			span.c("stream-value", String(value));
		});

		cell("this window", this.who);
		cell("blocks", s.get(["blocks"], []).length);
		cell("deltas", s.lags.length);
		cell("median", s.median() === null ? "—" : s.median() + "ms");
	},
});
