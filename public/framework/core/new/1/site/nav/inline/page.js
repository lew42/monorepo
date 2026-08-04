import { Page, p, a } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

const back = () => a.c("page-link", "← inline").href("/nav/inline/");

export default new Page({
	meta: import.meta,
	title: "Inline children",

	// initialize() runs inside the constructor, so these are in `children` before
	// anything could ever walk to them. Four shapes, cheapest first.
	initialize(){
		this.add("string", "A string IS the content. That is the whole page — and it is also a dead end, because a string cannot hold a link. Use Back.");

		this.add("fn", () => {
			p("A content function. It runs while my `div.page` is the captor, so anything it builds lands inside me.");
			back();
		});

		this.add("options", {
			title: "An options object",
			content(){
				p("Same as a function, with room for a title. `naming()` falls back to the declared name when there is no title — which is why the first two cards read `string` and `fn`, and mine reads a sentence.");
				back();
			}
		});

		this.add("built", new Page({
			title: "A Page you built",
			content(){
				p("I was constructed before I was adopted, so I had no url of my own. `add()` assigned my name and parent and re-ran `naming()` — one method, called from both places, so construction and adoption cannot drift apart.");
				back();
			}
		}));
	},

	content(){
		source(import.meta);

		p("Four shapes, one method. A file-backed child and an inline one arrive the same way, because `add()` is the only place `parent` is assigned.");

		section("All four are real urls");

		this.previews();

		p("None of them has a file. The url is mine plus the name I gave it, so an inline page never writes a path — and moving this page moves its whole subtree with it.").ac("note");

		p("One thing a string cannot do: backticks. `render()` appends a non-function content straight to the element, and the backtick pass that turns `like this` into code lives in `p()`. A string child gets raw text, exactly as typed.").ac("note");

		section("A name is not free");

		p("`add()` also sets `this.<name>` as a shortcut, but only when that property is free — `child`, `link`, `render`, `chain` and `container` are methods on `Page`, so a child with one of those names quietly gets none. That is the right answer, and it is why the child on `/nav/replace/` is called `deeper`.").ac("note");

		p("A name lands in a second global namespace too, and that one is not guarded. `/nav/naming/` reproduces it and measures the fix.").ac("note");

		a.c("page-link", "What a name costs  →").href("/nav/naming/");

		section("Next");

		a.c("page-link", "route()  →").href("/nav/dynamic/");
	}
});
