import { div, p, form, label, input, textarea, button, icon } from "/app.js";
import { band } from "./tone.js";

/* Split, filled: the channels on one side, a real form on the other, and
 * `flex gap auto` stacks them the moment the row runs out of room.
 *
 * A labelled control is `label.c("flex v")` — the label element IS the row, so
 * clicking the caption focuses the field with no `for`/`id` pair to keep in
 * sync. framework.css already gives the input its border, padding and width. */
const field = (caption, control) => label.c("flex v", () => {
	p.c("h4", caption);
	control();
}).style("gap", "0.3em");

const channel = (glyph, title, line) => div.c("flex gap", () => {
	icon(glyph).style("color", "var(--eyebrow, var(--prim))");

	div.c("flex v", () => {
		p.c("h3", title);
		p.c("muted", line);
	}).style("gap", "0.1em");
});

export default (tone = "wash") =>
	div.c("section-band", () =>
		div.c("measure flex gap auto", () => {

			div.c("flex v gap", () => {
				p.c("h4", "GET IN TOUCH").style("color", "var(--eyebrow, var(--prim))");

				p.c("h2", "Ask anything");

				channel("forum", "Discussions", "Design questions, and why something is the way it is.");
				channel("bug_report", "Issues", "A page that broke, with the url you were on.");
				channel("alternate_email", "Email", "Anything that does not belong in public.");
			});

			form.c("flex v gap", () => {
				field("Name", () => input().attr("type", "text").attr("placeholder", "Ada K."));
				field("Email", () => input().attr("type", "email").attr("placeholder", "you@example.com"));
				field("Message", () => textarea().ac("auto").attr("rows", "3").attr("placeholder", "What are you building?"));

				button.c("prim", "Send").style("align-self", "flex-start");
			}).on("submit", e => e.preventDefault());

		}).style("--measure", "62em")
	).style(band(tone));
