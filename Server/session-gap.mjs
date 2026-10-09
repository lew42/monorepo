#!/usr/bin/env node
// Server/session-gap.mjs — compute, don't recall: how many raw Claude transcripts have no session cache?
//   node Server/session-gap.mjs          count the gap, list a sample
//   node Server/session-gap.mjs --fix    build the missing caches (the same refresh() the index uses), then count again
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import Session from "../public/framework/ai/sessions/Session.js";
import { refresh } from "./session-summary.mjs";

/** Every top-level transcript the CLI wrote for this repo's folders: id -> path. (Subagent files hang off a main one.) */
export function transcripts(){
	const base = path.join(os.homedir(), ".claude", "projects"), out = new Map();
	for (const d of fs.readdirSync(base)){
		if (!/^c--code-lew42-/i.test(d)) continue;
		for (const f of fs.readdirSync(path.join(base, d))) if (/^[0-9a-f-]{36}\.jsonl$/.test(f)) out.set(f.slice(0, -6), path.join(base, d, f));
	}
	return out;
}

export async function has_cache(id){ return !!(await Session.load_cached(id)); }

export async function gap(){
	const all = transcripts(), missing = [];
	for (const id of all.keys()) if (!(await has_cache(id))) missing.push(id);
	return { transcripts: all.size, missing, all };
}

if (path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\//, ""))){
	let g = await gap();
	console.log(`transcripts ${g.transcripts}, without a cache ${g.missing.length}`);
	if (process.argv.includes("--fix") && g.missing.length){
		let made = 0, empty = 0;
		for (const id of g.missing){ const r = await refresh(id, { main_path: g.all.get(id) }).catch(() => null); r ? made++ : empty++; }
		g = await gap();
		console.log(`built ${made}, unreadable ${empty}; now transcripts ${g.transcripts}, without a cache ${g.missing.length}`);
	}
	if (g.missing.length) console.log("sample:", g.missing.slice(0, 5).map(id => id + " " + fs.statSync(g.all.get(id)).size + "B").join(", "));
}
