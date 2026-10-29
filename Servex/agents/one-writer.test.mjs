// One writer (data-shapes plan step 1d): every write to a record goes through record_lines / run_item behind POST /api/item, and the
// raw append is only the fallback, checked against the file's tail. `node Servex/agents/one-writer.test.mjs`
// Scratch tree in the OS temp folder (SERVEX_PUBLIC; the entry point is a local http server running this checkout's serve_item, named
// by RECORD_ENTRY): nothing under the live public/ and nothing in the live Servex is touched.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import Test from "../../public/framework/core/Test/Test.js";

const ROOT = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "one-writer-")));
process.env.SERVEX_PUBLIC = path.join(ROOT, "public");
process.env.LEDGER_ROOT = ROOT;

const { run_item, serve_item } = await import("./page_tools.js");
const { default: RecordWriter } = await import("../../public/framework/core/Item/RecordWriter.js");
const { default: Session } = await import("../../public/framework/core/Session/Session.js");
const { default: LogLine } = await import("../../Server/LogLine.mjs");
const ledger = await import("../../.claude/hooks/ledger.mjs");
const t = new Test("one-writer");

// The entry point, as Servex serves it; `mode` makes it slow (writes at once, answers late) or stubbed.
let mode = "ok";
const server = http.createServer((req, res) => {
	let body = "";
	req.on("data", d => body += d);
	req.on("end", async () => {
		if (mode === "stubbed") return res.end(JSON.stringify({ ok: true, stubbed: true }));
		const answer = await serve_item(JSON.parse(body));
		if (mode === "slow") await new Promise(r => setTimeout(r, 800));
		res.setHeader("content-type", "application/json"); res.end(JSON.stringify(answer));
	});
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
process.env.RECORD_ENTRY = `http://127.0.0.1:${server.address().port}/api/item`;

const REL = "framework/ai/sessions/2026/10/28/onewriter", DIR = path.join(ROOT, "public", REL), URL = `/${REL}/`, FILE = path.join(DIR, "session.jsonl");
const lines = () => fs.readFileSync(FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
let replays = 0;
const real = Session.replay;
Session.replay = function (...a){ replays++; return real.apply(this, a); };

fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify({ session: { id: "1a1a1a1a-aaaa-4bbb-8ccc-0000000000aa", kind: "vscode-tab", at: "2026-10-28T10:00:00.000Z" } }) + "\n"
	+ Array.from({ length: 3000 }, (_, i) => JSON.stringify({ log: { text: `old line ${i}` }, by: "seed", ts: new Date(Date.parse("2026-10-28T10:00:00Z") + i).toISOString() })).join("\n") + "\n");

try {
	// 1. Two writers at once on one file: a tab (RecordWriter.post, the call Item.Store.flush makes) and an agent (run_item).
	await run_item({ path: URL }, { caller: "agent-t" });
	const tab = RecordWriter.post(`${URL}session.jsonl`, { deltas: Array.from({ length: 20 }, (_, i) => ({ tasks: { add: { title: `tab task ${i}` } } })), by: "owner" });
	const agent = Promise.all(Array.from({ length: 20 }, (_, i) => run_item({ path: URL, delta: { tasks: { add: { title: `agent task ${i}` } } } }, { caller: "agent-t" })));
	const [posted] = await Promise.all([tab, agent]);
	t.eq(posted.rest.length, 0, "1. the tab's 20 lines were all taken by the entry point (no fallback)");
	const adds = lines().filter(l => l.tasks?.add).map(l => l.tasks.add.title);
	t.eq(adds.length, 40, "1. 40 adds in the file: none lost");
	t.eq(new Set(adds).size, 40, "1. no twin: 40 different titles");
	const pairs = lines().filter(l => l.ts).map(l => `${l.by}|${l.ts}`);
	t.eq(new Set(pairs).size, pairs.length, "1. every line's by|ts is unique");
	const live = (await run_item({ path: URL, delta: { progress: {} } }, { caller: "agent-t" })).answer.progress;
	t.eq(live.total, Session.replay(lines()).progress().total, "1. the live root and a fresh replay of the file agree");

	// 2. A hook write no longer makes the next item() call replay the whole file.
	const write = async () => { const b = replays, at = performance.now(); await run_item({ path: URL, delta: { log: { text: "agent" } } }, { caller: "agent-t" }); return { replays: replays - b, ms: performance.now() - at }; };
	await write();   // warm
	fs.appendFileSync(FILE, JSON.stringify({ log: { at: LogLine.now(), msg: "old-style raw hook append" } }) + "\n");
	const before = await write();
	t.eq(before.replays, 1, `2. before: a raw hook append makes the next tool call replay the whole file (${before.ms.toFixed(1)} ms)`);
	const hook = await RecordWriter.write(FILE, { log: { at: LogLine.now(), msg: "hook via the one writer" } }, { by: "ledger" });
	t.eq(hook.via, "entry", "2. a hook line goes to the entry point");
	const after = await write();
	t.eq(after.replays, 0, `2. after: the next tool call replays nothing (${after.ms.toFixed(1)} ms, was ${before.ms.toFixed(1)} ms)`);
	ledger.append_checked(FILE, { log: { at: LogLine.now(), msg: "ledger.mjs's own write path" } });
	await Promise.allSettled(ledger.pending);
	t.eq((await write()).replays, 0, "2. ledger.mjs's append_checked: no full replay after it");
	LogLine.append(FILE, { log: { msg: "LogLine in-process (the log tool, dir_log)" } }, { by: "agent-t" });
	t.eq((await write()).replays, 0, "2. LogLine.append in Servex (writer wired to record_lines): no full replay after it");
	t.ok(lines().some(l => l.log?.msg === "ledger.mjs's own write path") && lines().some(l => l.log?.msg === "LogLine in-process (the log tool, dir_log)"), "2. both lines are in the file");
	LogLine.raw(FILE, { log: { at: LogLine.now(), msg: "Servex's own line (a context alert, a worktree assign)" } });
	t.eq((await write()).replays, 0, "2. LogLine.raw (Servex's own lines: Agents, Lifecycle, WorktreeWatch): no full replay after it");
	console.log(`   measured: next item() after a raw append ${before.ms.toFixed(1)} ms (1 full replay of ${lines().length} lines); after a one-writer append ${after.ms.toFixed(1)} ms (0)`);

	// 3. The fallback writes once.
	const count = msg => lines().filter(l => l.log?.msg === msg).length;
	const real_entry = process.env.RECORD_ENTRY;
	process.env.RECORD_ENTRY = "http://127.0.0.1:9/api/item";   // nothing listens: the entry point is down
	const down = await RecordWriter.write(FILE, { log: { at: LogLine.now(), msg: "down" } }, { by: "ledger" });
	t.eq([down.via, count("down")], ["fallback", 1], "3. entry point down: the fallback writes the line once");
	process.env.RECORD_ENTRY = real_entry;

	mode = "slow";   // the entry point writes at once but answers after 800 ms; the caller gives up at 200 ms
	const slow = await RecordWriter.write(FILE, { log: { at: LogLine.now(), msg: "slow" } }, { by: "ledger", timeout: 200 });
	await new Promise(r => setTimeout(r, 900));
	t.eq([slow.via, slow.written, count("slow")], ["fallback", 0, 1], "3. entry point slow: the fallback finds the line in the tail and writes nothing (no twin)");
	mode = "ok";

	// The other order: the fallback wrote first, then the late post reaches the entry point. Raw lines and a tab's verb.
	const first = { log: { at: LogLine.now(), msg: "fallback first" }, by: "ledger", ts: RecordWriter.stamp() };
	await RecordWriter.append_once(FILE, [first]);
	const late = await serve_item({ path: `${URL}session.jsonl`, lines: [first] });
	t.eq([late.written, late.skipped, count("fallback first")], [0, 1, 1], "3. the late raw post is skipped: one line");
	const ts = RecordWriter.stamp();
	await RecordWriter.append_once(FILE, [{ tasks: { add: { title: "tab fallback" } }, by: "owner", ts }]);
	const late_verb = await serve_item({ path: `${URL}session.jsonl`, delta: { tasks: { add: { title: "tab fallback" } } }, ts });
	t.eq([late_verb.already, lines().filter(l => l.tasks?.add?.title === "tab fallback").length], [true, 1], "3. the late verb is answered `already`: one line");

	mode = "stubbed";   // a worktree page or another checkout: the caller appends to its own file, once
	const stub = await RecordWriter.write(FILE, { log: { at: LogLine.now(), msg: "stubbed" } }, { by: "ledger" });
	t.eq([stub.via, count("stubbed")], ["fallback", 1], "3. stubbed: the caller's own append, once");
	mode = "ok";

	const other = await serve_item({ path: `${URL}session.jsonl`, lines: [{ log: { msg: "x" } }], root: path.join(ROOT, "elsewhere") });
	t.eq(other.stubbed, true, "another checkout's post is stubbed, never written into this tree");

	// The dev server's fallback (Append.js, what a tab's FsFile.send reaches): a line already in the tail is not written again.
	process.chdir(ROOT);   // Append resolves public/ from the cwd
	const { default: Append } = await import("../../Server/plugins/SocketServer/Append.js");
	const said = [], appender = new Append({ on(){}, send: m => said.push(m.response) });
	const tabline = { title: "card", by: "owner", ts: RecordWriter.stamp() }, PAGE = path.join(DIR, "page.jsonl");
	await serve_item({ path: `${URL}page.jsonl`, lines: [tabline] });   // the entry point took it, but answered too late
	appender.append(`/${REL}/page.jsonl`, [tabline], 1);
	appender.append(`/${REL}/page.jsonl`, [{ title: "other", by: "owner", ts: RecordWriter.stamp() }], 2);
	const page = fs.readFileSync(PAGE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
	t.eq([said, page.map(l => l.title)], [["append successful", "append successful"], ["card", "other"]], "3. Append.js: the line the entry point wrote is not written twice; a new one is");
} finally {
	server.close();
	process.chdir(os.tmpdir());
	fs.rmSync(ROOT, { recursive: true, force: true });
}
t.done();
