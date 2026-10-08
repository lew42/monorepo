// node Server/session-summary.test.mjs [session-id]
// Loads a real session, checks the rolling total against the independent recomputation
// (Server/session-cost.mjs), checks idempotence + incremental reads, then CORRUPTS a total and
// confirms the audit catches it. No cache is written. Exit 1 on any failure.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import Session from "../public/framework/ai/sessions/Session.js";
import { find_transcript, cost_of_session } from "./session-cost.mjs";
import { files_of } from "./session-summary.mjs";

let failed = 0;
const ok = (cond, msg) => { console.log((cond ? "PASS " : "FAIL ") + msg); if (!cond) failed++; };

// pick: the argument, else the biggest transcript (under 25 MB) with a subagents folder, else the biggest overall
function pick(){
	if (process.argv[2]) return process.argv[2];
	const base = path.join(os.homedir(), ".claude", "projects"), cands = [];
	for (const d of fs.readdirSync(base).filter(d => /^c--code-lew42-/i.test(d)))
		for (const f of fs.readdirSync(path.join(base, d)).filter(f => f.endsWith(".jsonl"))){
			const p = path.join(base, d, f), st = fs.statSync(p);
			if (st.size > 2e5 && st.size < 25e6) cands.push({ id: f.slice(0, -6), size: st.size, subs: fs.existsSync(path.join(base, d, f.slice(0, -6), "subagents")) });
		}
	cands.sort((a, b) => (b.subs - a.subs) || (b.size - a.size));
	return cands[0].id;
}

const id = pick();
console.log("session", id, find_transcript(id));

// 1. full load, rolling vs independent recomputation
const s1 = new Session(id);
await s1.update(files_of(id));
const truth = cost_of_session(id);
const gap = Math.abs(s1.total_usd - truth.total_usd);
ok(gap < 0.0005, `rolling $${s1.total_usd} vs recomputed $${truth.total_usd} (gap $${gap.toFixed(6)}, ${truth.subagents} subagent files, ${truth.messages} messages)`);
const a1 = await s1.audit(id);
ok(a1.match, "audit says match" + (a1.match ? "" : " " + JSON.stringify(a1.diff)));

// 2. a second update reads nothing new (byte cursor)
const again = await s1.update(files_of(id));
ok(again.new_lines === 0, "second update reads 0 new lines");

// 3. idempotent by message id: re-applying the newest lines of the file read last (the ring remembers the last 40 messages) changes nothing
const main = find_transcript(id), text = fs.readFileSync(main, "utf8");
const s5 = new Session(id); s5.apply_text(text, "main");
const before = s5.total_usd;
s5.apply_text(text.trimEnd().split("\n").slice(-25).join("\n"), "main");
ok(s5.total_usd === before, "re-applying already-seen lines adds $0");

// 4. incremental: first half, then the rest, equals the full load
const cut = text.indexOf("\n", text.length >> 1) + 1;
const s2 = new Session(id);
s2.apply_text(text.slice(0, cut), "main"); const mid = s2.total_usd; s2.apply_text(text.slice(cut), "main");
const s3 = new Session(id); s3.apply_text(text, "main");
ok(mid < s2.total_usd && Math.abs(s2.total_usd - s3.total_usd) < 1e-9, `two-step load equals one-step load ($${s2.total_usd}, was $${mid} halfway)`);

// 5. corrupt a rolling total: the audit must catch it, and say which field and by how much
const s4 = new Session(id, JSON.parse(JSON.stringify(s1.s)));
s4.s.usd += 1.25; s4.s.usd_parts.out += 1.25; s4.s.tokens.output += 5000;
const a2 = await s4.audit(id);
ok(!a2.match && a2.diff.usd && a2.diff.output, `corrupted totals caught: ${Object.entries(a2.diff).map(([k, v]) => `${k} off by ${-v.diff}`).join(", ")}`);

// 6. the purpose breakdown adds up
const d = s1.detail(), tok = d.purpose.reduce((n, p) => n + p.tokens, 0), pusd = d.purpose.reduce((n, p) => n + p.usd, 0);
ok(Math.abs(pusd - d.usd) < 0.01 * Math.max(1, d.usd), `purpose dollars ($${pusd.toFixed(4)}) sum to the total ($${d.usd})`);
console.log(`     purpose tokens ${tok}; ` + d.purpose.map(p => `${p.key} ${p.pct}%`).join(" "));

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
