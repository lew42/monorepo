import { Page, p } from "/app.js";
import { code, section, api } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Beyond the url",

	content(){
		code(`
A DOCUMENT SITE          the url IS the state
  /docs/api/tabs/          Back = go somewhere else
                           reload = identical screen

AN APPLICATION           the url is an ADDRESS; the state is elsewhere
  /doc/42/                 Back = undo?  ← the whole question
                           reload = same document, not the same screen`);

		p("Everything documented so far assumes the first. This page is about where it stops.");

		section("The tell");

		p("Ask what Back should do. On a docs site the answer is obvious and the Router already does it. In a design tool, a user who drags a rectangle and presses Back does **not** want the previous page — they want the rectangle back. The moment those two diverge, the url has stopped being your history.");

		section("Then the url gets shorter, not longer");

		code(`
/doc/42/layer/7/prop/fill/     ← trying to encode the screen. breaks immediately
/doc/42/                       ← the document. everything else is app state`);

		p("A persistent document url plus an in-memory state tree is not a workaround — it's the correct split. The url answers *which document*; undo/redo answers *what happened to it*.").ac("note");

		section("Two histories, and they are not the same shape");

		api([
			["history.pushState", "a stack of urls. the browser owns it", "Router.go()"],
			["undo/redo", "a stack of edits. you own it", "the document"],
			["router.active", "which document is open", "Router"],
			["(your state tree)", "everything about how it looks right now", "you"],
		]);

		p("Merging them is the classic mistake: every keystroke becomes a history entry, Back leaves the page, and the two stacks fight over who owns the Back button.");

		section("What this trio would still do for you");

		code(`
Router      resolve /doc/42/ → the document page. once.
Page        the document's own render, and its children if it has real sub-urls
show/hide   the panels — still just layout
App         the chrome`);

		p("None of that changes. What gets added is a layer this design deliberately doesn't have: a state object the views read, and a command log that mutates it. The Router keeps doing the small job it's good at — turning one url into one chain — and stops being asked to be the application's memory.");

		section("So: does the trio handle every case?");

		code(`
docs, marketing, tabs, drill-down columns     yes, today
one workspace with contextual panels           yes — route the workspace, not the panels
independent panels that must be linkable       query params, reluctantly
an editor with undo/redo                       no. and it shouldn't try`);

		p("The last row is the useful conclusion. A router that could express arbitrary independent panel state would be a worse router *and* a worse state manager — the reason this one is 92 lines is that it does exactly one thing.").ac("note");

		section("Open, in order of how much it hurts");

		code(`
1  columns need every page in the subtree to opt in     ← see 2 · Columns
2  ancestors fully render, then get hidden               ← wasted work on deep loads
3  route() pages can't have children of their own
4  a page can't hook activate() without replacing it`);
	}
});
