// Slice 3 of the "waiting on you" audit: results.json (the Sonnet worker) + the mastermind's overrides
// → cards i41–i60 on /live/audit/, and new text for the description, tip, tally and why cards (all three slices counted).
// Usage: node cards.mjs > cards.json, then node .claude/hooks/append.mjs public/live/audit/page.jsonl cards.json
import fs from "node:fs";
const here = new URL(".", import.meta.url);
const read = f => JSON.parse(fs.readFileSync(new URL(f, here)));
const r = read("results.json"), e = read("evidence.json"), done = [...read("../final.json"), ...read("../slice2/final.json")];
// Where the mastermind's judgment differs from the worker's (the worker's verdict stays in results.json).
const judge = {
	59: { verdict: "stale", confidence: "high", why: "the stash it asked to drop is already gone: the stash reflog holds 55 entries today and the oldest is from 2026-09-29, after the 09-19 reset" },
	60: { verdict: "stale", confidence: "medium", why: "the login was only a means to a D1 database that nothing on the priority list needs; Cloudflare access already runs on a stored token (the named tunnel), so an agent that needs D1 later can ask then" },
};
const names = {
	41: "Budget pause (10-15): the loose-ends helper", 42: "Budget pause (10-13): the live instance tree",
	43: "A test card: \"Repro question card\"", 44: "Cost gate (10-05): the OpenRouter agent trial",
	45: "Budget pause (10-05): Dictate, one engine", 46: "Budget pause (10-04): VS Code session cost",
	47: "Budget pause (10-04): day cards", 48: "Cost gate (10-04): web benchmarks",
	49: "Budget pause (10-04): landing two branches", 50: "Budget pause (10-04): the local brain",
	51: "Budget pause (10-03): one dictation chat", 52: "Who reviews the stuck worktree qf-6?",
	53: "Remote access: a Cloudflare login", 54: "A mic check: \"Can you hear me?\"",
	55: "Commit the live system code now?", 56: "Add a git-safety hook?",
	57: "Add the tab rule to CLAUDE.md?", 58: "Authorize the Gmail connector?",
	59: "Drop the old git stash?", 60: "Log in to Cloudflare for a D1 database?",
};
const icon = { "still waiting": "❓", duplicate: "🔁", stale: "💤", done: "✅" };
const ts = new Date().toISOString(), by = "mastermind-session-truth";
const final = r.map(x => ({ ...x, ...(judge[x.n] ? { verdict: judge[x.n].verdict, confidence: judge[x.n].confidence,
	judged: judge[x.n].why, worker_verdict: x.verdict } : {}) }));
const all = [...done, ...final];
const count = list => list.reduce((a, x) => (a[x.verdict] = (a[x.verdict] || 0) + 1, a), {});
const t = count(all);
const line = c => `❓ still waiting: ${c["still waiting"] || 0} · 🔁 duplicate: ${c.duplicate || 0} · 💤 stale: ${c.stale || 0} · ✅ done: ${c.done || 0}`;
const raw = "/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/audit-waiting";
const set = (id, fields) => ({ [id]: fields, by, ts });
const add = (item, after) => ({ content: { add: item, ...(after ? { after } : {}) }, by, ts });
const lines = [
	{ description: "The newest 60 'waiting on you' items, each with a proposed verdict. Nothing was closed or moved.", by, ts },
	set("tip", { text: `**Of the newest 60 items "waiting on you", only ${t["still waiting"]} are real questions.** The rest are copies of those questions, or old waits whose agent has ended or whose work already landed. Nothing was closed or moved: every verdict below is a proposal for you. (85 items wait in all; these are the first three slices, newest first.)` }),
	set("tally", { title: `📊 Tally: ${t["still waiting"]} real questions out of 60`, text: `${line(t)}\n\nItems 1–20: ${line(count(done.slice(0, 20)))}\nItems 21–40: ${line(count(done.slice(20)))}\nItems 41–60: ${line(count(final))}\n\nThe ${t["still waiting"]} questions, in one line each:\n${all.filter(x => x.verdict === "still waiting").map(x => `- ${x.question}`).join("\n")}\n\nHow it was judged: a Sonnet worker read each item's log and the repo as it is today ($1.31 for items 1–20, about $1 each for 21–40 and 41–60). The mastermind judged items 1–5 on its own first and agreed on all 5, spot-checked items 32, 35, 53 and 59 the same way and agreed on all 4, and changed 6 labels or reasons (items 7, 17, 19, 33, 59, 60). Raw: [items 1–20](${raw}/results.json), [items 21–40](${raw}/slice2/results.json), [items 41–60](${raw}/slice3/results.json), [calibration](${raw}/calibration.json), spot-checks [21–40](${raw}/slice2/spotcheck.json) and [41–60](${raw}/slice3/spotcheck.json).` }),
	set("why", { title: "🔧 Why the list is so long (the system fixes)", text: `Six ways one question, or no question, ends up "waiting on you":\n\n1. **A plan handed down waits twice:** once on the agent that wrote it, once on the agent that handed it down (items 1 and 2, 4 and 5, 6 and 16).\n2. **An agent's whole session shows as waiting** whenever one of its tasks waits (items 16, 17, 19, 20, 33).\n3. **One task is listed twice:** at its own folder and again at its parent's (items 9–11 repeat 12–14).\n4. **A daily check-in re-posts a wait as a new question card** each day, so one waiting voice call shows up four times (items 21–24 and 26–29).\n5. **A wait never ends when its agent does:** budget pauses and cost gates from 10-03 to 10-17 (items 35–42 and 44–51), voice calls that ended on 11-03 (28, 29), merges that landed 17 days ago (7, 8).\n6. **Any card left with an open reply box counts as a question,** even a mic check or a test card (items 43, 54), and a decision stays open after its work was built (items 55, 56).\n\nThe fix belongs in the "waiting" list's code, not in closing items by hand: count a wait once, at the task that holds it, drop it when its agent has ended, and count a card only when it asks something.` }),
	add({ id: "h-items3", type: "part-heading", text: "Items 41–60, newest first" }),
	...final.map(x => add({ id: `i${x.n}`, type: "part-card", title: `${icon[x.verdict]} ${x.n}. ${names[x.n]}`,
		text: [`**${x.verdict}**${x.verdict === "still waiting" && x.question ? `: ${x.question}` : ""}`, "",
			`**Asked:** ${x.asked}`, `**Built:** ${x.built}`, `**Still true?** ${x.judged ? `${x.judged} (the worker said ${x.worker_verdict}: ${x.still_true})` : x.still_true}`,
			`**Confidence:** ${x.confidence} · [the record](${e[x.n - 41].url || e[x.n - 41].dir?.replace(/^public/, "") + "/"})`].join("\n") })),
];
fs.writeFileSync(new URL("final.json", here), JSON.stringify(final, null, 1));
console.log(JSON.stringify(lines));
