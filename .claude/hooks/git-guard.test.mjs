// git-guard.test.mjs — feed the PreToolUse hook fake tool inputs, exactly as Claude Code does (JSON on stdin).
// usage: node .claude/hooks/git-guard.test.mjs        (exit 0 = all pass)
// Blocked = exit 2 with the reason on stderr. Allowed = exit 0. Broken input = exit 0 (fails open).
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const hook = join(dirname(fileURLToPath(import.meta.url)), "git-guard.mjs");
const MAIN = "C:/Code/lew42/monorepo";
const WT = "C:/Code/lew42/worktrees/qf-6";
const run = stdin => spawnSync(process.execPath, [hook], { input: stdin, encoding: "utf8", windowsHide: true, env: { ...process.env, CLAUDE_PROJECT_DIR: MAIN } });
const as = (command, cwd = MAIN, tool_name = "Bash") => JSON.stringify({ tool_name, cwd, tool_input: { command } });
let failed = 0, passed = 0;
const ok = (cond, what) => { cond ? passed++ : failed++; console.log(`${cond ? "pass" : "FAIL"}  ${what}`); };

const BLOCK = [
	// the 2026-09-30 set
	[`git stash`, MAIN],
	[`git stash pop`, MAIN],
	[`git reset --hard HEAD~1`, MAIN],
	[`git checkout -- public/x.js`, MAIN],
	[`git checkout .`, MAIN],
	[`git restore public/x.js`, MAIN],
	[`git clean -fd`, MAIN],
	// the 2026-10-01 incident's shape, and its cousins
	[`git status --porcelain | grep '^??' | awk '{print $2}' | xargs rm -rf`, MAIN],
	[`git ls-files --others --exclude-standard | xargs rm -f`, MAIN],
	[`for f in $(git status --porcelain | grep '^??' | cut -c4-); do rm -rf "$f"; done`, MAIN],
	[`Remove-Item -Recurse -Force (git ls-files --others --exclude-standard)`, MAIN, "PowerShell"],
	[`git ls-files -o | ForEach-Object { Remove-Item $_ -Force }`, MAIN, "PowerShell"],
	// recursive deletes aimed inside main — from main, and from elsewhere
	[`rm -rf public/x`, MAIN],
	[`rm -fr public/x`, MAIN],
	[`rm -Rf ./public/framework/ai/2026-10-02`, MAIN],
	[`rm -r --force public/x`, MAIN],
	[`rm --recursive public/x`, MAIN],
	[`rm -rf .`, MAIN],
	[`rm -rf C:/Code/lew42/monorepo/public/x`, WT],
	[`rm -rf "C:/Code/lew42/monorepo/public/framework/ai"`, "C:/Users/mike"],
	[`cd C:/Code/lew42/monorepo && rm -rf public/x`, WT],
	[`Remove-Item -Recurse -Force public\\x`, MAIN, "PowerShell"],
	[`Remove-Item C:\\Code\\lew42\\monorepo\\public\\x -Recurse`, WT, "PowerShell"],
	[`rmdir /s /q public\\x`, MAIN, "PowerShell"],
	[`del /s /q public\\x\\*`, MAIN, "PowerShell"],
	[`rm -rf $dir`, MAIN],                                   // unknown target from main: refused
];
const ALLOW = [
	// the 2026-09-30 set
	[`git stash list`, MAIN],
	[`git stash`, WT],
	[`git reset --hard`, WT],
	[`git status --porcelain`, MAIN],
	[`git commit -m "never git stash in main"`, MAIN],
	// deletes that stay open
	[`rm -rf .`, WT],
	[`rm -rf public/x`, WT],
	[`rm -rf C:/Code/lew42/worktrees/qf-4/public/x`, MAIN],
	[`rm -rf .claude/worktrees/probe/public/x`, MAIN],
	[`rm public/framework/ai/2026-10-02/x/tmp.json`, MAIN],
	[`rm -f public/framework/ai/2026-10-02/x/tmp.json`, MAIN],
	[`rm -rf $TEMP/foo`, MAIN],
	[`rm -rf "$TEMP/lew42-pool-qf-4"`, MAIN],
	[`rm -rf /tmp/foo`, MAIN],
	[`rm -rf ${tmpdir().replace(/\\/g, "/")}/claude/x/scratchpad/probe`, MAIN],
	[`Remove-Item -Recurse -Force $env:TEMP\\lew42-pool-qf-4`, MAIN, "PowerShell"],
	[`Remove-Item -Recurse -Force C:\\Code\\lew42\\worktrees\\qf-6\\public\\x`, MAIN, "PowerShell"],
	[`git commit -m "removed rm -rf from the script"`, MAIN],
	[`grep -rn "rm -rf" Servex/`, MAIN],
	[`git status --porcelain | grep '^??' | wc -l`, MAIN],       // a listing with no delete
	[`git ls-files --others | xargs rm -rf`, WT],               // fed by git, but in your own tree
	[`node Server/merge.mjs --quick`, MAIN],
];

for (const [c, cwd, tool] of BLOCK) { const r = run(as(c, cwd, tool)); ok(r.status === 2 && /GIT GUARD/.test(r.stderr), `blocks  [${cwd === MAIN ? "main" : cwd === WT ? "wt" : cwd}]  ${c}`); }
for (const [c, cwd, tool] of ALLOW) { const r = run(as(c, cwd, tool)); ok(r.status === 0, `allows  [${cwd === MAIN ? "main" : cwd === WT ? "wt" : cwd}]  ${c}`); }
ok(run("not json").status === 0, "fails open on malformed input");
ok(run(JSON.stringify({ tool_name: "Bash", tool_input: {} })).status === 0, "fails open with no command");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
