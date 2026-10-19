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
let layout = clean;
const png = path.join(root, "pngs"); fs.mkdirSync(png); fs.writeFileSync(path.join(png, "400.png"), "png");
watch.measure = async urls => new Map(urls.map(u => [u, { res: layout, dir: png }]));
const quiet = console.log; console.log = () => {};
const go = async () => { watch.pending.add("/framework/x/"); await watch.run(); };

layout = { ...clean, widths: { ...clean.widths, 400: w(0.1, true) } };
await go();
assert.equal(sent.length, 1);
assert.equal(sent[0][0], "minion-x");
assert.match(sent[0][1], /\/framework\/x\/ breaks at 400 px: overflow_x true.*shots[\\/]|shots\/.*400\.png/);
assert.ok(fs.existsSync(path.join(task_dir, "shots", "framework-x-400.png")) || fs.existsSync(path.join(task_dir, "shots", "-framework-x-400.png")) || fs.readdirSync(path.join(task_dir, "shots")).some(f => f.endsWith("-400.png")), "the shot is kept");
await go();
assert.equal(sent.length, 1, "still broken within 10 minutes: no second message");
layout = clean;
await go();
assert.equal(sent.length, 1, "recovery sends nothing");
const lines = fs.readFileSync(path.join(task_dir, "task.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l).log.msg);
assert.equal(lines.length, 2, "one break line, one clear line");
assert.match(lines[1], /clear/);
watch.pages.get("/framework/x/").messaged_at -= WorktreeWatch.QUIET_MS + 1;
layout = { ...clean, errors: ["400: boom"] };
await go();
assert.equal(sent.length, 2, "after 10 minutes a new break is told again");
console.log = quiet;
console.log("WorktreeWatch.test.mjs: ok");
