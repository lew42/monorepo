#!/usr/bin/env node
/* compare-structured.mjs — the before/after proof for the structured rung's rewrite
 * (b-structure/requirements.md, deliverable 3, 2026-09-29).
 *
 * Runs the SAME clean.md sentences through the OLD structured prompt (frozen below, exactly as
 * it read in Server/refine.mjs before this task's edit — refine.mjs no longer has that text, so
 * it can't just be re-imported) and the NEW one (structuredPromptDefault, imported live from
 * refine.mjs, so this script can never quietly drift from what refine.mjs actually runs).
 *
 * Usage: node Server/refine/compare-structured.mjs <raw.txt> <out-dir> [--mock]
 *
 * Real run (no --mock): one cheap call (clean) plus two Sonnet calls (old structured, new
 * structured) — roughly $0.10-$0.20 per input, a fraction of a full refine.mjs run (the required
 * sample run in Server/doc/refine.md cost $0.4158 for all five rungs together, on a similar-sized
 * input). --mock skips the two real structured calls (there is nothing to compare in mock mode,
 * since both prompts are stand-ins) and only proves the file layout for $0.
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

async function main() {
	const [rawPath, outDirArg, ...rest] = process.argv.slice(2);
	const mock = rest.includes("--mock");
	if (!rawPath || !outDirArg) {
		console.error("usage: node Server/refine/compare-structured.mjs <raw.txt> <out-dir> [--mock]");
		process.exit(1);
	}
	const outDir = path.resolve(outDirArg);
	fs.mkdirSync(outDir, { recursive: true });
	const cwd = repoRoot();

	const rawText = fs.readFileSync(rawPath, "utf8");
	fs.writeFileSync(path.join(outDir, "raw.txt"), rawText);

	console.log(`compare-structured: cleaning ${rawPath}...`);
	const clean = await stepClean(rawText, cwd, mock);
	fs.writeFileSync(path.join(outDir, "clean.md"), clean.md);

	const model = modelIdFor("sonnet"); // same model for both sides, so only the PROMPT differs

	console.log("compare-structured: old prompt (frozen, pre-2026-09-29)...");
	let before;
	if (mock) before = { md: "(mock: the old prompt makes no model call in --mock mode — nothing to compare here for $0; run without --mock to see real output)\n", cost_usd: 0 };
	else {
		const r = await askOnce(oldStructuredPrompt(clean.sentences), { model, cwd });
		before = { md: r.answer.trim() + "\n", cost_usd: r.cost_usd };
	}
	fs.writeFileSync(path.join(outDir, "structured-before.md"), before.md);

	console.log("compare-structured: new prompt (structuredPromptDefault, live from refine.mjs)...");
	const after = await draftStructured(model, clean.sentences, cwd, mock, 0);
	fs.writeFileSync(path.join(outDir, "structured-after.md"), after.md);

	const cost = (clean.cost_usd || 0) + (before.cost_usd || 0) + (after.cost_usd || 0);
	console.log(`compare-structured: wrote ${outDir} — cost $${cost.toFixed(4)} (clean $${(clean.cost_usd || 0).toFixed(4)}, old $${(before.cost_usd || 0).toFixed(4)}, new $${(after.cost_usd || 0).toFixed(4)})`);
}

main().catch(e => { console.error(String(e?.stack || e)); process.exitCode = 1; });
