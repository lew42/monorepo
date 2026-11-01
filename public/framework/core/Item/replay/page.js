import { Page } from "/app.js";
import ReplayLab from "./ReplayLab.js";

export default new Page({
	meta: import.meta,
	title: "Replay lab",
	label: "Replay",
	description: "Press a button, reload, and see what the real Item, Task and Store bring back and what they run a second time.",
	icon: "replay",
	width: "wide",
	content(){ new ReplayLab().ac("wide"); },
});
