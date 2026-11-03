/* node Servex/WorktreeWatch.test.mjs — the page mapping, the judging, and the message rules (one per page per 10 min, one clear line).
 * measure() is replaced, so no browser and no server run. Doc: Servex/doc/pool.md "Page watcher". */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import WorktreeWatch from "./WorktreeWatch.js";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "wwatch-"));
const pub = path.join(root, "worktree", "public");
for (const d of ["", "framework/x", "framework/x/deep", "framework/core/Page", "framework"]) fs.mkdirSync(path.join(pub, d), { recursive: true });
for (const d of ["framework/x", "framework/core/Page", "framework", ""]) fs.writeFileSync(path.join(pub, d, "page.js"), "");

// the mapping
assert.deepEqual(WorktreeWatch.pages_for("/framework/x/page.js", pub), ["/framework/x/"]);
assert.deepEqual(WorktreeWatch.pages_for("/framework/x/deep/Thing.css", pub), ["/framework/x/"]);
assert.deepEqual(WorktreeWatch.pages_for("/framework/core/Page/Page.js", pub), ["/framework/core/Page/", "/framework/"]);
assert.deepEqual(WorktreeWatch.pages_for("/framework/x/data.jsonl", pub), []);
assert.deepEqual(WorktreeWatch.pages_for("/framework/x/note.md", pub), []);

// the judging
const w = (empty, overflow_x = false) => ({ empty, overflow_x });
const clean = { widths: { 400: w(0.1), 1200: w(0.2), 1920: w(0.3), 3440: w(0.5) }, errors: [] };
assert.deepEqual(WorktreeWatch.judge(clean), []);
assert.equal(WorktreeWatch.judge({ ...clean, widths: { ...clean.widths, 400: w(0.1, true) } })[0].kind, "overflow");
assert.equal(WorktreeWatch.judge({ ...clean, widths: { ...clean.widths, 400: w(0.9) } }).length, 0, "emptiness at 400 is not judged");
assert.deepEqual(WorktreeWatch.judge({ ...clean, widths: { ...clean.widths, 3440: w(0.7) } }).map(b => b.kind), ["empty"]);
const err = WorktreeWatch.judge({ ...clean, errors: ["400: Uncaught SyntaxError: x", "1200: Uncaught SyntaxError: x", "1920: TypeError: y is not a function"] });
assert.deepEqual(err.map(b => [b.kind, b.widths]), [["error", [400, 1200]], ["error", [1920]]]);

const nf = "Failed to load resource: the server responded with a status of 404 (Not Found)";
assert.deepEqual(WorktreeWatch.judge({ ...clean, errors: ["400: " + nf, "1200: " + nf] }), [], "one 404 per width is the favicon");
assert.deepEqual(WorktreeWatch.judge({ ...clean, errors: ["400: " + nf, "400: " + nf] }).map(b => b.widths), [[400]], "a second 404 at one width is a real missing file");

// the message rules
const sent = [], task_dir = path.join(root, "main", "task"); fs.mkdirSync(task_dir, { recursive: true });
const watch = new WorktreeWatch({ id: "qf-t", path: path.join(root, "worktree"), port: 1, owner: "minion-x", main: path.join(root, "main"), task_dir: "task", send: (to, text) => sent.push([to, text]) });
watch.stopped = false;   // run() without a socket
const plog = [];   // what report() was given: nothing is sent, a line goes to the module's failures.jsonl
watch.report = (dir, ev) => { plog.push([dir, ev]); if (ev.fail) sent.push([watch.owner, ev.fail.msg]); };
let layout = clean;
const png = path.join(root, "pngs"); fs.mkdirSync(png); fs.writeFileSync(path.join(png, "400.png"), "png");
watch.measure = async urls => new Map(urls.map(u => [u, { res: layout, dir: png }]));
const quiet = console.log; console.log = () => {};
const go = async () => { watch.pending.add("/framework/x/"); await watch.run(); };

layout = { ...clean, widths: { ...clean.widths, 400: w(0.1, true) } };
await go();
assert.equal(sent.length, 1);
assert.equal(plog[0][0], "public/framework/x", "the line goes to the page's own module folder");
assert.equal(plog[0][1].fail.worktree, "qf-t");
assert.match(sent[0][1], /\/framework\/x\/ breaks at 400 px: overflow_x true.*shots[\\/]|shots\/.*400\.png/);
assert.ok(fs.existsSync(path.join(task_dir, "shots", "framework-x-400.png")) || fs.existsSync(path.join(task_dir, "shots", "-framework-x-400.png")) || fs.readdirSync(path.join(task_dir, "shots")).some(f => f.endsWith("-400.png")), "the shot is kept");
await go();
assert.equal(sent.length, 1, "still broken within 10 minutes: no second message");
layout = clean;
await go();
assert.equal(sent.length, 1, "recovery sends nothing");
assert.deepEqual(plog.map(([, e]) => Object.keys(e)[0]), ["fail", "clear"], "one break line, one clear line");
assert.match(plog[1][1].clear.msg, /clear/);
watch.pages.get("/framework/x/").messaged_at -= WorktreeWatch.QUIET_MS + 1;
layout = { ...clean, errors: ["400: boom"] };
await go();
assert.equal(sent.length, 2, "after 10 minutes a new break is told again");

// the tests: a script save runs the near tests, a files.jsonl write runs nothing, only a change is reported
WorktreeWatch.DEBOUNCE_MS = 15;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const idle = async () => { for (let i = 0; i < 200 && (WorktreeWatch.active || WorktreeWatch.queue.size); i++) await sleep(10); await sleep(20); };
const tmain = path.join(root, "tmain"); fs.mkdirSync(path.join(tmain, "task"), { recursive: true });
const testWatch = (id, execute) => {
    const msgs = [];
    const t = new WorktreeWatch({ id, path: path.join(root, "worktree"), port: 1, owner: "minion-t", main: tmain, task_dir: "task", send: (to, text) => msgs.push(text) });
    t.stopped = false; t.ran = [];
    t.runner = async () => ({ results: path.join(root, "no-results.jsonl") });
    t.near = async urls => urls.some(u => u.endsWith("Thing.mjs")) ? ["x/Thing.test.mjs"] : [];
    t.logs = []; t.report = (dir, ev) => { if (ev.fail) msgs.push(ev.fail.msg); else t.logs.push(ev.clear.msg); t.dir = dir; };
    t.execute = async file => { t.ran.push(file); return execute(file); };
    return { t, msgs };
};
let ok = true;
const { t: tw, msgs: tmsgs } = testWatch("tw", async () => ({ ok, tail: "ok - one\nnot ok - Thing adds (expected 2, got 3)\nat line 9" }));
tw.changed(["/framework/x/files.jsonl", "/framework/x/page.jsonl", "/framework/x/readme.md"]); await idle();
assert.deepEqual(tw.ran, [], "data writes run no tests");
tw.changed(["/framework/x/Thing.mjs"]); await idle();
assert.deepEqual(tw.ran, ["x/Thing.test.mjs"], "a .mjs save runs its near test");
assert.equal(tmsgs.length, 0, "a pass with nothing before it says nothing");
tw.changed(["/framework/x/Thing.mjs"]); await idle();
assert.equal(tmsgs.length, 0, "steady pass says nothing");
ok = false;
tw.changed(["/framework/x/Thing.mjs"]); await idle();
assert.equal(tmsgs.length, 1, "pass to fail: one message");
assert.match(tmsgs[0], /x\/Thing\.test\.mjs was passing and now fails: not ok - Thing adds \(expected 2, got 3\)/);
tw.changed(["/framework/x/Thing.mjs"]); await idle();
assert.equal(tmsgs.length, 1, "steady fail says nothing");
ok = true;
tw.changed(["/framework/x/Thing.mjs"]); await idle();
assert.equal(tmsgs.length, 1, "fail to pass is a log line, not a message");
assert.equal(tw.logs.length, 1); assert.match(tw.logs[0], /passes again/);
assert.equal(tw.dir, "x", "the test's own folder");

// debounce: a break fixed by the next save (inside the quiet window) is never told; one still broken when the saves stop is
WorktreeWatch.DEBOUNCE_MS = 120; tw.ran.length = 0; tmsgs.length = 0;
ok = false; tw.changed(["/framework/x/Thing.mjs"]);                    // save 1 of 2 breaks it
await sleep(50); ok = true; tw.changed(["/framework/x/Thing.mjs"]);    // save 2, inside the window, fixes it
await sleep(60); assert.deepEqual(tw.ran, [], "nothing runs while saves keep coming");
await sleep(150); await idle();
assert.equal(tw.ran.length, 1, "one run after the saves stop");
assert.equal(tmsgs.length, 0, "a break fixed within the window is never told");
ok = false; tw.changed(["/framework/x/Thing.mjs"]);
await sleep(50); assert.equal(tmsgs.length, 0, "a break is not told inside the window");
await sleep(150); await idle();
assert.equal(tmsgs.length, 1, "still broken when the saves stop: told once, to the owner");
ok = true; tw.changed(["/framework/x/Thing.mjs"]); await idle();
WorktreeWatch.DEBOUNCE_MS = 15;

// report() itself: one line appended to failures.jsonl in the module's folder of the MAIN checkout
const real = new WorktreeWatch({ id: "rr", path: path.join(root, "worktree"), port: 1, main: tmain });
const log0 = console.log; console.log = () => {};
real.report("public/framework/x", { fail: { kind: "test", msg: "boom", worktree: "rr" } }); real.report("public/framework/x", { clear: { kind: "test", msg: "ok", worktree: "rr" } });
console.log = log0;
const fl = fs.readFileSync(path.join(tmain, "public/framework/x/failures.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
assert.deepEqual(fl.map(l => Object.keys(l).filter(k => k !== "at")[0]), ["fail", "clear"], "a fail line then a clear line, in the module's own folder");

// a timeout is no result: the state stays, nothing is told
const { t: tt, msgs: tmsgs2 } = testWatch("tt", async () => ({ ok: false, timeout: true, tail: "TIMED OUT" }));
tt.changed(["/framework/x/Thing.mjs"]); await idle();
assert.equal(tmsgs2.length, 0); assert.equal(tt.test_state.size, 0);

// prior(): this worktree's last save line, else dev's results.jsonl (a merge-base cache line is not dev's result), else unknown = quiet
const F = "x/Thing.test.mjs", bad = { ok: false, tail: "not ok - boom" };
const rt = path.join(root, "rt"); fs.mkdirSync(rt, { recursive: true });
fs.writeFileSync(path.join(rt, "results.jsonl"), [{ file: F, ok: true, trigger: "manual" }, { file: F, ok: false, sha: "abc", trigger: "merge-base" }].map(l => JSON.stringify(l) + "\n").join(""));
const withRt = (id, dir) => { const m = testWatch(id, async () => bad); m.t.runner = async () => ({ results: path.join(dir, "save-results.jsonl") }); return m; };
const dev = withRt("tp", rt);
dev.t.changed(["/framework/x/Thing.mjs"]); await idle();
assert.equal(dev.msgs.length, 1, "dev says passing, now fails: one message");
const empty = path.join(root, "rt-empty"); fs.mkdirSync(empty, { recursive: true });
const unknown = withRt("tu", empty);
unknown.t.changed(["/framework/x/Thing.mjs"]); await idle();
assert.equal(unknown.msgs.length, 0, "no earlier result: a log line, no message");
const own = path.join(root, "rt-own"); fs.mkdirSync(own, { recursive: true });
fs.copyFileSync(path.join(rt, "results.jsonl"), path.join(own, "results.jsonl"));
fs.writeFileSync(path.join(own, "save-results.jsonl"), JSON.stringify({ file: F, ok: false, trigger: "save", worktree: "to" }) + "\n" + JSON.stringify({ file: F, ok: true, trigger: "save", worktree: "other" }) + "\n");
const mine = withRt("to", own);
mine.t.changed(["/framework/x/Thing.mjs"]); await idle();
assert.equal(mine.msgs.length, 0, "this worktree's own last save line (failing) beats dev's, and another worktree's line is ignored");

// one shared queue: at most 3 at once across worktrees; a new change replaces that worktree's waiting run
let now = 0, peak = 0, gate; const open = new Promise(r => gate = r);
const many = Array.from({ length: 5 }, (_, i) => testWatch("q" + i, async () => { peak = Math.max(peak, ++now); await open; now--; return { ok: true }; }));
for (const { t } of many) t.changed(["/framework/x/Thing.mjs"]);
await sleep(80);
assert.equal(WorktreeWatch.active, 3, "three run");
assert.equal(WorktreeWatch.queue.size, 2, "two wait");
many[4].t.changed(["/framework/x/Other.mjs"]); await sleep(80);
assert.equal(WorktreeWatch.queue.size, 2, "a new change replaces that worktree's waiting run");
assert.deepEqual(WorktreeWatch.queue.get("q4").files.sort(), ["/framework/x/Other.mjs", "/framework/x/Thing.mjs"]);
gate(); await idle();
assert.equal(peak, 3, "never more than three test processes");
assert.ok(many.every(m => m.t.ran.length === 1), "every worktree ran once");
console.log = quiet;
console.log("WorktreeWatch.test.mjs: ok");
