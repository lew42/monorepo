// Match each tool-written line in a page.jsonl to the moment watch.mjs saw its text: the latency per step.
// node measure.mjs <page.jsonl> <seen.json> [since-iso]
import fs from "node:fs";

const [file, seen_file, since = ""] = process.argv.slice(2);
const { seen } = JSON.parse(fs.readFileSync(seen_file, "utf8"));
const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const rows = [];
for (const line of lines){
	if (!line.ts || line.ts < since) continue;
	const add = line.content?.add, text = add ? (add.title ?? add.text) : line.title ?? null;
	const hit = text && seen.find(s => s.text.toLowerCase() === String(text).trim().slice(0, 120).toLowerCase());
	rows.push({ ts: line.ts, wrote: JSON.stringify(line).replace(/,"by":.*$/, "").slice(0, 90), seen: hit?.at ?? null, ms: hit ? Date.parse(hit.at) - Date.parse(line.ts) : null });
}
// A card's line carries its ts inside `add`; lift it.
for (const line of lines) if (line.content?.add?.ts && line.content.add.ts >= since){
	const add = line.content.add, text = String(add.title ?? add.text ?? "").trim().slice(0, 120), hit = seen.find(s => s.text.toLowerCase() === text.toLowerCase());
	rows.push({ ts: add.ts, wrote: `${add.type ?? "item"}: ${text.slice(0, 60)}`, seen: hit?.at ?? null, ms: hit ? Date.parse(hit.at) - Date.parse(add.ts) : null });
}
rows.sort((a, b) => a.ts < b.ts ? -1 : 1);
console.log("| tool wrote (ts) | what | seen in browser | ms |\n|---|---|---|---|");
for (const r of rows) console.log(`| ${r.ts.slice(11, 23)} | \`${r.wrote.replaceAll("|", "\\|")}\` | ${r.seen?.slice(11, 23) ?? "not seen"} | ${r.ms ?? "–"} |`);
