#!/usr/bin/env node
// card-fold.mjs — after the one-tree merge, a .jsonl log that merge.mjs KEPT in the old card tree (ai/YYYY/…) while its copy
// landed in the store (ai/sessions/YYYY/MM/DD/cards/…) is folded into that copy, by content, never by guess:
//   same bytes                      -> the old one is a duplicate: removed (git holds both)
//   the store copy is a prefix of it -> the lines written since are appended to the store copy, then the old one removed
//                                      (listing lines {"file":…} are the dev server's, PageFiles makes its own: not carried)
//   anything else                   -> moved aside to ai/sessions/card-fold-leftovers/<old path>, untouched
// Git-ignored files are skipped (the sweep moves them). Writes card-fold.json (every action).  node card-fold.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "../../../../../../../../../..");
const AI = path.join(REPO, "public/framework/ai"), dry = process.argv.includes("--dry");
const { default: CardDir } = await import(pathToFileURL(path.join(AI, "cards/CardDir.js")).href);
const slash = p => p.split(path.sep).join("/"), rel = p => slash(path.relative(REPO, p));

const files = [];
const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })){ const f = path.join(d, e.name); e.isDirectory() ? walk(f) : files.push(f); } };
for (const y of fs.readdirSync(AI).filter(n => /^\d{4}$/.test(n))) walk(path.join(AI, y));
const ignored = new Set(spawnSync("git", ["check-ignore", "--stdin"], { cwd: REPO, input: files.map(rel).join("\n"), encoding: "utf8", windowsHide: true }).stdout.split("\n").filter(Boolean));

const listing = l => { try { const o = JSON.parse(l); return Object.keys(o).every(k => k === "file" || k === "gone"); } catch { return false; } };
const out = { at: new Date().toISOString(), dry, same: [], appended: [], aside: [], ignored: 0, listing_only: [] };
for (const f of files){
	const r = rel(f);
	const to = path.join(AI, ...CardDir.rel(path.relative(AI, f).split(path.sep).join("/")).split("/"));
	const old = fs.readFileSync(f, "utf8");
	const now = fs.existsSync(to) ? fs.readFileSync(to, "utf8") : null;
	if (now === null){ out.ignored++; continue; }   // no store copy yet (a whole card folder, or a git-ignored file): the planner moves it
	if (now !== null && old === now){ out.same.push(r); if (!dry) fs.rmSync(f); continue; }
	if (path.basename(f) === "files.jsonl" && old.split("\n").filter(l => l.trim()).every(listing)){ out.listing_only.push(r); if (!dry) fs.rmSync(f); continue; }   // a generated listing (in git history); the store ignores and regenerates them
	if (now !== null && f.endsWith(".jsonl") && old.startsWith(now)){
		const extra = old.slice(now.length).split("\n").filter(l => l.trim());
		const carry = extra.filter(l => !listing(l));
		if (!carry.length){ out.listing_only.push(r); if (!dry) fs.rmSync(f); continue; }
		out.appended.push({ from: r, to: rel(to), lines: carry.length });
		if (!dry){ fs.appendFileSync(to, (now.endsWith("\n") || !now ? "" : "\n") + carry.join("\n") + "\n"); fs.rmSync(f); }
		continue;
	}
	// a log the OLD Servex began afresh after the move (an index page re-made, one new prompt line): carry each line the store
	// copy does not have yet, except a fresh index page's own {"title"} head (the store copy has its own)
	if (now !== null && f.endsWith(".jsonl")){
		const have = new Set(now.split("\n").map(l => l.trim()));
		const carry = old.split("\n").map(l => l.trim()).filter(l => l && !have.has(l) && !/^\{"title":[^,]*\}$/.test(l));
		out.appended.push({ from: r, to: rel(to), lines: carry.length, merged: true });
		if (!dry){ if (carry.length) fs.appendFileSync(to, (now.endsWith("\n") || !now ? "" : "\n") + carry.join("\n") + "\n"); fs.rmSync(f); }
		continue;
	}
	const aside = path.join(AI, "sessions", "card-fold-leftovers", path.relative(AI, f));
	out.aside.push({ from: r, to: rel(aside), why: now === null ? "no store copy" : "differs from the store copy" });
	if (!dry){ fs.mkdirSync(path.dirname(aside), { recursive: true }); fs.renameSync(f, aside); }
}
// emptied old folders go (bottom-up, never recursive)
const prune = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) if (e.isDirectory()) prune(path.join(d, e.name)); try { if (!fs.readdirSync(d).length && !dry) fs.rmdirSync(d); } catch {} };
for (const y of fs.readdirSync(AI).filter(n => /^\d{4}$/.test(n))) prune(path.join(AI, y));
fs.writeFileSync(path.join(here, dry ? "card-fold.dry.json" : "card-fold.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ dry, same: out.same.length, appended: out.appended.length, lines: out.appended.reduce((a, x) => a + x.lines, 0), listing_only: out.listing_only.length, aside: out.aside.length, left_for_the_planner: out.ignored }));
