// Node test for the trace script. Run: `node Server/PromptTrace.test.mjs`.
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { trace } from "./PromptTrace.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "ptrace-")), J = o => JSON.stringify(o) + "\n";
const dir = path.join(root, "2026/10/25/session-cccc3333"); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, "session.jsonl"),
	J({ session: { id: "cccc3333-0000-4000-8000-000000000000" } })
	+ J({ ts: "2026-10-25T09:00:00Z", tasks: { add: { type: "Prompt", id: "p1", raw: ["Make the garden page wider. Also fix the footer."], paragraphs: [{ id: "a", text: "Make the garden page wider. Also fix the footer." }] } } })
	+ J({ p1: { tasks: { add: { id: "t1", title: "garden page wider" } } } })
	+ J({ tasks: { add: { id: "t2", title: "footer", from: "p1" } } }));
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log("ok", m); };
const hits = trace("garden page wider", { root, days: 0 });
ok(hits.length === 1 && hits[0].id === "p1" && hits[0].session === "2026/10/25/session-cccc3333" && hits[0].at === "2026-10-25T09:00:00Z", "words find the Prompt, its session and its time");
ok(hits[0].tasks.map(t => `${t.id}:${t.state}`).sort().join() === "t1:idle,t2:idle", "its tasks come back with their states (nested, and filed beside it with from)");
ok(trace("zebra crossing", { root, days: 0 }).length === 0, "words nobody said find nothing");
fs.rmSync(root, { recursive: true, force: true });
console.log(`all ${n} passed`);
