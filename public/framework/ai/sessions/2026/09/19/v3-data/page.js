import { Page, div, p, span, b, a, img, code } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board — the ordinary
                page grid: main for prose.
   2 SIZE       plain prose list, one screenshot. No wrapping needed.
   3 OWN LAYOUT prose, one short list, one image. Nothing else.
   4 REGIONS    none.
   5 PREVIEW    core's default card on the day board.

   ⚠ ONE SCREEN, mostly above the fold: the headline, then four one-line facts,
     then the proof shot. The decision (why a flat file, not one per day), the
     line-count race check, and the fence deviation (the hard-link shim) all
     live in this task's own task.jsonl — never repeated here. */

const shot = name => new URL("shots/" + name + ".png", import.meta.url).pathname;

export default new Page({
	meta: import.meta,
	title: "V3 board: one store",
	icon: "database",
	description: "The AI dashboard's live board moved out of the v/3 folder into one shared file both dashboards read.",

	content() {
		p(b("The board's data now lives at "), code("public/framework/ai/board.jsonl"), b(" — outside every dashboard version."), " It used to sit inside v/3's own folder, which is exactly the \"data saved inside a version dir\" the owner objected to; v2 (and any future v4) could never see it there.");

		this.list();

		p.c("muted", "Proven live: a card posted through the updated say.mjs, on screen at ", a("/framework/ai/v/3/").href("/framework/ai/v/3/?view=timeline"), " after the reload hold released.");
		img().attr("src", shot("board-after-move")).attr("alt", "the V3 timeline view showing the proof card, still there after the reload-hold release");
	},

	list() {
		return div.c("grid gap-25", () => {
			[
				["moved", "The 294 lines of real cards on the board today — a plain file move, not a rewrite (the file was being appended to by other agents the whole time; line count checked before and after, in the task log)."],
				["stayed with V3", "Which view is open, the sort order, the card-width slider, the split width — all already per-viewer browser storage (Page.Store), never a repo file, because none of it says anything about what happened."],
				["still differs", "V3's \"card\" (a conversation turn) and the original dashboard's task model (ext/AITask: an agent's steps and decisions) are different things, not two formats of one fact — the file is now shared; the SCHEMA was not unified today."],
				["one shim left", "Two Server plugins and one Claude Code hook still write the old path — outside this task's fence, and Server/ can't be touched without restarting the live site. A filesystem hard link keeps them writing into the exact same file, zero duplicate data."],
			].forEach(([id, line]) => p(b(id + " — "), line));
		});
	},
});
