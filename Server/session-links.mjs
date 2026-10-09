// Server/session-links.mjs — for every session, the other records that belong to it, computed by reading the real folders.
// Used by SessionIndex (which writes the result into each snapshot as `links`). Nothing is stored anywhere new.
//
//   links = { parent, children: [id], cards: [path], tasks: [path], brief: path|null, report: path|null }
//
// A card folder (ai/YYYY/MM/DD/session-<id8>/) is joined by the first 8 characters of the id in its name.
// A task folder (ai/YYYY-MM-DD/<slug>/) is joined by the `session_id` in its task.jsonl. Paths are site URLs ("/framework/ai/...").
// The brief is the task's requirements.md; the report is its report.md (or findings.md), when the file exists.
import fs from "node:fs";
import path from "node:path";

const dirs = p => { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name); } catch { return []; } };
const has = p => { try { return fs.statSync(p).isFile(); } catch { return false; } };

/** Map id8 -> [card url] and id -> [{ url, brief, report }] for the whole ai/ folder. */
export function scan(ai){
	const cards = new Map(), tasks = new Map();
	for (const y of dirs(ai).filter(n => /^\d{4}$/.test(n))) for (const m of dirs(path.join(ai, y))) for (const d of dirs(path.join(ai, y, m)))
		for (const s of dirs(path.join(ai, y, m, d)).filter(n => n.startsWith("session-"))){
			const k = s.slice(8, 16); if (!cards.has(k)) cards.set(k, []);
			cards.get(k).push(`/framework/ai/${y}/${m}/${d}/${s}/`);
		}
	for (const d of dirs(ai).filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n))) for (const t of dirs(path.join(ai, d))){
		let log; try { log = fs.readFileSync(path.join(ai, d, t, "task.jsonl"), "utf8"); } catch { continue; }
		const dir = path.join(ai, d, t), url = `/framework/ai/${d}/${t}/`;
		const rec = { url, brief: has(path.join(dir, "requirements.md")) ? url + "requirements.md" : null, report: ["report.md", "findings.md"].map(f => has(path.join(dir, f)) ? url + f : null).find(Boolean) ?? null };
		for (const id of new Set([...log.matchAll(/"session_id":"([0-9a-f-]{36})"/g)].map(x => x[1]))){ if (!tasks.has(id)) tasks.set(id, []); tasks.get(id).push(rec); }
	}
	return { cards, tasks };
}

/** The links of one snapshot. `kids` is a Map parent id -> [child id]. */
export function links_of(snap, { cards, tasks }, kids){
	const t = tasks.get(snap.id) ?? [];
	return {
		parent: snap.parent ?? null, children: kids.get(snap.id) ?? [],
		cards: cards.get(snap.id.slice(0, 8)) ?? [], tasks: t.map(x => x.url),
		brief: t.find(x => x.brief)?.brief ?? null, report: t.find(x => x.report)?.report ?? null,
	};
}

/** Map parent id -> [child ids] from a list of snapshots. */
export function children_map(snaps){
	const kids = new Map();
	for (const s of snaps) if (s.parent){ if (!kids.has(s.parent)) kids.set(s.parent, []); kids.get(s.parent).push(s.id); }
	return kids;
}
