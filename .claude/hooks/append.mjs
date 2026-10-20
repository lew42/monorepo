// append.mjs — append the objects in <lines.json> to <target.jsonl>, one JSON line each.
// Every string value that is exactly "NOW" becomes the local clock at the moment of the append
// (ISO 8601 with offset) — never a time typed from memory.
//
// VALIDATED FIRST (2026-09-30): every new line is judged against the target's schema
// (jsonl-schema.mjs, picked by the file's basename: task.jsonl, day.jsonl, board.jsonl,
// asks.jsonl, page.jsonl). An unknown verb, a flat line with no verb, or a verb missing a
// required field is REFUSED — exit 3, nothing written, the reason and the right shape printed.
// A file the schema does not know is only checked for being JSON objects. Old lines are never judged.
//
// The trailing newline is sniffed (a file written by the Write tool has none), the lines are
// appended, and every line of the target is re-parsed; a bad line exits non-zero and names itself.
// usage: node .claude/hooks/append.mjs <target.jsonl> <lines.json>
import { readFileSync, appendFileSync, existsSync, statSync, openSync, readSync, closeSync, mkdirSync } from "node:fs";
import { check, shape } from "./jsonl-schema.mjs";
import { resolve as resolve_path, dirname, basename, join } from "node:path";
import TaskDirs from "../../Server/TaskDirs.mjs";
import SessionRecord from "../../Server/SessionRecord.mjs";

const LANDING_CHECKLIST = `
BEFORE THIS TASK CLOSES (CLAUDE.md law 9 — document the structure as you build). Answer each in your landing message or fix it now:
  [ ] README UPDATED: the readme of every system you touched states what it is, its exact on-disk structure, and how it works NOW (no history, no dated owner quotes; those go to doc/*.md).
  [ ] WRITER STATED: it names which tool/script/function writes the data and where that is called from (file path).
  [ ] READER STATED: it names which class/page reads the data.
  [ ] LINKED: the readme is linked from its parent readme, and any new doc/*.md from the readme.
  [ ] VERIFIED: each claim was checked against the code or live data, not remembered.
If an agent would have to investigate to learn how your system works, the readme failed: fix it in this task.`;
const pad = n => String(n).padStart(2, "0");
function nowLocal(){
	const d = new Date(), off = -d.getTimezoneOffset(), a = Math.abs(off);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off < 0 ? "-" : "+"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}
function fill(v, t){
	if (v === "NOW") return t;
	if (Array.isArray(v)) return v.map(x => fill(x, t));
	if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x, t)]));
	return v;
}

let [target, source] = process.argv.slice(2);
if (!target || !source) { console.error("usage: node append.mjs <target.jsonl> <lines.json>"); process.exit(2); }
{
	// THE GUARD (2026-10-13): a moved or findable old path is followed; anything else new under ai/YYYY-MM-DD/ is refused, naming the right place.
	const abs = resolve_path(target);
	const m = /[\\/]public[\\/]framework[\\/]ai[\\/](\d{4}-\d{2}-\d{2})[\\/]day\.jsonl$/.exec(abs);
	let now;
	try { now = m ? join(TaskDirs.day_dir(m[1]), "day.jsonl") : existsSync(dirname(abs)) ? TaskDirs.follow(abs) : TaskDirs.refuse(abs); }
	catch (e){ console.error(e.message + "\nNothing was written."); process.exit(3); }
	if (now !== abs){ mkdirSync(dirname(now), { recursive: true }); console.error(`(old path followed: ${target} -> ${now})`); target = now; }
}
const strip_bom = s => s.replace(/^﻿/, "");
const items = JSON.parse(strip_bom(readFileSync(source, "utf8")));
const list = Array.isArray(items) ? items : [items];
// A session folder's record is session.jsonl (Server/SessionRecord.mjs): a line meant for its task.jsonl goes to the moved record, and a NEW
// session folder (directly under a day, first line carries its own session_id) starts as session.jsonl. A task folder keeps task.jsonl.
if (basename(target) === "task.jsonl" && !existsSync(target)) { const to = SessionRecord.start_file(dirname(resolve_path(target)), list[0]); if (basename(to) === "session.jsonl") { console.error(`(session record: ${target} -> ${to})`); target = to; } }
const t = nowLocal();
// Every line gets a time even when the writer forgot "NOW": an object body with no `at` (or landed_at / requested_at) gets `at` (ai-system/logging.md).
const stamp = o => {
	const keys = Object.keys(o ?? {});
	const body = keys.length === 1 ? o[keys[0]] : null;
	if (body && typeof body === "object" && !Array.isArray(body) && !body.at && !body.landed_at && !body.requested_at && !o.at) return { [keys[0]]: { at: t, ...body } };
	if (keys.length > 1 && !o.at && !o.landed_at) return { at: t, ...o };
	return o;
};
// A timed verb whose `at` is missing or a bare date gets the current local time (a bare date reads as UTC midnight elsewhere); never refused.
const TIMED = ["finish", "complete", "stop", "start", "log", "decision"];
const fix_date = (o, i) => {
	const verb = Object.keys(o ?? {}).find(k => TIMED.includes(k));
	const body = verb && o[verb];
	if (!body || typeof body !== "object" || Array.isArray(body)) return o;
	if (body.at && !/^\d{4}-\d{2}-\d{2}$/.test(body.at)) return o;
	console.error(`(line ${i + 1}: ${verb}.at was ${body.at ? `the bare date ${body.at}` : "missing"}; filled with ${t})`);
	return { ...o, [verb]: { ...body, at: t } };
};
const filled = list.map((o, i) => fix_date(stamp(fill(o, t)), i));

const refused = filled.map((o, i) => [i, check(target, o)]).filter(([, why]) => why);
if (refused.length){
	for (const [i, why] of refused) console.error(`REFUSED line ${i + 1} of ${source}: ${why}\n  ${JSON.stringify(list[i]).slice(0, 160)}`);
	const s = shape(target);
	if (s) console.error(`The right shape — ${s}`);
	console.error(`Nothing was written to ${target}.`);
	process.exit(3);
}

let out = filled.map(o => JSON.stringify(o)).join("\n") + "\n";
if (existsSync(target) && statSync(target).size > 0) {
	const size = statSync(target).size, fd = openSync(target, "r"), buf = Buffer.alloc(1);
	readSync(fd, buf, 0, 1, size - 1); closeSync(fd);
	if (buf[0] !== 0x0a) out = "\n" + out;
}
appendFileSync(target, out, "utf8");
const lines = readFileSync(target, "utf8").split(/\r?\n/).filter(l => l.trim());
let bad = 0;
lines.forEach((l, i) => { try { JSON.parse(l); } catch { bad++; console.error(`BAD line ${i + 1}: ${l.slice(0, 100)}`); } });
console.log(`${target}: appended ${list.length} at ${t}; ${lines.length} lines total, ${bad} bad`);
// THE LANDING GATE (law 9): the line that lands a task answers back with the documentation checklist, in the tool's own response, so it is seen, not remembered.
if (!bad && filled.some(o => o?.assign?.landed_at || o?.landed_at)) console.log(LANDING_CHECKLIST);
process.exit(bad ? 1 : 0);
