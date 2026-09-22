/* RANKED LISTS, PAGED IN COLUMNS — the demo the ranking system was built against.

   Container: `/imagine/` is a columns host, so this page and everything under it are
   columns in ITS row (core takes the OUTERMOST host in the chain — see below). Size:
   the default column track, ~535px at 1280. Own layout: core's column body, one list
   of rows. Regions: one per column, core's. Preview: the default card.

   THE THREAD IS THE NAVIGATION. A topic opens its asks; an ask opens the tasks serving
   it; a task is where the thread ends. Every column is a ranked list, numbered, drawn
   in the order that run's log says — so "threaded ranked list" and "column paging" are
   one screen, not two ideas.

   ⚠ `this.columns({ even: true })` below is honoured only when THIS page is the
     outermost columns host in its chain, because `Page.column_host()` is
     `chain().find(page => page.columnar)` — root-first. Under `/imagine/`, which became
     a host first, this row is /imagine/'s and runs /imagine/'s elastic mode. The line
     stays because it is what this page asks for and it is what it gets standing alone;
     making core support a NESTED host is a core change and the owner's call. The even
     mode itself is live at /framework/core/Page/overview/columns/finder/.

   ⚠ READ ONLY. The log is `ai/2026-09-17/mastermind-layout-browser/task.jsonl` — the
     mastermind's own, being written right now. The drag that writes an order lives on
     a task's own Asks tab, where the log belongs to the page showing it. */

import { Page, View, md } from "/app.js";
import { topics, ranked_column } from "./ranked.js";

View.stylesheet(import.meta, "ranked.css");

export default new Page({
	meta: import.meta,
	title: "Ranked",
	description: "One run's asks as a thread you page through",
	icon: "sort",

	initialize(){ this.columns({ even: true }); },

	// The data source: `children` as a function, resolved once on the first ask
	// (core/Page/doc/data-children.md). Every level below answers the same way.
	children(){ return topics(); },

	/* ⚠ TWO SENTENCES. A column here is ~200px wide once four of them are open, and
	     "small columns never get large content" (the layout skill) — the numbered rows
	     below already show what this is, so the prose only has to say what a click does
	     and where the ordering gesture lives. */
	content(){
		md("Each column is a ranked list; a row opens its thread beside it. Setting an order is a drag, on [a task's own Asks tab](/framework/ai/2026-09-17/ranked-lists/).");
	},

	/* `ranked_column`'s one hook, drawn UNDER this column's list. The readme is the
	   only way into this dir's own notes from inside the app — a `.md` link leaves
	   the SPA entirely (the `documentation` skill's finding) — but above the list it
	   is a button standing in front of the demo, which is the thing you came for. */
	column_foot(){ md.details(import.meta, "readme.md", "Readme"); },

	column: ranked_column,
});
