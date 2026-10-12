import { Page, div, p, span, b, a } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary
                page grid: main for prose, wide for the flip cards.
   2 SIZE       three flip cards at 1 1 22em wrap to 2-3 / 1 columns; a compact
                list for the rest, no wrapping needed.
   3 OWN LAYOUT prose, one flip wall, one plain list. Nothing else.
   4 REGIONS    none.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN, mostly above the fold: the headline, then the disagreements
     (biggest news first), then the rest as one line each. The evidence, the
     file lines and the shots taken all live in verify.jsonl and this task's
     own task.jsonl — never repeated here.
   ⚠ No template literals in this file — plain "…" strings, so a stray
     backtick can never end one early (the exact bug that blanked the site
     twice today, per the day's own incident report). */

const VERDICT = {
	done: { word: "done", color: "var(--ok, #2e7d32)" },
	partly: { word: "partly", color: "var(--warn, #b26a00)" },
	differs: { word: "differs", color: "var(--warn, #b26a00)" },
	not: { word: "not done", color: "var(--bad, #b3261e)" },
};

function badge(v) {
	const info = VERDICT[v] || { word: v, color: "var(--muted)" };
	return span.c("h6", info.word).style({ color: info.color, fontWeight: 700, textTransform: "uppercase" });
}

/* The other eight, already agreeing with the earlier audit's verdict word —
   compact, one line each. The three rows with a real correction inside them
   are pulled out into flips() above, even where their own verdict word did
   not move. */
const AGREES = [
	["ai-v2", "done", "Full width beside the sidebar, and the code streams its run live, no reload — checked the class names and the streaming call.", "/framework/ai/v/2/"],
	["version-picker", "done", "V1 / V2 / V3 sit beside the AI title in one flex row, and New version scaffolds the next one — seen on screen on both v1 and v3.", "/framework/ai/"],
	["ai-v3", "done", "V3 is live, the mastermind answers right on the page, and its padding is genuinely container-query based. Could not re-check the very first blank screen — the page has moved on and nothing was committed to git to look back at.", "/framework/ai/v/3/"],
	["spatial-timeline", "not", "Confirmed nothing exists to look at: no spatial-timeline task directory anywhere, and its real (undispatched) brief sits at v3-timeline with zero lines of task log.", "/framework/ai/2026-09-19/v3-timeline/"],
	["current-view", "differs", "The Now tab is real and does exactly what was asked. The other half — measure the real prompt-to-card delay — was never finished; the closest task measured the AI model's own speed, not the whole pipeline, and was stood down early.", "/framework/ai/v/3/"],
	["v3-prompts", "not", "Checked the source directly: no Spacebar handling, no New item button, no toolbar per column, nothing that raises a referenced card. The yes/no card buttons exist but are never wired into this page at all.", "/framework/ai/2026-09-19/v3-timeline/"],
	["v3-cards-css", "differs", "Every V3 card still carries two classes, card AND v3-tile, in the markup itself — the owner asked for just card. The framework class does now supply the radius and base padding, which is real progress.", "/framework/ai/v/3/"],
	["joint-timeline", "not", "Same evidence as spatial-timeline: the task that would build one joint timeline has a finished brief and zero lines of task log. Nobody was ever sent to build it.", "/framework/ai/2026-09-19/v3-timeline/"],
];

export default new Page({
	meta: import.meta,
	title: "Dashboard, verified again",
	description: "A second, harder look at the 12 requests about the AI dashboard itself — one graded done turns out to be only partly there, and two more of the earlier audit's own explanations do not hold up.",
	icon: "fact_check",

	content() {

		p(b("Nine of the twelve hold up exactly as graded. "), b("Three need a correction: "), badge("done"), b(" idea-cards turns out to be only "), badge("partly"), b(" there, the V3 error monitor everyone assumes is watching the page right now is actually switched off, and two rows blame a missing 'two equal columns' that the code shows already exists."));

		this.flips();

		p.c("h4", "The rest, checked and agreeing with the earlier audit's verdict — one line each:");
		this.list();

		p.c("muted", "Every verdict, its evidence and the exact file lines and shots checked: ", a("verify.jsonl").href("/framework/ai/2026-09-19/verify-dashboard/verify.jsonl"), ". The owner's own 53 verbatim messages this task read from: ", a("the chat log").href("/framework/ai/2026-09-17/mastermind-layout-browser/"), ".");
	},

	flips() {
		return div.c("grid auto gap", () => {
			this.flip("idea-cards", "done → partly",
				"The wall of idea cards is real — icon, title, timestamp, colour-coded edge, every card a real link, top-three previews, sorted by importance exactly as the page itself says. But it is not two equal columns.",
				"The grid is a responsive CSS layout (auto-fill, 24em cards) with a card-width slider, plus some cards deliberately spanning two columns. At a normal window width you see three or more columns or one wide card, never a steady two.",
				"/framework/ai/v/3/?view=grid");
			this.flip("realtime-v3", "\"the error monitor is relaying\" — it is not, right now",
				"The console-error watcher was built and proven, then switched itself off the moment its own task landed.",
				"Its own task log ends: nothing left running, port 8141 free, no health.mjs process anywhere. A live check of every node process on this machine right now confirms it: no health.mjs anywhere. A sibling minion verifying the server topic found the exact same thing independently.",
				"/framework/ai/2026-09-19/page-health/");
			this.flip("v3-layout + v3-card-look", "\"two equal columns\" is not missing",
				"The earlier audit lists 'two EQUAL columns' as one of the things still missing from V3's layout. Reading the CSS and a live screenshot both show the opposite.",
				"The left and right columns are set to flex 0 0 50% and flex 1 1 auto — an exact 50/50 split at load — with a working drag handle between them. What really is still missing: the page is not full-bleed (it still carries page padding), and the left column has no hour-lined timeline, just a plain list of cards.",
				"/framework/ai/v/3/?view=timeline");
		}).style({ "--column": "22rem" }).ac("wide");
	},

	flip(id, headline, why, detail, url) {
		return div.c("surface pad flex v gap-25", () => {
			span.c("h6 muted", id);
			p.c("h4", headline);
			p(b(why));
			p.c("muted", detail);
			a("the evidence →").href(url);
		});
	},

	list() {
		return div.c("flex v gap-25", () => {
			AGREES.forEach(([id, verdict, line, url]) => {
				p(badge(verdict), " ", b(id), " — ", line, " ", a("source →").href(url));
			});
		}).ac("wide");
	},
});
