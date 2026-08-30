import { div, span, button } from "/app.js";
import { Deck, region, quiet, statement, wall, list, notes, stack } from "/imagine/decks/deck.js";
import { wire } from "../stream.js";
import Socket from "/framework/dev/Socket/Socket.js";

/* A PRESENTATION, STREAMED. The deck machinery is /imagine/decks/ — its regions, its five
   content kinds, its screen. The only thing added is where the slide number lives: not in
   the url, in the stream.

   THAT IS THE WHOLE OF PRESENTER MODE. A url-driven deck makes every viewer navigate for
   themselves; a streamed one has ONE number that everybody reads, so a click in the
   presenter's window moves every window, and a viewer who arrives late lands on the slide
   the room is already looking at.

   ⚠ NO NAVIGATION AT ALL. Advancing appends a delta; the slice is redrawn in place. That
     is what lets a viewer follow without their history filling with slides, and it is why
     the probe can assert zero navigation events while the deck moves.

   ⚠ ONE stored keydown reference, and only the page you are ON may act — both learned in
     /imagine/screens/deck/ (2026-08-29, deck.js's `arrows`). Restated rather than reused
     because these keys push deltas instead of going to a url.

   Container: /imagine/'s column row. Size: `full` — a presentation replaces the row and
   its ancestors fold into the crumb strip. Own layout: decks' slice, one cut per slide.
   Regions: 1 to 3 per slide, plus the strip. Preview: the default card. */

const SLIDES = [
	{
		title: "Cover",
		build(){
			region(100, () => statement("streaming pages", "Edited here. Live there.",
				"A page whose state is an append-only log. One window writes a line; every other window has already drawn it."));
		},
	},
	{
		title: "Two files",
		build(){
			region(61.8, () => statement("One", "A snapshot and a log",
				"The snapshot is where a cold tab starts. The log is every edit since, one JSON object per line, appended and never rewritten."));

			quiet(38.2, () => stack(() => {
				list([
					{ name: "page.json", note: "the state you arrive on" },
					{ name: "page.jsonl", note: "{at, op, path, value} — one edit per line" },
					{ name: "set", note: "a value at a path" },
					{ name: "del", note: "remove it" },
					{ name: "append", note: "push onto a list" },
				]);
				notes(null, ["Reload and you get the snapshot plus every line since. Same state, different route to it."]);
			}));
		},
	},
	{
		title: "Already here",
		build(){
			region(100, () => statement("Two", "Nothing was added to the server",
				"The AI board has streamed .jsonl appends into open tabs since August. A page's state is just another log."));

			quiet(100, () => wall([
				{ k: "watch", name: "LiveReload", note: "routes every .jsonl to Tail before the reload path ever sees it." },
				{ k: "push", name: "Tail", note: "streams appended lines to the sockets that subscribed, from a byte offset." },
				{ k: "replay", name: "ext/JSONL", note: "replays lines into object state, and resumes from that offset." },
				{ k: "write", name: "rpc:write", note: "the editor's half. The one thing missing is an append." },
			]));
		},
	},
	{
		title: "Presenter mode",
		build(){
			region(70, () => statement("Three", "The slide number is state",
				"A url-driven deck makes every viewer navigate. A streamed deck has one number that every window reads — so a click here is a click everywhere, and there is nothing else to build."));

			quiet(30, () => notes("What it buys", [
				"A viewer who arrives late lands where the room is.",
				"No history full of slides, and no navigation event at all.",
				"The presenter is whoever clicked last. **Which is the honest limit** — there is no floor and no lock.",
			]));
		},
	},
	{
		title: "Cloudflare",
		build(){
			region(61.8, () => statement("Four", "One Durable Object per page",
				"The dev server's real job is deciding what order edits happened in. In production that job needs an owner: a single-threaded object per page url, holding the log and fanning it out."));

			quiet(38.2, () => stack(() => {
				list([
					{ name: "idFromName(url)", note: "one object per page — never one for the site" },
					{ name: "acceptWebSocket()", note: "hibernation: idle sockets bill nothing" },
					{ name: "storage.sql", note: "the log, with a row id as the resume cursor" },
					{ name: "the client", note: "swaps one url and nothing else" },
				]);
				notes(null, ["The numbers, the limits and the gotchas: [doc/durable-objects.md](../doc/durable-objects.md)."]);
			}));
		},
	},
];

export default new Deck({
	meta: import.meta,
	title: "Streamed deck",
	description: "The presenter drives the slide; every other window follows, with no navigation.",
	icon: "co_present",

	width: "full",

	/* ⚠ `Deck.preview()` draws `diagram(...this.shapes ?? [])`, so a Deck without this
	   renders an EMPTY white thumb on its parent's wall — which is what shipped for an
	   hour (seen in the shot, 2026-08-30). Two frames: a cover, then a claim beside its
	   list — the two cuts this deck actually uses. */
	shapes: ["1:s", "62:s 38:l"],

	initialize(){
		this.stream = wire("deck");
		this.who = Socket.singleton().tab();
	},

	// ⚠ Deck's own `column()` is url-driven — this one is state-driven, so it is replaced
	//   rather than extended. The screen and the slice are still decks' classes and CSS.
	column(host){
		return div.c("page-column-body decks-screen stream-deck", () => {
			this.$slice = div.c("decks-slice decks-advance").click(event => {
				if (!event.target.closest("a, button")) this.go(1);
			});

			this.$bar = div.c("stream-bar");

			this.streaming ??= this.stream.live(() => this.changed());
			this.streaming.then(() => this.draw());
		}).ac("page-column-full");
	},

	changed(){
		this.draw();
		this.stream.mark();
	},

	draw(){
		const i = this.at();

		this.$slice?.empty(() => SLIDES[i].build());
		this.$bar?.empty(() => this.bar(i));
	},

	// ⚠ Clamped on the way OUT, never on the way in — a delta written by a window that
	//   knew about six slides must not break a window that knows about five.
	at(){
		const i = Number(this.stream.get(["slide"], 0));
		return Number.isInteger(i) && SLIDES[i] ? i : 0;
	},

	go(step){ return this.to(Math.min(SLIDES.length - 1, Math.max(0, this.at() + step))); },

	to(i){
		return this.stream.push(
			{ op: "set", path: ["slide"], value: i },
			{ op: "set", path: ["by"], value: this.who });
	},

	bar(i){
		const driving = this.stream.get(["by"]) === this.who;

		button("Back").click(() => this.go(-1));

		SLIDES.forEach((slide, n) => span.c("stream-dot")
			.ac(n === i && "stream-on").attr("title", slide.title)
			.append(String(n + 1))
			.click(() => this.to(n)));

		button("Next").click(() => this.go(1));

		span.c("stream-live-badge", driving || !this.stream.get(["by"])
			? "you are driving"
			: "following " + this.stream.get(["by"]) + " · " + (this.stream.median() ?? "—") + "ms");
	},

	/* ⚠ ONE reference, kept on the page — a fresh arrow function per visit leaves a
	   listener behind. ⚠ Only the page you are on may act: a deck you left is still in
	   memory and would answer an arrow key on top of whatever you went to. */
	activated(){
		this.keys ??= event => {
			if (location.pathname !== this.url) return;

			const step = { ArrowRight: 1, ArrowLeft: -1, " ": 1 }[event.key];
			if (step) this.go(step);
		};
		addEventListener("keydown", this.keys);
	},

	deactivated(){ removeEventListener("keydown", this.keys); },
});
