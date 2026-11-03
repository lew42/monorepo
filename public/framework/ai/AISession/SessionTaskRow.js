import { small } from "/framework/core/View/View.js";
import MobileTaskRow from "../sessions/v/mobile/MobileTaskRow.js";
import MobileData from "../sessions/v/mobile/MobileData.js";

/** The phone's task row (MobileTaskRow) on the desktop Overview: the same dot, title, outcome line and bar; it opens the task's full page, and the task's own cost sits at the right. */
export default class SessionTaskRow extends MobileTaskRow {

	href(){ return this.node.url ?? "#"; }

	initialize(){
		super.initialize();
		this.ac("sov-task");
		if (this.node.usd != null) this.append(() => small.c("sov-cost", MobileData.usd(this.node.usd)));
	}
}
