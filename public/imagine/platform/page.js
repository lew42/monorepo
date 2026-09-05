import { Page, md } from "/app.js";

/* Container: a COLUMN in /imagine/'s columns host. Size: `large` (28–64em) — a card wall
   of the program's parts. Own layout: prose + `previews()`. Regions: one. Preview: the
   default card. Children are added as each lands (a declared child with no page.js 404s). */

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
in — earn points, open a subtopic, watch a level change. Everything else on this page is the
research and reasoning behind it, not the thing itself.

The brief is a vision with open questions, not a spec. This program digs each question to a
verdict with how sure anyone is ([research](./research/)), records the decisions that would be
expensive to reverse, and prototypes only what a demo explains better than a paragraph.`);

		md(`## Behind the scenes: the research log
*As of 16:32, 2026-09-04 — from [the run log](/framework/ai/2026-09-04/mastermind-platform/). This
is the paper trail the demo above was built from — a project log, not a feature of the platform
itself. Skip to [MVP](./mvp/) for the build plan, or straight to [the demo](./topic/).*

### Landed
${VERDICTS.map(([slug, name, n]) => `- [${name}](./research/${slug}/verdict/) — ${n} entries`).join("\n")}
- [Topic model](./decisions/topic-model/), [data](./decisions/data/), [identity](./decisions/identity/) and [local dev](./decisions/local-dev/) — four decision records
- [MVP](./mvp/) — the ten-step slice
- [Topic demo](./topic/) — one topic, built from words the framework has
- [Omnibox](./omnibox/) — keyboard-first search, live over 1,056 site urls
- [Existing framework](./existing/) and [prior Cloudflare](./prior/) — the two scouts

### In flight or next
- This report — the card descriptions, this section, the local-dev correction line ([run log](/framework/ai/2026-09-04/))

### Still open — only the project's owner can decide these
${PARKED.map(([q, url]) => `- [${q}](./${url})`).join("\n")}

### The AI work session itself (not the platform)
- 18 minions (AI agents) dispatched this run, 17 landed
- 3,519,796 tokens summed from the landed agents' outcome lines
- Session window 16% used (~41% of the 5h window elapsed); weekly 4% all-models, 3% scoped`);

		this.previews();
	},
});
