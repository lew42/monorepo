import { div, span, md, input, textarea, button } from "/app.js";
import Layout from "../Layout.js";
import recipe from "../recipe.js";
import { next } from "../../parts.js";

const field = (label, control) => div.c("flex v gap").style("--gap", "0.3em").append(() => {
	span.c("h4", label);
	control();
});

export default new Layout({
	meta: import.meta,
	title: "Stack",
	description: "Vertical rhythm, and a form that needed none of its own CSS.",
	icon: "view_agenda",

	// no fit word: a form is prose with inputs in it. No `fill` — a long form scrolls.
	classes: "flex v",

	layout(){
		div.c("measure flex v gap").append(() => {

			div.c("h1", "A stack is spacing, and nothing else");

			md(`Every box below is a plain element in a column. Nothing sets a margin, nothing
sets a height, and no control here carries a class of its own — the arrangement is the
container's job and the look is the theme's.`);

			div.c("pad flex v gap surface", () => {
				div.c("h3", "Tell us what you're building");

				field("Email", () => input().attr("type", "email").attr("placeholder", "you@example.com"));
				field("Message", () => textarea.c("auto").attr("rows", "3"));

				div.c("flex gap wrap", () => {
					button.c("prim", "Send");
					button("Cancel");
				});
			});

			md(`## The rhythm is a token

\`flow\` is the class \`Page.render()\` already puts on every page:

\`\`\`css
:where(.flow, blockquote) > * + * { margin-block-start: var(--flow); }
\`\`\`

One em token, \`--flow: 2em\`, declared per flow root — so a container that sets
\`font-size: 0.8em\` tightens its whole rhythm with it. The declaration is \`:where()\`d
to zero, so retuning a whole site is one ordinary rule: \`.flow { --flow: 1.6em }\`.

**A laid-out container owns its spacing with \`gap\` instead**, which is what the form
above uses: \`.flex > * { margin: 0 }\` is in \`@layer util\` and beats the flow owl, so
the two never fight. Rhythm for prose, gap for arrangements — that is the whole
division, and it is why the card holds together at any width.

## The controls brought nothing

\`framework.css\` gives every text input, select and textarea \`width: 100%\`, a padding
and a hairline; \`.btn\`/\`button\` get the same treatment and \`prim\` promotes one of
them to the accent. \`textarea.auto\` is \`field-sizing: content\` — the box follows the
text, so a stack never needs a scrollbar inside a field.

That is a complete sign-up form with **no stylesheet in this folder.**

## What you would build with it

- A form, a checkout flow, an onboarding step
- A settings panel
- Any page that is a sequence rather than an arrangement`);

			recipe(this, "No fit word — the region's default measure. The column is `measure`; the spacing is `gap` inside it and `--flow` outside.");

			next("[Masthead](/framework/styles/layouts/masthead/) — where it all comes together.",
				"styles/layouts/stack/");
		});
	},
});
