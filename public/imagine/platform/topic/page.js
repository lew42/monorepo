import { Page, div, span, button, md } from "/app.js";

/* Container: a COLUMN in /imagine/'s columns host (the shallowest columnar ancestor, three
   levels up) — so there is no page grid here, `wide` means nothing, and every child opens to
   the right instead of below. Size: `small` (14em → 16cqi) — this page is a rail of what the
   topic has, nothing else; its capability pages take `large` and its subtopics take `small`
   rails of their own. Own layout: core's `column()` and core's row, untouched — every list
   here is `md()` prose or one `flex v gap`. Regions: one per column, core's. Preview: the
   default card.

   THE DEMO IS THE RECORD, RUNNING. Everything on this screen is a claim in
   /imagine/platform/decisions/topic-model/ that you can click:

     · `is: "topic"` is the whole of what makes this a topic (record 1). Delete that one word
       and every screen below still renders — they just stop finding each other.
     · A capability is a CHILD PAGE (record 2). `intro`, `space` and `levels` are the four
       words minus `subtopics`, and `subtopics` is just `children:`. There is no capability
       flag anywhere in this file, because a directory is the flag.
     · A subtopic is a page until it says otherwise. `syntax` stays a page and reads THIS
       topic's state; `async/` is a real second file that says `is: "topic"` and shadows this
       one for everything below it — with no import in either direction.

   No new CSS, no new class names, no new core: `md()`, `flex v gap`, `muted`, a bare
   `button`, and the words core already has. */

/* §15's ten minutes, as STRUCTURE — the beats and what each one holds, not the content. The
   point of writing it as a stub is that the shape is the decision; the prose is a Tuesday. */
const BEATS = [
	["What this is",             "90s", "One paragraph and one line you can run. No setup, no account, no install."],
	["The shape of the place",   "2m",  "Walk the subtopic columns rather than read a table of contents."],
	["Who is here",              "2m",  "The space and its channels, and what actually gets written in each."],
	["One thing you can do",     "3m",  "The smallest real exercise the topic has — the first thing worth points."],
	["Where you go next",        "90s", "Three links, chosen by what you did in the beat above."],
];

/* The 1-5 rubric, hand-written per rung (research/community's verdict). It is a DISPLAY BAND
   over points and never a stored fact, so changing the scale later is a relabel of this array
   and not a migration of anybody's history. */
const LEVELS = [
	[0,   "Visitor", "Arrived. Nothing to prove yet."],
	[4,   "1 · Arrived", "Read the intro and walked a subtopic."],
	[12,  "2 · Asked",   "Asked a real question in the space, and came back for the answer."],
	[30,  "3 · Answered","Helped somebody else, more than once."],
	[70,  "4 · Built",   "Shipped something this topic links to."],
	[150, "5 · Leads",   "Keeps a subtopic other people rely on."],
];

/* What earns a point. The log is the source of truth and the level is derived from it — the
   community verdict's §33, said in eleven lines instead of a reputation table. */
const ACTIONS = {
	intro:          { points: 1, said: "Finished the ten-minute intro" },
	"walk:syntax":  { points: 1, said: "Walked Syntax" },
	"walk:async":   { points: 1, said: "Walked Async" },
	"read:general": { points: 1, said: "Read #general" },
	"read:help":    { points: 2, said: "Read #help" },
	post:           { points: 8, said: "Posted a question in #help" },
	answer:         { points: 20, said: "Answered somebody else's question" },
};

export default new Page({
	meta: import.meta,
	title: "JavaScript",
	description: "A topic demo, built from words the framework has.",
	icon: "code",

	width: "small",

	// Record 1, and the only line in this file that makes any of the rest work.
	is: "topic",

	// ⚠ A field added to the saved shape must default empty: the key is the url and there is
	//   no migration step. `log`, and nothing else, because everything else is derived.
	initialize(){ this.log = [...this.store().get({ log: [] }).log]; },

	watch(fn){ (this.watchers ??= []).push(fn); fn(); },
	bump(){ this.watchers?.forEach(fn => fn()); },

	// Idempotent, so a page may call it on every arrival — including a cold load straight at
	// its url, which is the only reason progress survives a reload.
	earn(id){
		if (this.log.includes(id)) return;
		this.log.push(id);
		this.store().set({ log: this.log });
		this.bump();
	},

	reset(){ this.log.length = 0; this.store().clear(); this.bump(); },

	points(){ return this.log.reduce((n, id) => n + (ACTIONS[id]?.points ?? 0), 0); },
	level(){ return LEVELS.findLast(([at]) => this.points() >= at); },

	// The rail's one live line. Core draws the rows; this sits above them.
	content(){
		div.c("flex v gap", $state => this.watch(() => $state.empty(() => {
			const [, name] = this.level();
			span(name);
			span.c("muted", this.points() + " pts · " + this.log.length + " done");
		})));

		md("[The record](/imagine/platform/decisions/topic-model/) this runs on.");
	},

	children: [
		/* ── intro ─────────────────────────────────────────────────────────────────────
		   The capability that has to have a url: §15 wants it pausable and resumable, and a
		   url is what "resume" means. `default` so the topic arrives with something open —
		   a rail beside an empty row leaves 80-93% of it grey (doc/columns.md). A default
		   column is BUILT, never activated, so arriving here does not award anything. */
		{
			name: "intro",
			title: "Ten minutes",
			description: "The five beats of the introductory experience, as structure.",
			width: "large",
			classes: "default",

			content(){
				md(`## The first ten minutes

Five beats. Timings are the budget, not a promise — the whole thing has to be walkable in
one sitting on a phone, which is the actual constraint.`);

				md("| beat | budget | what goes here |\n|---|---|---|\n"
					+ BEATS.map(([title, time, holds]) => `| **${title}** | ${time} | ${holds} |`).join("\n")).ac("wide");

				md(`**It does not award Level 1.** Finishing is worth one point and Level 1 is four —
§15's own line, that entering must be easy and Level 1 must still mean something.`);

				div.c("flex gap wrap", $row => this.topic().watch(() => $row.empty(() => {
					const run = this.topic(), done = run.log.includes("intro");

					if (done) span.c("muted", "Finished. Worth 1 point.");
					else button("I finished the intro").click(() => run.earn("intro"));
				})));
			},
		},

		/* ── space ─────────────────────────────────────────────────────────────────────
		   §18's channels, and the shape research/realtime asked for: ONE page per channel,
		   because the Durable Object key is a page url and a page is the only thing on this
		   site that already has a unique, stable one. */
		{
			name: "space",
			title: "Space",
			description: "Three channels, each its own page — and each its own Durable Object.",
			width: "large",

			content(){
				md(`## The community space

A channel is a page. That is the whole design: the object that owns a channel's message
order is keyed on this page's url, so nothing invents a second naming scheme and nothing
central has to list the channels — [realtime](/imagine/platform/research/realtime/),
[the record](/imagine/platform/decisions/topic-model/).

Nothing here writes yet. The site is static until the identity step of
[the slice](/imagine/platform/mvp/), and a channel with no author is a guestbook.`);
			},

			children: [
				["general", "Anything about the topic that is not a question.", 0],
				["help", "Questions, and the answers that earn the most.", 2],
				["showcase", "Things people built. The only channel with no text posts.", 0],
			].map(([name, blurb, points]) => ({
				name,
				title: "#" + name,
				description: blurb,
				content(){
					md(blurb);
					md("Durable Object key: `" + this.url + "` — the page url, nothing else.");

					if (!points) return;

					div.c("flex gap wrap", $row => this.topic().watch(() => $row.empty(() => {
						const run = this.topic(), id = "read:" + name;

						if (run.log.includes(id)) span.c("muted", "Read. Worth " + points + ".");
						else button("Read the channel").click(() => run.earn(id));
					})));
				},
			})),
		},

		/* ── levels ────────────────────────────────────────────────────────────────────
		   The progression stub. Everything on it is derived from `topic().log` — the level,
		   the points, the next rung — which is the community verdict's §33 in a page you
		   can click, and the reason a scale change never touches saved data. */
		{
			name: "levels",
			title: "Levels",
			description: "A 1-5 band derived from an action log — never a stored number.",
			width: "large",

			content(){
				md(`## Levels

The log is the fact. The level is a **band over it**, computed on read, so relabelling the
scale is an edit to one array and never a migration of anybody's history
([community](/imagine/platform/research/community/)).`);

				md("| rung | at | what it means |\n|---|---|---|\n"
					+ LEVELS.map(([at, name, means]) => `| ${name} | ${at} | ${means} |`).join("\n")).ac("wide");

				div.c("flex v gap", $now => this.topic().watch(() => $now.empty(() => {
					const run = this.topic(), [, name] = run.level();
					const next = LEVELS.find(([at]) => at > run.points());

					span(name + " · " + run.points() + " pts");
					span.c("muted", next ? (next[0] - run.points()) + " more to reach " + next[1] : "Top of the rubric.");

					div.c("flex v gap", () => run.log.forEach(id =>
						span.c("muted", "· " + (ACTIONS[id]?.said ?? id) + " (+" + (ACTIONS[id]?.points ?? 0) + ")")));

					if (run.log.length) button("Erase this run").click(() => run.reset());
				})));

				md("Saved against this topic's own url — `" + this.topic().store().key()
					+ "` — by [`store()`](/framework/core/Page/doc/method/store/): one browser, and"
					+ " nobody else's. Past [the line](/imagine/platform/mvp/) the same log is a D1"
					+ " table and the same three methods read it.");
			},
		},

		/* ── subtopics ─────────────────────────────────────────────────────────────────
		   Two of them, and the difference between them IS the decision. `syntax` is a plain
		   page: `this.topic()` walks straight past it to JavaScript, so its lessons write the
		   topic's log. `async` is a real second file that graduates. */
		{
			name: "syntax",
			title: "Syntax",
			description: "A subtopic that stayed a page — its lessons write the topic's log.",
			width: "small",

			content(){
				md("A subtopic, and nothing more. It says no `is:`, so `this.topic()` from here — and "
					+ "from every lesson under it — finds **" + this.topic().title + "**.");
			},

			children: ["Declarations", "Destructuring", "Modules"].map((title, index) => ({
				name: title.toLowerCase(),
				title,
				description: "A lesson. It reads the topic three levels up with no import.",
				width: "large",

				// The rail arrives with its first lesson open; a lesson has no children, so
				// it is safe to mark (doc/columns.md — a `default` may not be a parent).
				classes: index === 0 ? "default" : "",

				content(){
					md("## " + title);
					md("A stub. What matters is the line below it: this page never imported the topic "
						+ "and the topic never imported this page.");
					md("`this.topic()` → **" + this.topic().title + "** · `this.topic().url` → `" + this.topic().url + "`");

					if (index) return;
					md("Walking any lesson here is worth a point on the topic's log — reload and it is still there.");
				},

				// Runs on a cold load straight at this url too, which is the point.
				activated(){ this.topic().earn("walk:syntax"); },
			})),
		},

		"async",
	],
});
