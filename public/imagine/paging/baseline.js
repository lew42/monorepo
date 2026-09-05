import { View, span, icon, md } from "/app.js";

View.stylesheet(import.meta, "baseline.css");

/* ── THE MODIFIED MARK — "this is no longer the example it shipped with" ───────

   THE PROBLEM IT SOLVES, in one sentence: you press a few chips on a demo, come
   back next week, and you are reading a page that quietly remembers you — with
   nothing on screen saying so, and no way back to what the page originally showed.

   THE RULE (doc/persistence.md): demos never persist silently. Three states, and a
   reader can always tell which one they are in:

     BASELINE   nothing is saved — nothing is drawn, because the page IS the example
     MODIFIED   an amber dot, one sentence, and a two-press Reset
     SAVED      a green dot naming the store — for a thing you kept ON PURPOSE
                (a board, a run, a page you made), which is not a defect to undo

   HOW TO USE IT — two lines, on any Page, in any realm:

       import { baseline } from "/imagine/paging/baseline.js";
       content(){ baseline(this); … }

   `modified` defaults to "the page's store() has a record", which is true of every
   page audited: they all start from an empty store. Everything else is a seam a
   caller may pass in — `modified`, `restore`, `saved`, `what`.

   ⚠ THE MARK IS THE FIRST THING IN THE BODY, not beside the <h1>. Core draws the
     column head and this module may not edit core/, so "by the title" is the first
     line of the page body — which is directly under the title in every column on
     the site. doc/persistence.md proposes the one-line head slot that would fix it.

   ⚠ IT LIVES HERE, IN /imagine/paging/, AND IT IS NOT ABOUT PAGING. This is the
     realm that owned the persistence contract, so it is where the shared piece
     landed. It imports nothing from paging.js on purpose: a realm that wants the
     mark must not also pull down the mode vocabulary, the samples and the blog's
     post manifest to draw a dot.                                                */

// Core's own namespace — every page that uses `store()` writes under it, so this
// prefix is the whole site's saved state and nothing else on the origin.
export const APP = "lew42:";

/* EVERY SAVED KEY UNDER A PREFIX.
   ⚠ Collect FIRST, remove after: `localStorage.key(i)` re-indexes on every removal,
     so removing inside the walk skips every other match. */
export function keys(prefix = APP){
	const found = [];

	try {
		for (let i = 0; i < localStorage.length; i++){
			const key = localStorage.key(i);
			if (key?.startsWith(prefix)) found.push(key);
		}
	} catch { /* private mode: nothing was persisted, so there is nothing to find */ }

	return found;
}

// FORGET EVERY DEMO ON THE SITE — every `lew42:` key, which is every page that uses
// core's store(). Returns how many it removed so the control can say so out loud.
export function forget_all(){
	const all = keys();
	try { all.forEach(key => localStorage.removeItem(key)); } catch { /* nothing to clear */ }
	return all.length;
}

const MODIFIED = "**Modified.** You changed something here and this browser remembered it — so this is no longer the example the page shipped with.";

export class BaselineMark extends View {

	// ════ THE THREE SEAMS ═════════════════════════════════════════════════════

	// Is this page off its baseline? Default: anything at all is saved for it.
	modified(){ return this.page.store().read() !== null; }

	// A STRING when this page is holding something on purpose — it names the store,
	// and the mark turns green instead of amber. Null for an ordinary demo.
	saved(){ return null; }

	// Put it back. Default: forget this page's record and reload — pages hold their
	// state in memory too, so a clear alone would leave the screen looking unchanged.
	restore(){
		this.page.store().clear();
		location.reload();
	}

	// ════ THE PAINT ═══════════════════════════════════════════════════════════

	render(){
		this.rc("baseline-on", "baseline-kept");

		const kept = this.saved();

		if (kept) return this.paint("kept", "check_circle", kept);
		if (this.modified()) return this.paint("on", "trip_origin", MODIFIED);

		// BASELINE. Nothing is drawn: a page that says "unchanged" every time you
		// open it is noise on every page on the site, and the page IS the example.
	}

	paint(state, glyph, words){
		this.ac("baseline-" + state);

		icon(glyph).ac("baseline-dot");
		span.c("baseline-words", () => md(words));

		if (state === "kept" && !this.restorable) return;

		this.armed ? this.confirm() : this.arm();
	}

	/* TWO PRESSES, NOT ONE. The first arms and says what it is about to forget; the
	   second does it. A one-click control that throws away everything you changed is
	   the wrong shape however clearly it is labelled — the same shape Paging.Reset
	   already uses on the hub. */
	arm(){
		this.act("restart_alt", "Reset", () => { this.armed = true; this.check(); });
	}

	/* ⚠ DISARM BEFORE RESTORING, not after. The default `restore()` reloads, so it
	     never mattered — but a page that restores IN PLACE (Make going back to its
	     baseline, a topic erasing its run) redraws the mark from its own watcher, and
	     a still-armed mark would come back up asking to be confirmed a second time. */
	confirm(){
		this.act("restart_alt", "Press again to forget " + this.what, () => { this.armed = false; this.restore(); }, true);
		this.act(null, "Cancel", () => { this.armed = false; this.check(); });

		/* THE SITE-WIDE RESET LIVES HERE, and nowhere else. This is the moment a
		   reader has just discovered that a page remembered them — so it is the one
		   place the offer "then forget all of them" is actually wanted. No new page,
		   no new route, and it is reachable from every realm that persists. */
		this.act("delete_sweep", "…or every demo on the site", () => { forget_all(); location.reload(); });
	}

	act(glyph, words, run, on){
		return span.c("baseline-act").ac(on && "on")
			.attr("role", "button").attr("tabindex", "0")
			.append(() => { if (glyph) icon(glyph); span(words); })
			.click(run)
			.on("keydown", event => {
				if (event.key !== "Enter" && event.key !== " ") return;
				event.preventDefault();
				run();
			});
	}

	// ════ STAYING HONEST WHILE YOU WATCH ══════════════════════════════════════

	// Redraw myself in place. Everything above is pure `render()`, so this is the
	// whole of the update path.
	check(){
		if (this.live) this.empty(() => this.render());
		return this;
	}

	/* ⚠ THE WATCHER IS REGISTERED ONCE PER PAGE, AND IT LOOKS THE MARK UP AGAIN.
	     `page.watch(fn)` calls fn IMMEDIATELY (team, game, mag and topic all do), so
	     a naive hook would empty this view halfway through its own first render —
	     hence `live`, set after. And a page redrawn twice would otherwise stack a
	     second watcher holding a detached view, so the closure asks the page for
	     whichever mark is current instead of closing over this one. */
	initialize(){
		super.initialize();
		this.live = true;

		const page = this.page;
		page.$baseline = this;

		if (page.baseline_watched || typeof page.watch !== "function") return;

		page.baseline_watched = true;
		page.watch(() => page.$baseline?.check());
	}
}

BaselineMark.prototype.what = "what you changed here";
BaselineMark.prototype.restorable = false;   // a "kept" mark only gets a Reset if it asks

export function baseline(page, options){ return new BaselineMark({ page, ...options }); }

export default baseline;
