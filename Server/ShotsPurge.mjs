// Deletes OLD, IGNORED automated pictures under shots/ and screenshots/ folders. Rule: ai/sessions/doc/commit-rule.md
//   node Server/ShotsPurge.mjs --plan                       every ignored shots folder, size, newest-file age
//   node Server/ShotsPurge.mjs --apply --older-than 30d     deletes ignored files older than that (d/h)
// Never deletes a tracked file; refuses (even for --plan) when any tracked picture sits in such a folder.
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, unlinkSync } from "node:fs";
import { join, relative } from "node:path";

export default class ShotsPurge {
	static names = new Set(["shots", "screenshots"]);
	static skip = new Set(["node_modules", ".git"]);
	static git(root, ...a) { return execFileSync("git", a, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28, windowsHide: true }); }

	constructor(root = ShotsPurge.git(process.cwd(), "rev-parse", "--show-toplevel").trim()) { this.root = root; }

	// every file inside a shots/ or screenshots/ folder
	scan(dir = this.root, inside = false, out = []) {
		for (const e of readdirSync(dir, { withFileTypes: true })) {
			if (ShotsPurge.skip.has(e.name)) continue;
			const p = join(dir, e.name);
			if (e.isDirectory()) this.scan(p, inside || ShotsPurge.names.has(e.name), out);
			else if (inside) out.push(p);
		}
		return out;
	}
	tracked() { return new Set(ShotsPurge.git(this.root, "ls-files", "-z").split("\0")); }
	ignored(files) {
		if (!files.length) return new Set();
		const rel = files.map(f => relative(this.root, f).replaceAll("\\", "/"));
		const r = execFileSync("git", ["check-ignore", "-z", "--stdin"], { cwd: this.root, input: rel.join("\0"), encoding: "utf8", maxBuffer: 1 << 28, windowsHide: true });
		return new Set(r.split("\0").filter(Boolean));
	}
	rows() {
		const files = this.scan(), tracked = this.tracked();
		const bad = files.map(f => relative(this.root, f).replaceAll("\\", "/")).filter(f => tracked.has(f) && /\.(png|jpe?g|webp|gif)$/i.test(f));
		if (bad.length) throw new Error(`refusing: ${bad.length} tracked pictures sit in shots folders (first: ${bad[0]}); untrack them first`);
		const ign = this.ignored(files);
		return files.map(f => { const rel = relative(this.root, f).replaceAll("\\", "/"), s = statSync(f); return { f, rel, bytes: s.size, mtime: s.mtimeMs, ignored: ign.has(rel) && !tracked.has(rel) }; }).filter(r => r.ignored);
	}
	plan() {
		const dirs = new Map(), now = Date.now();
		for (const r of this.rows()) {
			const d = r.rel.replace(/\/(shots|screenshots)\/.*/, m => m.split("/").slice(0, 2).join("/"));
			const o = dirs.get(d) ?? { n: 0, bytes: 0, newest: 0 }; o.n++; o.bytes += r.bytes; o.newest = Math.max(o.newest, r.mtime); dirs.set(d, o);
		}
		let total = 0;
		for (const [d, o] of [...dirs].sort((a, b) => b[1].bytes - a[1].bytes)) { total += o.bytes; console.log(`${(o.bytes / 1048576).toFixed(1).padStart(8)} MB  ${String(o.n).padStart(5)} files  newest ${((now - o.newest) / 864e5).toFixed(0).padStart(4)}d  ${d}`); }
		console.log(`${(total / 1048576).toFixed(1)} MB in ${dirs.size} folders`);
	}
	apply(olderMs) {
		const cut = Date.now() - olderMs; let n = 0, bytes = 0;
		for (const r of this.rows()) if (r.mtime < cut) { unlinkSync(r.f); n++; bytes += r.bytes; }
		console.log(`deleted ${n} ignored files, ${(bytes / 1048576).toFixed(1)} MB`);
	}
	static age(s) { const m = /^(\d+)([dh])$/.exec(s ?? ""); if (!m) throw new Error("--older-than needs like 30d or 12h"); return m[1] * (m[2] === "d" ? 864e5 : 36e5); }
	static main(argv) {
		const p = new ShotsPurge();
		if (argv.includes("--apply")) p.apply(ShotsPurge.age(argv[argv.indexOf("--older-than") + 1]));
		else if (argv.includes("--plan")) p.plan();
		else console.log("usage: --plan | --apply --older-than 30d");
	}
}
if (process.argv[1]?.endsWith("ShotsPurge.mjs")) ShotsPurge.main(process.argv.slice(2));
