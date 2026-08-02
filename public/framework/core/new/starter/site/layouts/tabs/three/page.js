import { Page, p, input } from "/app.js";
import { code } from "../../../ui.js";

export default new Page({
	meta: import.meta,
	title: "three",

	content(){
		p("Tab three. Now open devtools' element inspector and look at `.tab-panel`.");
		input.c("probe").attr("placeholder", "and so does this one");

		code(`
.tab-panel
  .page          ← one,   style="display: none"
  .page          ← two,   style="display: none"
  .page          ← three, visible`, "after visiting all three");

		p("Every tab you've opened is still mounted. That's the trade: instant switching and preserved state, paid for with DOM that never shrinks. A layout that wanted the opposite writes `child.view.remove()` — one word.").ac("note");
	}
});
