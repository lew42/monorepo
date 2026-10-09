// measure.mjs — how much an agent reads before its first edit, and what the hooks block.
// Run: node .claude/skills/system-architect/measure.mjs [--json <out.json>]
// Prints a table; --json writes the same numbers to <out.json>, for a task page to draw.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../");
const rel = p => path.relative(root, p).replaceAll("\\", "/");

function count(file) {
	try {
		const t = fs.readFileSync(file, "utf8");
		return { lines: t.split("\n").length, words: t.split(/\s+/).filter(Boolean).length };
	} catch { return null; }
}

// 1. CLAUDE.md files
const claude = [
	path.join(root, "CLAUDE.md"),
	path.join(os.homedir(), ".claude/CLAUDE.md"),
].map(f => ({ file: f.startsWith(root) ? rel(f) : "~/.claude/CLAUDE.md", ...count(f) })).filter(r => r.lines);

// 2. memory index
const memDir = path.join(os.homedir(), ".claude/projects/C--Code-lew42-monorepo/memory");
const memory = count(path.join(memDir, "MEMORY.md"));

// 3. skills
const skillsDir = path.join(root, ".claude/skills");
const skills = fs.readdirSync(skillsDir).filter(d => fs.existsSync(path.join(skillsDir, d, "SKILL.md"))).map(d => {
	const f = path.join(skillsDir, d, "SKILL.md");
	const t = fs.readFileSync(f, "utf8");
	const desc = (t.match(/^description:\s*(.*)$/m) || [])[1] || "";
	const extra = fs.readdirSync(path.join(skillsDir, d)).filter(x => x !== "SKILL.md");
	return { skill: d, ...count(f), descWords: desc.split(/\s+/).filter(Boolean).length, extra: extra.join(" ") };
}).sort((a, b) => b.words - a.words);

// 4. hooks: event, matcher, script, and the block reasons each script can emit
const settings = JSON.parse(fs.readFileSync(path.join(root, ".claude/settings.json"), "utf8"));
const hooks = [];
for (const [event, groups] of Object.entries(settings.hooks || {}))
	for (const g of groups) for (const h of g.hooks) {
		const script = (h.args || []).find(a => a.endsWith(".mjs")) || h.command;
		const file = script.replace("${CLAUDE_PROJECT_DIR}", root);
		let blocks = 0, lines = 0;
		try {
			const t = fs.readFileSync(file, "utf8");
			lines = t.split("\n").length;
			blocks = (t.match(/decision["']?\s*:\s*["']block|exit\(2\)|permissionDecision["']?\s*:\s*["']deny/g) || []).length;
		} catch {}
		hooks.push({ event, matcher: g.matcher || "*", script: path.basename(file), lines, blockSites: blocks });
	}

// 5. a typical session before its first edit:
//    CLAUDE.md (project + global) + MEMORY.md + readme chain root→ai (as injected, truncated) + the skills
//    a Servex task is told to load (minion or mastermind) + new-task/code when it edits public/.
const readmeChain = ["readme.md", "public/framework/readme.md", "public/framework/ai/readme.md"]
	.map(f => ({ file: f, ...count(path.join(root, f)) }));
const sk = n => skills.find(s => s.skill === n)?.words || 0;
const descTotal = skills.reduce((a, s) => a + s.descWords, 0);
const base = claude.reduce((a, c) => a + c.words, 0)
	+ (memory?.words || 0) + readmeChain.reduce((a, r) => a + r.words, 0) + descTotal;
const profiles = {
	"minion (minion + code)": base + sk("minion") + sk("code"),
	"task mastermind (sub-mastermind + code + finish-task + documentation)": base + sk("sub-mastermind") + sk("code") + sk("finish-task") + sk("documentation"),
	"page builder (code + page + layout + css + new-page + finish-task)": base + sk("code") + sk("page") + sk("layout") + sk("css") + sk("new-page") + sk("finish-task"),
};

const out = { at: new Date().toISOString(), claude, memory, readmeChain, skillDescWords: descTotal, skills, hooks, base, profiles,
	totals: { skillWords: skills.reduce((a, s) => a + s.words, 0), skillLines: skills.reduce((a, s) => a + s.lines, 0), skillCount: skills.length } };

const j = process.argv.indexOf("--json");
if (j > 0) fs.writeFileSync(path.resolve(process.argv[j + 1] || "load.json"), JSON.stringify(out, null, "\t"));

const pad = (s, n) => String(s).padEnd(n);
console.log("CLAUDE.md files"); for (const c of claude) console.log(" ", pad(c.file, 40), pad(c.lines, 6), c.words, "words");
console.log("MEMORY.md", memory);
console.log("readme chain"); for (const r of readmeChain) console.log(" ", pad(r.file, 40), pad(r.lines, 6), r.words, "words");
console.log(`skills: ${out.totals.skillCount}, ${out.totals.skillLines} lines, ${out.totals.skillWords} words; descriptions always loaded: ${descTotal} words`);
for (const s of skills) console.log(" ", pad(s.skill, 26), pad(s.lines, 5), pad(s.words, 6), "desc", pad(s.descWords, 4), s.extra.slice(0, 60));
console.log("hooks"); for (const h of hooks) console.log(" ", pad(h.event, 18), pad(h.matcher, 28), pad(h.script, 20), pad(h.lines, 5), "block sites", h.blockSites);
console.log("base load before any skill:", base, "words");
for (const [k, v] of Object.entries(profiles)) console.log(" ", pad(k, 72), v, "words");
