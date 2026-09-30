#!/usr/bin/env node
/* compare-structured.mjs — the before/after proof for the structured rung's rewrite
 * (b-structure/requirements.md, deliverable 3, 2026-09-29).
 *
 * Runs the SAME clean.md sentences through the OLD structured prompt (frozen below, exactly as
 * it read in Server/refine.mjs before this task's edit — refine.mjs no longer has that text, so
 * it can't just be re-imported) and the NEW one (structuredPromptDefault, imported live from
 * refine.mjs, so this script can never quietly drift from what refine.mjs actually runs).
 *
 * Usage: node Server/refine/compare-structured.mjs <raw.txt> <out-dir> [--mock] [--after-only]
 *
 * A real run makes three calls: clean (Haiku), then the old and the new structured prompt (both
 * Sonnet). Measured 2026-09-29: $0.36 on a 550-word dictation, $0.58 on a 1,700-word one.
 * --after-only reuses <out-dir>/clean.md and reruns only the new prompt, leaving
 * structured-before.md as it was (roughly half the cost). --mock proves the file layout for $0.
 * Every run ends with check(): bullet count, deepest level, sentences cited twice or never —
 * printed and written to check.txt.
 *
 * Every Node spawn sets windowsHide: true (none here — this script makes no child process). */
import fs from "node:fs";
import path from "node:path";
import { askOnce } from "../ask-each.mjs";
import { stepClean, draftStructured, modelIdFor, repoRoot } from "../refine.mjs";

const cleanTextForPrompt = sentences => sentences.map(s => `S${s.n}. ${s.text}`).join("\n");

// Frozen exactly as Server/refine.mjs's own draftStructured() read before this task rewrote it —
// see this task's git history for the same text in context. Kept here, word for word, so the
// diff this script produces is the actual proof, not a claim about what the old code used to do.
function oldStructuredPrompt(sentences) {
	return `Read this numbered, cleaned transcript of the owner talking. Write an OUTLINE of the owner's\n`
		+ `own ideas: Markdown bullets, using the owner's own words and names for things — never invent new\n`
		+ `terminology. Group related sentences under one bullet where that helps. Do not add any idea that\n`
		+ `is not in the transcript, and do not turn a hedge ("maybe", "I think", "I guess") into a flat claim.\n\n`
		+ `Every bullet MUST end with the sentence numbers it is based on, in this exact form: [S3, S7].\n`
		+ `Cite each sentence individually — never a range like [S6-S9]; a range hides which specific\n`
		+ `sentence supports which part of the bullet. Use only sentence numbers that appear below —\n`
		+ `never invent one.\n\n`
		+ `Cleaned transcript:\n"""\n${cleanTextForPrompt(sentences)}\n"""\n\n`
		+ `Output ONLY the outline (Markdown bullets), nothing else.`;
}

// The mechanical check on an outline: how many bullets, how deep they nest, which sentence numbers
// are cited more than once or not at all, and the headings.
function check(md, sentences) {
	const bullets = md.split("\n").filter(l => /^\s*-\s/.test(l));
	const depth = Math.max(0, ...bullets.map(l => Math.floor(l.match(/^\s*/)[0].length / 2) + 1));
	const count = new Map();
	for (const c of md.matchAll(/\[([^\]]*)\]/g))
		for (const n of c[1].matchAll(/S(\d+)/g)) count.set(+n[1], (count.get(+n[1]) || 0) + 1);
	const twice = [...count].filter(([, k]) => k > 1).map(([n]) => "S" + n);
	const never = sentences.filter(s => !count.has(s.n)).map(s => "S" + s.n);
	const headings = md.split("\n").filter(l => /^#{1,2} /.test(l));
	return `sentences ${sentences.length}, bullets ${bullets.length}, deepest level ${depth}, `
		+ `cited twice: ${twice.join(" ") || "none"}, never cited: ${never.join(" ") || "none"}\n`
		+ headings.join("\n") + "\n";
}

async function main() {
	const [rawPath, outDirArg, ...rest] = process.argv.slice(2);
	const mock = rest.includes("--mock");
	const afterOnly = rest.includes("--after-only");
	if (!rawPath || !outDirArg) {
		console.error("usage: node Server/refine/compare-structured.mjs <raw.txt> <out-dir> [--mock] [--after-only]");
		process.exit(1);
	}
	const outDir = path.resolve(outDirArg);
	fs.mkdirSync(outDir, { recursive: true });
	const cwd = repoRoot();

	let clean;
	if (afterOnly) {
		const md = fs.readFileSync(path.join(outDir, "clean.md"), "utf8");
		const sentences = [...md.matchAll(/^S(\d+)\.\s+(.*)$/gm)].map(m => ({ n: +m[1], text: m[2] }));
		clean = { md, sentences, cost_usd: 0 };
		console.log(`compare-structured: --after-only, reusing clean.md (${sentences.length} sentences) and structured-before.md`);
	} else {
		const rawText = fs.readFileSync(rawPath, "utf8");
		fs.writeFileSync(path.join(outDir, "raw.txt"), rawText);
		console.log(`compare-structured: cleaning ${rawPath}...`);
		clean = await stepClean(rawText, cwd, mock);
		fs.writeFileSync(path.join(outDir, "clean.md"), clean.md);
	}

	const model = modelIdFor("sonnet"); // same model for both sides, so only the PROMPT differs

	let before = { cost_usd: 0 };
	if (!afterOnly) {
		console.log("compare-structured: old prompt (frozen, pre-2026-09-29)...");
		if (mock) before = { md: "(mock: the old prompt makes no model call in --mock mode — nothing to compare here for $0; run without --mock to see real output)\n", cost_usd: 0 };
		else {
			const r = await askOnce(oldStructuredPrompt(clean.sentences), { model, cwd });
			before = { md: r.answer.trim() + "\n", cost_usd: r.cost_usd };
		}
		fs.writeFileSync(path.join(outDir, "structured-before.md"), before.md);
	}

	console.log("compare-structured: new prompt (structuredPromptDefault, live from refine.mjs)...");
	const after = await draftStructured(model, clean.sentences, cwd, mock, 0);
	fs.writeFileSync(path.join(outDir, "structured-after.md"), after.md);
	const report = check(after.md, clean.sentences);
	fs.writeFileSync(path.join(outDir, "check.txt"), report);
	console.log(report);

	const cost = (clean.cost_usd || 0) + (before.cost_usd || 0) + (after.cost_usd || 0);
	console.log(`compare-structured: wrote ${outDir} — cost $${cost.toFixed(4)} (clean $${(clean.cost_usd || 0).toFixed(4)}, old $${(before.cost_usd || 0).toFixed(4)}, new $${(after.cost_usd || 0).toFixed(4)})`);
}

main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });
