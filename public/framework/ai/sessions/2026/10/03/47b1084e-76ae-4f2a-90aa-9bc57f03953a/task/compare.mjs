// compare.mjs — scores title/tag agreement between two build.mjs output files, by code
// (CLAUDE.md law 7: compute, don't recall — a human/AI eyeballing "these look similar"
// is not a measurement).
//
// Usage:
//   node compare.mjs <fileA.json> <fileB.json>
//
// Expects both files to be build.mjs output: { model, items: [{ index, title, tags, ... }] }
// covering the same prompt indices (the owner's 5-prompt sample: luna vs deepseek vs Sonnet).
// Prints one row per shared index plus an overall score, and writes <fileA>-vs-<fileB>.json
// next to fileA so the result is itself inspectable (not just console output — law 1,
// "show, don't tell": the page that uses this reads the JSON, not a log scrollback).

import fs from "node:fs";
import path from "node:path";

function titleWords(s) {
	return new Set(
		String(s || "")
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, " ")
			.split(/\s+/)
			.filter(Boolean)
	);
}

function jaccard(a, b) {
	if (a.size === 0 && b.size === 0) return 1;
	let inter = 0;
	for (const x of a) if (b.has(x)) inter++;
	const union = a.size + b.size - inter;
	return union === 0 ? 1 : inter / union;
}

function compareOne(itemA, itemB) {
	const titleScore = jaccard(titleWords(itemA?.title), titleWords(itemB?.title));
	const tagsA = new Set(itemA?.tags || []);
	const tagsB = new Set(itemB?.tags || []);
	const tagScore = jaccard(tagsA, tagsB);
	return {
		index: itemA?.index ?? itemB?.index,
		titleA: itemA?.title ?? null,
		titleB: itemB?.title ?? null,
		title_agreement: Number(titleScore.toFixed(2)),
		tagsA: [...tagsA],
		tagsB: [...tagsB],
		tag_agreement: Number(tagScore.toFixed(2))
	};
}

function run() {
	const [fileA, fileB] = process.argv.slice(2);
	if (!fileA || !fileB) {
		console.error("Usage: node compare.mjs <fileA.json> <fileB.json>");
		process.exit(1);
	}
	const dataA = JSON.parse(fs.readFileSync(fileA, "utf8"));
	const dataB = JSON.parse(fs.readFileSync(fileB, "utf8"));
	const byIndexB = new Map((dataB.items || []).map(it => [it.index, it]));

	const rows = (dataA.items || [])
		.filter(it => byIndexB.has(it.index))
		.map(it => compareOne(it, byIndexB.get(it.index)));

	const avg = key => rows.length ? Number((rows.reduce((s, r) => s + r[key], 0) / rows.length).toFixed(2)) : null;

	const result = {
		modelA: dataA.model,
		modelB: dataB.model,
		compared: rows.length,
		avg_title_agreement: avg("title_agreement"),
		avg_tag_agreement: avg("tag_agreement"),
		rows
	};

	const outFile = path.join(path.dirname(fileA), `${path.basename(fileA, ".json")}-vs-${path.basename(fileB, ".json")}.json`);
	fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
	console.log(JSON.stringify({ ok: true, modelA: result.modelA, modelB: result.modelB, avg_title_agreement: result.avg_title_agreement, avg_tag_agreement: result.avg_tag_agreement, outFile }));
}

run();
