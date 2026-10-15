// node Server/AskIndex.test.mjs — AskIndex on a throwaway repo: record, cross off, inbox once, no duplicates on a re-run.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import AskIndex from "./AskIndex.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "askindex-"));
const mk = p => fs.mkdirSync(path.join(root, p), { recursive: true });
mk("public/framework/ux/Dictate"); mk("public/framework/ai/doc"); mk("public/framework/ai/sessions/2026/10/14/session-aaaaaaaa");
fs.writeFileSync(path.join(root, "public/framework/ai/doc/asks-outcomes.jsonl"), [
	{ feature: { name: "mic indicator", status: "done", link: "abc123" } },
	{ ask: { feature: "mic indicator", source: "aaaaaaaa:7", ask: "Show a mic indicator dot on every surface", raw: "mic dot" } }].map(o => JSON.stringify(o)).join("\n"));

const session = "aaaaaaaa-0000-4000-8000-000000000000", at = "2026-10-14T10:00:00Z";
const parsed = { asks: [
	{ id: "a1", text: "Show a mic indicator dot on every surface", module: "Dictate" },
	{ id: "a2", text: "Stream raw sentences into a three-line area", module: "ux/Dictate" },
	{ id: "a3", text: "Make the whole site faster", module: "site" }] };

const idx = new AskIndex({ root });
const first = idx.after_refine({ session, line: 7, at }, parsed);
assert.deepEqual(first, { recorded: 3, done: 1, inboxed: 1 });
const again = new AskIndex({ root }).after_refine({ session, line: 7, at }, parsed);
assert.deepEqual(again, { recorded: 0, done: 0, inboxed: 0 }, "a re-run records nothing new");
assert.equal(ModuleBox().length, 1, "one inbox line, never a duplicate");
const st = Object.fromEntries([...idx.records().values()].map(r => [r.id, r.status]));
assert.deepEqual(st, { a1: "done", a2: "inboxed", a3: "open" });
idx.write();
const md = fs.readFileSync(path.join(root, "public/framework/ux/Dictate/doc/refined-asks.md"), "utf8");
assert.match(md, /1 open, 1 done/); assert.match(md, /~~Show a mic indicator/);
console.log("AskIndex: ok"); fs.rmSync(root, { recursive: true, force: true });

function ModuleBox(){ return fs.readFileSync(path.join(root, "public/framework/ux/Dictate/inbox.jsonl"), "utf8").trim().split("\n"); }
