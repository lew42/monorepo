import { Page, p, div, h2, span } from "/app.js";
import Concepts from "../../ux/Content/Concepts/Concepts.js";
import { page_work_strip } from "/framework/core/Page/ai/work.js";

/* Every system's questions, read live from `questions.json` — which `node Server/review.mjs
 * --questions` generates from the skills' own `questions.md` files (never copied here by hand,
 * so a new rule brings its question with it automatically). The review skill asks these same
 * questions, in this same order, of every finished task. */

// A name only the newer "Symbols" icon set has renders as its literal word (new-page skill) — so
// every name here is one already used live elsewhere on this site (grepped, not guessed).
//
// No "Requirements" entry: the review skill asks requirements questions too, but they live in
// the skill's own text, not a questions.md with numbered, bracket-tagged lines — so
// questions.json (and this wall) never carries a "Requirements" system (review 2026-09-30
// finding 6). Adding one here would be dead code.
const SYSTEM_ICON = {
	"Page structure": "view_quilt",
	Navigation: "explore",
	Layout: "dashboard",
	Sizing: "aspect_ratio",
	Wrapping: "format_align_left",
	"Spacing and padding": "padding",
	"Colour and contrast": "contrast",
	Flow: "timeline",
	Words: "list_alt",
};

const anchor = heading => heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default new Page({
	meta: import.meta,
	title: "Review questions",
	description: "Every question a fresh reviewer asks, per system, in the order it asks them.",
	icon: "fact_check",

	content(){
		p("Every question a fresh reviewer asks, per system, in the order it asks them.");

		// Capture every box now, synchronously — content() is about to hit an await
		// (the fetch below), and nothing built after that would land here.
		//
		// The page's own wide track (core/Page/Page.css: `.page > .wide { grid-column:
		// wide }`) for the tiles too, so they get the full 3440 width to wrap across
		// instead of sitting in the narrow reading column (review 2026-09-30 finding 3:
		// they wrapped to 3 rows with the right half empty).
		const $tiles = div.c("wide flex wrap gap-50");

		// "What's in flight" moved up here, right after the tiles and before the wall of
		// systems — it used to sit under the whole wall, 4-12 screens down (review
		// 2026-09-30 finding 4: "open before done" belongs near the top).
		h2("What's in flight");
		div.c("card pad", $box => page_work_strip($box, { match: ["review"], page: this }));

		// The wall of systems, still in the `wide` track so it fills a 3440 screen. Was
		// `.masonry` (CSS columns), which packs top-to-bottom per COLUMN — so a row across
		// the screen read out of order (review 2026-09-30 finding 2: readme says "in the
		// order it asks them", the wall didn't). `.grid.auto` (framework.css:
		// `repeat(auto-fit, minmax(var(--column),1fr))`) is row-major instead: each row
		// fills left to right in source order, then wraps to the next row, so the systems
		// read in the same order questions.json lists them. `.gap` is the matching spacing
		// utility for a grid (framework.css: `.gap { gap: var(--gap) }`). `26em` overrides
		// the framework.css 14em tile default, inline on the box (a runtime token
		// override, css skill) — 14em wrapped "Navigation" mid-word and squeezed every
		// question to ~5 words a line; a card here holds full sentences. No existing
		// framework.css utility sets `align-items: start` on a `.grid` (grepped) — grid's
		// default `stretch` just makes every card in a row match the row's tallest, which
		// keeps the row-major reading order intact, so nothing new was added for it.
		const $sections = div.c("wide grid auto gap").style("--column", "26em");
		const $note = p.c("muted");

		fetch(new URL("questions.json", import.meta.url)).then(r => r.json()).then(data => {
			const systems = data.systems || [];

			// The first thing on the page: what it's made of, as linked icon tiles
			// (page skill, step 5a) — one per system, jumping to that system's own
			// section below rather than to a separate child page.
			$tiles.append(() => new Concepts({
				items: systems.map(s => ({ name: s.heading, icon: SYSTEM_ICON[s.heading] || "label", href: "#" + anchor(s.heading) })),
			}));

			// Each system is one framed box (`card pad flow` — css skill: a framed box takes
			// `.card`, which carries its own padding; `.flow` for the stack of questions
			// inside it) so `.grid.auto` above has real boxes to pack into its row-major tracks.
			$sections.append(() => systems.forEach(s => {
				div.c("card pad flow", () => {
					h2(s.heading).attr("id", anchor(s.heading));
					s.questions.forEach(q => div.c("flex v gap-25", () => {
						p(`${q.n}. ${q.text}`);
						// The rule(s) behind the question, as a quiet tag — .muted is the
						// existing de-emphasis class (css skill), never a new one.
						span.c("muted", q.rules.join(" · "));
					}));
					// Not a clickable link: `.claude/skills/` is outside `public/`, the one
					// folder this site actually serves (Server/Server.js), so there is no
					// URL for it to point at — named here for whoever opens it in an editor.
					span.c("muted", `Source: ${s.file}`);
				});
			}));

			const when = data.generated_at ? new Date(data.generated_at).toLocaleString() : "unknown";
			$note.text(`Generated from the skills' questions.md files by node Server/review.mjs --questions — last run ${when}.`);
		}).catch(e => $note.text(`Could not load questions.json (${e.message}) — run node Server/review.mjs --questions.`));
	},
});
