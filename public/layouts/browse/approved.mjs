// The approved-layout list, read from Node — for `Server/review.mjs`,
// `Server/layout-check.mjs`, or any future page review that wants to ask "is this
// page built on an approved layout?" without loading a browser module (the
// browser's own reader of the same file is `approved_list()` in `./decide.js`;
// this is the Node twin, same file, same rule: the newest verdict on an id wins).
//
// (the owner, 2026-10-03, roadmap item 7: "Then an `approved` list that page
// reviews check against.") The file itself is the one source of truth —
// `/layouts/verdicts.jsonl`, append-only, one line per press, written by the
// owner only (browse/verdicts.js's own header). Reading it from Node is a plain
// `fs.readFileSync` + one `JSON.parse` per line; nothing here writes it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "verdicts.jsonl");

// Every row, oldest first, exactly as the file holds them. A missing file is not
// an error — it means nothing has been judged yet (same rule the browser side
// follows), so this returns `[]` rather than throwing.
export function readRows(file = FILE){
	if (!fs.existsSync(file)) return [];
	return fs.readFileSync(file, "utf8")
		.split("\n")
		.filter(Boolean)
		.map(line => { try { return JSON.parse(line).verdict; } catch { return null; } })
		.filter(Boolean);
}

// The ids whose NEWEST verdict is "approve" — the whole list, or narrowed to the
// `ids` a caller already has in hand (e.g. a page review checking its own layout
// id against the list, rather than asking for everything ever judged).
export function approvedIds(ids, file = FILE){
	const rows = readRows(file);
	const latest = new Map();
	for (const row of rows) latest.set(row.item, row);   // append-only + in-order → last write wins

	const candidates = ids ?? [...latest.keys()];
	return candidates.filter(id => latest.get(id)?.say === "approve");
}

// One id, the plain question a page review actually asks.
export function isApproved(id, file = FILE){
	return approvedIds([id], file).length === 1;
}
