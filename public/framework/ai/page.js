import { Page, md, div, AITask } from "/app.js";
import { dashboard, rail, effort_board, log_board, has_page_js, warm } from "/framework/ext/AITask/dashboard.js";
import picker from "/framework/ai/v/versions.js";   // the versions, and the one picker every version wears
import { board_route } from "/framework/ai/v/3/page.js";   // the board's five view urls (/framework/ai/grid/ …) still route here
import { CONCEPTS } from "./concepts.js";   // the AI system, one entry per concept: the tiles and their pages
import { TABS, SYSTEM_PARTS, tab_page, readme_chain, heading } from "./overview.js";   // the top tabs: Overview · System · Skills · Objects · Authoring · CLAUDE.md

/* `?v1` — the original board, kept addressable at this same url. Read fresh on
   every call rather than captured once: a picker click is a real navigation, but
   an intra-page route change is not, and a captured value would go stale. */
const v1 = () => new URLSearchParams(location.search).has("v1");

export default new Page({
	meta: import.meta,
	title: "AI",
	description: "The AI system: who does the work, how it is tracked, and how it lands.",
	icon: "smart_toy",

	// One nav link, whatever the date children say: the rail below is the way in.
	leaf: true,
	children: "asks process review council audits 2026-09-28 2026-09-25 2026-09-24 2026-09-23 2026-09-22 2026-09-21 2026-09-20 2026-09-19 2026-09-18 2026-09-17 2026-09-14 2026-09-13 2026-09-08 2026-09-06 2026-09-05 2026-09-04 2026-09-01 2026-08-31 2026-08-30 2026-08-29 2026-08-28 2026-08-27 2026-08-26 2026-08-21 2026-08-19 2026-08-18 2026-08-17 2026-08-16 2026-08-15 2026-08-14 2026-08-13 2026-08-12 2026-08-11 2026-08-10 2026-08-09 2026-08-08",

	/* LEVEL 1 IS THE AI SYSTEM, SHOWN (the owner, 2026-09-30: "just delete the
	   current AI page"). The V3 board that stood here lives on at /framework/ai/v/3/,
	   and `?v1` still draws the original board below. `board_drawn` stays true so
	   the board's own hand-back (v/3/page.js draw_board) never paints it here. */
	board_drawn: true,
	content(){
		if (!v1()){
			// The same top tabs as a module's docs (the owner, 2026-09-30). The first
			// tab owns this url; each tab's page is routed below (tab_page, overview.js).
			// ⚠ The default tab is never routed to: tabs() only looks it up, so add it now.
			// ⚠ Add every tab now, not only the default: the strip labels a tab from its
			// page's `label`, and only once `loading` says every child is real, so a tab
			// added late reads as its bare url name ("skills") until it is opened.
			for (const t of TABS) if (!this.children.has(t)) this.add(t, tab_page(this, t));
			this.loading ??= Promise.resolve();
			const $tabs = this.tabs(TABS.join(" ")).ac("wide");   // the panel fills the screen, not the text measure
			// Five short tabs wrap at a phone width rather than scroll: ext/tabs hides the
			// scrollbar, so a scrolled strip loses Overview off the left edge.
			$tabs.el.querySelector(".tab-bar")?.style.setProperty("flex-wrap", "wrap");
			return;
		}

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
		/* THE FIVE VIEWS ARE FIVE URLS (board-declutter, 2026-09-22) —
		   `/framework/ai/days/`, `/framework/ai/now/`, `/framework/ai/grid/`,
		   `/framework/ai/timeline/` and `/framework/ai/prompts/` each open
		   that view of the board this page draws, and a card opened inside one
		   gets its own url under it. The owner's own words: "the timeline,
		   prompts, grid, now, and days, don't even have a route... a live
		   reload would navigate me away from this page." First, because none
		   of the five can ever look like a date, `log` or `effort`. The board
		   itself owns the routing (`v/3/page.js`'s own `board_route`), so
		   `/framework/ai/grid/` and `/framework/ai/v/3/grid/` cannot drift. */
		if (TABS.includes(name)) return tab_page(this, name);
		// Old urls keep working: the Overview is now System, and its parts moved under it.
		if (name === "overview") return tab_page(this, "system", this.url + "overview/");
		if (SYSTEM_PARTS.includes(name)) return tab_page(this, name);
		const concept = CONCEPTS.find(c => c.slug === name);
		if (concept) return concept_page(this, concept);

		const board_view = board_route(this, name);
		if (board_view) return board_view;

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
		// Year/month/day path dirs (2026/09/25/<card>/…) are bare pass-throughs, so a card's own page.js is reachable below them.
		if (/^\d{4}$/.test(name)){ const seg = (n, u, d) => new Page({ title: n, url: u, content(){}, route(m){ if (d < 3 && /^[\w-]+$/.test(m)) return seg(m, u + m + "/", d + 1); } }); return seg(name, this.url + name + "/", 0); }

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

/* One concept's page: the gist first, then a few items, then the code that owns it,
   then the Servex page where Servex implements it (linked, never repeated). */
function concept_page(parent, c){
	const links = list => list.map(([t, h]) => h ? `[${t}](${h})` : t).join(" · ");
	return new Page({
		title: c.name, icon: c.icon, url: parent.url + c.slug + "/", description: c.gist,
		content(){
			md(`**${c.gist}**`);
			md(c.items.map(i => "- " + i).join("\n"));
			md("Code: " + links(c.code));
			if (c.servex.length) md("In Servex: " + links(c.servex));
			// A system is shown by its effect (the owner, 2026-09-30: the iceberg).
			// Where a page's data lives (mastermind-servex-9's merge-approval proposal, §7).
			if (c.slug === "inboxes"){
				heading("Everything is a page", "A page gets a directory once it has grown. Until then it is a line in its parent's `page.jsonl`. A name that only groups pages is a namespace.");
				md([
					"| State | On disk | Reached at | Example |",
					"|---|---|---|---|",
					"| **Real page** | a directory with `page.jsonl` | its url | `/framework/ext/Chat/` |",
					"| **Virtual page** | one line with an `id` in the parent's `page.jsonl` | `parent/<id>/` | a chat message, an inbox note |",
					"| **Namespace** | nothing: a key other lines carry | a filtered view, `?tag=servex` | a tag, a kind, a day |",
				].join("\n"));
				heading("Where per-path AI data lives today");
				md([
					"| What | File |",
					"|---|---|",
					"| A module's own facts: its inbox, notes, a card's messages | `<module>/page.jsonl` |",
					"| One task: ask, plan, log, landing | `ai/<date>/<slug>/task.jsonl` |",
					"| Site-wide feeds and indexes | `ai/log.jsonl`, `day.jsonl`, `board.jsonl`, `cards.jsonl`, `chat.jsonl`, `asks.jsonl` … |",
				].join("\n"));
				md("**Proposed, not built:** `promote(parent, id)` turns a virtual page into a real one. The thread moves into its own folder, and a `moved` line keeps the old url working. The whole case: [the proposal, §7](/framework/ai/2026-09-30/servex-mastermind/merge-approval-proposal.md).");
			}
			if (c.slug === "readmes"){
				heading("The chain, live", "What a fresh agent in `public/framework/ai/` is handed, root first.");
				readme_chain("public/framework/ai/");
			}
		},
	});
}
