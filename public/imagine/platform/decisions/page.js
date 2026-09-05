import { Page, md } from "/app.js";

/* Container: a COLUMN in /imagine/'s columns host, three levels up — no page grid, so no
   `wide`. Size: `large` (28-64em); one table needs the room. Own layout: prose plus one
   markdown table, `.ac("wide")` so it compresses inside the column instead of overflowing the
   measure cap. Regions: one. Preview: the default card.

   ⚠ The records are `.md` files BESIDE this page, not declared children — core's fallback
     turns `./x/` into `./x.md` when no page.js claims `x` (doc/declaring.md). Declaring them
     as `children:` would 404 the whole probe, since none of them has a page.js. A new record
     is a file plus one row below. */

const RECORDS = [
	["topic-model", "What a topic is in code",
		"An ordinary page that says `is: \"topic\"` — no subclass, no registry. A capability is a child page; `can:` is the unused escape hatch. A subtopic is a page until it adds the same word."],
	["data", "Where state lives",
		"Git files for curated content, D1 the day a stranger writes, one Durable Object per live surface **url**, R2 for media. The url is the key — per channel where channels exist, per topic where they do not."],
	["local-dev", "The local multi-user harness",
		"`node server.js` and `npx wrangler dev` side by side on one origin, seeded fake users, roles, the anonymous path, and a room tested from two browser contexts. No new npm dependency."],
	["identity", "Who a user is, and what they may do",
		"One `users` row and a stateless HMAC cookie — GitHub and Google, no vendor, no dependency. A ban is one KV key; authorization is one `can(user, action, url)` the router calls. The dev login is **absent** from the deployed bundle, not disabled in it."],
];

export default new Page({
	meta: import.meta,
	title: "Decisions",
	description: "The hard-to-reverse calls, one record each.",
	icon: "gavel",
	width: "large",

	content(){
		md(`The brief's §33 shape, one screen each: **Decision · Problem · Options · Recommended ·
Why · Advantages · Disadvantages · Security · Cost · Scalability · Complexity ·
Migration/reversibility · what we are deliberately NOT doing yet.**

Only for the calls that are expensive or hard to reverse — never for a detail. Each one is
ruled off the [research verdicts](/imagine/platform/research/), and where two verdicts
disagreed the record says which one lost and why. The slice that spends them all:
[MVP](/imagine/platform/mvp/).`);

		md("| record | the decision | in one line |\n|---|---|---|\n"
			+ RECORDS.map(([name, decision, line]) => `| [**${name}**](./${name}/) | ${decision} | ${line} |`).join("\n")).ac("wide");
	},
});
