import { Page, p, h2, div, span, a, small, b } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; the two card walls claim wide.
   3 OWN LAYOUT takeaway line, then the three disagreements (biggest first),
                then the other eight as one compact list.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

// The three rows where this check disagrees with the earlier audit — shown
// first and biggest, because a disagreement you can prove is the whole
// point of a second look. Order: worst gap first.
const DISAGREE = [
	{
		id: "assistant-stream", was: "done", now: "differs",
		title: "Replies typing themselves out — built, but never actually used",
		body: "The code that streams a reply word by word is real, and it was proven working — but only on a private test server, against a throwaway file. The real log the owner reads has never once received a streamed reply: every real answer arrives as one whole, already-finished card, written by hand by the assistant, exactly the way it worked before this was built.",
		evidence: "0 streamed replies in the real log, out of 293 lines. Server/plugins/Assistant.js:64-105; ai/2026-09-19/assistant-stream/task.jsonl.",
		link: "/framework/ai/2026-09-19/assistant-stream/",
	},
	{
		id: "padding-audit", was: "done", now: "partly",
		title: "One padding rule for every card — built, but not the one card anyone complained about",
		body: "A proper 'card' style now exists and is well designed. But the team that built it says plainly, in its own words, that nothing on the real site wears it yet — and the exact log cards that started this whole complaint still use the OLD, different padding rule, not the new one.",
		evidence: "card-word/task.jsonl: \"nothing on the live site wears .card yet.\" Checked live: the dev bar's own cards still use var(--pad), not the new --pad-card.",
		link: "/framework/ai/2026-09-19/padding-audit/",
	},
	{
		id: "stream-with-block", was: "done", now: "partly",
		title: "\"Block should only stop reloads\" — half fixed",
		body: "The specific bug (the chat log going silent) is genuinely fixed, and it had nothing to do with Block, as claimed. But the owner's actual sentence was broader than that one bug: Block was also supposed to stop being a blanket switch. It still is one — ticking it also freezes normal CSS style updates, not just reloads, exactly as a much older internal note already warned and nobody acted on.",
		evidence: "Socket.js line 159 exits before ever reaching the CSS-update code three lines later.",
		link: "/framework/ai/2026-09-19/reload-hold/",
	},
];

// The other eight — a plain, compact list. Detail is in verify.jsonl and the
// task log, not here.
const AGREE = [
	["devbar-chat", "done", "The chat window is real: a live, tailed log with a place to type, plus a real browser of every past session and every minion's own transcript.", "/framework/ai/2026-09-19/devbar-chat/"],
	["devbar-path-bar", "done", "The word \"DEV\" is gone; a home icon and clickable path parts sit in its place, checked live in a real browser.", "/framework/ai/2026-09-19/devbar-chat/"],
	["verbatim-echo", "done", "Your exact words do land in the log before any answer — checked by matching one, character for character, against the known record. The fully automatic version (a hook, not a habit) is written but still not switched on.", "/framework/ai/2026-09-19/prompt-relay/"],
	["full-log", "done", "Thirteen different minions, plus the mastermind, the assistant and you, have all posted to the one shared log — proven by simply counting who actually wrote to it.", "/framework/ai/v/3/"],
	["devbar-questions", "done", "All four questions got a real, separate answer card, found live on the log.", "/framework/ai/v/3/"],
	["message-on-page", "done", "A one-off speed test from earlier — the record shows the message was written the same second it was asked for.", "/framework/ai/v/2/"],
	["log-voice", "not", "Nothing exists for this yet — no task was ever opened, and no code for live speech-to-log, saved audio, or a read-aloud button was found anywhere.", null],
	["keep-the-log-fresh", "partly", "The rule is genuinely written into the mastermind's own instructions, and the current run is keeping to it. Whether every future run keeps to it is a habit, not a guarantee — which is exactly what the earlier audit already said.", "/framework/ai/2026-09-19/day-audit/"],
];

const WORD = { done: "done", partly: "partly", differs: "differs", not: "not done" };
const COLOR = { done: "var(--ok, #2e7d32)", partly: "var(--warn, #b26a00)", differs: "var(--warn, #b26a00)", not: "var(--bad, #b3261e)" };

export default new Page({
	meta: import.meta,
	title: "Verify: the dev bar",
	description: "A second, harder look at 11 of today's 53 requests — the dev bar and the live log. Three were graded done and are not quite.",
	icon: "fact_check",

	content(){

		p(
			"This checks 11 of today's requests about the dev bar and the live log, the same 11 the earlier audit graded. ",
			"Eight hold up. ", b("Three were graded done and are only partly, or not really, what was asked for"),
			" — those three are below, first, with the exact proof."
		);

		h2("Where this disagrees with the earlier audit");
		this.wall(DISAGREE);

		h2("The other eight — checked, and they hold up");
		div.c("flow", () => {
			AGREE.forEach(([id, verdict, line, link]) => this.row(id, verdict, line, link));
		});

		p.c("muted", () => {
			span("Full evidence for every row — file and line, or the exact command run — is in ");
			a("verify.jsonl").href("verify.jsonl");
			span(" and this task's own log. Before 15:36 today there is no word-for-word record of what was asked, only the earlier audit's own memory of it — that gap did not change any verdict here, but it is why two of the earliest rows above lean on what was actually built rather than the exact wording.");
		});
	},

	wall(rows){
		return div.c("grid auto gap", () => {
			rows.forEach(r => this.card(r));
		}).style({ "--column": "20rem" }).ac("wide");
	},

	card(r){
		return div.c("surface pad flex v gap-25", () => {
			div.c("flex v-center gap-25", () => { b(r.title); });
			small.c("muted", "graded \"" + r.was + "\" earlier today — this check says " + r.now + ".");
			p(r.body);
			small.c("muted", r.evidence);
			if (r.link) a("see the task →").href(r.link);
		});
	},

	row(id, verdict, line, link){
		return div.c("flex gap-25", () => {
			b().style({ color: COLOR[verdict] }).text(WORD[verdict]);
			link ? a(line).href(link) : span(line);
		});
	},
});
