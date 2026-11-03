// RepoSize.mjs — what the repo weighs, by path, in git history and on disk. Read-only: never writes to git.
// usage: node Server/RepoSize.mjs [--json out.json] [--depth 3] [--top 25]  ·  doc: public/framework/ai/doc/repo-size.md
import { spawn, execFileSync } from "node:child_process";
import { readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, sep } from "node:path";
import { fileURLToPath } from "node:url";

export default class RepoSize {
	static ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/[\\/]$/, "");
	// what each slice of .git is; first match wins
	static CATEGORIES = [
		["screenshots", p => /\.(png|jpe?g|webp|gif)$/i.test(p)],
		["recordings/audio", p => /\.(webm|wav|mp3|ogg|m4a|mp4)$/i.test(p)],
		["sessions store", p => p.startsWith("public/framework/ai/sessions/")],
		["ai dated task dirs", p => /^public\/framework\/ai\/20\d\d-/.test(p)],
		["other ai/", p => p.startsWith("public/framework/ai/")],
		["notes", p => p.startsWith("public/notes/")],
		["framework code", p => /^public\/framework\/(core|ext|styles|ux|ui|library|code|dev|lab|util)\//.test(p) || p.startsWith("public/web/")],
		["Servex + Server", p => /^(Servex|Server)\//.test(p)],
		["other public/", p => p.startsWith("public/")],
		["everything else", () => true],
	];
	static KINDS = ["task.jsonl", "page.jsonl", "files.jsonl", "log.jsonl", "usage.jsonl", "runs.jsonl", "research.jsonl", "session.jsonl", "day.jsonl", "index.json", "board.jsonl"];

	constructor({ root = RepoSize.ROOT, depth = 3, top = 25 } = {}){ Object.assign(this, { root, depth, top }); }

	git(...args){ return execFileSync("git", args, { cwd: this.root, encoding: "utf8", maxBuffer: 1 << 30, windowsHide: true }); }

	// every blob reachable from refs, with its first path, raw size and packed (compressed, delta) size
	async blobs(refs = ["--all"]){
		const list = this.git("rev-list", "--objects", ...refs).split("\n").filter(Boolean);
		const pathOf = new Map();
		for (const line of list){ const i = line.indexOf(" "); if (i > 0) pathOf.set(line.slice(0, i), line.slice(i + 1)); }
		const out = [];
		await new Promise((resolve, reject) => {
			const p = spawn("git", ["cat-file", "--batch-check=%(objecttype) %(objectname) %(objectsize) %(objectsize:disk)"], { cwd: this.root, windowsHide: true });
			let buf = "";
			p.stdout.on("data", d => {
				buf += d; let i;
				while ((i = buf.indexOf("\n")) >= 0){
					const [type, sha, size, disk] = buf.slice(0, i).split(" "); buf = buf.slice(i + 1);
					if (type === "blob") out.push({ sha, path: pathOf.get(sha) || "", size: +size, disk: +disk });
				}
			});
			p.on("error", reject); p.on("close", resolve);
			for (const line of list) p.stdin.write(line.split(" ")[0] + "\n"); // the object id, whatever the hash length
			p.stdin.end();
		});
		return out;
	}

	static bucket(path, depth){ const s = path.split("/"); return s.slice(0, depth).join("/") + (s.length > depth ? "/" : ""); }
	static add(map, key, a, b = 0){ const r = map.get(key) || { bytes: 0, disk: 0, n: 0 }; r.bytes += a; r.disk += b; r.n++; map.set(key, r); }
	static top(map, n, by = "disk"){ return [...map].map(([k, v]) => ({ path: k, ...v })).sort((a, b) => b[by] - a[by]).slice(0, n); }
	static mb(n){ return (n / 1048576).toFixed(1) + " MB"; }

	history(blobs){
		const dirs = new Map(), cats = new Map(), kinds = new Map();
		for (const b of blobs){
			RepoSize.add(dirs, RepoSize.bucket(b.path, this.depth), b.size, b.disk);
			RepoSize.add(cats, RepoSize.CATEGORIES.find(([, t]) => t(b.path))[0], b.size, b.disk);
			const base = b.path.split("/").pop();
			const kind = RepoSize.KINDS.includes(base) ? base : /\.(png|jpe?g|webp)$/i.test(base) ? "image" : null;
			if (kind) RepoSize.add(kinds, kind, b.size, b.disk);
		}
		const byPath = new Map(), images = new Map();
		for (const b of blobs){
			const r = byPath.get(b.path) || { path: b.path, size: 0, disk: 0, versions: 0 };
			r.size = Math.max(r.size, b.size); r.disk += b.disk; r.versions++; byPath.set(b.path, r);
			if (/\.(png|jpe?g|webp|gif)$/i.test(b.path)) RepoSize.add(images, RepoSize.bucket(b.path, 6), b.size, b.disk);
		}
		const largest = [...byPath.values()].sort((a, b) => b.size - a.size).slice(0, 30).map(r => ({ ...r, type: r.path.split(".").pop() }));
		return { images: RepoSize.top(images, 15), dirs: RepoSize.top(dirs, this.top), categories: RepoSize.top(cats, 99), kinds: RepoSize.top(kinds, 99), largest,
			total: blobs.reduce((s, b) => s + b.size, 0), total_disk: blobs.reduce((s, b) => s + b.disk, 0), count: blobs.length };
	}

	// the working tree on disk, by directory; .git, node_modules and a nested worktree (has its own .git) are named, never walked
	tree(){
		const dirs = new Map(), skipped = [];
		const tracked = new Set(this.git("ls-files", "-z").split("\0").filter(Boolean));
		let trackedBytes = 0;
		const walk = (abs, rel) => {
			let ents; try { ents = readdirSync(abs, { withFileTypes: true }); } catch { return; }
			for (const e of ents){
				const a = join(abs, e.name), r = rel ? rel + "/" + e.name : e.name;
				if (e.isDirectory()){
					if (r === ".git" || e.name === "node_modules"){ skipped.push(r); continue; }
					if (existsSync(join(a, ".git"))){ skipped.push(r + " (nested worktree or repo)"); continue; }
					walk(a, r);
				} else if (e.isFile()){
					let s; try { s = statSync(a).size; } catch { continue; }
					const t = tracked.has(r); if (t) trackedBytes += s;
					RepoSize.add(dirs, RepoSize.bucket(r, this.depth), s, t ? s : 0);
				}
			}
		};
		walk(this.root, "");
		const all = RepoSize.top(dirs, 1e9, "bytes");
		return { dirs: all.slice(0, this.top).map(d => ({ path: d.path, bytes: d.bytes, tracked: d.disk, files: d.n })),
			total: all.reduce((s, d) => s + d.bytes, 0), tracked: trackedBytes, skipped };
	}

	// what a fresh checkout of HEAD holds, by category: the rest of history is past versions and deleted files
	head(){
		const cats = new Map();
		for (const line of this.git("ls-tree", "-r", "-l", "HEAD").split("\n").filter(Boolean)){
			const m = line.match(/^\S+ blob \S+\s+(\d+)\t(.*)$/); if (!m) continue;
			RepoSize.add(cats, RepoSize.CATEGORIES.find(([, t]) => t(m[2]))[0], +m[1]);
		}
		const all = RepoSize.top(cats, 99, "bytes");
		return { categories: all, total: all.reduce((s, c) => s + c.bytes, 0), files: all.reduce((s, c) => s + c.n, 0) };
	}

	static du(abs){
		let t = 0, ents; try { ents = readdirSync(abs, { withFileTypes: true }); } catch { return 0; }
		for (const e of ents){ const a = join(abs, e.name); if (e.isDirectory()) t += RepoSize.du(a); else try { t += statSync(a).size; } catch {} }
		return t;
	}

	// the .git folder itself: packs vs the rest
	dotgit(){
		const g = this.git("rev-parse", "--path-format=absolute", "--git-common-dir").trim(), parts = {}; // a worktree's .git is a file; measure the shared one
		for (const e of readdirSync(g, { withFileTypes: true })) parts[e.name] = e.isDirectory() ? RepoSize.du(join(g, e.name)) : statSync(join(g, e.name)).size;
		return { total: Object.values(parts).reduce((s, n) => s + n, 0), pack: RepoSize.du(join(g, "objects", "pack")), parts: Object.entries(parts).sort((a, b) => b[1] - a[1]).slice(0, 8) };
	}

	async run(){
		const all = await this.blobs(["--all"]);
		const remote = this.git("for-each-ref", "--format=%(refname)", "refs/remotes/origin").split("\n").filter(Boolean);
		const pushed = remote.length ? await this.blobs(remote) : [];
		// what the next `git push origin <branch>` would send: blobs on the branch that no origin ref has
		const branch = this.git("rev-parse", "--abbrev-ref", "HEAD").trim();
		const next = remote.length ? await this.blobs([branch, "--not", "--remotes=origin"]) : [];
		const nextCats = new Map(); for (const b of next) RepoSize.add(nextCats, RepoSize.CATEGORIES.find(([, t]) => t(b.path))[0], b.size, b.disk);
		const unpushed = { branch, commits: +this.git("rev-list", "--count", branch, "--not", "--remotes=origin").trim(), blobs: next.length,
			bytes: next.reduce((s, b) => s + b.size, 0), disk: next.reduce((s, b) => s + b.disk, 0), categories: RepoSize.top(nextCats, 99) };
		return { at: new Date().toISOString(), sha: this.git("rev-parse", "--short", "HEAD").trim(),
			dotgit: this.dotgit(), history: this.history(all), head: this.head(),
			github: { refs: remote, blobs: pushed.length, bytes: pushed.reduce((s, b) => s + b.size, 0), disk: pushed.reduce((s, b) => s + b.disk, 0),
				over_50mb: pushed.filter(b => b.size > 50 << 20).map(b => b.path), over_100mb: pushed.filter(b => b.size > 100 << 20).map(b => b.path) },
			unpushed,
			tree: this.tree() };
	}

	static print(r){
		const mb = RepoSize.mb, L = [], row = c => `  ${c.path.padEnd(22)} ${mb(c.disk).padStart(10)} ${mb(c.bytes).padStart(10)} ${String(c.n).padStart(7)}`;
		L.push(`.git ${mb(r.dotgit.total)} (packs ${mb(r.dotgit.pack)}) · history: ${r.history.count} blobs, ${mb(r.history.total)} raw, ${mb(r.history.total_disk)} packed · working tree ${mb(r.tree.total)} (${mb(r.tree.tracked)} tracked)`);
		L.push(`check: packs ${mb(r.dotgit.pack)} vs summed packed blobs ${mb(r.history.total_disk)}; the gap is trees and commits`);
		L.push(`GitHub (${r.github.refs.length} refs under refs/remotes/origin): ${r.github.blobs} blobs, ${mb(r.github.bytes)} raw, ${mb(r.github.disk)} packed; files over 50 MB: ${r.github.over_50mb.length}, over 100 MB: ${r.github.over_100mb.length}`);
		const u = r.unpushed;
		L.push(`next push of ${u.branch}: ${u.commits} commits, ${u.blobs} blobs, ${mb(u.bytes)} raw, ~${mb(u.disk)} packed · ` + u.categories.slice(0, 4).map(c => `${c.path} ${mb(c.disk)}`).join(", "));
		L.push("  .git parts: " + r.dotgit.parts.map(([k, v]) => `${k} ${mb(v)}`).join(", "));
		L.push("\n(d) history by category (packed · raw · blobs)"); r.history.categories.forEach(c => L.push(row(c)));
		L.push(`\n    HEAD checkout: ${r.head.files} files, ${mb(r.head.total)} raw (files · raw)`); r.head.categories.forEach(c => L.push(`  ${c.path.padEnd(22)} ${String(c.n).padStart(7)} ${mb(c.bytes).padStart(10)}`));
		L.push("\n    images by folder (packed · raw · files)"); r.history.images.forEach(d => L.push(`  ${mb(d.disk).padStart(9)} ${mb(d.bytes).padStart(10)} ${String(d.n).padStart(7)}  ${d.path}`));
		L.push("\n    by file kind"); r.history.kinds.forEach(c => L.push(row(c)));
		L.push("\n(a) history by path (packed · raw · blobs)"); r.history.dirs.forEach(d => L.push(`  ${mb(d.disk).padStart(9)} ${mb(d.bytes).padStart(10)} ${String(d.n).padStart(7)}  ${d.path}`));
		L.push("\n(b) working tree by path (on disk · tracked · files)"); r.tree.dirs.forEach(d => L.push(`  ${mb(d.bytes).padStart(9)} ${mb(d.tracked).padStart(10)} ${String(d.files).padStart(7)}  ${d.path}`));
		L.push("  not walked: " + r.tree.skipped.join(", "));
		L.push("\n(c) 30 largest committed files, one row per path (largest version · all versions packed · versions)"); r.history.largest.forEach(f => L.push(`  ${mb(f.size).padStart(9)} ${mb(f.disk).padStart(9)} ${String(f.versions).padStart(5)}  ${f.path}`));
		return L.join("\n");
	}
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1].replace(/\//g, sep)){
	const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
	const rs = new RepoSize({ root: arg("--root") || RepoSize.ROOT, depth: +(arg("--depth") || 3), top: +(arg("--top") || 25) });
	const r = await rs.run();
	if (arg("--json")) writeFileSync(arg("--json"), JSON.stringify(r, null, "\t"));
	console.log(RepoSize.print(r));
}
