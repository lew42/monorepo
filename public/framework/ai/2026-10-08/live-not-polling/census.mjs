// Census of pollers under public/framework: a file that re-runs a read on a timer.
// Heuristic: a setInterval / setTimeout-loop (or a POLL constant) within 40 lines of a
// fetch / get_json / .load( / servex_fetch.   Usage: node census.mjs [root]  → JSON array.
import fs from "fs";
import path from "path";

const root = process.argv[2] ?? "public/framework";
const out = [];
const skip = /node_modules|[\\/]core[\\/]new[\\/]1[\\/]site|[\\/]hljs[\\/]|\.min\.js|[\\/]old[\\/]/;

(function walk(d){
	for (const e of fs.readdirSync(d, { withFileTypes: true })){
		const f = path.join(d, e.name);
		if (skip.test(f)) continue;
		if (e.isDirectory()) walk(f);
		else if (/\.(js|mjs)$/.test(e.name)) scan(f);
	}
})(root);

function scan(f){
	const lines = fs.readFileSync(f, "utf8").split("\n");
	lines.forEach((l, i) => {
		const timer = /setInterval\(|setTimeout\((poll|tick|loop|again|refresh)\b|new Promise\(\w+ => setTimeout\(\w+, *\w*POLL\w*\)/.exec(l);
		if (!timer || /^\s*(\/\/|\*)/.test(l)) return;
		const near = lines.slice(Math.max(0, i - 40), i + 40).join("\n");
		if (!/fetch\(|get_json|get_jsonl|servex_fetch|\.load\(|api\/[a-z]+/.test(near)) return;
		const ms = (/,\s*([\w.]+)\s*\)/.exec(l.slice(timer.index)) ?? [])[1];
		const urls = [...new Set([...near.matchAll(/["'`](\/api\/[\w/-]+|[\w./-]+\.jsonl?)["'`]/g)].map(m => m[1]))].slice(0, 4);
		out.push({ file: f.split(path.sep).join("/"), line: i + 1, timer: l.trim().slice(0, 90), ms: ms ?? null, reads: urls });
	});
}

console.log(JSON.stringify(out, null, 1));
