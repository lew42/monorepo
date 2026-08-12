import { Page, div, md } from "/app.js";
import detail from "../detail.js";
import { next } from "../../parts.js";

export default new Page(detail({
	meta: import.meta,
	title: "Centered",
	description: "A measure of prose, centred — one utility class.",
	icon: "format_align_center",

	note: "No fit word — the region's default measure. The column is one utility class, and it is the one page here that is *supposed* to look narrow.",

	layout(){

		// no fit word: the region's default sheet. No `fill` — an article scrolls.
		return div.c("page flex v", () => {

			div.c("measure flex v gap").append(() => {

				div.c("h1", "One column, centred");

				md(`Somewhere between 60 and 80 characters a line stops being comfortable to
read — the eye loses its place on the return sweep. This column is \`34em\` and runs
about 62 characters, which is why it reads as an article and the full width of this
region would not.

## One class

\`\`\`js
div.c("measure flex v gap")
\`\`\`

\`\`\`css
.measure { --measure: 34em; max-width: min(var(--measure), 100%); margin-inline: auto; }
\`\`\`

Neither declaration is available on its own and \`max-width\` alone leaves the column
flush left, which is why this is a class rather than two. Widen it in place —
\`.style("--measure", "78em")\` — and the inline value beats the class. Every band in
[Sections](/framework/styles/sections/) does exactly that.

## The trap it removes

\`margin-inline: auto\` used to **do nothing inside a flex container**: \`.flex > *
{ margin: 0 }\` is in \`@layer util\` and beat any component rule, so a centred box
dropped into a flex row silently went flush left. \`.measure\` is declared *after*
that rule in the same layer, so it wins — and this page is an ordinary \`flex v\`
page again.

## What you would build with it

- An article, a changelog, an error page
- A sign-in card
- Almost every documentation page ever written

A measured page and this class say the same thing at two scales, so on a page that
is already a reading column \`.measure\` is redundant on purpose. It earns its place
the moment the *page* is wider than the reading — a \`pad\` index with one paragraph
of introduction, or a \`full\` layout with a caption.`);

				next("[Stack](/framework/styles/layouts/stack/) — the same measure, with rhythm inside it.",
					"styles/layouts/centered/");
			});
		});
	},
}));
