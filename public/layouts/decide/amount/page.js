import { Page, md, div, h2, h3, p, a, nav } from "/app.js";
import { pictures, live, PARTS } from "../demo.js";

/* LAYOUT. Container: a child of /layouts/decide/, the ordinary page grid. Size: both halves
   claim `wide`. Own layout: the little content is a `grid auto` wall of small preview cards
   (--column 16rem); the lot is a `flex auto` row, a nav column (--column 12rem) beside a main
   that grows four times as fast (--grow 4) and lays its sections out as a `grid auto` wall
   (--column 22rem), so no paragraph runs past a reading width at 3440. Preview: default. */
const SECTIONS = [
	["What it is", "Servex is the one process that is always running on this machine. It starts dev servers, runs agents and keeps the dashboard's cards."],
	["Servers", PARTS[0].body],
	["Agents", PARTS[1].body],
	["Cards", PARTS[2].body],
	["Logs", "Servex is the only writer of every log file, so two agents can never tear a line. An agent appends through Servex and reads the result back."],
	["Worktrees", "Agents build in a private copy of the repo with its own server, test it there, and merge only when the smoke test is clean."],
];

export default new Page({
	meta: import.meta,
	title: "A little content, or a lot",
	icon: "density_medium",
	description: "Preview cards against a page with a left nav.",

	content(){
		md("**Match the box to the amount.** A little content, like a preview, gets a small card that is sized by what it says. A lot of content gets structure a reader can steer by: here, a left nav beside sections laid out as a wall.");
		pictures(import.meta, "amount");
		live(() => {
			h2("A little: preview cards");
			div.c("grid gap std-decide-previews", () => PARTS.forEach(part => {
				div.c("card flex v gap-35", () => { a(part.title).attr("href", "/framework/servex/"); p.c("muted", part.body.split(". ")[0] + "."); });
			}));

			h2("A lot: a left nav and its sections");
			div.c("flex auto gap", () => {
				nav.c("card flex v gap-35", () => SECTIONS.forEach(([t]) => a(t).attr("href", "#")));
				// The flex child grows 4x from the row's 12rem basis; the wall inside it has its own --column.
				div(() => div.c("grid auto gap", () => SECTIONS.forEach(([t, body]) => {
					div.c("flex v gap-35", () => { h3(t); p(body); });
				})).style("--column", "22rem")).style("--grow", 4);
			}).style("--column", "12rem");
		});
	},
});
