// Real test: a real Sessions in a temp repo (no agents woken). Run: node real-test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import Sessions from "file:///C:/Code/lew42/worktrees/qf-7/Servex/agents/Sessions.js";

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "vs-"));
fs.mkdirSync(path.join(repo, "public"), { recursive: true });
const S = new Sessions({ repo, file: path.join(repo, "sessions.json"), prewarm: 0 });
const r = S.create({ path: "/" });
const d = new Date(), p = n => String(n).padStart(2, "0");
const want = `/framework/ai/sessions/${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}/${r.session}/session.jsonl`;
assert.equal(r.file, want);
const disk = path.join(repo, "public", ...want.split("/").filter(Boolean));
assert.ok(fs.existsSync(disk), "session.jsonl exists at the dated path");
const line1 = JSON.parse(fs.readFileSync(disk, "utf8").split("\n")[0]);
assert.equal(line1.session.kind, "voice");
assert.equal(S.map[r.session].kind, "voice");
assert.equal(JSON.parse(fs.readFileSync(path.join(repo, "sessions.json"), "utf8"))[r.session].kind, "voice");
S.summarize({ session: r.session, title: "Dated folder test", summary: "A summary." });
const sum = path.join(path.dirname(disk), "session.summary.json");
assert.ok(fs.existsSync(sum), "summary beside session.jsonl");
assert.equal(S.summary_file(S.map[r.session]), sum);
assert.match(S.tail(S.map[r.session]), /"kind":"voice"/);
console.log("PASS", want, "\nsummary:", path.basename(sum), "\nline1:", JSON.stringify(line1));
fs.rmSync(repo, { recursive: true, force: true });
process.exit(0);
