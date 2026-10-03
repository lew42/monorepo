// A duck-typed "is this a List?" — NOT `instanceof List`. This file is imported
// BY Item.js (`Item.Store = Store`), and `List extends Item` now (2026-10-03),
// so importing `../List/List.js` here would close the exact cycle Item.js
// itself avoids (see List.js's own header comment): `class List extends Item`
// needs Item fully defined, and Item.js's own import of Store.js runs before
// Item's class body does, so List.js would hit the TDZ instead.
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

	// The wire line: NESTED one hop per level from `host` down to wherever the
	// change happened (`{"k2": {"answers": {"add": {...}}}}` — `get()`'s own
	// "a property, then a child's id" rule, walked backwards) — flat, with no
	// wrapping at all, when the change happened ON the host itself. A cross-list
	// move still carries its `from` as the OLD `/`-separated path string (that one
	// is DATA inside the `move` verb, not routing, so it never needed the `at` key
	// and is untouched by this fold-away).
	line_for(line, origin, host){
		const from = line.move?.from;
		const resolved = from && typeof from !== "string"
			? { move: { ...line.move, from: address(from, host) ?? "" } }
			: line;

		return wrap(hops(origin, host), resolved);
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

/* ⚠ Compat only (2026-10-03) — the OLD `/`-separated path, kept ONLY to spell a
   cross-list move's live `from` reference as a string (that value rides inside
   the `move` verb's own payload, never as top-level routing, so dropping the
   `at` key never touched it). Property names and member ids, alternating
   (`"content"`, `"content/abc"`). `undefined` means `node` IS `host`. */
function address(node, host){
	if (!node || node === host) return undefined;

	if (is_list(node)){
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

/* The chain of NAMES from `host` down to `node`, each one a child's id — never a
   list's own property name, because `get()` (Item.js) never needs it either: a
   member's id is looked up by scanning every list the current node owns, so the
   wire line skips straight to the id. `[]` means `node` IS `host`. */
function hops(node, host){
	if (!node || node === host) return [];
	if (is_list(node)) return hops(node.owner, host);

	const parent = node.parent;
	if (!parent) return [];   // detached from host — best effort, should not happen

	for (const list of Object.values(parent.lists?.() ?? {}))
		if ([...list].includes(node)) return [...hops(parent, host), list.key(node)];

	return hops(parent, host);
}

// Nests `payload` one level per step in `path`, innermost (the payload itself)
// last — `wrap(["k2", "q1"], {set: {...}})` → `{k2: {q1: {set: {...}}}}`.
function wrap(path, payload){
	return path.length === 0 ? payload : { [path[0]]: wrap(path.slice(1), payload) };
}

export default Store;
