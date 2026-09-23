// The second measurement method: instead of naming three files by hand and running `wc -l`,
// this FOLLOWS the load instructions — it starts at the minion skill, reads what that skill
// tells a minion to load before its first edit, and sums only those files.
//
//   node public/framework/ai/2026-09-22/skills-shrink-2/load-count.mjs
//
// It also parses every frontmatter block it touches, so a skill that stopped being a skill
// (no `name:`, no `description:`) fails here rather than silently at spawn time.
import fs from "node:fs";
import path from "node:path";

const SKILLS = "C:/Code/lew42/monorepo/.claude/skills";
const skill = n => path.join(SKILLS, n, "SKILL.md");

const read = n => {
	const s = fs.readFileSync(skill(n), "utf8");
	const m = s.match(/^---\n([\s\S]*?)\n---\n/);
	if (!m) throw new Error(`${n}: no frontmatter`);
	const fm = m[1];
	for (const key of ["name", "description"])
		if (!new RegExp(`^${key}:\\s*\\S`, "m").test(fm)) throw new Error(`${n}: frontmatter has no ${key}`);
	return s;
};

// What a fresh minion loads before it writes anything:
//   1. the `minion` skill — the prompt that starts it says so
//   2. every skill `minion` names as carried by default
//   3. `code`, which `minion` names as "read X when Y" for the first JS edit — the brief's formula
const start = read("minion");

const sentence = start.match(/This skill and (.*?) are all you carry by default/);
if (!sentence) throw new Error("minion no longer says what it carries by default — update this script");
const carried = [...sentence[1].matchAll(/`([a-z-]+)`/g)].map(m => m[1]);

// `code` is not carried by default: minion names it as "read it before your first JS edit".
// The brief's formula counts it, because a minion that edits JS always reaches it.
const named = [...new Set(["minion", ...carried, "code"])]
	.filter(n => fs.existsSync(skill(n)));

// `lines` counts newlines, exactly as `wc -l` does, so the two methods can be compared directly.
const size = s => ({ lines: (s.match(/\n/g) || []).length, words: s.split(/\s+/).filter(Boolean).length, chars: s.length });
const total = { lines: 0, words: 0, chars: 0 };

console.log("Followed the load instructions in minion/SKILL.md:\n");
for (const n of named){
	const z = size(read(n));
	total.lines += z.lines; total.words += z.words; total.chars += z.chars;
	console.log(`  ${n.padEnd(12)} ${String(z.lines).padStart(4)} lines  ${String(z.words).padStart(5)} words  ${String(z.chars).padStart(6)} chars`);
}
console.log(`\n  ${"TOTAL".padEnd(12)} ${String(total.lines).padStart(4)} lines  ${String(total.words).padStart(5)} words  ${String(total.chars).padStart(6)} chars`);
console.log(`\n  + CLAUDE.md  ${fs.readFileSync("C:/Code/lew42/monorepo/CLAUDE.md", "utf8").split("\n").length} lines, which every agent gets whether it asks or not.`);
console.log("\nFrontmatter: every file above parsed, with a name and a description.");
