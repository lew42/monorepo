import { Doc, View, md, h2, small, div, a, icon, span, details, summary } from "/app.js";
import { view } from "/framework/ux/Content/Object/DefaultView.js";
import { agents } from "./live.js";
import { page_work, page_work_strip } from "./work.js";

View.stylesheet(import.meta, "ai.css");   // the `.ai-row` rows below (the stand-in ObjectView.js used to load it)

/**
 * core/Page/ai/ — the BRIDGE between Servex (the always-on process that runs
 * every Claude agent) and the page system. Servex's own roles are documented
 * once, at /framework/servex/ — this page only covers the part that is
 * PAGE-specific: every path is a context. A card's own directory
 * (`ai/<date>/<slug>/`) gets its own fast assistant and its own
 * manager/mastermind, minted from that path, the moment the owner first
 * speaks or types on it (Servex/agents/Layers.js).
 */

// ONE set of tiles — icon, name, one-line meaning, all in the same card,
// reusing the site's own icon-card classes (ux/Content/content.css) rather
// than a bullet list repeating the same five names underneath.
const PARTS = [
	{ name: "Dictation", icon: "mic", href: "doc/dictation/", blurb: "the microphone on every page, and where its words go" },
	{ name: "Fast assistant", icon: "bolt", href: "doc/assistant/", blurb: "the small, quick session that answers a card right away" },
	{ name: "Manager / mastermind", icon: "engineering", href: "doc/manager/", blurb: "the bigger session, kept for a card's whole life, that does the work" },
	{ name: "Sessions & the SDK", icon: "key", href: "doc/sessions/", blurb: "how a session id is made, saved, and resumed later" },
	{ name: "The agents list, live", icon: "groups", href: "agents/", blurb: "everything above, fetched from Servex and shown as it runs" },
];

const ACTIVE = new Set(["working", "idle"]);

export default new Doc({
	meta: import.meta,
	title: "The page-based AI system",
	description: "Every page path is a context: its own session ids, its own fast assistant, its own manager.",
	icon: "smart_toy",

	children: "agents",
	notes: "dictation assistant manager sessions work",

	content(){
		md("**Every page path is a context.** A card's directory (`ai/<date>/<slug>/`) is not just where its log lives — the moment the owner talks or types on it, Servex mints that path its own fast assistant and its own manager, and both keep the same session id for as long as the card is alive. The five parts below are how that works; [Servex](/framework/servex/) documents the agents themselves.");

		// [fix-2026-09-29 finding 5] `.ux-content-icard` centres its text, and this
		// Overview renders inside a catalog's DETAIL column (core's own "content()
		// lands in a catalog" trap, the layout skill) — so without `wide` the five
		// tiles sat in the ~640px measure track, wrapped every two words, and left
		// the right half of the screen empty. `wide` lets this row claim the whole
		// detail column; `navigation/page.js` set the same left-aligned tile pattern
		// the same day (`.card flex v gap-35`).
		div.c("wide flex auto gap", () => {
			PARTS.forEach(p => a.c("card flex v gap-35").href(p.href)
				.style({ textDecoration: "none", color: "var(--ink)" })
				.append(() => {
					icon(p.icon).style({ fontSize: "2rem" });
					span(p.name).style({ fontWeight: "700" });
					small.c("muted", p.blurb);
				}));
		}).style("--column", "14rem");

		// page_work() (work.js) — THIS page's own open work, matched by keyword
		// against every open Servex card and live agent (page-work-data.md has
		// why keyword, not a real field, is what works today). Shown TWICE on
		// purpose, as its own second example: View A always open, View B a
		// one-line strip that opens the same block on click. Recommendation,
		// in one line: View B for most pages — a page's main topic is not its
		// AI work, so a closed strip costs one line until the reader asks for
		// more; View A earns its space only on a page ABOUT the AI system
		// itself, which is exactly this one.
		const WORK_OPTS = { match: ["page-", "page system"] };
		h2("Its own work");
		md("Matched by the keywords `page-` and `page system` — real agents and cards, right now. **View A** (open by default):");
		div.c("card pad", $box => page_work($box, WORK_OPTS));
		md("**View B** (a one-line strip; click to open the same block):");
		div.c("card pad", $box => page_work_strip($box, WORK_OPTS));
			// [fix-2026-09-29-2 finding 8] the answer to "opt-in or automatic?" used to
			// live one click down, in doc/work.md, and never on this page itself.
			md("**Doc pages opt in with one line** — `ext/Doc` pages don't get this block automatically; a page places `page_work()` itself. Why, and how: [`doc/work.md`](doc/work/).");

		// SHOW, DON'T JUST LINK — the very thing this page is about, right here: real
		// agents, fetched live, rendered by the default instance view (ux/Content/Object/DefaultView.js).
		// Fails soft (live.js): no Servex running paints one plain sentence, never an
		// error. `GET /api/agents` answers with EVERY agent this process has ever
		// held, most of them long stopped (thousands, after a few days uptime) — so
		// this keeps only `working`/`idle`, newest first, capped at 8, each row
		// collapsed to its id/role/state until clicked open.
		h2("Live right now");
		div.c("card pad", $box => {
			agents().then(rows => $box.append(() => {
				if (rows === null) return void small.c("muted", "Servex is not answering on this machine — nothing to show.");

				const active = rows.filter(r => ACTIVE.has(r.state))
					.sort((x, y) => new Date(y.started_at) - new Date(x.started_at));
				const shown = active.slice(0, 8);

				div.c("flex v gap-25", () => {
					small.c("muted", `${active.length} live of ${rows.length} registered`);
					if (!shown.length) small.c("muted", "Nothing working or idle right now.");
					shown.forEach(row => details.c("ai-row", () => {
						summary(`${row.id} · ${row.role} · ${row.state}`);
						div.c("ai-row-body", () => view(row));
					}));
					a.c("page-link", "The full list →").href("agents/");
				});
			}));
		});
	},
});
