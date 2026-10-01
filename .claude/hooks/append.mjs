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
import { readFileSync, appendFileSync, existsSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { check, shape } from "./jsonl-schema.mjs";

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

const [target, source] = process.argv.slice(2);
if (!target || !source) { console.error("usage: node append.mjs <target.jsonl> <lines.json>"); process.exit(2); }
const strip_bom = s => s.replace(/^﻿/, "");
const items = JSON.parse(strip_bom(readFileSync(source, "utf8")));
const list = Array.isArray(items) ? items : [items];
const t = nowLocal();
const filled = list.map(o => fill(o, t));

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
process.exit(bad ? 1 : 0);
