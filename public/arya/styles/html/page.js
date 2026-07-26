import { h1, h2, h3, h4, p, a, ul, ol, li, pre, code, hr, table, thead, tbody, tr, th, td, blockquote, strong, em, img, el } from "/app.js";
import Page from "../../lib/Page.js";
import { demo, note } from "../../lib/ui.js";

export default new Page(import.meta, {

	body() {
		p("What plain tags look like with only `framework.css` loaded. Nothing here has a class on it.");

		h2("Headings");

		demo(() => {
			h1("Heading one");
			h2("Heading two");
			h3("Heading three");
			h4("Heading four");
		});

		note(p("Heading margins are the browser's — the framework leaves them alone, and there is a commented-out rule in `framework.css` where a tighter `line-height` used to be. Set your own if the spacing feels loose."));

		h2("Text");

		demo(() => {
			p("Body copy sits at `clamp(16px, 2vw, 20px)`, so it grows with the viewport instead of jumping at a breakpoint. Line height is 1.5 and long words wrap rather than overflow.");
			p(strong("Bold"), " and ", em("italic"), " and ", a("a link").href("#"), " and ", code("inline code"), ".");
		});

		h2("Lists");

		demo(() => {
			ul(() => {
				li("Unordered");
				li("Padding-left is 1.2em, tighter than the browser default");
				li(() => {
					el("span", "Nested:");
					ul(() => {
						li("one");
						li("two");
					});
				});
			});
			ol(() => {
				li("Ordered");
				li("Same padding");
			});
		});

		h2("Code");

		p("`pre` gets `overflow-x: auto`, which is the one thing that stops a long line from stretching the whole page.");

		demo(() => {
			pre(`const long = "this line is deliberately far too wide to fit inside the preview box, so it scrolls";`);
		});

		h2("Quotes and rules");

		demo(() => {
			blockquote("A blockquote is untouched — browser defaults only.");
			hr();
			p("`hr` gets 3em of vertical margin, so it reads as a section break rather than a line.");
		});

		h2("Tables");

		p("Tables get nothing at all. If you want borders, that is your CSS:");

		demo(() => {
			table(() => {
				thead(() => tr(() => { th("Tag"); th("Styled by framework.css"); }));
				tbody(() => {
					tr(() => { td("p, h1-h6"); td("wrapping only"); });
					tr(() => { td("pre"); td("horizontal scroll"); });
					tr(() => { td("ul, ol"); td("padding-left"); });
					tr(() => { td("table"); td("nothing"); });
				});
			});
		});

		h2("Media");

		p("`img`, `video`, `canvas` and `svg` are all `display: block` with `max-width: 100%`, so an image can never blow out its container and there is no mystery gap under it.");

		demo(() => {
			img().attr("src", "/assets/img/favicon.png").attr("alt", "favicon").attr("width", "64");
		});
	}
});
