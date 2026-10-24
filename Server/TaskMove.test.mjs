#!/usr/bin/env node
// Server/TaskMove.test.mjs — plain node, no deps. Builds a fake repo in the OS temp dir and runs the whole
// cycle: plan -> apply -> verify -> relink -> undo -> apply, checking hashes and links at each step.
//   node Server/TaskMove.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import TaskMove from "./TaskMove.mjs";

const slash = p => p.split(path.sep).join("/");
let n = 0;
const ok = (label) => { n++; console.log(`ok ${n} - ${label}`); };

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "taskmove-test-"));
const AI = path.join(repo, "public", "framework", "ai");
const write = (p, content) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, content); };
const linkTo = (fromFile, toFile) => { const l = slash(path.relative(path.dirname(fromFile), toFile)); return l.startsWith(".") ? l : "./" + l; };

// TaskMove.sessions() loads core/Session/Session.js from INSIDE the chosen --repo (one scanner, not two) —
// the fixture needs its own copy, same relative path, so the fake repo is self-contained.
const realCore = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "framework", "core");
fs.cpSync(realCore, path.join(repo, "public", "framework", "core"), { recursive: true, filter: src => fs.statSync(src).isDirectory() ? !/[\/](tasks|ai|doc|shots)$/.test(src) : src.endsWith(".js") });

// ---- fixture: a session store, two day folders, three task shapes, loose day files, a collision, and real relative links ----

// a file that never moves — the thing every relative link in this fixture points at
const shared = path.join(AI, "doc", "shared.md");
write(shared, "# shared\n");
// a real module target, for testing import/new-URL specifier rewriting
const pageJs = path.join(repo, "public", "framework", "core", "Page", "Page.js");
write(pageJs, "export default class Page {}\n");

// session 22222222...: already in the store, under 2026/10/12 — the "with-session" task joins it
const sess22 = path.join(AI, "sessions", "2026", "10", "12", "22222222-2222-2222-2222-222222222222");
write(path.join(sess22, "index.json"), JSON.stringify({ id: "22222222-2222-2222-2222-222222222222" }));

// session 33333333...: already in the store, under 2026/10/13, and ALREADY holds a 10-10-pass task/ folder (the stub's target)
const sess33 = path.join(AI, "sessions", "2026", "10", "13", "33333333-3333-3333-3333-333333333333");
write(path.join(sess33, "index.json"), JSON.stringify({ id: "33333333-3333-3333-3333-333333333333" }));
const oldTaskDir = path.join(sess33, "task");
write(path.join(oldTaskDir, "task.jsonl"), '{"launch":{"session_id":"33333333-3333-3333-3333-333333333333"}}\n');
const reqMd = path.join(oldTaskDir, "requirements.md");
write(reqMd, `see [shared](${linkTo(reqMd, shared)})\n`);
const runMjs = path.join(oldTaskDir, "run.mjs");
write(runMjs, `import Page from "${linkTo(runMjs, pageJs)}";\nconsole.log(Page);\n`);

// day folder #1: 2026-10-12 — a joined task, an unjoined task (forced to collide), two loose day files
const day1 = path.join(AI, "2026-10-12");
const withSession = path.join(day1, "with-session");
write(path.join(withSession, "task.jsonl"), '{"launch":{"session_id":"22222222-2222-2222-2222-222222222222"}}\n');
const notesMd = path.join(withSession, "notes.md");
write(notesMd, `see [shared](${linkTo(notesMd, shared)})\n`);
// with-session moves from ai/2026-10-12/ (2 levels deep) into the sessions store (6 levels deep) — a real depth
// change, so its relative import specifier genuinely needs rewriting (unlike a same-level rename, which never does)
const withSessionRun = path.join(withSession, "run.mjs");
write(withSessionRun, `import Page from "${linkTo(withSessionRun, pageJs)}";\nconsole.log(Page);\n`);

const noSession = path.join(day1, "no-session");
write(path.join(noSession, "task.jsonl"), '{"launch":{"session_id":"99999999-9999-9999-9999-999999999999"}}\n');   // not in the store
// pre-existing placeholder at the unjoined target, to force a real collision -> dedupe to "no-session-2"
fs.mkdirSync(path.join(AI, "sessions", "2026", "10", "12", "no-session"), { recursive: true });

write(path.join(day1, "day.jsonl"), '{"log":"day one"}\n');
write(path.join(day1, "files.jsonl"), '{"file":"x"}\n');

// day folder #2: 2026-10-13 — the 10-10-pass stub, pointing at session 33333333's task/ folder
const day2 = path.join(AI, "2026-10-13");
write(path.join(day2, "stubbed", "moved.json"), JSON.stringify({ moved_to: "public/framework/ai/sessions/2026/10/13/33333333-3333-3333-3333-333333333333/task", session: "33333333-3333-3333-3333-333333333333", at: new Date().toISOString() }) + "\n");

// a file elsewhere that talks ABOUT the moved tasks, in all three address spellings, plus a bare day link
const otherRef = path.join(repo, "readme.md");
write(otherRef, [
	"see public/framework/ai/2026-10-12/with-session/notes.md",
	"also /framework/ai/2026-10-12/with-session/ for details",
	"or ai/2026-10-12/with-session for short",
	"the whole day: /framework/ai/2026-10-13/",
].join("\n") + "\n");

// ---- 1. plan ----
const { moves: planMoves, counts } = await TaskMove.plan(repo);
assert.equal(counts.task, 2, "two task folders (with-session, no-session)");
assert.equal(counts.rename, 1, "one 10-10 stub renamed");
assert.equal(counts.stub, 1, "one stub archived");
assert.equal(counts.dayfile, 2, "two loose day files");
assert.equal(counts.collisions, 1, "the forced collision on no-session");
assert.equal(counts.joined, 1, "with-session joins session 22222222...");
assert.equal(counts.unjoined, 1, "no-session's id is not in the store");
assert.ok(planMoves.some(m => m.kind === "redirect"), "a redirect line is planned for the stub's old address");
ok("plan: counts match the fixture");

// ---- 2. apply ----
const { moved } = await TaskMove.apply(repo);
assert.equal(moved, 6, "six physical moves (2 task + 1 rename + 1 stub + 2 dayfile); the redirect line is virtual");
ok("apply: moved the right number of folders/files");

assert.ok(!fs.existsSync(day1), "day folder 1 is gone (emptied)");
assert.ok(!fs.existsSync(day2), "day folder 2 is gone (emptied)");
const newWithSession = path.join(sess22, "with-session");
assert.ok(fs.existsSync(path.join(newWithSession, "notes.md")), "with-session landed inside its session folder");
const dedupedNoSession = path.join(AI, "sessions", "2026", "10", "12", "no-session-2");
assert.ok(fs.existsSync(path.join(dedupedNoSession, "task.jsonl")), "no-session landed as no-session-2 (collision dedupe)");
const newStubbed = path.join(sess33, "stubbed");
assert.ok(fs.existsSync(path.join(newStubbed, "requirements.md")), "the 10-10 task/ folder was renamed to its slug, stubbed/");
assert.ok(!fs.existsSync(oldTaskDir), "the old task/ folder is gone (renamed away)");
const archived = path.join(AI, "archive", "task-stubs", "2026-10-13", "stubbed", "moved.json");
assert.ok(fs.existsSync(archived), "the stub folder itself was archived, never deleted");
assert.ok(fs.existsSync(path.join(AI, "sessions", "2026", "10", "12", "day.jsonl")), "day.jsonl landed in the sessions-store day folder");
assert.ok(fs.existsSync(path.join(AI, "sessions", "2026", "10", "12", "files.jsonl")), "files.jsonl landed in the sessions-store day folder");
ok("apply: every kind landed where the plan said");

const ledgerLines = fs.readFileSync(TaskMove.ledger(repo), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
assert.ok(ledgerLines.every(l => !("files" in l)), "task-moves.jsonl lines stay small (no files[])");
assert.ok(fs.existsSync(TaskMove.filesLedger(repo)), "the per-file snapshot lives in its own task-moves-files.jsonl");
ok("apply: the ledger is the small line + a separate snapshot file, as specified");

// ---- 3. verify ----
const v1 = TaskMove.verify(repo);
assert.equal(v1.bad.length, 0, "every snapshot file hashes the same at its new home");
assert.ok(v1.files > 0);
ok("verify: zero missing/changed files");

// ---- 4. relink ----
const r = TaskMove.relink(repo, ledgerLines, { dry: false });
assert.ok(r.hits > 0, "relink found something to fix");
assert.ok(r.importHits > 0, "relink separately counted import/URL specifier fixes");
ok("relink: made fixes and reported counts");

const resolves = (fromFile, link) => fs.existsSync(path.resolve(path.dirname(fromFile), link));
const mdLink = f => /\]\((\.\.?\/[^)]+)\)/.exec(fs.readFileSync(f, "utf8"))[1];
assert.ok(resolves(path.join(newWithSession, "notes.md"), mdLink(path.join(newWithSession, "notes.md"))), "notes.md's link to shared.md still resolves after the move");
assert.ok(resolves(path.join(newStubbed, "requirements.md"), mdLink(path.join(newStubbed, "requirements.md"))), "requirements.md's link to shared.md still resolves after the deeper move");
const importLink = f => /from\s+["'](\.\.?\/[^"']+)["']/.exec(fs.readFileSync(f, "utf8"))[1];
const newRun = path.join(newWithSession, "run.mjs");
assert.ok(resolves(newRun, importLink(newRun)), "run.mjs's import specifier still resolves after the move");
ok("relink: every moved file's own relative reference still resolves to a real file");

const refText = fs.readFileSync(otherRef, "utf8");
assert.ok(refText.includes("sessions/2026/10/12/22222222-2222-2222-2222-222222222222/with-session"), "the public/framework/ai/<day>/<slug> spelling was rewritten");
assert.ok(refText.includes("/framework/ai/sessions/2026/10/12/22222222-2222-2222-2222-222222222222/with-session"), "the /framework/ai/<day>/<slug> spelling was rewritten");
assert.ok(refText.includes(" ai/sessions/2026/10/12/22222222-2222-2222-2222-222222222222/with-session"), "the bare ai/<day>/<slug> spelling was rewritten");
assert.ok(refText.includes("/framework/ai/sessions/2026/10/13/"), "a bare day link was rewritten to the sessions-store day folder");
assert.ok(!refText.includes("2026-10-12/with-session"), "no old-shaped address is left in the file");
ok("relink: all three address spellings, plus the bare day link, were rewritten");

// ---- 5. undo ----
const back = TaskMove.undo(repo);
assert.equal(back, 6, "all six physical moves reversed");
assert.ok(fs.existsSync(day1) && fs.existsSync(day2), "both day folders are back");
assert.ok(fs.existsSync(oldTaskDir), "the renamed task/ folder is back at its old spot");
assert.ok(!fs.existsSync(newWithSession), "the session folder no longer holds with-session");
ok("undo: every folder moved back");

const v2 = TaskMove.verify(repo);
assert.equal(v2.folders, 0, "nothing is active after undo, so verify checks nothing");
ok("verify after undo: the active set is empty, not stale");

// ---- 6. apply again: a clean second pass from the restored day folders ----
const again = await TaskMove.apply(repo);
assert.equal(again.moved, 6, "the second apply moves the same six things forward again");
ok("apply again: the round trip repeats cleanly");

console.log(`\n${n} checks passed.`);
fs.rmSync(repo, { recursive: true, force: true });
