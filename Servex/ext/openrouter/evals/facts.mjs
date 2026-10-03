/* facts.mjs — small, deterministic "ground truth" tools for the known-answer analysis
 * (public/framework/ai/2026-10-02/model-weights/requirements.md, owner addition 2026-10-02):
 * "Build small fact tools in node ... Have cheap models analyse the same facts. Code checks
 * their factual claims against the tool output." Every function here answers one fact
 * question about a directory of the codebase, with NO judgment involved — a model is later
 * handed the same raw list (or the summary) and asked a question with a checkable answer
 * ("which 3 files have the fewest comment lines?", "which module is missing a readme.md?"),
 * and known-answer.mjs (sibling script) scores its claim against what ran here.
 *
 * Three facts, one per the owner's own list ("comments per line, page structure and naming"):
 *   naming()    — reuses /framework/code/patterns/class-census.mjs's own rule (does
 *                 dir/File/Class match?) rather than re-implementing it (CLAUDE.md law 6).
 *   comments(dir)  — for every .js file: lines, comment lines (// or inside /* ... *\/), ratio.
 *   structure(dir) — for every directory that has a page.js: does it also have a readme.md
 *                 and a doc/ folder (CLAUDE.md: "Every module: readme.md, page.js, doc/").
 *
 * usage:
 *   node Servex/ext/openrouter/evals/facts.mjs naming [dir]
 *   node Servex/ext/openrouter/evals/facts.mjs comments <dir>
 *   node Servex/ext/openrouter/evals/facts.mjs structure <dir>
 *   node Servex/ext/openrouter/evals/facts.mjs all <dir>      -- all three, one JSON object
 * Every command prints ONE JSON object to stdout — the ground truth a known-answer run reads.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../.."); // Servex/ext/openrouter/evals -> repo root
const SKIP_DIRS = /^(\d{4}(-\d\d-\d\d)?|node_modules|shots|runs|worktrees|\.git)$/;

function walk(d, onFile){
	for (const e of fs.readdirSync(d, { withFileTypes: true })){
		const p = path.join(d, e.name);
		if (e.isDirectory()){ if (!SKIP_DIRS.test(e.name)) walk(p, onFile); }
		else onFile(p, e.name);
	}
}

/* ── naming: reuse class-census.mjs's own walk+rule rather than a second copy of it ── */
export function naming(dir = path.join(ROOT, "public/framework")){
	const out = [];
	walk(dir, (p, name) => {
		if (!name.endsWith(".js")) return;
		const src = fs.readFileSync(p, "utf8");
		for (const m of src.matchAll(/^export (?:default )?class (\w+)/gm)){
			const cls = m[1], file = name.replace(/\.js$/, ""), dirName = path.basename(path.dirname(p));
			const ok = cls === file && cls === dirName;
			const sub = !ok && file === dirName;
			const sibling = !ok && /^[A-Z]/.test(file) && cls === file && /^[A-Z]/.test(dirName);
			out.push({ file: path.relative(ROOT, p).replaceAll("\\", "/"), class: cls, dir: dirName, ok: ok || sub || sibling });
		}
	});
	return { checked: out.length, mismatches: out.filter(r => !r.ok).map(r => `${r.file}: class ${r.class}`), rows: out };
}

/* ── comments: per .js file, lines / comment lines / ratio. A "comment line" is any line whose
 * TRIMMED text starts with // or *, or is entirely inside a /* ... *\/ block — good enough for a
 * fact a model can be asked to rank by, not a real parser (a string containing "//" mid-line is
 * not specially handled, same as class-census.mjs's own regex-only approach). */
export function comments(dir){
	const rows = [];
	walk(dir, (p, name) => {
		if (!name.endsWith(".js")) return;
		const text = fs.readFileSync(p, "utf8");
		const lines = text.split(/\r?\n/);
		let inBlock = false, commentLines = 0, blankLines = 0;
		for (const raw of lines){
			const line = raw.trim();
			if (!line){ blankLines++; continue; }
			if (inBlock){ commentLines++; if (line.includes("*/")) inBlock = false; continue; }
			if (line.startsWith("//")){ commentLines++; continue; }
			if (line.startsWith("/*")){ commentLines++; if (!line.includes("*/")) inBlock = true; continue; }
		}
		const total = lines.length;
		rows.push({ file: path.relative(ROOT, p).replaceAll("\\", "/"), lines: total, blank: blankLines,
			comment_lines: commentLines, code_lines: total - commentLines - blankLines,
			comment_ratio: total ? +(commentLines / total).toFixed(3) : 0 });
	});
	rows.sort((a, b) => b.comment_ratio - a.comment_ratio);
	return { checked: rows.length, rows };
}

/* ── structure: every dir with a page.js — does it also carry a readme.md and a doc/ folder,
 * and does every name in its own `children:` list exist as a subdirectory? (CLAUDE.md: "Nothing
 * crawls — a page exists once its parent's children: names it" — the reverse fact, a children:
 * entry with no matching folder, is just as checkable.) */
export function structure(dir){
	const rows = [];
	walk(dir, (p, name) => {
		if (name !== "page.js") return;
		const modDir = path.dirname(p);
		const has_readme = fs.existsSync(path.join(modDir, "readme.md"));
		const has_doc = fs.existsSync(path.join(modDir, "doc")) && fs.statSync(path.join(modDir, "doc")).isDirectory();
		const src = fs.readFileSync(p, "utf8");
		const childrenMatch = src.match(/children\s*:\s*\[([^\]]*)\]/s) || src.match(/children\s*:\s*`([^`]*)`/s);
		const declared = childrenMatch ? [...childrenMatch[1].matchAll(/["'`]?([\w.-]+)["'`]?/g)].map(m => m[1]).filter(Boolean) : [];
		const missing_children = declared.filter(c => !fs.existsSync(path.join(modDir, c)));
		rows.push({ module: path.relative(ROOT, modDir).replaceAll("\\", "/"), has_readme, has_doc,
			declared_children: declared, missing_children, complete: has_readme && has_doc });
	});
	return { checked: rows.length, incomplete: rows.filter(r => !r.complete).map(r => r.module),
		broken_children: rows.filter(r => r.missing_children.length).map(r => `${r.module}: ${r.missing_children.join(", ")}`), rows };
}

function main(){
	const [cmd, dirArg] = process.argv.slice(2);
	const dir = dirArg ? path.resolve(ROOT, dirArg) : path.join(ROOT, "public/framework");
	const out = cmd === "naming" ? naming(dir)
		: cmd === "comments" ? comments(dir)
		: cmd === "structure" ? structure(dir)
		: cmd === "all" ? { naming: naming(dir), comments: comments(dir), structure: structure(dir) }
		: null;
	if (!out){ console.error("usage: node facts.mjs naming|comments|structure|all [dir]"); process.exitCode = 1; return; }
	console.log(JSON.stringify(out, null, "\t"));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
