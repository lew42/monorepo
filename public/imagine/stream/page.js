import { Page, View, md, details, summary } from "/app.js";

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
   Preview: the default card. */

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

	content(){
		md(`**Open any page below in two windows.** Edit in one; the other changes while you
watch it, with no reload and no navigation. The number on each page is real — it is
measured from the moment the edit was appended to the moment the *other* tab had redrawn.
**9 ms**, median of 12, two headless windows on one machine.`);

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
lets the old snapshot win.

### What was already here, and the one thing that was missing

Almost nothing had to be added to the server. \`Tail\` (the AI board) carries an appended
line back down to every window. The one thing genuinely missing was an **append** RPC — an
edit used to rewrite the whole log, so two windows writing at once lost each other. It is
wired now, and the difference is measured: **30 of 30 lines survive on append, 11 of 30 on
the whole-file write** ([the wire](/imagine/stream/doc/wire/)).

### On Cloudflare

The dev server is the thing that decides what order edits happened in. In production the
site is static, so that job needs an owner: one **Durable Object per page url**, holding the
log and fanning it out over WebSockets. The client swaps one url and nothing else — prices,
limits and the gotchas are in [Durable Objects](/imagine/stream/doc/durable-objects/).`);

		// ⚠ Trailing-slash urls, not `.md` — `Router` never intercepts a link ending in an
		//   extension, so a raw `./doc/wire.md` link used to fall through to a plain static
		//   fetch (200, `text/markdown`, no stylesheet, no way back to the site). `doc/page.js`
		//   is the shim that gives each note a real routed url (blogx/doc/page.js's pattern,
		//   copied here 2026-09-04).
		md(`[readme](./readme/) · [the wire](/imagine/stream/doc/wire/) · [Durable Objects](/imagine/stream/doc/durable-objects/) · [decisions](/imagine/stream/doc/decisions/)`);
	},
});
