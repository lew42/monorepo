import { Page, md, div, p, img, b } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at --measure; the before/after shots claim wide.
   3 OWN LAYOUT headline prose, then the before/after pair (the whole story),
                then one more proof at 400px, then the census one click down.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

const shot = name => new URL("shots/" + name + ".png", import.meta.url).pathname;

export default new Page({
	meta: import.meta,
	title: "Card-adopt",
	description: "The card standard existed but nothing wore it. Now the dev bar's own log cards do — measured, not just styled.",
	icon: "crop_free",

	content(){

		p("This afternoon the owner asked for ", b("one padding rule for every card"), " — the dev bar's log cards had text pushed against their own edge, about 3px of padding. A task called `padding-audit` wrote that rule into `framework.css`: a ", b(".card"), " class and a ", b("--pad-card"), " token. It landed with nothing wearing it. This task put it on the dev bar's cards — and its first pass made them ", b("more"), " cramped, not less: `--pad-card`'s own floor turned out to shrink with a component's local type size, so on the dev bar's own smaller text it gave LESS padding (6.44px) than the 12.8px already accepted as fixed. That was wrong, and it is fixed now: the floor is corrected, the dev bar's card measures a real ", b("16px"), ", and the standard itself carries the fix everywhere it is used, V3's cards included.");

		md("## Before and after, at 1920px\n\nSame card (the mastermind log, top of the dev bar's default tab). Before: a hand-picked token that happened to give an acceptable number. After: the standard's own token, corrected so a small card is never punished for sitting in small type.").ac("wide");

		div.c("grid auto gap", () => {
			this.figure("says-1920-before", "Before — padding: var(--pad). Measured 12.8px, the same number a full-width page region gets, not a card's own.", "12.8px (var(--pad), the wrong token)");
			this.figure("says-1920-after", "After — padding: var(--pad-card), corrected floor. Measured 16px, real and generous, not floor-pinned by accident.", "16px (var(--pad-card), the corrected floor)");
		}).style({ "--column": "22rem" }).ac("wide");

		md("## And at 400px\n\nThe mastermind log itself hits a separate, pre-existing bug at phone width — see the caveat below — so this is the sessions tab's own card (`.dev-chat-minion`), fixed the same way:").ac("wide");

		div.c("grid auto gap", () => {
			this.figure("chat-minion-400-after", "The sessions list at 400px, after the correction — even 16px padding all around.", "16px (var(--pad-card), the corrected floor)");
		}).style({ "--column": "18rem" }).ac("wide");

		md("## The floor was wrong, and it is fixed now\n\n`--pad-card`'s floor was `0.5em` — relative to a card's OWN font-size, not the page's. Inside a component that runs smaller local type on purpose (the dev bar's whole rail is `0.8rem`), that floor shrank right along with the type: 6.4px instead of the 8px the design intended, landing the dev bar's card at 6.44px — measurably MORE cramped than the 12.8px already on screen and already accepted. A stranger looking at the two shots would call the first attempt a regression, because it was one — matching the token exactly was not the test; looking less cramped than before was, and it failed that test.\n\nThe fix: the floor now reads `1rem` — the ROOT element's font-size, which nothing on this site resizes — instead of `0.5em`, the card's own. A card's font can still be large on purpose and get proportionally more room at the top end (the `2em` ceiling is untouched); only the floor stops shrinking with a component's local type. Measured, corrected: the dev bar's card is **16px** at both 400px and 1920px (up from 12.8px, not down); a normal-sized card up to about 615px wide also floors at 16px instead of drifting down to 8–12.5px; nothing above that width changes at all — a 1400px card still measures 32px, exactly as before.").ac("wide");

		md("## What now wears the standard, and what doesn't\n\nThree ad-hoc padding rules in `public/framework/dev/DevBar/devbar.css` take the **token**, `--pad-card`, not the full `.card` class:\n\n" +
			"- `.dev-says-card` — the mastermind log card the owner's complaint was about. Was `var(--pad)` (12.8px); now `--pad-card` (16px at both 400px and 1920px).\n" +
			"- `.dev-chat-card` — the session-transcript log's own card. Was a hand-written `0.4em 0.6em`; now `--pad-card`.\n" +
			"- `.dev-chat-minion` — the sessions list row shown above. Same fix, 16px.\n\n" +
			"**Why not the whole `.card` class, only the token?** `.card`'s own rule gives every child `margin-block-start: var(--gap)` for rhythm, and reserves a 3px accent edge. All three cards above already do their own rhythm with a flex `gap` — wearing the full class would ADD `.card`'s margin on top of that gap, not replace it. And the dev bar's own background is the same `--surface` token `.card` paints with, so a card wearing the full class would blend into the rail it sits in. Both reasons are logged in this task's `task.jsonl`, and the coordinator's own review confirmed this part was the right call.").ac("wide");

		md("## The blast radius of fixing the token — checked, not assumed\n\n`--pad-card` is not used by only 2 things, as this task first (wrongly) reported — it is also live today on `public/framework/ai/v/3/v3.css`'s own inbox and grid cards, out of this task's fence and owned by another minion's rebuild tonight. Checked live, read-only, before and after: a regular V3 tile went from ~10.4px to 16px, a wide tile (already past the floor) stayed at 21.36px, unchanged — screenshotted, and it reads as an improvement there too, not a regression. Raising a floor is a low-risk direction for a shared token: it can only ever add breathing room where a box was already tight, never take room away from a box that wasn't.").ac("wide");

		md("## One thing worth knowing before you trust this everywhere\n\n" +
			"**The mastermind log is invisible at phone width, right now, independent of this fix.** Below 34em the dev bar becomes a bottom sheet, and its log section — the exact thing the owner complained about — computes to a real, measured **0px of height** there (the other four sections in the sheet refuse to shrink, so the one section that can shrink shrinks to nothing). The padding is correct at that width; there is just no card left tall enough to show it. This is a separate bug, not caused by this task, named with its exact cause in the log for whoever picks it up next.").ac("wide");

		md("## How many other boxes are cards in all but name\n\n" +
			"**196** distinct CSS class names across the site contain \"card\" or \"tile\" (207 file+name pairs — close to the padding-audit's own count of 180 hand-rolled card classes). Four checked by hand and confirmed as real, padded, bordered boxes ready to adopt the standard, named here for the next pass rather than swept blindly: `public/websites/Site.css` `.site-card`, `public/layouts/shell/shell.css` `.std-shell-card`, `public/resume/resume.css` `.resume-card`, `public/framework/ux/Popover/Popover.css` `.ux-popover-hostile-card`.").ac("wide");

		p.c("muted", "Full measurements, the corrected floor's math, the V3 blast-radius check, and the phone-width bug's exact cause are all in this task's task.jsonl.");
	},

	figure(name, caption, number){
		return div.c("surface pad flex v gap-25", () => {
			img().attr("src", shot(name)).attr("alt", caption).style({ width: "100%", borderRadius: "0.4em" });
			p.c("muted", caption);
			p.c("h4", number);
		});
	},
});
