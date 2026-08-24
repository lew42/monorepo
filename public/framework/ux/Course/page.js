import { Doc, md, demo, div, span, button } from "/app.js";
import Course from "./Course.js";

/* Fresh data per call: a Page caches its view, so the card's copy and the
 * stage's copy would otherwise fight over one set of DOM nodes (Tree/page.js,
 * ext/demo/exhibit.js). Content is real: the framework's own template tier,
 * short md strings, each lesson a screen long. */
const chapters = () => [
	{
		title: "The template tier",
		lessons: [
			{
				title: "ui/ hands you markup",
				content: () => md("`ui/` is 20 components, and today only one of them holds any state. A template is html and css you copy-paste — `div.c(\"surface pad flex v gap\", () => { … })` — with **no listener it installs itself, no state it remembers between renders, no lifecycle**. A click handler the *caller* writes at the call site does not make a template behavioral; `:hover`, `<details>`, `<dialog>` are the platform's own behavior, not the component's.\n\nThat is the whole tier: markup, with a copy button."),
			},
			{
				title: "The graduation rule",
				content: () => md("**A template graduates when something has to be remembered between renders.** Three things count: state the component holds (a selection, a cursor), a listener it installs on its own elements, or a lifecycle — `update()`, `select()`, anything that runs twice.\n\nEverything else stays a template. Nine of `ui/`'s twenty components only *look* interactive and are native HTML; three are exported functions, and every one is a loop — markup a `for` can say, which a `<template>` cannot."),
			},
			{
				title: "One exception: ui/tree",
				content: () => md("`ui/tree` kept a `rows` Map and a `selected_row` across an `update()`, in a **closure** — which is a class written in the one shape nothing can subclass. So it graduated: the stateful half became `ux/Tree`, a real class, while `.ui-tree-*` stayed exactly where it was.\n\n**Splitting is the usual answer, not moving.** A rule about a relationship or a state is what `ui/` is for; only the stateful half ever leaves."),
			},
		],
	},
	{
		title: "The behavior tier",
		lessons: [
			{
				title: "A ux is a class",
				content: () => md("`ux/` hands you a class you can extend, assembled from `ui/` templates and responsive from a phone to 3440. The next case is a **subclass**, not a fork: `class SignupWizard extends Wizard`, never `Wizard2`, never `{ variant: 2 }`.\n\nThis page is the proof: `Course` is one of those classes, and you are reading its own demo content rendered through it."),
			},
			{
				title: "Every method is a seam",
				content: () => md("A `ux` exposes the pieces it composed — one method per piece — so a subclass overrides ONE of them instead of reimplementing the whole workflow. `Auth`'s `password_field()` is the worked example: because the password step was already its own method, `MagicAuth extends Auth` swapped it for a magic-link flow in 14 lines and nothing else moved.\n\n**Where it breaks:** a method that composes three things inline, with no seam between them, forces the next caller to fork the whole method just to change one. This page's own class avoided extending `Wizard` for exactly that reason — see its [decisions](/framework/ux/Course/doc/decisions/)."),
			},
			{
				title: "Config words re-skin for free",
				content: () => md("**A `ux` never ships its own compact mode or high-contrast mode.** Both tiers read the same framework tokens, so a [config word](/framework/ui/words/) — `ui-contrast`, `ui-compact` — on the *section* re-skins the workflow and the templates inside it in one pass.\n\nScroll down: the words demo on this page's own [Words](./words/) tab is this exact course, wearing both words, with zero lines of its own density or contrast CSS."),
			},
		],
	},
];

const course = () => new Course({ chapters: chapters() });

const words = () => div.c("flex v gap-2em", () => {
	div.c("flex v gap").style("--gap", "0.5em").append(() => { div.c("h4 muted", "default"); course(); });
	div.c("flex v gap").style("--gap", "0.5em").append(() => { div.c("h4 muted", "ui-contrast ui-compact"); course().ac("ui-contrast ui-compact"); });
});

export default new Doc({
	meta: import.meta,
	title: "Course",
	description: "Chapters of lessons: a rail, a reading column and a next-up card that coordinate — the large-screen showcase.",
	icon: "school",

	files: "Course.js page.js readme.md",
	notes: "decisions",

	children: [
		demo.page("words", words, {
			note: "The same course twice, the lower one wearing `ui-contrast ui-compact`. A **ux never ships a compact mode** — both tiers read the same framework tokens, so a [config word](/framework/ui/words/) on the section re-skins the class and the templates it composed in one pass." }),
	],

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(course, steer).ac("bleed"),
			def: course,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Three coordinated regions.** Click a lesson in the rail — the reading column *and* the next-up card both change, from one `go(lesson)` call. No breakpoint hides the third region: `flex-wrap` drops it below the reading column once the row can't fit both, the same physics that puts the rail on its own line under 38em (`.rail`, `core/Page/Page.css`) the way `ux/Tree`'s master-detail does — widen past that and all three sit side by side.",
		});

		md("## What Course is built from");

		md("Chapters and lessons are plain data — `{ title, lessons: [{ title, content(course){ … } }] }` — the same shape `ui.tree()`'s `nodes:` already takes. State is two things on the instance: `current` (the lesson) and `completed` (a `Set`), touched by exactly four methods — `go()`, `next()`, `back()`, `complete()` — and every region rebuilds through one `update()`, the same throw-it-away-and-redraw trade `Tree.draw()` makes.");

		md("**No persistence.** A `Saver` exists in `ext/`; `Course` does not import it. A caller that wants the course to survive a reload reads and writes `course.current` / `course.completed` around `go()`/`complete()` and composes a `Saver` on top — the seam is the two properties, not a config option.");

		md("**Does it extend `Wizard`?** No — prototyped first, then rejected with evidence: [`doc/decisions.md`](/framework/ux/Course/doc/decisions/).");

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25 pad", course)); },
});
