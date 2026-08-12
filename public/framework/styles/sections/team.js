import { div, p, span } from "/app.js";
import { band } from "./tone.js";

/* css: .ui-avatar — the circle ships from ui/, and this import is the loading edge. */
import "/framework/ui/avatar/avatar.js";

/* A team wall is a card wall with a circle at the top of each card, and
 * `grid gap auto` re-counts the row at every width. */
const PEOPLE = [
	["AK", "Ada K.", "Design engineer", "Owns the type scale and the argument against a sixth level."],
	["RB", "Rae B.", "Contributor", "Shipped a page eleven minutes after cloning."],
	["JT", "Jun T.", "Docs", "Writes the readme that stops the idea being re-litigated."],
	["SO", "Sam O.", "Router", "Deletes more than they add, on purpose."],
	["NP", "Nia P.", "Themes", "Proved two themes can render side by side on one page."],
	["EV", "Eli V.", "Dev server", "Three npm packages, and an argument for each one."],
];

const person = (initials, name, role, note) =>
	div.c("pad flex v surface", () => {
		span.c("ui-avatar", initials).style("--avatar", "3em");
		p.c("h3", name);
		// `--prim` and not the band's `--eyebrow`: this text is inside a card that
		// repainted `--surface`, so the accent is readable again whatever the band is.
		p.c("h4", role).style("color", "var(--prim)");
		p.c("muted", note);
	}).style("gap", "0.4em");

export default (tone = "wash") =>
	div.c("section-band", () =>
		div.c("measure flex v gap", () => {
			p.c("h4", "WHO").style("color", "var(--eyebrow, var(--prim))");

			p.c("h2", "Small enough to fit in a room");

			div.c("grid gap auto", () => PEOPLE.forEach(who => person(...who)));
		}).style("--measure", "62em")
	).style(band(tone));
