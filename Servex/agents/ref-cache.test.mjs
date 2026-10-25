// Recompute only what changed (item 25): a child record is replayed again only when its own file (or one it read) changed. `node Servex/agents/ref-cache.test.mjs`
// Throwaway dot-folders in the real store (the resolvers are bound to it), removed at the end.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Test from "../../public/framework/core/Test/Test.js";
import Task from "../../public/framework/core/Task/Task.js";
import { run_item } from "./page_tools.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REL = `public/framework/ai/sessions/2026/10/22/.refcache-${process.pid}`, DIR = path.join(ROOT, REL), URL = "/" + REL.slice("public/".length) + "/";
const kid = n => path.join(DIR, "kid-" + n), line = o => JSON.stringify(o) + "\n";
const done = { complete: { outcome: "done", evidence: ["test"], confidence: "high", caveats: [] } };
const t = new Test("ref-cache");

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "session.jsonl"), line({ session: { id: "1a1a1a1a-aaaa-4bbb-8ccc-000000000009", kind: "vscode-tab", at: "2026-10-22T10:00:00.000Z" } }));
for (const n of ["a", "b", "c"]){ fs.mkdirSync(kid(n)); fs.writeFileSync(path.join(kid(n), "task.jsonl"), line({ assign: { agent: "kid-" + n } })); fs.appendFileSync(path.join(DIR, "session.jsonl"), line({ task: `${URL}kid-${n}/`, as: n })); }
try {
	const read = async () => (await run_item({ path: URL }, { caller: "t" })).state;
	let s = await read();   // the first read links the resolver (link_refs) for this process
	const calls = [], resolver = Task.resolver;
	Task.resolver = ref => (calls.push(ref.split("/").filter(Boolean).at(-1)), resolver(ref));
	t.eq(s.completion, 0, "three children, none done: completion 0");

	calls.length = 0;
	await read();
	t.eq(calls.length, 0, "nothing changed: no child file is read or replayed again");

	fs.appendFileSync(path.join(kid("a"), "task.jsonl"), line(done));   // only A changes
	calls.length = 0;
	s = await read();
	t.eq(calls, ["kid-a"], "one child changed: only that child is replayed again");
	t.eq(s.progress.done, 1, "and the parent's total moved (1 of 3 done)");
	t.ok(Math.abs(s.completion - 1 / 3) < 1e-9, "completion is 1/3");

	fs.appendFileSync(path.join(kid("b"), "task.jsonl"), line(done));
	fs.appendFileSync(path.join(kid("c"), "task.jsonl"), line(done));
	calls.length = 0;
	s = await read();
	t.eq(calls.sort(), ["kid-b", "kid-c"], "two changed: those two, not A");
	t.eq(s.completion, 1, "all three done: completion 1");

	fs.appendFileSync(path.join(DIR, "session.jsonl"), line({ log: { text: "the parent's own file changed" } }));
	calls.length = 0;
	await read();
	t.eq(calls.length, 0, "only the parent changed: no child is replayed again");
	Task.resolver = resolver;

	// item 26: {"completion":{}} answers the tally and the number at once, and writes nothing
	const size = fs.statSync(path.join(DIR, "session.jsonl")).size;
	const r = await run_item({ path: URL, delta: { completion: {} } }, { caller: "t" });
	t.eq(r.answer?.completion, { stopped: 0, done: 3, total: 3, completion: 1 }, "completion query: the tally (done, total, stopped) and the number");
	t.eq(fs.statSync(path.join(DIR, "session.jsonl")).size, size, "and the query wrote nothing");
	const kid_a = await run_item({ path: URL + "kid-a/", delta: { completion: {} } }, { caller: "t" });
	t.ok(kid_a.ok && kid_a.answer?.completion?.done === 1, "a task folder answers it too");
} finally {
	fs.rmSync(DIR, { recursive: true, force: true });
}
t.done();
