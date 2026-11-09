// Evidence pack for the past-work audit, slice 1: the newest N "waiting on you" items
// (list_waiting's JSON), each with its task's own log lines and the last commits on its folder.
// Usage: node evidence.mjs <list_waiting.json> [N=20] > evidence.json
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const [file, n = 20] = process.argv.slice(2);
let raw = JSON.parse(fs.readFileSync(file, "utf8"));
if (raw[0]?.text) raw = JSON.parse(raw[0].text);
const items = [...raw].sort((a, b) => (b.at || "").localeCompare(a.at || "")).slice(0, +n);
const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 26 }).trim(); } catch { return ""; } };
const out = items.map((it, i) => {
	const dir = it.url ? "public" + it.url.replace(/\/$/, "") : null;
	const id = (it.id || "").split("~").pop();
	const lines = [];
	for (const f of ["session.jsonl", "task.jsonl"]) {
		const p = dir && `${dir}/${f}`;
		if (!p || !fs.existsSync(p)) continue;
		const all = fs.readFileSync(p, "utf8").split("\n");
		all.forEach((l, k) => { if (l.includes(`"${id}"`)) lines.push(`${f}:${k + 1} ${l.slice(0, 600)}`); });
		if (!lines.length && all[0]) lines.push(`${f}:1 ${all[0].slice(0, 600)}`);
	}
	return { n: i + 1, ...it, dir, task_id: id,
		lines: lines.length > 14 ? [...lines.slice(0, 6), `… ${lines.length - 12} more …`, ...lines.slice(-6)] : lines,
		commits: dir ? git("log", "-6", "--format=%h %ad %s", "--date=short", "--", dir).split("\n").filter(Boolean) : [] };
});
console.log(JSON.stringify(out, null, 1));
