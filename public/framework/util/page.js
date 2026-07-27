import { Page, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Util",
	description: "Small, dependency-free helpers.",
	content(){
		p("Small helpers used across the framework. The main one is `is` — the type-check utility (`is.fn`, `is.pojo`, `is.arr`, `is.dom`, `is.promise`, …) that drives `View.append`'s dispatch: it's how a factory knows whether an argument is a child view, a capture function, a plain object, an array, or a promise.");
	}
});
