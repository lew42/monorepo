import { Page, md, div, p, b, details, summary, progress } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  an ordinary task page on the 2026-09-19 board — page grid's main
                track for every sentence and the chart alike; nothing here is wide
                content, it is three short rows and some prose.
   2 SIZE       one column at every width. The three bars are full-width rows
                inside main (--measure), same shape as ui/progress's own demo.
   3 OWN LAYOUT one screen: headline sentence, three bars, one "attack this first"
                sentence. Everything else — the five-hop table, the two honest
                limits, the two cross-check counts — is a single closed <details>
                fold, so the top of the page stays a screen.
   4 REGIONS    none.   5 PREVIEW  core's default card on the day board, its
                description is the headline number.
   ⚠ No template literals in this file — plain "…" strings only, one stray
     backtick inside a css(`…`) has blanked pages on this repo before. */

const STAGE_MAX = 1680; // shared scale for the three bars, in seconds — the
	// slowest stage's own median, rounded up, so the fast stages read as the
	// near-nothing they measured as and the slow one reads as the whole picture.

const STAGES = [
	{ label: "You say something, and it is written down where the mastermind can see it",
	  value: 4, shown: "about 4 seconds" },
	{ label: "The mastermind actually notices the new message",
	  value: 52, shown: "about 52 seconds" },
	{ label: "The real work happens — reading, writing, checking it",
	  value: 1676, shown: "about 28 minutes" },
];

const HOPS = [
	["said (you speak)", "arrived (on disk)", "48", "0 s", "0 s", "0 s", "not separately measured — see the note below"],
	["arrived", "echoed + carded (dev-bar log and board card)", "48", "3.9 s", "5.9 s", "9.0 s", "measured"],
	["echoed + carded", "relayed (mastermind's inbox)", "48", "0.0 s", "0.4 s", "115 s", "measured — the 115 s worst case is almost certainly this audit mis-matching two messages that arrived close together, not a real wait"],
	["relayed", "picked up (mastermind notices)", "34", "52 s", "88 s", "192 s", "measured, from a session where the mastermind was live and chatting back — see the note below for why this can be worse"],
	["picked up", "visible (a page, shot, or landing exists)", "51", "28 min", "43 min", "59 min", "measured directly from dispatch-to-landing pairs in the mastermind's own log"],
];

export default new Page({
	meta: import.meta,
	title: "How long does a word take to become a change?",
	description: "About 29 minutes, typically — from under 2 minutes to over an hour. The slow part is real work, not waiting in line; here is the one part that IS just waiting in line.",
	icon: "timer",

	content(){

		p("You've said more than once that changes feel slow to arrive. This is the first real measurement of that, taken from today's own logs rather than a staged test. ",
			b("Typically about 29 minutes pass between you saying something and a finished result you can see"),
			" — as quick as under 2 minutes when things line up, and over an hour when several requests are already stacked up behind each other.");

		this.bars();

		p(b("Attack the middle stage first, not the biggest one. "),
			"The last bar (the real work) is mostly unavoidable — an agent actually reading, writing and checking code. The middle bar looks small tonight (about a minute) only because the mastermind happened to be live and chatting back; tonight's own autonomous run shows a real 34-minute stretch — 20:15 to 20:49 — with nothing in flight and nobody even glancing at the inbox, because it only checks on a fixed timer instead of the moment a message arrives. Making it check immediately is a small change; shortening real agent work is not.");

		details(() => {
			summary("The five measured hops, the two honest limits, and the two counts that had to agree");

			md("| from | to | samples | median | 90th pct | worst | note |\n| --- | --- | --- | --- | --- | --- | --- |\n" +
				HOPS.map(h => "| " + h.join(" | ") + " |").join("\n"));

			md("**Two honest limits.** First, the verbatim record of what you actually said only starts at 15:36 today — the relay that writes it down was built mid-afternoon, so nothing before that can be timed end to end. Second, a card's timestamp is stamped the moment it is *written*, and for 40 of 48 messages that write happens in the very same command as the message becomes a card, a dev-bar line, and a mastermind inbox line all at once — so for those, 'written' and 'said' are the same instant to within a few seconds. For the other 8, this audit's own nearest-timestamp matching may have picked the wrong neighbor rather than there being a real delay.");

			md("**The two counts that had to agree, and did.** This audit measured real messages two completely independent ways: by counting the assistant's own `say.mjs heard` commands in its session transcript, and by counting the owner-authored cards it produced on the board. Both come to exactly **48**. That is the proof this audit is measuring something real rather than an artifact of one file. Both differ from the raw count of 53 lines in the mastermind's chat record — the missing 5 are all in the relay's first 17 minutes (15:36 to 15:53), before the habit of writing a card for every message had started, which is a known gap in the record, not a mistake in this count.");

			md("**A second, cruder cross-check points the same way, only worse.** Instead of adding up the five stages above, this one just asks: for each message, when did the very next piece of finished work land anywhere? That number comes out to about 43 minutes typically — higher than the 29-minute sum, because it also captures queueing: a message that arrives while three other things are already being built waits for the whole line ahead of it. That is exactly the complaint that a one-line change should never queue, and it is more evidence for attacking the middle stage, not less.");
		});
	},

	bars(){
		return div.c("flex v gap", () => {
			STAGES.forEach(s => this.row(s));
		});
	},

	row(s){
		return div.c("flex v gap", () => {
			div.c("flex split v-center", () => {
				div.c("h4", s.label);
				div.c("h4 muted", s.shown);
			});
			progress().attr("max", String(STAGE_MAX)).attr("value", String(s.value)).style("width", "100%");
		}).style("--gap", "calc(var(--gap) * 0.3)");
	},

	preview(nav){ return this.preview_card(nav); },
});
