import { Page, View, md } from "/app.js";

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

	children: ["wire", "deck", "blocks"],

	content(){
		md(`**Open any page below in two windows.** Edit in one; the other changes while you
watch it, with no reload and no navigation. The number on each page is real — it is
measured from the moment the edit was appended to the moment the *other* tab had redrawn.
**9 ms**, median of 12, two headless windows on one machine.`);

		this.previews();

		md(`### The two files

A stream is a snapshot and a log, side by side in \`data/\`:

\`\`\`
wire.json    { "headline": "…", "accent": "#FF6157" }
wire.jsonl   {"at":"…","op":"set","path":["headline"],"value":"…"}
\`\`\`

The \`.json\` is the state a cold window starts from; the \`.jsonl\` is one edit per line.
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
the whole-file write** ([\`doc/wire.md\`](./doc/wire.md)).

### On Cloudflare

The dev server is the thing that decides what order edits happened in. In production the
site is static, so that job needs an owner: one **Durable Object per page url**, holding the
log and fanning it out over WebSockets. The client swaps one url and nothing else — prices,
limits and the gotchas are in [\`doc/durable-objects.md\`](./doc/durable-objects.md).`);

		// ⚠ `.md` on the doc links, not the pretty `/doc/<name>/` form — that route belongs
		//   to a `Doc`-based module and 404s beside a plain Page, masked by the SPA fallback.
		md(`[readme](./readme/) · [\`doc/wire.md\`](./doc/wire.md) · [\`doc/durable-objects.md\`](./doc/durable-objects.md) · [\`doc/decisions.md\`](./doc/decisions.md)`);
	},
});
