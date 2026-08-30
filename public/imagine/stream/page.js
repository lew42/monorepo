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
measured from the moment the edit was appended to the moment the *other* tab had redrawn.`);

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

### What was already here, and what was missing

Nothing had to be added to the server. \`rpc:write\` (the CMS slice) carries the edit up;
\`Tail\` (the AI board) carries it back down to everyone. The one thing genuinely missing is
an **append** RPC — today an edit rewrites the whole log, which is fine for a demo and wrong
for a document ([\`doc/wire.md\`](./doc/wire.md) has the measurements and the proposed fix).

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
