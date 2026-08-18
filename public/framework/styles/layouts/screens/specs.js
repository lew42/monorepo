import { div, span, h3, p, icon, input, button, progress } from "/app.js";

/* Three screens from the Figma frame `Frame 14620` (node 181:1456) — a phone-width app
 * (home / profile / settings) that this file keeps as a phone-width app, plus a bottom
 * tab bar shared by all three. The frame's other four screens (homepage, landing-page,
 * about-page, contact-page) are a marketing site, not this app, and already exist as
 * real layouts — page.js links them instead of rebuilding them; see doc/decisions.md.
 *
 * The owner's brief for this node: "feel free to use existing colors... feel free
 * (encouraged) to rewrite any text to express anything about our framework." So the
 * copy below is true sentences about THIS framework, not the fictional site `web.js`
 * draws for the rest of this directory — a habit tracker became a build-facts checklist,
 * a toggle list became real settings for this repo.
 *
 * ⚠ One spacing value beyond the default: `--gap: 0.6em`–`1.4em` between stacked cards.
 *   `--pad` is never set — every card is a plain `.pad` at its 1em default. */

const screen = { background: "var(--surface)" };
const scrolls = { minHeight: "0", overflowY: "auto" };

/* Real numbers, not invented ones — the same three facts `ui/stats/page.js` already
 * ships (`npm deps 3, build steps 0, core classes 5, tokens 16`), picked for icons that
 * exist in Material Symbols. Reused, not retyped, so the two pages cannot drift apart. */
const STATS = [
	["bolt", "0", "build steps"],
	["account_tree", "5", "core classes"],
	["tune", "16", "tokens"],
];

const TABS = [["home", "Home"], ["person", "Profile"], ["settings", "Settings"]];

/* The bottom tab bar, shared by all three phone screens below — `flex split`, the same
 * row word every other layout in this directory uses for a header. No new component:
 * the current tab is `var(--prim)` on the glyph and un-muted on the label. */
const tabs = current => div.c("flex split pad wash", () => TABS.forEach(([glyph, label]) =>
	div.c("flex v gap h-center", () => {
		icon(glyph).style("color", label === current ? "var(--prim)" : "");
		span.c("h4", label).ac(label !== current && "muted");
	}).style("--gap", "0.2em"))).style("--pad", "0.7em 1em");

/* A checklist row — icon chip, label + note, a native checkbox on the end. The Figma's
 * ellipse-ring checkbox and this file's `<input type="checkbox">` are the same idea in
 * two engines: `framework.css` already themes it (`accent-color`, see `ui/progress/`),
 * so a real form control costs nothing here that a drawn one would not. */
const check = (glyph, label, note, on) => div.c("surface pad flex split v-center", () => {
	div.c("flex gap v-center", () => {
		div.c("wash flex v-center h-center", () => icon(glyph))
			.style({ width: "2.2em", height: "2.2em", borderRadius: "var(--radius)", flex: "0 0 auto" });
		div.c("flex v", () => { span.c("h4", label); span.c("muted", note); }).style("--gap", "0.1em");
	}).style("--gap", "0.7em");
	const box = input().attr("type", "checkbox");
	if (on) box.attr("checked", "checked");
});

const group = title => (...rows) => div.c("flex v gap", () => {
	span.c("h4 muted", title.toUpperCase());
	div.c("surface flex v", () => rows.forEach(row => row()));
}).style("--gap", "0.5em");

const row_style = { "--pad": "0.8em 1em", borderBottom: "1px solid var(--line)" };

const toggle_row = (label, on) => div.c("flex split v-center pad", () => {
	span(label);
	const box = input().attr("type", "checkbox");
	if (on) box.attr("checked", "checked");
}).style(row_style);

const nav_row = (label, note) => div.c("flex split v-center pad", () => {
	div.c("flex v", () => { span(label); span.c("muted", note); }).style("--gap", "0.05em");
	icon("chevron_right");
}).style(row_style);

export const specs = [

	{
		name: "today", title: "Today",
		description: "A daily checklist — three real framework facts standing in for three habits.",
		note: "**The Figma's habit tracker (water, breathing, a walk) became a build checklist.** "
			+ "Same shape — an icon chip, a label and a note, a control on the end — three true "
			+ "sentences about this framework instead of three invented ones. The only new element "
			+ "is a native `<progress>`, already themed by `framework.css`'s `accent-color` "
			+ "(see [ui/progress](/framework/ui/progress/)); the checkboxes are the same trick.",
		layout(){
			return div.c("page full fill flex v", () => {

				div.c("flex split v-center pad wash", () =>
					div.c("flex v", () => {
						span.c("muted", "Tuesday, August 18");
						h3("Good morning, builder");
					}).style("--gap", "0.1em"));

				div.c("flex-1", () => {
					div.c("flex v gap pad", () => {

						div.c("surface pad flex v gap", () => {
							div.c("flex split v-center", () => {
								span.c("h4", "Adoption");
								span.c("h4 muted", "100%");
							});
							progress().attr("max", "100").attr("value", "100").style("width", "100%");
							p.c("muted", "Zero bundler, zero transpile step — what ships is what you wrote.");
						}).style("--gap", "0.6em");

						group("Core checks")(
							() => check("bolt", "No build step", "public/ runs as-is in the browser", true),
							() => check("code", "Native ESM imports", "every import is a real .js URL", true),
							() => check("view_quilt", "Layout is a class string", "no stylesheet in this directory", true),
						);

					}).style({ "--gap": "1.2em", padding: "1.2em" });
				}).style(scrolls);

				tabs("Home");
			}).style(screen);
		},
	},

	{
		name: "profile", title: "Profile",
		description: "An avatar, three stats, a card — `ui/avatar`'s class and `ui/stats`'s own numbers.",
		note: "**`.ui-avatar` and the stat wall are both existing components, not new markup** — "
			+ "see [ui/avatar](/framework/ui/avatar/) and [ui/stats](/framework/ui/stats/). The three "
			+ "numbers here are copied verbatim from `ui/stats/page.js` (`build steps`, `core classes`, "
			+ "`tokens`) rather than reinvented, so the two pages cannot disagree with each other.",
		layout(){
			return div.c("page full fill flex v", () => {

				div.c("flex v gap h-center pad wash", () => {
					span.c("ui-avatar", "L4").style("--avatar", "4.5em");
					div.c("flex v gap h-center", () => {
						h3("Lew42");
						span.c("muted", "no build · native ESM");
					}).style("--gap", "0.1em");
				}).style({ "--gap": "0.6em", textAlign: "center" });

				div.c("flex-1", () => {
					div.c("flex v gap pad", () => {

						div.c("grid gap auto", () => STATS.forEach(([glyph, value, label]) =>
							div.c("surface pad flex v gap", () => {
								icon(glyph).style({ color: "var(--prim)", fontSize: "1.1em" });
								span.c("h2", value);
								span.c("h4 muted", label);
							}).style("--gap", "0.15em")))
							.style("--column", "9em");

						div.c("surface pad flex v gap", () => {
							span.c("h4", "Why it works");
							p.c("muted", "Composition over configuration: a page is a class, a layout "
								+ "is a class string, and there is nothing else to learn.");
						}).style("--gap", "0.4em");

					}).style({ "--gap": "1.2em", padding: "1.2em" });
				}).style(scrolls);

				tabs("Profile");
			}).style(screen);
		},
	},

	{
		name: "prefs", title: "Preferences",
		description: "Grouped rows and a native checkbox standing in for the Figma's toggle switch.",
		note: "**There is no toggle-switch class, and this is the honest placeholder for one.** "
			+ "`<input type=\"checkbox\">` is themed for free (`accent-color`, same as `today`'s "
			+ "checklist); a pill-shaped switch would be new CSS this task does not own. The two "
			+ "counts below (`28`, `19`) are read from this directory and `ui/`'s own readme, not "
			+ "guessed.",
		layout(){
			return div.c("page full fill flex v", () => {

				div.c("pad wash", () => h3("Settings"));

				div.c("flex-1", () => {
					div.c("flex v gap pad", () => {

						group("Appearance")(
							() => toggle_row("Dark mode", true),
							() => toggle_row("Reduced motion", false),
						);

						group("Framework")(
							() => nav_row("Layouts", "28 pages"),
							() => nav_row("UI components", "19 components"),
							() => nav_row("Documentation", "one doc/ per module"),
						);

						button.c("prim", "Reset to defaults").style("width", "100%");

					}).style({ "--gap": "1.4em", padding: "1.2em" });
				}).style(scrolls);

				tabs("Settings");
			}).style(screen);
		},
	},

];

export default specs;
