import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import Socket from "/framework/dev/Socket/Socket.js";

/**
 * A PAGE'S STATE, STREAMED. Two files and no new server code:
 *
 *   page.json    the snapshot — the state a cold tab starts from
 *   page.jsonl   the deltas   — one `{at, op, path, value}` per line, append only
 *
 * Every tab subscribes to the `.jsonl`. The dev server already tails it
 * (`Server/plugins/SocketServer/Tail.js`) and pushes appended lines to every
 * subscriber, so an edit reaches a viewer WITHOUT a reload. `ext/JSONL` is the
 * whole client half; this class only teaches it the delta verbs.
 *
 * ⚠ THE EDITOR DOES NOT APPLY ITS OWN EDIT. `push()` writes the file and stops;
 *   the delta arrives back off the wire like everyone else's. One code path, and
 *   the server is the only thing that decides what order edits happened in — the
 *   property a Durable Object would keep in production (doc/durable-objects.md).
 *
 * ⚠ OFF LOCALHOST there is no socket: `live()` degrades to one fetch of the two
 *   files and the page renders the last state anyone saved. Read-only, no error.
 */
export class Stream extends JSONL {

	/* How long one edit waits for `rpc:append` before deciding the server does not have
	   it. Paid once, by one edit, on a dev server older than `Append.js`. */
	static PROBE = 2000;

	/* ⚠ Fields, not constructor args — a subclass field initialises AFTER `super()`
	   has assigned, so anything passed in under these names would be overwritten.

	   `confirmed` is what the SERVER has echoed back; `pending` is what this window has
	   written and not seen yet. Together they are this window's copy of the file — which
	   only the whole-file FALLBACK in `send()` needs. With `rpc:append` `pending` never
	   fills, and `confirmed` is just the log's measured size. */
	state = {};
	confirmed = "";
	pending = "";
	lags = [];

	/* The snapshot, then the log on top of it. `super.live()` subscribes and calls
	   `changed` once per appended batch. ⚠ Nothing after this `await` may build DOM —
	   the caller redraws inside `changed`, which re-establishes its own captor.

	   ⚠ `changed` is KEPT, not just passed on: a truncated log re-fetches the snapshot
	     asynchronously, and the window that is not compacting has to be told. */
	async live(changed){
		this.changed = changed;
		this.base = await this.load_base();
		this.reset_state();
		return super.live(changed);
	}

	/* ⚠ The SPA fallback answers a miss with index.html, so content-type is the 404.
	   ⚠ `no-cache`: `compact()` rewrites this file, and a window re-reading it from the
	     HTTP cache would replay the state it had before the fold. */
	async load_base(){
		const res = await fetch(this.snapshot, { cache: "no-cache" }).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return {};
		return res.json().catch(() => ({}));
	}

	reset_state(){ this.state = structuredClone(this.base ?? {}); }

	/* The file was truncated or rewritten — back to the snapshot, and `live.js`
	   re-subscribes from zero. This is the compaction path, and the reload path.

	   ⚠ The snapshot is RE-FETCHED, not remembered. `compact()` folds the log INTO the
	     `.json` and then truncates, so a reset means "the snapshot moved" — and a window
	     that reused its cached base would silently roll every compacted edit back out.
	     `clear()` truncates without moving it, and re-reading the same file is free. */
	reset(){
		this.confirmed = this.pending = "";
		this.reset_state();

		// ⚠ The redraw below is not a delta arriving, so it must not be TIMED as one:
		//   `mark()` would measure now minus the `at` of the last line before the fold
		//   and post it as latency. A compaction logged 716 ms that way (2026-08-31).
		delete this.last_at;

		this.load_base().then(base => {
			this.base = base;
			this.reset_state();
			this.changed?.(this);
		});

		return super.reset();
	}

	/* ⚠ THE ONE PLACE THE RAW TEXT IS VISIBLE, and `push()` needs it byte-for-byte: an
	   append is a whole-file `rpc:write` of what we hold plus one line, and a file that
	   does not match what the server's tail counted would resume mid-line.

	   ⚠ AND THE LINES I WROTE COME BACK. A writer is also a subscriber, so its own lines
	     arrive here a moment later — added blindly they would land in the file twice, the
	     server would stream the duplicate, and the copy would double on every edit. Three
	     edits made seven blocks before this was found (2026-08-30). So an echoed line
	     LEAVES `pending` instead of joining it, matched whole — a line carries an ISO
	     millisecond, so it identifies itself. */
	parse(text){
		if (text.trim()){
			const lines = text.split("\n").filter(Boolean);

			this.confirmed += lines.join("\n") + "\n";
			this.pending = this.pending.split("\n").filter(line => line && !lines.includes(line))
				.map(line => line + "\n").join("");
		}
		return super.parse(text);
	}

	/* A delta line is bare — `{at, op, path, value}`, no verb key — so it never
	   reaches JSONL's verb table. Anything else still does, and a log line beside a
	   delta is a legal thing to want. */
	apply(entry){
		if (entry && typeof entry.op === "string") return this.op(entry);
		return super.apply(entry);
	}

	op(entry){
		const path = entry.path ?? [];
		if (!path.length) return this;

		const key = path[path.length - 1];
		let node = this.state;

		// ⚠ A missing step is created as the shape the NEXT step needs — a number
		//   wants an array, or `append` on a fresh path would push into an object.
		for (let i = 0; i < path.length - 1; i++){
			node[path[i]] ??= typeof path[i + 1] === "number" ? [] : {};
			node = node[path[i]];
		}

		if (entry.op === "set") node[key] = entry.value;
		else if (entry.op === "del") Array.isArray(node) ? node.splice(key, 1) : delete node[key];
		else if (entry.op === "append") (node[key] ??= []).push(entry.value);
		else return this.skip(entry.op, entry);

		this.last_at = entry.at;
		return this;
	}

	/** Read one path out of the state, with a fallback for the cold case. */
	get(path, fallback){
		let node = this.state;
		for (const key of path){
			if (node == null) return fallback;
			node = node[key];
		}
		return node ?? fallback;
	}

	/* ── the editor half ────────────────────────────────────────────────────────
	   One `at` for a batch, so several ops land as one edit. ⚠ Key order is the
	   contract's — `{at, op, path, value}` — and `{at, ...op}` is what keeps it. */
	push(...ops){
		const at = new Date().toISOString();
		this.send(ops.map(op => JSON.stringify({ at, ...op })));
		return this;
	}

	/* ONE LINE UP THE WIRE. `rpc:append` (`Server/plugins/SocketServer/Append.js`) opens
	   the file with `"a"`, so the write is the size of the edit and not of the document,
	   and two windows writing at once interleave between lines instead of each sending
	   its own copy of the file and losing the other's.

	   The whole-file `rpc:write` stays as the FALLBACK, because a dev server started
	   before that plugin landed still has to work — which is also why `confirmed` and
	   `pending` are still here.

	   ⚠ A missing responder never answers, and `async_rpc` waits forever for a reply that
	     is not coming. So the append is raced against a timeout and the verdict is
	     REMEMBERED: exactly one edit pays for the probe, and only on an old server. */
	async send(lines){
		if (this.appendable !== false && await this.appended(lines)) return this;

		this.pending += lines.join("\n") + "\n";
		Socket.singleton().write(this.url, this.confirmed + this.pending);
		return this;
	}

	async appended(lines){
		const reply = await Promise.race([
			Socket.singleton().async_rpc("append", this.url, lines),
			new Promise(done => setTimeout(done, this.constructor.PROBE, null)),
		]);
		return this.appendable = reply?.response === "append successful";
	}

	set(path, value){ return this.push({ op: "set", path, value }); }
	del(path){ return this.push({ op: "del", path }); }
	append(path, value){ return this.push({ op: "append", path, value }); }

	/* ── compaction ─────────────────────────────────────────────────────────────
	   The log FOLDS INTO the snapshot: the replayed state is written to the `.json`,
	   and only then is the `.jsonl` truncated. Every window sees `jsonl_reset`,
	   re-fetches a snapshot it already agrees with, and re-subscribes from zero — so
	   the state survives and the two files go back to their smallest honest size.

	   ⚠ SNAPSHOT FIRST, ALWAYS. Truncate first and a window reloading in that gap gets
	     the old snapshot with no deltas left to replay: every edit since the last fold
	     is gone, permanently. Ordering is the whole safety property here.
	   ⚠ A demo button, never a timer. Compaction is a moment somebody chooses. */
	async compact(){
		const before = this.count();
		const json = JSON.stringify(this.state, null, "\t") + "\n";
		const reply = await Socket.singleton().async_rpc("write", this.snapshot, json);

		if (reply?.response !== "write successful") return { ...before, ok: false };

		this.clear();
		return { ...before, ok: true, snapshot: new Blob([json]).size };
	}

	/* The other half of the pair, and the destructive one: throw the log away and fall
	   back to whatever the snapshot says. `compact()` calls it AFTER moving the snapshot. */
	clear(){
		this.confirmed = this.pending = "";
		Socket.singleton().write(this.url, "");
		return this;
	}

	// What the log costs right now — the numbers the buttons report before and after.
	text(){ return this.confirmed + this.pending; }
	count(){ return { lines: this.text().split("\n").filter(Boolean).length, bytes: new Blob([this.text()]).size }; }

	/* ── the measurement ────────────────────────────────────────────────────────
	   Called by the viewer AFTER it has redrawn, so the number is append-to-visible
	   and not append-to-received. Both tabs are one machine, so `at` is comparable. */
	mark(){
		if (this.last_at) this.lags.push(Date.now() - Date.parse(this.last_at));
		return this;
	}

	median(){
		if (!this.lags.length) return null;
		const sorted = [...this.lags].sort((a, b) => a - b);
		return sorted[Math.floor(sorted.length / 2)];
	}
}

/* One stream per data name — `wire`, `deck`, `blocks`. The two files sit beside each
   other in `data/`, and the url is absolute because `rpc:write` and `subscribe` both
   take a path under `public/`, not a relative one. ⚠ `import.meta`, never the
   document: the SPA fallback makes the document url whatever route you arrived on. */
const here = new URL("./data/", import.meta.url).pathname;

export const wire = name => new Stream({
	url: here + name + ".jsonl",
	snapshot: here + name + ".json",
});

export default Stream;
