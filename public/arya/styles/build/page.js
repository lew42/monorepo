import { h2, h3, p, div, span, a, ul, li, strong, label, input, select, option, button, fieldset, legend, header, footer, section, small } from "/app.js";
import Page from "../../lib/Page.js";
import { demo, note, snippet } from "../../lib/ui.js";

// the only things that are not framework.css classes
const PANEL = { background: "white", border: "1px solid rgba(0,0,0,0.1)", "border-radius": "0.5em" };
const DARK = { background: "var(--bg)", color: "white" };

export default new Page(import.meta, {

	body() {
		p("A whole landing page. Every layout decision below is a `framework.css` utility class and nothing else. Inline styles set colours and radii only, and there is not one media query in it.");

		note(p("Resize the window and watch it reflow. The nav, the feature row, the pricing cards and the form all break on their own, because `--column` is doing the work."));

		h2("The page");

		div.c("showcase", () => {

			header.c("flex split v-center wrap gap pad", () => {
				div.c("flex gap v-center", () => {
					strong("Kettle");
					span("docs").style("opacity", "0.6");
					span("pricing").style("opacity", "0.6");
				});
				div.c("flex gap", () => {
					a("Log in").ac("btn").href("#");
					a("Start free").ac("btn prim").href("#");
				});
			}).style({ "border-bottom": "1px solid rgba(0,0,0,0.1)" });

			section.c("pad", () => {
				div.c("flex auto gap-2em v-center", () => {
					div(() => {
						h2("Ship a page in an afternoon").style({ "font-size": "2.2em", margin: "0 0 0.4em", "line-height": "1.1" });
						p("No build step, no config, no framework to learn twice. Write a file, refresh the browser, you are done.").style({ "font-size": "1.1em", opacity: "0.7", "max-width": "24em" });
						div.c("flex gap", () => {
							a("Start free").ac("btn prim").href("#");
							a("Read the docs").ac("btn bg").href("#");
						}).style("margin-top", "1.5em");
					});

					div.c("pad", () => {
						div("$ npm install").style("opacity", "0.5");
						div("$ node server.js");
						div("→ localhost").style({ color: "var(--prim)", "font-weight": "600" });
					}).style({ ...DARK, "border-radius": "0.5em", "font-family": "Consolas, monospace", "font-size": "0.9em", "line-height": "2" });
				});
			}).style({ padding: "3em 1em" });

			section.c("pad", () => {
				div.c("grid three gap", () => {
					feature("No build", "Native ES modules, served straight off disk. Nothing between your file and the browser.");
					feature("Two classes", "View wraps an element. App boots the site. That is the entire API surface.");
					feature("Opt-in styles", "A reset and a dozen utilities. Everything else is a class you chose to type.");
				});
			}).style({ background: "rgba(0,0,0,0.03)", padding: "3em 1em" });

			section.c("pad", () => {
				h3("Pricing").style({ "text-align": "center", "margin-bottom": "1.5em" });
				div.c("flex auto gap", () => {
					plan("Hobby", "$0", ["One project", "Community support"], false);
					plan("Team", "$12", ["Ten projects", "Email support", "Preview URLs"], true);
					plan("Company", "$40", ["Unlimited", "Priority support", "SSO"], false);
				});
			}).style({ padding: "3em 1em" });

			section.c("pad", () => {
				div(() => {
					fieldset(() => {
						legend("Get started");
						div.c("flex auto gap", () => {
							div(() => { label("First name"); input().attr("placeholder", "Ada"); });
							div(() => { label("Last name"); input().attr("placeholder", "Lovelace"); });
						});
						label("Email");
						input().attr("type", "email").attr("placeholder", "ada@example.com");
						label("Plan");
						select(() => { option("Hobby"); option("Team"); option("Company"); });
						label(input().attr("type", "checkbox"), " Send me the occasional update")
							.style({ display: "block", margin: "1em 0" });
						button("Create account").ac("prim").style("width", "100%");
					}).style({ ...PANEL, "border-color": "rgba(0,0,0,0.15)" });
				}).style({ "max-width": "26em", margin: "0 auto" });
			}).style({ background: "rgba(0,0,0,0.03)", padding: "3em 1em" });

			footer.c("flex split wrap gap pad", () => {
				small("© Kettle").style("opacity", "0.6");
				div.c("flex gap", () => {
					small("Docs").style("opacity", "0.6");
					small("GitHub").style("opacity", "0.6");
					small("Status").style("opacity", "0.6");
				});
			}).style({ "border-top": "1px solid rgba(0,0,0,0.1)" });
		});

		h2("What it is made of");

		p("Reading the source of the page above, in order:");

		snippet(`header.c("flex split v-center gap pad")   // logo left, buttons right
section  > div.c("flex auto gap-2em v-center")   // hero, stacks on narrow
section  > div.c("grid three gap")               // features, 3 or 1
section  > div.c("flex auto gap")                // pricing, wraps at --column
fieldset > div.c("flex auto gap")                // name fields, side by side
footer.c("flex split wrap gap pad")              // copyright left, links right`);

		p(strong("Two classes do almost all of it."), " `flex split` for anything with a left side and a right side, and `auto` for anything that should become a stack when it runs out of room. Once those two clicked, I stopped thinking about breakpoints.");

		h2("Where I had to write real CSS");

		p("Three places, and I think all three are gaps worth filling:");

		p(strong("A surface."), " There is no class for \"a white box with a border and a radius\" — a card, a panel, a well. Every layout needs one, and everybody will write their own slightly differently.");

		p(strong("Vertical section padding."), " `.pad` is `1em` on all four sides. A page section wants something like `3em` top and bottom and `1em` on the sides, so every section here carries an inline style.");

		p(strong("A content container."), " Centring at a max width is the first thing any page needs and there is no class for it.");

		p("Sketched out, that is maybe six lines:");

		snippet(`.surface   { background: #fff; border: 1px solid var(--line);
             border-radius: 0.5em; }
.section   { padding: 3em 1em; }
.container { max-width: 60em; margin-inline: auto; }
.pad-2em   { padding: 2em; }
.mt        { margin-top: 1em; }
.text-center { text-align: center; }`);

		p("With those, the page above would have had zero inline styles that were not a colour choice.");
	}
});

function feature(title, text) {
	div.c("pad", () => {
		h3(title).style({ margin: "0 0 0.4em", "font-size": "1em" });
		p(text).style({ margin: 0, opacity: "0.7", "font-size": "0.92em" });
	}).style(PANEL);
}

function plan(name, price, features, highlight) {
	div.c("pad", () => {
		div(name).style({ "text-transform": "uppercase", "letter-spacing": "0.08em", "font-size": "0.75em", opacity: "0.6" });
		div(price, span("/mo").style({ "font-size": "0.5em", opacity: "0.6" }))
			.style({ "font-size": "2em", "font-weight": "600", margin: "0.2em 0 0.6em" });
		ul(() => features.forEach(f => li(f).style({ "font-size": "0.9em", "line-height": "1.8" })))
			.style({ margin: "0 0 1.25em", "list-style": "none", "padding-left": 0 });
		a("Choose").ac(highlight ? "btn prim" : "btn bg").href("#").style({ display: "block", "text-align": "center" });
	}).style(highlight ? { ...PANEL, "border-color": "var(--prim)", "box-shadow": "0 0 0 1px var(--prim)" } : PANEL);
}
