import { div, span, p } from "/app.js";

/* One circle: initials on a token fill. No stylesheet — a circle is a radius,
 * and everything else is the flex utilities centring two letters.
 *
 * `--avatar` sizes it, the same token-override move `--column` makes on a grid:
 * one function serves a 1.75em stack chip and a 3.5em profile header. */
export const avatar = (initials, style) =>
	span.c("flex v-center h-center", initials).style({
		width: "var(--avatar, 2.5em)", height: "var(--avatar, 2.5em)",
		flex: "0 0 auto",
		borderRadius: "999px",
		background: "var(--bg)", color: "white",   // the pairing framework.css makes for .bg
		fontWeight: "700", fontSize: "0.8em", letterSpacing: "0.02em",
		...style,
	});

export default () => div.c("flex v gap", () => {

	// three sizes, one token
	div.c("flex gap v-center wrap", () => {
		avatar("ml", { "--avatar": "1.75em" });
		avatar("ML");
		avatar("ML", { "--avatar": "3.5em", background: "var(--prim)" });
	});

	// a stack: negative inline margin, and a --surface ring so they read as layered
	div.c("flex v-center", () => ["ML", "AK", "RB", "+4"].forEach((t, i) =>
		avatar(t, {
			marginLeft: i ? "-0.6em" : "0",
			border: "2px solid var(--surface)",
			...(t.startsWith("+") && { background: "var(--wash)", color: "var(--ink)" }),
		})));

	// beside a name — the attribution row a testimonial uses
	div.c("flex gap v-center", () => {
		avatar("AK", { background: "var(--prim)" });
		div.c("flex v", () => {
			p.c("h4", "Ada K.");
			p("Design engineer").style({ color: "var(--subtle)", fontSize: "0.85em" });
		}).style("gap", "0.1em");
	});
});
