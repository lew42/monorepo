import { Program } from "/framework/ext/Research/Program.js";
import { div, p, a, span, details, summary } from "/app.js";

/* Container: a COLUMN in /imagine/'s columns host — not a page grid, so no
   `wide` and no breakout; the column is the width. Size: `large`, 28–64em, and
   the owner can drag the seam. Own layout: the program's, one call. Regions:
   one — Program.content() draws the whole front. Preview: the default card.

   The topics are NOT declared as `children`. Four minions own those dirs and
   write their own `page.js` when they have something to show; core probes the
   filesystem for an undeclared name, so `stone/` starts working the moment one
   lands — whereas a DECLARED child with no page.js 404s. The cards link only
   to the topics that have answered (Program.has_page()).

   ⚠ Which also means: no `route()` here, ever. `route()` sees undeclared names
     first and would shadow the minions' pages the day they arrive.

   ⚠ RANK 1 in the 2026-09-04 paging critique: 368 entries flattened this front
     into one column 14,517px deep (10.4 screens at 3440) while `width: "fill"`
     was tried and REVERTED the same day (squeezes an open topic column to its
     288px floor — public/framework/ai/2026-09-04/realm-alternates/task.jsonl).
     So the fix here is DEPTH, not width: `head()` gets one plain sentence
     telling a stranger what to click, and the two sections that were doing
     almost all of the growing — the theories board and the raw stream, both
     literally "every entry, shown flat" by Program's own doc comments — move
     behind closed-by-default `<details>`. Nothing is deleted: same cap, same
     per-topic "N more" links, same card renderers (`theory()`/`entry()`);
     only the outer wall is now a click instead of a scroll.
   ⚠ Caveat: closed-by-default means a skimmer who doesn't notice the triangle
     never sees a single theory or entry. Undo by dropping the `details` wrap
     (keep the `head()` sentence) if the owner would rather they render open. */
class ResearchFront extends Program {

	head(all){
		div.c("research-head flow", () => {
			if (this.question) p.c("research-question", this.question);

			p("Pick a topic card below to read what it found, or open “Theories on the table” and “Latest” further down for the raw claims — every one is tagged established, contested, fringe or speculation.");

			const digging = this.logs.filter(log => log.loaded).length;

			div.c("research-meta flex gap wrap v-center", () => {
				span.c("research-count").text(all.length + (all.length === 1 ? " entry" : " entries"));
				span.c("muted").text(`${digging} of ${this.logs.length} topic logs reporting`);
			});
		});
	}

	board(all){
		const theories = all.filter(e => e.kind === "theory");
		if (!theories.length) return;

		details(() => {
			summary(() => span.c("h2", `Theories on the table — ${theories.length} across ${this.logs.length} topics`));

			this.logs.forEach(log => {
				const mine = theories.filter(e => e.topic === log.topic);
				if (!mine.length) return;

				const shown = mine.slice(0, this.board_cap ?? 4);

				div.c("research-board-group flow", () => {
					p.c("h4 muted", log.topic);
					shown.forEach(e => this.theory(e));

					if (mine.length > shown.length){
						const more = `${mine.length - shown.length} more in ${log.topic}`;
						log.page
							? a.c("research-more").href(this.url + log.topic + "/").text(more)
							: p.c("research-more muted", more);
					}

					this.takes(log);
				});
			});
		});
	}

	stream(all){
		details(() => {
			summary(() => span.c("h2", "Latest" + (all.length ? ` — ${all.length} entries` : "")));

			if (!all.length) return p.c("muted", "Nothing logged yet. Each topic appends to its own log.jsonl as it digs; this page streams them live.");

			div.c("research-stream", () => {
				const shown = all.slice(0, this.cap ?? 20);
				shown.forEach(e => this.entry(e));

				if (all.length > shown.length)
					p.c("research-more muted", `showing the newest ${shown.length} of ${all.length} — a topic's own page has all of its own`);
			});
		});
	}
}

export default new ResearchFront({
	meta: import.meta,
	title: "Research",
	description: "Four topics in ancient technology, dug in parallel and streamed live — every claim carrying how sure anyone actually is.",
	icon: "explore",

	width: "large",

	question: "What do we actually know about ancient technology — and how sure is anyone?",

	topics: "stone depictions disclosure theories",
});
