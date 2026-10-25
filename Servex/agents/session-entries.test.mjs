// Every spawn is a Session entry in its parent's record, under the task that caused it (session-is-a-task items 31-33).
// `node Servex/agents/session-entries.test.mjs`. A scratch tree in the OS temp folder (SERVEX_PUBLIC points the item tool at it): the live public/ is never touched.
// The registry is stubbed at its two resolvers (Session.agents_at_resolver, Session.agents_resolver): the test checks how costs add up, not Servex's cost log.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Test from "../../public/framework/core/Test/Test.js";

const ROOT = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "session-entries-")));
process.env.SERVEX_PUBLIC = path.join(ROOT, "public");
const HOME = process.cwd();
process.chdir(ROOT);   // open_task resolves task.dir against cwd
const { default: Session } = await import("../../public/framework/core/Session/Session.js");
const { run_item } = await import("./page_tools.js");
const { open_task } = await import("./Agents.js");
const SESS = "public/framework/ai/sessions", PID = "0c0c0c0c-aaaa-4bbb-8ccc-000000000000", KID = "0d0d0d0d-aaaa-4bbb-8ccc-000000000001";
const PARENT = path.join(ROOT, SESS, "2026/10/24", "parent"), PFILE = path.join(PARENT, "session.jsonl");
const url = dir => "/" + path.relative(path.join(ROOT, "public"), dir).replaceAll("\\", "/") + "/";
const PURL = url(PARENT), CHILD = path.join(PARENT, "kid"), CURL = url(CHILD);
const read = f => fs.readFileSync(f, "utf8").trim().split("\n").map(l => JSON.parse(l));
const entries = f => read(f).flatMap(l => l.type === "Session" ? [{ cause: null, e: l }] : Object.entries(l).filter(([, v]) => v?.type === "Session").map(([cause, e]) => ({ cause, e })));
const item = (p, delta) => run_item({ path: p, delta }, { caller: "test" });
const SPAWN = { role: "minion", model: "claude-sonnet-5", effort: "medium", role_readme: "Servex/agents/roles/minion.md" };

// The registry, stubbed: what each agent has spent so far.
const spent = { kid: 0, orphan: 0.25 };
Session.agents_at_resolver = p => p === CURL ? [{ id: "kid", cost: spent.kid }] : [];
Session.agents_resolver = () => [{ id: "kid", parent: "test", cost: spent.kid }, { id: "orphan", parent: "test", cost: spent.orphan }];

const t = new Test("session-entries: a spawn is a Session entry under the task that caused it; children and the three costs come from the entries");
fs.mkdirSync(PARENT, { recursive: true });
fs.writeFileSync(PFILE, JSON.stringify({ session: { id: PID, kind: "vscode-tab", at: "2026-10-24T10:00:00.000Z" } }) + "\n");
try {
	// 1. The parent's task "x" is running.
	t.ok((await item(PURL, { tasks: { add: { id: "x", title: "x" } } })).ok, "the parent has a task x");
	t.ok((await item(PURL, { x: { start: {} } })).ok, "x is started");

	// 2. A spawn under that parent: one Session entry, nested under x, carrying the configuration.
	open_task({ dir: path.relative(ROOT, CHILD), brief: "kid/requirements.md" }, { session_id: KID, agent: "kid", ...SPAWN, parent_session: PID });
	const es = entries(PFILE);
	t.eq(es.length, 1, "the parent's record has one Session entry");
	t.eq(es[0]?.cause, "x", "nested under x, the task that was running");
	const sp = es[0]?.e.spawn ?? {};
	t.ok(sp.role === "minion" && sp.model === "claude-sonnet-5" && sp.effort === "medium" && sp.session_id === KID && sp.agent === "kid", "it carries role, model, effort, session id and agent");
	t.ok(sp.role_readme === "Servex/agents/roles/minion.md" && sp.brief === "kid/requirements.md" && sp.placed === "running", "and the role readme's path, the brief, and which rule placed it");
	const line1 = read(path.join(CHILD, "session.jsonl"))[0].assign;
	t.ok(line1.effort === "medium" && line1.role_readme === "Servex/agents/roles/minion.md", "the child's own line 1 records effort and role readme too");
	open_task({ dir: path.relative(ROOT, CHILD) }, { session_id: KID, agent: "kid", ...SPAWN, parent_session: PID });
	t.eq(entries(PFILE).length, 1, "spawning into the same folder again adds no second entry");

	// 3. Replay: the entry is a Session under x; children is a view of the entries.
	const P = () => Session.replay(read(PFILE));
	const kid = P().find("x")?.tasks.find("kid");
	t.ok(kid instanceof Session && kid.get_one("spawn")?.agent === "kid", "replayed, the entry is a Session under x, with its spawn");
	t.ok(P().tasks.find("kid") === undefined, "and not a second, top-level task");
	t.eq(P().children.map(c => c.id).join(), "kid", "children (computed) lists it, though it sits under x");

	// 4. The item tool: children and cost before the child works, then after it completes.
	const before = (await item(PURL, { summary: {} })).answer.summary;
	t.eq(before.counts.children.entries, 1, "summary: one child session from the entries");
	t.eq(before.cost.children, 0.25, "children cost before: 0 for the child + 0.25 for an agent with no entry (the registry fallback)");
	spent.kid = 1.5;
	t.ok((await item(CURL, { complete: { outcome: "done", evidence: ["session-entries.test.mjs"] } })).ok, "the child completes its own task");
	const after = (await item(PURL, { summary: {} })).answer.summary;
	t.eq(after.cost.children, 1.75, "children cost after: the child's 1.5 + the unlinked 0.25, the child counted once, not twice");
	t.eq(after.cost.total, after.cost.children + (after.cost.own?.usd ?? 0), "total = own + children");
	t.eq(after.children.find(c => c.linked)?.state, "complete", "the child row says complete");
	t.eq(P().find("x").completion, 1, "x's completion moved 0 -> 1 (its one child session is complete)");
	t.ok(before.counts.all.complete + 1 === after.counts.all.complete, "the parent's completed count moved by one");
	const kids = (await item(PURL, { children: {} })).answer.children;
	t.ok(kids.length === 2 && kids[0].id === "kid" && kids[0].total === 1.5 && kids[1].linked === false, "{children:{}}: the entry (total 1.5), then the unlinked agent");

	// 5. The other cause rules: an explicit cause, no running task (top), and a handoff (the subtask itself becomes the entry).
	await item(PURL, { tasks: { add: { id: "y", title: "y" } } });
	open_task({ dir: path.relative(ROOT, path.join(PARENT, "k2")), cause: "y" }, { session_id: "0e0e0e0e-aaaa-4bbb-8ccc-000000000002", agent: "k2", ...SPAWN });
	t.ok(entries(PFILE).some(x => x.cause === "y" && x.e.spawn?.placed === "explicit"), "an explicit task.cause places the entry under y");
	await item(PURL, { x: { stop: { why: "test" } } });
	open_task({ dir: path.relative(ROOT, path.join(PARENT, "k3")) }, { session_id: "0f0f0f0f-aaaa-4bbb-8ccc-000000000003", agent: "k3", ...SPAWN });
	t.ok(entries(PFILE).some(x => x.cause === null && x.e.spawn?.agent === "k3" && x.e.spawn?.placed === "top"), "with no running task, the entry goes at the top");
	await item(PURL, { tasks: { add: { id: "h", title: "hand me off" } } });
	open_task({ dir: path.relative(ROOT, path.join(PARENT, "h-home")), from: PURL, id: "h" }, { session_id: "0a0a0a0a-aaaa-4bbb-8ccc-000000000004", agent: "k4", ...SPAWN });
	for (let i = 0; i < 50 && !read(PFILE).some(l => l.as === "h"); i++) await new Promise(r => setTimeout(r, 20));
	const h = read(PFILE).find(l => l.as === "h");
	t.ok(h?.type === "Session" && h.spawn?.placed === "handoff" && h.spawn?.agent === "k4", "a handoff upgrades the subtask in place: its reference is the Session entry");
	t.ok(P().tasks.find("h") instanceof Session, "and h replays as a Session, keeping its id");

	// 6. A task folder (line 1 is the task's own line) that a spawn later wrote into: a Session that replays as the task log it is.
	const MIXED = path.join(PARENT, "mixed"), MURL = url(MIXED);
	fs.mkdirSync(MIXED, { recursive: true });
	fs.writeFileSync(path.join(MIXED, "task.jsonl"), [{ id: "mixed", path: MURL, title: "a task folder" }, { assign: { session_id: "0b0b0b0b-aaaa-4bbb-8ccc-000000000005", agent: "k5" } }, { complete: { outcome: "done" } }].map(l => JSON.stringify(l)).join("\n") + "\n");
	fs.appendFileSync(PFILE, JSON.stringify({ task: MURL, as: "mixed" }) + "\n");
	const m = P().tasks.find("mixed");
	t.ok(m instanceof Session && m.state === "complete", "a task folder a spawn later wrote into is a Session, and its complete line still reads complete");
	// 7. A voice record (ai/sessions/<day>/v-<id>/, line 1 {session:{kind:"voice"}}) is found by its folder name as a parent_session.
	const now = new Date(), today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("/");
	const VOICE = path.join(ROOT, SESS, today, "v-test");   // made just now, after the cache was built: found by name in today's folder
	fs.mkdirSync(VOICE, { recursive: true });
	fs.writeFileSync(path.join(VOICE, "session.jsonl"), JSON.stringify({ session: { kind: "voice", at: "2026-10-24T11:00:00.000Z" } }) + "\n");
	// The child sits outside the voice folder, so its record is found by parent_session, not by walking up.
	open_task({ dir: path.relative(ROOT, path.join(ROOT, SESS, "2026/10/24", "elsewhere", "fast")) }, { session_id: "0c0c0c0c-aaaa-4bbb-8ccc-000000000006", agent: "voice-fast", ...SPAWN, parent_session: "v-test" });
	t.ok(entries(path.join(VOICE, "session.jsonl")).some(x => x.e.spawn?.agent === "voice-fast"), "a spawn with parent_session v-test writes its entry on the voice record");
} finally {
	process.chdir(HOME);
	fs.rmSync(ROOT, { recursive: true, force: true });
}
t.done();
