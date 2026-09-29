/* `node Server/text-check.mjs <task dir>` — flags walls of text in what a landed task wrote for the owner.
 * Briefs for agents (requirements*.md) are skipped. It reads the latest landing's `outcome`, plus every .md file in the task dir (not in sub-dirs),
 * and flags: a paragraph over 60 words, an outcome over 120 words, a file over 500 words of prose,
 * and a file over 200 words with no picture (no image, code block, table or widget).
 * This is the `content` skill's length check, as a script. It prints the flags as JSON; on-landing.mjs
 * imports `text_flags()` and logs them. No model, never throws. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PARA = 60, OUTCOME = 120, FILE = 500, BARE = 200;

const words = s => s.replace(/\]\([^)]*\)/g, "]").replace(/`[^`]*`/g, "x").split(/\s+/).filter(w => /\w/.test(w)).length;

/* Prose paragraphs of a markdown text: code fences, tables, headings and images dropped; each list item is its own paragraph. */
function paragraphs(md){
	const out = []; let buf = [], fence = false;
	const flush = () => { if (buf.length) out.push(buf.join(" ")); buf = []; };
	for (const line of md.split("\n")) {
		if (/^\s*(```|~~~)/.test(line)) { fence = !fence; flush(); continue; }
		if (fence) continue;
		if (!line.trim() || /^\s*(#|\||!\[|<)/.test(line)) { flush(); continue; }
		if (/^\s*([-*+]|\d+\.)\s/.test(line)) flush();
		buf.push(line.trim());
	}
	flush();
	return out;
}
const pictured = md => /!\[|```|^\s*\|.*\|\s*$|<svg|<img/m.test(md);

export function text_flags(dir){
	const flags = [];
	const long = (where, md) => {
		const ps = paragraphs(md), total = ps.reduce((n, p) => n + words(p), 0);
		for (const p of ps) { const n = words(p); if (n > PARA) flags.push(`${where}: a ${n}-word paragraph ("${p.slice(0, 50)}…")`); }
		return total;
	};
	try {
		const lines = fs.readFileSync(path.join(dir, "task.jsonl"), "utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } });
		const outcome = String(lines.filter(e => e.assign?.landed_at).pop()?.assign?.outcome || "");
		if (outcome) { const n = long("outcome", outcome); if (n > OUTCOME) flags.push(`outcome: ${n} words (${OUTCOME} at most; move the rest one click down)`); }
	} catch {}
	let files = [];
	try { files = fs.readdirSync(dir).filter(f => f.endsWith(".md") && !/requirements/i.test(f)); } catch {}
	for (const f of files) {
		let md; try { md = fs.readFileSync(path.join(dir, f), "utf8"); } catch { continue; }
		const n = long(f, md);
		if (n > FILE) flags.push(`${f}: ${n} words of prose (${FILE} at most)`);
		if (n > BARE && !pictured(md)) flags.push(`${f}: ${n} words and no picture`);
	}
	return flags;
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url))
	console.log(JSON.stringify(text_flags(path.resolve(process.argv[2] || ".")), null, 1));
