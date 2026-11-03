/* SNAPSHOT: an item's saved shape at one moment, and how much of its log that covers. It lives in a sidecar file beside the log
   (`task.jsonl` -> `task.snapshot.json`), is a cache, and is never the truth: the log is. Why a sidecar, who writes it, who reads
   it, and the alternative not taken: core/Item/doc/snapshots.md.

   The file is one JSON object:
	   { snapshot: 2, log: "task.jsonl", lines: 8360, bytes: 912345, anchor: "<base64>", made_at: "…", state: {…toJSON…}, memory: […],
	     classes: ["Task"], code: "<hash of the replay code>" }
   `lines` and `bytes` say where the log is covered to (bytes is always just after a newline). `anchor` is the last 64 bytes of
   the covered part: a reader asks the server for the log from `bytes - 64`, and if those 64 bytes are not the anchor the log was
   rewritten and the snapshot is ignored. `memory` is the item's in-memory `_` fields that toJSON leaves out (a Task's last line
   time, a Session's settings), so a restored item behaves as the replayed one did.
   `classes` and `code`: the registered class names in the tree, and a hash of the source of those classes (and Item, Item.Store,
   Snapshot): a reader whose code hashes differently ignores the snapshot (the replay code changed since), and the script
   rewrites it. Which code is NOT hashed, and the hand-bumped Snapshot.REPLAY: core/Item/doc/snapshots.md.

   Portable: no node imports, works in a browser and in node. The writer is Server/Snapshots.mjs; the reader is Item.Store. */
const ANCHOR = 64;

// A value that survives JSON: a primitive, or an array / plain object of them.
const plain = value => value === null || ["string", "number", "boolean"].includes(typeof value)
	|| (Array.isArray(value) ? value.every(plain) : !!value && typeof value === "object" && value.constructor === Object && Object.values(value).every(plain));

const to_base64 = u8 => btoa(String.fromCharCode(...u8));
const from_base64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));

export default class Snapshot {

	static VERSION = 2;   // the shape of the file; 2 added `code` and `classes`, and memory now counts slot Items

	/* Bump by hand when you change replay code that the code version below cannot see: a module-level helper in Item.js or
	   List.js, List's own methods, Snapshot.js's helpers. Every class in the snapshot's tree (with its parents), Item.Store and
	   Snapshot itself are hashed for you. */
	static REPLAY = 1;

	// For Item.hydrate's `seen` argument: accept every id (hydrate renames a repeated id; a saved tree may repeat one in different lists).
	static any_id = { has: () => false, add(){} };

	constructor(fields = {}){ Object.assign(this, fields); }

	// `/x/task.jsonl` -> `/x/task.snapshot.json`; null for anything that is not a .jsonl.
	static url_for(log_url){
		const url = String(log_url);
		return /\.jsonl(\?.*)?$/.test(url) ? url.replace(/\.jsonl(\?.*)?$/, ".snapshot.json") : null;
	}

	// ---- making one (the script, in node) ----

	// Every item under `host` in a fixed order: the item, then (in each list) its members, and every Item held in a data slot
	// (`item.data.box` that is an Item whose `parent` is the item and `_slot` is "box": what adopt_slot makes), each followed by what is under it.
	static items(host){
		const out = [];
		const visit = item => item.walk(one => {
			out.push(one);
			for (const key of Object.keys(one.data ?? {})){ const value = one.data[key]; if (value && typeof value.walk === "function" && value.parent === one && value._slot === key) visit(value); }
		});
		visit(host);
		return out;
	}

	// Every data slot that holds an Item, as [index of its owner in items(), key].
	static slots(host){
		return Snapshot.items(host).flatMap((item, index) => Object.keys(item.data ?? {}).filter(key => item.data[key]?.parent === item && item.data[key]._slot === key && typeof item.data[key].walk === "function").map(key => [index, key]));
	}

	// The in-memory `_` fields of every item under `host` (lists' members and slot Items too, see items()), as [[index, {_key: value}], …] (only items that have any).
	static memory_of(host){
		const out = [];
		Snapshot.items(host).forEach((item, index) => {
			const props = {};
			for (const key of Object.keys(item).sort()) if (key.startsWith("_") && item[key] !== undefined && plain(item[key])) props[key] = JSON.parse(JSON.stringify(item[key]));
			if (Object.keys(props).length) out.push([index, props]);
		});
		return out;
	}

	// Put memory back onto `host`'s items, by index in items().
	static apply_memory(host, memory = []){
		const by_index = new Map(memory);
		Snapshot.items(host).forEach((item, index) => { const props = by_index.get(index); if (props) Object.assign(item, JSON.parse(JSON.stringify(props))); });
	}

	// What two items must share to be "the same": the saved shape, each item's class, id and state (slot Items included), and the in-memory fields above.
	// `root_id: false` leaves the root's own id out: an item whose log never named one gets a fresh random id on every replay.
	static fingerprint(host, { root_id = true } = {}){
		const json = host.toJSON();
		const rows = Snapshot.items(host).map(item => [item.constructor.name, item === host && !root_id ? null : item.id, item.get_one?.("state") ?? null]);
		return JSON.stringify([root_id ? json : { ...json, id: null }, rows, Snapshot.memory_of(host)]);
	}

	// ---- the code version: a snapshot is only good for the replay code that made it ----

	// A short hash (cyrb53, 53 bits as hex): a cache key, not security. Line endings are ignored (a Windows checkout has CRLF).
	static hash(text){
		let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
		for (let i = 0; i < text.length; i++){
			const c = text.charCodeAt(i);
			if (c === 13) continue;
			h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677);
		}
		h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
		h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
		return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
	}

	// The registered names of the classes of every item under `host` (sorted, no repeats): what a reader needs to find the same classes.
	static classes_of(host){
		const names = host.constructor.names;
		return [...new Set(Snapshot.items(host).map(item => names.get(item.constructor)).filter(Boolean))].sort();
	}

	/* The code version for these class names: a hash of the source text of each class (and each parent class up to Item), of
	   Item.Store, of Snapshot, and of REPLAY. `Item` is the base class (it holds the registry `types` and `Store`). Answers
	   null when a name is not a registered class here (the reader does not have the code the snapshot was made with). Any edit to
	   those sources, even a comment, changes it: a snapshot then goes stale and is rebuilt, which is the safe direction. */
	static code_version(Item, names){
		const parts = new Set([Snapshot, Item.Store]);
		for (const name of names){
			let Class = Item.types.get(name);
			if (!Class) return null;
			for (; typeof Class === "function" && Class !== Function.prototype; Class = Object.getPrototypeOf(Class)) parts.add(Class);
		}
		const sources = [...parts].filter(Boolean).map(part => `${part.name}\n${Function.prototype.toString.call(part)}`).sort();
		return Snapshot.hash(`${Snapshot.REPLAY}\n${sources.join("\n\u0000\n")}`);
	}

	// Why this snapshot cannot be used with the code running now, or null when it can. `Item` is the Item class.
	stale_reason(Item){
		const now = Snapshot.code_version(Item, this.classes);
		return now !== null && now === this.code ? null : "it was made by other replay code (the code version differs)";
	}

	// A snapshot of `host` that covers `lines` lines and `bytes` bytes of the log, whose last bytes are `covered_end`.
	static of(host, { log, lines, bytes, covered_end, made_at }){
		const classes = Snapshot.classes_of(host);
		return new Snapshot({
			snapshot: Snapshot.VERSION, log, lines, bytes, anchor: to_base64(covered_end.subarray(Math.max(0, covered_end.length - ANCHOR))),
			made_at, state: JSON.parse(JSON.stringify(host.toJSON())), memory: Snapshot.memory_of(host),
			classes, code: Snapshot.code_version(host.constructor, classes),
		});
	}

	toJSON(){ const { snapshot, log, lines, bytes, anchor, made_at, state, memory, classes, code } = this; return { snapshot, log, lines, bytes, anchor, made_at, state, memory, classes, code }; }

	// ---- reading one (Item.Store, in a browser or in node) ----

	// The sidecar of a log, or null: not there (404, or the dev server's html fallback), not JSON, or not a version we know.
	static async fetch(log_url){
		const url = Snapshot.url_for(log_url);
		if (!url) return null;
		const res = await fetch(url).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
		let json;
		try { json = await res.json(); } catch { return null; }
		const ok = json && json.snapshot === Snapshot.VERSION && Number.isInteger(json.lines) && Number.isInteger(json.bytes) && json.bytes > 0
			&& typeof json.anchor === "string" && json.state && typeof json.state === "object" && typeof json.code === "string" && Array.isArray(json.classes);
		return ok ? new Snapshot(json) : null;
	}

	get anchor_bytes(){ return from_base64(this.anchor); }

	/* Ask the server for the log from the anchor on and check the anchor. `tail: true` asks for everything after it too (a static
	   host, one request); `tail: false` asks for the anchor alone (the dev server, which then streams the tail by offset).
	   Answers the tail's text ("" when `tail` is false), or null when the log does not match this snapshot. A server that ignores
	   Range and answers 200 with the whole file is handled: we cut it ourselves. */
	async check(log_url, { tail }){
		const anchor = this.anchor_bytes, from = this.bytes - anchor.length;
		const res = await fetch(log_url, { headers: { Range: `bytes=${from}-${tail ? "" : this.bytes - 1}` } }).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;   // 416: the log is shorter than the snapshot's offset
		let got = new Uint8Array(await res.arrayBuffer());
		if (res.status === 200) got = got.subarray(from);
		if (got.length < anchor.length || anchor.some((byte, i) => got[i] !== byte)) return null;
		return tail ? new TextDecoder().decode(got.subarray(anchor.length)) : "";
	}
}
