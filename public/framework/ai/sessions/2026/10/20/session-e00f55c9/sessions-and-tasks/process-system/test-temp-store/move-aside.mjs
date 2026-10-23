// node move-aside.mjs <spawned dir> <dest dir> [--apply]
// Moves every folder in <spawned dir> whose name is a known test-agent id (or its -2/-3/-4 copy) to <dest dir>.
// Dry run unless --apply. Never deletes; refuses a name that already exists in dest. Writes moves.jsonl in dest.
import fs from "node:fs";
import path from "node:path";

const [src, dest] = process.argv.slice(2), apply = process.argv.includes("--apply");
if (!src || !dest) throw new Error("usage: move-aside.mjs <spawned dir> <dest dir> [--apply]");
const TEST = /^(minion-(dead|held|race|starting|stuck|v|x|y)|task-mastermind-z|minion-lib-h1-page-nvidia-nemotron-3-5-lightning-free-179089)(-\d+)?$/;
const names = fs.readdirSync(src, { withFileTypes: true }).filter(e => e.isDirectory() && TEST.test(e.name)).map(e => e.name);
const left = fs.readdirSync(src).filter(n => !names.includes(n));
console.log(`${apply ? "MOVING" : "dry run:"} ${names.length} folders ${src} -> ${dest}; left in place: ${left.length ? left.join(", ") : "none"}`);
if (apply) fs.mkdirSync(dest, { recursive: true });
for (const n of names) {
	const to = path.join(dest, n);
	if (apply) {
		if (fs.existsSync(to)) throw new Error(`${to} exists`);
		fs.renameSync(path.join(src, n), to);
		fs.appendFileSync(path.join(dest, "moves.jsonl"), JSON.stringify({ from: path.join(src, n), to, at: new Date().toISOString() }) + "\n");
	} else console.log("  " + n);
}
