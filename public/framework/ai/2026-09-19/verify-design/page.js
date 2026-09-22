import { Page, div, p, span, b, a, img } from "/app.js";

/* -- layout, answered before the first factory call ---------------------------
   1 CONTAINER  a task page on /framework/ai/2026-09-19/'s board -- the ordinary
                page grid: main for prose, wide for the one screenshot pair.
   2 SIZE       two screenshots side by side wrap to one column narrow; a
                compact list for the rest, no wrapping needed.
   3 OWN LAYOUT prose, one disagreement card with two pictures, one plain list.
   4 REGIONS    none.
   5 PREVIEW    core's default card on the day board.

   WARNING ONE SCREEN, mostly above the fold: the headline, then the one
     disagreement (it is the news), then the rest as one line each. The file
     lines, the exact urls loaded and the commands run all live in
     verify.jsonl and this task's own task.jsonl -- never repeated here.
   WARNING No template literals in this file -- plain "..." strings, so a stray
     backtick can never end one early (the exact bug that blanked the site
     twice today, per the sibling verify-server page). */

const VERDICT = {
	done: { word: "done", color: "var(--ok, #2e7d32)" },
	partly: { word: "partly", color: "var(--warn, #b26a00)" },
	differs: { word: "differs", color: "var(--warn, #b26a00)" },
	not: { word: "not done", color: "var(--bad, #b3261e)" },
};

function badge(v) {
	const info = VERDICT[v] || { word: v, color: "var(--muted)" };
	return span.c("h6", info.word).style({ color: info.color, fontWeight: 700, textTransform: "uppercase" });
}

const shot = name => new URL("shots/" + name + ".png", import.meta.url).pathname;

/* The other five, already agreeing with the earlier audit's verdict -- compact,
   one line each; the task's own outcome text is where the detail lives. */
const AGREES = [
	["sidebar-messed-up", "done", "The rail's rows, filter and footer are genuinely fixed -- read the CSS myself, saw it live at every width.", "/framework/ai/2026-09-19/sidebar-repair/"],
	["whisper-local", "done", "whisper-server answers live right now, and the dictation UI really shows growing partial text while you talk.", "/framework/ai/2026-09-19/whisper-local/"],
	["popover-system", "done", "Both placements were built and compared on camera, side by side, in a hostile box -- the winner runs the AI page's own version picker.", "/framework/ai/2026-09-19/popover-system/"],
	["background-layer", "done", "Ten real, no-image backgrounds exist and render on a live page -- only gap is that /framework/ui/'s own overview page does not link to it yet.", "/framework/ai/2026-09-19/background-layer/"],
	["sidebar-designs", "not", "Nothing exists anywhere in the repo under this name. Still not started, same as the audit said.", "/framework/ai/2026-09-17/mastermind-layout-browser/"],
];

export default new Page({
	meta: import.meta,
	title: "Verify: design system",
	description: "A second, harder look at 6 of the 53 requests -- the design system, the sidebar, and how pages look.",
	icon: "fact_check",

	content() {

		p(b("Five of six hold up. One doesn't: "), "the fix for \"the run page wastes space\" is real code, but it landed on a board the owner is not looking at anymore.");

		this.disagreement();

		p.c("h4", "The rest, checked myself and agreeing with the earlier audit -- one line each:");
		this.list();

		p.c("muted", "Every verdict, its evidence and the files read: ", a("verify.jsonl").href("/framework/ai/2026-09-19/verify-design/verify.jsonl"), ". The full trail is this task's own log.");
	},

	disagreement() {
		return div.c("surface pad flex v gap", () => {
			span.c("h4 muted", "run-page-compact -- graded done, really differs");
			p(b("The compact fix is real, and it is not the board in front of the owner."), " ", a("ai/v/2/").href("/framework/ai/v/2/"), " genuinely ships the Compact / Cozy / Roomy switch the owner asked for, built on the design system's own size classes -- I read the code. But a second, separate board, ", a("ai/v/3/").href("/framework/ai/v/3/"), ", was built two hours later, never picked up that switch, and uses its own unrelated width slider instead. My own fresh screenshot of it shows the same wasted top and side space the owner complained about in the first place -- and the one browser tab already open on this dev server, before I touched anything, was sitting on v3, not v2.");

			div.c("flex wrap gap", () => {
				div.c("flex v gap-25", () => {
					span.c("h4 muted", "v2 -- has the fix");
					this.img_box(shot("v2-density-switch"), "v2 board with a Compact, Cozy, Roomy switch");
				}).style({ flex: "1 1 16em", minWidth: "0" });
				div.c("flex v gap-25", () => {
					span.c("h4 muted", "v3 -- does not, and wastes the space");
					this.img_box(shot("v3-wasted-space"), "v3 board with a large empty top and right gutter");
				}).style({ flex: "1 1 16em", minWidth: "0" });
			});

			p.c("muted", "Fix: point v3 at the same size switch v2 already built, or tell the owner v2 is the one to use.");
		});
	},

	list() {
		return div.c("flex v gap-25", () => {
			AGREES.forEach(([id, verdict, line, url]) => {
				div.c("flex gap-25", () => {
					badge(verdict);
					span(b(id + " -- "));
					span(line + " ");
					a("source ->").href(url);
				});
			});
		}).ac("wide");
	},
	img_box(src, alt) {
		return img().attr("src", src).attr("alt", alt)
			.style({ width: "100%", height: "9em", objectFit: "cover", objectPosition: "top left", border: "1px solid var(--line)", borderRadius: "var(--radius)" });
	},
});
