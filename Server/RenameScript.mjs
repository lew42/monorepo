// RenameScript — rename scripts to their class name, rewrite every caller, keep a manifest, undo it.
// Detail: Server/doc/scripts.md. History logs (*.jsonl) and session dirs are never rewritten.
//   node Server/RenameScript.mjs --plan  <old=New,old2=New2>   dry run: list files to move and callers to rewrite
//   node Server/RenameScript.mjs --apply <old=New,...> [--manifest <file.json>]
//   node Server/RenameScript.mjs --undo  <manifest.json>
// Paths are repo-relative, e.g. Server/card-check.mjs=Server/CardCheck.mjs. Set RENAME_ROOT to run on a copy.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export default class RenameScript {
	static TEXT = /\.(mjs|js|json|md|html|css|txt|cmd|ps1|sh|yml|yaml)$/i;
	static SKIP = /(^|\/)(node_modules|\.git)\/|\.jsonl$|^public\/framework\/ai\/sessions\/|^public\/framework\/ai\/\d{4}-/;

	constructor(root = process.env.RENAME_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")) {
		this.root = root;
	}

	git(...args) { return execFileSync("git", args, { cwd: this.root, encoding: "utf8", windowsHide: true, maxBuffer: 1 << 28 }); }

	static parse(spec) { return spec.split(",").map(s => s.split("=")).map(([from, to]) => ({ from, to })); }

	// "./card-check.mjs", "Server/card-check.mjs" and a bare "card-check.mjs" after a space, quote or backtick all match.
	static pattern(from) {
		const base = path.posix.basename(from).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		return new RegExp(`(^|[/\\s\`"'(<])${base}(?![\\w-])`, "g");
	}

	callers(moves) {
		const hits = [];
		for (const file of this.git("ls-files").split("\n").filter(f => f && RenameScript.TEXT.test(f) && !RenameScript.SKIP.test(f))) {
			let text; try { text = fs.readFileSync(path.join(this.root, file), "utf8"); } catch { continue; }
			for (const { from, to } of moves) {
				const re = RenameScript.pattern(from); let n = 0;
				text.split("\n").forEach((line, i) => { if (re.test(line)) { n++; hits.push({ file, line: i + 1, from, to }); } re.lastIndex = 0; });
			}
		}
		return hits;
	}

	plan(moves) { return { moves, callers: this.callers(moves) }; }

	apply(moves, manifestPath) {
		const { callers } = this.plan(moves);
		const edits = [];
		for (const { from, to } of moves) this.git("mv", from, to);
		for (const file of [...new Set(callers.map(c => c.file))]) {
			const current = moves.some(m => m.from === file) ? moves.find(m => m.from === file).to : file;
			const abs = path.join(this.root, current);
			const before = fs.readFileSync(abs, "utf8");
			let text = before, changed = 0;
			for (const { from, to } of moves) {
				text = text.replace(RenameScript.pattern(from), (_, lead) => { changed++; return lead + path.posix.basename(to); });
			}
			if (changed) { fs.writeFileSync(abs, text); edits.push({ file: current, replaced: changed, before: zlib.gzipSync(before).toString("base64") }); }
		}
		const manifest = { when: new Date().toISOString(), moves, edits, callers };
		if (manifestPath) fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1));
		return manifest;
	}

	undo(manifest) {
		for (const { from, to } of [...manifest.moves].reverse()) this.git("mv", to, from);
		for (const { file, before } of manifest.edits) {
			const now = manifest.moves.find(m => m.to === file)?.from || file; // the edit's exact original text is in the manifest
			fs.writeFileSync(path.join(this.root, now), zlib.gunzipSync(Buffer.from(before, "base64")).toString("utf8"));
		}
		return manifest.edits.length;
	}

	static main(argv) {
		const [mode, arg] = [argv[0], argv[1]], rs = new RenameScript();
		const mi = argv.indexOf("--manifest"), manifestPath = mi > -1 ? argv[mi + 1] : null;
		if (mode === "--plan") console.log(JSON.stringify(rs.plan(RenameScript.parse(arg)), null, 1));
		else if (mode === "--apply") { const m = rs.apply(RenameScript.parse(arg), manifestPath); console.log(`moved ${m.moves.length}, rewrote ${m.edits.length} files`); }
		else if (mode === "--undo") console.log(`undone, ${rs.undo(JSON.parse(fs.readFileSync(arg, "utf8")))} files restored`);
		else console.log("usage: --plan|--apply <old=New,...> [--manifest f] | --undo <manifest>");
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) RenameScript.main(process.argv.slice(2));
