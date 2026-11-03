import { Page } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Audits",
	description: "Read-only audits of how the framework is built. Nothing is merged by an audit.",
	icon: "fact_check",
	children: "paging",
	content(){},
});
