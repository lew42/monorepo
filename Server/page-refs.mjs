#!/usr/bin/env node
// page-refs.mjs — the ONE way weight data gets appended to a page's own page.jsonl.
//
//   node Server/page-refs.mjs <from-url> <to-url> [--root <tree>]     one referenced_by line
//   node Server/page-refs.mjs <to-url> --weight <N> [--root <tree>]   the manual adjustment
//
// Both write into <to-url>'s OWN page.jsonl — the owner's own design ("each page knows where
// it's being referenced from"). core/Page/weight/weight.js reads it back. Full write-up:
// core/Page/weight/doc/design.md.
//
// Dedupe: a `from-url` already recorded for this `to-url` is skipped, not repeated — running
// the same pair twice appends one line, not two. A `--weight` line is a manual "set", not a
// log: it isn't deduped against an older value (the latest one always wins — see weight.js),
// but running the SAME number twice in a row still only writes once.
//
// A page.js folder gets a real page.jsonl file too, created here the first time it's needed.
// That's proven inert to routing in doc/design.md — Page.class.js's loader only ever imports
// that folder's page.js, never looks for a page.jsonl unless a PARENT explicitly declared the
// child as "name/page.jsonl" — but it's the one non-obvious step in this whole tool, so it is
// always PRINTED, never done silently.

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

function append_line(jsonl_path, had_jsonl, has_page_js, obj, to_url){
	const lines = [];
	if (!had_jsonl) lines.push(JSON.stringify({ note: "weight data only — core/Page/weight/doc/design.md" }));
	lines.push(JSON.stringify(obj));

	fs.appendFileSync(jsonl_path, lines.join("\n") + "\n");
	if (!had_jsonl && has_page_js)
		console.log(`page-refs: ${to_url} is a page.js page — created a weight-only page.jsonl beside it, inert to routing (doc/design.md).`);
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

	const jsonl_path = path.join(dir, "page.jsonl");
	const had_jsonl = fs.existsSync(jsonl_path);
	const parsed = read_lines(jsonl_path).map(line => { try { return JSON.parse(line); } catch { return {}; } });
	const last_weight = parsed.filter(obj => typeof obj.weight === "number").at(-1)?.weight;

	if (last_weight === weight_value){
		console.log(`page-refs: ${to_url} already has manual weight ${weight_value} — no line added.`);
		process.exit(0);
	}

	append_line(jsonl_path, had_jsonl, fs.existsSync(path.join(dir, "page.js")), { weight: weight_value }, to_url);
	console.log(`page-refs: ${to_url} manual weight → ${weight_value} (${jsonl_path})`);
	process.exit(0);
}

// ── referenced_by mode ──────────────────────────────────────────────────────────────
const [from_url, to_url] = positional;
if (!from_url || !to_url) usage();

const dir = folder_for(root, to_url);
if (!fs.existsSync(dir)){ console.error(`page-refs: no folder for ${to_url} at ${dir}`); process.exit(1); }

const jsonl_path = path.join(dir, "page.jsonl");
const had_jsonl = fs.existsSync(jsonl_path);
const has_page_js = fs.existsSync(path.join(dir, "page.js"));

const already = read_lines(jsonl_path).some(line => {
	try { return JSON.parse(line).referenced_by === from_url; } catch { return false; }
});

if (already){
	console.log(`page-refs: ${to_url} already lists ${from_url} — no line added.`);
	process.exit(0);
}

append_line(jsonl_path, had_jsonl, has_page_js, { referenced_by: from_url }, to_url);
console.log(`page-refs: referenced_by ${from_url} → ${to_url} (${jsonl_path})`);
