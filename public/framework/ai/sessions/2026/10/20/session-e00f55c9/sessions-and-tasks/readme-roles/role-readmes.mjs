// Moves six skills' bodies into role readmes (Servex/agents/roles/<role>.md) and leaves each
// SKILL.md as its frontmatter plus a one-line pointer. Relative links are re-based to the new
// folder; a link to another moved skill points at its role readme. Dry run unless --apply.
// Run from the repo (or worktree) root: node <this file> [--apply]
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MOVES = { mastermind: "mastermind", "servex-mastermind": "servex-mastermind", "sub-mastermind": "task-mastermind", minion: "minion", review: "reviewer", clarity: "clarity" };
const SKILLS = path.join(ROOT, ".claude/skills");
const DEST = path.join(ROOT, "Servex/agents/roles");
const apply = process.argv.includes("--apply");
const rel = (from, to) => path.relative(from, to).replaceAll("\\", "/");
const manifest = [];

for (const [skill, role] of Object.entries(MOVES)) {
	const file = path.join(SKILLS, skill, "SKILL.md");
	const raw = fs.readFileSync(file, "utf8");
	const m = raw.match(/^(---[\s\S]*?\n---\r?\n)([\s\S]*)$/);
	if (!m) throw new Error(`${skill}: no frontmatter`);
	const [, front, body] = m;
	if (/^Read `Servex\/agents\/roles\//.test(body.trim())) { console.log(`${skill}: already moved`); continue; }
	const old_dir = path.dirname(file);
	let links = 0;
	const moved = body.replace(/\]\(((?:\.\.?\/)?[^)#:\s]+?)(#[^)]*)?\)/g, (all, href, hash = "") => {
		if (/^[a-z]+:/i.test(href) || href.startsWith("/")) return all;
		const abs = path.resolve(old_dir, href);
		const skill_of = Object.keys(MOVES).find(s => abs === path.join(SKILLS, s, "SKILL.md"));
		const target = skill_of ? path.join(DEST, `${MOVES[skill_of]}.md`) : abs;
		links++;
		return `](${rel(DEST, target)}${hash})`;
	});
	const out = path.join(DEST, `${role}.md`);
	const header = `<!-- Role readme for \`${role}\`, moved from .claude/skills/${skill}/SKILL.md on 2026-10-22 (the skill is now a pointer here). Index: readme.md. -->\n`;
	const pointer = `Read \`Servex/agents/roles/${role}.md\` whole and follow it: that role readme is this skill's text (moved 2026-10-22, [index](../../../Servex/agents/roles/readme.md)). Improvements still go in this folder's \`improvements.md\`.\n`;
	manifest.push({ from: rel(ROOT, file), to: rel(ROOT, out), words: body.split(/\s+/).filter(Boolean).length, links_rebased: links });
	if (apply) {
		fs.mkdirSync(DEST, { recursive: true });
		fs.writeFileSync(out, header + moved.replace(/^\s+/, ""));
		fs.writeFileSync(file, front + "\n" + pointer);
	}
}
console.table(manifest);
if (apply) fs.writeFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "role-readmes.json"), JSON.stringify(manifest, null, "\t") + "\n");
console.log(apply ? "applied" : "dry run (pass --apply)");
