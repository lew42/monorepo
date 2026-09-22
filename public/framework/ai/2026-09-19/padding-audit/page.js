import { Page, md, div, p, span, b } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; three tables and one card wall claim wide.
   3 OWN LAYOUT prose, the measurement table first (it is the finding), then the
                answers as cards, then the ranked changes.
   4 REGIONS    none.  5 PREVIEW  core's default card.
   ⚠ No template literals in this file — plain "…" strings with \n. */

/* Used padding of a .pad box, measured geometrically at four widths. */
const PAD = [
	["a full-width page region", "14", "16.7", "32.3", "69.6"],
	["a nested card (74–187px)", "14", "15", "16", "18"],
	["the site sidebar (240–287px)", "—", "12", "12.8", "14.4"],
	["the dev bar (271px)", "12.8", "12.8", "12.8", "12.8"],
];

const GAP = [
	["a page region", "14", "15", "24", "43.2"],
	["the site sidebar — not a container", "—", "15.6", "25", "34.6"],
	["the dev bar — not a container", "12.8", "15.4", "25", "30.7"],
];

const ANSWERS = [
	{
		q: "1. What do the skills tell an agent?",
		a: "For a region and a control, one findable sentence each: a spacing clamp is space between and around content, never the size of a control (css §4, layout's spacing section). For a CARD — nothing. No skill, readme or study names what a card's padding should be, and framework.css has no card word to point at.",
		note: "The layout skill also contradicted itself two bullets apart — multipliers are no longer allowed, then convert gap: 0.6em to calc(var(--gap) * 0.6). Fixed today.",
	},
	{
		q: "2. Does --pad do what the owner expects?",
		a: "No. It is a percentage of the containing block, so it stays pinned at its 1em floor until that block is about 1292px wide. Every card, rail and column on the site therefore gets a flat 14/15/16/18px while the region around it ramps to 69.6px.",
		note: "The owner's band is 0.5em to 2em. Today's floor is 1em and the ceiling is 4em, and neither is reachable from a card.",
	},
	{
		q: "3. Are the containers declared?",
		a: "Not where it matters. Neither core/Sidebar nor dev/DevBar declares container-type, so the cqi terms in --gap and --flow read the VIEWPORT inside them: 34.6px between rows in a 287px rail at 3440. Declared containers are .stage, .page-preview-thumb, .demo-stage, .v3, the AITask card, the homepage region, ux/Wizard.",
		note: "Page.css records the refusal deliberately (lines 318, 846, 888, 939): container-type applies layout containment and makes the box a containing block for position: fixed.",
	},
	{
		q: "4. Do the cq tokens cost paint time?",
		a: "No. Three seconds of continuous resizing: 181 frames, ZERO frames over 50ms, style 1.73s and layout 0.68s with the tokens live against 1.48s and 0.83s with them neutralised to plain em — the difference is noise, and layout got slower without them.",
		note: "Seven ResizeObservers and one resize listener on the heaviest page. If the fans spin while resizing, the watcher, LiveReload and the supervisor are the suspects, not the tokens.",
	},
];

const RANKED = [
	["A `card` word in framework.css — the owner's own: ground + hairline + radius + the default pad, so a card is padded by definition. `.card.size-small` for dense UIs, reusing the existing --size knob rather than a new word.", "6 lines", "the V3 tiles, the dev bar's hand-written 0.4em, both hand-written ramps — and it is the word the 180 hand-rolled card classes were each reinventing"],
	["Give that word the owner's band — `--pad-card: clamp(0.5em, 2.6%, 2em)` — and leave `--pad` to regions. Two tokens, one rule: a region takes `.pad`, a framed box takes `.card`, a control or a row stays in its own `em`.", "2 lines + one sentence in css and layout", "the 4.3x spread, and every future argument about which token a card takes"],
	["Two lint rules in the page-health watcher: an element with a border and a ground and under 8px of used padding; a row in a list over 40px tall. Measured geometrically.", "a proposal to page-health, not built here", "the dev bar at 5.12px and the sidebar at 46.5px — both are one number a machine can see"],
	["The sidebar and the dev bar stop using cqi tokens internally and declare their spacing in the rail's own `em` — the conclusion Page.css already reached for side regions.", "2 lines of CSS", "34.6px between rows in a 287px rail"],
	["APPLIED: the layout skill's multiplier contradiction, and two css caveats — `--pad` is floor-pinned under ~1292px, and a `%` inside `calc()` cannot be read back with getComputedStyle.", "3 lines", "the next agent who tries to verify a padding number and gets NaN"],
];

export default new Page({
	meta: import.meta,
	title: "Padding audit",
	description: "Why padding decisions keep going wrong: the token is fine, the missing word is not. Measured in five hosts at four widths.",
	icon: "crop_free",

	content(){

		p("The token is not broken; ", b("the vocabulary is missing a word."), " `--pad` is a percentage of the box that holds you, so it sits pinned at its 1em floor until that box is about 1292px wide — which means every card, rail and column on the site gets a flat 14–18px while a full-width region ramps to 69.6px, from the same word. And there is no `card` word at all: `.surface` carries a ground, a hairline and a radius and ", b("no padding"), ", so a padded box is two words you have to remember, and 180 hand-rolled card classes across the site are what happened instead.");

		md("## The measurement\n\nUsed padding of a `.pad` box, read geometrically (a `%` inside `calc()` cannot be read back as px).\n\n| host | 400 | 1280 | 1920 | 3440 |\n| --- | --- | --- | --- | --- |\n" +
			PAD.map(r => "| " + r.join(" | ") + " |").join("\n") +
			"\n\n`--gap` inside the same hosts — `cqi` with no container ancestor reads the viewport:\n\n| host | 400 | 1280 | 1920 | 3440 |\n| --- | --- | --- | --- | --- |\n" +
			GAP.map(r => "| " + r.join(" | ") + " |").join("\n")).ac("wide");

		this.wall();

		md("## The changes, ranked by wrong-padding outcomes prevented per line\n\n| | the change | cost | prevents |\n| --- | --- | --- | --- |\n" +
			RANKED.map((r, i) => "| " + (i + 1) + " | " + r[0] + " | " + r[1] + " | " + r[2] + " |").join("\n")).ac("wide");

		md("## Container queries — the four ways they have actually bitten this site\n\n" +
			"1. **A box cannot query itself.** A three-card wall stayed at one column at every width, 3440 included — the third time this year (`css/caveats.md`).\n" +
			"2. **`container-type` turns on containment, so a content-sized box collapses.** A flex column measured **0px while holding 963px** of children (2026-08-18); a `Stage` shrank to **307px inside a 1546px frame** (2026-09-05); `/blog/`'s hero set one character per line (2026-09-05).\n" +
			"3. **`cqi` falls back to the small viewport with no container ancestor** — measured today in the sidebar and the dev bar, above.\n" +
			"4. **`em` inside a container query resolves against the CONTAINER's font size**, so a threshold picked by dividing viewport widths lands wrong — one box read 96.4em and 165.9em at once (2026-08-30).\n\n" +
			"A fifth, this site's own: **`container-type` makes the box a containing block for `position: fixed`** (`Page.css` 318, 846). All five are why `.page` and the rails are deliberately not containers — and why change 2 keeps the percentage instead of moving `--pad` to `cqi`.").ac("wide");

		md("### Applied now (fail-safe)\n\n" +
			"- **layout/SKILL.md** — the spacing section said multipliers are no longer allowed and then converted a constant with a multiplier, two bullets apart. It now points at the rung.\n" +
			"- **css/caveats.md** — two measured traps: `--pad` is floor-pinned below a ~1292px containing block, and a `%` inside `calc()` reads back from `getComputedStyle` as a string, so padding must be measured geometrically.\n\n" +
			"### Waiting on the owner\n\n" +
			"Four `decision` lines in this task's log, each with its alternative: the **`card` word**; **percentage and two tokens** rather than container units and one; the **rails' own em** instead of `cqi`; and the **page-health lint**. `framework.css` was not edited.").ac("wide");

		p.c("muted", "Read-only audit: nothing on the site was changed. Measurements, the performance A/B and the four decisions are in this task's log. The dev bar's own 5.12px came from a hand-written 0.4em 0.5em rule — devbar-chat proved --pad itself resolved correctly there (12.8px, its 1em floor).");
	},

	wall(){
		return div.c("grid auto gap", () => {
			ANSWERS.forEach(a => { this.card(a); });
		}).style({ "--column": "18rem" }).ac("wide");
	},

	card(a){
		return div.c("surface pad flex v gap-25", () => {
			p.c("h4", a.q);
			p(a.a);
			p.c("muted", a.note);
		});
	},
});
