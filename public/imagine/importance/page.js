/* THE CONTEXT VIEW — you are AT a node, and below it is what matters most beneath it.

   Container: `/imagine/` is a columns host, so this lands in `.page-column-prose` and
   `judge/` opens as the column to the right. Size: the default track — one column of
   rows, 360px at a 400 viewport, ~535px at 1280, ~1150px at 3440. Own layout: `.flow`
   for the page, a `flex v` stack of rows inside it. Regions: one. Preview: the default card.

   WHERE YOU ARE lives in the url — `?at=q1` — so the screen is shareable and survives a
   reload. Clicking a child pushes a new history entry and redraws in place; it does not
   navigate, because it is the same page showing a different node.

   ⚠ `activated()`, not just `content()`. Core builds a page's view ONCE and caches it,
     so coming back from judge/ would show the ranks as they were before the judgment. */

import { Page, div, span, a, p, icon } from "/app.js";
import { baseline } from "/imagine/paging/baseline.js";
import { store } from "./importance.js";
import { ImpRank, ImpPropose, SAVED, glyph, attachment, tap, mark } from "./views.js";

export default new Page({
	meta: import.meta,
	title: "Importance",
	description: "What matters most here, ranked by comparison",
	icon: "equalizer",

	children: "judge doc",

	// ⚠ My own `screen()` draws both children as the things they are — a big way in and
	//   a quiet docs link — so core's column list would print them a second time.
	index: true,

	content(){
		baseline(this, { saved: () => SAVED });

		// ⚠ Captured NOW, filled in a callback — the store is a subscription away.
		this.$box = div.c("flex v gap");
		this.draw();

		// Every batch off the wire, once. Another window's judgment lands here.
		store.watch(() => this.streamed());

		// The back button moves you back up the graph, because `go()` pushed the state.
		window.addEventListener("popstate", () => this.draw());
	},

	// Core calls this at the end of its own `activate()`, so a visit is a redraw and
	// there is nothing to override and nothing to call up to.
	activated(){ this.draw(); },

	draw(){
		store.load().then(() => this.$box?.empty(() => { this.screen(); }));
		return this;
	},

	at(){ return new URLSearchParams(location.search).get("at") || store.topics()[0]?.id; },

	go(id){
		history.pushState({}, "", location.pathname + "?at=" + encodeURIComponent(id));
		this.draw();
	},

	/* TWO BOXES, AND THE SPLIT IS THE WHOLE LIVE RULE. `.imp-live` is the streamed
	   region — it is emptied and rebuilt every time a line arrives from any window. The
	   propose form is OUTSIDE it and is never rebuilt: it holds two text fields, and a
	   control redrawn under a caret loses the caret and what was half-typed into it. */
	screen(){
		this.$live = div.c("imp-live", () => { this.ranked(); });
		new ImpPropose({ context: this.at() });
	},

	// One batch off the wire → one redraw, of the ranked region only.
	streamed(){ this.$live?.empty(() => { this.ranked(); }); },

	ranked(){
		const at = this.at();
		const node = store.node(at);

		if (!node) return void p.c("muted", "There is no node with the id “" + at + "” in data/nodes.jsonl.");

		this.picker(at);
		this.trail(at);

		div.c("imp-head", () => {
			glyph(node);
			span.c("imp-head-text", node.text);
			span.c("imp-tag", node.kind);

			// AT the node itself, the mark counts every topic it is reached from — this
			// is the screen where "where else is this used?" is the natural question,
			// and the trail can only ever show one way home.
			mark(at, at, id => this.go(id));
		});

		/* THE WAY IN, above everything it changes — the owner's "find the judgment screen
		   without reading a paragraph".

		   ⚠ It is OFF where there is nothing to judge. `store.pair()` needs two things it
		     can see from here, and on a leaf — any caveat, any question with nothing under
		     it — the biggest button on the screen used to lead to "There are not two
		     things here yet to compare". A primary action that dead-ends is worse than
		     no action: this one greys out and the line beside it says what would turn it
		     back on. The same count `items()` gives is the one `pair()` counts. */
		const ready = store.items(at).length > 1;

		div.c("imp-ways", () => {
			const way = () => { icon("compare_arrows"); span("Which matters more?"); };

			if (ready) a.c("btn imp-judge", way).href("/imagine/importance/judge/?at=" + encodeURIComponent(at));
			else span.c("btn imp-judge", way).attr("aria-disabled", "true");

			span.c("imp-says muted", ready
				? store.rows(at).length + " judgments cast here"
				: "nothing to compare yet — add a second thing below and this turns on");

			a.c("imp-doclink muted", "Docs").href("/imagine/importance/doc/");
		});

		// ⚠ NO PARAGRAPH HERE. Three sentences used to describe the bar chart directly
		//   below them — what the bars mean, what the number beside one is, and that the
		//   rank is pressable. The picture says all three now: the bar is the score, the
		//   count beside it reads "won 3 of 3", and the trace control is a labelled
		//   toggle on the row. Prose explaining a picture is the picture's defect.

		// Caveats on the CONTEXT itself, before its children — they qualify all of it.
		store.attached(at).forEach(edge => { attachment(edge, at, id => this.go(id)); });

		new ImpRank({ context: at, pick: id => this.go(id) });
	},

	/* THE WAY BETWEEN TOPICS, and the only one there is — `?at=` is the whole address bar
	   here, so without this row a second topic can be reached only by typing its id.
	   It draws at all only when there IS a second topic: one topic is not a choice.

	   ⚠ NOT `topics()`. `Page.nav()` reads `topics` off a page as DATA, so a method by
	     that name dies three frames away in core, on the parent page. */
	picker(at){
		const topics = store.topics();
		if (topics.length < 2) return;

		/* ⚠ A NODE IN TWO TOPICS IS IN NEITHER "here". `root()` answers with the first way
		     home it finds, so at the shared caveat the row used to fill one chip while the
		     head one line under it said "used in 2 topics" — two true statements
		     contradicting each other. Nothing is marked there, and both chips stay live. */
		const here = store.also(at).length > 1 ? null : store.root(at);

		div.c("imp-topics", () => {
			span.c("imp-says muted", "Topics");

			// ⚠ CHIPS, NOT `.imp-name` LINKS. A name wears the prose-link underline
			//   because it sits in a column of ranked prose; a row of them at the top
			//   of the screen reads as a sentence somebody underlined. The one you are
			//   in is the same chip, filled and unpressable — "you are here" has to be
			//   visible or the row is four words with no state.
			topics.forEach(topic => {
				if (topic.id === here) span.c("imp-topic imp-topic-here", topic.text).attr("aria-current", "true");
				else tap(span, "imp-topic", topic.text, () => this.go(topic.id));
			});
		});
	},

	// ⚠ NOT `crumbs()` — core owns that name on Page and shadowing it breaks the columns.
	trail(at){
		// ⚠ `chain.includes(id)` as well as the guard: `up()` reads both directions now,
		//   and two nodes that qualify each other would otherwise print eight crumbs.
		const chain = [];
		for (let id = at, guard = 0; id && !chain.includes(id) && guard < 8; guard++){
			chain.unshift(id);
			id = store.up(id)[0];
		}

		// A topic is the root: there is nowhere above it, so it wears no trail.
		if (chain.length < 2) return;

		div.c("imp-trail", () => {
			chain.forEach((id, i) => {
				if (i) span.c("imp-trail-sep muted", "›");

				if (i === chain.length - 1) span.c("imp-trail-here", store.node(id)?.text ?? id);
				else tap(span, "imp-name imp-trail-up", store.node(id)?.text ?? id, () => this.go(id));
			});
		});
	},
});
