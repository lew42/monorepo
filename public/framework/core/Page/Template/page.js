import { Page, p } from "/app.js";
import { TemplateDemo } from "./TemplateDemo.js";

export default new Page({
	meta: import.meta,
	title: "Template",
	icon: "dashboard_customize",
	width: "full",
	description: "A page that renders many times. One BigCard, three clones, one live value.",
	content(){
		p("See every Template in the [library](/framework/library/?at=templates).");
		p("A Template is a page that is drawn many times, each time from its own data. Below, one BigCard layout is cloned three times; the buttons change a live value and only the text that shows it updates.");
		new TemplateDemo().run(); },
});
