// node public/framework/ai/AISession/SessionOutline.test.mjs — the join, the "Other work" group, the child union, the ranking order, and the two agreeing counts.
import assert from "node:assert/strict";
import SessionOutline from "./SessionOutline.js";

const NOW = Date.parse("2026-10-25T12:00:00Z"), HOUR = 36e5, DAY = 864e5, iso = ms => new Date(NOW - ms).toISOString();
const ME = "aaaaaaaa-0000-4000-8000-000000000000", B = "bbbbbbbb-0000-4000-8000-000000000000", C = "cccccccc-0000-4000-8000-000000000000", D = "dddddddd-0000-4000-8000-000000000000", E = "eeeeeeee-0000-4000-8000-000000000000";
const BASE = "/framework/ai/sessions/2026/10/20/session-aaaaaaaa/";

// record tasks, the same duck shape as core/Task: id, state, _tasks, get_one(field)
const task = (id, fields = {}, ago = HOUR, kids = []) => ({ id, state: fields.state ?? "idle", created_at: iso(ago), _tasks: kids, get_one: k => k === "title" ? fields.title ?? id : fields[k] });
const node = (rel, o = {}) => Object.assign({ rel, title: rel, url: BASE + rel + "/", state: "idle", kids: [], started: iso(DAY), usd: null }, o);
const tree = (kids) => {
	const root = { rel: "", url: BASE, kids, all(){ return [root, ...kids.flatMap(function walk(n){ return [n, ...n.kids.flatMap(walk)]; })]; } };
	root.all = () => { const out = [root], walk = n => { out.push(n); n.kids.forEach(walk); }; kids.forEach(walk); return out; };
	return { root, snap: null };
};

// folders: plain (nobody points at it), the node child B ran (with an unreferenced kid and a referenced kid), and one more plain one under a task
const n_plain = node("plain-folder"), n_b_free = node("agent-b/free"), n_b_ref = node("agent-b/ref"), n_b = node("agent-b", { session: B, agent: "minion-b", kids: [n_b_free, n_b_ref], usd: 12 });
const n_under = node("task-folder/inner"), n_task = node("task-folder", { kids: [n_under] });
const T = tree([n_plain, n_b, n_task]);

const tasks = [
	task("t1", { source: "prompt:P1", title: "ask one" }, 3 * HOUR),
	task("t2", { source: "prompt:P1", title: "ask two", state: "complete" }, 2 * HOUR, [task("t2a", { state: "complete" }), task("t2b", { state: "stopped" })]),
	task("t3", { source: { prompt: "P2" }, title: "ask with the object form" }, HOUR),
	task("t4", { title: "no prompt at all" }, 5 * DAY),
	task("t5", { title: "points into child B's folder", path: n_b_ref.url, state: "complete" }, DAY),
	task("t6", { title: "points at a plain folder", path: n_task.url, source: "prompt:P1" }, HOUR),
];
const session = { id: ME, _tasks: tasks, get_one: k => k === "sessions" ? [{ id: "minion-b" }, { id: "minion-a" }, { id: "minion-b" }] : undefined };
const snaps = [
	{ id: ME, agent: "mastermind-x", usd: 5, last_activity: iso(0), links: { children: [D] } },
	{ id: B, agent: "minion-b", usd: 12, state: "idle", title: "Child B", last_activity: iso(DAY) },
	{ id: C, agent: "minion-c", parent: "mastermind-x", usd: 1, state: "active", title: "Child C", last_activity: iso(HOUR) },
	{ id: D, agent: "minion-d", usd: 0, state: "idle", title: "Child D", last_activity: iso(9 * DAY) },
	{ id: E, agent: "minion-e", parent: "somebody-else", usd: 3, last_activity: iso(HOUR) },
];
const prompts = { P1: { subject: "Prompt one" } };
const out = new SessionOutline({ session, tree: T, prompts, snaps, self: ME, now: NOW });

// 1. the join: P1's asks sit together under its subject, the object form joins P2 (subject missing -> a placeholder), the rest is "Other work"
assert.deepEqual([...SessionOutline.source(session)], [["t1", "P1"], ["t2", "P1"], ["t3", "P2"], ["t6", "P1"]]);
const own = out.groups.at(-1), sub = Object.fromEntries(own.groups.map(g => [g.prompt ?? g.kind, g]));
assert.equal(own.kind, "own");
assert.equal(sub.P1.name, "Prompt one");
assert.deepEqual(sub.P1.items.map(i => i.id).sort(), ["t1", "t2", "t6"]);
assert.match(sub.P2.name, /^Prompt P2/);

// 2. "Other work": the task with no prompt, plus the folder nobody points at
assert.deepEqual(sub.other.items.map(i => i.id).sort(), ["plain-folder", "t4"]);
assert.equal(sub.other.name, "Other work");

// 3. the child union: lines (minion-b, minion-a), nodes (B), links (D), parent (C); de-duplicated; E (another parent) is not a child
const keys = out.found.list.map(c => c.id ?? c.key).sort();
assert.deepEqual(keys, [B, C, D, "minion-a"].sort());
assert.deepEqual(out.found.counts, { lines: 2, nodes: 1, links: 1, parent: 1, union: 4 });
assert.equal(out.found.list.find(c => c.id === B).from.size, 2);   // found by its sessions line AND its tree node, counted once

// 4. a child holds the tasks whose path is its folder or below, and the unreferenced nodes under it; its group keeps the progress
const gb = out.groups.find(g => g.child?.id === B);
assert.deepEqual(gb.items.map(i => i.id).sort(), ["agent-b/free", "t5"]);
assert.deepEqual([gb.done, gb.total], [1, 2]);

// 5. an unreferenced node under a task node is drawn under that task, not twice
assert.equal(sub.P1.items.find(i => i.id === "t6").kids.map(k => k.id).join(), "task-folder/inner");

// 6. the ranking: a $40 task from yesterday beats a free ask from an hour ago, and among free asks the newest is first
const rank = new SessionOutline({ session: { id: ME, _tasks: [
	task("free-old", {}, 3 * DAY), task("free-new", {}, HOUR),
	task("paid", { path: BASE + "agent-big/" }, DAY), task("free-newest", {}, 60000)], get_one: () => undefined },
	tree: tree([node("agent-big", { usd: 40 })]), snaps: [], self: ME, now: NOW });
assert.deepEqual(rank.groups.at(-1).items.map(i => i.id), ["paid", "free-newest", "free-new", "free-old"]);
const newest = rank.reorder("newest");
assert.deepEqual(newest.groups.at(-1).items.map(i => i.id), ["free-newest", "free-new", "paid", "free-old"]);

// 7. the two numbers that must agree: tasks drawn = record tasks (every depth) + folder nodes no task points at and no session heads
const deep = list => list.reduce((n, t) => n + 1 + deep(t._tasks), 0), refs = new Set(tasks.map(t => t.get_one("path")).filter(Boolean));
const unreferenced = T.root.all().slice(1).filter(n => !refs.has(n.url) && typeof n.session !== "string").length;
const independent = deep(tasks) + unreferenced;
assert.equal(out.drawn, independent);

// 8. a Prompt/Question record's title is its own words, not its id — read by constructor.name, the same way core/Task's own code does
// (SessionOutline stays import-free so node and the browser build it the same way, so this fakes the shape rather than importing the real classes)
class Prompt { constructor(id, d){ Object.assign(this, { id, state: "idle", _tasks: [], created_at: iso(HOUR) }); this.d = d; } get_one(k){ return this.d[k]; } get label(){ return this.d.paragraphs?.[0]?.text ?? this.id; } }
class Question { constructor(id, d){ Object.assign(this, { id, state: "idle", _tasks: [], created_at: iso(HOUR) }); this.d = d; } get_one(k){ return this.d[k]; } get text(){ return this.d.text ?? null; } }
const chat = new SessionOutline({ session: { id: ME, _tasks: [
	new Prompt("p-1", { paragraphs: [{ id: "a", text: "Hello there, a real sentence." }] }),
	new Question("q-1", { text: "What exactly are those?" }),
], get_one: () => undefined }, tree: tree([]), prompts: {}, snaps: [], self: ME, now: NOW });
const chat_items = chat.groups.at(-1).groups.flatMap(g => g.items);
assert.equal(chat_items.find(i => i.id === "p-1").title, "Hello there, a real sentence.");
assert.equal(chat_items.find(i => i.id === "p-1").record_type, "Prompt");
assert.equal(chat_items.find(i => i.id === "q-1").title, "What exactly are those?");
assert.equal(chat_items.find(i => i.id === "q-1").record_type, "Question");

console.log(`SessionOutline: ok. tasks drawn ${out.drawn} = ${independent} (record ${deep(tasks)} + unreferenced folders ${unreferenced}); children ${JSON.stringify(out.found.counts)}`);
