import List from "../List/List.js";

/* ONE .jsonl file = one object's history. `item.store` loads it, replays each line
   through `host.set(line)`, appends new ones as they happen, and — on localhost —
   streams live lines in both directions. Recording lives in exactly ONE place: here.
   `store.attach(host)` listens for `host`'s own "delta" event (which bubbles up from
   anything below it — a nested Item, a List three levels down), works out the
   `at` path from the host down to wherever the change actually happened, and
   appends ONE line. Replaying those lines through `host.set(line)` rebuilds the
   same tree.

   core/Page/Log.js's `PageLog.Reader` is the class this was modelled on, so a
   future `PageLog.Reader extends Item.Store` can keep every one of its own method
   names: `open`, `close`, `parse`, `read`, `load`, `attach`, `changed`, `reset`. */
export class Store {

	entries = [];
	count = 0;

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
	open(){
		const host = globalThis.location?.hostname;
		const local = host === "localhost" || host === "127.0.0.1" || !!host?.endsWith(".localhost");
		if (!local) return this.load();

		return import("../../ext/JSONL/live.js").then(live => live.stream(this, () => this.changed()));
	}

	// A torn line is skipped with a warning, never the whole log. The dev server's
	// SPA fallback answers a missing file with index.html at 200 — a real 200 whose
	// content-type is html is therefore treated as "no file", not "an empty file".
	async load(){
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

	// Host attached → replay each entry through `host.set(entry)`, flagged so nothing
	// it does gets recorded again. No host yet → hold the entries for `attach()`.
	// Echo skip: an entry that is — character for character — a line THIS store sent
	// and has not yet seen come back is dropped instead of replayed a second time;
	// that is how a writer that also tails its own file ignores its own echo.
	read(entries){
		for (const entry of entries){
			if (this.skip_echo(entry)){ this.count++; continue; }

			if (this.host){
				this.replaying = true;
				try { this.host.set(entry); } finally { this.replaying = false; }
			} else {
				this.entries.push(entry);
			}
			this.count++;
		}
		return this;
	}

	skip_echo(entry){
		const str = JSON.stringify(entry);
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

		host.on("delta", (line, origin) => {
			if (this.replaying) return;
			this.append(this.line_for(line, origin, host));
		});

		const held = this.entries.splice(0);
		this.read(held);
		return this;
	}

	// The wire line: the path from `host` down to wherever the change happened,
	// unless it happened ON the host (then there is no `at` at all), plus — for a
	// cross-list move — the SAME kind of path standing in for the live `from` list.
	line_for(line, origin, host){
		const at = address(origin, host);
		const from = line.move?.from;
		const resolved = from && typeof from !== "string"
			? { move: { ...line.move, from: address(from, host) ?? "" } }
			: line;

		return at === undefined ? resolved : { at, ...resolved };
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

		// The ONE file API: the file itself sends the lines (ext/filesystem/FsFile.js).
		// Imported here, not at the top — FsFile imports Item, which imports this file.
		const path = new URL(this.url, "http://localhost").pathname;
		const { default: FsFile } = await import("../../ext/filesystem/FsFile.js");
		await new FsFile({ path }).send(lines);
	}

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

/* The path from `host` down to `node` — property names and member ids, alternating
   (`"content"`, `"content/abc"`, `"content/abc/replies/def"`). `undefined` means
   `node` IS `host`: the plainest case, a line with no `at` at all. Used both for a
   change's own origin and, inside `line_for()` above, to turn a cross-list move's
   live `from` reference into the same kind of path. */
function address(node, host){
	if (!node || node === host) return undefined;

	if (node instanceof List){
		const base = address(node.owner, host);
		return base ? `${base}/${node.name}` : node.name;
	}

	const parent = node.parent;
	if (!parent) return undefined;   // detached from host — best effort, should not happen

	for (const [name, list] of Object.entries(parent.lists?.() ?? {})){
		if ([...list].includes(node)){
			const base = address(parent, host);
			const seg = `${name}/${list.key(node)}`;
			return base ? `${base}/${seg}` : seg;
		}
	}

	return address(parent, host);
}

export default Store;
