import { Page, md, div, a, h1, icon, span } from "/app.js";
import AIRail, { card_page } from "/framework/ai/rail/rail.js";

// ⚠ Only these shapes: AI 2 claims EVERY unknown name as a card, but here a real folder with its own page.js is found by the probe AFTER route(). Doc: doc/ai-page-notes.md.
// A rail row's own page keeps the rail beside it (the owner, 2026-10-13: "the rail is a switcher"): the pinned Today/Yesterday
// day pages and Your prompts are rail rows, so they are here; every other page routed below takes the whole width.
const RAIL_ID = /^(inbox|log|live|now|view|framework|your-prompts|\d{4}|\d{4}-\d{2}-\d{2}|p-\d+|ask:.+|topic-[\w-]+|[0-9a-f]{8}-[0-9a-f-]{27})$/;
const CARD_ID = /^(p-\d+|ask:.+|topic-[\w-]+|[0-9a-f]{8}-[0-9a-f-]{27})$/;
import { rail, effort_board, log_board, monthPage } from "/framework/ai/AITask/dashboard.js";
import AIDay from "./AIDay/AIDay.js";   // a day as a check-mark list, read from the store
import { Versions } from "/framework/ai/v/Versions.js";   // the versions, and the one picker every version wears
import { board_route } from "/framework/ai/v/3/page.js";   // the board's five view urls (/framework/ai/grid/ …) still route here
import { CONCEPTS } from "./concepts.js";   // the AI system, one entry per concept: the tiles and their pages
import { AIOverview } from "./AIOverview.js";   // the top tabs: Overview · System · Skills · Objects · Authoring · CLAUDE.md
import StoreFolder from "./AISession/StoreFolder.js";   // old ai/<date>/<task>/ addresses redirect into the sessions store
import AIDashboard from "./AIDashboard/AIDashboard.js";   // the default page: today's sessions by origin, nested, cost rolled up

// "tests" → "Tests" — the label a detected tab wears when nobody says otherwise.
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// `?v1` — the original board; read fresh on every call. Doc: doc/ai-page-notes.md.
const v1 = () => new URLSearchParams(location.search).has("v1");

// The bare url draws the AI dashboard; every other url under it (inbox/, a card, a day) keeps the rail. The Inbox link is a hard
// navigation (target=_self), because the root page is built once per load. Doc: doc/ai-dashboard-plan.md.
const is_dash = () => !v1() && location.pathname.replace(/\/?$/, "/") === "/framework/ai/";

export default new Page({
	meta: import.meta,
	title: "AI",
	description: "The AI system: who does the work, how it is tracked, and how it lands.",
	icon: "smart_toy",

	// One nav link, whatever the date children say: the rail below is the way in.
	leaf: true,
	pinned: "queue",   // ...except the task queue, shown under AI in the site sidebar (the owner, 2026-10-24: "there's no link to it")
	// The page is the band and the rail, and nothing scrolls but their columns (ux/Inbox).
	classes: v1() ? undefined : is_dash() ? "ad-page" : "full fill",
	children: "now queue tracking readmes tasks classes AISession quick-fix asks process review council audits tests local models usage",   // day folders moved into sessions/ (ai/doc/task-folders.md); old day urls redirect in route()

	// `board_drawn` stays true so the board's own hand-back (v/3/page.js) never paints it here. Doc: doc/ai-page-notes.md.
	board_drawn: true,
	content(){
		if (is_dash()) return void new AIDashboard();
		if (!v1()){
			// Inbox owns the bare URL and wears `.tab-default`; the band is the title and tabs. Doc: doc/ai-page-notes.md.
			div.c("inbox-head", () => {
				// The title is the way back to the inbox from any page under it (the owner, 2026-10-13: the header did not navigate back).
				div.c("doc-well", () => h1.c("doc-title h2", () => a.c("inbox-head-home").href(this.url).attr("title", "Back to the AI inbox")
					.append(() => { icon(this.icon); span(this.title ?? "AI"); })));
				div.c("tabs block", () => {
					const $bar = div.c("tab-bar", () => { a.c("tab tab-default").href(this.url).text("Inbox"); });
					// Tabs are detected by AIOverview.detectTabs() and render after mark(). Doc: doc/ai-page-notes.md.
					AIOverview.detectTabs(this).then(tabs => {
						$bar.append(() => tabs.forEach(({ name }) => a.c("tab").href(this.url + name + "/").text(cap(name))));
						this.app?.router?.mark_links();
					});
				});
			});
			// AIRail is the same class AI 2 builds (CLAUDE.md law 6): one of everything.
			this.ai2 = new AIRail({ page: this }).mount();
			return;
		}

		// V1 only: the title and the version picker, side by side. Doc: doc/ai-page-notes.md.
		const $head = div.c("ai-head", () => Versions.picker("/framework/ai/?v1"));
		const $title = $head.el.previousElementSibling;
		if ($title?.matches(".page-title")) $head.el.prepend($title);
		md("A card for each thing worth going back to. Everything else is in [the log](/framework/ai/log/).");
	},
	// ⚠ Both catalog() and previews() draw the V1 board and must stay off when V3 is showing.
	initialize(){ if (v1()) this.catalog(); },
	previews(){ return v1() ? rail(this) : []; },

	// ⚠ A plain Page sets no `$pages`, so a routed task walks up to this page's catalog and lands beside its day. Doc: doc/ai-page-notes.md.
	add(name, child){
		const page = Page.prototype.add.call(this, name, child);
		if (!v1() && !RAIL_ID.test(name))
			page.classes = [page.classes, "inbox-takeover"].filter(Boolean).join(" ");
		return page;
	},

	route(name){
		// Five views each get their own URL; none can look like a date, `log`, or `effort`. Doc: doc/ai-page-notes.md.
		if (AIOverview.VIRTUAL_TABS.includes(name) && !(v1() && name === "log")) return AIOverview.tabPage(this, name);
		if (name === "overview") return AIOverview.tabPage(this, "system", this.url + "overview/");
		if (AIOverview.SYSTEM_PARTS.includes(name)) return AIOverview.tabPage(this, name);
		const concept = CONCEPTS.find(c => c.slug === name);
		if (concept) return concept_page(this, concept);

		// Pinned Now card wins ahead of board_route(). Doc: doc/ai-page-notes.md.
		if (name === "now") return card_page(this, "now");

		// AIRail.handles() is the ONE list; AIRail.route() is what AI 2 uses.
		if (!v1() && AIRail.handles(name)) return AIRail.route(this, name);
		if (!v1() && CARD_ID.test(name)) return card_page(this, name);

		const board_view = board_route(this, name);
		if (board_view) return board_view;

		if (/^\d{4}-\d{2}-\d{2}$/.test(name)){
			// A day is one check-mark list read from the store (AIDay). A task url under it is an old address: redirect or look it up in the store.
			return new Page({
				title: name, icon: "history", url: this.url + name + "/", classes: "aid-page",
				content(){ new AIDay(); },
				route(task){
					const moved = !task.includes(".") && StoreFolder.moved(this.url + task + "/");
					if (moved) return StoreFolder.redirect(this.url + task + "/", moved);
					if (task.includes(".")) return;
					return StoreFolder.lookup(this.url + task + "/", name, task);
				},
			});
		}

		// Month (deliverable 5): checked after the day regex. Doc: doc/ai-page-notes.md.
		if (/^\d{4}-\d{2}$/.test(name)) return new Page({
			title: name, icon: "calendar_month", url: this.url + name + "/",
			content(){ monthPage(this, name); },
		});

		// V1 only: year/month/day dirs as bare pass-throughs. `log` and `effort` can never look like dates.
		if (/^\d{4}$/.test(name)){ const seg = (n, u, d) => new Page({ title: n, url: u, content(){}, route(m){ if (d < 3 && /^[\w-]+$/.test(m)) return seg(m, u + m + "/", d + 1); } }); return seg(name, this.url + name + "/", 0); }

		// Task log: every task of every day, in-flight first. Doc: doc/ai-page-notes.md.
		if (name === "all-tasks" || name === "log") return new Page({
			title: "Everything", icon: "history", url: this.url + name + "/",
			description: "Every task of every day, in-flight first, forty at a time.",
			content(){ return log_board(this); },
		});

		// Effort: a thread of work that outlives a day; each card wears one as a tag.
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

// Concept page: gist, items, code, Servex page (linked, never repeated). Doc: doc/ai-page-notes.md.
function concept_page(parent, c){
	const links = list => list.map(([t, h]) => h ? `[${t}](${h})` : t).join(" · ");
	return new Page({
		title: c.name, icon: c.icon, url: parent.url + c.slug + "/", description: c.gist,
		content(){
			md(`**${c.gist}**`);
			md(c.items.map(i => "- " + i).join("\n"));
			md("Code: " + links(c.code));
			if (c.servex.length) md("In Servex: " + links(c.servex));
			// A system is shown by its effect (the owner, 2026-09-30: the iceberg). Doc: doc/ai-page-notes.md.
			if (c.slug === "inboxes"){
				AIOverview.heading("Everything is a page", "A page gets a directory once it has grown. Until then it is a line in its parent's `page.jsonl`. A name that only groups pages is a namespace.");
				md([
					"| State | On disk | Reached at | Example |",
					"|---|---|---|---|",
					"| **Real page** | a directory with `page.jsonl` | its url | `/framework/ext/Chat/` |",
					"| **Virtual page** | one line with an `id` in the parent's `page.jsonl` | `parent/<id>/` | a chat message, an inbox note |",
					"| **Namespace** | nothing: a key other lines carry | a filtered view, `?tag=servex` | a tag, a kind, a day |",
				].join("\n"));
				AIOverview.heading("Where per-path AI data lives today");
				md([
					"| What | File |",
					"|---|---|",
					"| A module's own facts: its inbox, notes, a card's messages | `<module>/page.jsonl` |",
					"| One task: ask, plan, log, landing | `ai/<date>/<slug>/task.jsonl` |",
					"| Site-wide feeds and indexes | `ai/log.jsonl`, `day.jsonl`, `board.jsonl`, `cards.jsonl`, `chat.jsonl`, `asks.jsonl` … |",
				].join("\n"));
				md("**Proposed, not built:** `promote(parent, id)` turns a virtual page into a real one. The thread moves into its own folder, and a `moved` line keeps the old url working. The whole case: [the proposal, §7](/framework/ai/sessions/2026/09/30/servex-mastermind/merge-approval-proposal.md).");
			}
			if (c.slug === "readme-system"){
				AIOverview.heading("The chain, live", "What a fresh agent in `public/framework/ai/` is handed, root first.");
				AIOverview.readmeChain("public/framework/ai/");
			}
		},
	});
}
