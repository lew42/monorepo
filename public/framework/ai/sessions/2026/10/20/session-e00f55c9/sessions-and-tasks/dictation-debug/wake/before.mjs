// node before.mjs [out.json] — per voice session of 2026-10-24 and 25: dictation minutes, owner lines, smart-seat
// wakes, tokens and dollars. Reads the real records (public/framework/ai/sessions/2026/10/{24,25}/v-*/session.jsonl,
// plus any older <home>ai/v-*.jsonl) and each seat's Claude transcript (~/.claude/projects/*/<id>.jsonl). No model calls.
// Dictation minutes: owner voice lines whose gap is under 90 s count as one run; a run is its span plus 10 s of speech before its first line.
// A smart-seat WAKE = one user prompt (string content) the Servex SDK delivered to the smart seat's transcript.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.WAKE_ROOT || "C:/Code/lew42/monorepo";
const { default: AISessionCost } = await import(pathToFileURL(path.join(ROOT, "public/framework/ai/AISession/AISessionCost.mjs")).href);
const DAYS = ["2026/10/24", "2026/10/25"];
const GAP_MS = 90_000, LEAD_MS = 10_000;

const jsonl = f => fs.readFileSync(f, "utf8").split("\n").filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });

function records(){
	const out = [];
	for (const day of DAYS){
		const dir = path.join(ROOT, "public/framework/ai/sessions", day);
		if (!fs.existsSync(dir)) continue;
		for (const name of fs.readdirSync(dir)) if (/^v-/.test(name)){
			const f = path.join(dir, name, "session.jsonl");
			if (fs.existsSync(f)) out.push({ id: name, file: f, day });
		}
	}
	// older flat records: <home>ai/v-*.jsonl anywhere shallow under public/
	const walk = (d, depth) => { if (depth > 4) return; let ents = []; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
		for (const e of ents){ const p = path.join(d, e.name);
			if (e.isFile() && /^v-.*\.jsonl$/.test(e.name) && path.basename(d) === "ai") out.push({ id: e.name.slice(0, -6), file: p, day: "flat" });
			else if (e.isDirectory() && !/^(node_modules|sessions|\.git)$/.test(e.name)) walk(p, depth + 1); } };
	walk(path.join(ROOT, "public"), 0);
	return out;
}

function transcript(id){
	const base = path.join(os.homedir(), ".claude/projects");
	for (const d of fs.readdirSync(base)){ const f = path.join(base, d, `${id}.jsonl`); if (fs.existsSync(f)) return f; }
	return null;
}

function seat_stats(id){
	const f = id && transcript(id);
	if (!f) return null;
	const lines = jsonl(f);
	const prompts = lines.filter(o => o.type === "user" && typeof o.message?.content === "string" && !o.isSidechain);
	const c = new AISessionCost(); c.feed(fs.readFileSync(f, "utf8"));
	const t = { input: 0, output: 0, cache_read: 0, cache_write: 0 }, models = {};
	for (const e of c.parts.get("main")?.values() ?? []){ t.input += e.input; t.output += e.output; t.cache_read += e.cread; t.cache_write += e.w5 + e.w1; models[e.model] = (models[e.model] || 0) + 1; }
	return { id, wakes: prompts.length, prompt_times: prompts.map(o => o.timestamp), turns: c.messages, tokens: t, tokens_total: t.input + t.output + t.cache_read + t.cache_write, usd: +c.total_usd.toFixed(4), models };
}

function minutes(times){
	const ts = times.map(Date.parse).filter(Number.isFinite).sort((a, b) => a - b);
	let total = 0, start = null, prev = null;
	for (const t of ts){
		if (start == null){ start = prev = t; continue; }
		if (t - prev <= GAP_MS){ prev = t; continue; }
		total += prev - start + LEAD_MS; start = prev = t;
	}
	if (start != null) total += prev - start + LEAD_MS;
	return +(total / 60000).toFixed(2);
}

const sessions = records().map(r => {
	const lines = jsonl(r.file);
	const head = lines.find(l => l.session)?.session;
	if (r.day === "flat" ? false : head && head.kind && head.kind !== "voice") return null;
	const chats = lines.filter(l => l.chat).map(l => l.chat);
	const owner = chats.filter(c => c.from?.kind === "owner");
	const backing = lines.filter(l => l.backing).map(l => l.backing);
	const ids = k => [...new Set(backing.map(b => b[k]).filter(Boolean))];
	const smart = ids("smart").map(seat_stats).filter(Boolean), fast = ids("fast").map(seat_stats).filter(Boolean);
	const sum = (a, f) => a.reduce((n, x) => n + f(x), 0);
	const dict_min = minutes(owner.filter(c => c.via === "voice").map(c => c.at));
	const row = {
		id: r.id, day: r.day, started: head?.at ?? null,
		dictation_minutes: dict_min,
		owner_lines: owner.length, owner_voice_lines: owner.filter(c => c.via === "voice").length,
		smart_replies: chats.filter(c => c.from?.id === "smart").length,
		smart_wakes: sum(smart, s => s.wakes), smart_tokens: sum(smart, s => s.tokens_total), smart_usd: +sum(smart, s => s.usd).toFixed(4),
		fast_wakes: sum(fast, s => s.wakes), fast_tokens: sum(fast, s => s.tokens_total), fast_usd: +sum(fast, s => s.usd).toFixed(4),
		smart, fast,
	};
	row.smart_wakes_per_min = dict_min ? +(row.smart_wakes / dict_min).toFixed(2) : null;
	row.smart_tokens_per_min = dict_min ? Math.round(row.smart_tokens / dict_min) : null;
	return row;
}).filter(Boolean);

const total = k => sessions.reduce((n, s) => n + (s[k] || 0), 0);
const out = { computed_at: new Date().toISOString(), method: "dictation minutes = runs of owner voice lines <90 s apart, +10 s lead; wake = one string-content user prompt in the smart seat's transcript",
	totals: { dictation_minutes: +total("dictation_minutes").toFixed(2), owner_voice_lines: total("owner_voice_lines"), smart_wakes: total("smart_wakes"), smart_tokens: total("smart_tokens"), smart_usd: +total("smart_usd").toFixed(2) },
	sessions };
out.totals.smart_wakes_per_min = out.totals.dictation_minutes ? +(out.totals.smart_wakes / out.totals.dictation_minutes).toFixed(2) : null;
out.totals.smart_tokens_per_min = out.totals.dictation_minutes ? Math.round(out.totals.smart_tokens / out.totals.dictation_minutes) : null;
const dest = process.argv[2] || path.join(HERE, "before.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.totals), "\n" + sessions.map(s => `${s.id} ${s.day} min=${s.dictation_minutes} owner=${s.owner_lines} wakes=${s.smart_wakes} tok=${s.smart_tokens} $${s.smart_usd}`).join("\n"));
