// scan-events.mjs — collect every Servex card tool call (and its result) from the claude
// transcripts written since a date, plus any snapshot of a card page.jsonl (a Read result or
// a `cat`), into events.json beside this file. Read-only: it writes nothing but events.json.
// usage: node scan-events.mjs [since=2026-10-01T00:00:00-05:00]
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const DIR = "C:/Users/mike/.claude/projects/C--Code-lew42-monorepo";
const since = Date.parse(process.argv[2] ?? "2026-10-01T00:00:00-05:00");
const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const CARD_TOOLS = /^mcp__servex__(create_card|card_reply|card_ask|card_set|attach_card|add_item|place|file_to_group)$/;
const CARD_PATH = /public[\\/]+framework[\\/]+ai[\\/]+2026[\\/]+10[\\/]+[^\s"'`]*page\.jsonl/;

const files = fs.readdirSync(DIR).filter(f => f.endsWith(".jsonl")).map(f => path.join(DIR, f))
	.filter(f => fs.statSync(f).mtimeMs >= since);

const events = [], snapshots = [];
for (const file of files){
	const session = path.basename(file, ".jsonl");
	const calls = new Map();   // tool_use_id -> event
	const rl = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
	for await (const raw of rl){
		if (!raw.includes("tool_")) continue;
		let o; try { o = JSON.parse(raw); } catch { continue; }
		const content = o.message?.content;
		if (!Array.isArray(content)) continue;
		for (const c of content){
			if (c.type === "tool_use"){
				if (CARD_TOOLS.test(c.name)){
					const ev = { session, at: o.timestamp, tool: c.name.replace("mcp__servex__", ""), input: c.input };
					calls.set(c.id, ev); events.push(ev);
				} else if ((c.name === "Read" && CARD_PATH.test(c.input?.file_path ?? "")) ||
					(c.name === "Bash" && CARD_PATH.test(c.input?.command ?? "") && /\b(cat|head|tail)\b/.test(c.input.command))){
					const ev = { session, at: o.timestamp, tool: c.name, input: c.input, snapshot: true };
					calls.set(c.id, ev); snapshots.push(ev);
				}
			} else if (c.type === "tool_result" && calls.has(c.tool_use_id)){
				const ev = calls.get(c.tool_use_id);
				ev.result = typeof c.content === "string" ? c.content : (c.content ?? []).map(x => x.text ?? "").join("");
				ev.result_at = o.timestamp;
				if (c.is_error) ev.error = true;
			}
		}
	}
}
events.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
snapshots.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
fs.writeFileSync(path.join(here, "events.json"), JSON.stringify({ since: new Date(since).toISOString(), files: files.length, events, snapshots }, null, 1));
const by = {}; for (const e of events) by[e.tool] = (by[e.tool] ?? 0) + 1;
console.log(`${files.length} transcripts, ${events.length} card calls`, by, `${snapshots.length} snapshots`);
