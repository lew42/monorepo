// jsonl-schema.test.mjs — does the schema agree with the readers, and does append.mjs obey it?
// usage: node .claude/hooks/jsonl-schema.test.mjs        (exit 0 = all pass)
//
// 1. AGREEMENT: each reader's `static verbs` is read from its SOURCE (no browser imports needed),
//    `...Parent.verbs` spreads resolved, a class with no list inheriting its parent's. Every reader
//    verb must be in the schema, and every schema verb must be in the reader unless it is listed
//    `pending` (reader not caught up yet) or marked `extra` (read somewhere else, e.g. groups.js).
//    A pending verb the reader already has FAILS too: the list must shrink the moment the reader catches up.
// 2. JUDGING: check() refuses a flat line and an unknown verb, accepts experiment and review.
// 3. END TO END: append.mjs on a throwaway task.jsonl refuses (exit 3, file untouched) and accepts.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { schemas, check, check_event } from "./jsonl-schema.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..", "..");
let failed = 0, passed = 0;
const ok = (cond, what) => { cond ? passed++ : failed++; console.log(`${cond ? "pass" : "FAIL"}  ${what}`); };

/* Every class in a file: name, parent, and its verbs as written (spreads kept as "...X.verbs"). */
function classes(src){
	const out = {};
	const re = /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+([\w.]+))?\s*\{|(\w+)\.(\w+)\s*=\s*class\s+\w+(?:\s+extends\s+([\w.]+))?\s*\{/g;
	let m;
	while ((m = re.exec(src))){
		const name = m[1] ?? m[4], parent = m[2] ?? m[5] ?? null;
		const body = src.slice(re.lastIndex, re.lastIndex + 400);
		const v = body.match(/static\s+verbs\s*=\s*\[([^\]]*)\]/);
		out[name] = { parent, raw: v ? v[1].split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean) : null };
	}
	return out;
}
const sources = {};
const all_classes = file => sources[file] ??= classes(readFileSync(join(ROOT, file), "utf8"));
const base = all_classes("public/framework/ext/JSONL/JSONL.js");
function verbs_of(file, name){
	const c = { ...base, ...all_classes(file) }[name];
	if (!c) throw new Error(`class ${name} not found in ${file}`);
	if (!c.raw) return c.parent ? verbs_of(file, c.parent) : [];
	return c.raw.flatMap(v => { const s = v.match(/^\.\.\.(\w+)\.verbs$/); return s ? verbs_of(file, s[1]) : [v]; });
}

console.log("— 1. the schema agrees with each reader —");
for (const [kind, s] of Object.entries(schemas)){
	if (s.reader.class){
		const reader = new Set(verbs_of(s.reader.file, s.reader.class));
		const mine = Object.entries(s.verbs).filter(([, v]) => !v.extra).map(([k]) => k);
		const pending = new Set(s.pending ?? []);
		const reader_only = [...reader].filter(v => !s.verbs[v]);
		const schema_only = mine.filter(v => !reader.has(v) && !pending.has(v));
		ok(!reader_only.length, `${kind}: every ${s.reader.class} verb is in the schema${reader_only.length ? " — missing: " + reader_only.join(", ") : ""}`);
		ok(!schema_only.length, `${kind}: every schema verb is in ${s.reader.class} or listed pending${schema_only.length ? " — not read: " + schema_only.join(", ") : ""}`);
		const arrived = [...pending].filter(v => reader.has(v));
		ok(!arrived.length, `${kind}: nothing listed pending is already in ${s.reader.class}${arrived.length ? " — drop from pending: " + arrived.join(", ") : ""}`);
		for (const [verb, v] of Object.entries(s.verbs)) if (v.extra)
			ok(readFileSync(join(ROOT, v.extra), "utf8").includes(`entry?.${verb}`), `${kind}: "${verb}" is read by ${v.extra}`);
	}
}
{
	const { fold_asks } = await import(pathToFileURL(join(ROOT, "public/framework/ai/asks/fold.js")).href);
	const folded = fold_asks([{ ask: { at: "t", title: "One ask" } }, { other: { at: "t" } }]);
	ok(Object.keys(folded).length === 1, "asks.jsonl: fold_asks reads `ask` lines and skips anything else");
	const fold_src = readFileSync(join(ROOT, "public/framework/ai2/fold.js"), "utf8");
	ok(Object.keys(schemas["page.jsonl"].verbs).every(k => fold_src.includes(`key === "${k}"`)), "page.jsonl: every structured key is one ai2/fold.js absorb() reads");
}

console.log("— 2. check() judges lines —");
const T = "x/task.jsonl";
ok(/flat line/.test(check(T, { at: "2026-09-30T00:00:00-05:00", task: "x", msg: "flat" }) ?? ""), "task.jsonl: a flat {at,task,msg} line is refused");
ok(/flat line/.test(check(T, { type: "launch", agent: "a" }) ?? ""), "task.jsonl: a flat {type:launch} line is refused");
ok(/unknown verb/.test(check(T, { assign: { now: "x" }, at: "t" }) ?? ""), "task.jsonl: a stray key beside a verb is refused");
ok(/missing "msg"/.test(check(T, { log: { at: "t" } }) ?? ""), "task.jsonl: a log with no msg is refused");
ok(/takes an object/.test(check(T, { log: "a string" }) ?? ""), "task.jsonl: a string log line is refused");
ok(check(T, { experiment: { try: "a", measure: "b", result: "c" } }) === null, "task.jsonl: experiment is accepted");
ok(check(T, { review: { found: 3, real: 2, fixed: 2 } }) === null, "task.jsonl: review is accepted");
ok(check(T, { group: "system-design" }) === null, "task.jsonl: {group:\"slug\"} is accepted");
ok(/flat line/.test(check("ai/2026-09-30/day.jsonl", { at: "t", task: "x", msg: "m" }) ?? ""), "day.jsonl: a flat line is refused");
ok(/missing "task"/.test(check("ai/2026-09-30/day.jsonl", { log: { at: "t", msg: "m" } }) ?? ""), "day.jsonl: a log with no task is refused");
ok(check("a/b/page.jsonl", { status: "done", anything: 1 }) === null, "page.jsonl: open — any key is plain data");
ok(/takes an object/.test(check("a/b/page.jsonl", { message: "hi" }) ?? ""), "page.jsonl: a message must be an object");
ok(check("x/usage.jsonl", { whatever: 1 }) === null, "an unknown file is only checked for being an object");
ok(/one JSON object/.test(check("x/usage.jsonl", [1]) ?? ""), "an array line is refused anywhere");
ok(check_event("cards/live", { type: "focus", ref: "x" }) === null, "append_log: a typed event is accepted");
ok(/task.jsonl-style/.test(check_event("servex", { log: { msg: "x" } }) ?? ""), "append_log: a verb-shaped task line is refused with the pointer");
ok(/never a repo file/.test(check_event("task", { type: "x" }) ?? ""), "append_log: a name that means a repo task log is refused");

console.log("— 3. append.mjs end to end —");
{
	const dir = mkdtempSync(join(tmpdir(), "jsonl-schema-test-"));
	const target = join(dir, "task.jsonl"), lines = join(dir, "lines.json");
	writeFileSync(target, '{"assign":{"step":1}}');   // no trailing newline, like the Write tool leaves it
	const run = arr => { writeFileSync(lines, JSON.stringify(arr)); return spawnSync(process.execPath, [join(here, "append.mjs"), target, lines], { encoding: "utf8", windowsHide: true }); };

	let r = run([{ at: "NOW", task: "x", msg: "flat" }]);
	ok(r.status === 3 && /REFUSED/.test(r.stderr) && /The right shape/.test(r.stderr), "a flat line: exit 3, REFUSED, the right shape printed");
	ok(readFileSync(target, "utf8") === '{"assign":{"step":1}}', "…and the file is untouched");
	r = run([{ log: { at: "NOW", msg: "fine" } }, { bogus: {} }]);
	ok(r.status === 3 && readFileSync(target, "utf8") === '{"assign":{"step":1}}', "one bad line in a batch refuses the whole batch");
	r = run([{ experiment: { try: "t", measure: "m", result: "r" } }, { review: { found: 1, real: 1, fixed: 1 } }]);
	const text = readFileSync(target, "utf8").trim().split("\n");
	ok(r.status === 0 && text.length === 3 && text.every(l => JSON.parse(l)), "experiment + review appended; 3 good lines");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
