// node rename.mjs <repo> [--apply|--undo]   dry run by default. git mv for tracked files, plain rename for generated ones that exist.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const repo = path.resolve(process.argv[2] ?? "."), mode = process.argv.includes("--apply") ? "apply" : process.argv.includes("--undo") ? "undo" : "dry";
const PAIRS = [
	["Server/State.mjs", "Server/AIIndex.mjs"],
	["Server/State.test.mjs", "Server/AIIndex.test.mjs"],
	["Server/doc/state.md", "Server/doc/ai-index.md"],
	["public/framework/ai/state.json", "public/framework/ai/index.json"],
	["public/framework/ai/tasks/state.jsonl", "public/framework/ai/index.jsonl"],
];
const manifest = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, "")), "manifest.jsonl");
const git = (...a) => execFileSync("git", a, { cwd: repo, stdio: "pipe" });
const tracked = f => { try { return git("ls-files", f).toString().trim() !== ""; } catch { return false; } };
const lines = [];
for (let [from, to] of PAIRS){
	if (mode === "undo") [from, to] = [to, from];
	const a = path.join(repo, from), b = path.join(repo, to);
	if (!fs.existsSync(a)){ console.log("skip (absent)", from); continue; }
	if (fs.existsSync(b)){ console.log("STOP: target exists", to); process.exit(1); }
	console.log(mode, from, "->", to);
	lines.push(JSON.stringify({ from, to }));
	if (mode === "dry") continue;
	if (tracked(from)) git("mv", from, to); else fs.renameSync(a, b);
}
if (mode === "apply") fs.appendFileSync(manifest, lines.join("\n") + "\n");
