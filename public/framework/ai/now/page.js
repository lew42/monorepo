import { Page } from "/app.js";
import AINow from "./AINow.js";

export default new Page({
	meta: import.meta,
	title: "Now",
	description: "Every session running right now: who, what it is doing, where it lives, what it has cost. Computed from the session index, live.",
	icon: "bolt",
	classes: "an-page",
	content(){ new AINow(); },
});
