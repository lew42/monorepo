// Node test for the prompts.jsonl -> session.jsonl migration. Run: `node Server/PromptsToSession.test.mjs`.
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { migrate, prompt_line } from "./PromptsToSession.mjs";
import Session from "../public/framework/core/Session/Session.js";
import Prompt from "../public/framework/core/Task/Prompt.js";

const repo = fs.mkdtempSync(path.join(os.tmpdir(), "p2s-"));
const dir = path.join(repo, "public/framework/ai/sessions/2026/10/20/session-aaaa1111"), orphan = path.join(repo, "public/framework/ai/sessions/2026/10/16/session-bbbb2222");
fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(orphan, { recursive: true });
const J = o => JSON.stringify(o) + "\n";
fs.writeFileSync(path.join(dir, "session.jsonl"), J({ session: { id: "aaaa1111-0000-4000-8000-000000000000", kind: "vscode-tab" } }) + J({ tasks: { add: { id: "t0", title: "existing" } } }));
fs.writeFileSync(path.join(dir, "prompts.jsonl"),
	J({ prompt: "p1", stage: "raw", text: "Fix the chat. Why is it slow?", source: "vscode", ref: { at: "2026-10-20T19:58:22.752Z" }, at: "2026-10-23T02:00:00Z" })
	+ J({ prompt: "p1", stage: "clean", sentences: ["Fix the chat.", "Why is it slow?"], final: true, at: "2026-10-23T02:00:01Z" })
	+ J({ prompt: "p1", stage: "parts", process: "live", parts: [{ id: "a1", cites: [0], kind: "ask", text: "Fix the chat", outcome: { is: "done" } }, { id: "a2", cites: [1], kind: "question", text: "Why slow?", outcome: { is: "open" } }], at: "2026-10-23T02:00:02Z" })
	+ J({ prompt: "p2", stage: "raw", text: "Another thing entirely.", at: "2026-10-23T03:00:00Z" }));
fs.writeFileSync(path.join(orphan, "prompts.jsonl"), J({ prompt: "p9", stage: "raw", text: "No session record here.", at: "2026-10-16T00:00:00Z" }));
const before = fs.readFileSync(path.join(dir, "prompts.jsonl"), "utf8");
const read = () => fs.readFileSync(path.join(dir, "session.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l));
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };

const dry = migrate({ repo });
ok(read().length === 2 && !fs.existsSync(path.join(repo, "public/framework/ai/sessions/prompts-migration-manifest.json")), "the dry run writes nothing");
ok(dry.flatMap(p => p.added).join() === "p1,p2" && dry.find(p => p.skipped.length && !p.added.length).skipped[0].why.includes("no session.jsonl"), "it plans both prompts, and lists the folder with no session.jsonl instead of making one");

migrate({ repo, apply: true });
const s = Session.replay(read());
const p = s.tasks.find("p1");
ok(p instanceof Prompt && s.tasks.find("t0") && s.tasks.find("p2") instanceof Prompt, "the session replays the old task and both Prompts");
ok(p.raw.join() === "Fix the chat. Why is it slow?" && p.sentences.map(x => x.id).join() === "a1,a2" && p.sentence("a2").text === "Why is it slow?", "raw is kept whole; clean sentences are numbered a1, a2");
ok(p.parts[0].cites.join() === "a1" && p.parts[1].cites.join() === "a2" && p.uncovered.length === 0, "old 0-based cites became sentence ids; nothing is uncovered");
ok(p.created_at === "2026-10-20T19:58:22.752Z", "the Prompt carries when it was said (the transcript time), not when the old file was written");
ok(Math.abs(p.completion - 0.5) < 1e-9, "completion is computed from the parts: one done, one open question = 1/2");
ok(Prompt.trace(s, "why slow chat")[0]?.id === "p1", "the trace finds a migrated Prompt by the words said");
ok(fs.readFileSync(path.join(dir, "prompts.jsonl"), "utf8") === before, "the old prompts.jsonl is left exactly as it was");
const man = JSON.parse(fs.readFileSync(path.join(repo, "public/framework/ai/sessions/prompts-migration-manifest.json"), "utf8"));
ok(man.files.some(f => f.added.join() === "p1,p2" && f.to.endsWith("session-aaaa1111/session.jsonl")), "the manifest lists each file, its target and the prompt ids added");
const size = read().length;
migrate({ repo, apply: true });
ok(read().length === size, "a second run adds nothing (same id = skipped)");
fs.rmSync(repo, { recursive: true, force: true });
console.log(`all ${n} passed`);
