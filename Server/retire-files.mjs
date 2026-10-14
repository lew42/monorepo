#!/usr/bin/env node
// Server/retire-files.mjs — moves the owner-approved `dead` files aside (git mv), never deletes. Doc: public/framework/ai/doc/unreferenced-verdicts.md
//   node Server/retire-files.mjs --plan    list what would move (no change)
//   node Server/retire-files.mjs --apply   git mv each ticked `- [x]` line of the checklist into ai/archive/retired/2026-10-13/<original path>, write manifest.json
//   node Server/retire-files.mjs --undo    git mv everything in the manifest back
// Add `--manifest <md>` to read another checklist (Server/doc/scripts.md). The checklist is the "Dead" section of unreferenced-verdicts.md: every line starts ticked; untick (`- [ ]`) a file to keep it in place.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import TaskDirs from "./TaskDirs.mjs";

const REPO = TaskDirs.REPO, PAGE = (i => i > 0 ? path.resolve(REPO, process.argv[i + 1]) : path.join(TaskDirs.AI, "doc", "unreferenced-verdicts.md"))(process.argv.indexOf("--manifest"));
const DEST = "public/framework/ai/archive/retired/2026-10-13", MANIFEST = path.join(REPO, DEST, "manifest.json");
const git = (...a) => execFileSync("git", a, { cwd: REPO, encoding: "utf8", windowsHide: true });

export default class RetireFiles {
	/** Ticked checklist lines: `- [x] \`path\` ...` */
	static ticked(){
		const text = fs.readFileSync(PAGE, "utf8");
		return [...text.matchAll(/^- \[x\] `([^`]+)`/gm)].map(m => m[1]);
	}
	static plan(){ return this.ticked().map(from => ({ from, to: `${DEST}/${from}` })); }
	static apply(){
		const rows = this.plan().filter(r => fs.existsSync(path.join(REPO, r.from)));
		for (const r of rows) { fs.mkdirSync(path.dirname(path.join(REPO, r.to)), { recursive: true }); git("mv", r.from, r.to); }
		fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
		const old = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : [];
		fs.writeFileSync(MANIFEST, JSON.stringify([...old, ...rows], null, 1));
		return rows;
	}
	static undo(){
		if (!fs.existsSync(MANIFEST)) return [];
		const rows = JSON.parse(fs.readFileSync(MANIFEST, "utf8")), back = [];
		for (const r of rows) if (fs.existsSync(path.join(REPO, r.to)) && !fs.existsSync(path.join(REPO, r.from))) { fs.mkdirSync(path.dirname(path.join(REPO, r.from)), { recursive: true }); git("mv", r.to, r.from); back.push(r); }
		fs.writeFileSync(MANIFEST, JSON.stringify(rows.filter(r => !back.includes(r)), null, 1));
		return back;
	}
}

if (process.argv[1]?.endsWith("retire-files.mjs")) {
	const a = process.argv;
	if (a.includes("--apply")) console.log(`moved ${RetireFiles.apply().length} files to ${DEST}`);
	else if (a.includes("--undo")) console.log(`restored ${RetireFiles.undo().length} files`);
	else if (a.includes("--plan")) { const p = RetireFiles.plan(); console.log(p.map(r => `${r.from} -> ${r.to}`).join("\n") + `\n${p.length} files (plan only)`); }
	else console.log("usage: node Server/retire-files.mjs --plan | --apply | --undo");
}
