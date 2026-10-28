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
	static muted = 0;   // > 0 while Item.act runs its verb locally: the `set` lines it makes are not recorded, the verb is

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
		if (!Store.local()) return this.moved().then(() => this.load());

		return this.moved().then(() => import("../../ext/JSONL/live.js")).then(live => live.stream(this, () => this.changed()));
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
		for (const entry of entries){
			if (this.skip_echo(entry)){ this.count++; continue; }

			if (this.host){
				this.replaying = true;
				try { this.host.replay_line(entry); } finally { this.replaying = false; }
			} else {
				this.entries.push(entry);
			}
			this.count++;
		}
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

		host.on("delta", (line, origin) => {
			if (this.replaying || Store.muted || owned_below(origin, host)) return;
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

		// A task's log goes through the item tool's own writer (Servex POST /api/item): validated, stamped by/ts, hooks fire.
		// Only when Servex does not answer does it fall back to the plain file append (below). Other logs (pages) keep the plain append.
		const rest = this.via_tool ? await this.post_to_tool(lines) : lines;
		if (!rest.length) return;

		// The ONE file API: the file itself sends the lines (ext/filesystem/FsFile.js).
		// Imported here, not at the top — FsFile imports Item, which imports this file.
		const path = new URL(this.url, "http://localhost").pathname;
		const { default: FsFile } = await import("../../ext/filesystem/FsFile.js");
		await new FsFile({ path }).send(rest);
	}

	get via_tool(){ return /(^|\/)(task|session|improvements)\.jsonl$/.test(this.url); }

	// Posts each line, in order, as one delta. Returns the lines Servex could not be asked (it did not answer): those fall back.
	// A line Servex answered but refused is dropped with a warning (that is the validation), and its echo entry forgotten.
	async post_to_tool(lines){
		const { servex_url } = await import("../../dev/servex_url.js");
		const path = new URL(this.url, "http://localhost").pathname;
		for (let i = 0; i < lines.length; i++){
			let answer;
			try {
				const res = await fetch(servex_url("/api/item"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path, delta: lines[i] }), signal: AbortSignal.timeout(5000) });
				answer = await res.json();
				// Not refused for its content but for where it came from (a phone on the LAN: 403; a worktree page: stubbed):
				// the plain file append still saves it, so the click is never lost.
				if (res.status === 403 || answer?.stubbed) return lines.slice(i);
			} catch {
				if (!Store.warned_no_servex){ Store.warned_no_servex = true; console.warn("Item.Store — Servex did not answer /api/item: writing the file directly (no by/ts, no hooks)."); }
				return lines.slice(i);
			}
			if (answer?.ok === false){
				const j = (this.sent ?? []).indexOf(JSON.stringify(lines[i]));
				if (j !== -1) this.sent.splice(j, 1);
				console.warn(`Item.Store — the item tool refused ${JSON.stringify(lines[i])}: ${answer.why}`);
			}
		}
		return [];
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
		if (list.key(node) != null && list.find(list.key(node)) === node){
			const base = address(parent, host);
			const seg = `${name}/${list.key(node)}`;
			return base ? `${base}/${seg}` : seg;
		}
	}

	return address(parent, host);
}

// A change whose origin sits inside a descendant that has its OWN store belongs to that store (a Task.open_ref stub replaying its own file), or that is marked `_own_file` (a referenced child, even a snapshot copy).
function owned_below(node, host){
	for (let n = is_list(node) ? node.owner : node; n && n !== host; n = n.parent) if (n._own_file || (n.store && n.store.host === n)) return true;
	return false;
}

/* The chain of NAMES from `host` down to `node`, one per level, and EVERY hop names
   its list (2026-10-28, ids-and-paths.md §3): a member is its list's name, then its
   id (`{"tasks":{"c3":{…}}}`), so a reader walks one `get()` per name and never
   searches. An Item held in a property (Item.adopt_slot) is that property's name.
   Before, a member's hop was its id alone and the reader searched every list for it
   (`{"c3":{…}}`; two lists with one id misrouted, seat a E2); old lines still replay
   (Item.set_one). `[]` means `node` IS `host`. */
function hops(node, host){
	if (!node || node === host) return [];

	// A List IS the origin when the change is one of ITS OWN verbs (add/remove/
	// move/order) — `List.announce()` emits "delta" with `this` (the list) as the
	// origin, never one of its members. Its own NAME is the hop a reader needs:
	// `set()` (Page.class.js) only routes a line into `page.content` when it finds
	// `"content" in obj` — a flat `{"move": {...}}` line with no name at all
	// landed on the PAGE itself instead and silently misreplayed (2026-10-03, the
	// owner: drags onto the Now card wrote top-level `{"move": {...}}` lines).
	// Mirrors `address()`'s own list branch just above, which already did this.
	if (is_list(node)) return [...hops(node.owner, host), node.name];

	const parent = node.parent;
	if (!parent) return [];   // detached from host — best effort, should not happen

	for (const [name, list] of Object.entries(parent.lists?.() ?? {})){
		const key = list.key(node);
		if (key == null || list.find(key) !== node) continue;
		const named = list_name(parent, name, list);
		return named ? [...hops(parent, host), named, key] : [...hops(parent, host), key];
	}

	if (node._slot != null && parent.get?.(node._slot) === node) return [...hops(parent, host), node._slot];

	return hops(parent, host);
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

export default Store;
