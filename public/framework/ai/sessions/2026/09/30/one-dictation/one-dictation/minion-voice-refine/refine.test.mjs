// Proof for minion-voice-refine (review finding 2: committed beside the brief, not left in a
// scratchpad). Calls the real `Sessions.refine()` with a STUBBED `echo.call` -- no real model,
// no network, no real session file touched, and never a real `say()` into a live session.
//
// Run from the repo root: node public/framework/ai/2026-09-30/one-dictation/minion-voice-refine/refine.test.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Sessions, { now_ms, worth_refining } from "../../../../../../Servex/agents/Sessions.js";
import Echo from "../../../../../../Servex/agents/Echo.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));

function make_sessions(stub_call){
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "voice-refine-test-"));
	// `repo` is a fresh TMP dir, not the real worktree: Sessions.disk() always writes under
	// "<repo>/public/...", so pointing `repo` at tmp keeps every write off the real, live site
	// entirely (never near a path the dev server watches or reloads).
	const echo = new Echo({});   // the real Echo class, for its real parse_sections/sections_with_ids/
	echo.call = stub_call;        // sections_with_ids methods (review finding 1) -- only `call` is faked
	const sessions = new Sessions({ repo: tmp, file: path.join(tmp, "sessions.json"), servex: { echo, say: () => {} } });
	return { sessions, tmp };
}

function read_lines(sessions, s){
	try { return fs.readFileSync(sessions.disk(s.file), "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l)); }
	catch { return []; }
}

const results = [];
function check(name, ok){ results.push([name, ok]); console.log(`${ok ? "PASS" : "FAIL"} — ${name}`); }

// ---- Case 1: a real, finished line (>= 2 sentences) gets refined -------------------------
{
	let calls = 0;
	const stub_call = async (prompt, opts) => {
		calls++;
		// call 1 is clean()'s own call: a reply that does NOT match the "S1. text" numbered
		// format makes clean() fall back to its own mechanical sentence split of the raw text
		// -- a deterministic way to get real sentences out of a stub with no real model.
		if (calls === 1) return { answer: "(stub: not the numbered format)", cost_usd: 0.0011 };
		// call 2 is structure()'s own call: valid "## Heading / - bullet [S1, S2]" markdown.
		return { answer: "## Note\n- hello and a test [S1, S2]\n", cost_usd: 0.0022 };
	};
	const { sessions, tmp } = make_sessions(stub_call);
	const s = { id: "test-session", file: `/__test__/${path.basename(tmp)}/session.jsonl` };
	const line = { at: now_ms(), text: "Hello world. This is a test." };

	await sessions.refine(s, line);
	const refined = read_lines(sessions, s).find(l => l.refined);

	check("a finished, 2-sentence line makes exactly 2 model calls", calls === 2);
	check("one `refined` line was written", !!refined);
	check("`refined.re` points at the owner line's own `at`", refined?.refined?.re === line.at);
	check("`refined.cost_usd` sums both stubbed calls (0.0011 + 0.0022)", Math.abs((refined?.refined?.cost_usd ?? 0) - 0.0033) < 1e-9);
	check("`refined.sentences` has the two mechanically-split sentences", refined?.refined?.sentences?.length === 2);
	check("`refined.sections` (via echo.parse_sections/sections_with_ids) has one section, two cited items",
		refined?.refined?.sections?.length === 1 && refined.refined.sections[0].items[0].cites.length === 2);

	fs.rmSync(tmp, { recursive: true, force: true });
}

// ---- Case 2: a short fragment ("Hello.") never calls the model (review finding 5) --------
{
	let calls = 0;
	const stub_call = async () => { calls++; return { answer: "", cost_usd: 1 }; };   // would be very obviously wrong if called
	const { sessions, tmp } = make_sessions(stub_call);
	const s = { id: "test-session", file: `/__test__/${path.basename(tmp)}/session.jsonl` };

	await sessions.refine(s, { at: now_ms(), text: "Hello." });
	await sessions.refine(s, { at: now_ms(), text: "Can you hear me?" });

	check("\"Hello.\" (1 sentence, 1 word) makes no model call", calls === 0);
	check("\"Can you hear me?\" (1 sentence, 4 words) makes no model call", calls === 0);
	check("no `refined` line was written for either short line", read_lines(sessions, s).filter(l => l.refined).length === 0);
	check("worth_refining() itself says no to both", !worth_refining({ text: "Hello." }) && !worth_refining({ text: "Can you hear me?" }));

	fs.rmSync(tmp, { recursive: true, force: true });
}

// ---- Case 3: `floor: "speaking"` is skipped even when long enough (review finding 5) -----
{
	let calls = 0;
	const stub_call = async () => { calls++; return { answer: "", cost_usd: 1 }; };
	const { sessions, tmp } = make_sessions(stub_call);
	const s = { id: "test-session", file: `/__test__/${path.basename(tmp)}/session.jsonl` };
	const line = { at: now_ms(), text: "This sentence alone is more than fifteen words long, on purpose, to prove length is not enough.", floor: "speaking" };

	check("worth_refining() says no while the owner is still speaking, even past the length bar", !worth_refining(line));
	await sessions.refine(s, line);
	check("a `floor: \"speaking\"` line makes no model call, however long", calls === 0);

	fs.rmSync(tmp, { recursive: true, force: true });
}

// ---- Case 4: a long single sentence (>= 15 words, 1 sentence) still qualifies ------------
check("worth_refining(): 15+ words, only 1 sentence, is still worth it",
	worth_refining({ text: "This single sentence has more than fifteen words in it without any period anywhere at all here" }));

const failed = results.filter(([, ok]) => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
