/* Landings — every landed task, one row each, computed from the tasks' own task.jsonl (the record).
 *   node Landings.mjs            print how many landings exist and how many the index lacks
 *   node Landings.mjs --append   append the missing ones to timeline/landings.jsonl (append-only, never rewrites)
 * Doc: doc/inbox-data.md. Browser reader: Timeline.js. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default class Landings {
	static HERE = path.dirname(fileURLToPath(import.meta.url));
	static ROOT = path.resolve(Landings.HERE, "../../../../../..");          // the repo
	static AI = path.join(Landings.ROOT, "public/framework/ai");
	static INDEX = path.join(Landings.HERE, "timeline/landings.jsonl");
	static SUB_MAX = 140;

	/** Every task.jsonl under ai/. */
	static files(dir = Landings.AI, out = []){
		for (const e of fs.readdirSync(dir, { withFileTypes: true })){
			if (e.name === "node_modules" || e.name.startsWith(".")) continue;
			const p = path.join(dir, e.name);
			if (e.isDirectory()) Landings.files(p, out);
			else if (e.name === "task.jsonl") out.push(p);
		}
		return out;
	}

	static lines(file){
		return fs.readFileSync(file, "utf8").split("\n").filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
	}

	/** The outcome's first readable sentence: markdown stripped, one line. */
	static sub(outcome = ""){
		const line = String(outcome).split("\n").map(s => s.trim()).find(s => s && !s.startsWith("![")) ?? "";
		const plain = line.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`#>]/g, "").replace(/^- \[[x ]\]\s*/i, "").trim();
		return plain.length > Landings.SUB_MAX ? plain.slice(0, Landings.SUB_MAX - 1) + "…" : plain;
	}

	/** A site page or demo: a path on this site that is not a doc, image or data file. */
	static is_page(url){ return typeof url === "string" && url.startsWith("/") && !/\.(md|png|jpe?g|gif|svg|jsonl?|txt)([?#]|$)/i.test(url); }

	/** One row per landing line of one task (a task can land more than once). */
	static rows_of(file){
		const dir = "/" + path.relative(path.join(Landings.ROOT, "public"), path.dirname(file)).replaceAll("\\", "/") + "/";   // the task folder as a site url
		const lines = Landings.lines(file);
		const card = lines.map(l => l.assign?.card).filter(Boolean).at(0) ?? null;
		const title0 = lines.map(l => l.assign?.title).filter(Boolean).at(0) ?? null;
		return lines.filter(l => l.assign?.landed_at).map((l, n) => {
			const a = l.assign, links = (Array.isArray(a.links) ? a.links : []).filter(k => k?.url).map(k => ({ url: k.url, label: k.label ?? null }));
			const md_links = [...String(a.outcome ?? "").matchAll(/\]\((\/[^)\s]+)\)/g)].map(m => m[1]);
			const page = links.map(k => k.url).concat(md_links).find(Landings.is_page) ?? null;
			// Kept small (the index is committed): `id` is the task folder url (+ "#n" for a later landing); the rest is one preview.
			return {
				id: dir + (n ? "#" + n : ""), at: Date.parse(a.landed_at) ? new Date(a.landed_at).toISOString() : null,
				title: a.title ?? title0 ?? path.basename(dir), sub: Landings.sub(a.outcome), page, card,   // links + the full outcome stay in the task log
			};
		});
	}

	/** Big things only: it has a page or demo, or the owner was given a card for it (Timeline.js applies the same test). */
	static big(r){ return !!(r.page || r.card); }

	static all(){ return Landings.files().flatMap(f => Landings.rows_of(f)).filter(r => r.at).sort((a, b) => Date.parse(a.at) - Date.parse(b.at)); }

	static indexed(){ return fs.existsSync(Landings.INDEX) ? new Set(Landings.lines(Landings.INDEX).map(l => l.landed?.id)) : new Set(); }

	/** Append, oldest first, every landing the index does not hold yet. */
	static append(){
		const have = Landings.indexed(), add = Landings.all().filter(r => !have.has(r.id));
		fs.mkdirSync(path.dirname(Landings.INDEX), { recursive: true });
		if (add.length) fs.appendFileSync(Landings.INDEX, add.map(r => JSON.stringify({ landed: r })).join("\n") + "\n");
		return { appended: add.length, total: have.size + add.length };
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	if (process.argv.includes("--append")) console.log(Landings.append());
	else { const all = Landings.all(), have = Landings.indexed(); console.log({ landings: all.length, big: all.filter(Landings.big).length, missing: all.filter(r => !have.has(r.id)).length }); }
}
