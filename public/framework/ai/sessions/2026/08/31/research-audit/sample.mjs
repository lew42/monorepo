#!/usr/bin/env node
/**
 * Seeded stratified sample for the input audit (research round 4, Q4).
 * 15 entries per topic, drawn without replacement from that topic's
 * log.jsonl by 0-based line index, using a fixed-seed PRNG so the sample
 * is reproducible: `node sample.mjs` always prints the same 60 lines.
 *
 * Seed: 42 (the repo's own number). PRNG: mulberry32 (public domain, tiny,
 * deterministic across Node versions -- no crypto or Math.random involved).
 */
import fs from "fs";

const SEED = 42;
const PER_TOPIC = 15;
const TOPICS = ["stone", "depictions", "disclosure", "theories"];

function mulberry32(seed){
	let a = seed;
	return function(){
		a |= 0; a = (a + 0x6D2B79F5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Fisher-Yates using the seeded generator -- indices only, then take the first n. */
function sample_indices(n_total, n_take, rand){
	const idx = Array.from({ length: n_total }, (_, i) => i);
	for (let i = idx.length - 1; i > 0; i--){
		const j = Math.floor(rand() * (i + 1));
		[idx[i], idx[j]] = [idx[j], idx[i]];
	}
	return idx.slice(0, n_take).sort((a, b) => a - b);
}

const rand = mulberry32(SEED);
const sampled = [];

for (const topic of TOPICS){
	const path = `public/imagine/research/${topic}/log.jsonl`;
	const lines = fs.readFileSync(path, "utf8").split("\n").filter(l => l.trim());
	const entries = lines.map(l => JSON.parse(l));
	const picks = sample_indices(entries.length, PER_TOPIC, rand);
	for (const i of picks){
		sampled.push({ topic, line: i + 1, ...entries[i] });
	}
}

console.log(JSON.stringify(sampled, null, 2));
