import { Page, md, div, span } from "/app.js";

/* Container: a COLUMN in /imagine/'s columns host. Size: `large` (28–64em) — a card wall
   of the program's parts. Own layout: prose + `previews()`, moved to right after the opening
   two sentences. Regions: one. Preview: the default card.

   2026-09-05 UX pass: the real page wall used to sit below ~1600px of prose (two long
   markdown blocks) and the "Landed" section re-linked, as bare text, six pages the wall
   below it already showed as cards — the same page named three times on one screen.
   `this.previews()` now runs right after the opening two sentences and the duplicate links
   are cut.

   ⚠ TRIED AND REVERTED: the nine research verdicts as their own tile wall (`.grid.auto`
   card per topic). Measured worse, not better — this page is a fixed-width COLUMN (the
   `large` token caps it ~535px at 1280cqi, ~1152px at 3440cqi; it does NOT grow with the
   viewport the way a full page does), so 9 cards only fit 2 per row at 1280 and 4 at 3440.
   Page height grew 2254→2714px at 1280 (+20%) and 2389→2601px at 3440 (+9%) for a shape
   that was, at every width tested, LESS compact than the list it replaced — the approved
   tile wall's "4+ tracks at 3440" win needs a container that actually widens with the
   viewport, which a Miller-columns pane does not. Kept the list; bolded the counts instead
   (`### Landed` below) so they still read as numbers, not a clause, at no height cost. */

// Nine research verdicts, each `research/<slug>/verdict/` — a topic dir is a page
// (ext/Research Topic.js), so the fallback reaches its beside-it `verdict.md`.
const VERDICTS = [
	["cloudflare", "Cloudflare", 42], ["data", "Data", 50], ["users", "Users", 44],
	["payments", "Payments", 50], ["realtime", "Realtime", 36], ["video", "Video", 41],
	["ai", "AI", 46], ["community", "Community", 46], ["security", "Security", 49],
];

// The questions every verdict left open that only the owner can close.
const PARKED = [
	["The stored-value legal question", "research/payments/verdict/"],
	["How many people one busy topic's live room can hold before it overloads", "decisions/data/"],
	["User-created subtopics", "decisions/topic-model/"],
	["Whether Sign In with Apple becomes required (it only would if an iOS app is ever built)", "decisions/identity/"],
	["The per-user AI spend cap", "research/ai/verdict/"],
];

// The AI work session itself, as three readouts instead of three bullets.
const SESSION = [
	["17/18", "minions dispatched, landed"],
	["3.52M", "tokens summed from the landed agents' outcome lines"],
	["16%", "5h session window used (~41% elapsed)"],
];

export default new Page({
	meta: import.meta,
	title: "Platform",
	description: "Topics as worlds — the research, the decisions and the prototypes behind a community platform built on this framework.",
	icon: "public",
	width: "large",

	children: "existing prior research decisions mvp topic omnibox local",
	index: true,   // content() draws the children; core leaves its row list out

	content(){
		md(`**This is a design lab, not a live product.** These pages test what a small community
platform — one built entirely from words this framework already has — could look like.
**A topic is not an article. It is a world around an idea** — a url, a page, content, and, when
it earns them, a community, subtopics, levels and experiences.

**Start here:** [the Topic demo](./topic/) is the one page below you can actually click around
in — earn points, open a subtopic, watch a level change. Everything below that card is the
research and reasoning behind it, not the thing itself.`);

		this.previews();

		md(`The brief is a vision with open questions, not a spec. This program digs each question to a
verdict with how sure anyone is, records the decisions that would be expensive to reverse, and
prototypes only what a demo explains better than a paragraph.

## Behind the scenes: the research log
*As of 16:32, 2026-09-04 — from [the run log](/framework/ai/2026-09-04/mastermind-platform/). This
is the paper trail the demo above was built from — a project log, not a feature of the platform
itself.*

### Landed — nine verdicts, dug in parallel
${VERDICTS.map(([slug, name, n]) => `- [${name}](./research/${slug}/verdict/) — **${n} entries**`).join("\n")}

Plus four decision records — [topic model](./decisions/topic-model/),
[data](./decisions/data/), [identity](./decisions/identity/) and
[local dev](./decisions/local-dev/) — each ruled off a verdict above.

### In flight or next
- This report — the card descriptions, this section, the local-dev correction line ([run log](/framework/ai/2026-09-04/))

### Still open — only the project's owner can decide these
${PARKED.map(([q, url]) => `- [${q}](./${url})`).join("\n")}

### The AI work session itself (not the platform)`);

		div.c("flex gap wrap", () => SESSION.forEach(([n, label]) =>
			div.c("flex v gap", () => { span.c("h2", n); span.c("muted", label); })
		));
		md("*Weekly usage: 4% all-models, 3% scoped to this program.*");
	},
});
