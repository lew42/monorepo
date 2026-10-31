/* SNAPSHOT: an item's saved shape at one moment, and how much of its log that covers. It lives in a sidecar file beside the log
   (`task.jsonl` -> `task.snapshot.json`), is a cache, and is never the truth: the log is. Why a sidecar, who writes it, who reads
   it, and the alternative not taken: core/Item/doc/snapshots.md.

   The file is one JSON object:
	   { snapshot: 1, log: "task.jsonl", lines: 8360, bytes: 912345, anchor: "<base64>", made_at: "…", state: {…toJSON…}, memory: […] }
   `lines` and `bytes` say where the log is covered to (bytes is always just after a newline). `anchor` is the last 64 bytes of
   the covered part: a reader asks the server for the log from `bytes - 64`, and if those 64 bytes are not the anchor the log was
   rewritten and the snapshot is ignored. `memory` is the item's in-memory `_` fields that toJSON leaves out (a Task's last line
   time, a Session's settings), so a restored item behaves as the replayed one did.

   Portable: no node imports, works in a browser and in node. The writer is Server/Snapshots.mjs; the reader is Item.Store. */
const ANCHOR = 64;

// A value that survives JSON: a primitive, or an array / plain object of them.
const plain = value => value === null || ["string", "number", "boolean"].includes(typeof value)
	|| (Array.isArray(value) ? value.every(plain) : !!value && typeof value === "object" && value.constructor === Object && Object.values(value).every(plain));

const to_base64 = u8 => btoa(String.fromCharCode(...u8));
const from_base64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));

export default class Snapshot {

	static VERSION = 1;

	constructor(fields = {}){ Object.assign(this, fields); }

	// `/x/task.jsonl` -> `/x/task.snapshot.json`; null for anything that is not a .jsonl.
	static url_for(log_url){
		const url = String(log_url);
		return /\.jsonl(\?.*)?$/.test(url) ? url.replace(/\.jsonl(\?.*)?$/, ".snapshot.json") : null;
	}

	// ---- making one (the script, in node) ----

	// The in-memory `_` fields of every item under `host`, as [[walk index, {_key: value}], …] (only items that have any).
	static memory_of(host){
		const out = [];
		let index = 0;
		host.walk(item => {
			const props = {};
			for (const key of Object.keys(item)) if (key.startsWith("_") && item[key] !== undefined && plain(item[key])) props[key] = JSON.parse(JSON.stringify(item[key]));
			if (Object.keys(props).length) out.push([index, props]);
			index++;
		});
		return out;
	}

	// Put memory back onto `host`'s items, by walk index.
	static apply_memory(host, memory = []){
		const by_index = new Map(memory);
		let index = 0;
		host.walk(item => { const props = by_index.get(index++); if (props) Object.assign(item, JSON.parse(JSON.stringify(props))); });
	}

	// What two items must share to be "the same": the saved shape, each item's class, id and state, and the in-memory fields above.
	static fingerprint(host){
		const rows = [];
		host.walk(item => rows.push([item.constructor.name, item.id, item.get_one?.("state") ?? null]));
		return JSON.stringify([host.toJSON(), rows, Snapshot.memory_of(host)]);
	}

	// A snapshot of `host` that covers `lines` lines and `bytes` bytes of the log, whose last bytes are `covered_end`.
	static of(host, { log, lines, bytes, covered_end, made_at }){
		return new Snapshot({
			snapshot: Snapshot.VERSION, log, lines, bytes, anchor: to_base64(covered_end.subarray(Math.max(0, covered_end.length - ANCHOR))),
			made_at, state: JSON.parse(JSON.stringify(host.toJSON())), memory: Snapshot.memory_of(host),
		});
	}

	toJSON(){ const { snapshot, log, lines, bytes, anchor, made_at, state, memory } = this; return { snapshot, log, lines, bytes, anchor, made_at, state, memory }; }

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
			&& typeof json.anchor === "string" && json.state && typeof json.state === "object";
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
