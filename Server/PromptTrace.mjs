#!/usr/bin/env node
// Server/PromptTrace.mjs — "didn't I ask for this?": words the owner said -> the Prompt, when, the tasks made from it, each task's state.
//
//   node Server/PromptTrace.mjs "words the owner said" [--session <slug or id8>] [--days 30] [--min 0.8] [--json]
//
// Reads every ai/sessions/YYYY/MM/DD/<slug>/session.jsonl (or one session), replays it, and asks Prompt.trace (core/Task/Prompt.js).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Session from "../public/framework/core/Session/Session.js";
import Prompt from "../public/framework/core/Task/Prompt.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SESSIONS = path.join(HERE, "..", "public", "framework", "ai", "sessions");

const lines_of = file => fs.readFileSync(file, "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } });
const records = (root, days) => {
	const out = [], cutoff = days ? Date.now() - days * 864e5 : 0;
	for (const y of fs.readdirSync(root).filter(n => /^\d{4}$/.test(n)))
		for (const m of fs.readdirSync(path.join(root, y)).filter(n => /^\d{2}$/.test(n)))
			for (const d of fs.readdirSync(path.join(root, y, m)).filter(n => /^\d{2}$/.test(n))){
				if (cutoff && Date.parse(`${y}-${m}-${d}`) < cutoff - 864e5) continue;
				for (const slug of fs.readdirSync(path.join(root, y, m, d))){ const f = path.join(root, y, m, d, slug, "session.jsonl"); if (fs.existsSync(f)) out.push(f); }
			}
	return out;
};

/** [{session, ...hit}] for the words, best first, across the given session records (default: the last `days` days of the repo; days 0 = all). */
export function trace(words, { files, root = SESSIONS, days = 30, min } = {}){
	const hits = [];
	for (const f of files ?? records(root, days)){
		let s; try { s = Session.replay(lines_of(f)); } catch { continue; }
		for (const h of Prompt.trace(s, words, min ? { min } : {})) hits.push({ session: path.relative(root, path.dirname(f)).split(path.sep).join("/"), ...h });
	}
	return hits.sort((a, b) => b.score - a.score || String(b.at ?? "").localeCompare(String(a.at ?? "")));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])){
	const argv = process.argv.slice(2), val = n => argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined;
	const skip = new Set(["--session", "--days", "--min"].flatMap(n => argv.includes(n) ? [argv.indexOf(n), argv.indexOf(n) + 1] : []));
	const words = argv.filter((a, i) => !a.startsWith("--") && !skip.has(i)).join(" ");
	if (!words){ console.error('usage: node Server/PromptTrace.mjs "words" [--session <slug or id8>] [--days 30] [--min 0.8] [--json]'); process.exit(1); }
	let files; const one = val("--session");
	if (one) files = records(SESSIONS, 0).filter(f => f.split(path.sep).slice(-2, -1)[0].includes(one));
	const hits = trace(words, { files, days: Number(val("--days") ?? 30), min: val("--min") ? Number(val("--min")) : undefined });
	if (argv.includes("--json")) console.log(JSON.stringify(hits, null, 1));
	else if (!hits.length) console.log("no Prompt in range says that");
	else for (const h of hits.slice(0, 8)){
		console.log(`${h.at ?? "?"}  ${h.session}  ${h.id}  match ${Math.round(h.score * 100)}%  done ${Math.round(h.completion * 100)}%  ${h.subject ?? ""}`);
		for (const t of h.tasks) console.log(`    ${t.state.padEnd(9)} ${t.id}  ${t.title}`);
	}
}
