// node public/framework/ai/sessions/2026/10/09/session-a07780b9/system-architect/oo-census/queue.mjs [--write]
// Turns each pick in top10.json into a queued task beside this script: <slug>/requirements.md and
// <slug>/task.jsonl line 1 {"assign":{"now":"queued",…}}. Importer counts come from census.json.
// Dry run by default (prints what it would write); never overwrites an existing brief or log.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../../../../../..");
const rel = p => path.relative(repo, p).replace(/\\/g, "/");
const write = process.argv.includes("--write");
const picks = JSON.parse(fs.readFileSync(path.join(here, "top10.json"), "utf8"));
const census = JSON.parse(fs.readFileSync(path.join(here, "census.json"), "utf8"));
const imp = f => census.rows.find(r => r.file === f)?.imp ?? 0;

picks.forEach((p, i) => {
	const dir = path.join(here, p.slug);
	const n = p.files.reduce((s, f) => s + imp(f), 0);
	const brief = `# Code: turn ${p.files.map(f => "`" + path.basename(f) + "`").join(", ")} into the class \`${p.class}\`

Queued by the [OO census](/framework/ai/sessions/2026/10/09/session-a07780b9/system-architect/oo-census/) (pick ${i + 1} of 10). The owner, 2026-10-09: classes and class hierarchies over lowercase files exporting loose functions; the class hierarchy should explain how a module works.

## Files

${p.files.map(f => `- \`${f}\` (${imp(f)} files import it)`).join("\n")}

Proposed home: \`${p.to}\`.

## Why this one

${p.why}

## Do

1. Load the \`code\` skill (section "The hierarchy explains the module"). Work in a worktree.
2. Write the class shape first in the module's readme \`## Architecture\` block (class, parts, which one is the manager), and one line in \`doc/architecture.md\` saying why this name, linking this task.
3. Move the functions onto the class as methods or statics. ${p.keep}
4. Move importers over by script, not by hand (\`grep\` the importers, rewrite the import lines, list every file changed). On Windows a case-only rename (\`grip\` to \`Grip\`) needs two \`git mv\` steps through a temporary name.
5. Load every page that imports it (headless, \`mcp__site__shot\`), run any test beside it, and commit each working step by exact path.

Done when: no file imports the old function names except a short re-export shim (or none), the module's page shows the class, and \`node public/framework/code/patterns/function-bag-census.mjs --repo\` no longer lists ${p.files.length > 1 ? "these files" : "the file"}.
`;
	const line = { assign: { now: "queued", title: `Code: ${p.files.map(f => path.basename(f)).join(" + ")} becomes class ${p.class}`, brief: rel(path.join(dir, "requirements.md")), parent_task: rel(here), owner: "system-architect", queue: `oo-census pick ${i + 1} (${n} importers)`, model: "claude-sonnet-5-5", effort: "medium" } };
	console.log(`${i + 1}. ${p.slug}: ${n} importers -> ${p.class}`);
	if (!write) return;
	fs.mkdirSync(dir, { recursive: true });
	const req = path.join(dir, "requirements.md");
	if (!fs.existsSync(req)) fs.writeFileSync(req, brief);
	const log = path.join(dir, "task.jsonl");
	if (fs.existsSync(log)) return;
	const tmp = path.join(process.env.TEMP ?? here, `oo-queue-${p.slug}.json`);
	fs.writeFileSync(tmp, JSON.stringify([line]));
	execFileSync("node", [path.join(repo, ".claude/hooks/append.mjs"), log, tmp], { stdio: "inherit", windowsHide: true });
	fs.unlinkSync(tmp);
});
