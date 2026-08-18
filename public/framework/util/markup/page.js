import { Doc, md, code, h2, demo, div, h3, p, a, toc } from "/app.js";
import { markup } from "./markup.js";

export default new Doc({
	meta: import.meta,
	title: "markup",
	description: "An element's children as readable HTML source.",
	icon: "html",

	notes: "design decisions",
	files: "markup.js page.js readme.md",

	content(){

		toc();

		code.js(`markup(view.el)`);

		md("Gives you back the HTML a `View` chain actually built — indented, and readable:");

		demo(() => {
			const card = div.c("card", () => {
				h3("Title");
				p("Body, with a ", a("link").href("/"), " in it.");
			});

			code.html(markup(card.el));
		}, "The `.card` above renders too — this demo shows its own subject twice, once as a card and once as source.");

		h2("Why not innerHTML");

		md("`el.innerHTML` is the same information and unreadable: one line, no indentation, and every whitespace text node the builder happened to leave behind. This is for a **reader**.");

		h2("It reads the live DOM");

		md("Which is the whole value — it reports what *is* there, not what was meant, so a doc page showing markup cannot drift from the thing it's showing. It's what [demo()](/framework/ext/demo/)'s `html` pane calls — the only caller today.");

		md("The honest consequence: a class something else added shows up too. An `<a>` inside a demo will carry `.in-path` if the current url happens to sit under its `href`, because [Router](/framework/core/Router/) really did put it there.");

		h2("Rules");

		md(`| | |
|---|---|
| **phrasing content** | stays inline — \`<a>\`, \`<code>\`, \`<strong>\`, \`<span>\`… |
| **a long run of it** | *wraps* at 68 columns, like the text it is — it never breaks into one chunk per line |
| **a block child** | forces the parent onto several lines, however short |
| **one real tab per level** | so how wide a level reads is \`tab-size\` at the other end, not a decision made here |
| \`pre\` \`textarea\` | copied verbatim — whitespace is content, re-indenting would change what renders |
| **nothing is escaped** | the result is text, and everything that renders it escapes once already |

That last one is a trap worth naming: escaping here as well is how you get
\`&amp;lt;div&amp;gt;\` on the page.`);

		md("Next: [Dev server](/framework/dev/) — live reload, and how to run all this locally.");

		md.details(import.meta, "readme.md", "Readme");
	}
});
