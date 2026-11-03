/* JUDGMENT MODE — two things, one question, one keypress, one appended line.

   Container: a column beside the context view, under `/imagine/`'s columns host.
   Size: the default track — the two choices are `flex: 1 1 14rem`, so they sit side by
   side from ~460px up and stack below it. Own layout: `.flow`, one row of two cards.
   Regions: one. Preview: the default card.

   The pair is not random. `store.pair()` picks the comparison that teaches the system the
   most — unasked before, fewest judgments, closest scores — so a newly proposed item is
   the very next thing you are shown. That is the cold-start answer.

   ⚠ `?at=` carries the context from the page next door. Judging the SAME two things in a
     different context is a different row, and that is the whole point of the column. */

import { Page, div, span, a, p, icon } from "/app.js";
import { store } from "../importance.js";
import { ImpPair } from "../views.js";

export default new Page({
	meta: import.meta,
	title: "Which matters more?",
	description: "Pick between two — every pick appends one line",
	icon: "compare_arrows",

	/* ⚠ NO SAVED MARK AND NO TOPIC HEADING IN THIS COLUMN. Both belong to the context
	     view, which under /imagine/'s columns host is always the column on my left — and
	     drawn here as well the screen said "Saved to disk …" twice, one line above itself,
	     and printed the topic's own title twice under two different labels, TOPIC and THE
	     CONTEXT (round two, finding 10). One screen, one mark, one heading. */
	content(){
		this.$box = div.c("flex v gap");
		this.draw();

		store.watch(() => this.streamed());
	},

	/* ONE EVENT, TWO MEANINGS. Every judgment — mine and the other window's — arrives
	   the same way, off the wire, because the writer never applies its own line. So the
	   only thing that tells them apart is `mine`, set when MY append came back
	   successful. My own pick advances to the next pair; somebody else's leaves the pair
	   alone and only re-reads its numbers, so nothing moves under your hand and neither
	   text field is rebuilt.

	   ⚠ MY OWN pick does not advance either, any more: `reveal()` keeps the two cards
	     where they are and puts the scores the judgment just changed ON them, and the
	     next pair is a control (`Next two`, or Enter) rather than a screen that
	     replaced itself. */
	streamed(){
		if (!this.mine) return void this.$pair?.restream();

		this.mine = false;
		this.$pair?.reveal();
	},

	// ⚠ Core builds a page's view ONCE and caches it, so coming back from the ranking
	//   would show the pair as it was before the last judgment. `activated()` is the hook
	//   core already calls at the end of its own `activate()` — no override, no super call.
	activated(){ this.draw(); },

	// ⚠ The old pair's keyboard listener goes with it — otherwise a judgment could be
	//   cast from the page next door. `deactivated()` is core's hook, called first thing.
	deactivated(){ this.$pair?.unbind(); },

	draw(){
		this.$pair?.unbind();
		store.load().then(() => this.$box?.empty(() => { this.screen(); }));
		return this;
	},

	at(){ return new URLSearchParams(location.search).get("at") || store.topics()[0]?.id; },

	screen(){
		const at = this.at();
		const node = store.node(at);

		if (!node) return void p.c("muted", "There is no node with the id “" + at + "” to judge inside.");

		// ⚠ The question and the instruction under it belong to `ImpPair`, which is the
		//   view that can answer them: on a node with nothing to compare there is no
		//   question to ask, and it says that instead.
		// A fresh pair each time, because the last judgment changed the scores that
		// choose the next one. `judged` fires when MY append was accepted — the row
		// itself still has to come back off the wire, and `streamed()` is where it lands.
		this.$pair = new ImpPair({ context: at, judged: () => { this.mine = true; }, next: () => this.draw() });

		div.c("imp-ways", () => {
			a.c("btn imp-back", () => { icon("format_list_numbered"); span("See the ranking"); })
				.href("/imagine/importance/?at=" + encodeURIComponent(at));
		});
	},
});
