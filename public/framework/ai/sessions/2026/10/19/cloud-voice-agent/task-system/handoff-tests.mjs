// Tests each "handoff breaks here" theory against real data. Run: node handoff-tests.mjs [--json]
// Reads ai/state.json, the task logs it lists, asks.jsonl, the sessions store, and git. Writes nothing.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "../../../../../../../../..");
const ai = path.join(root, "public/framework/ai");
const state = JSON.parse(fs.readFileSync(path.join(ai, "state.json"), "utf8"));
const read = (f) => { try { return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return null; } };
const latestAsks = () => { const m = new Map(); read(path.join(ai, "asks.jsonl")).map((l) => l.ask).filter(Boolean).forEach((a) => m.set(a.title, { ...m.get(a.title), ...a })); return [...m.values()]; };
const DAY = 864e5, now = Date.now();
const tasks = state.tasks.map((t) => ({ ...t, lines: read(path.join(root, t.dir, "task.jsonl")) })).filter((t) => t.lines);
const verbs = (t) => new Set(t.lines.flatMap((l) => Object.keys(l)));
const has = (t, v) => verbs(t).has(v);
const first = (t, v) => t.lines.find((l) => l[v])?.[v];
const out = [];
const theory = (id, handoff, claim, pass, fails, total, examples = []) =>
	out.push({ id, handoff, claim, pass, fails, total, examples: examples.slice(0, 3) });

// Reachable commits: short hashes on HEAD.
const head = new Set(execSync("git rev-list HEAD", { cwd: root, maxBuffer: 1 << 28 }).toString().split("\n").map((h) => h.slice(0, 7)));
const onHead = (h) => h && head.has(String(h).slice(0, 7));

// T1 prompt -> ask: every ask names a card that exists on disk.
{
	const asks = latestAsks(), ids = new Set(state.cards.map((c) => c.id));
	const miss = asks.filter((a) => !a.card || !ids.has(a.card));
	theory("T1", "prompt -> ask -> card", "Every ask (latest line per title) names a card that exists", miss.length === 0, miss.length, asks.length, miss.map((a) => a.title));
}
// T2 ask -> task: the ask's owner agent has a task of its own.
{
	const asks = latestAsks();
	const agents = new Set(tasks.map((t) => t.agent));
	const miss = asks.filter((a) => a.owner && !agents.has(a.owner));
	theory("T2", "ask -> task", "Every ask's owner agent has a task that names it", miss.length === 0, miss.length, asks.length, miss.map((a) => `${a.owner}: ${a.title}`));
}
// T3 spawn -> task line 1: has session_id, title, agent.
{
	const pool = tasks.filter((t) => t.home === "session" && /sessions\/2026\/10\/(1[2-9]|2\d)\//.test(t.dir) && !t.lines[0]?.review);
	const miss = pool.filter((t) => { const a = t.lines[0]?.assign; return !a || !a.session_id || !a.agent; });
	theory("T3", "spawn -> task", "Task born since 10-12 (open_task era) has an assign line 1 with session_id and agent", miss.length === 0, miss.length, pool.length, miss.map((t) => `${Object.keys(t.lines[0] || {})[0]} ${t.dir}`));
}
{
	const pool = tasks.filter((t) => t.home === "session" && /sessions\/2026\/10\/(1[2-9]|2\d)\//.test(t.dir) && t.lines[0]?.assign);
	const miss = pool.filter((t) => !t.lines.some((l) => l.assign?.title));
	theory("T3b", "spawn -> task title", "Such a task has a title on some assign line", miss.length === 0, miss.length, pool.length, miss.map((t) => t.dir));
}
// T4 task -> session folder exists.
{
	const withS = tasks.filter((t) => t.session);
	const miss = withS.filter((t) => !fs.existsSync(path.join(root, t.dir)) || !fs.readdirSync(path.join(ai, "sessions")).length);
	const parentDirs = (t) => path.dirname(path.join(root, t.dir));
	const orphan = tasks.filter((t) => t.home === "session" && !t.session);
	theory("T4", "task -> session", "Every session-store task names its session", orphan.length === 0, orphan.length, tasks.filter((t) => t.home === "session").length, orphan.map((t) => t.dir));
}
// T5 task -> module: session tasks carry a module.
{
	const s = tasks.filter((t) => t.home === "session");
	const miss = s.filter((t) => !t.module);
	theory("T5", "task -> module", "Every session-store task names its module", miss.length === 0, miss.length, s.length, miss.map((t) => t.dir));
}
// T6 session -> task: the session log names its tasks.
{
	const sessions = [...new Set(tasks.filter((t) => t.session).map((t) => t.session))];
	let named = 0, checked = 0;
	for (const id of sessions) {
		const t = tasks.find((x) => x.session === id && x.home === "session");
		if (!t) continue;
		const log = read(path.join(path.dirname(path.join(root, t.dir)), "session.jsonl"));
		if (!log) continue;
		checked++;
		if (log.some((l) => JSON.stringify(l).includes(path.basename(t.dir)))) named++;
	}
	theory("T6", "session -> task", "The session's own log names the tasks run in it", named === checked, checked - named, checked);
}
// T7 work merged -> landing line: a task with a commit on HEAD should be complete.
{
	const c = tasks.filter((t) => has(t, "commit") && t.lines.some((l) => l.commit && onHead(l.commit?.hash ?? l.commit?.sha ?? l.commit)));
	const miss = c.filter((t) => t.state !== "complete");
	theory("T7", "merged change -> task state", "A task whose commit is on michael/dev is complete", miss.length === 0, miss.length, c.length, miss.map((t) => `${t.state} ${t.dir}`));
}
// T8 landed but empty: complete tasks have an outcome line.
{
	const done = tasks.filter((t) => t.state === "complete");
	const miss = done.filter((t) => !t.line);
	theory("T8", "landed -> record", "Every complete task has an outcome sentence", miss.length === 0, miss.length, done.length, miss.map((t) => t.dir));
}
// T9 nothing dangling: no task idle/stopped/running for >3 days without ending.
{
	const open = tasks.filter((t) => t.state !== "complete");
	const old = open.filter((t) => now - Date.parse(t.last || t.started || 0) > 3 * DAY);
	const by = {};
	old.forEach((t) => (by[t.state] = (by[t.state] || 0) + 1));
	theory("T9", "work -> ending", "Every task ends (complete) or is touched within 3 days: " + JSON.stringify(by), old.length === 0, old.length, open.length, old.map((t) => t.dir));
}
// T10 started vs ended: a session ended 'without landing' with no later landing.
{
	const ended = tasks.filter((t) => t.lines.some((l) => l.log?.msg?.includes("ended") && l.log.msg.includes("without landing")));
	const lost = ended.filter((t) => t.state !== "complete");
	theory("T10", "agent end -> landing", "An agent session that ended 'without landing' later lands", lost.length === 0, lost.length, ended.length, lost.map((t) => t.dir));
}
// T11 parent/child: a nested task is named in its parent's log.
{
	const dirs = new Map(tasks.map((t) => [path.join(root, t.dir), t]));
	const nested = tasks.filter((t) => dirs.has(path.dirname(path.join(root, t.dir))));
	const miss = nested.filter((t) => !dirs.get(path.dirname(path.join(root, t.dir))).lines.some((l) => JSON.stringify(l).includes(path.basename(t.dir))));
	theory("T11", "parent -> sub-task", "A nested task is named in its parent's log", miss.length === 0, miss.length, nested.length, miss.map((t) => t.dir));
}
// T12 card state vs task state: card still open/working while every task by that agent is complete.
{
	const byAgent = {};
	tasks.forEach((t) => (byAgent[t.agent] ||= []).push(t));
	const cards = state.cards.filter((c) => ["open", "working"].includes(c.bucket) && c.who && byAgent[c.who]);
	const stale = cards.filter((c) => byAgent[c.who].every((t) => t.state === "complete"));
	theory("T12", "task -> card", "A card is done once every task by its agent is complete", stale.length === 0, stale.length, cards.length, stale.map((c) => c.id));
}
// T13 duplicates: one task, one file.
{
	theory("T13", "migration", "No task is held in two log files", state.check.aliases === 0, state.check.aliases, state.check.total);
}

if (process.argv.includes("--json")) console.log(JSON.stringify(out, null, 1));
else for (const r of out) console.log(`${r.pass ? "PASS" : "FAIL"} ${r.id} [${r.handoff}] ${r.claim}: ${r.fails}/${r.total} fail${r.examples.length ? "  e.g. " + r.examples.join(" | ") : ""}`);
