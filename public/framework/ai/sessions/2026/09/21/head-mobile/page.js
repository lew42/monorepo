import { Page, p, md, div } from "/app.js";

/* One screen: the before number, what moved, what's still always there, and what this
   session's shell refused to let it prove. Full brief: requirements.md. */
export default new Page({
	meta: import.meta,
	title: "head-mobile",
	icon: "smartphone",
	description: "The V3 head row ate 255px of a 400px phone screen — three groups now fold behind one More button instead.",

	content() {
		div.c("flow", () => {
			p.c("muted", "No screenshot leads this page — every measuring tool this task tried " +
				"(`mcp__site__shot`, `mcp__site__eval`, `node`, `npx playwright`, `curl`) was refused " +
				"before it ran once (see the bottom section). What follows is the change itself, read " +
				"from the edited source, against the ONE number this session did have: the brief's own " +
				"measurement, taken this morning before any edit.");

			div.c("h4", "The before number");
			md("**`.v3-head` stood 255px tall at 400px wide, against 76px at 1920** — a quarter of a " +
				"phone screen gone before a single card. Eleven controls shared that one wrapping row: " +
				"the AI title, four text links, the version picker, the count, five view tabs (two of " +
				"them disabled), Live, the author filter, and the card-width slider. Full brief: " +
				"[requirements.md](requirements.md).");

			div.c("h4", "What moved — three groups fold behind one \"More\" button");
			p("Below 400px, three things now hide until pressed instead of eating a row apiece: " +
				"**the four \"ways out\" links** (Today's board · Everything · Process · Start here), " +
				"**the card-width slider** (a desk control — there is only ever one column at 400px, " +
				"so it changes nothing a phone can see), and **the two disabled view tabs** (gallery, " +
				"dashboard — they advertise a feature that does not exist yet, so they cost a slot and " +
				"give back nothing). One button, `More ▾`, right in the row where the links already " +
				"sit, opens all three in place — nothing is deleted, and nothing moves in the markup; " +
				"`v3.css`'s own `@media (width < 40em)` block only toggles their `display` off a class " +
				"the button adds to the head row (`set_more()`, `v/3/page.js`).");

			div.c("h4", "What never moves, at any width");
			p("The AI title, the version picker, the count (\"N left\"), the three real view tabs " +
				"(now · grid · timeline), **Live**, and **the author filter** stay in the row at every " +
				"width — Live and the author filter by name, since the owner asked for both this week " +
				"and they are small enough to earn their place regardless (task.jsonl's own `log` line " +
				"has the fuller reasoning).");

			div.c("h4", "How each control is reached at 400px");
			md("- **AI title, version picker, count, view tabs, Live, author filter** — visible, unchanged.\n" +
				"- **The four links, the slider, the two disabled tabs** — one tap on `More ▾`, right " +
				"beside the version picker, opens all three where they already sit; tapping it again " +
				"(now reading `Less ▴`) closes them. Nothing about them changed except that a tap is " +
				"now required below 400px — the same links, the same slider, the same disabled buttons.");

			div.c("h4", "The after number, and why it is not here");
			p("Not measured — every tool that could load the page and read `.v3-head`'s own height was " +
				"refused (below). Worked out from the parts instead: the row above the fold now holds " +
				"four small items (title, picker, More, count) and, on its own line, three view tabs, " +
				"Live, and the author filter — two short rows in place of the old six. The brief's own " +
				"target was under 120px at 400 without losing reachability; two rows of ordinary " +
				"controls read as plausibly under it, but \"plausible\" is not a number, and the " +
				"mastermind's own proof run is what turns it into one.");

			div.c("h4", "What this session could not prove");
			p("Every command that would have proven this landed correctly was refused: " +
				"`node Server/hold.mjs on \"head-mobile\"` (no reload hold around the batch), " +
				"`mcp__site__shot`/`mcp__site__eval` (no screenshot or DOM read of `.v3-head` at 1920 " +
				"or 400, before or after), `node --check` on either edited file (no independent parse " +
				"proof beyond the syntax-guard hook, which did not block either write), and `curl`/`npx " +
				"playwright` (no way to confirm `/framework/ai/`, `/framework/ai/v/3/?view=now`, " +
				"`?view=grid`, `?view=timeline`, or `/framework/ai/?v1` still answer 200 with no console " +
				"errors, at either width). `git status` and `node --version` were the only two commands " +
				"this session's shell allowed. The mastermind runs the real proofs at harvest, per the " +
				"brief.");
		});
	},
});
