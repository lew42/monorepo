// node --test Server/TaskMigrate.test.mjs — runs on a COPY of real old tasks (fixture.json), in a temp dir; never on the tree.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import TaskMigrate from "./TaskMigrate.mjs";
import { Task } from "../public/framework/core/Task/Task.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(fs.readFileSync(path.join(HERE, "..", "public/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/fixture.json"), "utf8"));
const MOVES = FIXTURE.tasks.filter(t => t.action === "move");

function copy(){
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "task-migrate-")) + "/public";
	for (const [rel, text] of Object.entries(FIXTURE.files)){
		const abs = path.join(root, rel);
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		fs.writeFileSync(abs, text);
	}
	return path.resolve(root);
}
const migrate = root => new TaskMigrate({ root, now: FIXTURE.now });
const dir_of = (root, url) => path.join(root, ...url.split("/").filter(Boolean));
function snapshot(root){
	const out = {};
	const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){ const p = path.join(d, e.name); e.isDirectory() ? walk(p) : out[path.relative(root, p)] = crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex"); } };
	walk(root);
	return out;
}
const lines = file => TaskMigrate.parse(fs.readFileSync(file, "utf8")).lines;

test("the fixture is real old tasks: some move, some stay", () => {
	assert.ok(MOVES.length >= 5, "at least five moves");
	assert.ok(FIXTURE.tasks.some(t => t.action === "stay"));
});

test("dry run decides the same as on the full tree, and writes nothing", () => {
	const root = copy(), before = snapshot(root);
	const rows = migrate(root).plan();
	for (const want of MOVES){
		const r = rows.find(r => r.t.url === want.old);
		assert.equal(r?.d.action, "move", want.old);
		assert.equal(r.d.module, want.module, want.old);
	}
	assert.deepEqual(snapshot(root), before);
});

test("apply: every move gets a home, the old file only grows by one line, the round trip is clean", () => {
	const root = copy(), m = migrate(root);
	const old_raw = Object.fromEntries(MOVES.map(t => [t.old, fs.readFileSync(path.join(dir_of(root, t.old), "task.jsonl"), "utf8")]));
	const moved = m.apply();
	assert.equal(moved.length, MOVES.length);
	for (const t of MOVES){
		const now = fs.readFileSync(path.join(dir_of(root, t.old), "task.jsonl"), "utf8");
		assert.ok(now.startsWith(old_raw[t.old]), "old content is a prefix");
		const extra = TaskMigrate.parse(now.slice(old_raw[t.old].length)).lines;
		assert.equal(extra.length, 1);
		const home = extra[0].home;
		assert.match(home, new RegExp(`^/framework/${t.module}/tasks/[a-z0-9-]+/$`));
		const hl = lines(path.join(dir_of(root, home), "task.jsonl"));
		assert.deepEqual(hl[0].sessions.map(s => s.task), [t.old]);
		assert.equal(hl[0].module, t.module);
		assert.equal(hl[0].source, undefined, "source means who asked (step 3d); the migration never writes it");
		assert.ok(fs.existsSync(path.join(dir_of(root, home), "page.js")));
		const list = lines(path.join(path.dirname(dir_of(root, home)), "task.jsonl"));
		assert.equal(list[0].id, "tasks");
		assert.ok(list.some(l => l.task === home));
		const index = lines(path.join(root, "tasks", "task.jsonl"));
		assert.ok(index.some(l => l.task === hl[0].parent), "the module list is in /tasks/");
	}
	const c = m.check();
	assert.equal(c.checked, MOVES.length);
	assert.deepEqual(c.problems, []);
});

test("states keep their original times; a stale open task is stopped with a why", () => {
	const root = copy(), m = migrate(root);
	m.apply();
	for (const e of m.ledger_lines()){
		const was = Task.replay(lines(path.join(dir_of(root, e.old), "task.jsonl")));
		const now = Task.replay(lines(path.join(dir_of(root, e.home), "task.jsonl")));
		if (was.state === "complete"){ assert.equal(now.state, "complete"); assert.equal(now.data.completed_at, was.data.completed_at); }
		else { assert.equal(now.state, "stopped"); assert.match(now.data.why, /^migrated: never landed/); assert.ok(Date.parse(now.data.stopped_at) < FIXTURE.now); }
		assert.equal(now.data.outcome, was.data.outcome);
		assert.equal(now.session, was.session);
	}
});

test("a second run changes nothing", () => {
	const root = copy();
	migrate(root).apply();
	const after = snapshot(root);
	assert.deepEqual(migrate(root).apply(), []);
	assert.deepEqual(snapshot(root), after);
	assert.ok(migrate(root).plan().filter(r => r.d.action === "done").length === MOVES.length);
});

test("a run cut short is repaired, not doubled", () => {
	const root = copy(), m = migrate(root);
	m.apply();
	const e = m.ledger_lines()[0];
	const list_file = path.join(path.dirname(dir_of(root, e.home)), "task.jsonl");
	fs.writeFileSync(list_file, fs.readFileSync(list_file, "utf8").split("\n").filter(l => !l.includes(`"${e.home}"`)).join("\n"));   // lose one list reference
	fs.unlinkSync(m.ledger);   // and the ledger
	const again = migrate(root).apply();
	assert.ok(again.find(x => x.home === e.home).did.includes("list ref"));
	assert.ok(again.every(x => !x.did.includes("home") && !x.did.includes("old home line")));
	assert.equal(lines(list_file).filter(l => l.task === e.home).length, 1);
	assert.deepEqual(migrate(root).check().problems, []);
});

test("slug clash: an existing folder refuses that task and writes nothing for it", () => {
	const root = copy(), m = migrate(root);
	const victim = m.plan().find(r => r.d.action === "move").d;
	fs.mkdirSync(victim.dir, { recursive: true });
	fs.writeFileSync(path.join(victim.dir, "notes.md"), "someone else's\n");
	const rows = migrate(root).plan();
	assert.equal(rows.find(r => r.t.url === victim.old).d.reason, "slug clash: folder exists");
	const old_before = fs.readFileSync(path.join(dir_of(root, victim.old), "task.jsonl"), "utf8");
	migrate(root).apply();
	assert.equal(fs.readFileSync(path.join(dir_of(root, victim.old), "task.jsonl"), "utf8"), old_before);
	assert.ok(!fs.existsSync(path.join(victim.dir, "task.jsonl")));
});

test("slug clash: two old tasks wanting one home are both refused", () => {
	const root = copy(), m = migrate(root);
	const one = m.plan().find(r => r.d.action === "move");
	const twin = path.join(root, "framework/ai/sessions/2026/07/01/twin", one.t.slug);
	fs.mkdirSync(twin, { recursive: true });
	fs.copyFileSync(one.t.file, path.join(twin, "task.jsonl"));
	const rows = migrate(root).plan().filter(r => r.d.url === one.d.url);
	assert.equal(rows.length, 2);
	assert.ok(rows.every(r => r.d.reason === "slug clash: two old tasks want this home"));
});

test("check catches an old file that was rewritten, not appended", () => {
	const root = copy(), m = migrate(root);
	m.apply();
	const e = m.ledger_lines()[0], f = path.join(dir_of(root, e.old), "task.jsonl");
	fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/"/, " \""));
	assert.ok(migrate(root).check().problems.some(p => p.old === e.old && /not a pure append/.test(p.why)));
});
