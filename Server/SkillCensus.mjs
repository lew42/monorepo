// SkillCensus — one row per skill: words, rules, links (ok/dead), last edit, loads in N days, open improvements.
// Read-only. Run: node Server/SkillCensus.mjs [--days 14] [--md <out.md>] [--json <out.json>]
// Why and how it was used: public/framework/ai/doc/skills-proposals-2026-10-13.md
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

class SkillCensus {
	static repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
	static rule = /\b(never|always|must)\b/i;

	constructor({ days = 14 } = {}) {
		this.days = days;
		this.dir = path.join(SkillCensus.repo, ".claude/skills");
		this.dirs = fs.readdirSync(this.dir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
		this.skills = this.dirs.filter(s => fs.existsSync(path.join(this.dir, s, "SKILL.md")));
		this.loads = this.count_loads();
		this.roles = fs.readFileSync(path.join(SkillCensus.repo, "Servex/agents/roles.js"), "utf8");
		this.rows = this.skills.map(s => this.row(s)).sort((a, b) => b.words - a.words);
	}

	row(skill) {
		const file = path.join(this.dir, skill, "SKILL.md");
		const text = fs.readFileSync(file, "utf8");
		const links = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map(m => m[1]).filter(l => !/^(https?:|mailto:|#)/.test(l));
		const dead = links.filter(l => !SkillCensus.resolves(l, path.dirname(file)));
		const imp = path.join(this.dir, skill, "improvements.md");
		const open = fs.existsSync(imp) ? fs.readFileSync(imp, "utf8").split("\n").filter(l => /^- \d{4}-\d\d-\d\d/.test(l)).length : 0;
		let last = "";
		try { last = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: SkillCensus.repo, windowsHide: true }).toString().trim(); } catch {}
		return {
			skill,
			words: text.split(/\s+/).filter(Boolean).length,
			rules: text.split("\n").filter(l => SkillCensus.rule.test(l)).length,
			links: links.length, dead,
			last,
			loads: this.loads[skill] || 0,
			role: new RegExp(`["'\`]${skill}["'\`]`).test(this.roles),
			open,
		};
	}

	// A link resolves if it names a file or a dir (site root = public/, else the repo root).
	static resolves(link, from) {
		const p = decodeURI(link.split("#")[0].split("?")[0]);
		if (!p) return true;
		const bases = p.startsWith("/") ? [path.join(SkillCensus.repo, "public", p), path.join(SkillCensus.repo, p)] : [path.resolve(from, p)];
		return bases.some(b => fs.existsSync(b));
	}

	// The ledger hook writes {"log":{"msg":"skill: <name>"}} into the open task.jsonl on every Skill call.
	// Tasks live in ai/<YYYY-MM-DD>/ (before 2026-10-12) and ai/sessions/<Y>/<M>/<D>/ (after).
	count_loads() {
		const ai = path.join(SkillCensus.repo, "public/framework/ai");
		const since = new Date(Date.now() - this.days * 864e5).toISOString().slice(0, 10);
		const dayDirs = [];
		for (const n of fs.readdirSync(ai)) if (/^\d{4}-\d\d-\d\d$/.test(n) && n >= since) dayDirs.push(path.join(ai, n));
		const s = path.join(ai, "sessions");
		for (const y of SkillCensus.ls(s)) for (const m of SkillCensus.ls(path.join(s, y))) for (const d of SkillCensus.ls(path.join(s, y, m)))
			if (`${y}-${m}-${d}` >= since) dayDirs.push(path.join(s, y, m, d));
		const out = {};
		for (const f of dayDirs.flatMap(SkillCensus.tasks))
			for (const m of fs.readFileSync(f, "utf8").matchAll(/"msg":"skill: ([\w:-]+)"/g)) {
				const k = m[1].replace(/^.*:/, "");
				out[k] = (out[k] || 0) + 1;
			}
		return out;
	}

	static ls(d) { try { return fs.readdirSync(d).filter(n => /^\d+$/.test(n)); } catch { return []; } }
	static tasks(d) {
		return fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
			e.isDirectory() ? SkillCensus.tasks(path.join(d, e.name)) : e.name === "task.jsonl" ? [path.join(d, e.name)] : []);
	}

	get totals() {
		const sum = k => this.rows.reduce((a, r) => a + (Array.isArray(r[k]) ? r[k].length : r[k]), 0);
		return { dirs: this.dirs.length, skills: this.skills.length, words: sum("words"), rules: sum("rules"), dead: sum("dead"), open: sum("open"), loads: sum("loads") };
	}

	markdown() {
		const t = this.totals;
		const head = `| skill | words | rules | links | dead | last edit | loads ${this.days}d | role | open improvements |\n|---|--:|--:|--:|--:|---|--:|---|--:|`;
		const body = this.rows.map(r => `| ${r.skill} | ${r.words} | ${r.rules} | ${r.links} | ${r.dead.length} | ${r.last} | ${r.loads} | ${r.role ? "yes" : ""} | ${r.open} |`).join("\n");
		const dead = this.rows.filter(r => r.dead.length).map(r => `- **${r.skill}**: ${r.dead.map(d => "`" + d + "`").join(", ")}`).join("\n");
		return `# Skill census, ${new Date().toISOString().slice(0, 10)}\n\nMade by \`node Server/SkillCensus.mjs\`. Rules = lines saying never/always/must. Loads = Skill-tool calls the ledger hook logged in task.jsonl files (a Servex role's preloaded skill is not counted; see the role column).\n\n**Totals:** ${t.skills} skills of ${t.dirs} dirs · ${t.words} words · ${t.rules} rule lines · ${t.dead} dead links · ${t.open} open improvements · ${t.loads} loads\n\n${head}\n${body}\n\n## Dead links\n\n${dead || "none"}\n`;
	}
}

const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const census = new SkillCensus({ days: Number(arg("--days")) || 14 });
const md = census.markdown();
if (arg("--md")) fs.writeFileSync(arg("--md"), md);
if (arg("--json")) fs.writeFileSync(arg("--json"), JSON.stringify({ totals: census.totals, rows: census.rows }, null, 1));
console.log(md);

export default SkillCensus;
