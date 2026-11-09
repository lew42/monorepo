// Slice 2 of the "waiting on you" audit: results.json (the Sonnet worker) + the mastermind's overrides
// → cards i21–i40 on /live/audit/, and new text for the tip, tally and why cards (both slices counted).
// Usage: node cards.mjs > cards.json, then node .claude/hooks/append.mjs public/live/audit/page.jsonl cards.json
import fs from "node:fs";
const here = new URL(".", import.meta.url);
const read = f => JSON.parse(fs.readFileSync(new URL(f, here)));
const r = read("results.json"), e = read("evidence.json"), s1 = read("../final.json");
// Where the mastermind's judgment differs from the worker's (the worker's verdict stays in results.json).
const judge = {
	33: { verdict: "duplicate", of: 32, why: "an agent's whole session, listed because its one open subtask (item 32) waits; same rule as items 17 and 19" },
};
// Which item a duplicate repeats (the worker named them in its text; kept here so the card can say it).
const of = { 21: 29, 23: 29, 26: 29, 22: 28, 24: 28, 27: 28, 33: 32 };
const names = {
	21: "Re-post (11-03): the 17:10 voice call is waiting", 22: "Re-post (11-03): the 17:08 voice call is waiting",
	23: "Re-post (11-02): the 17:10 voice call", 24: "Re-post (11-02): the 17:08 voice call",
	25: "Dictation v3: a session that already wrapped up", 26: "Re-post (11-01): the 17:10 voice call",
	27: "Re-post (11-01): the 17:08 voice call", 28: "Voice call 17:08 (11-01): waits for your next question",
	29: "Voice call 17:10 (11-01): waits for your next question", 30: "A voice session's helper (10-25): a doc review left idle",
	31: "Dictation: Debug tab, stalls, flicker", 32: "Page class: trim Page.class.js toward 250 lines?",
	33: "The page agent's whole session", 34: "Review page (the deputy's minion)",
	35: "Budget pause (10-17): the layout check helper", 36: "Budget pause (10-17): the readme trim helper",
	37: "Budget pause (10-17): the sheet double-mount helper", 38: "Budget pause (10-17): the sheet hand-off helper",
	39: "Budget pause (10-17): the wide dictation helper", 40: "Budget pause (10-17): the past-work pilot helper",
};
// The mastermind's wording of the one question (the worker's offered "or left as it is", and step 2b needs no yes).
const question = { 32: "Trim Page.class.js from 755 lines toward 250 by moving Page's callers onto its helpers directly (step 3, about $6–8, touches many files)?" };
const icon = { "still waiting": "❓", duplicate: "🔁", stale: "💤", done: "✅" };
const ts = new Date().toISOString(), by = "mastermind-session-truth";
const final = r.map(x => ({ ...x, ...(question[x.n] ? { question: question[x.n] } : {}),
	...(judge[x.n] ? { verdict: judge[x.n].verdict, judged: judge[x.n].why, worker_verdict: x.verdict } : {}) }));
const all = [...s1, ...final];
const count = list => list.reduce((a, x) => (a[x.verdict] = (a[x.verdict] || 0) + 1, a), {});
const t = count(all), t2 = count(final);
const line = c => `❓ still waiting: ${c["still waiting"] || 0} · 🔁 duplicate: ${c.duplicate || 0} · 💤 stale: ${c.stale || 0} · ✅ done: ${c.done || 0}`;
const raw = "/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/audit-waiting";
const set = (id, fields) => ({ [id]: fields, by, ts });
const add = (item, after) => ({ content: { add: item, ...(after ? { after } : {}) }, by, ts });
const lines = [
	{ description: "The newest 40 'waiting on you' items, each with a proposed verdict. Nothing was closed or moved.", by, ts },
	set("tip", { text: `**Of the newest 40 items "waiting on you", only ${t["still waiting"]} are real questions.** The rest are copies of those questions, or old waits whose agent has ended or whose work already landed. Nothing was closed or moved: every verdict below is a proposal for you. (85 items wait in all; these are the first two slices, newest first.)` }),
	set("tally", { title: `📊 Tally: ${t["still waiting"]} real questions out of 40`, text: `${line(t)}\n\nItems 1–20: ${line(count(s1))}\nItems 21–40: ${line(t2)}\n\nThe ${t["still waiting"]} questions, in one line each:\n${all.filter(x => x.verdict === "still waiting").map(x => `- ${x.question}`).join("\n")}\n\nHow it was judged: a Sonnet worker read each item's log and the repo as it is today ($1.31 for items 1–20, about $1 for 21–40). The mastermind judged items 1–5 on its own first and agreed on all 5, spot-checked items 32 and 35 the same way and agreed on both, and changed 4 labels (items 7, 17, 19, 33). Raw: [items 1–20](${raw}/results.json), [items 21–40](${raw}/slice2/results.json), [calibration](${raw}/calibration.json), [spot-check](${raw}/slice2/spotcheck.json).` }),
	set("why", { title: "🔧 Why the list is so long (the system fixes)", text: `Five ways one question, or no question, ends up "waiting on you":\n\n1. **A plan handed down waits twice:** once on the agent that wrote it, once on the agent that handed it down (items 1 and 2, 4 and 5, 6 and 16).\n2. **An agent's whole session shows as waiting** whenever one of its tasks waits (items 16, 17, 19, 20, 33).\n3. **One task is listed twice:** at its own folder and again at its parent's (items 9–11 repeat 12–14).\n4. **A daily check-in re-posts a wait as a new question card** each day, so one waiting voice call shows up four times (items 21–24 and 26–29).\n5. **A wait never ends when its agent does:** budget pauses from 10-17 (items 35–40), voice calls that ended on 11-03 (28, 29), merges that landed 17 days ago (7, 8).\n\nThe fix belongs in the "waiting" list's code, not in closing items by hand: count a wait once, at the task that holds it, and drop it when its agent has ended.` }),
	set("h-items", { text: "Items 1–20, newest first" }),
	add({ id: "h-items2", type: "part-heading", text: "Items 21–40, newest first" }),
	...final.map(x => add({ id: `i${x.n}`, type: "part-card", title: `${icon[x.verdict]} ${x.n}. ${names[x.n]}`,
		text: [`**${x.verdict}**${x.verdict === "duplicate" && of[x.n] ? ` of item ${of[x.n]}` : ""}${x.question ? `: ${x.question}` : ""}`, "",
			`**Asked:** ${x.asked}`, `**Built:** ${x.built}`, `**Still true?** ${x.judged ? `${x.judged} (the worker said ${x.worker_verdict}: ${x.still_true})` : x.still_true}`,
			`**Confidence:** ${x.confidence} · [the record](${e[x.n - 21].url || e[x.n - 21].dir?.replace(/^public/, "") + "/"})`].join("\n") })),
];
fs.writeFileSync(new URL("final.json", here), JSON.stringify(final, null, 1));
console.log(JSON.stringify(lines));
