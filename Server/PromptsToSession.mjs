#!/usr/bin/env node
// Server/PromptsToSession.mjs — folds each session's prompts.jsonl into its session.jsonl as Prompt tasks (core/Task/Prompt.js).
//
//   node Server/PromptsToSession.mjs [--repo <checkout>]          DRY RUN (the default): prints what it would add, writes nothing
//   node Server/PromptsToSession.mjs --apply [--repo <checkout>]  appends the Prompt lines and writes the manifest
//
// Per prompt (PromptLog.fold of the old file): ONE Prompt line `{tasks:{add:{type:"Prompt", id, raw:[raw], paragraphs:[{id:"a", text, sentences}],
// subject, parts, refined, notes, process, handled, requested_at}}}`. The old clean sentences become ONE paragraph "a" that lists them
// explicitly, so sentence i (0-based) is `a<i+1>` and every old cite (a 0-based index into clean) becomes that id, in parts and in refined cards.
// Raw, sentences, parts, cites, notes and handled all survive. The old prompts.jsonl is left in place (nothing is deleted or rewritten);
// a prompt already in the session.jsonl (same id) is skipped, so a second run adds nothing. Folders with no session.jsonl are listed, not made.
// Manifest: ai/sessions/prompts-migration-manifest.json, one entry per file: {from, to, added: [prompt ids], skipped: [...]}.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PromptLog from "../public/framework/ai/AISession/PromptLog.js";

const BY = "PromptsToSession", PARA = "a";
const sid = i => `${PARA}${i + 1}`;

/** One folded prompt (PromptLog.fold row) to the delta line that adds it as a Prompt. */
export function prompt_line(row){
	const ids = list => (list ?? []).map(sid);
	const parts = ps => (ps ?? []).map(p => ({ ...p, cites: ids(p.cites), ...(p.parts ? { parts: parts(p.parts) } : {}) }));
	const cards = cs => (cs ?? []).map(c => ({ ...c, cites: ids(c.cites), ...(c.cards ? { cards: cards(c.cards) } : {}) }));
	const add = {
		type: "Prompt", id: row.id, by: BY, requested_at: row.ref?.at ?? row.at,
		raw: row.raw == null ? [] : [row.raw],
		paragraphs: row.clean.length ? [{ id: PARA, text: row.clean.join(" "), sentences: row.clean }] : [],
		...(row.subject ? { subject: row.subject } : {}),
		...(row.source ? { via: row.source } : {}),
		...(row.ref ? { ref: row.ref } : {}),
		...(row.parts?.length ? { parts: parts(row.parts) } : {}),
		...(row.refined?.length ? { refined: cards(row.refined) } : {}),
		...(row.notes?.length ? { notes: row.notes } : {}),
		...(row.process ? { process: row.process } : {}),
		...(row.handled ? { handled: row.handled } : {}),
	};
	return { tasks: { add }, ts: row.ref?.at ?? row.at, by: BY };   // the line is stamped when it was SAID (Task#created_at reads the line ts)
}

const jsonl = file => { try { return fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } }); } catch { return []; } };
const walk = dir => { let out = []; for (const e of fs.readdirSync(dir, { withFileTypes: true })){ const f = path.join(dir, e.name); if (e.isDirectory()) out = out.concat(walk(f)); else if (e.name === PromptLog.FILE) out.push(f); } return out; };

/** The plan for one prompts.jsonl: the lines to add to the sibling session.jsonl, and what was skipped. */
export function plan_for(file){
	const to = path.join(path.dirname(file), "session.jsonl");
	if (!fs.existsSync(to)) return { from: file, to, added: [], lines: [], skipped: [{ why: "no session.jsonl beside it" }] };
	const have = new Set(); for (const l of jsonl(to)){ const a = l.tasks?.add; for (const x of [].concat(a ?? [])) if (x?.id) have.add(x.id); }
	const rows = Object.values(PromptLog.fold(jsonl(file))), lines = [], added = [], skipped = [];
	for (const row of rows){
		if (have.has(row.id)) skipped.push({ id: row.id, why: "already in session.jsonl" });
		else if (row.raw == null) skipped.push({ id: row.id, why: "no raw line" });
		else { lines.push(prompt_line(row)); added.push(row.id); }
	}
	return { from: file, to, added, lines, skipped };
}

export function migrate({ repo, apply = false } = {}){
	const sessions = path.join(repo, "public", "framework", "ai", "sessions");
	const plans = walk(sessions).map(plan_for), manifest = path.join(sessions, "prompts-migration-manifest.json");
	if (apply){
		for (const p of plans) if (p.lines.length) fs.appendFileSync(p.to, p.lines.map(l => JSON.stringify(l)).join("\n") + "\n");
		const rel = f => path.relative(repo, f).split(path.sep).join("/");
		fs.writeFileSync(manifest, JSON.stringify({ at: new Date().toISOString(), by: BY, files: plans.map(p => ({ from: rel(p.from), to: rel(p.to), added: p.added, skipped: p.skipped })) }, null, "\t") + "\n");
	}
	return plans;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])){
	const argv = process.argv.slice(2), here = path.dirname(fileURLToPath(import.meta.url));
	const repo = path.resolve(argv.includes("--repo") ? argv[argv.indexOf("--repo") + 1] : path.join(here, ".."));
	const apply = argv.includes("--apply"), plans = migrate({ repo, apply });
	for (const p of plans) console.log(`${path.relative(repo, p.from)}: ${p.added.length} to add, ${p.skipped.length} skipped${p.skipped.length ? " (" + [...new Set(p.skipped.map(s => s.why))].join("; ") + ")" : ""}`);
	console.log(`${apply ? "APPLIED" : "DRY RUN (nothing written; add --apply)"}: ${plans.reduce((n, p) => n + p.added.length, 0)} prompts in ${plans.length} files`);
}
