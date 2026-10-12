import { Page } from "/app.js";
import { TemplateDemo } from "./TemplateDemo.js";

export default new Page({
	meta: import.meta,
	title: "Template",
	icon: "dashboard_customize",
	width: "full",
	description: "A page that renders many times. One BigCard, three clones, one live value.",
	content(){ new TemplateDemo().run(); },
});
