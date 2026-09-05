import { Program } from "/framework/ext/Research/Program.js";
import { credences, kinds } from "/framework/ext/Research/entries.js";
import { View, div, p, a, span, details, summary } from "/app.js";

View.stylesheet(import.meta, "research-front.css");

/* Container: a COLUMN in /imagine/'s columns host — not a page grid, so no
   `wide` and no breakout; the column is the width. Size: `fill`, the leftover:
   alone it takes the row, and yields to a plain flex share (64em ceiling) the
   moment a topic column opens beside it — the seam still drags either way.
   Own layout: the program's, one call. Regions: one — Program.content() draws
   the whole front. Preview: the default card.

   The topics are NOT declared as `children`. Four minions own those dirs and
   write their own `page.js` when they have something to show; core probes the
   filesystem for an undeclared name, so `stone/` starts working the moment one
   lands — whereas a DECLARED child with no page.js 404s. The cards link only
   to the topics that have answered (Program.has_page()).

   ⚠ Which also means: no `route()` here, ever. `route()` sees undeclared names
     first and would shadow the minions' pages the day they arrive.

   ⚠ RANK 1 in the 2026-09-04 paging critique: 368 entries flattened this front
     into one column 14,517px deep (10.4 screens at 3440) while `width: "fill"`
     was tried and REVERTED the same day (squeezed an open topic column to its
     288px floor — public/framework/ai/2026-09-04/realm-alternates/task.jsonl).
     The depth fix (below) stands regardless: `head()` is one sentence, and the
     flat "Latest" feed stays behind a closed-by-default `<details>`. `fill` is
     back 2026-09-05 now that Page.css makes it yield to an open child instead
     of starving it — doc/columns.md, doc/decisions.md have the numbers.

   ⚠ 2026-09-05 UX PASS — the second problem the depth fix left standing: the
     front told you HOW MUCH was in each topic (a count, a bar) but never WHAT
     any of it actually said — the four topic cards were stat tiles, and the
     one section that read like real research ("Theories on the table") sat
     far below them, re-grouped by topic all over again for no reason the data
     needs (Program.js: no field pairs an opinion to a theory, but the TOPIC
     grouping there was already redundant with the cards above it). Tried the
     owner's 3-column card (public/imagine/layouts/LayoutsCard.js is the same
     shape): left = who/what, centre = the topic's own newest theory LIVE (not
     a stat), right = the credence readouts. Kept — see doc/decisions.md for
     the measurements. `topic_cards()`/`topic_card()` override the base grid of
     small tiles; `board()` is gone because its job now lives inside each card,
     one topic at a time, so scrolling from one card to the next shows the
     relation the owner asked for. `stream()` (the flat cross-topic feed) is
     untouched — it is a genuinely different view (recency, not topic) and
     stays behind its own closed `<details>`. */
class ResearchFront extends Program {

	head(all){
		div.c("research-head flow", () => {
			if (this.question) p.c("research-question", this.question);

			p("Each topic card below leads with its newest theory, live — open the card's own “+N more” for the rest of its theories and every assessment filed against them, or open “Latest” further down for the raw claims across all four topics. Every claim is tagged established, contested, fringe or speculation.");

			const digging = this.logs.filter(log => log.loaded).length;

			div.c("research-meta flex gap wrap v-center", () => {
				span.c("research-count").text(all.length + (all.length === 1 ? " entry" : " entries"));
				span.c("muted").text(`${digging} of ${this.logs.length} topic logs reporting`);
			});
		});
	}

	/* One call fewer than the base: `board(all)` is not called — its job moved
	   into `topic_card()`, one topic at a time. Everything else is the base
	   order (doc/render.md): head, the capstone, the legend, the dig, latest. */
	draw(){
		this.$live.empty(() => {
			const all = this.all();
			this.head(all);
			this.capstone_card(all);
			this.legend(all);
			this.topic_cards(all);
			this.stream(all);
			this.foot(all);
		});
	}

	/* ── the dig, as 3-column cards ──
	   Same shape as /imagine/layouts/'s catalogue: a small intro on the left, the
	   actual thing in the middle, its numbers on the right. Here the "thing" is
	   the topic's own newest theory — real research, not a stat about it. */
	topic_cards(all){
		div.c("research-topics flow", () => {
			p.c("h4 muted", "The dig — one card per topic, its own read and its own numbers");
			this.logs.forEach(log => this.topic_card(log, all));
		});
	}

	topic_card(log, all){
		const t = log.tally();
		const theories = all.filter(e => e.kind === "theory" && e.topic === log.topic);
		const [top, ...rest] = theories;

		div.c("rfront-card surface").append(() => {
			div.c("rfront-intro flow", () => {
				log.page
					? a.c("research-card-name h3").href(this.url + log.topic + "/").text(log.topic)
					: span.c("research-card-name h3").text(log.topic);

				if (!t.lines) return p.c("muted", log.loaded ? "no entries yet" : "no log yet");

				p.c("muted", `${t.lines} ${t.lines === 1 ? "entry" : "entries"} — ${kinds(log.entries).map(([k, n]) => `${n} ${k}`).join(" · ")}`);
				if (log.page) a.c("research-more").href(this.url + log.topic + "/").text("open the full dig →");

				// A topic with no page.js of its own still has a way in: core serves
				// any `.md` beside it as a page. Listed only until the minion writes one.
				if (!log.page && log.pages?.length) div.c("research-card-pages flex v", () =>
					log.pages.forEach(name => a.c("research-card-page")
						.href(this.url + log.topic + "/" + name + "/").text(name.replace(/-/g, " "))));
			});

			div.c("rfront-stage flow", () => {
				if (!top) return p.c("muted", t.lines
					? "No theory filed yet for this topic — see the raw entries in “Latest”, below."
					: "");

				this.theory(top);

				// A LINK, not an in-page expand: opening 22 more theories inline is exactly
				// the "massive shift" the owner's paging note warns against — the topic's own
				// page is the right-sized room for the rest, not this card. (2026-09-05: an
				// in-card `<details>` here grew the card 5,412px in one click, measured by
				// ui-test — reverted to this before landing.)
				if (rest.length){
					const more = `${rest.length} more ${rest.length === 1 ? "theory" : "theories"} on ${log.topic}`;
					log.page
						? a.c("research-more").href(this.url + log.topic + "/").text(more)
						: p.c("research-more muted", more);
				}

				this.takes(log);
			});

			div.c("rfront-reads flow", () => {
				if (!t.lines) return;

				p.c("h4 muted", "how sure");
				div.c("rfront-reads-list flow", () => credences(log.entries).forEach(([c, n]) => {
					div.c("rfront-read flex gap v-center").ac("research-cred-" + c).append(() => {
						span.c("research-cred-name", c);
						span.c("rfront-read-n", String(n));
					});
				}));

				if (t.bad || t.unparsed) span.c("research-refused")
					.text([t.bad && `${t.bad} off-schema`, t.unparsed && `${t.unparsed} unreadable`].filter(Boolean).join(" · "));
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

	width: "fill",

	question: "What do we actually know about ancient technology — and how sure is anyone?",

	topics: "stone depictions disclosure theories",
});
