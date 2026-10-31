// A duck-typed "is this a List?" — NOT `instanceof List`. This file is imported
// BY Item.js (`Item.Store = Store`), and `List extends Item` now (2026-10-03),
// so importing `../List/List.js` here would close the exact cycle Item.js
// itself avoids (see List.js's own header comment): `class List extends Item`
// needs Item fully defined, and Item.js's own import of Store.js runs before
// Item's class body does, so List.js would hit the TDZ instead.
import RecordWriter from "./RecordWriter.js";
import Snapshot from "./Snapshot.js";

const is_list = node => !!node && Array.isArray(node.items) && typeof node.find === "function";

/* ONE .jsonl file = one object's history. `item.store` loads it, replays each line
   through `host.set(line)`, appends new ones as they happen, and — on localhost —
   streams live lines in both directions. Recording lives in exactly ONE place: here.
   `store.attach(host)` listens for `host`'s own "delta" event (which bubbles up from
   anything below it — a nested Item, a List three levels down), works out the
   NESTING from the host down to wherever the change actually happened — never a
   path string (2026-10-03, the owner: "drop the special `at` key") — and appends
   ONE line. Replaying those lines through `host.set(line)` rebuilds the same tree,
   one `get()` hop per level (core/Item/Item.js).

   core/Page/Log.js's `PageLog.Reader` is the class this was modelled on, so a
   future `PageLog.Reader extends Item.Store` can keep every one of its own method
   names: `open`, `close`, `parse`, `read`, `load`, `attach`, `changed`, `reset`. */
export class Store {

	entries = [];
	count = 0;
	/* MUTING is per item tree (2026-10-31): while Item.act (or Item.as_call) runs a verb, the changes made to THAT item and
	   anything under it are not recorded (the verb is), but a write to any other item is. `muting` maps an item to how many
	   mutes it holds (a verb may call a verb). */
	static muting = new Map();
	static mute(item){ Store.muting.set(item, (Store.muting.get(item) ?? 0) + 1); }
	static unmute(item){ const n = (Store.muting.get(item) ?? 1) - 1; n > 0 ? Store.muting.set(item, n) : Store.muting.delete(item); }
	// Is `node` (the origin of a change: an Item, or a List, whose parent is its owner) inside a muted item's tree?
	static muted_at(node){
		if (!Store.muting.size) return false;
		for (let n = node; n; n = n.parent) if (Store.muting.has(n)) return true;
		return false;
	}
	/* REPLAYING is global too: while ANY store replays a line, nothing is saved by any store. A replayed child's line (read from
	   its own file) makes its parent derive a consequence (Task.child_changed completes the parent); the parent has its own store,
	   which is not "replaying", and used to write that line again, in every tab that read the child's file (item-core.test.mjs, 1e). */
	static replay_depth = 0;

	/* THE LINE SPELLING THE WRITERS USE (D13, core/Item/doc/line-format.md). false (today): a list member's change names it by its
	   bare id (`{"tasks":{"c3":{…}}}`) and act() saves the bare verb (`{"start":{}}`). true: `#c3` and `start()`. Every reader in
	   core/ reads BOTH always; the node tools and dashboards listed in the doc read only the bare spelling yet, so the switch stays
	   off until they are updated. */
	static marked_lines = false;
	// How many items are muted right now (0 = none). The old global flag, for a reader that has no origin to ask about.
	static get muted(){ return Store.muting.size; }

	// Where a record file's lines go (core/Item/doc/transport.md). "socket" (the default): the dev server's socket, like every other
	// .jsonl. "item_api": the old way, a POST to Servex /api/item first (it also applies the line to Servex's live copy), the socket
	// only for what Servex did not take.
	static channel = "socket";

	/* SNAPSHOTS (doc/snapshots.md): `Item.open` may start from `<log>.snapshot.json` (the item's saved shape and how far into the log it
	   reaches) and replay only the lines after it. false = always replay the whole log, as before. */
	static snapshots = true;

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// One Store per file — a second `Item.open()` on the same url reaches the SAME
	// live object, never a second reader racing the first.
	static for(url){
		const found = (Store.instances ??= new Map()).get(url);
		if (found) return found;

		const store = new this({ url });
		Store.instances.set(url, store);
		return store;
	}

	// On localhost: live, two-way (append and tail). Everywhere else: one load, no
	// writer — ext/JSONL/live.js is imported ONLY here, dynamically, so this file
	// (and Item.js, which never imports it either) still loads in plain node.
	// Once per file: a second open() (two references to one file, a reference and a task page) gets the same promise, never
	// a second stream that would replay every line twice.
	open(){
		if (this.opening) return this.opening;
		const opening = !Store.local() ? this.moved().then(() => this.load())
			: this.moved().then(() => import("../../ext/JSONL/live.js")).then(live => live.stream(this, () => this.changed()));
		opening.catch(() => { if (this.opening === opening) this.opening = null; });   // a failed open (server restarting) is not kept: the next open tries again
		return this.opening = opening;
	}

	/* Look for a snapshot of this log and check it still matches (Item.open calls this before open(), only when nobody has opened the
	   store yet). A good one is kept in `this.snapshot`; `count` and `offset` then start where it ends, so the live tail (dev server)
	   subscribes from there and a static load asks only for the bytes after it. A snapshot that no longer matches the log is
	   ignored with one warning: the log is the truth, so the load is simply the old full replay. Answers the snapshot or null. */
	async use_snapshot(){
		if (!Store.snapshots || this.opening || this.snapshot !== undefined) return this.snapshot ?? null;
		this.snapshot = null;
		try {
			await this.moved();
			// On the dev server the folder's listing says whether a sidecar exists, so a log with none costs no request (and no 404 in
			// the console, which the merge smoke counts). Elsewhere (the static site, node) the sidecar is simply asked for.
			if (Store.local()){
				const dir = new URL(this.url, globalThis.location.href).pathname.replace(/[^/]*$/, "");
				const listed = await (await import("../Router/listing.js")).fetch_names(dir).catch(() => null);
				if (listed && !listed.includes(Snapshot.url_for(this.url).split("/").pop())) return null;
			}
			const found = await Snapshot.fetch(this.url);
			if (!found) return null;
			const tail = await found.check(this.url, { tail: !Store.local() });
			if (tail === null){
				console.warn(`Item.Store: ${Snapshot.url_for(this.url)} does not match ${this.url} (the log was rewritten or cut before byte ${found.bytes}): snapshot ignored, replaying the whole log.`);
				return null;
			}
			const stale = found.stale_reason((await import("./Item.js")).default);   // dynamic: Item.js imports this file
			if (stale){
				console.warn(`Item.Store: ${Snapshot.url_for(this.url)} is ignored, replaying the whole log: ${stale}.`);
				return null;
			}
			this.snapshot = found;
			this.snapshot_tail = Store.local() ? undefined : tail;
			this.count = found.lines;
			this.offset = found.bytes;
		} catch (error){ console.warn(`Item.Store: could not use the snapshot of ${this.url} (${error?.message ?? error}): replaying the whole log.`); }
		return this.snapshot;
	}

	// True on the dev server (localhost, 127.0.0.1, *.localhost); false on the deployed static site and in plain node.
	static local(){
		const host = globalThis.location?.hostname;
		return host === "localhost" || host === "127.0.0.1" || !!host?.endsWith(".localhost");
	}

	// A session folder's record moved from task.jsonl to its new name (ai/sessions/doc/session-record.md).
	async moved(){ this.url = await Store.record_url(this.url); return this; }

	// `<folder>/task.jsonl` when it is there; else the moved record beside it when THAT is; else the url
	// unchanged (the file may be about to be written). Shared with ext/JSONL.
	static async record_url(url){
		if (!/\/sessions\/\d{4}\/\d\d\/\d\d\/.+\/task\.jsonl$/.test(url)) return url;   // only the sessions store has moved records
		const there = async u => {
			const res = await fetch(u, { method: "HEAD" }).catch(() => null);
			return !!res?.ok && !res.headers.get("content-type")?.includes("html");
		};
		const alt = url.replace(/task\.jsonl$/, "session.jsonl");
		if (/\/sessions\/\d{4}\/\d\d\/\d\d\/[^/]+\/task\.jsonl$/.test(url) && await there(alt)) return alt;   // a session folder: moved, so ask the new name first (no 404 in the console)
		if (await there(url)) return url;
		return await there(alt) ? alt : url;
	}

	// A torn line is skipped with a warning, never the whole log. The dev server's
	// SPA fallback answers a missing file with index.html at 200 — a real 200 whose
	// content-type is html is therefore treated as "no file", not "an empty file".
	async load(){
		if (this.snapshot){   // only the lines after the snapshot (already fetched when static; the dev server's 1.5 s fallback asks now)
			const text = this.snapshot_tail ?? await this.snapshot.check(this.url, { tail: true });
			if (text === null){ this.snapshot = null; this.count = 0; this.offset = 0; }   // changed since use_snapshot(): read it all (a host built from the snapshot would have the same lines twice; rare, reload fixes it)
			else { this.loaded = true; this.snapshot_tail = undefined; return this.read(this.parse(text)); }
		}
		const res = await fetch(this.url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return this;

		this.loaded = true;
		return this.read(this.parse(await res.text()));
	}

	parse(text){
		return text.split("\n").filter(line => line.trim()).flatMap(line => {
			try { return [JSON.parse(line)]; }
			catch { console.warn(`Item.Store: unparsed line in ${this.url} —`, line); return []; }
		});
	}

	// Host attached → replay each entry through `host.replay_line(entry)` (default `set`), flagged so nothing
	// it does gets recorded again. No host yet → hold the entries for `attach()`.
	// Echo skip: an entry that is — character for character — a line THIS store sent
	// and has not yet seen come back is dropped instead of replayed a second time;
	// that is how a writer that also tails its own file ignores its own echo.
	read(entries){
		const replayed = [];
		for (const entry of entries){
			if (this.skip_echo(entry)){ this.count++; continue; }

			if (this.host){
				this.replaying = true;
				Store.replay_depth++;
				try { this.host.replay_line(entry); } finally { Store.replay_depth--; this.replaying = false; }
				replayed.push(entry);
			} else {
				this.entries.push(entry);
			}
			this.count++;
		}
		// One "read" event on the host per batch it replayed: a replay may change it without a "delta" (Task.replay_line puts
		// its fields), so a view or a Ref that must redraw on a live line listens for this (core/Item/Ref.js).
		if (replayed.length) this.host.emit?.("read", replayed);
		return this;
	}

	skip_echo(entry){
		const { by, ts, ...bare } = entry;   // the item tool stamps `by`/`ts` on the way to disk, so an echo is compared without them
		const str = JSON.stringify(bare);
		const i = (this.sent ??= []).indexOf(str);
		if (i === -1) return false;
		this.sent.splice(i, 1);
		return true;
	}

	// `host.store = this`, `this.host = host`, one listener for every change
	// anywhere under `host` (Events bubbles it there), then replay whatever this
	// store already loaded before it had a host.
	attach(host){
		this.host = host;
		host.store = this;

		// The host starts from the snapshot (its saved shape, hooks run once per key), then replays the lines after it below.
		if (this.snapshot){
			Store.replay_depth++;
			try { host.restore(this.snapshot.state, this.snapshot.memory); } finally { Store.replay_depth--; }
		}

		host.on("delta", (line, origin) => {
			if (this.replaying || Store.replay_depth > 0 || Store.muted_at(origin) || owned_below(origin, host)) return;
			this.append(this.line_for(line, origin, host));
		});

		const held = this.entries.splice(0);
		this.read(held);
		return this;
	}

	// The wire line: NESTED one hop per level from `host` down to wherever the
	// change happened (`{"k2": {"answers": {"add": {...}}}}` — `get()`'s own
	// "a property, then a child's id" rule, walked backwards), INCLUDING one hop
	// for the list's own name when the change is a list verb on the host's own
	// list (`{"content": {"move": {...}}}`, `{"pages": {"move": {...}}}`) — flat,
	// with no wrapping at all, only when the change is a plain field set directly
	// on the host itself (`origin === host`). A cross-list
	// move still carries its `from` as the OLD `/`-separated path string (that one
	// is DATA inside the `move` verb, not routing, so it never needed the `at` key
	// and is untouched by this fold-away).
	line_for(line, origin, host){
		const from = line.move?.from;
		const resolved = from && typeof from !== "string"
			? { move: { ...line.move, from: address(from, host) ?? "" } }
			: line;

		return wrap(hops(origin, host, Store.marked_lines), resolved);
	}

	// Queues; one microtask later the whole tick's lines go in ONE call, as an array
	// of objects (the only shape the Append RPC takes). Off
	// localhost there is no writer at all — the change already happened in memory
	// (whatever called `host.set`/a live verb already mutated the host); this only
	// warns, once, that nothing was written to disk.
	append(line){
		(this._queue ??= []).push(line);
		if (this._flushing) return;
		this._flushing = true;
		queueMicrotask(() => this.flush());
	}

	async flush(){
		const lines = this._queue.splice(0);
		this._flushing = false;
		if (!lines.length) return;

		if (!this.writable){
			if (!Store.warned_readonly){
				Store.warned_readonly = true;
				console.warn("Item.Store — off localhost: changes are kept in memory only, nothing is written.");
			}
			return;
		}

		lines.forEach(one => (this.sent ??= []).push(JSON.stringify(one)));

		// ONE CHANNEL (doc/transport.md): every line goes out over the dev server's socket, numbered, and stays queued until the server
		// acks it (core/Item/Outbox.js, the wire half of ext/filesystem/FsFile.js). A record file's line is stamped here, as the item
		// tool would have: `by: "owner"` and a `ts` (a Task reads its times from it).
		const path = new URL(this.url, "http://localhost").pathname;
		if (!this.via_tool || Store.channel === "socket")
			return this.deliver(path, this.via_tool ? lines.map(l => ({ ...l, by: l.by ?? "owner", ts: l.ts ?? RecordWriter.stamp() })) : lines);

		// ONE WRITER (data-shapes 1d): a record's lines go to the one entry point (RecordWriter.js), which applies each to the file's
		// live root and appends it. A page's lines go raw; a task's or session's are item-tool verbs (validated, stamped, hooks fire).
		// Only lines it could not be asked (Servex down, a phone, a worktree page) are appended here, and the dev server's Append
		// skips any it already holds under their by/ts, so a slow answer and the fallback never make a twin.
		const { rest, refused, down } = await RecordWriter.post(path, /(^|\/)page\.jsonl$/.test(path) ? { lines } : { deltas: lines });
		for (const { line, why } of refused){
			const { by, ts, ...bare } = line, j = (this.sent ?? []).indexOf(JSON.stringify(bare));
			if (j !== -1) this.sent.splice(j, 1);
			console.warn(`Item.Store — the entry point refused ${JSON.stringify(bare)}: ${why}`);
		}
		if (!rest.length) return;
		if (down && !Store.warned_no_servex){ Store.warned_no_servex = true; console.warn("Item.Store — the entry point (Servex /api/item) did not take the lines: appending them through the dev server, once."); }
		await this.deliver(path, rest);
	}

	// Hand lines to the outbox and wait for the server's ack. The outbox keeps them, and sends them again after a reconnect, until
	// the server has them. If the server refuses them, no echo will come, so forget the ones this store was waiting to skip.
	async deliver(path, lines){
		this.unacked = (this.unacked ?? 0) + lines.length;
		try {
			const { default: Outbox } = await import("./Outbox.js");   // imported here, not at the top: it is browser-side wire code
			const ok = await Outbox.shared().send(path, lines);
			if (!ok) for (const { by, ts, ...bare } of lines){ const j = (this.sent ?? []).indexOf(JSON.stringify(bare)); if (j !== -1) this.sent.splice(j, 1); }
			return ok;
		} finally { this.unacked -= lines.length; }
	}

	// Lines this store has made that the server has not acked: still queued for the next microtask, or sent and waiting. Not 0 while
	// the socket is down, so a page can show "saving…" or "not saved yet".
	get pending(){ return (this._queue?.length ?? 0) + (this.unacked ?? 0); }

	get via_tool(){ return RecordWriter.is_record(this.url); }

	get writable(){
		const host = globalThis.location?.hostname;
		return host === "localhost" || host === "127.0.0.1" || !!host?.endsWith(".localhost");
	}

	// Hooks a subclass extends — empty here. `PageLog.Reader`'s own `changed()`
	// redraws the folder listing and the tab strip; `reset()` forgets what was read
	// so a REWRITTEN (not appended) file replays clean from line 1.
	changed(){}
	reset(){ this.count = 0; return this; }
}

/* A cross-list move's `from`: the list the member left, as a DOTTED path from the host,
   the same hops a line walks (`"cards.c1.notes"`). It rides inside the `move` verb's own
   payload. Before 2026-10-28 it was a `/` path (`"cards/c1/notes"`); List.move reads both.
   `undefined` means `node` IS `host`. */
function address(node, host){
	const path = hops(node, host);
	return path.length ? path.join(".") : undefined;
}

// A change whose origin sits inside a descendant that has its OWN store belongs to that store (a Task.open_ref stub replaying its own file), or that is marked `_own_file` (a referenced child, even a snapshot copy).
function owned_below(node, host){
	for (let n = is_list(node) ? node.owner : node; n && n !== host; n = n.parent) if (n._own_file || (n.store && n.store.host === n)) return true;
	return false;
}

// A list member's hop: its id, or `#id` when the marked line shape is on (D13, Store.marked_lines).
const member = (id, marked) => marked ? "#" + id : id;

/* The chain of NAMES from `host` down to `node`, one per level, and EVERY hop names
   its list (2026-10-28, ids-and-paths.md §3): a member is its list's name, then its
   id (`{"tasks":{"c3":{…}}}`), so a reader walks one `get()` per name and never
   searches. An Item held in a property (Item.adopt_slot) is that property's name.
   Before, a member's hop was its id alone and the reader searched every list for it
   (`{"c3":{…}}`; two lists with one id misrouted, seat a E2); old lines still replay
   (Item.set_one). `[]` means `node` IS `host`. */
function hops(node, host, marked = false){
	if (!node || node === host) return [];

	// A List IS the origin when the change is one of ITS OWN verbs (add/remove/
	// move/order) — `List.announce()` emits "delta" with `this` (the list) as the
	// origin, never one of its members. Its own NAME is the hop a reader needs:
	// `set()` (Page.class.js) only routes a line into `page.content` when it finds
	// `"content" in obj` — a flat `{"move": {...}}` line with no name at all
	// landed on the PAGE itself instead and silently misreplayed (2026-10-03, the
	// owner: drags onto the Now card wrote top-level `{"move": {...}}` lines).
	// Mirrors `address()`'s own list branch just above, which already did this.
	if (is_list(node)) return [...hops(node.owner, host, marked), node.name];

	const parent = node.parent;
	if (!parent) return [];   // detached from host — best effort, should not happen

	// A member of a list with no owner: its parent IS the list (List.adopt), so the hop is its id alone. Before, it found no
	// list here and was written flat, so a member's change replayed onto the list itself (the persistence matrix found it).
	if (is_list(parent)){ const key = parent.key(node); if (key != null && parent.find(key) === node) return [...hops(parent, host, marked), member(key, marked)]; }

	for (const [name, list] of Object.entries(parent.lists?.() ?? {})){
		const key = list.key(node);
		if (key == null || list.find(key) !== node) continue;
		const named = list_name(parent, name, list);
		return named ? [...hops(parent, host, marked), named, member(key, marked)] : [...hops(parent, host, marked), member(key, marked)];
	}

	if (node._slot != null && parent.get?.(node._slot) === node) return [...hops(parent, host, marked), node._slot];
	// A child given its parent by hand and held in a plain property (`parent.kid = child`): that property's name, when the
	// parent's get() finds it there (seat g, B4: it was written flat, as the parent's own field).
	for (const key of Object.keys(parent)) if (key !== "parent" && !key.startsWith("_") && parent[key] === node && parent.get?.(key) === node) return [...hops(parent, host, marked), key];

	return hops(parent, host, marked);
}

// The name a reader's `get()` finds `list` under on `owner`: the list's own name, else the key `lists()` gave it.
// None (a list only reachable by scanning, like an old Page's `_pages`): the id-only hop, which old readers search for.
function list_name(owner, key, list){
	for (const name of [list.name, key]) if (name && !name.startsWith("_") && owner.get?.(name) === list) return name;
	return null;
}

// Nests `payload` one level per step in `path`, innermost (the payload itself)
// last — `wrap(["k2", "q1"], {set: {...}})` → `{k2: {q1: {set: {...}}}}`.
function wrap(path, payload){
	return path.length === 0 ? payload : { [path[0]]: wrap(path.slice(1), payload) };
}

// The dotted path from `host` down to `node` ("tasks.c3"), the one a Ref stores and `host.get(path)` reads back; "" for the host itself.
Store.address = (node, host) => address(node, host) ?? "";

export default Store;
