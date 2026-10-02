/* node Servex/agents/fixer.test.mjs — proves the fast path end to end in node, with no real
 * git, no real worktree and no real claude.exe (quick-fix-path/fixer, 2026-10-01):
 *
 *   1. quick_fix({page, selection, text}) writes the ASKED line to page.jsonl and hands the
 *      request to the standing fixer (a fake agent here) with `send`.
 *   2. The fixer being busy changes how many are said to be "ahead", and idle/urgent sends cut
 *      in with `priority: "now"`.
 *   3. quick_fix_landed({asked_at, sha, ...}) writes the LANDED line, and `ms` is a real number
 *      node computed from the two clock readings — never something a caller stated.
 *   4. Pool.hold() is actually called once, at boot, so the fixer's own slot is never reclaimed
 *      (Servex/pool-hold.test.mjs is the deeper proof of hold() itself; this only checks Fixer.js
 *      calls it).
 *
 * Same style as spawn-worktree.test.mjs: a FakeAgent whose start()/send() never touch a real SDK
 * session, so Agents.spawn()'s own real code (recipe(), register(), the registry row) still runs
 * for real, just without a child process. */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fixer-test-"));
process.env.SERVEX_HOME = dir;   // home.js's HOME is frozen at import time — set before anything that imports it
const { Agents } = await import("./Agents.js");
const { default: Sessions } = await import("./Sessions.js");
const { default: Fixer } = await import("./Fixer.js");

let checks = 0;
const check = async (name, fn) => { try { await fn(); checks++; } catch (e){ console.error(`FAILED: ${name}`); throw e; } };

/* A fake agent: start() never opens a real SDK session, send() just records what it was told
 * instead of pushing onto a real streaming-input queue (which start() never built). */
class FakeAgent extends Agents.Agent {
	start(){ this.session_id ??= "fake-" + Math.random().toString(36).slice(2); this.state = "idle"; this.sent = []; return this; }
	send(text, note = {}){ this.sent.push({ text, note }); this.state = "working"; this.host?.register?.(this); return this; }
}
class TestAgents extends Agents {}
TestAgents.Agent = FakeAgent;

const SLOT = { id: "qf-1", path: path.join(dir, "worktrees", "qf-1"), branch: "worktree/qf-1", url: "http://127.0.0.1:9999/" };

function fake_pool(){
	const held = [];
	return { take_sync_calls: 0, held, take_sync(by){ this.take_sync_calls++; return { ...SLOT }; },
		hold(id, by){ held.push({ id, by }); return { id, held_by: by }; } };
}

let n = 0;
function fixture(){
	const pool = fake_pool();
	const repo = path.join(dir, `repo-${++n}`);
	fs.mkdirSync(repo, { recursive: true });
	const servex = { say(){}, pool };
	servex.agents = new TestAgents({ registry_dir: path.join(dir, `reg-${n}`), servex });
	servex.fixer = new Fixer({ servex });
	servex.sessions = new Sessions({ servex, repo });
	return { pool, repo, servex, sessions: servex.sessions, fixer: servex.fixer };
}

function quickfix_lines(repo){
	const file = path.join(repo, "public/framework/ai/quick-fix/page.jsonl");
	let text = ""; try { text = fs.readFileSync(file, "utf8"); } catch {}
	return text.split("\n").filter(l => l.trim()).map(l => JSON.parse(l).quickfix);
}

await check("quick_fix writes the asked line and hands the request to the fixer (idle -> priority now)", async () => {
	const { sessions, servex, repo } = fixture();
	const out = sessions.quick_fix({ page: "/framework/ext/Chat/", selection: { label: "Heading", selector: "h1" }, text: "make it bold" });
	assert.equal(out.ok, true);
	assert.equal(out.ahead, 0, "the fixer was idle: nothing to queue behind");

	const lines = quickfix_lines(repo);
	assert.equal(lines.length, 1);
	assert.equal(lines[0].page, "/framework/ext/Chat/");
	assert.equal(lines[0].text, "make it bold");
	assert.equal(lines[0].fixer, "fixer-1");
	assert.equal(lines[0].asked_at, out.asked_at);

	const fixer = servex.agents.live.get("fixer-1");
	assert.ok(fixer, "the standing fixer was started");
	assert.equal(fixer.model, "claude-sonnet-5", "the brief's own words: Sonnet");
	assert.equal(fixer.effort, "medium", "the brief's own words: medium effort, not Agent.defaults()'s \"high\"");
	assert.equal(fixer.permission_mode, "bypassPermissions");
	assert.equal(servex.pool.take_sync_calls, 1, "the pool's slot was taken exactly once");
	assert.deepEqual(servex.pool.held, [{ id: "qf-1", by: "fixer-1" }], "and held, so the sweep never reclaims it");
	assert.equal(fixer.sent.length, 1, "the fixer got exactly one message");
	assert.equal(fixer.sent[0].note.priority, "now", "idle fixer: nothing to interrupt, so it cuts in");
	assert.match(fixer.sent[0].text, /make it bold/);
	assert.match(fixer.sent[0].text, new RegExp(out.asked_at.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "the exact asked_at is in the message, to be copied back verbatim");
});

await check("a second request while the fixer is mid-fix queues behind it and says how many are ahead", async () => {
	const { sessions, servex } = fixture();
	sessions.quick_fix({ page: "/x/", text: "first fix" });   // fixer goes "working" (FakeAgent.send sets that)
	const second = sessions.quick_fix({ page: "/y/", text: "second fix" });
	assert.equal(second.ahead, 1, "one fix is already in flight");
	assert.equal(second.note, "fixer busy, 1 ahead");
	const fixer = servex.agents.live.get("fixer-1");
	assert.equal(fixer.sent.length, 2);
	assert.notEqual(fixer.sent[1].note.priority, "now", "a busy fixer is not interrupted — this one waits its turn");
});

await check("quick_fix_landed computes ms from the real asked_at, never from what it's told", async () => {
	const { sessions, repo } = fixture();
	const asked = sessions.quick_fix({ page: "/z/", text: "fix it" });
	await new Promise(r => setTimeout(r, 5));   // a real, if tiny, elapsed time
	const landed = sessions.quick_fix_landed({ asked_at: asked.asked_at, sha: "abc1234", files: 1, lines: 2, width: 1200 });
	assert.equal(landed.ok, true);
	assert.ok(landed.ms >= 0, "ms is a real non-negative number");
	assert.ok(landed.ms < 60000, "well under a minute for this test");

	const lines = quickfix_lines(repo);
	assert.equal(lines.length, 2, "one asked line, one landed line");
	const last = lines[1];
	assert.equal(last.asked_at, asked.asked_at, "the landed line shares the asked line's key");
	assert.equal(last.sha, "abc1234");
	assert.equal(last.ms, landed.ms);
});

await check("quick_fix_landed refuses a made-up asked_at with no matching request, and needs sha", () => {
	const { sessions } = fixture();
	assert.throws(() => sessions.quick_fix_landed({ sha: "x" }), /asked_at/);
	assert.throws(() => sessions.quick_fix_landed({ asked_at: "2026-10-01T00:00:00-05:00" }), /sha/);
});

await check("quick_fix needs page and text", () => {
	const { sessions } = fixture();
	assert.throws(() => sessions.quick_fix({ text: "no page" }), /page/);
	assert.throws(() => sessions.quick_fix({ page: "/x/" }), /text/);
});

await check("quick_fix with no fixer running (SERVEX_NO_FIXER-style host) refuses clearly instead of throwing a confusing error", () => {
	const repo = path.join(dir, `repo-${++n}`);
	fs.mkdirSync(repo, { recursive: true });
	const servex = { say(){} };   // no .fixer at all
	const sessions = new Sessions({ servex, repo });
	assert.throws(() => sessions.quick_fix({ page: "/x/", text: "hi" }), /fixer is not running/);
});

console.log(`fixer.test.mjs: ${checks} checks passed`);
