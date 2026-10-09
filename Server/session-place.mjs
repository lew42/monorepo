// Moves every flat session folder (ai/sessions/<id>/) into its day (ai/sessions/YYYY/MM/DD/<id>/), the day of its
// first_at. A plain rename: nothing is regenerated or deleted except the stray files.jsonl folder listings, which are noise.
// Safe to run again: a folder already in its day is left alone. Folders with no known first_at (empty sessions, test fixtures) stay where they are.
//   node Server/session-place.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Session from "../public/framework/ai/sessions/Session.js";

const DIR = process.env.SESSIONS_ROOT || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "framework", "ai", "sessions");
const dry = process.argv.includes("--dry");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// first_at from the cache's newest summary, else the earliest `at` in the hand-written record.
function first_at_of(dir){
	let first = null;
	try { for (const l of fs.readFileSync(path.join(dir, "cache.jsonl"), "utf8").split("\n")) if (l.startsWith('{"summary"')) { try { first = JSON.parse(l).summary.first_at ?? first; } catch {} } } catch {}
	if (first) return first;
	try { for (const l of fs.readFileSync(path.join(dir, "session.jsonl"), "utf8").split("\n")) if (l.trim()) { try { const at = JSON.parse(l).at; if (at && (!first || at < first)) first = at; } catch {} } } catch {}
	return first;
}

let moved = 0, undated = 0, listings = 0;
for (const id of fs.readdirSync(DIR)){
	if (!UUID.test(id)) continue;
	const dir = path.join(DIR, id);
	if (!fs.statSync(dir).isDirectory()) continue;
	const listing = path.join(dir, "files.jsonl");
	if (fs.existsSync(listing)){ listings++; if (!dry) fs.rmSync(listing); }
	const day = Session.day(first_at_of(dir));
	if (!day){ undated++; continue; }
	const to = path.join(DIR, ...day.split("/"), id);
	if (dry){ moved++; continue; }
	if (fs.existsSync(to)){ console.error("exists, left alone:", id); continue; }
	fs.mkdirSync(path.dirname(to), { recursive: true });
	fs.renameSync(dir, to);
	moved++;
}
console.log(`${dry ? "would move" : "moved"} ${moved} session folders (${undated} left flat: no first_at), removed ${listings} files.jsonl listings`);
