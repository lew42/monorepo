// node .claude/skills/system-architect/skill-usage.mjs [--days 30]
// Which skills are actually used: counts the `{"log":{"msg":"skill: <name>"}}` lines the ledger hook
// writes into every task.jsonl when an agent invokes a skill, plus the skills Servex roles load
// (Servex/agents/roles.js, loaded without a Skill call). A skill with no calls and no role is a
// candidate to fold into another or archive (.claude/skills-archive/, with a line saying why).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const days = Number(process.argv[process.argv.indexOf("--days") + 1]) || 30;
const since = Date.now() - days * 864e5;
const skills = fs.readdirSync(path.join(repo, ".claude/skills")).filter(s => fs.existsSync(path.join(repo, ".claude/skills", s, "SKILL.md")));
const use = Object.fromEntries(skills.map(s => [s, { calls: 0, last: "" }]));
const ai = path.join(repo, "public/framework/ai");
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : e.name === "task.jsonl" ? [path.join(d, e.name)] : []);
for (const day of fs.readdirSync(ai).filter(n => /^\d{4}-\d\d-\d\d$/.test(n) && Date.parse(n) >= since - 864e5))
	for (const f of walk(path.join(ai, day)))
		for (const m of fs.readFileSync(f, "utf8").matchAll(/"msg":"skill: ([\w:-]+)"/g)) {
			const s = m[1].replace(/^.*:/, "");
			if (use[s]) { use[s].calls++; if (day > use[s].last) use[s].last = day; }
		}
const roles = fs.readFileSync(path.join(repo, "Servex/agents/roles.js"), "utf8");
for (const s of skills) use[s].role = new RegExp(`["'\`]${s}["'\`]`).test(roles);
const rows = skills.map(s => ({ skill: s, ...use[s] })).sort((a, b) => b.calls - a.calls);
console.log(`Skill calls in task logs, last ${days} days (role = a Servex role loads it):`);
for (const r of rows) console.log(`${String(r.calls).padStart(5)}  ${(r.last || "never").padEnd(10)} ${r.role ? "role " : "     "} ${r.skill}`);
const idle = rows.filter(r => !r.calls && !r.role).map(r => r.skill);
console.log(`\nNo calls and no role: ${idle.join(", ") || "none"}`);
