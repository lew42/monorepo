// Dated: one collection filed by day, <root>/YYYY/MM/DD/<slug>/, with one pointer row per item in the day's index file.
// Portable (browser + node, no node imports). Node writes it through Server/DatedFiles.mjs. Plan: core/Item/doc/store-index-query-plan.md
import Item from "./Item.js";
import Day from "../Session/Day.js";

export default class Dated {
	/** The registry: one entry per collection. `root` has a `{module}` slot; `index` is the folder holding the YYYY/MM/DD/index.jsonl day streams. */
	static collections = {
		projects: { kind: "project", file: "project.jsonl", root: "public/framework/{module}/projects", index: "public/framework/ai/sessions" },
	};

	constructor(name = "projects", spec = Dated.collections[name]){
		if (!spec) throw new Error(`Dated: unknown collection "${name}"`);
		this.name = name;
		Object.assign(this, spec);
	}

	/** The folder of one item: <root>/YYYY/MM/DD/<slug>. `day` is any time Day.of accepts. */
	path(day, slug, module){
		const root = this.root.replace("{module}", String(module ?? "").replace(/^\/|\/$/g, ""));
		return `${root}/${Day.path(day)}/${slug}`;
	}

	/** The day's stream: <index>/YYYY/MM/DD/index.jsonl. */
	index_path(day){ return `${this.index}/${Day.path(day)}/index.jsonl`; }

	/** The days of a range (inclusive "YYYY-MM-DD" strings). */
	static days(from, to = from){
		const out = [], d = new Date(from + "T12:00:00"), end = new Date(to + "T12:00:00");
		for (; d <= end; d.setDate(d.getDate() + 1)) out.push(Day.of(d));
		return out;
	}

	/** Rows for a range of days. `load(day)` returns that day's parsed lines (a node reader, or a fetch in the browser). A later line for an id updates its row. */
	async rows({ from, to, load } = {}){
		const out = new Map();
		for (const day of Dated.days(from, to)) {
			for (const row of Dated.Index.replay(await load(day)).rows) if (row.kind === this.kind) out.set(row.id, { ...out.get(row.id), ...row });
		}
		return [...out.values()];
	}
}

/** One day's index file replayed: a pointer row per item, never a copy. Open its url to tail it live: `await Dated.Index.open(url)`. */
Dated.Index = class DatedIndex extends Item {
	rows = [];
	/** Each line is {<kind>: {id, path, title, state, at, …}}; the one object-valued key names the kind. */
	replay_line(line){
		const kind = Object.keys(line).find(k => line[k] && typeof line[k] === "object" && !Array.isArray(line[k]));
		if (!kind || !line[kind].id) return;
		const row = { kind, ...line[kind] }, i = this.rows.findIndex(r => r.kind === kind && r.id === row.id);
		if (i < 0) this.rows.push(row); else this.rows[i] = { ...this.rows[i], ...row };
		this.emit?.("rows", this.rows);
	}
};
