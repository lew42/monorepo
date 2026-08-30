import { Page, md, code, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Util",
	label: "Utilities",
	description: "Small, dependency-free helpers. Plain functions, no classes, no state.",
	icon: "handyman",

	children: "is source markup",

	content(){

		// Line first: the import path means nothing until you know what is behind it.
		md("Plain functions — no classes, no state — and one rule for what gets in: **two callers that must agree.**");

		code.js(`import { is } from "/app.js";`);

		this.previews();

		h2("What earns a place here");

		md("Each of these three has the same story:\n\n- `is` — `View.append()` dispatches on argument type, and so does `prepend()`. One answer to *\"is this a view, a function, a promise?\"*\n- `source` — `demo(fn)` renders a function's source and `code.fn(fn)` renders it too. If they disagreed about where a body starts, one function would print two ways on one page.\n- `markup` — `demo()`'s html pane and any element reference both want *\"show me this DOM as source\"*.\n\nA helper with one caller belongs in that caller. A helper with two belongs here — because the alternative is not two copies, it's two copies that **drift**.");

		md("Next: [is](/framework/util/is/) — the type checks the dispatch logic runs on.");
	}
});
