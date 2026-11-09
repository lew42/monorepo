// Turns results.json (the Sonnet worker) + the mastermind's overrides into /live/audit/ cards.
// Usage: node cards.mjs > cards.json, then node .claude/hooks/append.mjs public/live/audit/page.jsonl cards.json
import fs from "node:fs";
const here = new URL(".", import.meta.url);
const r = JSON.parse(fs.readFileSync(new URL("results.json", here)));
const e = JSON.parse(fs.readFileSync(new URL("evidence.json", here)));
// Where the mastermind's judgment differs from the worker's (the worker's verdict stays in results.json).
const judge = {
	7: { verdict: "done", why: "the readme-page work it waits on is on compliance/dev (d93d988d3, 10-24); nothing left to merge" },
	17: { verdict: "duplicate", of: 18, why: "an agent's whole session, listed because its one subtask (item 18) waits" },
	19: { verdict: "duplicate", of: 1, why: "an agent's whole session, listed because its subtasks wait (items 1 and 3)" },
};
const names = {
	1: "One refiner plan: your yes or changes", 2: "Same ask: one refiner plan (the agent that handed it down)",
	3: "Mentions plan: your yes or changes", 4: "Item tool plan: your yes or changes", 5: "Same ask: item tool plan (the agent that wrote it)",
	6: "LivePage into Page plan: your yes or changes", 7: "Process run 1: merge the readme page", 8: "Same ask: merge the readme page",
	9: "Chat proposal (10-25): your okay", 10: "Same ask: chat proposal", 11: "Same ask: chat proposal",
	12: "Chat proposal, its 'tasks get done' step", 13: "Chat proposal, its 'polish' step", 14: "Chat proposal, its 'one session, one view' step",
	15: "List: should add() link instead of move?", 16: "The live-page agent's whole session", 17: "The resources agent's whole session",
	18: "Crash dumps for node: one admin command", 19: "The session-truth agent's whole session", 20: "The page-design agent's whole session",
};
const icon = { "still waiting": "❓", duplicate: "🔁", stale: "💤", done: "✅" };
const ts = new Date().toISOString(), by = "mastermind-session-truth";
const final = r.map(x => ({ ...x, ...(judge[x.n] ? { verdict: judge[x.n].verdict, judged: judge[x.n].why, worker_verdict: x.verdict } : {}) }));
const tally = final.reduce((a, x) => (a[x.verdict] = (a[x.verdict] || 0) + 1, a), {});
const add = item => ({ content: { add: item }, by, ts });
const lines = [
	add({ id: "tip", type: "part-text", text: `**Of the newest 20 items "waiting on you", only 6 are real questions.** The other 14 are copies of those 6, or old waits whose work already landed. Nothing was closed or moved: every verdict below is a proposal for you. (85 items wait in all; this is the first slice, newest first.)` }),
	add({ id: "tally", type: "part-card", title: "📊 Tally: 6 real questions out of 20", text: `❓ still waiting: ${tally["still waiting"] || 0} · 🔁 duplicate: ${tally.duplicate || 0} · 💤 stale: ${tally.stale || 0} · ✅ done: ${tally.done || 0}\n\nThe 6 questions, in one line each:\n${final.filter(x => x.verdict === "still waiting").map(x => `- ${x.question}`).join("\n")}\n\nHow it was judged: a Sonnet worker ($1.31) read each item's log and the repo as it is today; the mastermind judged items 1–5 on its own first and agreed on all 5, then changed 3 of the other labels (items 7, 17, 19). Raw: [results.json](/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/audit-waiting/results.json), [calibration.json](/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/audit-waiting/calibration.json).` }),
	add({ id: "why", type: "part-card", title: "🔧 Why the list is 3× too long (the system fix)", text: `Three ways one question shows up several times:\n\n1. **A plan handed down waits twice:** once on the agent that wrote it, once on the agent that handed it down (items 1 and 2, 4 and 5, 6 and 16).\n2. **An agent's whole session shows as waiting** whenever one of its tasks waits (items 16, 17, 19, 20).\n3. **One task is listed twice:** at its own folder and again at its parent's folder (items 9–11 repeat 12–14).\n\nAnd one wait outlives its answer: a merge step still "waits" 17 days after its work landed (items 7, 8).\n\nThe fix belongs in the "waiting" list's code, not in closing items by hand: count a wait once, at the task that holds it.` }),
	add({ id: "h-items", type: "part-heading", text: "The 20 items, newest first" }),
	...final.map(x => add({ id: `i${x.n}`, type: "part-card", title: `${icon[x.verdict]} ${x.n}. ${names[x.n]}`,
		text: [`**${x.verdict}**${x.verdict === "duplicate" && judge[x.n]?.of ? ` of item ${judge[x.n].of}` : ""}${x.question ? `: ${x.question}` : ""}`, "",
			`**Asked:** ${x.asked}`, `**Built:** ${x.built}`, `**Still true?** ${x.judged ? `${x.judged} (the worker said ${x.worker_verdict}: ${x.still_true})` : x.still_true}`,
			`**Confidence:** ${x.confidence} · [the record](${e[x.n - 1].url})`].join("\n") })),
];
fs.writeFileSync(new URL("final.json", here), JSON.stringify(final, null, 1));
console.log(JSON.stringify(lines));
