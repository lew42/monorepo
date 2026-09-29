import { div, h3, p, table, thead, tbody, tr, th, td, md } from "/app.js";
import refine from "/framework/ext/Refine/Refine.js";

/* This card's own content.js — see public/framework/ai2/doc/cards.md, "A
 * card's own content.js". Shows the raw → clean → structured → brief ladder
 * (ext/Refine) on the owner's real dictations, with a picker across the four
 * runs `Server/refine.mjs` has produced so far. Opens on run B (the
 * "consensus" dictation, the one built with --collab) because that's the run
 * the task mastermind asked for; the picker's `?run=` in the url remembers
 * whichever one you switch to.
 *
 * The audit table below the ladder is only ONE run's (B's) honest comparison
 * against what the VS Code tab actually relayed — `runs/b/audit.md`, still
 * landing as of this file's first version. `load_audit()` fetches it itself
 * and quietly shows nothing until it 404s no more, so nobody has to remember
 * to come back and add it once it exists.
 */
const RUNS = [
	{ id: "sample", label: "Sample (first proof run)", dir: "/framework/ai/2026-09-29/prompt-refine/runs/sample/" },
	{ id: "a", label: "A — organization mastermind", dir: "/framework/ai/2026-09-29/prompt-refine/runs/a/" },
	{ id: "b", label: "B — consensus (collab)", dir: "/framework/ai/2026-09-29/prompt-refine/runs/b/" },
	{ id: "c", label: "C — harness & research", dir: "/framework/ai/2026-09-29/prompt-refine/runs/c/" },
];

export default function content(page, box, data){
	p("Every long dictation on this card, run through `Server/refine.mjs`: raw → clean → structured → brief, with a coverage table proving nothing got lost. Pick a run below — it opens on B.");

	refine(import.meta, { run: RUNS.find(r => r.id === "b").dir, runs: RUNS }).ac("wide");

	const $audit = div.c("card-audit-slot");
	load_audit($audit);
}

/* runs/b/audit.md, once it exists, is a markdown table like the hand-read
 * ledgers this task started from (runs/a|b|c/ledger.md): one row per clean
 * sentence, a status word (kept/changed/stricter/dropped), and what the VS
 * Code tab actually wrote. This renders just the FIRST such table — the
 * per-sentence detail, not the whole file — as real HTML, dropped rows
 * warm-highlighted the same way ext/Refine's own coverage table is. */
async function load_audit($slot){
	const url = "/framework/ai/2026-09-29/prompt-refine/audit.md";
	let text;
	try {
		const resp = await fetch(url);
		if (!resp.ok) return;
		text = await resp.text();
	} catch (e) { return; }

	const rows = first_table(text);
	if (!rows.length) return;

	$slot.empty(() => {
		h3.c("card-audit-title").text("Audit — three dictations: what the VS Code tab kept, changed and dropped, against the tool");
		table.c("card-audit-table", () => {
			thead(() => tr(() => rows[0].forEach(cell => th().text(cell))));
			tbody(() => {
				rows.slice(1).forEach(cells => {
					const dropped = cells.some(c => /^dropped\b/i.test(c));
					tr.c(dropped ? "refine-dropped" : "", () => cells.forEach(cell => td().text(cell.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`/g, ""))));
				});
			});
		});
		md("Every dropped or changed ask, quoted, is in [audit.md](/framework/ai/2026-09-29/prompt-refine/audit.md).");
	});
}

/* The first contiguous run of "|"-prefixed lines in a markdown file, as rows
 * of cells (its own separator line dropped). Generic on purpose — it doesn't
 * assume audit.md's exact column names, only that it's a markdown table. */
function first_table(md){
	const lines = md.split(/\r?\n/).map(l => l.trim());
	const start = lines.findIndex(l => l.startsWith("|"));
	if (start < 0) return [];
	const block = [];
	for (let i = start; i < lines.length && lines[i].startsWith("|"); i++) block.push(lines[i]);
	return block
		.filter(l => !/^\|[\s:-]+\|/.test(l))
		.map(l => l.slice(1, l.endsWith("|") ? -1 : undefined).split("|").map(c => c.trim()));
}
