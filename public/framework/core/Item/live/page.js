import { Page, div, p, button, pre, span } from "/app.js";

/* THE DEMO: a page's own `content` — a real `List` of `Item`s, saved to a real
   file, drawn with the one reusable view (`Page.render_content_list()`, Page.class.js).
   `/framework/core/Item/` is the data model; this is the SAME thing, live, on a page
   you can click around on. doc: core/Item/page.js "See it saved".

   ⚠ `render_content(){…}` here, NOT `content(){…}`. `content` is the legacy render
     slot (a function/string/address/View, untouched) — a page cannot use THAT name
     for its own render method and ALSO have `page.content` be the live list, because
     both would fight over the one property name. Overriding `render_content()`
     instead (an ordinary page.js override, the same shape `content()`/`preview()`
     already use elsewhere) keeps the two meanings apart: `page.content` stays pure
     data, and this method decides what the page shows for it. */

// Seeded fresh every time the demo's own "Reset" button is pressed — the same four
// rows committed in demo.jsonl, so a reader who has dragged everything around can
// always get back to a known start.
const SEEDS = [
	{ id: "r1", text: "Coffee" },
	{ id: "r2", text: "Toast" },
	{ id: "r3", text: "Eggs" },
	{ id: "r4", text: "Juice" },
];

export default new Page({
	meta: import.meta,
	title: "Live list",
	description: "A page's own content, as a List of Items, saved to a real file — drag, add or sort, then reload: the list comes back.",
	icon: "reorder",
	width: "large",

	// ⚠ ASYNC on purpose: `page.file(name)` called from CODE (not a replayed line)
	//   returns a Promise<FsFile> (Log.js, deliverable 4/11) — core never statically
	//   imports ext/filesystem, so the file class arrives by dynamic import either way.
	//   `ensure_content()` runs FIRST, synchronously, before the first `await` — so
	//   `page.content` is already a (still empty) List by the time `render()`
	//   runs, moments later; the four seed rows pop in when the file finishes
	//   loading, through the same "add" events the UI already listens for.
	async initialize(){
		this.ensure_content();

		const file = await this.file("demo.jsonl");
		this.file_store = file.store;             // Item.Store.for(url) — one per file
		await this.file_store.open();              // actually fetches/streams demo.jsonl's lines into it
		this.file_store.attach(this.content);      // a List IS Events + has set() — a valid Store host

		// The raw text, read once at load, seeds the "last lines" panel below with
		// everything that was already in the file. `content`'s own "delta" event
		// (render_content(), below) covers everything AFTER — a live line as it lands.
		this.raw_lines = (await file.read().catch(() => "")).trim().split("\n").filter(Boolean);
		this.redraw_log?.();
	},

	render_content(){
		// ⚠ `.wide` — a direct child of `.page` escapes the 40em reading column
		//   (Page.css's `.page > .wide { grid-column: wide; }`) into the fuller grid
		//   track. Without it this whole demo — rows, buttons AND the tail — was
		//   squeezed into a 40em prose column regardless of viewport width, which is
		//   why the buttons wrapped and 80% of a 1920 screen sat empty (task-mastermind
		//   review, 2026-10-02): the viewport was never the constraint, the reading
		//   cap was.
		const $page = div.c("flex wrap gap page-content-live wide", () => {

			div.c("flex v gap page-content-rows-col", $col => {
				p.c("page-content-lede", "Drag, add or sort, then reload: the list comes back. Open this page in a second tab: it follows.");

				if (this.file_store && !this.file_store.writable)
					p.c("muted", "Off localhost: this loads the file once, but nothing you do here is saved — there is no server to write it to.");

				// `flex-wrap: wrap` here is a SAFETY NET, not the plan: the CSS groups
				// these four in pairs under its own narrow-width rule (page-content-live
				// wide, Page.css), so a wrap at 400 lands two-and-two on purpose, never
				// one button stranded alone.
				div.c("flex gap page-content-buttons", () => {
					button("Add").on("click", () => {
						this.content.add({ text: "Row " + (this.content.length + 1) });
					});
					button("Sort A→Z").on("click", () => {
						const ids = [...this.content].map(i => i.id)
							.sort((a, b) => String(this.content.find(a).get("text")).localeCompare(this.content.find(b).get("text")));
						this.content.order(ids);
					});
					button("Reverse").on("click", () => {
						this.content.order([...this.content].map(i => i.id).reverse());
					});
					button("Reset").on("click", () => {
						// One synchronous batch — every remove and add below queues its own
						// line, and Item.Store's writer flushes the whole tick in ONE Append
						// call (page-item-design.md's batching rule), so this is one write.
						[...this.content].forEach(item => this.content.remove(item.id));
						SEEDS.forEach(seed => this.content.add({ ...seed }));
					});
				});

				$col.append(() => this.render_content_list());
			});

			div.c("flex v gap page-content-tail-col", $side => {
				span.c("h4 muted", "demo.jsonl — last lines");

				// One row per LINE, truncated with an ellipsis rather than wrapped —
				// a jsonl line reads as one thing, and breaking it mid-word (the old
				// `pre` + `word-break: break-all`) made it unreadable. The code font
				// and colour are the site's own (`pre`'s default `--code-ink` on
				// `--code-bg` — this box no longer overrides either, which is also
				// what was making it nearly invisible: a light `--code-ink` meant for
				// a dark code background, left on a light one).
				this.$tail = div.c("page-content-tail");
				this.redraw_log = () => this.$tail?.empty(() => {
					const lines = (this.raw_lines ?? []).slice(-8);
					if (!lines.length) return void p.c("muted", "(empty)");
					lines.forEach(line => pre.c("page-content-tail-line", line));
				});
				this.redraw_log();
			});
		});

		// Every live line lands here — the viewer SEES one line per change: this tab's
		// own changes, and (replayed through the tail) another tab's. Only the load's
		// replay is skipped: until `raw_lines` is seeded (initialize(), above, reads
		// the whole file once), a replayed line is history the seed already holds.
		// The Store drops its own echo, so a replay after that is another tab's line.
		this.content.on("delta", line => {
			if (this.file_store?.replaying && !this.raw_lines) return;
			this.raw_lines = [...(this.raw_lines ?? []), JSON.stringify(line)];
			this.redraw_log();
		});

		return $page;
	},
});
