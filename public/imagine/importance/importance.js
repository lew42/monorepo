/* THE BROWSER'S HALF OF THE LAYER — `Graph` plus the two IO methods, and nothing else.

   Reading is `ext/JSONL`'s `live()`: the dev server's `Tail.js` pushes every appended line
   to every subscribed window, so a judgment cast in one window is on screen in the other
   without a reload. Writing is one line up the same socket. The rest — the collections,
   the edges, the scores, the pair chooser — is `Graph.js`, shared byte for byte with the
   command line (`importance.mjs`), so a bot's judgment and a click's judgment are the same
   row scored by the same formula.

   ⚠ THE WRITER DOES NOT APPLY ITS OWN LINE. It arrives back off the wire like everyone
     else's, so there is exactly one code path and the SERVER is the only orderer —
     /imagine/stream/readme.md's first rule, learned the expensive way over there.

   ⚠ APPEND-ONLY. There is no edit and no delete path in here for a judgment, on purpose:
     a bad row is answered by a LATER row (`retracted`) or by dropping that judge's weight
     to 0. doc/storage.md says why that is the whole point. */

import Socket from "/framework/dev/Socket/Socket.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import { Graph } from "./Graph.js";
import { edit } from "/framework/ext/Ask/edit.js";

export { KINDS, RELS } from "./Graph.js";

// ⚠ Against `import.meta`, never the document — the SPA fallback makes the document url
//   the route, so `./data/` read off the page would follow the reader around.
const DATA = new URL("./data/", import.meta.url);

// The first month a judgment shard could exist. `open()` subscribes to every month from
// here to today — doc/storage.md has the manifest this becomes when the count matters.
const FIRST = "2026-09";

// The wire gets this long to hand the writer its own line back before the writer gives up
// and applies it itself. /imagine/stream/ measures the real round trip at 9 ms.
const WIRE = 2000;

/* ONE STREAMED FILE. `ext/JSONL` is built for VERB lines — `{"assign": {…}}` replayed onto
   one object — and these three files are flat records, so `apply()` (the single seam every
   line passes through) is the entire translation: one line in, one row appended.
   Everything else comes along unchanged and unwritten: the tolerant parse, the
   content-type guard, `load()`, `live()`, the offset bookkeeping, and the reset when a
   file is rewritten rather than appended to. */
class Rows extends JSONL {
	rows = [];
	apply(row){ this.rows.push(row); return this; }
	reset(){ this.rows = []; return super.reset(); }
}

export class Store extends Graph {

	url(name){ return new URL(name, DATA).pathname; }

	// A page says `store.watch(fn)` once; `fn` runs after every batch off the wire.
	watch(fn){ (this.watchers ??= []).push(fn); return this; }

	// Memoised: every view asks, and only the first one pays.
	load(){ return this.loading ??= this.open(); }

	/* ⚠ `live()` IS `load()` when there is no socket, so this is ONE code path for the dev
	     server and for the static host — which is the whole reason to stand on ext/JSONL
	     rather than hand-rolling a subscription. Off localhost nothing changes.
	   ⚠ A month with no file is not an error: `Tail.subscribe()` answers it with an empty
	     batch and leaves the subscription standing, so the first judgment of a new month
	     streams to every open window the moment it is written. */
	async open(){
		this.streams = {
			nodes: new Rows({ url: this.url("nodes.jsonl") }),
			edges: new Rows({ url: this.url("edges.jsonl") }),
			shards: this.months().map(m => new Rows({ url: this.url("judgments/" + m + ".jsonl") })),
		};

		await Promise.all(this.feeds().map(feed => feed.live(() => this.arrived())));
		return this.sync();
	}

	feeds(){ return this.streams ? [this.streams.nodes, this.streams.edges, ...this.streams.shards] : []; }

	// FIRST … this month, inclusive.
	months(){
		const out = [];
		for (let at = new Date(FIRST + "-01T12:00:00Z"); this.month(at) <= this.month(new Date()); at.setUTCMonth(at.getUTCMonth() + 1))
			out.push(this.month(at));
		return out;
	}

	/* The collections are REBUILT from the streams on every batch rather than patched.
	   It is three array copies at this size, and it means a file that was rewritten
	   instead of appended to (`jsonl_reset` — ext/JSONL resets that stream's rows) needs
	   no special case here at all. */
	sync(){
		this.reset();
		this.streams.nodes.rows.forEach(node => this.nodes.set(node.id, node));
		this.edges = [...this.streams.edges.rows];
		this.judgments = this.streams.shards.flatMap(shard => shard.rows);
		return this;
	}

	/* ⚠ Coalesced through a microtask: one propose is TWO appends to TWO files, and each
	     answers with its own frame. Without this the ranked list redraws twice, and the
	     first redraw is of a node with no edge yet. */
	arrived(){
		this.pending ??= Promise.resolve().then(() => {
			this.pending = null;
			this.sync();
			(this.watchers ?? []).forEach(fn => fn(this));
		});
	}

	// ════ WRITING ═════════════════════════════════════════════════════════════

	// The one switch every editor control reads (ext/Ask/edit.js) — off localhost, or
	// with the rail's edit toggle off, every writer here is disabled and the buttons say so.
	writable(){ return edit(); }

	// A window left open across a month boundary would write to a shard it never
	// subscribed to. Idempotent: an existing feed is returned, a new one subscribes.
	feed(name){
		const url = this.url(name);
		const known = this.feeds().find(f => f.url === url);
		if (known) return known;

		const fresh = new Rows({ url });
		this.streams.shards.push(fresh);
		fresh.live(() => this.arrived());
		return fresh;
	}

	/* `rpc:append` opens the file with "a", so the write is the size of the LINE and two
	   browsers judging at once interleave between lines, never inside one.
	   ⚠ A dev server started before Append.js landed (2026-08-31) never answers at all and
	     `async_rpc` would wait forever — so the call races a timeout and the verdict says
	     "restart the dev server", which is true and fixable. */
	async append(kind, row){
		if (!this.writable()) throw new Error("read-only — there is no dev socket here");

		this.feed(this.file(kind));

		const reply = await Promise.race([
			Socket.singleton().async_rpc("append", this.url(this.file(kind)), JSON.stringify(row)),
			new Promise(done => setTimeout(done, WIRE, null)),
		]);

		if (reply?.response !== "append successful")
			throw new Error("the dev server refused the append (restart it — rpc:append landed 2026-08-31)");

		return this.expect(kind, row);
	}

	/* ⚠ A CLICK THAT DID NOTHING IS THE WORST FAILURE THIS PAGE HAS. The row is coming
	     back off the wire and that is the only path that should apply it — but if no frame
	     carrying it has arrived in two seconds, the writer applies its own row after all
	     and says so out loud. On a working dev server this never fires. */
	expect(kind, row){
		setTimeout(() => {
			if (this.here(kind, row)) return;

			console.warn("importance: the appended line never came back off the wire — applying it locally.", row);
			this.take(kind, row);
			(this.watchers ?? []).forEach(fn => fn(this));
		}, WIRE);

		return row;
	}

	// Has this exact row landed in the collections yet? By id where there is one.
	here(kind, row){
		if (kind === "node") return this.nodes.has(row.id);
		if (kind === "judgment") return this.judgments.some(j => j.id === row.id);
		return this.edges.some(e => e.src === row.src && e.rel === row.rel && e.dst === row.dst);
	}
}

// One store per document — every page reads the same three collections.
export const store = new Store();
