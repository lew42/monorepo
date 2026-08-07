import { Page, p, div, input } from "/app.js";
import { code, section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

const view = ["grid", "list", "board"];    // set 1 — owns this page's url
const range = ["day", "week", "month"];    // set 2 — every tab is its own url

export default new Page({
	meta: import.meta,
	title: "Two bars",

	initialize(){
		view.forEach(name => this.add(name, {
			title: name,
			content(){
				p(`The \`${name}\` view. Set 1 chose me.`);
				if (name === "list")
					div.c("row", () => input().attr("placeholder", "type here, then switch bars"));
			}
		}));

		range.forEach(name => this.add(name, `The \`${name}\` range. Set 2 chose me, and set 1 fell back to its first tab — because a url selects exactly one page.`));
	},

	content(){
		when("two choices are genuinely independent and only one of them needs to survive a link — a view mode beside a time range, a language beside a platform.");

		section("Set 1 — owns this url");

		this.$view = this.tabs("grid list board");

		section("Set 2 — every tab is its own url");

		this.$range = this.tabs("day week month");

		section("What a url can say");

		// Derived from the two lists above, not typed out — so this table cannot
		// disagree with the bars it describes.
		code([
			"url".padEnd(34) + "set 1".padEnd(8) + "set 2",
			"".padEnd(34, "─") + "".padEnd(8, "─") + "─────",
			...[...view, ...range].map(name => [
				(name === view[0] ? this.url : this.url + name + "/").padEnd(34),
				(view.includes(name) ? name : view[0]).padEnd(8),
				range.includes(name) ? name : range[0],
			].join("")),
		].join("\n"), "computed from the two lists at the top of this file");

		p("`list` + `week` is not in that table and cannot be reached. That is the deliberate trade: the state is read entirely off the url, so a reload reproduces byte-for-byte what clicking produced. Remembering a per-set selection would make one url mean two different screens depending on how you arrived.").ac("note");

		section("What survives anyway");

		p("Type in the box under `list`, switch to `week`, switch back. The value is still there — pages are built once and never thrown away, so DOM state survives everything except a real reload. Selection is url state; a half-typed input is not.").ac("note");

		section("The file");

		this_file(import.meta);

		cost("one url, one selection. Two independent bars means the second one is never linkable in the state you left it — if both must survive a link, they are not two bars, they are one bar of pairs.");
	}
});
