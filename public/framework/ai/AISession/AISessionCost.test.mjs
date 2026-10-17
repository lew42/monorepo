// node --test public/framework/ai/AISession/AISessionCost.test.mjs
// The rule (doc/cost-accounting.md): the raw log is the truth; one total however many times, in what pieces, or in what order it is read.
// Reads a REAL transcript from ~/.claude/projects (one the SDK replayed: the same message ids far apart), plus a synthetic log for the zeroed-replay case.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import AISession from "./AISession.js";
import AISessionCost from "./AISessionCost.mjs";
import { cost_of_transcript } from "./AISessionAudit.mjs";

const near = (a, b, why) => assert.ok(Math.abs(a - b) < 1e-6, `${why}: ${a} vs ${b}`);

// A real log whose message ids repeat more than 40 lines apart (what broke the 40-slot ring). Newest first, 0.2 to 30 MB.
function real_log(){
	const root = path.join(os.homedir(), ".claude", "projects"), found = [];
	for (const d of fs.readdirSync(root)) for (const f of fs.readdirSync(path.join(root, d))) if (f.endsWith(".jsonl")){
		const p = path.join(root, d, f), st = fs.statSync(p);
		if (st.size > 2e5 && st.size < 30e6) found.push({ p, t: st.mtimeMs });
	}
	for (const { p } of found.sort((a, b) => b.t - a.t).slice(0, 80)){
		const last = new Map(); let n = 0;
		for (const l of fs.readFileSync(p, "utf8").split("\n")){
			const m = l.includes('"type":"assistant"') && /"id":"(msg_[A-Za-z0-9]+)"/.exec(l); if (!m) continue;
			if (last.has(m[1]) && n - last.get(m[1]) > 40) return p;     // a repeat farther back than the old ring remembered
			last.set(m[1], n++);
		}
	}
	return null;
}

const line = (id, u, extra = {}) => JSON.stringify({ type: "assistant", uuid: "u" + Math.random(), timestamp: "2026-10-17T00:00:00Z", message: { id, model: "claude-sonnet-5", usage: u, content: [] }, ...extra });
const usage = (i, o, cr, w) => ({ input_tokens: i, output_tokens: o, cache_read_input_tokens: cr, cache_creation_input_tokens: w, cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: w } });

test("synthetic: partial lines, repeats and a zeroed replay count a message once, at its largest", () => {
	const log = [line("m1", usage(2, 10, 1000, 500)), line("m1", usage(2, 400, 1000, 500)), line("m2", usage(1, 50, 2000, 0)),
		line("m1", usage(0, 0, 0, 500)),                       // the SDK's replay: usage zeroed, cache write left behind
		line("m2", usage(0, 0, 0, 0))].join("\n") + "\n";
	const once = new AISessionCost(); once.feed(log);
	const want = (2 * 2 + 400 * 10 + 1000 * 0.2 + 500 * 4) / 1e6 + (1 * 2 + 50 * 10 + 2000 * 0.2) / 1e6;
	near(once.total_usd, want, "once");
	assert.equal(once.messages, 2);
	const twice = new AISessionCost(); twice.feed(log); twice.feed(log);
	near(twice.total_usd, want, "twice");
	const s = new AISession("x"); s.apply_text(log); s.apply_text(log);
	near(s.total_usd, want, "AISession, fed twice");
});

test("synthetic: 100 messages, then the whole log replayed (farther than any bounded ring)", () => {
	const log = Array.from({ length: 100 }, (_, i) => line("m" + i, usage(1, 100, 1000 * i, 100))).join("\n") + "\n";
	const s = new AISession("x"); s.apply_text(log); const first = s.total_usd; s.apply_text(log);
	near(s.total_usd, first, "replayed past 40 messages");
	const c = new AISessionCost(); c.feed(log); near(c.total_usd, first, "counter vs AISession");
});

test("real log: once, twice, tail then full, halves, reversed; AISession and the audit agree", () => {
	const file = real_log();
	if (!file) return console.log("  no replayed real log on this machine: only the synthetic tests ran");
	const text = fs.readFileSync(file, "utf8"), rows = text.split("\n").filter(Boolean);
	const total = pieces => { const c = new AISessionCost(); for (const p of pieces) c.feed(p); return c.total_usd; };
	const once = total([text]);
	assert.ok(once > 0, "the log costs something");
	near(total([text, text]), once, "twice");
	near(total([rows.slice(-200).join("\n"), text]), once, "tail then full");
	near(total([text, rows.slice(-200).join("\n")]), once, "full then tail");
	const mid = rows.length >> 1;
	near(total([rows.slice(0, mid).join("\n"), rows.slice(mid).join("\n")]), once, "first half then second half");
	near(total([rows.slice(mid).join("\n"), rows.slice(0, mid).join("\n")]), once, "second half then first half (order does not matter)");
	const s = new AISession("x"); s.apply_text(text); near(s.total_usd, once, "AISession once");
	s.apply_text(text); near(s.total_usd, once, "AISession replayed");
	const t = new AISession("x"); t.apply_text(rows.slice(0, mid).join("\n")); t.apply_text(rows.slice(mid - 300).join("\n")); near(t.total_usd, once, "AISession overlapping tail");
	assert.ok(Math.abs(cost_of_transcript(file).total_usd - once) < 0.0005, "the audit's separate code agrees");
	console.log("  real log", path.basename(file), rows.length, "lines, $" + once.toFixed(4));
});
