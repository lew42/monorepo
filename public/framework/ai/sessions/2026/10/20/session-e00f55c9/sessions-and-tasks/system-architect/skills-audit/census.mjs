// Census of every skill in .claude/skills: facts only, no verdicts.
// Usage: node census.mjs [--logs <ai dir>]   (default: the main tree's public/framework/ai)
// Writes census.json and census.md beside this file, prints a summary.
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SKIP = new Set(["node_modules", "worktrees", ".git"]);
const arg = process.argv.indexOf("--logs");
const LOGS = arg > -1 ? process.argv[arg + 1] : "C:/Code/lew42/monorepo/public/framework/ai";

// Repo root = the first folder above here that holds .claude/skills (works from any worktree).
let ROOT = here;
while (!fs.existsSync(path.join(ROOT, ".claude", "skills"))) {
	const up = path.dirname(ROOT);
	if (up === ROOT) throw new Error("no .claude/skills above " + here);
	ROOT = up;
}
const SKILLS = path.join(ROOT, ".claude", "skills");

// Every file under dir, skipping node_modules and worktrees.
function walk(dir, out = []) {
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		if (SKIP.has(e.name)) continue;
		const p = path.join(dir, e.name);
		if (e.isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}

// Frontmatter: name, and description (single line, or an indented block after > or |).
function frontmatter(text) {
	const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	const out = { name: null, description: null };
	if (!m) return out;
	const lines = m[1].split(/\r?\n/);
	lines.forEach((line, i) => {
		const kv = line.match(/^(\w+):\s*(.*)$/);
		if (!kv) return;
		if (kv[1] === "name") out.name = kv[2].trim();
		if (kv[1] === "description") {
			if (/^[>|]/.test(kv[2].trim())) {
				const block = [];
				for (let j = i + 1; j < lines.length && /^\s+/.test(lines[j]); j++) block.push(lines[j].trim());
				out.description = block.join(" ");
			} else out.description = kv[2].trim();
		}
	});
	return out;
}

// Files that name a skill: skills/<name>, "skill: <name>", or the name in quotes/backticks.
function namePattern(name) {
	const n = name.replace(/[.*+?^${}()|[\]\\:]/g, "\\$&");
	return new RegExp(`skills/${n}\\b|skill[:\\s"'\`(]+${n}\\b|["'\`]${n}["'\`]`);
}

function grepFile(file, re) {
	const hits = [];
	const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
	for (const l of lines) if (re.test(l)) { hits.push(path.relative(ROOT, file).split(path.sep).join("/")); break; }
	return hits;
}

// Stream every session.jsonl and task.jsonl under LOGS, one line at a time, and count "skill: <name>" log lines.
async function countLoads(names) {
	const loads = Object.fromEntries(names.map(n => [n, { count: 0, latest: null }]));
	const files = walk(LOGS).filter(f => /(^|[\\/])(session|task)\.jsonl$/.test(f));
	for (const file of files) {
		const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
		for await (const line of rl) {
			if (!line.includes('"skill: ')) continue;
			let obj; try { obj = JSON.parse(line); } catch { continue; }
			const msg = obj?.log?.msg;
			if (typeof msg !== "string" || !msg.startsWith("skill: ")) continue;
			const name = msg.slice(7).trim();
			if (!loads[name]) continue;
			loads[name].count++;
			const day = String(obj.log.at || "").slice(0, 10);
			if (day && (!loads[name].latest || day > loads[name].latest)) loads[name].latest = day;
		}
	}
	return { loads, files: files.length };
}

const dirs = fs.readdirSync(SKILLS, { withFileTypes: true }).filter(e => e.isDirectory() && fs.existsSync(path.join(SKILLS, e.name, "SKILL.md")));
const skills = dirs.map(d => {
	const folder = path.join(SKILLS, d.name);
	const text = fs.readFileSync(path.join(folder, "SKILL.md"), "utf8");
	const fm = frontmatter(text);
	const otherFiles = walk(folder).filter(f => path.basename(f) !== "SKILL.md" && path.basename(f) !== "improvements.md").length;
	const imp = path.join(folder, "improvements.md");
	const improvements = fs.existsSync(imp) ? fs.readFileSync(imp, "utf8").split(/\r?\n/).length : 0;
	return {
		dir: d.name,
		name: fm.name || d.name,
		description: fm.description,
		lines: text.split(/\r?\n/).length,
		bytes: Buffer.byteLength(text, "utf8"),
		other_files: otherFiles,
		improvements,
	};
});

const names = skills.map(s => s.name);
const { loads, files: logFiles } = await countLoads(names);

// Where each name is written down. The scan is by pattern, so it can over-count a common word.
const sources = walk(ROOT).filter(f => {
	const rel = path.relative(ROOT, f).split(path.sep).join("/");
	return rel === "CLAUDE.md" || rel.startsWith(".claude/hooks/") || rel.startsWith(".claude/skills/") || (rel.startsWith("Servex/") && f.endsWith(".js"));
});
for (const s of skills) {
	const re = namePattern(s.name);
	const hits = [];
	for (const f of sources) {
		const rel = path.relative(ROOT, f).split(path.sep).join("/");
		if (rel === `.claude/skills/${s.dir}/SKILL.md`) continue;
		hits.push(...grepFile(f, re));
	}
	const preloaded = [...new Set(hits.filter(h => h.startsWith("Servex/")))];
	s.loads = loads[s.name].count;
	s.latest_load = loads[s.name].latest;
	s.preloaded_by = preloaded.length;
	s.referenced_by = { count: new Set(hits).size, paths: [...new Set(hits)].slice(0, 5) };
}

skills.sort((a, b) => b.loads - a.loads || a.name.localeCompare(b.name));
const zero = skills.filter(s => s.loads === 0).map(s => s.name);
const biggest = [...skills].sort((a, b) => b.bytes - a.bytes).slice(0, 5).map(s => `${s.name} (${s.bytes} bytes)`);
const unreferenced = skills.filter(s => s.referenced_by.count === 0 && s.preloaded_by === 0).map(s => s.name);

const summary = {
	generated: new Date().toISOString(),
	logs_read: { root: LOGS, files: logFiles },
	skills: skills.length,
	zero_loads: zero,
	biggest_by_bytes: biggest,
	unreferenced: unreferenced,
};
fs.writeFileSync(path.join(here, "census.json"), JSON.stringify({ summary, skills }, null, 2) + "\n");

const row = s => `| ${s.name} | ${s.loads} | ${s.latest_load || "-"} | ${s.lines} | ${s.bytes} | ${s.preloaded_by} | ${s.referenced_by.count} | ${s.improvements || "-"} |`;
const md = [
	"# Skill census",
	"",
	`Generated ${summary.generated} by \`census.mjs\`. Facts only. Logs read from \`${LOGS}\` (${logFiles} session/task files).`,
	"",
	"## Summary",
	"",
	`- ${skills.length} skills. Zero loads in the logs: ${zero.length ? zero.join(", ") : "none"}.`,
	`- Five biggest by bytes: ${biggest.join(", ")}.`,
	`- No file references them (not in CLAUDE.md, hooks, skills, or Servex): ${unreferenced.length ? unreferenced.join(", ") : "none"}.`,
	"- Caveat: the reference scan matches a quoted or pathed name, so a common word such as \"code\" may over-count.",
	"",
	"## Table",
	"",
	"| skill | loads | latest load | lines | bytes | preloaded_by (Servex files) | referenced_by (files) | improvements.md lines |",
	"|---|---|---|---|---|---|---|---|",
	...skills.map(row),
	"",
].join("\n");
fs.writeFileSync(path.join(here, "census.md"), md);

console.log(md.split("\n").slice(0, 12).join("\n"));
console.log(`\nWrote census.json and census.md (${skills.length} skills, ${logFiles} log files).`);
