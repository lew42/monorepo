// install.mjs: writes .git/hooks/post-commit (shared by every worktree) so each commit runs post-commit.mjs.
// Refuses to overwrite a post-commit that is not its own (marker below). usage: node Server/git-hooks/install.mjs
import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const MARKER = "# servex-task-commits";
const body = `#!/bin/sh\n${MARKER}\n[ -f Server/git-hooks/post-commit.mjs ] && node Server/git-hooks/post-commit.mjs\nexit 0\n`;

const common = resolve(execFileSync("git", ["rev-parse", "--git-common-dir"], { encoding: "utf8", windowsHide: true }).trim());
const file = join(common, "hooks", "post-commit");
if (existsSync(file) && !readFileSync(file, "utf8").includes(MARKER)) {
	console.log("refused: " + file + " exists and is not ours; left untouched");
	process.exit(1);
}
mkdirSync(join(common, "hooks"), { recursive: true });
writeFileSync(file, body);
try { chmodSync(file, 0o755); } catch {}
console.log("installed " + file);
