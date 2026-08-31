import { Page, div, p, span, input, select, option, button, label, md } from "/app.js";
import { wire } from "../stream.js";
import Socket from "/framework/dev/Socket/Socket.js";

/* THE LIVE WIRE — the smallest honest proof. Two windows on this url: type in one, and
   the panel in the other changes. Nothing reloads and nothing navigates.

   ⚠ THE EDITOR IS ALSO A VIEWER. `push()` writes the file and stops — the delta comes
     back off the socket like everyone else's, and only then does anything redraw. So
     the number below is the same number in both windows, and there is one code path
     instead of an optimistic one and a real one.

   ⚠ The inputs are NEVER redrawn from state. An input rebuilt under a caret loses the
     caret; only `$live` and `$stat` are emptied.

   ⚠ `mark()` sits BETWEEN the two redraws — after the panel (the streamed content) and
     before the readout (instrumentation). Marking on the first frame would time a
     delta that was written yesterday and replayed.

   Container: /imagine/'s column row. Size: `fill` — the two panes take whatever the row
   has left, because the point of the right-hand one is that a WIDTH arrives over the wire
   and a pane narrower than the widths on offer would demonstrate nothing (measured: at
   `large` the live pane was 296px and only two of the four words bit). Own layout: a
   basis pair — a 16em control rail and a growing live pane, wrapping at 400. Regions:
   three (status, editor, live). Preview: the default card. */

export default new Page({
	meta: import.meta,
	title: "Live wire",
	description: "Type in one window, watch another window change. The latency is measured, not claimed.",
	icon: "cable",

	width: "fill",

	initialize(){
		this.stream = wire("wire");

		// A stable name for THIS window, so the panel can say where an edit came from.
		this.who = Socket.singleton().tab();
	},

	content(){
		this.$stat = div.c("stream-stat");

		div.c("stream-panes", () => {
			this.$editor = div.c("stream-editor surface pad flex v gap");
			this.$live = div.c("stream-live surface pad");
		});

		md(`Every control appends one line to [\`data/wire.jsonl\`](../data/wire.jsonl) and does
nothing else. The panel is drawn from the state that line produced, *after* the server
sent it back — which is why the same number appears in both windows.`);

		/* ⚠ Subscribed once per instance, redrawn on every visit — a second `live()` on
		   the same reader would park a second subscription on the same file. ⚠ Nothing
		   after this may build DOM: the boxes above are already captured, and `empty()`
		   re-establishes its own captor when the answer arrives. */
		this.streaming ??= this.stream.live(() => this.changed());
		this.streaming.then(() => this.draw(true));
	},

	changed(){
		this.draw();
		this.stream.mark();
		this.$stat?.empty(() => this.stat());
	},

	/* ⚠ `fill` ONLY on the first frame. The controls are filled from state once the state
	   has arrived — building them inside `content()` filled them from an empty object and
	   a cold window showed blank fields beside a full card (seen in the shot, 2026-08-30).
	   After that they are left alone: a control rebuilt under a caret loses the caret, and
	   a picker that moves under your hand is worse than one that is briefly stale. */
	draw(fill){
		this.$live?.empty(() => this.panel());
		this.$stat?.empty(() => this.stat());

		if (fill) this.$editor?.empty(() => this.editor());
	},

	// The state, drawn. Three kinds of value — text, a colour token, a size word —
	// because "anything on a page" has to mean more than a string.
	panel(){
		const s = this.stream;

		div.c("stream-card")
			.style("--stream-accent", s.get(["accent"], "#FF6157"))
			.style("--stream-measure", s.get(["measure"], "20em"))
			.append(() => {
				div.c("stream-card-head", s.get(["headline"], "Nothing yet"));
				p.c("stream-card-body", s.get(["body"], "Type in the other window."));
			});

		div.c("stream-from", () => {
			span.c("stream-key", "last edit from");
			span(s.get(["by"], "—") + (s.get(["by"]) === this.who ? " (this window)" : ""));
		});
	},

	stat(){
		const s = this.stream;
		const cell = (key, value) => div.c("stream-cell", () => {
			span.c("stream-key", key);
			span.c("stream-value", String(value));
		});

		cell("this window", this.who);
		cell("deltas", s.lags.length);
		cell("last", s.lags.length ? s.lags.at(-1) + "ms" : "—");
		cell("median", s.median() === null ? "—" : s.median() + "ms");
		cell("log", s.count().lines + " lines · " + s.count().bytes + "B");
	},

	/* COMPACTION, ON A BUTTON — never a timer. The replayed state is written to
	   `wire.json` and only then is `wire.jsonl` truncated, so both windows land on the
	   same state with nothing left to replay. The counts before and after are the whole
	   argument for keeping two files instead of one. */
	async compact(){
		const done = await this.stream.compact();

		this.say(done.ok
			? `compacted — wire.jsonl ${done.lines} lines / ${done.bytes} B → 0 / 0, folded into `
				+ `wire.json (${done.snapshot} B). Same state; every window re-read the snapshot.`
			: "the server refused the snapshot write — nothing was truncated.");
	},

	say(msg){ this.$said?.text(msg); },

	// ⚠ Built once, into a box `content()` already captured — see `draw()`.
	editor(){
		const s = this.stream;
		const edit = (path, value) => s.push(
			{ op: "set", path, value },
			{ op: "set", path: ["by"], value: this.who });

		// ⚠ No wrapper — the captor here IS `$editor`, which already wears `flex v gap`.
		//   A `div()` around these would make them one flex item and the gaps would vanish.
		label.c("stream-field", () => {
			span.c("stream-key", "headline");
			input().attr("type", "text").attr("value", s.get(["headline"], ""))
				.on("input", function(){ edit(["headline"], this.el.value); });
		});

		label.c("stream-field", () => {
			span.c("stream-key", "body");
			input().attr("type", "text").attr("value", s.get(["body"], ""))
				.on("input", function(){ edit(["body"], this.el.value); });
		});

		div.c("stream-row flex gap", () => {
			label.c("stream-field", () => {
				span.c("stream-key", "accent");
				input().attr("type", "color").attr("value", s.get(["accent"], "#FF6157"))
					.on("input", function(){ edit(["accent"], this.el.value); });
			});

			label.c("stream-field", () => {
				span.c("stream-key", "width");
				select(() => ["14em", "20em", "28em", "40em"].forEach(w =>
					option(w).attr("value", w).attr("selected", w === s.get(["measure"]) ? "" : null)))
					.on("change", function(){ edit(["measure"], this.el.value); });
			});
		});

		// The pair, side by side: one keeps the state, the other throws it away.
		div.c("flex gap wrap v-center", () => {
			button("Compact").ac("prim").click(() => this.compact());
			button("Clear the log").click(() => s.clear());
		});

		this.$said = p.c("muted");
	},
});
