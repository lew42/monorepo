#!/usr/bin/env node
// page-refs.mjs — the ONE way weight data gets appended to a page's own log.
//
//   node Server/page-refs.mjs <from-url> <to-url> [--root <tree>]     one referenced_by line
//   node Server/page-refs.mjs <to-url> --weight <N> [--root <tree>]   the manual adjustment
//
// core/Page/weight/weight.js reads it back. Full write-up: core/Page/weight/doc/design.md.
//
// Dedupe: a `from-url` already recorded for this `to-url` is skipped, not repeated — running
// the same pair twice appends one line, not two. A `--weight` line is a manual "set", not a
// log: it isn't deduped against an older value (the latest one always wins — see weight.js),
// but running the SAME number twice in a row still only writes once.
//
// ⚠ 2026-09-29 fix round, finding 2: a page.js folder's weight lines go into a sibling
// `weight.jsonl`, NEVER a new `page.jsonl` — a `page.jsonl` file is what subscribes the folder
// to the dev server's file watcher (Server/plugins/PageFiles.js), and that watcher then fills
// the "weight data only" file with `{"file": …}` churn lines that have nothing to do with
// weight (doc/design.md has the incident). A folder with NO page.js — a real page.jsonl page,
// like core/Page/jsonl/ itself — keeps using its own page.jsonl, because that IS its content.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parse_args(argv){
	const rest = argv.slice(2);
	let root = null, weight_value = null;
	const positional = [];

	for (let i = 0; i < rest.length; i++){
		if (rest[i] === "--root") { root = rest[++i]; continue; }
		if (rest[i] === "--weight") { weight_value = Number(rest[++i]); continue; }
		positional.push(rest[i]);
	}

	return { positional, root: root ?? path.resolve(HERE, ".."), weight_value };
}

function folder_for(root, url){
	const rel = url.replace(/^\/+/, "").replace(/\/*$/, "/");
	return path.join(root, "public", rel);
}

function read_lines(jsonl_path){
	if (!fs.existsSync(jsonl_path)) return [];
	return fs.readFileSync(jsonl_path, "utf8").split("\n").filter(line => line.trim());
}

// A page.js folder's weight lines go in weight.jsonl (never a page.jsonl — see the header
// note). A folder with no page.js of its own IS a page.jsonl page, so its weight lines stay in
// the same file as its content.
function log_path_for(dir){
	return fs.existsSync(path.join(dir, "page.js")) ? path.join(dir, "weight.jsonl") : path.join(dir, "page.jsonl");
}

function append_line(jsonl_path, had_jsonl, obj){
	const lines = [];
	if (!had_jsonl) lines.push(JSON.stringify({ note: "weight data only — core/Page/weight/doc/design.md" }));
	lines.push(JSON.stringify(obj));

	fs.appendFileSync(jsonl_path, lines.join("\n") + "\n");
}

function usage(){
	console.error("usage:");
	console.error("  node Server/page-refs.mjs <from-url> <to-url> [--root <tree>]");
	console.error("  node Server/page-refs.mjs <to-url> --weight <N> [--root <tree>]");
	process.exit(1);
}

const { positional, root, weight_value } = parse_args(process.argv);

// ── manual weight mode ──────────────────────────────────────────────────────────────
if (weight_value !== null){
	const [to_url] = positional;
	if (!to_url || Number.isNaN(weight_value)) usage();

	const dir = folder_for(root, to_url);
	if (!fs.existsSync(dir)){ console.error(`page-refs: no folder for ${to_url} at ${dir}`); process.exit(1); }

	const jsonl_path = log_path_for(dir);
	const had_jsonl = fs.existsSync(jsonl_path);
	const parsed = read_lines(jsonl_path).map(line => { try { return JSON.parse(line); } catch { return {}; } });
	const last_weight = parsed.filter(obj => typeof obj.weight === "number").at(-1)?.weight;

	if (last_weight === weight_value){
		console.log(`page-refs: ${to_url} already has manual weight ${weight_value} — no line added.`);
		process.exit(0);
	}

	append_line(jsonl_path, had_jsonl, { weight: weight_value });
	console.log(`page-refs: ${to_url} manual weight → ${weight_value} (${jsonl_path})`);
	process.exit(0);
}

// ── referenced_by mode ──────────────────────────────────────────────────────────────
const [from_url, to_url] = positional;
if (!from_url || !to_url) usage();

const dir = folder_for(root, to_url);
if (!fs.existsSync(dir)){ console.error(`page-refs: no folder for ${to_url} at ${dir}`); process.exit(1); }

const jsonl_path = log_path_for(dir);
const had_jsonl = fs.existsSync(jsonl_path);

const already = read_lines(jsonl_path).some(line => {
	try { return JSON.parse(line).referenced_by === from_url; } catch { return false; }
});

if (already){
	console.log(`page-refs: ${to_url} already lists ${from_url} — no line added.`);
	process.exit(0);
}

append_line(jsonl_path, had_jsonl, { referenced_by: from_url });
console.log(`page-refs: referenced_by ${from_url} → ${to_url} (${jsonl_path})`);
