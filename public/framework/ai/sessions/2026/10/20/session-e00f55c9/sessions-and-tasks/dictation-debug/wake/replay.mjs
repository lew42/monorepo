// node replay.mjs [out.json] — replays the REAL owner lines of the voice sessions in before.json through (a) the OLD rule,
// rebuilt from Sessions.js before this task, and (b) the new WakePolicy gate, on a fake clock. No model calls.
//
// OLD rule (release_thought / gather): a spoken line is held; it is released to the smart seat when a `quiet` event of >= 2.5 s or a
//   mic-off arrives after it, or the line's floor is not "speaking" (the page said it is done), or 8 s passed with no event; a typed line
//   goes out after 1.5 s. Every release = one smart wake. The model is checked against the wakes really counted in the seat's transcript.
// NEW rule: the same releases are handed to WakePolicy (Servex/agents/WakePolicy.js, default knobs). A release counts 2.5 s of silence
//   already (the quiet event) when a quiet event caused it; a mic-off flushes; a question or a name wakes at once.
// TOKENS: the seat's real tokens per wake in that session (before.json) times the new wake count. Conservative in one direction and
//   generous in the other: later wakes carry a longer cached context (costs more) but a smaller prompt count also keeps the cache warm.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.WAKE_ROOT || "C:/Code/lew42/monorepo";
const REPO = process.env.WAKE_REPO || "C:/Code/lew42/worktrees/dictation-wake";
const { default: WakePolicy, WAKE_DEFAULTS } = await import(pathToFileURL(path.join(REPO, "Servex/agents/WakePolicy.js")).href);
const before = JSON.parse(fs.readFileSync(path.join(HERE, "before.json"), "utf8"));
const GAP = Number(process.env.WAKE_GAP_MS || WAKE_DEFAULTS.gap_ms), EVERY = Number(process.env.WAKE_EVERY || WAKE_DEFAULTS.every);
const QUIET = 2500, HOLD_MAX = 8000, TYPED = 1500, FLOOR_WAIT = 8000;

const jsonl = f => fs.readFileSync(f, "utf8").split("\n").filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });

function events(file){
	const out = [];
	for (const l of jsonl(file)){
		if (l.chat?.from?.kind === "owner") out.push({ t: Date.parse(l.chat.at), kind: "line", via: l.chat.via, floor: l.chat.floor, text: l.chat.text, at: l.chat.at });
		else if (l.quiet) out.push({ t: Date.parse(l.quiet.at), kind: "quiet", ms: l.quiet.ms, mic_off: !!l.quiet.mic_off });
	}
	return out.filter(e => Number.isFinite(e.t)).sort((a, b) => a.t - b.t);
}

/** The old rule: returns releases [{t, lines, silence_ms, mic_off}] — each one was a smart wake. */
function old_releases(evs){
	const rel = []; let held = [], timer = null, typed = [], typed_timer = null;
	const release = (t, silence_ms, mic_off) => { if (held.length){ rel.push({ t, lines: held, silence_ms, mic_off }); held = []; timer = null; } };
	const flush_to = t => {   // run the timers that come due before time t
		if (timer != null && timer <= t) release(timer, HOLD_MAX, false);
		if (typed_timer != null && typed_timer <= t){ rel.push({ t: typed_timer, lines: typed, silence_ms: TYPED, mic_off: false, typed: true }); typed = []; typed_timer = null; }
	};
	for (const e of evs){
		flush_to(e.t);
		if (e.kind === "quiet"){ if (e.mic_off || e.ms >= QUIET) release(e.t, e.ms, e.mic_off); continue; }
		if (e.via === "voice" && e.floor){
			held.push(e); timer = e.t + HOLD_MAX;
			if (e.floor !== "speaking") release(e.t, QUIET, false);
		} else if (held.length){ held.push(e); release(e.t, 0, false); }
		else { typed.push(e); typed_timer = e.t + TYPED; }
	}
	flush_to(Infinity);
	return rel.sort((a, b) => a.t - b.t);
}

/** The floor, as Sessions.set_floor sees it: a voice line stamped "speaking" holds the pause timer; any other floor (or 8 s with
 *  nothing new) lets it run again. Returns [{t, hold}] events. */
function floor_events(evs){
	const lines = evs.filter(e => e.kind === "line" && e.via === "voice" && e.floor), out = [];
	lines.forEach((e, i) => {
		out.push({ t: e.t, hold: e.floor === "speaking" });
		const next = lines[i + 1]?.t ?? Infinity;
		if (e.floor === "speaking" && next > e.t + FLOOR_WAIT) out.push({ t: e.t + FLOOR_WAIT, hold: false });
	});
	return out;
}

/** The new rule over those releases. Returns wakes [{t, why, lines, sentences}]. */
function new_wakes(releases, end_t, knobs, floors = []){
	let now = 0, next = 1; const timers = new Map(), wakes = [];
	const clock = { set(fn, ms){ const id = next++; timers.set(id, { at: now + ms, fn }); return id; }, clear(id){ timers.delete(id); } };
	const run_to = t => { for (;;){ const due = [...timers].filter(([, x]) => x.at <= t).sort((a, b) => a[1].at - b[1].at)[0]; if (!due) break; timers.delete(due[0]); now = due[1].at; due[1].fn(); } now = t; };
	const policy = new WakePolicy({ clock, defaults: knobs, flush: (id, lines, why, info) => wakes.push({ t: now, why, lines: lines.length, sentences: info.sentences }) });
	const steps = [...floors.map(f => ({ ...f, order: 0 })), ...releases.map(r => ({ ...r, order: 1, release: true }))].sort((a, b) => a.t - b.t || a.order - b.order);
	for (const r of steps){
		run_to(r.t);
		if (!r.release){ r.hold ? policy.hold("s") : policy.resume("s"); continue; }
		policy.add("s", r.lines.map(l => ({ at: l.at, text: l.text })), r.typed ? { hold_ms: TYPED } : { elapsed_ms: r.silence_ms >= QUIET ? Math.min(r.silence_ms, QUIET) : 0 });
		if (r.mic_off) policy.flush("s", "the mic went off");
	}
	run_to(end_t + 120000);
	return wakes;
}

const rows = [];
for (const s of before.sessions){
	const file = path.join(ROOT, "public/framework/ai/sessions", s.day, s.id, "session.jsonl");
	const evs = events(file);
	const rel = old_releases(evs);
	const wakes = new_wakes(rel, evs.at(-1)?.t ?? 0, { gap_ms: GAP, every: EVERY }, process.env.WAKE_NO_FLOOR ? [] : floor_events(evs));
	const tokens_per_wake = s.smart_wakes ? s.smart_tokens / s.smart_wakes : 0, usd_per_wake = s.smart_wakes ? s.smart_usd / s.smart_wakes : 0;
	const after_tokens = Math.round(tokens_per_wake * wakes.length), after_usd = +(usd_per_wake * wakes.length).toFixed(4);
	const why = {}; for (const w of wakes) why[w.why.replace(/paused.*/, "paused")] = (why[w.why.replace(/paused.*/, "paused")] || 0) + 1;
	// Runs: lines less than 90 s apart. Where the dictation is long (>= 5 lines) the gate matters most; where it is a one-line question it cannot help.
	const owner = evs.filter(e => e.kind === "line"), runs = [];
	for (const e of owner){ const r = runs.at(-1); if (r && e.t - r.end <= 90000){ r.end = e.t; r.lines++; } else runs.push({ start: e.t, end: e.t, lines: 1 }); }
	for (const r of runs){
		r.old_wakes = rel.filter(x => x.t >= r.start && x.t <= r.end + 90000).length;
		r.new_wakes = wakes.filter(x => x.t >= r.start && x.t <= r.end + 90000).length;
		r.minutes = +((r.end - r.start + 10000) / 60000).toFixed(2);
	}
	rows.push({
		runs: runs.map(r => ({ at: new Date(r.start).toISOString(), minutes: r.minutes, lines: r.lines, old_wakes: r.old_wakes, new_wakes: r.new_wakes })),
		id: s.id, dictation_minutes: s.dictation_minutes, owner_lines: s.owner_lines,
		before: { observed_wakes: s.smart_wakes, modelled_wakes: rel.length, wakes_per_min: +(s.smart_wakes / s.dictation_minutes).toFixed(2), tokens: s.smart_tokens, tokens_per_min: Math.round(s.smart_tokens / s.dictation_minutes), usd: s.smart_usd },
		after: { wakes: wakes.length, wakes_per_min: +(wakes.length / s.dictation_minutes).toFixed(2), tokens: after_tokens, tokens_per_min: Math.round(after_tokens / s.dictation_minutes), usd: after_usd, by_reason: why, sentences_per_wake: +(wakes.reduce((n, w) => n + w.sentences, 0) / Math.max(1, wakes.length)).toFixed(1) },
	});
}
const sum = (f) => rows.reduce((n, r) => n + f(r), 0), mins = sum(r => r.dictation_minutes);
const totals = {
	dictation_minutes: +mins.toFixed(2),
	before: { wakes: sum(r => r.before.observed_wakes), wakes_per_min: +(sum(r => r.before.observed_wakes) / mins).toFixed(2), tokens: sum(r => r.before.tokens), tokens_per_min: Math.round(sum(r => r.before.tokens) / mins), usd: +sum(r => r.before.usd).toFixed(2) },
	after: { wakes: sum(r => r.after.wakes), wakes_per_min: +(sum(r => r.after.wakes) / mins).toFixed(2), tokens: sum(r => r.after.tokens), tokens_per_min: Math.round(sum(r => r.after.tokens) / mins), usd: +sum(r => r.after.usd).toFixed(2) },
};
const out = { computed_at: new Date().toISOString(), knobs: { gap_ms: GAP, every: EVERY }, method: "owner lines + quiet events of the real session files; old rule rebuilt and checked against observed wakes; new rule = WakePolicy on a fake clock, told when the owner is speaking (the floor); tokens = real tokens per wake x new wake count", totals, sessions: rows };
fs.writeFileSync(process.argv[2] || path.join(HERE, "after.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(totals));
for (const r of rows) for (const x of r.runs) console.log("  run", r.id, x.at.slice(11, 19), `${x.minutes} min`, `${x.lines} lines`, `old ${x.old_wakes} -> new ${x.new_wakes}`);
for (const r of rows) console.log(r.id, `min=${r.dictation_minutes}`, `lines=${r.owner_lines}`, `observed=${r.before.observed_wakes}`, `model=${r.before.modelled_wakes}`, `-> new ${r.after.wakes}`, JSON.stringify(r.after.by_reason), `sent/wake=${r.after.sentences_per_wake}`);
