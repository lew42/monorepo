// jsonl-guard.test.mjs — feed the PreToolUse hook fake tool inputs, exactly as Claude Code does (JSON on stdin).
// usage: node .claude/hooks/jsonl-guard.test.mjs        (exit 0 = all pass)
// Blocked = exit 2 with the pointer to append.mjs on stderr. Allowed = exit 0. Broken input = exit 0 (fails open).
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const hook = join(dirname(fileURLToPath(import.meta.url)), "jsonl-guard.mjs");
const run = stdin => spawnSync(process.execPath, [hook], { input: stdin, encoding: "utf8", windowsHide: true });
const as = (tool_name, command) => JSON.stringify({ tool_name, tool_input: { command } });
let failed = 0, passed = 0;
const ok = (cond, what) => { cond ? passed++ : failed++; console.log(`${cond ? "pass" : "FAIL"}  ${what}`); };

const BLOCK = [
	["Bash", `echo '{}' >> x.jsonl`],
	["Bash", `printf '%s\\n' "$line" >> "public/framework/ai/2026-09-30/x/task.jsonl"`],
	["Bash", `cat lines.txt > board.jsonl`],
	["Bash", `echo '{}' | tee -a day.jsonl`],
	["PowerShell", `Add-Content -Path task.jsonl -Value '{}'`],
	["PowerShell", `'{}' | Out-File -Append -FilePath a\\task.jsonl`],
	["PowerShell", `Set-Content page.jsonl '{}'`],
];
const ALLOW = [
	["Bash", `node .claude/hooks/append.mjs public/framework/ai/2026-09-30/x/task.jsonl lines.json`],
	["Bash", `tail -5 public/framework/ai/2026-09-30/x/task.jsonl`],
	["Bash", `grep msg a/task.jsonl > out.txt`],
	["Bash", `node -e "files.map(f => 'a/task.jsonl')"`],
	["Bash", `some-cmd 2>&1 | grep task.jsonl`],
	["PowerShell", `Get-Content a\\task.jsonl -Tail 5`],
	["Bash", `echo hi > notes.json`],
];
for (const [tool, cmd] of BLOCK){
	const r = run(as(tool, cmd));
	ok(r.status === 2 && /append\.mjs/.test(r.stderr), `blocks  ${tool}: ${cmd}`);
}
for (const [tool, cmd] of ALLOW) ok(run(as(tool, cmd)).status === 0, `allows  ${tool}: ${cmd}`);
ok(run("not json at all").status === 0, "fails open on input it cannot parse");
ok(run("{}").status === 0, "fails open on input with no command");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
