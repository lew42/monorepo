import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const p = path.join(process.env.LOCALAPPDATA, "lew42", "servex", "registry.json");
const j = JSON.parse(fs.readFileSync(p, "utf8"));
const rows = Array.isArray(j) ? j : Object.values(j);
console.log("total rows", rows.length);
const noSession = rows.filter(r => !r.session_id);
console.log("no session_id at all:", noSession.length, noSession.slice(0, 5).map(r => ({ id: r.id, role: r.role, provider: r.provider })));

const base = path.join(os.homedir(), ".claude", "projects");
let dirs = [];
try { dirs = fs.readdirSync(base).filter(d => /^c--code-lew42-/i.test(d)); } catch {}
const haveFile = new Set();
for (const d of dirs) for (const f of fs.readdirSync(path.join(base, d))) if (f.endsWith(".jsonl")) haveFile.add(f.replace(/\.jsonl$/, ""));

const withSession = rows.filter(r => r.session_id);
const missingTranscript = withSession.filter(r => !haveFile.has(r.session_id) && !/\//.test(String(r.model)));
console.log("with session_id:", withSession.length, "missing transcript file (non-OR):", missingTranscript.length);
console.log(missingTranscript.slice(0, 5).map(r => ({ id: r.id, role: r.role, session_id: r.session_id, model: r.model })));

const LOGS = path.join(process.env.LOCALAPPDATA, "lew42", "servex", "logs");
let noLog = 0;
for (const r of rows) if (!fs.existsSync(path.join(LOGS, "agent-" + r.id + ".jsonl"))) noLog++;
console.log("no agent-<id>.jsonl log file:", noLog, "of", rows.length);
