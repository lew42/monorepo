// Read-only. For a save-state commit (git merge's "WIP on michael/dev" dangling commit), lists what it holds that the working tree no longer has.
//   node recover.mjs <commit> [--write <out.json>]
// A record file (.jsonl): the lines the commit ADDED over its base that are missing from the file on disk now.
// Any other file: "differs" when disk matches neither the commit's copy nor the base (a later edit), "lost" when disk == base but commit != base.
// --write <out.json>: {file: [lines]} for the record files, ready for per-file `node .claude/hooks/append.mjs <file> <lines.json>`.
import { execFileSync } from "child_process"; import fs from "fs";
const [commit, flag, out] = process.argv.slice(2);
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28, windowsHide: true });
const gitb = (...a) => { try { return execFileSync("git", a, { maxBuffer: 1 << 28, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }); } catch { return null; } };
const base = commit + "^";
const files = git("diff", "--name-only", "--no-renames", base, commit).split("\n").filter(Boolean);
const lost = {}, report = { record: 0, recordLost: 0, codeLost: [], codeDiffers: [], gone: [] };
for (const f of files) {
	const c = gitb("show", `${commit}:${f}`), b = gitb("show", `${base}:${f}`);
	const disk = fs.existsSync(f) ? fs.readFileSync(f) : null;
	if (c === null) { report.gone.push(f); continue; }
	if (f.endsWith(".jsonl")) {
		report.record++;
		const bs = new Set((b ? b.toString("utf8") : "").split("\n")), ds = new Set((disk ? disk.toString("utf8") : "").split("\n"));
		const miss = c.toString("utf8").split("\n").filter(l => l.trim() && !bs.has(l) && !ds.has(l));
		if (miss.length) { lost[f] = miss; report.recordLost += miss.length; }
	} else if (b && c.equals(b)) continue;
	else if (disk && disk.equals(c)) continue;
	else if (disk && b && disk.equals(b)) report.codeLost.push(f);
	else report.codeDiffers.push(f);
}
console.log(JSON.stringify({ commit: commit.slice(0, 9), files: files.length, recordFiles: report.record, recordLinesMissing: report.recordLost, recordFilesWithLoss: Object.keys(lost).length, codeLost: report.codeLost, codeDiffers: report.codeDiffers.length, deletedInStash: report.gone.length }, null, 1));
for (const [f, l] of Object.entries(lost)) console.log(String(l.length).padStart(4), f);
if (flag === "--write") fs.writeFileSync(out, JSON.stringify(lost, null, 1));
