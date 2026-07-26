import { Page2, h1, h2, h3, h4, h5, h6, p, a, strong, em, code, blockquote, hr, small } from "/app.js";

export default new Page2({
	meta: import.meta,
	title: "Text",
	description: "Headings, paragraphs, links, emphasis, quotes.",
	content(){
		h1("Heading 1");
		h2("Heading 2");
		h3("Heading 3");
		h4("Heading 4");
		h5("Heading 5");
		h6("Heading 6");

		p("A paragraph of body copy. It contains a ", a("link").href("#"), ", some ", strong("bold"), " and ", em("italic"), " text, and `inline code` (backticks in a `p()` string auto-become code elements).");

		p(small("Small print sits here for fine print and asides."));

		blockquote(p("A blockquote — base styles keep it plain; a theme can add the accent border."));

		hr();

		p("Above is an `<hr>`. All of this is unstyled beyond `framework.css` base.");
	}
});
