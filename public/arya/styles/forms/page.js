import { h2, p, div, form, fieldset, legend, label, input, select, option, textarea, button, a, strong } from "/app.js";
import Page from "../../lib/Page.js";
import { demo, snippet, note, api } from "../../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("Forms are the part of `framework.css` that does the most work for you. Text inputs, selects and textareas are all full width, share one border, and inherit your font.");

		h2("Text inputs");

		demo(() => {
			label("Name");
			input().attr("placeholder", "full width by default");
			label("Email");
			input().attr("type", "email").attr("placeholder", "you@example.com");
			label("Message");
			textarea().attr("rows", "3");
		});

		note(p("`input, button, textarea, select { font: inherit }` is in the base layer. Without it, form controls quietly render at 13px Arial in every browser, and it is the single most common reason a new site looks off."));

		h2("Select");

		p("The native arrow is replaced with an inline SVG, so a select matches the inputs next to it instead of looking like a system widget.");

		demo(() => {
			select(() => {
				option("Choose one");
				option("Second");
				option("Third");
			});
		});

		h2("Checkboxes and radios");

		p("These are deliberately left alone — no width, no border, just `accent-color: var(--prim)`, which recolours the native control without breaking it.");

		demo(() => {
			label(input().attr("type", "checkbox").attr("checked", ""), " checked");
			label(input().attr("type", "checkbox"), " unchecked");
			label(input().attr("type", "radio").attr("name", "r").attr("checked", ""), " radio one");
			label(input().attr("type", "radio").attr("name", "r"), " radio two");
		});

		note(p("`label` is inline by default, so those sit on one line. Wrap each in a `div` or use `.flex.v` if you want them stacked."));

		h2("Buttons");

		p("`button` gets padding and a pointer. Two modifier classes give it colour, and `.btn` puts the same look on a link.");

		demo(() => {
			div.c("flex gap wrap", () => {
				button("default");
				button("prim").ac("prim");
				button("bg").ac("bg");
				a("a.btn.prim").ac("btn prim").href("#");
				button("disabled").attr("disabled", "");
			});
		});

		note(p("A disabled button gets no styling of its own — it is greyed by the browser only. Worth adding a rule for."));

		h2("Fieldsets");

		p("`fieldset` and `legend` are the cheapest way to group a form, and the framework already zeroes the top margin on the first paragraph inside so the spacing works out.");

		demo(() => {
			form(() => {
				fieldset(() => {
					legend("Account");
					label("Username");
					input().attr("placeholder", "arya");
					label("Plan");
					select(() => {
						option("Free");
						option("Pro");
					});
					div.c("flex gap", () => {
						button("Save").ac("prim");
						button("Cancel").attr("type", "button");
					}).style("margin-top", "1em");
				});
			});
		});

		h2("Reading values");

		p("There is no `.value()` helper, so go through `.el`:");

		snippet(`const name = input().attr("placeholder", "name");

button("submit").click(() => {
    console.log(name.el.value);
});`);

		demo(() => {
			const field = input().attr("placeholder", "type something");
			const out = div("—");

			div.c("flex gap v-center", () => {
				button("read it").ac("prim").click(() => out.text(field.el.value || "—"));
			}).style("margin-top", "0.5em");

			field.on("input", () => out.text(field.el.value || "—"));
		});

		h2("A layout that holds up");

		p("Two fields side by side that stack on their own, with no media query — this is `.flex.auto`, covered on the ", a("Flex").href("/arya/styles/flex/"), " page:");

		demo(() => {
			div.c("flex auto gap", () => {
				div(() => { label("First"); input(); });
				div(() => { label("Last"); input(); });
			});
			div(() => { label("Address"); input(); });
		});

		p(strong("Narrow this window"), " and the two fields drop onto separate lines when each would go under `--column`.");
	}
});
