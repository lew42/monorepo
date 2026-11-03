// Moves the ai readme's two long sections ("On disk…" and "Sessions and tasks…") word for word to
// ai/doc/records.md (relative links re-based by one folder), and puts the index first.
// Rerunnable from the base commit; dry run unless --apply. Run from the repo (or worktree) root.
import fs from "node:fs";
import { execSync } from "node:child_process";

const BASE = "86901d69d", F = "public/framework/ai/readme.md", OUT = "public/framework/ai/doc/records.md";
const apply = process.argv.includes("--apply");
const old = execSync(`git show ${BASE}:${F}`, { encoding: "utf8" }).replace(/\r\n/g, "\n");
const [top, ...secs] = old.split(/^(?=## )/m);
const sec = p => { const s = secs.find(x => x.startsWith(p)); if (!s) throw new Error(p); return s; };
const MOVE = ["## On disk", "## Sessions and tasks"];
const rebase = s => s.replace(/\]\((?!\/|[a-z]+:|#)([^)]+)\)/g, (_, h) => `](../${h})`).replace(/\]\(\.\.\/doc\//g, "](");
const moved = MOVE.map(sec).map(rebase).join("\n").trimEnd() + "\n";
const records = `# AI records — what is on disk, who writes it, who reads it; who makes sessions and tasks

Moved word for word from [the ai readme](../readme.md) on 2026-10-22, so the readme stays an index ([move map](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md)). Links are re-based to this folder.

${moved}`;

const [title, intro, priority] = top.trim().split(/\n\n/);
const index = sec("## Every system").trimEnd().replace("## Every system, one line each\n",
	`## Every system, one line each

- **Records** (every file in \`ai/\`, its writer and its reader; who makes sessions and tasks, and where): [doc/records.md](doc/records.md)
- **Roles and rules:** one readme per role, [Servex/agents/roles/readme.md](../../../Servex/agents/roles/readme.md) · safety and cost rules, long form: [doc/agent-rules.md](doc/agent-rules.md) · what each agent reads: [doc/readme-system.md](doc/readme-system.md)`);
const readme = [title, priority, intro, index, sec("## Classes and folders").trimEnd(), sec("## More").trimEnd()].join("\n\n") + "\n";
const words = s => s.split(/\s+/).filter(Boolean).length;
console.log(`ai readme ${words(old)} -> ${words(readme)} words; records.md ${words(records)}`);
if (apply) { fs.writeFileSync(F, readme); fs.writeFileSync(OUT, records); console.log("applied"); } else console.log("dry run (pass --apply)");
