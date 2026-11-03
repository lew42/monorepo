#!/usr/bin/env node
/* measure.mjs — times each hop of a raw Whisper final on the real logs.
 *
 *   node measure.mjs [session dir] [since ISO]
 *
 * Hop 1  Whisper round trip, as the page measured it (`ms` in ai/whisper/bucket.jsonl),
 *        beside the requests whisper-server itself received in the same 10 minutes
 *        (servex/logs/whisper.jsonl "Received request" lines): a gap = another client.
 * Hop 2  final arrives in the page (bucket `t`) → Sessions.say writes the {chat} line (`at`).
 * Hop 3  the view's draw is not logged; check-draw.mjs times it headless.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const repo = path.resolve(import.meta.dirname, "../../../../../../../../..");
const session_dir = process.argv[2] || path.join(repo, "public/framework/ai/sessions/2026/11/01/v-u48msei");
const since = process.argv[3] || "2026-11-01T23:00:00Z";
const local = t => new Date(t - 6 * 3600e3).toISOString().slice(11, 15) + "0";   // MDT 10-minute bin
const pct = (a, p) => { if (!a?.length) return "-"; const s = [...a].sort((x, y) => x - y); return Math.round(s[Math.min(s.length - 1, Math.floor(s.length * p))]); };
const jsonl = f => fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

// Hop 1
const bucket = jsonl(path.join(repo, "public/framework/ai/whisper/bucket.jsonl")).filter(x => x.src === "server" && x.at >= since);
const server = {};
const log = path.join(process.env.LOCALAPPDATA || "", "lew42/servex/logs/whisper.jsonl");
if (fs.existsSync(log)){
	const size = fs.statSync(log).size;
	const rl = readline.createInterface({ input: fs.createReadStream(log, { start: Math.max(0, size - 60e6) }) });
	for await (const l of rl){
		if (!l.includes("Received request")) continue;
		const at = l.match(/"at":"([^"]+)"/)?.[1]; if (!at) continue;
		const t = Date.parse(at); if (t < Date.parse(since)) continue;
		server[local(t)] = (server[local(t)] || 0) + 1;
	}
}
const bins = {};
for (const x of bucket) (bins[local(x.t)] ??= []).push(x);
console.log("Hop 1 — Whisper round trip from the page (ms), per 10 min (MDT)");
console.log("bin    page reqs  server reqs  p50   p90   max    audio s p50");
for (const k of Object.keys(bins).sort()){
	const v = bins[k], ms = v.map(x => x.ms);
	console.log(k.padEnd(6), String(v.length).padStart(9), String(server[k] ?? "-").padStart(12), String(pct(ms, .5)).padStart(5), String(pct(ms, .9)).padStart(5), String(Math.max(...ms)).padStart(6), String(pct(v.map(x => x.seconds), .5)).padStart(8));
}

// Hop 2
const lines = jsonl(path.join(session_dir, "session.jsonl"));
const owner = lines.filter(x => x.chat?.from?.kind === "owner" && x.chat.via === "voice");
const finals = bucket.filter(x => x.kind === "final");
const norm = s => (s || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
const hop2 = {};
let matched = 0;
for (const c of owner){
	const at = Date.parse(c.chat.at), text = norm(c.chat.text).slice(0, 40);
	const f = finals.filter(x => x.t <= at && at - x.t < 60e3 && norm(x.msg).includes(text)).at(-1);
	if (!f) continue;
	matched++;
	(hop2[local(at)] ??= []).push(at - f.t);
}
console.log(`\nHop 2 — final in the page → {chat} line written (ms); ${matched} of ${owner.length} owner lines matched a final`);
for (const k of Object.keys(hop2).sort()) console.log(k.padEnd(6), "n", String(hop2[k].length).padStart(3), " p50", pct(hop2[k], .5), " p90", pct(hop2[k], .9), " max", Math.max(...hop2[k]));
