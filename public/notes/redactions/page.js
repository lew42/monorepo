import { Page, md } from "/app.js";

/* Layout (the layout skill's five): a plain page in the app's main region — one reading
   column, `.md` flow, no size decision beyond that. Not a `NotesNote`: this page has no
   single photo of its own to show (`shot()` and the left/right split are built for ONE
   note's picture), it points at seventeen different ones instead, so a plain `Page` with
   ordinary links is the whole fit. One region, no children.

   Every line below was read fresh off the original photo with the Read tool — not lifted
   from the note page's own paraphrase — because a note page sometimes already softens a
   redaction (an initial rather than the name), and this page's one job is the word
   underneath that softening. In notebook (image) order, same as the realm itself. */

const ENTRIES = [
	{ img: "003", slug: "drop-target-ux", title: "Drop target UX",
		removed: "A short personal aside on the right page, headed by the question "
			+ "“IS GOD/SATAN HOLDING ME BACK?” and a checklist under “Straight "
			+ "Talk”: “Don't be gay,” “Don't be homophobic,” “Be careful "
			+ "of temptation.”" },

	{ img: "007", slug: "meeting-notes-are-ip", title: "Meeting notes are IP",
		removed: "Two names, each reduced to initials on the page: “C. C.” is Chris "
			+ "Cleary, and “L.” is Lucas." },

	{ img: "008", slug: "one-video-everywhere", title: "One video, everywhere",
		removed: "One name reduced to an initial: “C.” is Chris." },

	{ img: "015", slug: "switch-or-transition", title: "Switch or transition",
		removed: "The right page's shopping and moving list, left untranscribed: kitchen "
			+ "table · sofa · TV + cabinet · bedframe · spices · groceries "
			+ "(smoothies? slow cooker? beef, chicken, pork) · “job?”" },

	{ img: "019", slug: "personal-specs", title: "Personal specs",
		removed: "One name reduced to an initial: “BROTHER JESUS (E.)” is Eric." },

	{ img: "021", slug: "edge-selection", title: "Edge selection",
		lead: "Two entries — 021 and 022 — hold back more than an initial. Their "
			+ "right-hand page carries a home address, utility numbers, a password hint "
			+ "and apartment logistics, and this site deploys publicly, so nothing from "
			+ "either page is quoted below, only named.",
		removed: "The right-hand page, cropped out of the photo and the words both: a "
			+ "home address, two utility account numbers, and a password hint." },

	{ img: "022", slug: "parallel-generation", title: "Parallel generation",
		removed: "The right-hand page, cropped out of the photo and the words both: "
			+ "apartment-hunting logistics — rents, deposits, dates and people's names." },

	{ img: "024", slug: "split-responsive-viewer", title: "Split responsive viewer",
		removed: "A personal line at the top of the left page, a reminder about an "
			+ "apartment: “For Valley Village(s) — 6mo.”" },

	{ img: "027", slug: "short-minded", title: "Short-minded",
		removed: "A friend's name reduced to initials: “C.” is Charlie. The "
			+ "annotation beside the name is also left off the page: “nicotine, "
			+ "alcohol, coffee → weed.”" },

	{ img: "028", slug: "analyze-spacing-as-percent", title: "Analyze the spacing as a percent",
		removed: "A relative's name reduced to an initial: “Uncle C.” is Uncle "
			+ "Chris." },

	{ img: "035", slug: "we-think", title: "We think",
		lead: "From here, five entries also touch the owner's own name. This file keeps "
			+ "the same rule every other page here already keeps — the owner is never "
			+ "named in a file — so each of the five says what role the name played "
			+ "instead of quoting it.",
		removed: "The skill's own name, and one line on the right page that addresses "
			+ "the owner directly — both built from the owner's first name. Named for "
			+ "what they are, not quoted (see above)." },

	{ img: "036", slug: "load-but-dont-render", title: "Load, but don't render",
		removed: "The fourth persona's name, built the same way as “Simple Steve,” "
			+ "“Elegant Eric” and “Technical Tim” — an adjective plus the "
			+ "owner's first name. Named, not quoted (see above)." },

	{ img: "039", slug: "walk-down-or-jump-to-topic", title: "Walk down, or jump to topic?",
		removed: "The note's first line, which names a real directory in this repo — and "
			+ "that directory's name is the owner's first name. Named, not quoted (see "
			+ "above)." },

	{ img: "040", slug: "starter-repo-vs-scaffolding", title: "Starter repo vs scaffolding?",
		removed: "The case-insensitivity example, which uses the owner's first name "
			+ "twice in two different cases — the note page already shows its shape as "
			+ "“Name && name.” Named, not quoted (see above)." },

	{ img: "052", slug: "straight-talk", title: "Straight talk",
		removed: "A sketched product name built from the owner's surname — the note "
			+ "page already shows its shape as “the L. Cube.” Named, not quoted "
			+ "(see above)." },

	{ img: "057", slug: "page-nav-from-sub", title: "Page nav should come from .sub",
		removed: "The bottom-right shopping list, left untranscribed: notebooks · mic "
			+ "· resume/job · website · eggs · grill tools & lighters · "
			+ "water · setups · clothes (suit? shirts?) · cheese & pepper(?) "
			+ "· a meat item(?) · energy · tea · a USB-C cable(?)." },

	{ img: "059", slug: "web-of-lies", title: "Web of lies",
		removed: "Three margin doodles, described rather than quoted since a doodle has "
			+ "no words of its own — except one does: a small pointed-hat doodle beside "
			+ "a two-word aside that reads as dismissive slang, not repeated here. The "
			+ "other two: a sketched tower labelled “MANHURIA” (the note's own "
			+ "spelling is unclear) and the single word “CRYPTO” beside it." },
];

export default new Page({
	meta: import.meta,
	title: "Redactions",
	description: "Exactly what the notebook transcriptions left out, verbatim, each linked to its original photo.",

	content(){
		md("Every note under `/notes/` is a transcription of a photographed notebook "
			+ "page, and a transcription is a choice about what to leave out. This page "
			+ "is the other half of that choice: everything those seventeen pages left "
			+ "out, typed out here instead, so none of it is actually hidden from the "
			+ "owner.");

		md("Every link below to an original photo — `/notes/inbox/<file>.jpg` — opens "
			+ "only on a local checkout, because the `inbox/` folder itself was never "
			+ "committed to this repository.");

		this.entries();
	},

	entries(){
		ENTRIES.forEach(e => {
			if (e.lead) md(e.lead);
			md(`### ${e.img} — [${e.title}](/notes/${e.slug}/)\n\n${e.removed}\n\n`
				+ `[Original photo](/notes/inbox/2026-09-06-${e.img}.jpg) — opens only `
				+ `on a local checkout.`);
		});
	},
});
