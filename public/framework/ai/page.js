import { Page, md, div, AITask } from "/app.js";
import { dashboard, rail, effort_board, log_board, has_page_js, warm } from "/framework/ext/AITask/dashboard.js";
import picker from "/framework/ai/v/versions.js";   // the versions, and the one picker every version wears
import { top_level } from "/framework/ai/v/3/page.js";   // V3 IS this page's content now — see content() below

/* `?v1` — the original board, kept addressable at this same url. Read fresh on
   every call rather than captured once: a picker click is a real navigation, but
   an intra-page route change is not, and a captured value would go stale. */
const v1 = () => new URLSearchParams(location.search).has("v1");

export default new Page({
	meta: import.meta,
	title: "AI",
	description: "The work worth going back to, newest first.",
	icon: "smart_toy",

	// One nav link, whatever the date children say: the rail below is the way in.
	leaf: true,
	children: "process 2026-09-21 2026-09-20 2026-09-19 2026-09-18 2026-09-17 2026-09-14 2026-09-13 2026-09-08 2026-09-06 2026-09-05 2026-09-04 2026-09-01 2026-08-31 2026-08-30 2026-08-29 2026-08-28 2026-08-27 2026-08-26 2026-08-21 2026-08-19 2026-08-18 2026-08-17 2026-08-16 2026-08-15 2026-08-14 2026-08-13 2026-08-12 2026-08-11 2026-08-10 2026-08-09 2026-08-08",

	// The board IS the dashboard — catalog's previews() override, split-screen for free.
	// content() becomes the "intro" child catalog() adds (readme.md's own note) — the
	// only rendered copy of `description` above, since nav cards read the field but the
	// page itself never did (audit 2026-08-30: blank title, no orienting line).
	// ⚠ ONE short line (2026-09-08). It said "One page per working day", which stopped
	//   being true when the day spine moved to `log/` — and two lines of prose above the
	//   fold is telling the reader what they are about to be shown.
	/* THE FRONT DOOR IS V3 (the owner, 2026-09-21: "the AI page should default to
	   V3 … It should be a quick and easy fix to make framework slash AI
	   automatically switch to V3").

	   Not a redirect. The picker's own first entry is `{ text: "V1", href:
	   "/framework/ai/" }` (`v/versions.js`), so redirecting this url would leave
	   V1 with no address at all and the picker looping straight back to V3. And
	   every date/task/log/effort link on the site routes through THIS page's own
	   `route()` below — a redirect would have to reproduce all of it.

	   So the url, the routing and the children stay exactly as they are; only
	   what this page DRAWS changes. `?v1` still draws the original board, which
	   is where the picker's V1 entry now points — one query param instead of a
	   second copy of the catalog machinery somewhere under `v/`. */
	content(){
		if (!v1()) return top_level(this, null);

		/* ONE ROW: the title and the version picker, side by side. Core draws the h1
		   just before it calls content(), so the row is made here and the h1 it
		   follows is moved into it — no core edit, and if core ever stops drawing
		   the title first, the row simply holds the picker alone. */
		const $head = div.c("ai-head", () => picker("/framework/ai/?v1"));
		const $title = $head.el.previousElementSibling;
		if ($title?.matches(".page-title")) $head.el.prepend($title);
		md("A card for each thing worth going back to. Everything else is in [the log](/framework/ai/log/).");
	},
	// ⚠ Both of these draw the V1 board and must stay off when V3 is what is
	// showing — `catalog()` mounts its own region and `previews()` fills it, so
	// leaving either on paints the old rail underneath the new board.
	initialize(){ if (v1()) this.catalog(); },
	previews(){ return v1() ? rail(this) : []; },

	// A day that hasn't written its page yet is still a dashboard — and its
	// task dirs still get the manifest viewer, same as a declared day's route().
	// ⚠ A plain Page sets no `$pages`, so a routed task walks up to MY catalog
	// region and lands beside its day rather than inside it — which is why
	// ai.css stands the day aside while one of its tasks is showing.
	//
	// `effort/` is the second segment a category tag can claim, and it earns the
	// nesting: a bare slug here is indistinguishable from a typo, and would turn
	// every miss under /framework/ai/ into a blank filter.
	route(name){
		if (/^\d{4}-\d{2}-\d{2}$/.test(name)){
			// Fired the instant this day is routed to, not when its dashboard()
			// happens to render — a cold deep link straight to a task below has
			// no earlier chance, and every other child() hop still ahead (this
			// day Page's own construction, the task segment's child() call) gives
			// the fetch time to land before route(task) below ever asks.
			warm(name);
			return new Page({
				title: name, icon: "history", url: this.url + name + "/",
				content(){ dashboard(this); },
				// A task dir with its own page.js wins by NOT being claimed here —
				// Page.child()'s own filesystem probe (Page.load()) then dynamic-imports
				// it. `has_page_js` is undefined until the day's own dashboard() has
				// warmed the listing; undefined reads as "don't know", same as false.
				route(task){
					if (task.includes(".") || has_page_js(name, task)) return;
					return new AITask({
						title: task, icon: "receipt_long",
						url: this.url + task + "/", src: this.url + task + "/session.json",
					});
				},
			});
		}

		// `log/` is the archive this page used to BE: every task of every day,
		// in-flight first, forty at a time. A route rather than a `log/` dir with
		// its own page.js, for one reason — the date route above is a regex on the
		// SAME segment, and a declared child would have to be kept out of its way
		// forever. `effort/` is the prior art; `log` can never look like a date.
		if (name === "log") return new Page({
			title: "Everything", icon: "history", url: this.url + "log/",
			description: "Every task of every day, in-flight first, forty at a time.",
			content(){ return log_board(this); },
		});

		if (name === "effort") return new Page({
			title: "Efforts", icon: "label", url: this.url + "effort/",
			content(){ md("An **effort** is the thread of work that outlives any one day. Every card wears its own as a tag — click one to see the board filtered to it."); },
			route(slug){ return new Page({
				title: slug.replaceAll("-", " "), icon: "label", url: this.url + slug + "/",
				content(){ return effort_board(this, this.name); },
			}); },
		});
	},
});
