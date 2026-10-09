import { Page } from "/app.js";
import { class_cards } from "../system-classes.js";

// The class cards: one page per class (a child), each showing the class beside a live debug view of an instance.
// The cards themselves are ../system-classes.js; this page only lists the ones that have a live page yet.
export default class ClassIndexPage extends Page {
	constructor(...args){
		super({
			title: "Class cards",
			description: "A class, its core API, and a live instance you can watch change.",
			icon: "data_object",
			children: "Session",
		}, ...args);
	}

	content(){ class_cards(["Session", "Prompt"]); }
}
