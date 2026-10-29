#!/usr/bin/env node
// Server/Deprecated.mjs — the deprecation census: every `DEPRECATED (` mark in live code, with its live caller count.
// Read-only unless --write. The rule: public/framework/doc/rules.md (ask 30); the shape: core/Session/tasks/data-shapes/seats/legacy/shape.md.
//   node Server/Deprecated.mjs                 dry run: the table on screen, nothing written
//   node Server/Deprecated.mjs --json          the same as JSON
//   node Server/Deprecated.mjs --write <file>  also write one JSON line per mark to <file> (a snapshot; not the source of truth)
// A mark is: // DEPRECATED (YYYY-MM-DD): use <replacement>. Guide: <path>. Remove when: <condition>.
// Callers are counted by the regex declared per symbol in SYMBOLS below, over live files only (history folders excluded).
// A count marked "~" collides with DOM or other APIs and is a ceiling, not a measure.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slash = p => p.split(path.sep).join("/");
const rel = p => slash(path.relative(REPO, p));

// First code line after a mark picks its symbol; `callers` is the regex counted per line (null: not countable by text).
const SYMBOLS = [
	{ name: "page.children", def: /class PageChildren|get children\(\)\s*\{\s*return this\._children/, callers: /\.children\.(get|has|set|forEach|keys|values|size|delete|put|clear|entries)\b/ },
	{ name: "Item#locate / the `at` key", def: /if \("at" in delta\)|\/\* ⚠ Compat only \(2026-10-03\)/, callers: /\.locate\??\.?\(/, approx: true },
	{ name: "Item#save / Item#delete (Saver door)", def: /^save\(\)\{ return this\.saver/, callers: /\.saver\b/ },
	{ name: "Item.open(Saver)", def: /typeof src !== "string"/, callers: /Item\.open\(\s*\w*[sS]aver\w*\s*\)/ },
	{ name: "ext/Saver", def: /class Saver\b/, callers: /ext\/Saver\/|\bnew (File|LocalStorage|Memory)?Saver\b/, perFile: true },
	{ name: "Session pseudo-property fall-through", def: /this\.put\(k, v\);\s*$/, callers: null, note: "history-bound: counts are in ai/system-map.md section 3e" },
	{ name: "Task `finish` verb", def: /^const VERBS/, callers: /\.finish\(/, approx: true },
	{ name: "Task#finish", def: /^finish\(args\)/, callers: /\.finish\(/, approx: true },
	{ name: "Task legacy field mapping", def: /"finished_at" \? "completed_at"/, callers: null, note: "history-bound: old folders only" },
	{ name: "Task#replay_legacy", def: /^replay_legacy\(/, callers: /\.replay_legacy\(/ },
	{ name: "List#each / List#children", def: /^each\(fn\)/, callers: /\.each\(/, approx: true },
];
const MARK = /DEPRECATED \((\d{4}-\d{2}-\d{2})\):\s*use (.+?)\.\s*Guide:\s*(.+?)\.\s*Remove when:\s*(.+?)\.?\s*$/;
const SKIP_DIR = /(^|\/)(node_modules|\.git|legacy|old|archive|new|\.worktrees)$|\/sessions\/\d{4}\/|\/ai\/\d{4}-\d{2}-\d{2}($|\/)/;
const CODE = /\.(m?js)$/;

export default class Deprecated {
	static *walk(dir){
		let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of ents){
			const p = path.join(dir, e.name);
			if (e.isDirectory()){ if (!SKIP_DIR.test(slash(p)) && !(e.name === "new" && slash(p).endsWith("core/new"))) yield* this.walk(p); }
			else if (CODE.test(e.name)) yield p;
		}
	}

	/** Parse one comment line; null if it is not a complete mark. */
	static parse(line){
		const m = line.match(MARK);
		return m ? { date: m[1], use: m[2], guide: m[3], remove_when: m[4] } : null;
	}

	static roots(root = REPO){ return ["public", "Servex", "Server", ".claude"].map(d => path.join(root, d)); }

	static files(root = REPO){ return this.roots(root).flatMap(r => [...this.walk(r)]); }

	/** The marks in the given files: { file, line, symbol, date, use, guide, guide_exists, remove_when, incomplete }. */
	static marks(files, root = REPO){
		const out = [];
		for (const file of files){
			const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
			lines.forEach((text, i) => {
				if (!/^\s*(\/\/|\/\*)\s*DEPRECATED \(/.test(text)) return;
				const parsed = this.parse(text);
				const code = (lines[i + 1] ?? "").trim();
				const sym = SYMBOLS.find(s => s.def.test(code));
				const guide = parsed?.guide ?? null;
				const guide_path = guide && guide.startsWith("/") ? path.join(root, "public", guide.replace(/^\/framework/, "/framework")) : null;
				out.push({ file: rel(file), line: i + 1, symbol: sym?.name ?? `(no symbol pattern for: ${code.slice(0, 50)})`, ...parsed,
					guide_exists: guide_path ? fs.existsSync(guide_path) : null, incomplete: !parsed, _sym: sym });
			});
		}
		return out;
	}

	/** Add live caller counts: matching lines per symbol, split into the marked file and the rest. */
	static count(marks, files){
		const texts = files.map(f => [rel(f), fs.readFileSync(f, "utf8").split(/\r?\n/)]);
		const cache = new Map();
		for (const m of marks){
			const s = m._sym; delete m._sym;
			if (!s?.callers){ m.callers = null; m.note = s?.note ?? "no caller pattern declared in Server/Deprecated.mjs SYMBOLS"; continue; }
			if (!cache.has(s.name)){
				const per = new Map();
				for (const [f, lines] of texts){
					const n = lines.reduce((a, l) => a + (/^\s*(\/\/|\*|\/\*)/.test(l) ? 0 : s.callers.test(l) ? 1 : 0), 0);
					if (n) per.set(f, n);
				}
				cache.set(s.name, per);
			}
			const per = cache.get(s.name);
			const marked = new Set(marks.filter(x => x.symbol === m.symbol).map(x => x.file));   // a file that carries this symbol's own mark is the definition, not a caller
			const outside = [...per.entries()].filter(([f]) => !marked.has(f));
			m.callers = s.perFile ? outside.length : outside.reduce((a, [, n]) => a + n, 0);
			m.callers_unit = s.perFile ? "files" : "lines";
			m.inside = [...marked].reduce((a, f) => a + (per.get(f) ?? 0), 0);
			m.files = outside.length;
			m.approx = !!s.approx;
		}
		return marks;
	}

	static run(root = REPO){
		const files = this.files(root);
		return this.count(this.marks(files, root), files);
	}

	static table(marks){
		const rows = marks.map(m => {
			const c = m.callers === null ? "n/a" : `${m.approx ? "~" : ""}${m.callers} ${m.callers_unit} (${m.files} files; +${m.inside} lines inside the definition's own files)`;
			return `- ${m.file}:${m.line} — ${m.symbol} — ${m.date ?? "INCOMPLETE MARK"} — callers: ${c}${m.guide_exists === false ? " — GUIDE MISSING: " + m.guide : ""}${m.note ? " — " + m.note : ""}`;
		});
		const symbols = new Set(marks.map(m => m.symbol));
		return `${marks.length} marks on ${symbols.size} symbols (${marks.filter(m => m.incomplete).length} incomplete, ${marks.filter(m => m.guide_exists === false).length} with a missing guide)\n${rows.join("\n")}`;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const a = process.argv.slice(2), marks = Deprecated.run();
	const w = a.indexOf("--write");
	if (w >= 0){
		const out = path.resolve(a[w + 1] ?? ""); if (!a[w + 1]) throw new Error("--write needs a file path");
		fs.writeFileSync(out, marks.map(m => JSON.stringify(m)).join("\n") + "\n");
		console.log(`wrote ${marks.length} lines to ${rel(out)}`);
	}
	console.log(a.includes("--json") ? JSON.stringify(marks, null, 1) : Deprecated.table(marks));
}
