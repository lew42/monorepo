// install.mjs: writes .git/hooks/post-commit and commit-msg (shared by every worktree) so each commit runs post-commit.mjs and commit-msg.mjs.
// Refuses to overwrite a hook that is not its own (marker below). usage: node Server/git-hooks/install.mjs
import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const MARKER = "# servex-task-commits";
const bodies = {
	"post-commit": `#!/bin/sh
${MARKER}
[ -f Server/git-hooks/post-commit.mjs ] && node Server/git-hooks/post-commit.mjs
exit 0
`,
	"commit-msg": `#!/bin/sh
${MARKER}
[ -f Server/git-hooks/commit-msg.mjs ] && node Server/git-hooks/commit-msg.mjs "$1"
exit 0
`,
};

const common = resolve(execFileSync("git", ["rev-parse", "--git-common-dir"], { encoding: "utf8", windowsHide: true }).trim());
mkdirSync(join(common, "hooks"), { recursive: true });
let refused = 0;
for (const [name, body] of Object.entries(bodies)) {
	const file = join(common, "hooks", name);
	if (existsSync(file) && !readFileSync(file, "utf8").includes(MARKER)) { console.log("refused: " + file + " exists and is not ours; left untouched"); refused = 1; continue; }
	writeFileSync(file, body);
	try { chmodSync(file, 0o755); } catch {}
	console.log("installed " + file);
}
process.exit(refused);
