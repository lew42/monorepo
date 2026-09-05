import { Page, View, div, span, p, a, input, md, details, summary } from "/app.js";
import { wire } from "./stream.js";

View.stylesheet(import.meta, "stream.css");

/* STREAMING PAGES — a page whose content is edited in one tab and arrives, live, in
   every other tab. No reload, no polling, no new server code.

   THE WHOLE MECHANISM ALREADY EXISTED. `LiveReload.changed()` sends every `.jsonl`
   to `Tail` BEFORE it reaches the reload path, and `Tail` pushes appended lines to
   the sockets that subscribed. `ext/JSONL` replays them into object state. That is
   the AI board, and it is also this: put a page's STATE in the jsonl and the board's
   wire carries a page.

   So a stream is two files — a `.json` snapshot and a `.jsonl` of deltas — and one
   class, `stream.js`, that teaches `ext/JSONL` three verbs: set, del, append.

   Container: /imagine/'s column row. Size: `large` — prose and a card wall, nothing
   that wants the whole screen. Own layout: the flow, plus `previews()`. Regions: two.
   Preview: the default card.

   ⚠ 2026-09-05 UX PASS. The page's whole claim — edit in one tab, another tab redraws,
     no reload — used to be three sentences and a static "9 ms" number, and the only way
     to see it happen was to click into a child and open a second real tab yourself.
     Tried the owner's 3-column card (`hero()`): left a title, centre TWO independently
     subscribed windows on `data/wire.json` (not two tabs — two separate `Stream`
     instances, two separate sockets, same file — `ext/JSONL/live.js` names this exact
     case: "a path can have several readers"), right the live medians and the log's own
     byte count. Typing in the left window is now visible in the right one on THIS page,
     before a reader has opened anything else.

     KEPT, with a cost paid down: the hero card alone added ~400-500px (measured, both
     widths) with the old prose left in place beside it, so the two mechanism sections
     below the card ("What was already here", "On Cloudflare") — real depth, not fluff,
     but the SAME depth a reader can now get by pressing the hero card's own "open the
     full demo" link and reading `doc/decisions.md` — moved into the second disclosure,
     recovering most of it. See `doc/decisions.md` for the actual before/after numbers. */

export default new Page({
	meta: import.meta,
	title: "Stream",
	description: "A page edited in one tab, arriving live in every other. Deltas over the socket that already watched the file.",
	icon: "sensors",

	width: "large",
	// ⚠ `content()` already shows every child as a `previews()` wall below — without
	//   this, core repeats the same three links a second time as a plain rail
	//   underneath (found live 2026-09-04: a "Live wire / Streamed deck / Streaming
	//   blocks" text list sat right under the readme links, saying nothing new).
	index: true,

	children: ["wire", "deck", "blocks"],

	// Two SEPARATE readers of the same file — not the same instance shown twice.
	// `wire()` returns a fresh `Stream`, and `live.js`'s registry supports exactly
	// this (a board card and a task page reading the same log). Two real sockets,
	// two independent redraws — the closest a landing page can get to "two tabs"
	// without literally forcing one open for the reader.
	initialize(){
		this.heroA = wire("wire");
		this.heroB = wire("wire");
	},

	content(){
		this.hero();

		md(`Three fuller demos below — a live card, a streamed slide deck, a whole region
built from state. Each is editable in two REAL tabs, the same way the card above is
editable in its two panes.`);

		this.previews();

		md(`### The two files

A stream is a snapshot and a log, side by side in \`data/\`:`);

		// ⚠ Depth fix, 2026-09-04: this sample plus the prose around it pushed the page
		//   ~427px past one screen at 3440×1440 (measured by /imagine/paging/critique/,
		//   rank 14). The sample is the same two lines either way — folding it into a
		//   disclosure gets a reader to "What was already here" a whole screen sooner
		//   without deleting anything. Caveat: if a reader skips disclosures on sight,
		//   open it by default instead (`.attr("open", "")`).
		details.c("surface pad", () => {
			summary("wire.json · wire.jsonl — the two files, side by side");
			md(`\`\`\`
wire.json    { "headline": "…", "accent": "#FF6157" }
wire.jsonl   {"at":"…","op":"set","path":["headline"],"value":"…"}
\`\`\``);
		});

		md(`The \`.json\` is the state a cold window starts from; the \`.jsonl\` is one edit per line.
A tab fetches the snapshot once, then subscribes to the log. Every line that arrives is
replayed onto the state and the region redraws. Reload mid-stream and you get the snapshot
plus every delta since — the same state, arrived a different way.

**Compact** folds the log back into the snapshot and truncates it — the same state, arrived
at from a smaller pair of files. **Clear** is the other button: it throws the log away and
lets the old snapshot win.`);

		// ⚠ 2026-09-05: this was two open `###` sections (real depth — the append RPC,
		//   the Durable Object plan) sitting under a brand-new hero card that already
		//   costs ~450px on its own. Folded rather than cut, matching the sample above:
		//   the numbers stay one click away instead of costing every reader a scroll.
		details.c("surface pad", () => {
			summary("What was already here, and what a production deploy needs — the append RPC, Durable Objects");
			md(`Almost nothing had to be added to the server. \`Tail\` (the AI board) carries an
appended line back down to every window. The one thing genuinely missing was an **append**
RPC — an edit used to rewrite the whole log, so two windows writing at once lost each
other. It is wired now, and the difference is measured: **30 of 30 lines survive on
append, 11 of 30 on the whole-file write** ([the wire](/imagine/stream/doc/wire/)).

The dev server is the thing that decides what order edits happened in. In production the
site is static, so that job needs an owner: one **Durable Object per page url**, holding
the log and fanning it out over WebSockets. The client swaps one url and nothing else —
prices, limits and the gotchas are in [Durable Objects](/imagine/stream/doc/durable-objects/).`);
		});

		// ⚠ Trailing-slash urls, not `.md` — `Router` never intercepts a link ending in an
		//   extension, so a raw `./doc/wire.md` link used to fall through to a plain static
		//   fetch (200, `text/markdown`, no stylesheet, no way back to the site). `doc/page.js`
		//   is the shim that gives each note a real routed url (blogx/doc/page.js's pattern,
		//   copied here 2026-09-04).
		md(`[readme](./readme/) · [the wire](/imagine/stream/doc/wire/) · [Durable Objects](/imagine/stream/doc/durable-objects/) · [decisions](/imagine/stream/doc/decisions/)`);
	},

	/* THE 3-COLUMN CARD — left a title, centre the claim itself LIVE, right what it
	   measured. ⚠ No DOM after an await: the three boxes below are captured
	   synchronously; `hero_fill()` only ever fills them, from a `.then()`. */
	hero(){
		div.c("stream-hero surface", () => {
			div.c("stream-hero-intro flow", () => {
				span.c("stream-key", "live, right now");
				p.c("h4", "Two windows, one wire");
				p.c("stream-hero-blurb", "Type in the left window. The right one is a second, independent listener on the exact same file — its own socket, no shared code.");
				p.c("stream-hero-blurb muted", "A controlled run measured 9 ms median across 12 edits, two headless windows.");
				a.c("stream-hero-open").href("./wire/").text("open the full demo →");
			});

			div.c("stream-hero-stage", () => {
				div.c("stream-hero-windows", () => {
					div.c("stream-hero-window surface pad", () => {
						this.hero_bar();
						span.c("stream-hero-window-name", "window A — type here");

						const edit = value => this.heroA.push({ op: "set", path: ["headline"], value });
						this.$heroInput = input().attr("type", "text")
							.on("input", function(){ edit(this.el.value); });
					});

					div.c("stream-hero-window surface pad", () => {
						this.hero_bar();
						span.c("stream-hero-window-name", "window B — a second subscription");
						this.$heroMirror = div.c("stream-hero-mirror");
					});
				});
			});

			div.c("stream-hero-reads", () => {
				p.c("h4 muted", "measured, live");
				this.$heroReads = div.c("stream-hero-reads-list");
			});
		});

		this.heroStreaming ??= Promise.all([
			this.heroA.live(() => this.hero_changed(this.heroA)),
			this.heroB.live(() => this.hero_changed(this.heroB)),
		]);
		this.heroStreaming.then(() => this.hero_fill(true));
	},

	hero_bar(){ div.c("stream-hero-bar", () => [1, 2, 3].forEach(() => span.c("stream-hero-dot"))); },

	hero_changed(stream){
		stream.mark();
		this.hero_fill();
	},

	// ⚠ The input is NEVER refilled after the first frame — it is the one control on
	//   this card, and a control rebuilt (or reassigned) under a caret loses the caret.
	//   Window B has no control to lose: it is a plain mirror, redrawn every time.
	hero_fill(first){
		if (first) this.$heroInput?.attr("value", this.heroA.get(["headline"], ""));
		this.$heroMirror?.empty(() => span(this.heroB.get(["headline"], "Nothing yet — type on the left.")));
		this.$heroReads?.empty(() => this.hero_reads());
	},

	hero_reads(){
		const cell = (label, value) => div.c("stream-hero-read", () => {
			span.c("stream-key", label);
			span.c("stream-hero-read-n", value);
		});

		cell("window A redrew in", this.heroA.median() === null ? "—" : this.heroA.median() + " ms");
		cell("window B redrew in", this.heroB.median() === null ? "—" : this.heroB.median() + " ms");
		cell("the log, on disk", this.heroA.count().lines + " lines · " + this.heroA.count().bytes + " B");
	},
});
