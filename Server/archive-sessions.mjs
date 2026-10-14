#!/usr/bin/env node
// Move a month's untracked session pictures to the archive drive; tracked records stay. Doc: public/framework/ai/sessions/doc/archive.md
//   node Server/archive-sessions.mjs --plan  [--months 08,09]   what would move: per day, files, MB, destination
//   node Server/archive-sessions.mjs --copy                     copy to the archive, sha1 every file, write its manifest + README
//   node Server/archive-sessions.mjs --apply                    re-verify both sides, remove the C: copy, write the repo stub
//   node Server/archive-sessions.mjs --undo                     copy every file back from the archive and verify (archive kept)
// Flags: --root <repo> (default: this repo)  --dest <archive root> (default E:/Projects/lew42/archive)  --year 2026
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default class ArchiveSessions {
	static PICTURE = /\.(png|jpe?g|webp|gif)$/i;
	static STORE = "public/framework/ai/sessions";

	constructor({ root, dest, year = "2026", months = ["08", "09"] } = {}) {
		this.root = path.resolve(root || path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
		this.dest = path.resolve(dest || "E:/Projects/lew42/archive");
		this.year = year;
		this.months = months;
	}

	monthDir(m) { return `${ArchiveSessions.STORE}/${this.year}/${m}`; }       // repo-relative, forward slashes
	archiveDir(m) { return path.join(this.dest, "sessions", this.year, m); }
	manifestPath(m) { return path.join(this.archiveDir(m), "archive.jsonl"); }

	git(args) { return execFileSync("git", args, { cwd: this.root, maxBuffer: 1 << 28, windowsHide: true }).toString(); }

	static sha1(file) { return createHash("sha1").update(fs.readFileSync(file)).digest("hex"); }

	static walk(dir, out = []) {
		if (!fs.existsSync(dir)) return out;
		for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
			const f = path.join(dir, e.name);
			if (e.isDirectory()) ArchiveSessions.walk(f, out); else out.push(f);
		}
		return out;
	}

	// Untracked pictures under the month (tracked ones, e.g. inside doc/, stay with git).
	scan(m) {
		const rel = this.monthDir(m);
		const tracked = new Set(this.git(["ls-files", "-z", "--", rel]).split("\0").filter(Boolean));
		const abs = path.join(this.root, rel);
		return ArchiveSessions.walk(abs)
			.map(f => path.relative(abs, f).split(path.sep).join("/"))
			.filter(p => ArchiveSessions.PICTURE.test(p) && !tracked.has(`${rel}/${p}`))
			.map(p => ({ path: p, bytes: fs.statSync(path.join(abs, p)).size }))
			.sort((a, b) => a.path.localeCompare(b.path));
	}

	static mb(b) { return (b / 1048576).toFixed(1) + " MB"; }

	static byDay(rows) {
		const days = {};
		for (const r of rows) {
			const [day, folder] = r.path.split("/");
			const d = days[day] ||= { files: 0, bytes: 0, folders: new Set() };
			d.files++; d.bytes += r.bytes; if (folder && r.path.split("/").length > 2) d.folders.add(folder);
		}
		return days;
	}

	plan() {
		const out = {};
		for (const m of this.months) {
			const rows = this.scan(m);
			const bytes = rows.reduce((s, r) => s + r.bytes, 0);
			out[m] = { files: rows.length, bytes, from: this.monthDir(m), to: this.archiveDir(m) };
			console.log(`${this.year}/${m}: ${rows.length} pictures, ${ArchiveSessions.mb(bytes)}  ${this.monthDir(m)} -> ${this.archiveDir(m)}`);
			for (const [day, d] of Object.entries(ArchiveSessions.byDay(rows)).sort())
				console.log(`  ${day}: ${d.files} files, ${ArchiveSessions.mb(d.bytes)}, ${d.folders.size} folders`);
		}
		return out;
	}

	readManifest(m) {
		const f = this.manifestPath(m);
		if (!fs.existsSync(f)) throw new Error(`no manifest at ${f}: run --copy first`);
		return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
	}

	copy() {
		for (const m of this.months) {
			const src = path.join(this.root, this.monthDir(m)), dst = this.archiveDir(m);
			const rows = this.scan(m);
			for (const r of rows) {
				const a = path.join(src, r.path), b = path.join(dst, r.path);
				fs.mkdirSync(path.dirname(b), { recursive: true });
				r.sha1 = ArchiveSessions.sha1(a);
				if (!(fs.existsSync(b) && fs.statSync(b).size === r.bytes && ArchiveSessions.sha1(b) === r.sha1)) {
					fs.copyFileSync(a, b);
					const st = fs.statSync(a); fs.utimesSync(b, st.atime, st.mtime);
				}
			}
			// merge with an earlier manifest so a re-run never forgets a file already archived
			const prior = fs.existsSync(this.manifestPath(m)) ? this.readManifest(m) : [];
			const all = new Map(prior.map(r => [r.path, r]));
			for (const r of rows) all.set(r.path, r);
			const list = [...all.values()].sort((a, b) => a.path.localeCompare(b.path));
			fs.writeFileSync(this.manifestPath(m), list.map(r => JSON.stringify(r)).join("\n") + "\n");
			const v = this.verify(m, list);
			console.log(`${this.year}/${m}: copied ${rows.length}; archive holds ${v.files} files, ${v.bytes} bytes; manifest ${list.length} files, ${list.reduce((s, r) => s + r.bytes, 0)} bytes; sha1 bad ${v.bad.length}`);
			if (v.bad.length) throw new Error(`verify failed: ${v.bad.slice(0, 5).join(", ")}`);
		}
		this.writeArchiveReadme();
	}

	// Every manifest file is on the archive with its size and sha1; the archive's own count and bytes equal the manifest's.
	verify(m, list = this.readManifest(m)) {
		const dst = this.archiveDir(m);
		const files = ArchiveSessions.walk(dst).filter(f => ArchiveSessions.PICTURE.test(f));
		const bytes = files.reduce((s, f) => s + fs.statSync(f).size, 0);
		const bad = list.filter(r => { const b = path.join(dst, r.path); return !fs.existsSync(b) || fs.statSync(b).size !== r.bytes || ArchiveSessions.sha1(b) !== r.sha1; }).map(r => r.path);
		const want = list.reduce((s, r) => s + r.bytes, 0);
		if (files.length !== list.length || bytes !== want) bad.push(`count/bytes: archive ${files.length}/${bytes} vs manifest ${list.length}/${want}`);
		return { files: files.length, bytes, bad };
	}

	apply() {
		for (const m of this.months) {
			const list = this.readManifest(m), src = path.join(this.root, this.monthDir(m));
			const v = this.verify(m, list);
			if (v.bad.length) throw new Error(`${m}: archive does not verify, nothing removed: ${v.bad.slice(0, 5).join(", ")}`);
			const left = this.scan(m).filter(r => !list.some(x => x.path === r.path));
			if (left.length) throw new Error(`${m}: ${left.length} pictures are not on the archive yet (run --copy): ${left[0].path}`);
			let removed = 0, bytes = 0;
			for (const r of list) {
				const a = path.join(src, r.path);
				if (!fs.existsSync(a)) continue;
				if (ArchiveSessions.sha1(a) !== r.sha1) throw new Error(`${a} changed since --copy; re-run --copy`);
				fs.unlinkSync(a); removed++; bytes += r.bytes;
				ArchiveSessions.pruneEmpty(path.dirname(a), src);
			}
			this.writeStub(m, list);
			console.log(`${this.year}/${m}: removed ${removed} pictures (${ArchiveSessions.mb(bytes)}) from the working tree; stub ${this.monthDir(m)}/readme.md`);
		}
	}

	static pruneEmpty(dir, stop) {
		while (path.resolve(dir) !== path.resolve(stop) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
			fs.rmdirSync(dir); dir = path.dirname(dir);
		}
	}

	undo() {
		for (const m of this.months) {
			const list = this.readManifest(m), src = path.join(this.root, this.monthDir(m)), dst = this.archiveDir(m);
			let restored = 0, bad = 0;
			for (const r of list) {
				const a = path.join(src, r.path), b = path.join(dst, r.path);
				if (fs.existsSync(a) && ArchiveSessions.sha1(a) === r.sha1) continue;
				fs.mkdirSync(path.dirname(a), { recursive: true });
				fs.copyFileSync(b, a);
				const st = fs.statSync(b); fs.utimesSync(a, st.atime, st.mtime);
				if (ArchiveSessions.sha1(a) !== r.sha1) bad++; else restored++;
			}
			console.log(`${this.year}/${m}: restored ${restored} of ${list.length} pictures, sha1 bad ${bad}; the stub readme.md stays (git keeps it), the archive copy stays`);
		}
	}

	// The repo side: one readme per month saying what left, where to, and how to bring it back.
	writeStub(m, list) {
		const days = ArchiveSessions.byDay(list);
		const bytes = list.reduce((s, r) => s + r.bytes, 0);
		const dst = this.archiveDir(m).split(path.sep).join("/");
		const lines = [
			`# ${this.year}/${m}: the pictures are archived`,
			"",
			`The ${list.length.toLocaleString("en-US")} untracked pictures of this month (${ArchiveSessions.mb(bytes)}, mostly review screenshots in \`shots/\`) moved to the archive drive at \`${dst}/\`, same paths below it. Every record (task.jsonl, page.jsonl, docs, pages) is still here, so the [Sessions page](/framework/ai/sessions/) and every search still read this month. An old report shows a broken picture until it is copied back.`,
			"",
			`- **Every file, its size and sha1:** \`${dst}/archive.jsonl\` (on the drive; the drive's own README says what it is).`,
			`- **Bring it back:** \`node Server/archive-sessions.mjs --undo --months ${m}\` (the drive plugged in) copies every file back and checks its sha1.`,
			`- **How it works:** [archive.md](../../doc/archive.md).`,
			"",
			"| Day | Pictures | Size | Folders |",
			"|---|---|---|---|",
			...Object.entries(days).sort().map(([d, x]) => `| [${m}/${d}](${d}/) | ${x.files} | ${ArchiveSessions.mb(x.bytes)} | ${x.folders.size} |`),
			"",
		];
		fs.writeFileSync(path.join(this.root, this.monthDir(m), "readme.md"), lines.join("\n"));
	}

	writeArchiveReadme() {
		const f = path.join(this.dest, "sessions", "README.md");
		fs.mkdirSync(path.dirname(f), { recursive: true });
		const months = fs.readdirSync(path.join(this.dest, "sessions", this.year)).sort();
		fs.writeFileSync(f, [
			"# Archived session pictures from the lew42 monorepo",
			"",
			"These are the untracked screenshots that lived under `public/framework/ai/sessions/<year>/<month>/` in `C:/Code/lew42/monorepo`, moved here to free the working disk. The records themselves (task logs, pages, docs) stayed in the repo and in git.",
			"",
			`- Months here: ${months.map(m => `${this.year}/${m}`).join(", ")}. Each month folder has \`archive.jsonl\`: one line per file, its path below the month, bytes and sha1.`,
			"- Restore: in the repo, `node Server/archive-sessions.mjs --undo --months <MM>` copies them back to the same paths and checks every sha1. Or copy a folder back by hand: the paths are the same.",
			"- Written by `Server/archive-sessions.mjs`; the repo doc is `public/framework/ai/sessions/doc/archive.md`.",
			"",
		].join("\n"));
	}

	static cli(argv) {
		const flag = n => argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined;
		const a = new ArchiveSessions({ root: flag("--root"), dest: flag("--dest"), year: flag("--year"), months: flag("--months")?.split(",") });
		const verb = ["--plan", "--copy", "--apply", "--undo"].find(v => argv.includes(v));
		if (!verb) { console.log("usage: --plan | --copy | --apply | --undo  [--months 08,09] [--root R] [--dest D]"); return; }
		a[verb.slice(2)]();
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) ArchiveSessions.cli(process.argv.slice(2));
