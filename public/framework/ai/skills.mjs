/* `node public/framework/ai/skills.mjs` — reads every .claude/skills/<name>/SKILL.md and
   writes skills.json (and a copy of the root CLAUDE.md) beside this file: each skill's name, its kind, what it is for and
   when it runs, split from the SKILL.md's own `description`. The Skills tab
   (/framework/ai/skills/) draws from it. Rerun it after a skill changes. */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");
const dir = join(root, ".claude/skills");

// A description is "what it is. when it runs…" — or it opens with the trigger.
const kind = d => /^(Become|You are)\b/.test(d) ? "role" : /\breference\b/i.test(d) ? "reference" : "trigger";

const skills = readdirSync(dir).filter(n => existsSync(join(dir, n, "SKILL.md"))).map(name => {
	const text = readFileSync(join(dir, name, "SKILL.md"), "utf8").replace(/\r/g, "");
	const front = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
	const description = (front.match(/^description:\s*(.*)$/m)?.[1] ?? "").replace(/^["']|["']$/g, "").trim();
	const first = description.match(/^(.+?[.!?])(\s|$)/)?.[1] ?? description;
	const rest = description.slice(first.length).trim();
	const title = text.slice(text.indexOf("---", 3) + 3).match(/^#\s+(.+)$/m)?.[1] ?? name;
	// questions.md beside it is the check `review` reads: its section names, and how many questions each.
	const q = join(dir, name, "questions.md");
	const questions = existsSync(q) ? readFileSync(q, "utf8").replace(/\r/g, "").split(/^## /m).slice(1)
		.map(sec => [sec.split("\n")[0].trim(), (sec.match(/^\s*(?:[-*]|\d+\.)\s/gm) ?? []).length]) : [];
	// A `kind:` line in the frontmatter wins over the guess (the Skills tab groups by it).
	const declared = front.match(/^kind:\s*(\w+)/m)?.[1];
	return { id: name, title, kind: declared ?? kind(description), for: first, when: rest,
		lines: text.split("\n").length, improvements: existsSync(join(dir, name, "improvements.md")), questions };
});

// CLAUDE.md is at the repo root, which the site does not serve: the CLAUDE.md tab reads this copy.
writeFileSync(join(here, "CLAUDE.md"), readFileSync(join(root, "CLAUDE.md"), "utf8"));
writeFileSync(join(here, "skills.json"), JSON.stringify(skills, null, "\t") + "\n");
console.log(`skills.json: ${skills.length} skills`);
