import { md } from "/app.js";
import { PagingNavSub } from "../../screen.js";

export default new PagingNavSub({
	meta: import.meta,
	title: "Overview",
	icon: "dashboard",
	description: "The panel you arrive on.",

	content(){
		md("**Click the other two names in the rail, then look back at the rail.** Nothing about it moved: not its width, not the position of any link, not the label you clicked. Only this box changed, and the url in your address bar changed with it — these are real pages at real addresses, and you can send someone a link to one.");

		md("That is the answer to *\"how do you go from a full screen down to sub pages without a jump?\"* — you give the part that changes a box of its own, and you make that box's size come from the screen rather than from its contents. The rail and this box are the two halves of one flex row whose height is the window, so neither can be resized by what is inside it.");

		md("The three numbers, measured across all three sub pages at 1280 and 3440: the rail moved **0px**, this box moved **0px**, and this box's size changed by **0px**. [How](/imagine/paging/navigation/doc/measurements/).");
	},
});
