// Server/session-links.mjs — what a session's own folder holds, and which other sessions it is tied to.
// Used by SessionIndex, which writes the result into each snapshot as `links`. Nothing is stored anywhere new.
//
//   links = { parent, children: [id], card, task, brief, report }
//
// Since one folder holds a whole session (doc/data-architecture-2026-10-08.md, section 12), the card, task, brief and report are just files
// inside it: <folder>/page.jsonl (the inbox card), <folder>/task/ (the task), <folder>/task/requirements.md (the brief), <folder>/task/report.md
// (the report; findings.md when there is no report). Only the ties BETWEEN sessions (parent, children) need computing. Paths are site URLs.
import fs from "node:fs";
import path from "node:path";

const has = p => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const is_dir = p => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

/** The links of one snapshot. `dir` is its folder on disk, `url` the folder's site URL (both may be unknown: then only parent and children). */
export function links_of(snap, dir, url, kids){
	const own = dir && url, t = own && is_dir(path.join(dir, "task")) ? url + "task/" : null;
	return {
		parent: snap.parent ?? null, children: kids.get(snap.id) ?? [],
		card: own && has(path.join(dir, "page.jsonl")) ? url + "page.jsonl" : null,
		task: t,
		brief: t && has(path.join(dir, "task", "requirements.md")) ? t + "requirements.md" : null,
		report: t ? ["report.md", "findings.md"].map(f => has(path.join(dir, "task", f)) ? t + f : null).find(Boolean) ?? null : null,
	};
}

/** Map parent id -> [child ids] from a list of snapshots. */
export function children_map(snaps){
	const kids = new Map();
	for (const s of snaps) if (s.parent){ if (!kids.has(s.parent)) kids.set(s.parent, []); kids.get(s.parent).push(s.id); }
	return kids;
}
