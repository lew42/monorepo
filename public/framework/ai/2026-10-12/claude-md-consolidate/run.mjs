// node run.mjs manifest | apply | check | report   (run from anywhere; reads the repo it sits in)
import fs from "node:fs";
import path from "node:path";
import ClaudeMd from "./ClaudeMd.mjs";

const cmd = process.argv[2] || "check";
const c = new ClaudeMd();
const rows = c.manifest();
const here = ClaudeMd.HERE;

if (cmd === "manifest" || cmd === "apply") {
	fs.writeFileSync(path.join(here, "manifest.jsonl"), rows.map((r) => JSON.stringify({ id: r.id, kind: r.kind, action: r.action, to: r.to, ...(r.note ? { note: r.note } : {}), text: r.text })).join("\n") + "\n");
	const by = {};
	for (const r of rows) (by[r.action] ||= []).push(r);
	let md = `# CLAUDE.md consolidation — sentence manifest\n\nBase: \`${c.base}:CLAUDE.md\`. Every sentence of the old file has exactly one row in \`manifest.jsonl\`; this page lists the ones that left CLAUDE.md. \`node run.mjs check\` proves none is lost.\n\n`;
	md += `| action | count |\n|---|---|\n` + Object.entries(by).map(([a, l]) => `| ${a} | ${l.length} |`).join("\n") + `\n\n`;
	for (const [a, label] of [["move", "Moved to a topic doc (verbatim)"], ["merge", "Folded into a shorter rule — original wording in the archive"]]) {
		md += `## ${label}\n\n`;
		for (const g of ClaudeMd.group(by[a] || [])) md += `- **L${g.line} ${g.title}** → ${[...new Set(g.rows.map((r) => r.to))].map((t) => `\`${t}\``).join(", ")}: ${g.rows.map((r) => `${r.id} “${r.text.slice(0, 60).replace(/\|/g, "/")}…”`).join("; ")}\n`;
		md += "\n";
	}
	fs.writeFileSync(path.join(here, "manifest.md"), md);
}
if (cmd === "apply") for (const l of c.apply(rows)) console.log("wrote", l);

const res = c.check(rows);
console.log(JSON.stringify(res.counts), "total", res.total, res.ok ? "ZERO LOSS ✅" : "PROBLEMS ⚠️");
for (const p of res.problems) console.log(" -", p);
const w = (t) => ClaudeMd.words(t);
console.log(`words: old ${w(c.old_text)} → new ${w(c.new_text)}; strength words: ${JSON.stringify(c.strength())}`);

if (cmd === "report") {
	const rw = c.reworded();
	fs.writeFileSync(path.join(here, "reworded.md"), `# New-file sentences that are not verbatim from the old file (${rw.length})\n\nThis is the reviewer's worklist: each is new wording; check that it keeps the meaning and strength of the old rule it came from.\n\n` + rw.map((r) => `- ${r.id} (${r.title}): ${r.text}`).join("\n") + "\n");
	console.log("reworded sentences:", rw.length);
}
process.exit(res.ok ? 0 : 1);
