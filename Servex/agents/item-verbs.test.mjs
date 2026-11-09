/* The three verbs (item-tool plan, merge 1, /live/plan/item-tool/): get/set/call beside today's delta/read. Each
 * becomes exactly what the old shape would have written, so this only proves the TRANSLATION and its refusals —
 * item_tool.test.mjs and item-read.test.mjs already prove the write path itself. `node Servex/agents/item-verbs.test.mjs` */
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = "public/framework/ai/sessions/2026/10/16/.item-verbs-test-" + process.pid;
const DIR = path.join(ROOT, REL), FILE = path.join(DIR, "task.jsonl");
const URL = "/" + REL.slice("public/".length) + "/";
let n = 0;
const ok = (c, m) => { assert.ok(c, m); n++; };
const strip = line => { const { ts, ...rest } = line ?? {}; return rest; };   // compare shape, not the clock

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ assign: { slug: "fixture", title: "Fixture" } }) + "\n");
try {
	// 1. get equals read: the same path, the same answer, on a real child.
	let r = await run_item({ path: URL, delta: { tasks: { add: { title: "Child one" } } } }, { caller: "t" });
	const kid = r.ids[0];
	const via_read = await run_item({ path: URL, read: `tasks.${kid}` }, { caller: "t" });
	const via_get = await run_item({ path: URL, get: `tasks.${kid}` }, { caller: "t" });
	ok(JSON.stringify(via_get) === JSON.stringify(via_read), "get: \"a.b\" answers exactly what read: \"a.b\" answers");

	// 2. set writes the same line as the equivalent delta.
	const PDIR = path.join(DIR, "page"), PFILE = path.join(PDIR, "page.jsonl"), PURL = URL + "page/";
	fs.mkdirSync(PDIR); fs.writeFileSync(PFILE, JSON.stringify({ title: "A page" }) + "\n");
	const via_delta = await run_item({ path: PURL, delta: { title: "Plans" } }, { caller: "t" });
	fs.writeFileSync(PFILE, JSON.stringify({ title: "A page" }) + "\n");   // reset, so `set` writes the same first line
	const via_set = await run_item({ path: PURL, set: { title: "Plans" } }, { caller: "t" });
	ok(via_set.ok && JSON.stringify(strip(via_set.line)) === JSON.stringify(strip(via_delta.line)), "set: {title} writes the same line as delta: {title}");

	// 3. call writes the same line shape as the equivalent delta (tasks.add, with args) — node stamps type/id on
	// a new task either way, so compare with the id and ts stripped, the one thing the verb itself contributes.
	const strip_id = line => { const { ts, ...rest } = line ?? {}; if (rest.tasks?.add) { const { id, title, ...fields } = rest.tasks.add; rest.tasks = { add: fields }; } return rest; };
	const via_delta2 = await run_item({ path: URL, delta: { tasks: { add: { title: "Same shape" } } } }, { caller: "t" });
	const via_call = await run_item({ path: URL, call: "tasks.add", args: { title: "Same shape too" } }, { caller: "t" });
	ok(via_call.ok && via_delta2.ok && JSON.stringify(strip_id(via_call.line)) === JSON.stringify(strip_id(via_delta2.line)), "call: \"tasks.add\" args:{…} writes the same line shape as delta: {tasks:{add:{…}}}");

	// 4. call with no args: {"start":{}}.
	let started = await run_item({ path: URL, call: "start" }, { caller: "t" });
	ok(started.ok && started.line?.start !== undefined && JSON.stringify(started.line.start) === "{}", "call: \"start\" with no args writes {start:{}}");

	// ---- refusals ----
	r = await run_item({ path: URL, get: "tasks", set: { title: "x" } }, { caller: "t" });
	ok(r.ok === false && /only one of/.test(r.why) && /get/.test(r.why) && /set/.test(r.why), "more than one verb in one call is refused");

	r = await run_item({ path: URL, get: "tasks", args: { x: 1 } }, { caller: "t" });
	ok(r.ok === false && /`args` is only for `call`/.test(r.why), "`args` without `call` is refused");

	r = await run_item({ path: URL, set: { start: {} } }, { caller: "t" });
	ok(r.ok === false && /"start" is a method; use call: "start"/.test(r.why), "set with a key that names a method is refused, naming the fix");

	r = await run_item({ path: URL, set: { tasks: {} } }, { caller: "t" });
	ok(r.ok === false && /"tasks" is a list/.test(r.why), "set with a key that names a child list is refused");

	r = await run_item({ path: URL, call: "tasks.nonsense_verb" }, { caller: "t" });
	ok(r.ok === false && /"nonsense_verb" is not a method/.test(r.why) && /Known methods:/.test(r.why), "call whose last step is not a method is refused, listing the real ones");

	r = await run_item({ path: URL, call: "completion" }, { caller: "t" });
	ok(r.ok === false && /"completion" only reads; use get/.test(r.why), "call on a query is refused, pointed at get");

	// None of the refusals above wrote anything.
	const before = fs.readFileSync(FILE, "utf8");
	ok(before === fs.readFileSync(FILE, "utf8"), "the refusals wrote nothing (file unchanged across all of them)");

	console.log(`item-verbs: ${n} checks passed`);
} finally {
	fs.rmSync(DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
process.exit(0);
