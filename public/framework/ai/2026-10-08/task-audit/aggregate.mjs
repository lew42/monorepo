// Folds verified.jsonl into the loose ends, finds who already owns each open one, clusters them into work items.
// Writes work-items.md and verified.md. Run: node aggregate.mjs
import fs from "fs"; import path from "path";
const here = import.meta.dirname;
const rd = f => fs.existsSync(path.join(here, f)) ? fs.readFileSync(path.join(here, f), "utf8").trim().split("\n").filter(Boolean).map(JSON.parse) : [];
const rows = rd("loose-ends.jsonl");
const ver = new Map(); rd("verified.jsonl").forEach(v => ver.set(v.row, v)); // the latest receipt per row wins

// Owners already working. Source: the task brief's list, ai/doc/priorities-2026-10-08.md and todo.md.
const OWNERS = [
	["minion-session-class", /session|AISession|token|cost|openrouter|accounting/i],
	["mastermind-refine-demo", /refine|prompt|dictat|transcri|echo|sentence|whisper|voice/i],
	["mastermind-task-system-design", /task system|task queue|recursive task|lifecycle|task\.jsonl|snooze|reprioriti/i],
	["mastermind-ai-system-docs", /readme|inbox|systems map|ai system|doc audit|index/i],
];
const ownerOf = r => { const t = [r.title, r.ask, r.fix, r.dir, r.tag, r.category].join(" "); for (const [o, re] of OWNERS) if (re.test(t)) return o; return "unowned" };

const live = rows.map((r, i) => ({ ...r, i, v: ver.get(i) })).filter(r => r.verdict === "now" || r.verdict === "later");
const eff = r => r.v ? (["done", "superseded"].includes(r.v.verdict) && r.v.confidence === "high" ? "closed" : r.verdict) : r.verdict;

// verified.md: agreement and quality
const vs = [...ver.values()];
const agree = vs.filter(v => v.agrees).length;
const by = {}; vs.forEach(v => { const k = rows[v.row].state; by[k] = by[k] || { n: 0, agree: 0 }; by[k].n++; if (v.agrees) by[k].agree++ });
const lowc = vs.filter(v => v.confidence === "low").length, bad = vs.filter(v => v.unverified?.length).length;
let m = `# Verified loose ends: what the receipts say\n\n> **${vs.length} rows checked with tools. The verifier agreed with the old label on ${agree} (${Math.round(100 * agree / (vs.length || 1))}%).** Disagreeing means the old label was wrong, not that the verifier was: each receipt lists what it searched, found and could not find (\`verified.jsonl\`, written only by \`receipts.mjs\`).\n\n`;
m += `| Old label | Rows | Verifier agreed |\n|---|---|---|\n` + Object.entries(by).map(([k, o]) => `| ${k} | ${o.n} | ${o.agree} |`).join("\n") + `\n\n`;
m += `Low-confidence receipts: ${lowc}. Receipts citing a path or commit that does not exist: ${bad} (flagged in the receipt, not trusted).\n`;
m += `\nVerdicts: ` + ["done", "partial", "not-started", "superseded", "unclear"].map(k => `${k} ${vs.filter(v => v.verdict === k).length}`).join(", ") + `.\n`;
m += `\n## My spot check (5 receipts, about 10%), read against the files and git\n\nI picked the five most surprising "done" verdicts. Two held up: row 134 has a landing commit and a landed line, row 93 has its report and review. Three were shaky: row 229 cites a JSONL commit with nothing to do with its ask; row 126's own review says "fix" and Part 2 was absent, which is partial, not done; row 110 admits it has no proof of the visible fix.\n\n**Verdict:** the receipts are much better than the first pass at finding what exists, but a "done" at medium confidence is often really "partial". So \`aggregate.mjs\` closes a row only on "done" or "superseded" at HIGH confidence; a medium "done" stays on the work list as likely done, check. The shape that fails is cleanup or review-style tasks, where the receipt lists files in the folder but no proof the ask itself happened. Change for the next run: the brief should require one quoted line of evidence per "done".\n`;
fs.writeFileSync(path.join(here, "verified.md"), m);

// work-items.md: cluster by owner + category
const groups = {};
for (const r of live) { if (eff(r) === "closed") continue; const o = ownerOf(r), k = o + "|" + r.category; (groups[k] = groups[k] || { o, cat: r.category, rows: [] }).rows.push(r) }
const COST = 0.3; // a small fix by a Sonnet coder, measured loosely at $0.2 to $0.4
const items = Object.values(groups).map(g => ({ ...g, now: g.rows.filter(r => eff(r) === "now").length, verified: g.rows.filter(r => r.v).length }));
// unowned first, since that is where new work goes; then by now-count
items.sort((a, b) => ((a.o === "unowned") ? 0 : 1) - ((b.o === "unowned") ? 0 : 1) || b.now - a.now || b.rows.length - a.rows.length);
let w = `# Work items: open loose ends, clustered and owned\n\n> **${items.reduce((s, g) => s + g.rows.length, 0)} open loose ends fold into ${items.length} work items.** Unowned ones come first: they need one mastermind each. Owned ones are routed to the agent already working that area, not spawned.\n\n`;
w += `| # | Cluster | Owner | Rows (now) | Verified | Est. cost | Smallest next step |\n|---|---|---|---|---|---|---|\n`;
items.forEach((g, n) => {
	const first = g.rows.find(r => eff(r) === "now") || g.rows[0];
	const step = String((first.v?.next_step || first.fix) || "").replace(/\|/g, "/").replace(/\s+/g, " ").slice(0, 110);
	w += `| ${n + 1} | ${g.cat} | ${g.o === "unowned" ? "**unowned**" : "@" + g.o} | ${g.rows.length} (${g.now}) | ${g.verified} | $${(g.now * COST).toFixed(1)} | ${step} |\n`;
});
w += `\nEstimated cost counts only the \`now\` rows, at about $${COST} each for a Sonnet coder. Row detail: [by-system.md](by-system.md). How rows were checked: [verified.md](verified.md).\n`;
w += `\n## Row ids per cluster (for briefs)\n\n` + items.map(g => `- **${g.cat}** (${g.o}): ${g.rows.map(r => r.i).join(", ")}`).join("\n") + "\n";
fs.writeFileSync(path.join(here, "work-items.md"), w);
console.log(items.length, "items;", vs.length, "receipts;", agree, "agree");
