// Evidence pack for the past-work audit, slice 1: the newest N "waiting on you" items
// (list_waiting's JSON), each with its task's own log lines and the last commits on its folder.
// Usage: node evidence.mjs <list_waiting.json> [N=20] [done-evidence.json …] > evidence.json
// Later slices pass the earlier slices' evidence.json: those items are skipped and numbering continues after them.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const [file, n = 20, ...skip] = process.argv.slice(2);
let raw = JSON.parse(fs.readFileSync(file, "utf8"));
if (raw[0]?.text) raw = JSON.parse(raw[0].text);
const done = skip.flatMap(f => JSON.parse(fs.readFileSync(f, "utf8")));
// A card decision has no id: it is keyed by its card and its decision id.
const key = x => x.id ?? `${x.card}#${x.ask}`;
const seen = new Set(done.map(key)), base = done.length;
const items = [...raw].filter(x => !seen.has(key(x))).sort((a, b) => (b.at || "").localeCompare(a.at || "")).slice(0, +n);
const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 26, windowsHide: true }).trim(); } catch { return ""; } };
const out = items.map((it, i) => {
	// A card decision has no url: its id is the ask, found by git grep in its card's page.jsonl.
	const hits = it.kind === "decision" ? git("grep", "-n", it.ask, "--", "public/framework/ai").split("\n").filter(Boolean) : [];
	const dir = it.url ? "public" + it.url.replace(/\/$/, "") : hits[0] ? hits[0].split(":")[0].replace(/\/[^/]+$/, "")
		// A question or fyi card has only its card path (YYYY/MM/DD/slug), under sessions/<date>/cards/.
		: it.card ? it.card.replace(/^(\d+\/\d+\/\d+)\//, "public/framework/ai/sessions/$1/cards/") : null;
	const id = it.kind === "decision" ? it.ask : (it.id || "").split("~").pop();
	const lines = hits.map(h => h.replace(dir + "/", "").slice(0, 600));
	for (const f of it.kind === "decision" ? [] : ["session.jsonl", "task.jsonl"]) {
		const p = dir && `${dir}/${f}`;
		if (!p || !fs.existsSync(p)) continue;
		const all = fs.readFileSync(p, "utf8").split("\n");
		all.forEach((l, k) => { if (l.includes(`"${id}"`)) lines.push(`${f}:${k + 1} ${l.slice(0, 600)}`); });
		if (!lines.length && all[0]) lines.push(`${f}:1 ${all[0].slice(0, 600)}`);
	}
	if (it.kind !== "decision" && it.card && dir && fs.existsSync(dir + "/page.jsonl")) {
		const all = fs.readFileSync(dir + "/page.jsonl", "utf8").split("\n").filter(Boolean);
		all.slice(-4).forEach((l, k) => lines.push(`page.jsonl:${all.length - Math.min(4, all.length) + k + 1} ${l.slice(0, 600)}`));
	}
	return { n: base + i + 1, ...it, dir, task_id: id,
		lines: lines.length > 14 ? [...lines.slice(0, 6), `… ${lines.length - 12} more …`, ...lines.slice(-6)] : lines,
		commits: dir ? git("log", "-6", "--format=%h %ad %s", "--date=short", "--", dir).split("\n").filter(Boolean) : [] };
});
console.log(JSON.stringify(out, null, 1));
