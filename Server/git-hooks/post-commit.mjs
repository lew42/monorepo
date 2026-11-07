// post-commit.mjs: records the new commit in the committing session's record (CommitLog.log), and as {"commit":"<12 hash>"} in the agent's task.jsonl.
// Runs from .git/hooks/post-commit (install.mjs). Needs SERVEX_TASK (set by Agents.js door()).
// Never fails a commit: any error prints one line to stderr and exits 0.
import { existsSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import CommitLog from "./CommitLog.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

let session_file = null;
const timer = setTimeout(() => process.exit(0), CommitLog.LIMIT); timer.unref?.();
try { session_file = await CommitLog.log(); } catch (e) { console.error("post-commit.mjs: " + String(e.message || e).split("\n")[0]); }

try {
	const task = process.env.SERVEX_TASK;
	// the session line already is in this file: a second, string-shaped line would only repeat it
	if (task && existsSync(task) && !process.env.SERVEX_COMMIT_BY && !(session_file && resolve(session_file).toLowerCase() === resolve(task).toLowerCase())) {
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
