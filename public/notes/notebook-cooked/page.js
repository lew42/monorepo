import { md, div, span } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout: main region under /notes/, plain page grid. Photo and the wall take `wide`;
   prose keeps the measure. Two regions, no children.

   Eight wireframes in a 2x4 grid on the page. Rebuilt as eight small boxes in a
   `flex auto` wall so they wrap by themselves — framework words only, because a sketch
   that needs a new class is not a layout. */

const bar = (h, flex) => div.c("surface").style({ height: h, flex, borderStyle: "dashed" });

const EIGHT = [
	["Side note, wide canvas", "A narrow left column of scribble beside one big empty field.",
		() => div.c("flex gap").style("height", "6em").append(() => {
			div.c("surface pad flex v gap").style("flex", "0 0 5em")
				.append(() => { bar("0.4em", "none"); bar("0.4em", "none"); bar("0.4em", "none"); });
			bar("100%", "1 1 auto");
		})],
	["List and pane", "A list of lines on the left, one of them with a chevron; the pane fills the rest.",
		() => div.c("flex gap").style("height", "6em").append(() => {
			div.c("flex v gap").style("flex", "0 0 6em")
				.append(() => [1, 2, 3].forEach(() => bar("0.5em", "none")));
			bar("100%", "1 1 auto");
		})],
	["List with one item open", "The same list, but one row has expanded into a small form.",
		() => div.c("flex gap").style("height", "6em").append(() => {
			div.c("flex v gap").style("flex", "0 0 6em").append(() => {
				bar("0.5em", "none");
				div.c("surface pad").style({ outline: "2px solid var(--prim)", flex: "1 1 auto" });
				bar("0.5em", "none");
			});
			bar("100%", "1 1 auto");
		})],
	["Media and a caption", "One X-ed image box with a line under it — the sketch marked “hole punch?”",
		() => div.c("flex gap").style("height", "6em").append(() => {
			div.c("flex v gap").style("flex", "0 0 5em").append(() => bar("0.5em", "none"));
			div.c("flex v gap flex-1").append(() => { bar("100%", "1 1 auto"); bar("0.5em", "none"); });
		})],
	["Grow on activate", "A stack whose bottom block is bigger than the rest — the active one.",
		() => div.c("flex gap").style("height", "6em").append(() => {
			div.c("flex v gap").style("flex", "0 0 5em").append(() => bar("0.5em", "none"));
			div.c("flex v gap flex-1").append(() => {
				bar("1em", "none");
				div.c("surface").style({ flex: "1 1 auto", borderStyle: "dashed",
					outline: "2px solid var(--prim)" });
			});
		})],
	["Media over a strip", "A picture, a caption strip beneath it, and a scribble above.",
		() => div.c("flex v gap").style("height", "6em").append(() => {
			bar("0.5em", "none"); bar("100%", "1 1 auto"); bar("0.8em", "none");
		})],
	["Toolbar page", "A row of little controls under the title, then the content.",
		() => div.c("flex v gap").style("height", "6em").append(() => {
			div.c("flex gap").append(() => [1, 2, 3, 4].forEach(() => bar("0.9em", "1 1 auto")));
			bar("100%", "1 1 auto");
		})],
	["Columns with a rail", "A left rail, then three columns of equal width across the top.",
		() => div.c("flex gap").style("height", "6em").append(() => {
			bar("100%", "0 0 2.5em");
			div.c("flex v gap flex-1").append(() => {
				div.c("flex gap").append(() => [1, 2, 3].forEach(() => bar("1.6em", "1 1 auto")));
				bar("100%", "1 1 auto");
			});
		})],
];

function eight_wall(){
	return div.c("flex auto gap wide").style("--column", "15em").append(() =>
		EIGHT.forEach(([name, says, build]) => div.c("flex v gap").append(() => {
			build();
			span().style("fontWeight", "700").text(name);
			span.c("muted").style("fontSize", "0.85em").text(says);
		})));
}

export default new NotesNote({
	meta: import.meta,
	title: "Notebook cooked",
	icon: "grid_view",
	description: "Eight wireframes, and every log entry as a new state hash.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**Left page — eight wireframes**, headed **NOTEBOOK COOKED**, laid out two across and
four down. Reading them in order: a narrow scribble column beside a wide empty canvas · a
list with a chevron beside a filled pane · the same list with one row expanded into a
small form · an X-ed image box marked **hole punch?** · a stack whose bottom block is
larger, annotated **grow on activate** · a picture over a caption strip · a page with a
row of small controls under its title · and a left rail with three equal columns across
the top.

**Right page — versioning, and what a log entry is.**

> **GRANULAR VERSIONING** — drawn as a branching line into a list of rows with checkboxes.

> **MY DASHBOARD** — ☑ realtime ☑ AI/tasks ☑ calendar ☑ schedule a call?

Four small square previews in a row, labelled *visual timeline / **tiny** previews ⇒ tree
of variants*.

> **AUTO-TREE:** Every time you change something, you should be clear based on selection.
>
> **WHAT EXACTLY IS SELECTED?** When you change something, each item has its own history,
> changesets, snapshot(s), etc.
>
> ✱ **Sub pages can have derived logs (jsonl), snapshots (json).**
> ☑ Build child page log & state from parent's jsonl.
>
> **Every log entry provides a new state & state hash?** So even sub page state can be
> verified.
>
> No need to save the hashes per action…? State is logged to the log every x min? Why?
> → for jumping around? faster? ☑ prob no need.`);

		md(`## What it points at

- [AI](/framework/ai/) — the append-only \`task.jsonl\` this site already runs on: one line
  per deed, the day's board derived from it. That is "every log entry provides a new
  state", running since August.
- [ext/Saver](/framework/ext/Saver/) — the module that writes state back to a file, which
  is where changesets and snapshots would live.
- [Make](/imagine/paging/make/) — a page as a \`page.json\` you can edit and save. The
  note's "derived logs, snapshots" is this, one level deeper.
- [core/Item](/framework/core/Item/) — the per-item identity the note needs before an item
  can have a history of its own.
- [core/Layout](/framework/core/Layout/) — the tree of variants those tiny previews would
  be a picture of.`);

		md(`## The eight, rebuilt

Framework words only — \`flex\`, \`gap\`, \`pad\`, \`surface\`. The two the note annotated are
marked: the expanded row, and the block that **grows on activate**.`);

		eight_wall();

		md(`Laid out together, the eight are really three shapes with variations: something
narrow beside something wide, a stack with one member emphasised, and a strip of controls
over content. That is the same conclusion the [layout study](/imagine/design/layout/)
reached by measuring twenty real pages.`);
	}
});
