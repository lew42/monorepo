import { Page, p, h4 } from "/app.js";

export default class ContentClassBody extends Page {
	content(){ h4("A class-body content()"); p("Defined in the class body, not in a config object."); }
}
