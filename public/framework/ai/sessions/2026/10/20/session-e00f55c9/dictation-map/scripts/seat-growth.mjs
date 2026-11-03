// Per-turn context size of one seat's transcript: does each wake re-read a growing history?
// node seat-growth.mjs <transcript.jsonl>
import fs from "node:fs";
import readline from "node:readline";

const file = process.argv[2];
const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
const turns = [];   // one per user message from the owner side: tokens of the first model call after it
let users = 0, seen = new Set();
for await (const line of rl){
	if (!line.includes('"usage"') && !line.includes('"type":"user"')) continue;
	let j; try { j = JSON.parse(line); } catch { continue; }
	if (j.type === "user" && typeof j.message?.content === "string") users++;
	const u = j.message?.usage;
	if (j.type !== "assistant" || !u) continue;
	const id = j.message.id;
	if (seen.has(id)) continue;   // one API call can be split over several lines
	seen.add(id);
	turns.push({ users, ctx: (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
		read: u.cache_read_input_tokens ?? 0, write: u.cache_creation_input_tokens ?? 0, fresh: u.input_tokens ?? 0, out: u.output_tokens ?? 0 });
}
const n = turns.length;
const sum = k => turns.reduce((a, t) => a + t[k], 0);
const at = q => turns[Math.min(n - 1, Math.floor(q * n))];
console.log(JSON.stringify({ file: file.split(/[\\/]/).pop(), model_calls: n, owner_messages: users,
	total: { ctx: sum("ctx"), cache_read: sum("read"), cache_write: sum("write"), fresh: sum("fresh"), out: sum("out") },
	context_per_call: { first: turns[0]?.ctx, p25: at(0.25)?.ctx, p50: at(0.5)?.ctx, p75: at(0.75)?.ctx, last: turns[n - 1]?.ctx, max: Math.max(...turns.map(t => t.ctx)) } }, null, 1));
