#!/usr/bin/env node
/* relabel-waiting.mjs — move status updates out of "Waiting on you", without touching a past line.
 *
 *   node relabel-waiting.mjs [--root <main tree>] [--apply]      (default: a dry run; prints the manifest)
 *
 * A card waits (WaitingOnYou.waits, new rule) when it is open and its status is `needs-you`.
 * An old `needs-you` STATUS that is really a report (no `owner_note` of kind needs-you, no open
 * Decision/Question that Servex /waiting finds on it) gets two appended lines (through Servex POST /card/append, the one writer, so cards.jsonl refreshes itself):
 *   {"status":"open"}                          Fold: latest line wins, so the card leaves the waiting bucket
 *   {"relabel":{was,why,by,at}}                provenance; Fold keeps unknown keys as plain data
 * Undo: append {"status":"needs-you"} to the same files (manifest.json lists them). Nothing is edited or deleted. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const args = process.argv.slice(2), APPLY = args.includes("--apply");
const i = args.indexOf("--root");
if (i < 0){ console.error("pass --root <the tree whose cards to relabel> (the main tree, not a worktree)"); process.exit(1); }
const ROOT = path.resolve(args[i + 1]);
const AI = path.join(ROOT, "public/framework/ai");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CardDir = (await import(pathToFileURL(path.join(ROOT, "public/framework/ai/cards/CardDir.js")).href)).default;
const CLOSED = new Set(["done", "archived"]);

const rows = fs.readFileSync(path.join(AI, "cards.jsonl"), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
const WORDS = /\bfor you\b|\bdecision\b/i;
const old_waits = c => !CLOSED.has(c.status) && !!(c.owner_note || c.status === "needs-you" || WORDS.test([c.title, c.preview, c.state].filter(Boolean).join(" ")));
const new_waits = c => !CLOSED.has(c.status) && (c.status === "needs-you" || c.owner_note?.kind === "needs-you");

// Real open Decision/Question widgets, as Servex's own NeedsRule finds them.
let real = new Set();
try { real = new Set((await (await fetch("http://127.0.0.1:8090/waiting", { signal: AbortSignal.timeout(5000) })).json()).map(w => w.card)); }
catch (e) { console.error(e?.message, "Servex /waiting not answering: aborting rather than guess which are real."); process.exit(1); }

// A card folder is CardDir.rel(id) under ai/ (the one rule); the old tree is the fallback.
const find_file = id => [CardDir.rel(id), CardDir.old(id)].map(r => path.join(AI, ...r.split("/"), "page.jsonl")).find(f => fs.existsSync(f)) ?? null;

const before = rows.filter(old_waits).length, before_new = rows.filter(new_waits).length;
const todo = rows.filter(c => c.status === "needs-you" && c.owner_note?.kind !== "needs-you" && !real.has(c.id));
const manifest = [], kept = rows.filter(c => new_waits(c) && !todo.includes(c)).map(c => c.id);
const at = new Date().toISOString();
for (const c of todo){
	const file = find_file(c.id);
	if (!file){ manifest.push({ id: c.id, file: null, skipped: "no page.jsonl found" }); continue; }
	manifest.push({ id: c.id, title: c.title, file: path.relative(ROOT, file).replaceAll("\\", "/"), was: c.status });
	if (APPLY){
		const post = async line => { const r = await (await fetch("http://127.0.0.1:8090/card/append?id=" + encodeURIComponent(c.id), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(line) })).json(); if (!r.ok) throw new Error(c.id + ": " + r.why); };
		await post({ status: "open" });
		await post({ relabel: { was: "needs-you", why: "a status update, not a question for the owner (inbox-labels 2026-10-16)", by: "inbox-labels", at } });
	}
}
const result = { applied: APPLY, rule_before: before, rule_new_before: before_new, relabelled: manifest.filter(m => m.file).length, skipped: manifest.filter(m => !m.file).length, kept_real: kept };
console.log(JSON.stringify(result, null, 1));
fs.writeFileSync(path.join(HERE, APPLY ? "manifest.json" : "manifest-dryrun.json"), JSON.stringify({ ...result, cards: manifest }, null, 1));
