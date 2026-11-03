// Node test for Dated + DatedFiles on a scratch repo: create -> index row -> query finds it -> move -> rows on both days + manifest -> check ok.
// Run: node public/framework/core/Item/Dated.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Dated from "./Dated.js";
import DatedFiles from "../../../../Server/DatedFiles.mjs";

let n = 0;
const t = (v, msg) => { assert.ok(v, msg); n++; };

// the portable half: the folder rule and the row replay
const d = new Dated("projects");
t(d.path("2026-10-20", "x", "core/Task") === "public/framework/core/Task/projects/2026/10/20/x", "folder rule");
t(d.index_path("2026-10-20") === "public/framework/ai/sessions/2026/10/20/index.jsonl", "day index path");
t(Dated.days("2026-10-30", "2026-11-02").join() === "2026-10-30,2026-10-31,2026-11-01,2026-11-02", "day range crosses a month");
const idx = Dated.Index.replay([{ project: { id: "a", title: "A", state: "idle" } }, { project: { id: "a", state: "working" } }, { task: { id: "t1" } }]);
t(idx.rows.length === 2 && idx.rows[0].state === "working" && idx.rows[0].title === "A", "later line updates its row");

// the node half, on a scratch repo
const root = fs.mkdtempSync(path.join(os.tmpdir(), "dated-"));
DatedFiles.ROOT = root;
fs.mkdirSync(path.join(root, "public/framework/core/Task"), { recursive: true });
const sess = "public/framework/ai/sessions/2026/10/19/session-abc/proj-one";
fs.mkdirSync(path.join(root, sess), { recursive: true });
fs.writeFileSync(path.join(root, sess, "../session.jsonl"), JSON.stringify({ assign: { session_id: "abc" } }) + "\n");
fs.writeFileSync(path.join(root, sess, "project.jsonl"), JSON.stringify({ id: "proj-one", title: "Project one", at: "2026-10-19T10:00:00" }) + "\n");

const f = new DatedFiles("projects");
const made = f.create({ module: "core/Task", slug: "fresh", title: "Fresh", day: "2026-10-20" });
t(made.dir === "public/framework/core/Task/projects/2026/10/20/fresh" && fs.existsSync(path.join(root, made.dir, "project.jsonl")), "create makes the folder and line 1");
t(DatedFiles.lines(path.join(root, "public/framework/ai/sessions/2026/10/20/index.jsonl")).some(l => l.project?.id === "fresh"), "create appends the index row");
assert.throws(() => f.create({ module: "core/Task", slug: "fresh", day: "2026-10-20" }), /already exists/); n++;

let q = await f.query({ from: "2026-10-19", to: "2026-10-20" });
t(q.total === 1 && q.rows[0].id === "fresh", "query finds the created project");
q = await f.query({ from: "2026-10-19", to: "2026-10-20", where: [{ field: "title", op: "contains", value: "zzz" }] });
t(q.total === 0, "query filters");

const dry = await f.move({ from: sess, module: "core/Task" });
t(dry.dry_run && dry.to === "public/framework/core/Task/projects/2026/10/19/proj-one" && fs.existsSync(path.join(root, sess)), "dry run moves nothing");
const done = await f.move({ from: sess, module: "core/Task", apply: true });
t(!fs.existsSync(path.join(root, sess)) && fs.existsSync(path.join(root, done.to, "project.jsonl")), "apply moves the folder");
const day19 = DatedFiles.lines(path.join(root, "public/framework/ai/sessions/2026/10/19/index.jsonl")), today = DatedFiles.lines(path.join(root, `public/framework/ai/sessions/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getDate()).padStart(2, "0")}/index.jsonl`));
t(day19.some(l => l.project?.id === "proj-one" && l.project.path === done.to), "start day's row points at the new home");
t(today.some(l => l.project?.id === "proj-one" && l.project.moved), "today's row shows the move");
t(DatedFiles.lines(path.join(root, DatedFiles.MANIFEST)).some(l => l.run === done.run && l.to === done.to), "manifest line");
t(DatedFiles.lines(path.join(root, "public/framework/ai/sessions/2026/10/19/session-abc/session.jsonl")).some(l => l.log?.msg.includes("proj-one")), "pointer in the session");

const ok = await f.check();
t(ok.ok && ok.folders === 2, "check ok after create + move: " + JSON.stringify(ok));
fs.mkdirSync(path.join(root, "public/framework/core/Task/projects/2026/10/20/stray"), { recursive: true });
fs.writeFileSync(path.join(root, "public/framework/core/Task/projects/2026/10/20/stray/project.jsonl"), "{\"id\":\"stray\"}\n");
const bad = await f.check();
t(!bad.ok && bad.missing.length === 1, "check fails loudly on a folder with no row");
fs.rmSync(path.join(root, "public/framework/core/Task/projects/2026/10/20/stray"), { recursive: true });
fs.rmSync(path.join(root, made.dir), { recursive: true });
t((await f.check()).stale.length === 1, "check names a row whose folder is gone");

const back = await f.undo();
t(back.undone === done.run && fs.existsSync(path.join(root, sess)), "undo puts it back");

// the sessions collection: paths, make, sync, watch, check
const S = DatedFiles.sessions, UID = "11111111-2222-3333-4444-555555555555";
t(S.path("2026-10-20", "x") === "public/framework/ai/sessions/2026/10/20/x" && S.day_path("2026-10-20") === "public/framework/ai/sessions/2026/10/20", "sessions folder rule");
const sdir = S.make(S.home({ slug: "my-task", session_id: UID, day: "2026-10-20" }));
t(sdir.endsWith(path.join("2026", "10", "20", "session-11111111", "my-task")) && fs.existsSync(sdir), "make puts a task inside its session folder");
let refused = false; fs.writeFileSync(path.join(sdir, "task.jsonl"), "{}\n"); try { S.make(sdir); } catch { refused = true; }
t(refused, "make refuses a folder that holds a task");
const w = S.watch({ debounce: 50 }), nd = path.join(S.day_dir("2026-10-20"), "watched");
fs.mkdirSync(nd, { recursive: true });
fs.writeFileSync(path.join(nd, "session.jsonl"), JSON.stringify({ assign: { session_id: "watched", title: "W", at: "2026-10-20T12:00:00" } }) + "\n");
await new Promise(r => setTimeout(r, 500));
const rows = () => DatedFiles.lines(path.join(root, "public/framework/ai/sessions/2026/10/20/index.jsonl")).map(l => l.session).filter(r => r?.id === "watched");
t(rows().length === 1 && rows()[0].state === "open", "watch writes the row when a folder appears");
fs.appendFileSync(path.join(nd, "session.jsonl"), JSON.stringify({ finish: { at: "2026-10-20T13:00:00" } }) + "\n");
await new Promise(r => setTimeout(r, 500)); w.close();
t(rows().length === 2 && rows()[1].state === "done", "watch writes a row when the record grows");
t(S.sync(nd) === null, "sync writes nothing when nothing changed");
const sc = await S.check(); t(sc.ok && sc.stale.length === 0, "sessions check ok: " + JSON.stringify(sc));

fs.rmSync(root, { recursive: true, force: true });
console.log(`Dated.test.mjs: ${n} checks passed`);
