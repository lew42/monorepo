import { md } from "/app.js";
import { PagingNavSub } from "../../screen.js";

export default new PagingNavSub({
	meta: import.meta,
	title: "Settings",
	icon: "settings",
	description: "A short panel, for contrast.",

	content(){
		md("**Three lines, after a panel that was fourteen screens long.** The box did not shrink back — its size comes from the window, not from this text.");

		md("A box whose size comes from its content is the whole of the vertical jumping problem, and it is the same problem whether the thing changing is a tab panel, a swap stage, or a whole sub page.");

		md("Back to the argument, with every number: [Navigation](/imagine/paging/navigation/).");
	},
});
