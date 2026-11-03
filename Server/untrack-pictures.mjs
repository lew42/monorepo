#!/usr/bin/env node
// Untrack the pictures under public/framework/ai/ that .gitignore now ignores (files stay on disk; history unchanged).
//   node Server/untrack-pictures.mjs --dry [--out DIR]    write manifest.tsv (path, bytes, blob) and print totals
//   node Server/untrack-pictures.mjs --apply [--out DIR]  git rm --cached from that manifest in batches, commit once
// Undo: git checkout HEAD~1 -- <paths>. Plan: public/framework/ai/doc/repo-size.md (phase 1)
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, statSync, mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const out = args.includes("--out") ? args[args.indexOf("--out") + 1] : ".";
const git = (a, o = {}) => execFileSync("git", a, { maxBuffer: 1 << 28, ...o }).toString();
const manifest = out + "/untrack-manifest.tsv";

if (!apply) {
	// tracked AND ignored by the current rules, a picture, under the AI log; the rules already spare doc/
	const paths = git(["ls-files", "-z", "-c", "-i", "--exclude-standard", "--", "public/framework/ai"]).split("\0")
		.filter(p => /\.(png|jpe?g|webp)$/i.test(p) && !/(^|\/)doc\//.test(p));
	const blobs = new Map(git(["ls-files", "-s", "-z", "--", "public/framework/ai"]).split("\0").filter(Boolean)
		.map(l => [l.split("\t")[1], l.split(/\s/)[1]]));
	let bytes = 0;
	const rows = paths.map(p => { const b = statSync(p).size; bytes += b; return [p, b, blobs.get(p)].join("\t"); });
	mkdirSync(out, { recursive: true });
	writeFileSync(manifest, rows.join("\n") + "\n");
	console.log(`${paths.length} pictures, ${(bytes / 1048576).toFixed(1)} MB on disk -> ${manifest}`);
} else {
	const paths = readFileSync(manifest, "utf8").split("\n").filter(Boolean).map(l => l.split("\t")[0]);
	for (let i = 0; i < paths.length; i += 200) git(["rm", "--cached", "-q", "--", ...paths.slice(i, i + 200)]);
	git(["commit", "-m", `untrack: ${paths.length.toLocaleString("en-US")} pictures under the AI log stay on disk, leave the index (repo-size.md phase 1)\n\nCo-Authored-By: Claude Code <noreply@anthropic.com>`]);
	console.log(`untracked ${paths.length}; undo: git checkout HEAD~1 -- <paths from ${manifest}>`);
}
