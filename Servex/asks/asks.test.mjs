// Servex/asks/asks.test.mjs — run with `node Servex/asks/asks.test.mjs`.
// No test runner, no mocking library: plain checks, a temp file per test so
// nothing here ever touches the real public/framework/ai/asks.jsonl. Prints
// pass/fail and exits non-zero on any failure.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Asks from "./Asks.js";
import { fold_asks, ask_id } from "../../public/framework/ai/asks/fold.js";
import { stalled } from "./stalled.js";

let pass = 0, fail = 0;
function check(name, cond){
	if (cond){ pass++; console.log(`ok - ${name}`); }
	else { fail++; console.error(`FAIL - ${name}`); }
}

function tmpfile(){
	return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "asks-test-")), "asks.jsonl");
}

/* The 16 real lines in public/framework/ai/asks.jsonl as of 2026-09-30, the
 * ledger's own vocabulary (a route line per ask) — embedded rather than read
 * off disk, so this test proves the FOLD, not today's live file (which keeps
 * growing and lives outside this worktree's checkout). */
const SIXTEEN = [
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Memory: dormant idle agents, working cap, auto-compaction", words: ".claude/prompts/2026-09-30.jsonl", owner: "task-mastermind-dormant-idle", card: "2026/09/30/servex-idle-agents-go-dormant-working-ca", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "AI 2: Inbox default, Log tab, heartbeats out, tabs left", words: "ai/2026-09-30/page-audit/owner-words.md", owner: "minion-ai2-rescue-merge", card: "2026/09/29/inbox-rows-are-the-real-pages-page-class", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "AI 2: importance score 1–100 on Needs you, ranked", words: ".claude/prompts/2026-09-30.jsonl", owner: "mastermind-servex-9", card: "2026/09/29/inbox-rows-are-the-real-pages-page-class", status: "routed" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Page: audit of every layout, priority pages, reuse by default", words: "ai/2026-09-30/page-audit/owner-words.md", owner: "mastermind-page", card: "", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Review: one review skill, system questions, screenshots at 4 widths", words: "ai/2026-09-30/page-audit/owner-words.md", owner: "task-mastermind-review", card: "", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Icons: frames, buttons, rails, icon items aligned", words: "ai/2026-09-30/icon-system/owner-words.md", owner: "task-mastermind-icon-system", card: "2026/09/30/icon-system-frames-buttons-rails-icon-it", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Dictation: one configurable widget everywhere; widget first on the page", words: "ai/2026-09-30/audio-consolidate/requirements.md", owner: "task-mastermind-audio-consolidate", card: "2026/09/29/audio-a-library-of-audio-parts-transcrip", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Dictation: sheet shows the chat and mic; release the mic when hidden", words: ".claude/prompts/2026-09-30.jsonl", owner: "minion-sheet-regression", card: "2026/09/29/mobile-nav-back-an-ai-rail-at-the-bottom", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Chat: reactions, threaded replies, assistant icons, M logo", words: "ai/2026-09-30/chat-reactions/requirements.md", owner: "minion-chat-reactions", card: "", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Page inbox for necessary agent coordination", words: ".claude/prompts/2026-09-30.jsonl", owner: "task-mastermind-page-inbox", card: "", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Mentions: @Page becomes an icon link everywhere", words: "ai/2026-09-30/mentions/owner-words.md", owner: "task-mastermind-mentions", card: "2026/09/30/mentions-page-becomes-an-icon-link-every", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Audio: six tools become three, one live demo", words: "ai/2026-09-30/audio-consolidate/requirements.md", owner: "task-mastermind-audio-consolidate", card: "2026/09/29/audio-a-library-of-audio-parts-transcrip", status: "building" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Asks ledger with stall detection", words: ".claude/prompts/2026-09-30.jsonl", owner: "mastermind-servex-9", card: "", status: "routed" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "Agents never take over the owner's tabs", words: ".claude/prompts/2026-09-30.jsonl", owner: "mastermind-servex-8", card: "", status: "landed" } },
	{ ask: { at: "2026-09-30T13:47:28-05:00", title: "AI 2 tab leak: pollers pause while hidden", words: ".claude/prompts/2026-09-30.jsonl", owner: "minion-ai2-soak", card: "", status: "landed" } },
	{ ask: { at: "2026-09-30T13:48:06-05:00", title: "Servex docs: the agent system as flowcharts", words: "ai/2026-09-30/servex-docs/requirements.md", owner: "task-mastermind-servex-docs", card: "", status: "routed" } }
];

function test_fold(){
	const folded = fold_asks(SIXTEEN);
	check("16 real lines fold to 16 asks", Object.keys(folded).length === 16);
	check("every folded ask keeps its route fields", Object.values(folded).every(a => a.title && a.owner !== undefined && a.status));
	check("each history is one entry (one line each)", Object.values(folded).every(a => a.history.length === 1));
	check("no status_at yet (no update line seen)", Object.values(folded).every(a => a.status_at === undefined));

	// a status update line merges over, `at` stays the ROUTE time, `status_at` becomes the update's
	const id = ask_id(SIXTEEN[0].ask);
	const updated = fold_asks([...SIXTEEN, { ask: { id, status: "stalled", why: "quiet", by: "servex-asks-tick", at: "2026-09-30T20:00:00-05:00" } }]);
	check("a later line overwrites status", updated[id].status === "stalled");
	check("a later line's `at` becomes status_at, not `at`", updated[id].at === "2026-09-30T13:47:28-05:00" && updated[id].status_at === "2026-09-30T20:00:00-05:00");
	check("history now has 2 entries", updated[id].history.length === 2);
}

function test_stalled_rules(){
	const now = Date.parse("2026-09-30T18:00:00-05:00");
	const open_ask = { status: "building", owner: "agent-x" };

	check("landed ask is never stalled", stalled({ status: "landed" }, null, now).stalled === false);
	check("dropped ask is never stalled", stalled({ status: "dropped" }, null, now).stalled === false);
	check("stopped -> stalled", stalled(open_ask, { state: "stopped" }, now).stalled === true);
	check("gone -> stalled", stalled(open_ask, { state: "gone" }, now).stalled === true);
	check("missing row -> stalled", stalled(open_ask, null, now).stalled === true);
	check("dormant + nothing queued -> stalled", stalled(open_ask, { state: "dormant", queued: 0 }, now).stalled === true);
	check("dormant + something queued -> not stalled", stalled(open_ask, { state: "dormant", queued: 2 }, now).stalled === false);

	const quiet_1h = { state: "idle", last_at: new Date(now - 60 * 60000).toISOString() };
	check("silent 1h -> not stalled", stalled(open_ask, quiet_1h, now).stalled === false);

	const quiet_2h1m = { state: "idle", last_at: new Date(now - (2 * 60 + 1) * 60000).toISOString() };
	check("silent 2h1m -> stalled", stalled(open_ask, quiet_2h1m, now).stalled === true);

	// a task.jsonl line more recent than the agent's own last turn still counts as "seen"
	const task_line_recent = { state: "idle", last_at: new Date(now - (2 * 60 + 30) * 60000).toISOString(), last_task_line_at: new Date(now - 10 * 60000).toISOString() };
	check("recent task.jsonl line counts as seen, not stalled", stalled(open_ask, task_line_recent, now).stalled === false);
}

async function test_mark_once_and_speak_again(){
	const file = tmpfile();
	const id = ask_id({ title: "Test ask for the tick" });
	fs.writeFileSync(file, JSON.stringify({ ask: { at: "2026-09-30T10:00:00-05:00", title: "Test ask for the tick", owner: "agent-x", status: "building" } }) + "\n");

	const asks = new Asks({ file });   // no `servex` yet: initialize() must not start ticking on its own
	const dead_row = { id: "agent-x", state: "stopped" };
	asks.servex = { agents: { registry_list: () => [dead_row], live: new Map() } };

	await asks.tick();
	await asks.tick();
	let folded = await asks.read();
	check("mark-once: exactly one stalled line after two ticks", folded[id].history.filter(h => h.status === "stalled").length === 1);
	check("folded status reads stalled", folded[id].status === "stalled");

	const live_row = { id: "agent-x", state: "idle", last_at: new Date().toISOString() };
	asks.servex = { agents: { registry_list: () => [live_row], live: new Map() } };
	await asks.tick();
	await asks.tick();   // a second tick while still active must not append a second "building" line
	folded = await asks.read();
	check("speak-again clears the ask back to building", folded[id].status === "building");
	// history so far: the route line (status "building"), the stall mark, and the one
	// re-activation mark — a 4th line here would mean the second live tick re-marked it.
	check("clearing to building appends exactly once", folded[id].history.length === 3);
	check("the re-activation mark says why", folded[id].history.at(-1).why === "owner agent active again");

	asks.stop();
	fs.rmSync(path.dirname(file), { recursive: true, force: true });
}

async function test_mark_refuses_bad_input(){
	const file = tmpfile();
	const id = ask_id({ title: "Refuse me" });
	fs.writeFileSync(file, JSON.stringify({ ask: { at: "2026-09-30T10:00:00-05:00", title: "Refuse me", owner: "agent-y", status: "routed" } }) + "\n");
	const asks = new Asks({ file });

	const bad_status = await asks.mark(id, "not-a-real-status", "why", "by");
	check("mark refuses an unknown status", bad_status.ok === false);

	const bad_id = await asks.mark("no-such-ask", "building", "why", "by");
	check("mark refuses an unknown id", bad_id.ok === false);

	const ok = await asks.mark(id, "building", "started", "agent-y");
	check("mark accepts a known id and status", ok.ok === true);

	fs.rmSync(path.dirname(file), { recursive: true, force: true });
}

await test_fold();
test_stalled_rules();
await test_mark_once_and_speak_again();
await test_mark_refuses_bad_input();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
