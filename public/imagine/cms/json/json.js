/* A page tree that exists as DATA — `page.json` is the snapshot, `page.jsonl` the deltas.

   Loading is: fetch the snapshot, replay the log in order. Editing is: append ONE line.
   Compacting is: write the replayed state back as the snapshot and empty the log — which
   is the whole reason for the pair, because it bounds the json at the size of the tree it
   describes while the log stays append-only.

   Nothing here is new machinery. `Page.declare()` has always taken a `children` object of
   plain objects and built a real Page per entry, recursively — so `config()` below is the
   entire translation from data to routable pages, and core does not know the difference. */

import { md, div, p } from "/app.js";
import Socket from "/framework/dev/Socket/Socket.js";

// ════ BLOCKS — and the escape hatch ═══════════════════════════════════════
// A block names a RENDERER; js supplies it. Data can say anything registered here and
// nothing else, which is the honest bound on "a page made of json". Register from
// anywhere: `import { renderers } from ".../json.js"; renderers.chart = (block, page) => …`
export const renderers = {
	md: block => md(block.text ?? ""),
	cards: (block, page) => page.previews(),
};

export function block(one, page){
	const b = typeof one === "string" ? { type: "md", text: one } : one ?? {};
	const draw = renderers[b.type ?? "md"];

	if (draw) draw(b, page);
	else p.c("muted", `No renderer for block type "${b.type}" — register one in json.js.`);
}

export function body(node, page){
	const blocks = node?.blocks ?? [];
	blocks.length ? blocks.forEach(one => block(one, page)) : p.c("muted", "No blocks yet.");
}

// ════ THE TREE — a node IS a page config ══════════════════════════════════
// One node → the nested-POJO form `Page.declare()` already takes. The `children` object
// recurses through the same function, so a five-deep tree costs the same five lines.
export function config(node, name){
	return {
		title: node.title ?? name,
		icon: node.icon,
		description: node.description,
		width: node.width,
		node,

		// A `cards` block already draws my children, so core's own rail would list them
		// a second time (`layout` Q4 — a page shows each thing once).
		index: (node.blocks ?? []).some(one => one?.type === "cards"),

		content(){ this.$body = div.c("flow", () => { body(this.node, this); }); },

		// The live half of an edit: a delta MUTATES the node this page holds, so redrawing
		// this one box is redrawing from the new state — no reload, no rebuild. Structure
		// (a child added, a title changed) is next-load; readme.md says why.
		redraw(){ this.$body?.empty(() => body(this.node, this)); },

		children: Object.fromEntries(
			Object.entries(node.children ?? {}).map(([key, kid]) => [key, config(kid, key)])),
	};
}

// ════ DELTAS ══════════════════════════════════════════════════════════════
// `{at, op: "set"|"del"|"append", path, value}` — the contract, and the only thing a
// writer may put in the log. `path` walks the state; the last key is what changes.
export function apply(state, { op, path = [], value }){
	if (!path.length) return op === "set" ? value : state;

	let box = state;
	for (const key of path.slice(0, -1)) box = box[key] ??= {};
	const key = path.at(-1);

	if (op === "set") box[key] = value;
	else if (op === "del") Array.isArray(box) ? box.splice(key, 1) : delete box[key];
	else if (op === "append") (box[key] ??= []).push(value);
	else console.warn(`page.jsonl — unknown op "${op}"`, path);

	return state;
}

// ════ THE SOURCE — load, append, compact ══════════════════════════════════
export class Source {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	snapshot_url(){ return this.dir + "page.json"; }
	log_url(){ return this.dir + "page.jsonl"; }

	// `state` is the snapshot object MUTATED by the deltas — the same object every page
	// below holds a node of, so a later append shows up in a redraw with nothing rewired.
	async load(){
		const [snap, text] = await Promise.all([this.read(this.snapshot_url()), this.read(this.log_url())]);

		this.text = text ?? "";
		this.deltas = this.parse(this.text);
		this.state = this.deltas.reduce((state, delta) => apply(state, delta), JSON.parse(snap ?? "{}"));

		return this;
	}

	// ⚠ The SPA fallback answers a missing file with index.html at 200 — the content-type
	// IS the 404. `no-cache` because a tab reloaded right after a write must not replay
	// the log it had before it.
	async read(url){
		const res = await fetch(url, { cache: "no-cache" }).catch(() => null);
		if (!res?.ok || res.headers.get("content-type")?.includes("html")) return null;
		return res.text();
	}

	// A line that is not JSON is dropped and named — ext/JSONL's rule, and the only way an
	// append-only log survives one bad writer.
	parse(text){
		return text.split("\n").filter(Boolean).flatMap((line, i) => {
			try { return [JSON.parse(line)]; }
			catch { console.warn(`${this.log_url()}:${i + 1} — not JSON, dropped`); return []; }
		});
	}

	/* ONE LINE, and the snapshot is never touched.
	   `rpc:append` (`Server/plugins/SocketServer/Append.js`) opens the file with `"a"`, so
	   the write is the size of the LINE and two browsers editing at once interleave between
	   lines instead of each sending its own copy of the file and losing the other's.
	   ⚠ The whole-file `rpc:write` stays as the fallback: a dev server started before that
	     plugin landed answers nothing at all, and `async_rpc` waits forever for a reply that
	     is not coming — so the first append races a timeout and the verdict is remembered. */
	async append(delta){
		const line = { at: new Date().toISOString(), ...delta };
		const text = JSON.stringify(line);

		if (!await this.appended(text)) await this.write(this.log_url(), this.joined(text));

		this.text = this.joined(text);
		this.deltas.push(line);
		apply(this.state, line);

		return line;
	}

	// The log text plus one line, newline-terminated whichever way the file ended.
	joined(line){ return (!this.text || this.text.endsWith("\n") ? this.text : this.text + "\n") + line + "\n"; }

	async appended(line){
		if (!this.writable() || this.appendable === false) return false;

		const reply = await Promise.race([
			Socket.singleton().async_rpc("append", this.log_url(), line),
			new Promise(done => setTimeout(done, 2000, null)),
		]);
		return this.appendable = reply?.response === "append successful";
	}

	// The whole point of the pair: the replayed state BECOMES the snapshot and the log
	// starts again at zero bytes. Run it whenever the log outgrows the tree.
	async compact(){
		await this.write(this.snapshot_url(), JSON.stringify(this.state, null, "\t") + "\n");
		await this.write(this.log_url(), "");

		this.text = "";
		this.deltas = [];

		return this;
	}

	// Off localhost there is no dev socket, so the page goes read-only and says so — the
	// rule ext/Saver and the CMS editor already follow.
	writable(){ return !Socket.singleton().disabled; }

	async write(url, data){
		if (!this.writable()) throw new Error("read-only — there is no dev socket here");

		const reply = await Socket.singleton().async_rpc("write", url, data);
		if (reply?.response !== "write successful") throw new Error("the server refused the write");
	}

	bytes(){ return new Blob([this.text]).size; }
	lines(){ return this.deltas.length; }
}

/* The one Source this directory has. `page.js` loads it, `edit/` appends to it, and both
   hold the SAME state object — which is why an appended delta shows up in a live page
   without anything being passed between them.
   ⚠ Resolved against `import.meta`, never the document: the SPA fallback makes the
     document url whatever you navigated to. */
export const source = new Source({ dir: new URL(".", import.meta.url).pathname });

export default Source;
