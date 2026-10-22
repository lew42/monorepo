// Splits CLAUDE.md (as of the base commit) into: a slim CLAUDE.md (claude-md.template.md with
// {{## Heading}} filled by the old section, verbatim), public/framework/doc/rules.md (framework
// rules, verbatim) and public/framework/ai/doc/agent-rules.md (safety and cost, verbatim).
// Reworded sentences go to ai/doc/claude-md-archive.md. Rerunnable; dry run unless --apply.
// Run from the repo (or worktree) root: node <this file> [--apply]
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const BASE = "86901d69d";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const apply = process.argv.includes("--apply");
const old = execSync(`git show ${BASE}:CLAUDE.md`, { encoding: "utf8" }).replace(/\r\n/g, "\n");
const sections = Object.fromEntries(old.split(/^(?=## )/m).slice(1).map(s => [s.split("\n")[0], s.trimEnd() + "\n"]));
const find = prefix => { const k = Object.keys(sections).find(h => h.startsWith(prefix)); if (!k) throw new Error(`no section ${prefix}`); return sections[k]; };

const FRAMEWORK = ["## Presentation", "## Readmes and docs", "## Classes", "## Pages, cards, review", "## The site is live", "## Traps that never throw", "## Law: code streams"];
const AGENT = ["## Memory, history, safety", "## Cost and roles"];
const KEPT = ["## Laws", "## Ask before", "## Where to look"];
const all = [...FRAMEWORK, ...AGENT, ...KEPT];
const missing = Object.keys(sections).filter(h => !all.some(p => h.startsWith(p)));
if (missing.length) throw new Error(`unplaced sections: ${missing.join(", ")}`);

// Sentences reworded in the kept text: [old, new]. The old wording is archived.
const REWORDS = [
	["`public/framework/readme.md` — THE module index (every module, one line, one link). Every mastermind and voice agent reads CLAUDE.md and then this index before working; a minion with a narrow build task may skip the index.",
	 "`public/framework/readme.md` — THE module index (every module, one line, one link) and the framework's rules; every agent reads it (\"Read first\", above)."]
];
const DROPPED_HEADER = old.match(/^Consolidated 2026-10-12:.*$/m)[0];

let claude = fs.readFileSync(path.join(HERE, "claude-md.template.md"), "utf8").replace(/\r\n/g, "\n")
	.replace(/\{\{(## [^}]+)\}\}\n?/g, (_, h) => find(h) + "\n");
for (const [a, b] of REWORDS) { if (!claude.includes(a)) throw new Error(`reword target missing: ${a.slice(0, 60)}`); claude = claude.replace(a, b); }
claude = claude.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";

const rules = `# Framework rules — presentation, readmes and docs, classes, pages, the live site, traps

Every agent reads [the framework readme](../readme.md) first; it names each rule below in one line. This is the long form, moved here word for word from \`CLAUDE.md\` on 2026-10-22 ([the move map](../ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md)). Read the section for what you are about to make: a page or a report (Presentation, Pages), a readme (Readmes and docs), a class (Classes), an edit to files the live site loads (The site is live), any front-end code (Traps).

` + FRAMEWORK.map(find).join("\n");

const agent = `# Agent rules — memory, history, safety and cost (long form)

\`CLAUDE.md\` keeps one line for each rule below; this is the full wording, moved here word for word on 2026-10-22 ([the move map](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md)). Linked from [the ai readme](../readme.md).

` + AGENT.map(find).join("\n");

const archive_add = `
## 2026-10-22: CLAUDE.md split into the framework readme and the role readmes

The framework rules moved word for word to \`public/framework/doc/rules.md\`, the safety and cost rules to \`public/framework/ai/doc/agent-rules.md\` (map: \`public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/readme-roles/moves.md\`; old file: \`git show ${BASE}:CLAUDE.md\`). Only these sentences were reworded; their old wording:

<!-- claude-md-2026-10-22:header -->
${DROPPED_HEADER}

<!-- claude-md-2026-10-22:where-to-look -->
${REWORDS.map(([a]) => `- ${a}`).join("\n")}
`;

const words = s => s.split(/\s+/).filter(Boolean).length;
const out = { "CLAUDE.md": claude, "public/framework/doc/rules.md": rules, "public/framework/ai/doc/agent-rules.md": agent };
for (const [f, t] of Object.entries(out)) console.log(`${f}: ${words(t)} words`);
console.log(`CLAUDE.md before: ${words(old)} words`);
if (apply) {
	for (const [f, t] of Object.entries(out)) fs.writeFileSync(f, t);
	const arch = "public/framework/ai/doc/claude-md-archive.md";
	const cur = fs.readFileSync(arch, "utf8");
	if (!cur.includes("## 2026-10-22: CLAUDE.md split")) fs.writeFileSync(arch, cur.trimEnd() + "\n" + archive_add);
	console.log("applied");
} else console.log("dry run (pass --apply)");
