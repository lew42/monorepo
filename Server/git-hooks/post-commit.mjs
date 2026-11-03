// post-commit.mjs: records the new commit in the agent's task.jsonl as {"commit":"<12 hash>"}.
// Runs from .git/hooks/post-commit (install.mjs). Needs SERVEX_TASK (set by Agents.js door()).
// Never fails a commit: any error prints one line to stderr and exits 0.
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

try {
	const task = process.env.SERVEX_TASK;
	if (task && existsSync(task)) {
		const hash = process.env.SERVEX_TEST_HASH || execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { encoding: "utf8", windowsHide: true }).trim();
		const seen = readFileSync(task, "utf8").split("\n").some(l => { try { return JSON.parse(l).commit === hash; } catch { return false; } });
		if (!seen) {
			const dir = mkdtempSync(join(tmpdir(), "post-commit-"));
			const lines = join(dir, "lines.json");
			writeFileSync(lines, JSON.stringify([{ commit: hash }]));
			try { execFileSync("node", [join(ROOT, ".claude/hooks/append.mjs"), task, lines], { stdio: "pipe", windowsHide: true }); }
			finally { rmSync(dir, { recursive: true, force: true }); }
		}
	}
} catch (e) {
	console.error("post-commit.mjs: " + String(e.message || e).split("\n")[0]);
}
process.exit(0);
