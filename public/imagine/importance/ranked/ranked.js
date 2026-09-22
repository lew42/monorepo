/* THE THREAD, AS DATA — one run's log read into three levels of ranked list.

   Topics hold asks, an ask holds the tasks serving it. That is what "threaded" means
   here: an item's thread is the list that hangs under it, and every level is ranked on
   its own — the asks inside a topic, the tasks inside an ask.

   The log is READ ONLY. It is the mastermind's own `task.jsonl` and the mastermind is
   writing it while you read this, so nothing here appends: the order comes out of the
   file, and the drag that writes one is on a task's own Asks tab
   (`/framework/ext/AITask/doc/ranking/`). */

import { Page, div, span, a, icon } from "/app.js";
import { TaskJSONL, ranked } from "/framework/ext/JSONL/JSONL.js";
import { ask_title } from "/framework/ext/AITask/asks.js";

/* ⚠ Against `import.meta`, never the document: the SPA fallback makes the document url
     whatever route you are on, so a relative read would follow the reader around. */
const RUN = new URL("../../../framework/ai/2026-09-17/mastermind-layout-browser/", import.meta.url).pathname;

const log = new TaskJSONL({ url: RUN + "task.jsonl" });
let reading;

/** The run's log, fetched once however many columns ask for it. */
export const load = () => reading ??= log.load();

/* ── the three levels ──────────────────────────────────────────────────────── */

/** Every topic in the log, in the order the owner first said them. */
export async function topics(){
	await load();

	const seen = [];
	log.asks.forEach(ask => { const t = ask.topic || "Other"; if (!seen.includes(t)) seen.push(t); });

	return seen.map(topic => ({
		name: Page.slug(topic),
		title: topic,
		description: said(asks_in(topic).length, "ask"),
		children(){ return asks_under(topic); },
		column: ranked_column,
	}));
}

const asks_in = topic => log.asks.filter(ask => (ask.topic || "Other") === topic);

/** One topic's asks, in the order the log's own `rank` line asks for. */
async function asks_under(topic){
	await load();

	return ranked(asks_in(topic), log.order("asks"), ask => ask.id).map(ask => ({
		name: ask.id,
		title: ask_title(ask),
		description: ask.summary,
		children(){ return tasks_under(ask); },
		column: ranked_column,
	}));
}

/** The tasks serving one ask — the thread under it — ranked the same way. */
async function tasks_under(ask){
	await load();

	return ranked((ask.tasks ?? []).map(slug => ({ id: slug })), log.order("tasks"), row => row.id)
		.map(row => ({
			name: row.id,
			title: row.id.replaceAll("-", " "),
			description: "the task doing the work",
			leaf: true,
			content(){ task_page(row.id); },
			column: ranked_column,
		}));
}

/* A leaf column: the one thing there is to say, and the way out to the real record. */
function task_page(slug){
	div.c("imp-ranked-leaf flex v", () => {
		span.c("muted", "This is where the thread ends — the task's own page has its report, its decisions and its log.");
		a.c("btn", "Open " + slug).href(RUN.replace(/[^/]+\/$/, "") + slug + "/");
	});
}

const said = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/* ── one column ────────────────────────────────────────────────────────────── */

/**
 * A COLUMN THAT IS A RANKED LIST — core's own `column()` with one change: every
 * row wears its place in the order.
 *
 * Core's version is copied rather than wrapped, the way `/imagine/page.js` copies
 * it, because its loop has nowhere to hang a number. If core's `column()` changes
 * shape this drifts with it; the added lines are marked.
 *
 * ⚠ A plain `function`, not an arrow — it is assigned onto a page as a METHOD, so
 *   it has to take `this` from the page it is called on.
 */
export function ranked_column(host){
	return div.c("page-column-body imp-ranked", () => {
		div.c("page-column-head", () => {
			span.c("page-column-title", this.title);
			if (this !== host) a.c("page-column-close", () => icon("close")).href(this.parent.url);
		});

		if (this.content)
			div.c("page-column-prose flow", () => this.render_content());

		let place = 0;
		this.children.forEach((child, name) => {
			const nav = this.nav_for(name);

			a.c("page-column-item imp-ranked-row").href(nav.url).append(() => {
				span.c("imp-ranked-n", ++place);                                  // ← added
				span.c("page-column-label", nav.label);
				if (nav.description) span.c("imp-ranked-said", nav.description);  // ← added

				// ⚠ The chevron is WRAPPED so the sheet can place it. A bare grid item
				//   auto-places, and with the description taking row 2 the chevron
				//   landed beside the description instead of beside the label.
				if (child?.children.size || child?.child_source)
					span.c("imp-ranked-more", () => { icon("chevron_right"); });   // ← added
			});
		});

		// The one hook a page in this tree has BELOW its own list — the host uses it
		// for the readme fold, which above the list is a button in front of the demo.
		this.column_foot?.();
	}).ac(this.width && "page-column-" + this.width);
}
