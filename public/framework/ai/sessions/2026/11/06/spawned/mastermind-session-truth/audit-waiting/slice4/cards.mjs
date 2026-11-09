// Slice 4, the last, of the "waiting on you" audit: results.json (the Sonnet worker) + the mastermind's overrides
// → cards i61–i85 on /live/audit/, a summary card at the top (the real questions, deduplicated, one line each),
// and new text for the description, tip, tally and why cards (all 85 items counted).
// Usage: node cards.mjs > cards.json, then node .claude/hooks/append.mjs public/live/audit/page.jsonl cards.json
import fs from "node:fs";
const here = new URL(".", import.meta.url);
const read = f => JSON.parse(fs.readFileSync(new URL(f, here)));
const r = read("results.json"), e = read("evidence.json");
const done = [...read("../final.json"), ...read("../slice2/final.json"), ...read("../slice3/final.json")];
// Where the mastermind's judgment differs from the worker's (the worker's verdict stays in results.json).
const judge = {
	85: { verdict: "stale", confidence: "medium", why: "it is the owner's own ask, filed by the prompt filer as a proposal waiting for an approve; the filer stopped doing that on 2026-10-24 (core/Session/doc/prompt-tasks.md), but the old proposals were never moved to open. The goal it names is now session.completion_score() and /live/truth/" },
};
const names = {
	61: "Delete the 739 dead files?", 62: "A card: commit the dictation playground",
	63: "A card: demo of JSONL pages with code", 64: "A card: explain the JSONL page format",
	65: "A card: where we landed on pages and markdown", 66: "A card: the chat demo",
	67: "A card: session lifetime and relay to the master assistant", 68: "A card: chat as a right-hand column",
	69: "A card: two screenshot links with no image", 70: "A card: why is this card full width?",
	71: "Resume 5 stalled tasks (09-28)?", 72: "The Now card (09-25): what first?",
	73: "The Now card (09-25): what to build next?", 74: "Who runs operations?",
	75: "Split the cards rail by content?", 76: "A label for the 'more' fold?",
	77: "Refinement in a VS Code tab while dictating", 78: "Loosen the 1-to-3 main asks wording",
	79: "Refinement covers every sentence", 80: "A chat view of refined prompts per session",
	81: "\"Look into it.\" (no subject)", 82: "One subscription system everywhere",
	83: "Tail terms stay flexible (a note)", 84: "The data structure for tasks on prompts",
	85: "Get this session to 100%",
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
const me = "/framework/ai/sessions/2026/11/06/spawned/mastermind-session-truth/";
// The real questions, deduplicated by hand (items 6 and 32 are one decision; t11 and t12 were missing from the list).
const questions = [
	["Fold LivePage into Page? A yes also answers the Page.class.js trim (items 6 and 32, one decision).", "/live/plan/fold/"],
	["One prompt refiner, on Sonnet, in ext/Refine: yes or changes? (item 1)", "/live/plan/one-refiner/"],
	["The mentions plan (three steps, about $9): yes or changes? (item 3)", "/live/plan/mentions/"],
	["One item tool with three verbs (get, set, call), in eight merges: yes or changes? (item 4)", "/live/plan/item-tool/"],
	["Adding an item another list already owns: link it as a Ref instead of moving it? (item 15)", "/framework/ai/sessions/2026/10/20/session-e00f55c9/chat-model/"],
	["Run the crash-dump command as admin once, about 2 minutes? (item 18)", "/framework/ai/sessions/2026/11/06/spawned/mastermind-resources/servex-turn-on-windows-crash-dumps-for-n/"],
	["Authorize the Gmail connector in your claude.ai connector settings? (item 58)", "/framework/ai/sessions/2026/09/28/cards/authorize-the-gmail-connector/"],
	["Keep the 11-06 twins fold, or undo it (dry run first)? (was missing from the list)", me],
	["Switch SERVEX_OPEN_ITEMS on, so what stays open at a close is filed as a task? (was missing from the list)", me],
];
const set = (id, fields) => ({ [id]: fields, by, ts });
const add = (item, after) => ({ content: { add: after !== undefined ? { ...item, after } : item }, by, ts });   // List.add reads `after` from the item (null = first)
const lines = [
	{ description: "All 85 'waiting on you' items, each with a proposed verdict, and the 9 real questions at the top. Nothing was closed or moved.", by, ts },
	add({ id: "summary", type: "part-card", title: `❓ The ${questions.length} real questions`,
		text: `Out of 85 items "waiting on you", these are the only real questions, each asked once:\n\n${questions.map(([q, u], i) => `${i + 1}. [${q}](${u})`).join("\n")}\n\nEverything else below is a copy of one of these, or an old wait whose work landed or whose agent ended.` }, null),
	set("tip", { text: `**Of all 85 items "waiting on you", only ${t["still waiting"]} are real questions** (${questions.length} once duplicates are merged and two missing ones are added; the card at the top lists them). The rest are copies of those questions, or old waits whose agent has ended or whose work already landed. Nothing was closed or moved: every verdict below is a proposal for you.` }),
	set("tally", { title: `📊 Tally: ${t["still waiting"]} real questions out of 85`, text: `${line(t)}\n\nItems 1–20: ${line(count(done.slice(0, 20)))}\nItems 21–40: ${line(count(done.slice(20, 40)))}\nItems 41–60: ${line(count(done.slice(40)))}\nItems 61–85: ${line(count(final))}\n\nHow it was judged: a Sonnet worker read each item's log and the repo as it is today (about $1–1.30 per slice, about $4.60 for all four). The mastermind judged items 1–5 on its own first and agreed on all 5, spot-checked items 32, 35, 53, 59, 61 and 85 the same way and agreed on all 6, and changed 7 labels or reasons (items 7, 17, 19, 33, 59, 60, 85). Raw: [items 1–20](${raw}/results.json), [21–40](${raw}/slice2/results.json), [41–60](${raw}/slice3/results.json), [61–85](${raw}/slice4/results.json), [calibration](${raw}/calibration.json), spot-checks [21–40](${raw}/slice2/spotcheck.json), [41–60](${raw}/slice3/spotcheck.json) and [61–85](${raw}/slice4/spotcheck.json).` }),
	set("why", { title: "🔧 Why the list is so long (the system fixes)", text: `Eight ways the "waiting on you" list goes wrong:\n\n1. **A plan handed down waits twice:** once on the agent that wrote it, once on the agent that handed it down (items 1 and 2, 4 and 5, 6 and 16).\n2. **An agent's whole session shows as waiting** whenever one of its tasks waits (items 16, 17, 19, 20, 33).\n3. **One task is listed twice:** at its own folder and again at its parent's (items 9–11 repeat 12–14).\n4. **A daily check-in re-posts a wait as a new question card** each day, so one waiting voice call shows up four times (items 21–24 and 26–29).\n5. **A wait never ends when its agent does:** budget pauses and cost gates from 10-03 to 10-17 (items 35–42 and 44–51), voice calls that ended on 11-03 (28, 29), merges that landed 17 days ago (7, 8).\n6. **Any card left with an open reply box counts as a question,** even a mic check or a test card (items 43, 54, 62–70), and a decision stays open after its work was built (items 55, 56, 73, 74).\n7. **Old proposals were never moved:** before 10-24 each ask in a prompt was filed as a proposal waiting for your approve; new ones are filed open, but the old ones still wait (items 77–85).\n8. **The opposite way: some real questions are missing.** A wait written inside a new task's first line is stored as plain data and never starts, so two real questions (the twins fold and the SERVEX_OPEN_ITEMS switch) were not on the list until 11-09.\n\nThe fix belongs in the code, not in closing items by hand: count a wait once, at the task that holds it; drop it when its agent has ended; count a card only when it asks something; and make a wait in a task's first line really wait. Logged: [improvements](/framework/ai/improvements.jsonl).` }),
	add({ id: "h-items4", type: "part-heading", text: "Items 61–85, oldest" }),
	...final.map(x => add({ id: `i${x.n}`, type: "part-card", title: `${icon[x.verdict]} ${x.n}. ${names[x.n]}`,
		text: [`**${x.verdict}**${x.verdict === "still waiting" && x.question ? `: ${x.question}` : ""}`, "",
			`**Asked:** ${x.asked}`, `**Built:** ${x.built}`, `**Still true?** ${x.judged ? `${x.judged} (the worker said ${x.worker_verdict}: ${x.still_true})` : x.still_true}`,
			`**Confidence:** ${x.confidence} · [the record](${e[x.n - 61].url || e[x.n - 61].dir?.replace(/^public/, "") + "/"})`].join("\n") })),
];
fs.writeFileSync(new URL("final.json", here), JSON.stringify(final, null, 1));
console.log(JSON.stringify(lines));
