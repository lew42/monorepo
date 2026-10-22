/* A private Servex for a real process run (core/Task/doc/process.md): runs from THIS checkout (a worktree), ports 8390/8389/8388, a
 * throwaway LOCALAPPDATA, and nothing that touches the main Servex's agents or the repo's other logs (no task loop, pool, reaper,
 * sweeper, layers). Stays up until killed. Call its tools: POST http://127.0.0.1:8390/mcp?as=<caller> (tools/call).
 * Run: node Servex/proof/process-run.mjs   (prints the log folder) */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const local = fs.mkdtempSync(path.join(os.tmpdir(), "process-run-"));
fs.mkdirSync(path.join(local, "lew42", "servex"), { recursive: true });
fs.writeFileSync(path.join(local, "lew42", "servex", "dispatch.off"), "process run\n");
const off = ["GATE", "TASKLOOP", "HEARTBEAT", "POOL", "FIXER", "LAYERS", "SWEEP", "WORKTREES", "ASKS", "GAMES", "REAPER", "PROCESSES", "USAGE", "BUDGET", "ASSISTANT"];
const env = { ...process.env, LOCALAPPDATA: local, SERVEX_PORT: "8390", SERVEX_PROXY_PORT: "8389", SERVEX_PROXY_INTERNAL: "8388", NO_WHISPER: "1", WHISPER_PORT: "8387",
	...Object.fromEntries(off.map(k => ["SERVEX_NO_" + k, "1"])) };
for (const k of ["SERVEX_HOME", "SERVEX_POLICY", "PORT", "SERVEX_AGENT", "SERVEX_TASK"]) delete env[k];
const out = fs.openSync(path.join(local, "out.log"), "a");
console.log("private Servex from", REPO, "logs in", local);
const child = spawn(process.execPath, ["Servex/index.js"], { cwd: REPO, env, stdio: ["ignore", out, out], windowsHide: true });
child.on("exit", code => { console.log("private Servex exited", code); process.exit(code ?? 0); });
process.on("SIGTERM", () => child.kill());
process.on("SIGINT", () => child.kill());
