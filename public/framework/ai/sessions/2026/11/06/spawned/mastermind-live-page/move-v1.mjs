// Moves the old Live page (v1) from public/live/ into public/live/v1/, so /live/ can become LivePage.
// Dry run by default; --apply runs `git mv` for each file and writes move-v1.manifest.json beside this script.
// TaskState.js stays where it is: Server/task-closeout.mjs imports it from public/live/.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../../../../../../../../..");
const FROM = "public/live", TO = "public/live/v1";
const FILES = ["page.js", "page.jsonl", "Live.js", "Live.css", "LiveNow.js", "LiveTasks.js", "LiveToday.js"];
const apply = process.argv.includes("--apply");

const moves = FILES.map(f => ({ from: `${FROM}/${f}`, to: `${TO}/${f}` }));
for (const m of moves){
	if (!existsSync(path.join(ROOT, m.from))) throw new Error(`missing: ${m.from}`);
	if (existsSync(path.join(ROOT, m.to))) throw new Error(`already there: ${m.to}`);
	console.log(`${apply ? "move" : "would move"} ${m.from} -> ${m.to}`);
}
if (apply){
	for (const m of moves){
		mkdirSync(path.dirname(path.join(ROOT, m.to)), { recursive: true });
		execFileSync("git", ["mv", "--", m.from, m.to], { cwd: ROOT, windowsHide: true });
	}
	writeFileSync(new URL("./move-v1.manifest.json", import.meta.url), JSON.stringify({ at: new Date().toISOString(), moves, undo: "git mv each `to` back to its `from`" }, null, "\t") + "\n");
	console.log(`moved ${moves.length} files; manifest: move-v1.manifest.json`);
}
