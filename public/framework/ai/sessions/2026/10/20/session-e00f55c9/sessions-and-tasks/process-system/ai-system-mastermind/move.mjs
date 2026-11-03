// node move.mjs [--apply] — the role readme rename, scripted (CLAUDE.md: moves are scripted, with a dry run and a manifest).
// Moves Servex/agents/roles/servex-mastermind.md to ai-system-mastermind.md and leaves a pointer at the old path.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
const repo = execSync("git rev-parse --show-toplevel", { cwd: import.meta.dirname }).toString().trim();
const moves = [["Servex/agents/roles/servex-mastermind.md", "Servex/agents/roles/ai-system-mastermind.md"]];
const apply = process.argv.includes("--apply");
const manifest = [];
for (const [from, to] of moves){
	const a = path.join(repo, from), b = path.join(repo, to);
	if (!fs.existsSync(a)) throw new Error(`missing ${from}`);
	if (fs.existsSync(b)) throw new Error(`already there: ${to}`);
	manifest.push({ move: { from, to, at: new Date().toISOString() } });
	if (!apply) continue;
	fs.renameSync(a, b);
	fs.writeFileSync(a, `# Moved\n\nThis role is now the **AI system mastermind**: [ai-system-mastermind.md](ai-system-mastermind.md) (renamed 2026-10-23, manifest: \`public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/ai-system-mastermind/manifest.jsonl\`).\n`);
}
console.log((apply ? "moved" : "dry run") + "\n" + manifest.map(m => JSON.stringify(m)).join("\n"));
if (apply) fs.appendFileSync(new URL("./manifest.jsonl", import.meta.url), manifest.map(m => JSON.stringify(m)).join("\n") + "\n");
