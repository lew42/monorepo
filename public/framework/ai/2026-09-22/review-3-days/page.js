import { Page, p, b, md, div, details, summary } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board. The three day cards are two-or-more
                columns of CONTENT, so they claim `wide`; everything after them
                is prose and stays in `main`.
   2 SIZE       the three cards must fit one 1280x800 screen together — that IS
                the deliverable ("say what three days produced in sixty
                seconds"), so every bullet is one short sentence and the
                explanation lives behind its link, one click down.
   3 OWN LAYOUT the wall is `grid gap` with auto-FIT (never auto-fill: three
                known items, and auto-fill reserves tracks for columns with
                nothing to put in them) and a 20rem floor — three columns from
                about 1100px up, one column on a phone. Each day is a `.card`,
                which carries its own padding by definition.
   4 REGIONS    one: the wall. 5 PREVIEW the default card.

   Every sentence was checked against the repo on 2026-09-22, not copied from
   the handover; what changed is in the "checked today" fold. */

const DAYS = [
	["Monday", "2026-09-21", "The AI page became the front door — and then had to be made worth opening.",
		"- `/framework/ai/` opens on V3, which now has four [ways out of it](/framework/ai/2026-09-21/v3-ways-out/).\n" +
		"- The timeline is one plain list — an ordinary update is a 16px line, not a four-block card. [What changed](/framework/ai/2026-09-21/live-select/)\n" +
		"- Three groups of controls [fold behind one **More** button](/framework/ai/2026-09-21/head-mobile/) on a phone.\n" +
		"- It [says so](/framework/ai/2026-09-21/front-door-today/) when it is showing Friday, not today.\n" +
		"- The page watcher had stopped checking anything while a batch of edits was held. [Fixed](/framework/ai/2026-09-21/safe-rollout/).\n" +
		"- 21 coding traps moved into the rulebook agents actually read. [The traps](/framework/ai/2026-09-21/traps-consolidate/)\n\n" +
		"**Left.** The watcher runs Saturday's rules until its supervisor is restarted once — item 1 below. Monday's workers could write files but could not run a single command, so several fixes went unproven."],

	["Sunday", "2026-09-20", "Friday night's destroyed work turned out to be a git stash, and all of it came back.",
		"- 1,008 files [restored](/framework/ai/2026-09-20/stash-restore/) by *reading* the stash, never applying it — which is why the stash survived.\n" +
		"- All nine design studies are back; three earlier passes had written them off as gone forever. [The near miss](/framework/ai/2026-09-20/studies-honest/)\n" +
		"- Padding returned to every card on the site — one missing block of spacing values had zeroed them all. [The cause](/framework/ai/2026-09-20/ai-padding/)\n" +
		"- Approve and Improve became findable: a card's own link had been redrawing the same wall. [The fix](/framework/ai/2026-09-20/approve-loop/)\n" +
		"- V3's pinned strip went from 80% of the left column to 17%. [Before and after](/framework/ai/2026-09-20/v3-axis-fix/)\n" +
		"- Dictation was never broken — [proven](/framework/ai/2026-09-20/dictate-fix/) through a real microphone.\n\n" +
		"**Left.** 22 files where the stash and the revert disagree still need your call; no agent deletes a file on its own say-so. [The list](/framework/ai/2026-09-20/stash-restore/)"],

	["Saturday", "2026-09-19", "Forty-seven tasks — the most in one day here — and it ended with the whole tree reverting.",
		"- [Whisper runs locally](/framework/ai/2026-09-19/whisper-local/) now, with grey partial text while you are still talking.\n" +
		"- A server change is [booted on a spare port](/framework/ai/2026-09-19/server-boot-test/) before the live one is swapped.\n" +
		"- A [reload hold](/framework/ai/2026-09-19/reload-hold/): one reload for a whole batch of edits instead of twenty.\n" +
		"- A [watcher](/framework/ai/2026-09-19/page-health/) opens the pages an edit could break and tells whoever broke them.\n" +
		"- Replies [type themselves out](/framework/ai/2026-09-19/assistant-stream/), word by word, in the dev bar's log.\n" +
		"- The [sidebar](/framework/ai/2026-09-19/sidebar-repair/) reads like a file tree again, and a [`card` word](/framework/ai/2026-09-19/card-word/) entered the design system.\n" +
		"- Of 53 things you asked for, 27 were done the way you said them. [The audit](/framework/ai/2026-09-19/day-audit/)\n\n" +
		"**What went wrong.** The site went down three times — the last a broken front-end import, which the new boot test does not cover. Then at 23:16 an accidental `git stash` reverted everything uncommitted, and nobody has identified what ran it."],
];

export default new Page({
	meta: import.meta,
	title: "The last three days",
	description: "What 2026-09-19, 09-20 and 09-21 produced — and the five things still waiting on you.",
	icon: "summarize",

	content(){
		p(b("Sixty-three pieces of work were started across three days and every one of them finished."),
			" Saturday built the machinery and then lost a day of it to an accident; Sunday got all of it " +
			"back; Monday made the AI page the front door. Five things still wait on you, below.");

		this.wall();

		/* The to-do and the dashboard verdict are short, independent blocks — two
		   columns of content, so they ride `wide` beside each other rather than
		   leaving 300px of grey down one side of a prose track. */
		div.c("grid gap", () => {

			div.c("flow", () => {
				md("## What still needs you");

				div.c("card flow", () => {
				md("1. **Restart one program — 30 seconds.** Stop the process id that " +
					"[`heartbeat.json`](/framework/ai/health/heartbeat.json) calls `supervisor_pid`, then run " +
					"`node Server/health-supervisor.mjs`. It has run untouched since Saturday, so the page " +
					"watcher is still using Saturday's rules.\n" +
					"2. **Paste one block into `.claude/settings.json` — 2 minutes.** It arms a safety net " +
					"that is written but switched off, and tells the assistant the moment you speak. " +
					"[The block](/framework/ai/2026-09-21/arm-the-hooks/settings-block.md)\n" +
					"3. **Decide what happens to the shelf.** The commit is done; `stash@{0}` is still " +
					"sitting there, and 22 files inside it disagree with what is on disk. " +
					"[The list](/framework/ai/2026-09-20/stash-restore/)\n" +
					"4. **Six of seven proposed changes to how agents work are unapplied** — including the " +
					"one script that would start, name and track every worker session. " +
					"[The seven](/framework/ai/2026-09-19/system-eval/)\n" +
					"5. **Three server-side fixes need one restart window.** Two plugins and a hook still " +
					"name the old location of the board file, which moved on Saturday.");
			});

			});

			div.c("flow", () => {
				md("## The dashboard itself");

				p("Opening ", b("/framework/ai/"), " today shows V3: a live stream of cards, newest " +
					"first, one for each moment an agent posted something while it was working. That " +
					"reads as activity, not as what happened — 458 cards sit on the board and 227 were " +
					"posted by one narrator, while what each piece of work actually produced lives " +
					"somewhere else entirely, in that task's own log file, with nothing joining the " +
					"two. ",
					b("The one change that would fix it most:"), " a fourth view, Days, reading only " +
					"the finishing line each task writes when it lands — so the default answer to " +
					"\"what happened\" is a dozen finished sentences instead of four hundred moments. " +
					"A proposal for the mastermind, not something this page built.");
			});
		}).style({ "grid-template-columns": "repeat(auto-fit, minmax(min(22rem, 100%), 1fr))" }).ac("wide");

		div.c("flow", () => {
			details(() => {
				summary("Checked today, and no longer true — seven corrections to the old lists");
				md("- **Minion permissions are solved.** A worker session launched with `acceptEdits` and " +
					"an explicit tool list can both write files and run them. Saturday's and Monday's workers " +
					"could not, which is why several of their fixes went unproven.\n" +
					"- **The 21-trap patch is applied.** The Start here page still says it is not; the " +
					"rulebook carries every one of them and the backlog file is down to seven lines.\n" +
					"- **The phone-width head row is fixed, and now proven.** It was 255px tall at 400px " +
					"wide — a quarter of a phone screen before any content. Measured today: 133px at 400, " +
					"105px at 1280, 76px at 1920, no console errors at any of the three. Monday shipped that " +
					"fix but could not run anything to check it.\n" +
					"- **The repo is committed.** That was the top item for two days.\n" +
					"- **The pm2 daemon is still running.** An earlier check said it was gone; it runs under " +
					"the name `node.exe`, which is how it was missed. It manages nothing and holds no port.\n" +
					"- **There are 15 idle node processes, not five.** Exactly one holds a port — your own " +
					"server on port 80. The port-8123 server named in older notes is not running at all.\n" +
					"- **Every task of the three days landed.** The one dir with no log at all, " +
					"`2026-09-21/arm-the-hooks`, still produced its deliverable — the settings block in " +
					"item 2 above.");
			});

			details(() => {
				summary("The numbers, if you want them");
				md("- **63 tasks**: 47 Saturday, 7 Sunday, 9 Monday. All 63 have a finishing line.\n" +
					"- **53 requests** were counted on Saturday, of which **27** were done the way you said " +
					"them — not the 30 first reported. Five verification passes moved eleven grades.\n" +
					"- **29 minutes** was the measured median from you saying something to a finished result " +
					"you could see: under 2 minutes with nothing else in flight, over an hour when several " +
					"things were queued.\n" +
					"- **1,389 files** were in the accidental stash. 1,008 put back, 301 already identical " +
					"on disk, 80 left alone on purpose. The three numbers add up.\n" +
					"- **458 cards** are on the live board: 227 by the mastermind, 54 by the assistant, 48 " +
					"by you, about 30 from the tasks themselves.\n" +
					"- **Three outages** on Saturday, the longest about four minutes. None since.");
			});

			md("*Sources: every task's own finishing line, the three day logs, and the repo as it stands on " +
				"2026-09-22. The brief is [requirements.md](requirements.md); what was measured and how is " +
				"in this task's log.*").ac("muted");
		});
	},

	/* Three known items, so auto-FIT with a 20rem floor: three columns from about
	   1100px up, one on a phone, and never a reserved empty track. */
	wall(){
		return div.c("grid gap", () => {
			DAYS.forEach(([day, date, headline, body]) => {
				div.c("card flow", () => {
					md("### " + day + " — [" + date + "](/framework/ai/" + date + "/)");
					p(b(headline));
					md(body);
				});
			});
		})
			.style({ "grid-template-columns": "repeat(auto-fit, minmax(min(17rem, 100%), 1fr))" })
			.ac("wide");
	},
});
