import { Page, p, div, h2, span } from "/app.js";
import Concepts from "../../ux/Content/Concepts/Concepts.js";
import { page_work_strip } from "/framework/core/Page/ai/work.js";

/* Every system's questions, read live from `questions.json` — which `node Server/review.mjs
 * --questions` generates from the skills' own `questions.md` files (never copied here by hand,
 * so a new rule brings its question with it automatically). The review skill asks these same
 * questions, in this same order, of every finished task. */

// A name only the newer "Symbols" icon set has renders as its literal word (new-page skill) — so
// every name here is one already used live elsewhere on this site (grepped, not guessed).
const SYSTEM_ICON = {
	Requirements: "rule",
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
		const $tiles = div.c("flex wrap gap-50");
		const $sections = div.c("flow");
		const $note = p.c("muted");

		fetch(new URL("questions.json", import.meta.url)).then(r => r.json()).then(data => {
			const systems = data.systems || [];

			// The first thing on the page: what it's made of, as linked icon tiles
			// (page skill, step 5a) — one per system, jumping to that system's own
			// section below rather than to a separate child page.
			$tiles.append(() => new Concepts({
				items: systems.map(s => ({ name: s.heading, icon: SYSTEM_ICON[s.heading] || "label", href: "#" + anchor(s.heading) })),
			}));

			$sections.append(() => systems.forEach(s => {
				h2(s.heading).attr("id", anchor(s.heading));
				div.c("flow", () => {
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

		h2("What's in flight");
		div.c("card pad", $box => page_work_strip($box, { match: ["review"], page: this }));
	},
});
