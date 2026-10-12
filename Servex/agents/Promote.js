import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Subpages from "./Subpages.js";

/* Promote one block of a page.jsonl page to its own child page, leaving a `part-link` in its place.
 * Append-only: the parent gets a `remove` and an `add` line, the child gets the block's lines; the manifest
 * is `<parent>/promoted.jsonl`, and `undo()` appends the reverse. doc: core/Page/doc/part-link.md
 * CLI: node Servex/agents/Promote.js <promote|undo> <parent-url> <block-id> [name] [--dry] [--root <tree>] */
export default class Promote {

	constructor(subpages, { dry = false } = {}){
		this.subs = subpages;
		this.dir = subpages.dir;
		this.file = path.join(this.dir, "page.jsonl");
		this.manifest = path.join(this.dir, "promoted.jsonl");
		this.dry = dry;
	}

	static at(url, opts = {}){ return new Promote(Subpages.at(url, opts), opts); }

	lines(){
		return fs.readFileSync(this.file, "utf8").split("\n").flatMap(text => { try { return text.trim() ? [JSON.parse(text)] : []; } catch { return []; } });
	}

	// Replay the content lines: the block's own add + updates, and the id before it (for `after`).
	find(id){
		const order = [], updates = [];
		let block = null;
		for (const line of this.lines()){
			const c = line.content;
			if (c?.add){
				for (const item of [].concat(c.add)){
					const at = item.after === undefined ? order.length : item.after === null ? 0 : order.indexOf(item.after) + 1;
					order.splice(at, 0, item.id);
					if (item.id === id) block = item;
				}
			}
			if (c?.remove) [].concat(c.remove).forEach(r => { const i = order.indexOf(r); if (i >= 0) order.splice(i, 1); });
			if (c?.move){
				const i = order.indexOf(c.move.id);
				if (i >= 0){ order.splice(i, 1); order.splice(c.move.after == null ? 0 : order.indexOf(c.move.after) + 1, 0, c.move.id); }
			}
			if (c?.order) order.splice(0, order.length, ...c.order);
			if (line[id] && !line.content) updates.push(line);
		}
		if (!block || !order.includes(id)) throw new Error(`no block ${id} in ${this.file}`);
		const i = order.indexOf(id);
		return { block, updates, after: i ? order[i - 1] : null };
	}

	promote({ id, name }){
		this.subs.check_name(name);
		const { block, updates, after } = this.find(id);
		const { after: _, ...item } = block;
		const title = block.title ?? String(block.text ?? name).split("\n")[0].slice(0, 60);
		const plan = { action: "promote", id, child: name, after, title };
		if (this.dry) return { ok: true, dry: true, ...plan };
		this.subs.add({ name, title });
		const child = path.join(this.dir, name, "page.jsonl");
		const add = obj => fs.appendFileSync(child, JSON.stringify(obj) + "\n");
		add({ content: { add: { ...item, after: null } } });
		updates.forEach(add);
		this.subs.append({ content: { remove: id } });
		this.subs.append({ content: { add: { type: "part-link", id, path: "./" + name + "/", title, after } } });
		fs.appendFileSync(this.manifest, JSON.stringify({ at: new Date().toISOString(), id, child: name, after, block, updates }) + "\n");
		return { ok: true, ...plan };
	}

	// The reverse: the original block returns where the link stands, and the child folder moves aside.
	undo({ id }){
		const found = fs.readFileSync(this.manifest, "utf8").trim().split("\n").map(l => JSON.parse(l)).reverse().find(m => m.id === id);
		if (!found) throw new Error(`no promotion of ${id} recorded`);
		const plan = { action: "undo", id, restores: found.child };
		if (this.dry) return { ok: true, dry: true, ...plan };
		this.subs.append({ content: { remove: id } });
		this.subs.append({ content: { add: { ...found.block, after: found.after } } });
		found.updates.forEach(u => this.subs.append(u));
		this.subs.remove(found.child);
		return { ok: true, ...plan };
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = process.argv.slice(2), dry = args.includes("--dry");
	const ri = args.indexOf("--root"), root = ri >= 0 ? args.splice(ri, 2)[1] : undefined;
	const [verb, url, id, name] = args.filter(a => a !== "--dry");
	try {
		const p = Promote.at(url, { dry, root });
		const out = verb === "promote" ? p.promote({ id, name: name ?? id }) : verb === "undo" ? p.undo({ id }) : null;
		if (!out) throw new Error("usage: Promote.js <promote|undo> <parent-url> <block-id> [name] [--dry] [--root <tree>]");
		console.log(JSON.stringify(out, null, 2));
	} catch (e){ console.error(e.message); process.exit(1); }
}
