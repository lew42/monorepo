// Moves every older session folder into the ONE store, the ai date tree: ai/YYYY/MM/DD/session-<first 8 of the id>/ .
// Two older shapes are moved: the flat ai/sessions/<id>/ and the interim ai/sessions/YYYY/MM/DD/<id>/. The day is the day of
// an existing card folder with that name, else the day of first_at. A plain rename (or, when the card folder already exists,
// its files are moved in beside the card's page.jsonl); nothing is regenerated. The only thing deleted is the stray
// files.jsonl folder listing a dev server once wrote into each cache folder. Safe to run again.
// A folder with no known first_at and no card stays where it is.
//   node Server/session-place.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Session from "../public/framework/ai/sessions/Session.js";

const DIR = process.env.SESSIONS_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "framework", "ai", "sessions");
const dry = process.argv.includes("--dry");
// Every move is recorded old -> new (paths relative to ai/) so the whole conversion can be reversed by a script. --manifest <file> overrides the default.
const mi = process.argv.indexOf("--manifest");
const MANIFEST = mi > 0 ? process.argv[mi + 1] : path.join(DIR, "..", "2026-10-08", "session-class", "moves.jsonl");
const manifest = [];
const rel = p => path.relative(path.join(DIR, ".."), p).replaceAll("\\", "/");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// first_at from the cache's newest summary, else the earliest `at` in the hand-written record.
function first_at_of(dir){
	let first = null;
	try { for (const l of fs.readFileSync(path.join(dir, "cache.jsonl"), "utf8").split("\n")) if (l.startsWith('{"summary"')) { try { first = JSON.parse(l).summary.first_at ?? first; } catch {} } } catch {}
	if (first) return first;
	try { for (const l of fs.readFileSync(path.join(dir, "session.jsonl"), "utf8").split("\n")) if (l.trim()) { try { const at = JSON.parse(l).at; if (at && (!first || at < first)) first = at; } catch {} } } catch {}
	return first;
}

// every old folder: [id, dir]
const found = [];
for (const a of fs.readdirSync(DIR)){
	const p = path.join(DIR, a);
	if (UUID.test(a) && fs.statSync(p).isDirectory()) found.push([a, p]);
	else if (/^\d{4}$/.test(a) && fs.statSync(p).isDirectory())
		for (const m of fs.readdirSync(p)) for (const d of fs.readdirSync(path.join(p, m))) for (const id of fs.readdirSync(path.join(p, m, d)))
			if (UUID.test(id)) found.push([id, path.join(p, m, d, id)]);
}

let moved = 0, undated = 0, listings = 0;
const cards = await Session.card_days();
for (const [id, dir] of found){
	const listing = path.join(dir, "files.jsonl");
	if (fs.existsSync(listing)){ listings++; if (!dry) fs.rmSync(listing); }
	const first = first_at_of(dir);
	if (!first && !cards.has(Session.short(id))){ undated++; continue; }
	if (dry){ moved++; continue; }
	const to = fileURLToPath(await Session.locate(id, first));
	if (path.resolve(to) !== path.resolve(dir)) manifest.push(JSON.stringify({ id, from: rel(dir), to: rel(to) }));
	moved++;
}
if (!dry && manifest.length){ fs.mkdirSync(path.dirname(MANIFEST), { recursive: true }); fs.appendFileSync(MANIFEST, manifest.join("\n") + "\n"); }
// the empty day folders the interim shape leaves behind
if (!dry) for (const y of fs.readdirSync(DIR)) if (/^\d{4}$/.test(y)) { const prune = d => { for (const n of fs.readdirSync(d)) { const q = path.join(d, n); if (fs.statSync(q).isDirectory()) prune(q); } if (!fs.readdirSync(d).length) fs.rmdirSync(d); }; prune(path.join(DIR, y)); }
console.log(`${dry ? "would move" : "moved"} ${moved} session folders into the date tree (${undated} left where they are: no first_at), removed ${listings} files.jsonl listings`);
