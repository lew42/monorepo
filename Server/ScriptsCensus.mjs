#!/usr/bin/env node
// Server/ScriptsCensus.mjs — read-only census of Server/, Servex/ and .claude/hooks scripts: header, references, last commit, class or bag. Doc: Server/doc/scripts.md
//   node Server/ScriptsCensus.mjs            print the two counts and write the census JSON
//   node Server/ScriptsCensus.mjs --out f    choose the JSON path (default: census.json beside the task dir)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import TaskDirs from "./TaskDirs.mjs";

const REPO = TaskDirs.REPO;
const git = (...a) => { try { return execFileSync("git", a, { cwd: REPO, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 26 }); } catch { return ""; } };

export default class ScriptsCensus {
	static GLOBS = [["Server", /\.mjs$/, false], ["Servex", /\.(m?js)$/, false], [".claude/hooks", /\.mjs$/, false]];
	/** Files on disk: Server/*.mjs, Servex/*.js|mjs, Servex/*\/*.js, .claude/hooks/*.mjs */
	static onDisk(){
		const out = [], list = d => fs.existsSync(path.join(REPO, d)) ? fs.readdirSync(path.join(REPO, d), { withFileTypes: true }) : [];
		for (const [d, re] of this.GLOBS) for (const e of list(d)) if (e.isFile() && re.test(e.name)) out.push(`${d}/${e.name}`);
		for (const e of list("Servex")) if (e.isDirectory() && e.name !== "node_modules") for (const f of list(`Servex/${e.name}`)) if (f.isFile() && /\.js$/.test(f.name)) out.push(`Servex/${e.name}/${f.name}`);
		return out.sort();
	}
	static header(text){
		for (const l of text.split("\n").slice(0, 12)) { const m = l.match(/^\s*(?:\/\/|\/\*\*?|\*)\s*(.+?)\s*(?:\*\/)?$/); if (m && !m[1].startsWith("!") && !/^#!/.test(l)) return m[1].slice(0, 200); }
		return "";
	}
	static refs(file){
		const base = path.basename(file);
		const hits = git("grep", "-l", "-F", base, "--", ".", ":!*.jsonl", ":!package-lock.json", ":!public/framework/ai/archive", ":!public/framework/ai/sessions", ":!public/framework/ai/2026-*", ":!**/node_modules/**").split("\n").filter(Boolean).filter(f => f !== file);
		return hits;
	}
	static row(file){
		const text = fs.readFileSync(path.join(REPO, file), "utf8");
		const refs = this.refs(file);
		const stem = path.basename(file).replace(/\.\w+$/, "");
		const isClass = /^\s*(export\s+default\s+)?class\s+\w+/m.test(text);
		const fns = (text.match(/^(export\s+)?(async\s+)?function\s+\w+/gm) || []).length;
		return {
			file, bytes: Buffer.byteLength(text), header: this.header(text),
			refs: refs.length, refFiles: refs.slice(0, 8),
			last: git("log", "-1", "--format=%cs", "--", file).trim(),
			kind: isClass ? "class" : fns > 1 ? "bag" : "script",
			lowerCaseClass: isClass && /^[a-z]/.test(stem),
			test: fs.existsSync(path.join(REPO, path.dirname(file), `${stem}.test.mjs`)) || fs.existsSync(path.join(REPO, path.dirname(file), `${stem}.test.js`)),
		};
	}
	static run(){ return this.onDisk().map(f => this.row(f)); }
}

if (process.argv[1]?.endsWith("ScriptsCensus.mjs")) {
	const i = process.argv.indexOf("--out"), out = i > 0 ? process.argv[i + 1] : path.join(REPO, "public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/scripts-census/census.json");
	const disk = ScriptsCensus.onDisk().length, rows = ScriptsCensus.run();
	fs.writeFileSync(out, JSON.stringify(rows, null, 1));
	console.log(`on disk ${disk} / listed ${rows.length} ${disk === rows.length ? "AGREE" : "DISAGREE"} -> ${out}`);
}
