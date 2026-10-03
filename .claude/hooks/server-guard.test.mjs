// server-guard.test.mjs — feed the PreToolUse hook fake tool inputs, exactly as Claude Code does (JSON on stdin).
// usage: node .claude/hooks/server-guard.test.mjs        (exit 0 = all pass)
// Blocked = exit 2 with the reason on stderr. Allowed = exit 0. Broken input = exit 0 (fails open).
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const hook = join(dirname(fileURLToPath(import.meta.url)), "server-guard.mjs");
const MAIN = "C:/Code/lew42/monorepo";
const WT = "C:/Code/lew42/worktrees/qf-6";
const run = stdin => spawnSync(process.execPath, [hook], { input: stdin, encoding: "utf8", windowsHide: true });
const as = (command, cwd = MAIN, tool_name = "Bash") => JSON.stringify({ tool_name, cwd, tool_input: { command } });
let failed = 0, passed = 0;
const ok = (cond, what) => { cond ? passed++ : failed++; console.log(`${cond ? "pass" : "FAIL"}  ${what}`); };

const BLOCK = [
	// node server.js, every path form, from main and from a worktree
	[`node server.js`, MAIN],
	[`node server.js`, WT],
	[`node ./server.js`, MAIN],
	[`node C:\\Code\\lew42\\monorepo\\server.js`, MAIN],
	[`node C:/Code/lew42/worktrees/qf-6/server.js`, WT],
	[`node Server.JS`, MAIN],                                   // Windows paths aren't case sensitive
	// node Server/run.js, every path form
	[`node Server/run.js`, MAIN],
	[`node Server\\run.js`, MAIN],
	[`node ./Server/run.js`, WT],
	[`node C:\\Code\\lew42\\monorepo\\Server\\run.js`, MAIN],
	// npm wraps the same server
	[`npm start`, MAIN],
	[`npm run dev`, WT],
	// Start-Process (PowerShell)
	[`Start-Process node server.js`, MAIN, "PowerShell"],
	[`Start-Process -FilePath node -ArgumentList 'server.js'`, MAIN, "PowerShell"],
	[`Start-Process -FilePath node -ArgumentList "Server/run.js" -WindowStyle Hidden`, WT, "PowerShell"],
	// backgrounded, and with a PORT= prefix
	[`node server.js &`, MAIN],
	[`node server.js&`, MAIN],
	[`PORT=8080 node server.js &`, MAIN],
	[`PORT=8080 node server.js &`, WT],
	// chained with another command
	[`cd C:/Code/lew42/worktrees/qf-6 && node server.js`, MAIN],
	[`node server.js; echo done`, MAIN],
];
const ALLOW = [
	// the real fixes for starting a server
	[`node Server/worktree-up.mjs server-guard`, MAIN],
	[`node Server/worktree-down.mjs qf-6`, MAIN],
	[`node Server/merge.mjs C:/Code/lew42/worktrees/qf-6`, MAIN],
	[`node Server/smoke.mjs qf-6`, MAIN],
	[`node --test .claude/hooks/git-guard.test.mjs`, MAIN],
	[`node --check .claude/hooks/server-guard.mjs`, MAIN],
	[`node public/framework/ai/2026-10-02/node-reap/node-reap.mjs --apply`, MAIN],
	// "server.js" only as an argument/flag value to something else, never as the script node runs
	[`node merge.mjs --log server.js.log`, MAIN],
	[`grep -rn "server.js" Server/`, MAIN],
	[`echo "working on server.js today"`, MAIN],
	[`git commit -m "fixed server.js bug"`, MAIN],
	[`git commit -m "removed node server.js from the script"`, MAIN],
	[`cat Server/doc/watch.md`, MAIN],
	[`npm install`, MAIN],
	[`npm run test`, MAIN],
];

for (const [c, cwd, tool] of BLOCK) { const r = run(as(c, cwd, tool)); ok(r.status === 2 && /SERVER GUARD/.test(r.stderr), `blocks  [${cwd === MAIN ? "main" : "wt"}]  ${c}`); }
for (const [c, cwd, tool] of ALLOW) { const r = run(as(c, cwd, tool)); ok(r.status === 0, `allows  [${cwd === MAIN ? "main" : "wt"}]  ${c}`); }
ok(run("not json").status === 0, "fails open on malformed input");
ok(run(JSON.stringify({ tool_name: "Bash", tool_input: {} })).status === 0, "fails open with no command");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
